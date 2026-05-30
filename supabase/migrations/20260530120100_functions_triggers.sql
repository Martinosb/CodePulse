-- ============================================================
-- Helper functions, triggers, and gamification logic
-- ============================================================

-- Returns the caller's group_id without tripping profile RLS recursion.
create or replace function public.auth_group_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select group_id from public.profiles where id = auth.uid();
$$;

-- True when caller is the admin of the given group.
create or replace function public.is_group_admin(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.groups
    where id = target_group and admin_id = auth.uid()
  );
$$;

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- Provision a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, 'coder'), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generate a human-friendly, unique join code like "CP-8K2Q".
create or replace function public.generate_join_code()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no ambiguous chars
  code text;
  i int;
  exists_already boolean;
begin
  loop
    code := 'CP-';
    for i in 1..4 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    select exists(select 1 from public.groups where join_code = code) into exists_already;
    exit when not exists_already;
  end loop;
  return code;
end;
$$;

-- Recompute a user's streak from their daily logs (>= 60s counts as active).
create or replace function public.recompute_streak(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  active_days date[];
  cur date;
  streak int := 0;
  longest int := 0;
  run int := 0;
  prev date;
  d date;
begin
  select array_agg(log_date order by log_date)
    into active_days
  from public.wakatime_logs
  where user_id = target and total_seconds >= 60;

  if active_days is null then
    update public.profiles
      set current_streak = 0, last_active_date = null
      where id = target;
    return;
  end if;

  -- longest run of consecutive days
  prev := null;
  foreach d in array active_days loop
    if prev is not null and d = prev + 1 then
      run := run + 1;
    else
      run := 1;
    end if;
    longest := greatest(longest, run);
    prev := d;
  end loop;

  -- current streak: count back from today/yesterday
  cur := (now() at time zone 'utc')::date;
  if not (cur = any(active_days)) then
    cur := cur - 1; -- allow "yesterday" so today's idle morning doesn't reset it
  end if;
  while cur = any(active_days) loop
    streak := streak + 1;
    cur := cur - 1;
  end loop;

  update public.profiles
    set current_streak = streak,
        longest_streak = greatest(longest_streak, longest, streak),
        last_active_date = active_days[array_length(active_days, 1)]
    where id = target;
end;
$$;
