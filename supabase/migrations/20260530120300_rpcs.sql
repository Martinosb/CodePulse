-- ============================================================
-- RPCs — group lifecycle, leaderboards, goal progress
-- All SECURITY DEFINER with locked search_path.
-- ============================================================

-- Create a group and make the caller its admin + first member.
create or replace function public.create_group(group_name text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.groups;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.groups (name, join_code, admin_id)
  values (trim(group_name), public.generate_join_code(), auth.uid())
  returning * into g;

  update public.profiles
    set group_id = g.id, onboarded = true
    where id = auth.uid();

  return g;
end;
$$;

-- Join an existing group by code.
create or replace function public.join_group(code text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.groups;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into g from public.groups
  where join_code = upper(trim(code));

  if g.id is null then
    raise exception 'No group found with code %', code using errcode = 'no_data_found';
  end if;

  update public.profiles
    set group_id = g.id, onboarded = true
    where id = auth.uid();

  return g;
end;
$$;

-- Leave the current group. If the admin leaves, hand off or delete.
create or replace function public.leave_group()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  my_group uuid;
  am_admin boolean;
  next_admin uuid;
begin
  select group_id into my_group from public.profiles where id = auth.uid();
  if my_group is null then return; end if;

  select (admin_id = auth.uid()) into am_admin from public.groups where id = my_group;

  update public.profiles set group_id = null where id = auth.uid();

  if am_admin then
    select id into next_admin
    from public.profiles
    where group_id = my_group and id <> auth.uid()
    order by created_at asc
    limit 1;

    if next_admin is null then
      delete from public.groups where id = my_group;
    else
      update public.groups set admin_id = next_admin where id = my_group;
    end if;
  end if;
end;
$$;

-- Admin removes a member from the group.
create or replace function public.remove_member(member uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group uuid;
begin
  select group_id into target_group from public.profiles where id = member;
  if target_group is null then return; end if;

  if not public.is_group_admin(target_group) then
    raise exception 'Only the group admin can remove members';
  end if;
  if member = auth.uid() then
    raise exception 'Admins leave via leave_group()';
  end if;

  update public.profiles set group_id = null where id = member;
end;
$$;

-- ---- Leaderboard --------------------------------------------
create or replace function public._range_start(p_range text)
returns date
language sql
immutable
as $$
  select case p_range
    when 'today' then (now() at time zone 'utc')::date
    when 'week'  then date_trunc('week', now() at time zone 'utc')::date
    when 'month' then date_trunc('month', now() at time zone 'utc')::date
    else (now() at time zone 'utc')::date
  end;
$$;

create or replace function public.get_group_leaderboard(p_range text default 'today')
returns table (
  user_id        uuid,
  display_name   text,
  avatar_url     text,
  current_streak integer,
  total_seconds  integer,
  top_language   text,
  top_project    text,
  is_me          boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  g uuid := public.auth_group_id();
  start_date date := public._range_start(p_range);
begin
  if g is null then return; end if;

  return query
  with members as (
    select p.id, p.display_name, p.avatar_url, p.current_streak,
           p.show_projects, p.show_languages, p.show_total
    from public.profiles p
    where p.group_id = g
  ),
  totals as (
    select l.user_id, sum(l.total_seconds)::int as secs
    from public.wakatime_logs l
    where l.log_date >= start_date and l.user_id in (select id from members)
    group by l.user_id
  ),
  langs as (
    select l.user_id, lower(elem->>'name') as name,
           sum((elem->>'total_seconds')::int) as s
    from public.wakatime_logs l,
         lateral jsonb_array_elements(l.languages) elem
    where l.log_date >= start_date and l.user_id in (select id from members)
    group by l.user_id, lower(elem->>'name')
  ),
  top_lang as (
    select distinct on (user_id) user_id, name from langs order by user_id, s desc
  ),
  projs as (
    select l.user_id, elem->>'name' as name,
           sum((elem->>'total_seconds')::int) as s
    from public.wakatime_logs l,
         lateral jsonb_array_elements(l.projects) elem
    where l.log_date >= start_date and l.user_id in (select id from members)
    group by l.user_id, elem->>'name'
  ),
  top_proj as (
    select distinct on (user_id) user_id, name from projs order by user_id, s desc
  )
  select
    m.id,
    m.display_name,
    m.avatar_url,
    m.current_streak,
    case when m.show_total or m.id = auth.uid() then coalesce(t.secs, 0) else null end,
    case when m.show_languages or m.id = auth.uid() then tl.name else null end,
    case when m.show_projects or m.id = auth.uid() then tp.name else null end,
    (m.id = auth.uid())
  from members m
  left join totals t on t.user_id = m.id
  left join top_lang tl on tl.user_id = m.id
  left join top_proj tp on tp.user_id = m.id
  order by coalesce(t.secs, 0) desc, m.display_name asc;
end;
$$;

-- ---- Arena (global, opt-in groups) --------------------------
create or replace function public.get_arena_leaderboard()
returns table (
  group_id     uuid,
  group_name   text,
  member_count integer,
  total_seconds integer,
  is_my_group  boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  start_date date := date_trunc('week', now() at time zone 'utc')::date;
  mine uuid := public.auth_group_id();
begin
  return query
  with arena as (
    select id, name from public.groups where is_arena_public = true
  ),
  mem as (
    select p.group_id, count(*)::int as cnt
    from public.profiles p
    where p.group_id in (select id from arena)
    group by p.group_id
  ),
  secs as (
    select p.group_id, sum(l.total_seconds)::int as total
    from public.profiles p
    join public.wakatime_logs l on l.user_id = p.id
    where p.group_id in (select id from arena) and l.log_date >= start_date
    group by p.group_id
  )
  select a.id, a.name,
         coalesce(m.cnt, 0),
         coalesce(s.total, 0),
         (a.id = mine)
  from arena a
  left join mem m on m.group_id = a.id
  left join secs s on s.group_id = a.id
  order by coalesce(s.total, 0) desc, a.name asc;
end;
$$;

-- ---- Goals with live progress -------------------------------
create or replace function public.get_my_goals()
returns table (
  id                      uuid,
  title                   text,
  language                text,
  duration_seconds_target integer,
  frequency               goal_frequency,
  status                  goal_status,
  period_start            date,
  computed_seconds        integer,
  created_at              timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    gl.id, gl.title, gl.language, gl.duration_seconds_target,
    gl.frequency, gl.status, gl.period_start,
    public.goal_period_seconds(gl.user_id, gl.language, gl.frequency)::int,
    gl.created_at
  from public.goals gl
  where gl.user_id = auth.uid() and gl.status <> 'archived'
  order by gl.created_at desc;
end;
$$;

-- Seconds coded in the current goal period (respects language filter).
create or replace function public.goal_period_seconds(
  p_user uuid, p_language text, p_freq goal_frequency
)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  start_date date;
  secs integer;
begin
  start_date := case p_freq
    when 'daily' then (now() at time zone 'utc')::date
    when 'weekly' then date_trunc('week', now() at time zone 'utc')::date
  end;

  if p_language is null then
    select coalesce(sum(total_seconds), 0) into secs
    from public.wakatime_logs
    where user_id = p_user and log_date >= start_date;
  else
    select coalesce(sum((elem->>'total_seconds')::int), 0) into secs
    from public.wakatime_logs l,
         lateral jsonb_array_elements(l.languages) elem
    where l.user_id = p_user
      and l.log_date >= start_date
      and lower(elem->>'name') = lower(p_language);
  end if;

  return secs;
end;
$$;
