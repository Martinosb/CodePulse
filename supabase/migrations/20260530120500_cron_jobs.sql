-- ============================================================
-- CodePulse — pg_cron and pg_net automation scheduling
-- ============================================================

-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule the WakaTime stats synchronization every 30 minutes
select cron.schedule('codepulse-sync', '*/30 * * * *', $$
  select net.http_post(
    url := 'https://gtbmqetpqjjqfcwfwvie.supabase.co/functions/v1/sync-wakatime',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','pulse_cron_secret_2026_x92y')
  );
$$);

-- Schedule the smart reminders checks every 30 minutes
select cron.schedule('codepulse-reminders', '*/30 * * * *', $$
  select net.http_post(
    url := 'https://gtbmqetpqjjqfcwfwvie.supabase.co/functions/v1/smart-reminders',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','pulse_cron_secret_2026_x92y')
  );
$$);
