-- The blind double-rating window did not exist in practice.
--
-- Every rating path writes the rater's real rating and then inserts a
-- PLACEHOLDER row for the other party (stars IS NULL) so the "rate them back"
-- prompt has something to attach to. check_mutual_rating fired on that
-- placeholder and asked only "does a rating from NEW.to_id to NEW.from_id with
-- stars exist?" — which is the rating that was just written — and then
-- un-pended it. So the first person to rate had their rating published
-- immediately, before the other side had rated anything.
--
-- Reproduced against this database: A rates B 5 stars, the app inserts B's
-- placeholder, and A's row comes back pending=false — readable by anon through
-- the "read public revealed ratings" policy while B had not rated at all. That
-- is exactly the retaliation window the pending flag exists to close.
--
-- Two changes: a placeholder can never trigger a reveal, and only rows that
-- actually carry stars are revealed. SECURITY DEFINER because the reveal has to
-- touch BOTH rows and RLS ("update own ratings") limits a caller to rows where
-- from_id = auth.uid() — without it the second rater reveals only their own
-- side and the first rating stays hidden forever.

CREATE OR REPLACE FUNCTION public.check_mutual_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- A placeholder (stars IS NULL) means "this person still owes a rating".
  -- It is not a rating and must never reveal anything.
  IF NEW.stars IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM ratings
     WHERE from_id = NEW.to_id AND to_id = NEW.from_id AND stars IS NOT NULL
  ) THEN
    UPDATE ratings SET pending = false
     WHERE stars IS NOT NULL
       AND ((from_id = NEW.from_id AND to_id = NEW.to_id)
         OR (from_id = NEW.to_id AND to_id = NEW.from_id))
       AND pending IS DISTINCT FROM false;
  END IF;

  RETURN NEW;
END $function$;

-- Same guard on the RPC the client calls right after writing a rating: it
-- already required both sides to have stars, but it would also flip the
-- stars-IS-NULL placeholder rows to pending=false. A revealed placeholder is
-- read by three aggregation paths in app.jsx that don't filter NULL stars, and
-- there `sum += null` counts as a zero with count++ — a single one halves the
-- person's public average. Nothing writes such a row today; this keeps it that
-- way at the source as well as in the client.
CREATE OR REPLACE FUNCTION public.reveal_mutual_rating(p_a uuid, p_b uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (SELECT 1 FROM ratings WHERE from_id = p_a AND to_id = p_b AND stars IS NOT NULL)
 AND EXISTS (SELECT 1 FROM ratings WHERE from_id = p_b AND to_id = p_a AND stars IS NOT NULL) THEN
    UPDATE ratings SET pending = false
     WHERE stars IS NOT NULL
       AND ((from_id = p_a AND to_id = p_b) OR (from_id = p_b AND to_id = p_a));
  END IF;
END $function$;

-- rental_ratings was world-readable ("Users can view ratings" USING true), so
-- the blind window could be stepped around entirely by reading that table
-- instead: the rental flow writes the same score there before the counterpart
-- rates. Nothing in the app reads it except the admin panel, so scoping it to
-- the two people in the rental plus admins costs nothing and closes the hole.
DROP POLICY IF EXISTS "Users can view ratings" ON public.rental_ratings;
CREATE POLICY rental_ratings_scoped_read ON public.rental_ratings
  FOR SELECT USING (
    is_admin()
    OR rater_id = auth.uid()
    OR ratee_id = auth.uid()
  );

-- Someone who reports a problem could not read their own report back: the only
-- SELECT policy was admin-only. marketplace.jsx reads resolution_message off
-- this table when a request goes to 'resolved' to show the reporter what the
-- outcome was — that read returned zero rows every time, so reporting a problem
-- was a black hole from the reporter's side. Both parties can now see the
-- report they are involved in; evidence photos and the admin's private note
-- stay out of it only insofar as the client never selects them.
CREATE POLICY dispute_reports_participant_read ON public.dispute_reports
  FOR SELECT USING (
    reporter_id = auth.uid() OR reported_user_id = auth.uid()
  );
