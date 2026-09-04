-- Throttle column for the rental overdue chaser, plus its schedule.
-- Nothing reacted when a rental's end_date passed: no state change, no
-- reminder, no edge function (there were reminders for listings-sold and
-- vacation-days, but rentals had none), so an unreturned item was only ever
-- caught if the owner happened to reopen the listing and notice.
ALTER TABLE public.rental_requests
  ADD COLUMN IF NOT EXISTS overdue_reminder_at timestamptz;

SELECT cron.schedule(
  'rental-overdue-reminder-daily',
  '0 14 * * *',
  $$ select net.http_post(
       url:='https://xiszfqghizqzlwyrfjol.supabase.co/functions/v1/rental-overdue-reminder',
       headers:=jsonb_build_object('Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='sb_service_role_key'),'Content-Type','application/json'),
       body:='{}'::jsonb) as request_id; $$
);
