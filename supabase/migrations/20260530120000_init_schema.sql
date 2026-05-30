-- ============================================================
-- CodePulse — core schema
-- One group per user (v1). Profiles extend auth.users.
-- ============================================================

-- Enums --------------------------------------------------------
create type goal_frequency as enum ('daily', 'weekly');
create type goal_status as enum ('active', 'completed', 'failed', 'archived');
create type interaction_type as enum ('nudge', 'kudo');

-- Groups -------------------------------------------------------
create table public.groups (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null check (char_length(name) between 2 and 60),
  join_code           text not null unique,
  admin_id            uuid not null references auth.users (id) on delete cascade,
  discord_webhook_url text,
  is_arena_public     boolean not null default false,
  created_at          timestamptz not null default now()
);

-- Profiles (1:1 with auth.users) ------------------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text,
  display_name      text not null default 'Coder',
  avatar_url        text,
  timezone          text not null default 'UTC',
  group_id          uuid references public.groups (id) on delete set null,
  wakatime_connected boolean not null default false,
  reminders_enabled boolean not null default true,
  theme             text not null default 'light' check (theme in ('light', 'dark')),
  onboarded         boolean not null default false,
  -- privacy controls
  show_projects     boolean not null default true,
  show_languages    boolean not null default true,
  show_total        boolean not null default true,
  -- gamification
  current_streak    integer not null default 0,
  longest_streak    integer not null default 0,
  last_active_date  date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index profiles_group_id_idx on public.profiles (group_id);

-- Encrypted WakaTime credentials (raw key never exposed to clients)
create table public.wakatime_credentials (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  encrypted_key text not null,
  key_preview   text,            -- last 4 chars for UI confirmation, e.g. "····a1b2"
  connected_at  timestamptz not null default now()
);

-- Daily WakaTime logs -----------------------------------------
create table public.wakatime_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  log_date      date not null,
  total_seconds integer not null default 0,
  top_language  text,
  top_project   text,
  languages     jsonb not null default '[]'::jsonb, -- [{name, total_seconds}]
  projects      jsonb not null default '[]'::jsonb,
  -- 24-slot array of seconds-per-hour for intelligent reminder timing
  hourly        jsonb not null default '[]'::jsonb,
  synced_at     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (user_id, log_date)
);

create index wakatime_logs_user_date_idx on public.wakatime_logs (user_id, log_date desc);
create index wakatime_logs_date_idx on public.wakatime_logs (log_date desc);

-- Goals --------------------------------------------------------
create table public.goals (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users (id) on delete cascade,
  title                   text not null check (char_length(title) between 2 and 100),
  language                text,
  duration_seconds_target integer not null check (duration_seconds_target > 0),
  frequency               goal_frequency not null default 'daily',
  status                  goal_status not null default 'active',
  period_start            date not null default (now() at time zone 'utc')::date,
  progress_seconds        integer not null default 0,
  completed_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index goals_user_idx on public.goals (user_id, status);

-- Nudges & Kudos (realtime) -----------------------------------
create table public.interactions (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  group_id     uuid references public.groups (id) on delete cascade,
  type         interaction_type not null,
  message      text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index interactions_recipient_idx on public.interactions (recipient_id, created_at desc);

-- Badges -------------------------------------------------------
create table public.badges (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null,
  icon        text not null,          -- lucide icon name
  tone        text not null default 'thinking' -- maps to a timeline pastel
);

create table public.user_badges (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users (id) on delete cascade,
  badge_id  uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index user_badges_user_idx on public.user_badges (user_id);

-- Reminder send log (dedupe smart reminders) -------------------
create table public.reminders_sent (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  goal_id    uuid not null references public.goals (id) on delete cascade,
  sent_date  date not null,
  created_at timestamptz not null default now(),
  unique (goal_id, sent_date)
);
