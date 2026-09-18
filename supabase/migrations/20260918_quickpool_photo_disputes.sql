-- Express Pools had no way to report a problem with the photos a pool guy
-- submitted — the owner's only choice on finishing a job was to finalize,
-- accepting whatever was sent. dispute_reports already anticipated this
-- (source_type's CHECK constraint has allowed 'quickpool' since
-- 20260904_disputes_any_source.sql) but the INSERT policy was never given a
-- branch for it, so any attempt would have been silently rejected by RLS.
--
-- Reporting a problem does NOT block finishing the job — the owner still
-- finalizes normally right after (or the report flow does it for them, see
-- the app side). This only gets the report itself into the existing admin
-- moderation queue, alongside rental/vacation reports; no automatic
-- consequence for the pool guy (no auto-block, no rating effect) — that is
-- a deliberate choice, not an oversight, so an admin always reviews before
-- anything happens.
--
-- quick_pool_applications has no job_author_id of its own (unlike
-- job_applications, which vacation reports already use) — the poster lives
-- on the parent quick_pool_jobs row, so this branch needs the join the
-- other two don't.
DROP POLICY IF EXISTS dispute_reports_participant_insert ON public.dispute_reports;
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
      -- Express Pools: the poster and the accepted applicant
      OR (source_type = 'quickpool' AND EXISTS (
        SELECT 1 FROM public.quick_pool_applications a
        JOIN public.quick_pool_jobs j ON j.id = a.job_id
         WHERE a.id::text = source_id
           AND (j.poster_id = auth.uid()::text OR a.applicant_id = auth.uid()::text)
           AND (j.poster_id = reported_user_id::text OR a.applicant_id = reported_user_id::text)))
      -- legacy rows written before source_type existed keep the old rule
      OR source_type IS NULL
    )
  );
