-- ============================================================
-- Badge catalog, RPC grants, realtime publication
-- ============================================================

insert into public.badges (slug, name, description, icon, tone) values
  ('first_commit', 'First Pulse',   'Logged your first coding session.',          'Zap',       'thinking'),
  ('night_owl',    'Night Owl',     'Coded heavily between midnight and 4am.',     'Moon',      'edit'),
  ('early_bird',   'Early Bird',    'Coded before 7am on three days.',             'Sunrise',   'done'),
  ('polyglot',     'Polyglot',      'Used 5+ programming languages in a week.',    'Languages', 'read'),
  ('streak_7',     'On Fire',       'Maintained a 7-day coding streak.',           'Flame',     'thinking'),
  ('streak_30',    'Unstoppable',   'Maintained a 30-day coding streak.',          'Rocket',    'done'),
  ('centurion',    'Centurion',     'Coded 100+ hours total.',                     'Trophy',    'done'),
  ('goal_crusher', 'Goal Crusher',  'Completed 10 goals.',                         'Target',    'grep'),
  ('deep_work',    'Deep Work',     'A single 4-hour+ coding session.',            'Brain',     'edit')
on conflict (slug) do nothing;

-- Make sure authenticated users can call our RPCs.
grant execute on function
  public.create_group(text),
  public.join_group(text),
  public.leave_group(),
  public.remove_member(uuid),
  public.get_group_leaderboard(text),
  public.get_arena_leaderboard(),
  public.get_my_goals(),
  public.auth_group_id(),
  public.is_group_admin(uuid)
to authenticated;

-- Realtime: stream interactions (nudges/kudos) and log/profile changes
-- so the leaderboard can re-rank live.
alter publication supabase_realtime add table public.interactions;
alter publication supabase_realtime add table public.wakatime_logs;
alter publication supabase_realtime add table public.profiles;
