-- Disputes could only ever be about a rental, and only the equipment owner
-- could file one.
--
-- dispute_reports links to a transaction through rental_request_id and nothing
-- else, so vacation coverage — where the money and the trust are at least as
-- exposed — had no way to report anything at all. On the owner's side the only
-- action offered when a pool guy submits completion photos is the green
-- "Finalizar e avaliar"; if the pools were left dirty or the photos are of
-- someone else's pool, the choices were to finalize anyway or leave it stuck at
-- "Aguardando confirmação" forever, which also blocks BOTH ratings since
-- finalizing is what opens them.
--
-- A generic (source_type, source_id) pair carries any kind of transaction.
-- rental_request_id stays exactly as it is: the admin panel and the renter's
-- resolution lookup both read it, and existing rows keep working untouched.

ALTER TABLE public.dispute_reports
  ADD COLUMN IF NOT EXISTS source_type text
    CHECK (source_type IS NULL OR source_type IN ('rental','vacation','quickpool','hiring')),
  ADD COLUMN IF NOT EXISTS source_id text;

-- Backfill the rows already there so every dispute reads the same way.
UPDATE public.dispute_reports
   SET source_type = 'rental', source_id = rental_request_id::text
 WHERE source_type IS NULL AND rental_request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS dispute_reports_source_idx
  ON public.dispute_reports (source_type, source_id);

-- One open report per person per transaction. Without this, tapping the report
-- button twice — or a double submit on a slow connection — files duplicates
-- that land in the admin queue as separate cases about the same incident.
CREATE UNIQUE INDEX IF NOT EXISTS dispute_reports_one_open_per_reporter
  ON public.dispute_reports (source_type, source_id, reporter_id)
  WHERE status = 'pending' AND source_type IS NOT NULL;

-- The INSERT policy only checked that you are who you say you are, so anyone
-- could file a report naming any two people. Now the reporter has to actually
-- be in the transaction they are reporting, and cannot report themselves.
DROP POLICY IF EXISTS "Users can report disputes" ON public.dispute_reports;
CREATE POLICY dispute_reports_participant_insert ON public.dispute_reports
  FOR INSERT WITH CHECK (
    auth.uid() = reporter_id
    AND reported_user_id IS DISTINCT FROM reporter_id
    AND (
      -- rentals: either side of the request may report the other
      (source_type = 'rental' AND EXISTS (
        SELECT 1 FROM rental_requests r
         WHERE r.id::text = source_id
           AND (r.owner_id = auth.uid() OR r.requester_id = auth.uid())
           AND (r.owner_id = reported_user_id OR r.requester_id = reported_user_id)))
      -- vacation coverage: the person who posted it and the accepted pool guy
      OR (source_type = 'vacation' AND EXISTS (
        SELECT 1 FROM job_applications a
         WHERE a.id::text = source_id
           AND (a.job_author_id = auth.uid() OR a.applicant_id = auth.uid())
           AND (a.job_author_id = reported_user_id OR a.applicant_id = reported_user_id)))
      -- legacy rows written before source_type existed keep the old rule
      OR source_type IS NULL
    )
  );
