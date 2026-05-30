-- ============================================================
-- Row Level Security — strict, group-scoped
-- ============================================================
alter table public.groups               enable row level security;
alter table public.profiles             enable row level security;
alter table public.wakatime_credentials enable row level security;
alter table public.wakatime_logs        enable row level security;
alter table public.goals                enable row level security;
alter table public.interactions         enable row level security;
alter table public.badges               enable row level security;
alter table public.user_badges          enable row level security;
alter table public.reminders_sent       enable row level security;

-- Drop the leftover demo table from project bootstrap if present.
drop table if exists public.projects cascade;

-- Profiles -----------------------------------------------------
create policy "profiles: read self or groupmates"
  on public.profiles for select
  using (
    id = auth.uid()
    or (group_id is not null and group_id = public.auth_group_id())
  );

create policy "profiles: insert self"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles: update self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Groups -------------------------------------------------------
create policy "groups: read own or arena-public"
  on public.groups for select
  using (
    id = public.auth_group_id()
    or admin_id = auth.uid()
    or is_arena_public = true
  );

create policy "groups: create as admin"
  on public.groups for insert
  with check (admin_id = auth.uid());

create policy "groups: admin updates"
  on public.groups for update
  using (admin_id = auth.uid())
  with check (admin_id = auth.uid());

create policy "groups: admin deletes"
  on public.groups for delete
  using (admin_id = auth.uid());

-- WakaTime credentials: clients have NO access. Service role only.
-- (No policies created => RLS denies all anon/authenticated access.)

-- WakaTime logs ------------------------------------------------
create policy "logs: read self or groupmates"
  on public.wakatime_logs for select
  using (
    user_id = auth.uid()
    or user_id in (
      select id from public.profiles where group_id = public.auth_group_id()
    )
  );
-- writes are service-role only (edge function), no insert/update policy.

-- Goals --------------------------------------------------------
create policy "goals: read self or groupmates"
  on public.goals for select
  using (
    user_id = auth.uid()
    or user_id in (
      select id from public.profiles where group_id = public.auth_group_id()
    )
  );

create policy "goals: insert self"
  on public.goals for insert
  with check (user_id = auth.uid());

create policy "goals: update self"
  on public.goals for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "goals: delete self"
  on public.goals for delete
  using (user_id = auth.uid());

-- Interactions (nudges/kudos) ----------------------------------
create policy "interactions: read mine"
  on public.interactions for select
  using (recipient_id = auth.uid() or sender_id = auth.uid());

create policy "interactions: send to groupmate"
  on public.interactions for insert
  with check (
    sender_id = auth.uid()
    and recipient_id in (
      select id from public.profiles where group_id = public.auth_group_id()
    )
  );

create policy "interactions: mark read"
  on public.interactions for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Badges (catalog is public to authenticated) ------------------
create policy "badges: read all"
  on public.badges for select
  using (true);

create policy "user_badges: read self or groupmates"
  on public.user_badges for select
  using (
    user_id = auth.uid()
    or user_id in (
      select id from public.profiles where group_id = public.auth_group_id()
    )
  );

-- reminders_sent: service role only (no policies).
