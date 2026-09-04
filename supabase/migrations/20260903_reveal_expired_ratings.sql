-- A rating whose counterpart never rates back was invisible to the public
-- forever.
--
-- Every rating is written with expires_at = now() + 7 days, the end of the
-- blind window. app.jsx reads its own ratings with
-- `.or('pending.eq.false,expires_at.lt.<now>')`, so the author of a rating sees
-- it come out of the window on time — but that is the ONLY place the deadline
-- is honoured. Everyone else reads through the "read public revealed ratings"
-- policy, which requires pending = false, and nothing server-side ever flipped
-- that flag on expiry: no cron job, no function touching expires_at.
--
-- So the deadline existed in the column and in one client query, and nowhere
-- else. One-sided ratings — the common case, since people forget to rate back —
-- silently never counted toward anyone's public average.

CREATE OR REPLACE FUNCTION public.reveal_expired_ratings()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  -- Placeholders (stars IS NULL) are deliberately left alone: they mean "this
  -- person never rated", carry no score, and three aggregation paths in
  -- app.jsx count a revealed row without checking for a NULL score.
  UPDATE public.ratings
     SET pending = false
   WHERE pending
     AND stars IS NOT NULL
     AND expires_at IS NOT NULL
     AND expires_at < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $function$;

REVOKE ALL ON FUNCTION public.reveal_expired_ratings() FROM public, anon, authenticated;

SELECT cron.schedule(
  'reveal-expired-ratings-hourly',
  '20 * * * *',
  $$SELECT public.reveal_expired_ratings();$$
);
