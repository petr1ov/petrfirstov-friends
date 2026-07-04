-- 1. New column
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS published_url TEXT;

-- 2. Extensions for cron + HTTP calls from Postgres
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Hourly job to sync GitHub commits for all projects with a repo
-- Unschedule any previous version with the same name to keep this migration idempotent.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-github-hourly') THEN
    PERFORM cron.unschedule('sync-github-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'sync-github-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hkrujkgxitjvgptjolwe.supabase.co/functions/v1/sync-github',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcnVqa2d4aXRqdmdwdGpvbHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODkwNTgsImV4cCI6MjA4ODI2NTA1OH0.6NgwY1bPCD4HytAnmzTf40QP89cSl2oOWPWou4BJAqo'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);