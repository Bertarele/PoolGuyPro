-- Ratings anti-fraud hardening (audit 2026-09-20).
--
-- Before this, RLS only checked "from_id = me". Everything else was decided by the
-- browser, so through the REST API anyone could: rate anybody with an invented
-- connection id; read the rating written about them while it was still "blind" and
-- retaliate; edit stars/comment after submitting; set pending/expires_at themselves
-- (reveal early / "decline" by faking an expiry); rate technicians and rentals with
-- no proof of any dealings; and skip phone verification in every flow but one.
--
-- Now enforced in the database (admins and server-side jobs are exempt):
--   * a scored rating needs a REAL shared transaction between the two people
--     (accepted Express Pools job, approved/completed rental, accepted vacation/
--     hiring application, sold listing, or - technician reviews - a two-way chat)
--   * the rater needs a verified phone (only true after a real SMS check), an
--     account older than 24 h, and may give at most 8 ratings per 24 h
--   * a submitted rating is final; identity/link/timing fields cannot be changed
--   * expires_at is always now()+7d, pending can only be flipped by the reveal logic
--   * the person being rated cannot read the rating until it is revealed
--     (my_incoming_ratings() lists "someone rated you" WITHOUT the stars/comment)
-- One rating per pair ever (ratings_pair_unique) and one phone per account
-- (auth.users_phone_key) already exist and stay.

ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS rated_at timestamptz;
UPDATE public.ratings SET rated_at = created_at WHERE stars IS NOT NULL AND rated_at IS NULL;

-- Two people who have actually talked to each other (a message from each side).
CREATE OR REPLACE FUNCTION public.rating_two_way_chat(p_a uuid, p_b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT EXISTS (
    SELECT 1 FROM conversations c
     WHERE ((c.participant_1 = p_a AND c.participant_2 = p_b) OR (c.participant_1 = p_b AND c.participant_2 = p_a))
       AND EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.sender_id = p_a)
       AND EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.sender_id = p_b)
  );
$function$;

-- Did these two people really deal with each other on the thing being rated?
CREATE OR REPLACE FUNCTION public.rating_relationship_ok(
  p_from uuid, p_to uuid, p_ctype text, p_cid text, p_listing uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF p_from IS NULL OR p_to IS NULL OR p_from = p_to THEN RETURN false; END IF;

  IF p_ctype = 'quickpool' THEN
    IF COALESCE(p_cid, '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN RETURN false; END IF;
    RETURN EXISTS (
      SELECT 1 FROM quick_pool_jobs j JOIN quick_pool_applications a ON a.job_id = j.id
       WHERE j.id = p_cid::uuid
         AND a.status IN ('accepted', 'completed', 'done')
         AND a.created_at < now() - interval '15 minutes'
         AND ((j.poster_id = p_from::text AND a.applicant_id = p_to::text)
           OR (j.poster_id = p_to::text   AND a.applicant_id = p_from::text)));

  ELSIF p_ctype = 'rental' THEN
    IF COALESCE(p_cid, '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN RETURN false; END IF;
    RETURN EXISTS (
      SELECT 1 FROM rental_requests r
       WHERE r.id = p_cid::uuid AND r.status IN ('approved', 'completed')
         AND ((r.owner_id = p_from AND r.requester_id = p_to) OR (r.owner_id = p_to AND r.requester_id = p_from)));

  ELSIF p_ctype IN ('vacation', 'hiring') THEN
    RETURN EXISTS (
      SELECT 1 FROM job_applications ja
       WHERE ja.status IN ('accepted', 'completed')
         AND (ja.job_id = p_cid OR ja.id::text = p_cid)
         AND (
           (ja.applicant_id = p_from AND COALESCE(
               (SELECT v.author_id FROM vacations v WHERE v.id::text = ja.job_id),
               (SELECT jb.author_id FROM jobs jb WHERE jb.id::text = ja.job_id)) = p_to)
           OR
           (ja.applicant_id = p_to AND COALESCE(
               (SELECT v.author_id FROM vacations v WHERE v.id::text = ja.job_id),
               (SELECT jb.author_id FROM jobs jb WHERE jb.id::text = ja.job_id)) = p_from)));

  ELSIF p_ctype IS NULL AND p_listing IS NOT NULL THEN          -- marketplace sale
    RETURN EXISTS (
      SELECT 1 FROM marketplace m
       WHERE m.id = p_listing AND m.status = 'sold' AND m.buyer_id IS NOT NULL
         AND ((m.author_id = p_from AND m.buyer_id = p_to) OR (m.author_id = p_to AND m.buyer_id = p_from)))
      AND rating_two_way_chat(p_from, p_to);

  ELSIF p_ctype IS NULL THEN                                     -- technician review
    RETURN rating_two_way_chat(p_from, p_to);
  END IF;

  RETURN false;
END $function$;

-- Who may write a scored rating (shared by ratings and rental_ratings).
CREATE OR REPLACE FUNCTION public.rating_check_rater(p_from uuid, p_comment text, p_exclude uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  v_phone_ok boolean;
  v_created  timestamptz;
  v_recent   int;
BEGIN
  SELECT COALESCE(phone_verified, false) INTO v_phone_ok FROM profiles WHERE id = p_from;
  IF NOT COALESCE(v_phone_ok, false) THEN
    RAISE EXCEPTION 'Verify your phone number to rate (Profile) · Verifique seu telefone para avaliar (Perfil) · Verifica tu teléfono para calificar (Perfil)';
  END IF;
  SELECT created_at INTO v_created FROM auth.users WHERE id = p_from;
  IF v_created IS NULL OR v_created > now() - interval '24 hours' THEN
    RAISE EXCEPTION 'New accounts can rate after 24 hours · Contas novas podem avaliar após 24 horas · Las cuentas nuevas pueden calificar después de 24 horas';
  END IF;
  SELECT count(*) INTO v_recent FROM ratings
   WHERE from_id = p_from AND stars IS NOT NULL AND rated_at > now() - interval '24 hours'
     AND id IS DISTINCT FROM p_exclude;
  IF v_recent >= 8 THEN
    RAISE EXCEPTION 'Rating limit reached for today · Limite de avaliações de hoje atingido · Límite de calificaciones de hoy alcanzado';
  END IF;
  IF length(COALESCE(p_comment, '')) > 600 THEN
    RAISE EXCEPTION 'Comment is too long (max 600 characters) · Comentário muito longo (máx. 600) · Comentario muy largo (máx. 600)';
  END IF;
END $function$;

CREATE OR REPLACE FUNCTION public.ratings_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  me         uuid := auth.uid();
  v_internal boolean := COALESCE(current_setting('app.rating_write', true), '') = 'on';
BEGIN
  -- server-side jobs (cron/edge functions), the reveal logic and admins are trusted
  IF me IS NULL OR v_internal OR is_admin() THEN RETURN NEW; END IF;

  IF TG_OP = 'UPDATE' THEN
    IF me IS DISTINCT FROM OLD.from_id THEN RAISE EXCEPTION 'not allowed'; END IF;
    -- identity, link and timing are fixed once the row exists
    NEW.from_id := OLD.from_id;   NEW.to_id := OLD.to_id;   NEW.listing_id := OLD.listing_id;
    NEW.connection_type := OLD.connection_type;   NEW.connection_id := OLD.connection_id;
    NEW.created_at := OLD.created_at;   NEW.pending := OLD.pending;   NEW.expires_at := OLD.expires_at;
    IF OLD.stars IS NOT NULL THEN                    -- a submitted rating is final
      NEW.stars := OLD.stars;   NEW.comment := OLD.comment;   NEW.tags := OLD.tags;
      NEW.from_name := OLD.from_name;   NEW.listing_name := OLD.listing_name;
      NEW.rated_at := OLD.rated_at;   NEW.skipped_at := OLD.skipped_at;
      RETURN NEW;
    END IF;
    IF NEW.stars IS NULL THEN RETURN NEW; END IF;    -- still just a placeholder (may be skipped)
    IF NOT rating_relationship_ok(NEW.from_id, NEW.to_id, NEW.connection_type, NEW.connection_id, NEW.listing_id) THEN
      RAISE EXCEPTION 'You can only rate people you actually worked with · Você só pode avaliar quem realmente trabalhou com você · Solo puedes calificar a quien realmente trabajó contigo';
    END IF;
    NEW.rated_at := now();
    PERFORM rating_check_rater(NEW.from_id, NEW.comment, NEW.id);
  ELSE
    IF NEW.from_id IS NOT DISTINCT FROM NEW.to_id THEN RAISE EXCEPTION 'You cannot rate yourself · Você não pode avaliar a si mesmo'; END IF;
    IF NOT (me = NEW.from_id OR (me = NEW.to_id AND NEW.stars IS NULL)) THEN RAISE EXCEPTION 'not allowed'; END IF;
    IF NOT rating_relationship_ok(NEW.from_id, NEW.to_id, NEW.connection_type, NEW.connection_id, NEW.listing_id) THEN
      RAISE EXCEPTION 'You can only rate people you actually worked with · Você só pode avaliar quem realmente trabalhou com você · Solo puedes calificar a quien realmente trabajó contigo';
    END IF;
    NEW.created_at := now();
    NEW.expires_at := now() + interval '7 days';
    NEW.skipped_at := NULL;
    -- only one-sided technician reviews (no deal to blind) are public at once
    IF NOT (NEW.connection_type IS NULL AND NEW.listing_id IS NULL) THEN NEW.pending := true; END IF;
    IF NEW.stars IS NULL THEN NEW.rated_at := NULL; RETURN NEW; END IF;
    NEW.rated_at := now();
    PERFORM rating_check_rater(NEW.from_id, NEW.comment, NEW.id);
  END IF;

  IF NEW.tags IS NOT NULL AND cardinality(NEW.tags) > 6 THEN NEW.tags := NEW.tags[1:6]; END IF;
  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS ratings_guard_trg ON public.ratings;
CREATE TRIGGER ratings_guard_trg BEFORE INSERT OR UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.ratings_guard();

-- The reveal logic legitimately flips `pending`; tell the guard it is internal, and
-- switch the flag off again right after so nothing else in the request inherits it.
CREATE OR REPLACE FUNCTION public.check_mutual_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NEW.stars IS NULL THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM ratings WHERE from_id = NEW.to_id AND to_id = NEW.from_id AND stars IS NOT NULL) THEN
    PERFORM set_config('app.rating_write', 'on', true);
    UPDATE ratings SET pending = false
     WHERE stars IS NOT NULL
       AND ((from_id = NEW.from_id AND to_id = NEW.to_id) OR (from_id = NEW.to_id AND to_id = NEW.from_id))
       AND pending IS DISTINCT FROM false;
    PERFORM set_config('app.rating_write', '', true);
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.reveal_mutual_rating(p_a uuid, p_b uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() NOT IN (p_a, p_b) THEN RETURN; END IF;   -- only the two people involved
  IF EXISTS (SELECT 1 FROM ratings WHERE from_id = p_a AND to_id = p_b AND stars IS NOT NULL)
 AND EXISTS (SELECT 1 FROM ratings WHERE from_id = p_b AND to_id = p_a AND stars IS NOT NULL) THEN
    PERFORM set_config('app.rating_write', 'on', true);
    UPDATE ratings SET pending = false
     WHERE stars IS NOT NULL
       AND ((from_id = p_a AND to_id = p_b) OR (from_id = p_b AND to_id = p_a));
    PERFORM set_config('app.rating_write', '', true);
  END IF;
END $function$;

-- Blind window: the person being rated sees only REVEALED ratings. The rating
-- itself (stars/comment) stays hidden until both sides rated or 7 days passed.
DROP POLICY IF EXISTS "read own ratings" ON public.ratings;
CREATE POLICY ratings_read_given ON public.ratings FOR SELECT TO authenticated USING (from_id = auth.uid());
CREATE POLICY ratings_read_received_revealed ON public.ratings FOR SELECT TO authenticated
  USING (to_id = auth.uid() AND pending = false);

-- "Someone rated you - rate them back", with NO score or comment in the result.
CREATE OR REPLACE FUNCTION public.my_incoming_ratings()
RETURNS TABLE (id uuid, listing_id uuid, listing_name text, from_id uuid, from_name text, to_id uuid,
               connection_type text, connection_id text, created_at timestamptz, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT r.id, r.listing_id, r.listing_name, r.from_id, r.from_name, r.to_id,
         r.connection_type, r.connection_id, r.created_at, r.expires_at
    FROM ratings r
   WHERE r.to_id = auth.uid() AND r.stars IS NOT NULL
   ORDER BY r.created_at;
$function$;
REVOKE EXECUTE ON FUNCTION public.my_incoming_ratings() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.my_incoming_ratings() TO authenticated;

-- Rental ratings had only "rater = me": any existing request id would do.
CREATE OR REPLACE FUNCTION public.rental_ratings_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF auth.uid() IS NULL OR is_admin() THEN RETURN NEW; END IF;
  IF NEW.rater_id IS NOT DISTINCT FROM NEW.ratee_id THEN RAISE EXCEPTION 'You cannot rate yourself · Você não pode avaliar a si mesmo'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM rental_requests r
     WHERE r.id = NEW.request_id AND r.status IN ('approved', 'completed')
       AND ((r.owner_id = NEW.rater_id AND r.requester_id = NEW.ratee_id)
         OR (r.owner_id = NEW.ratee_id AND r.requester_id = NEW.rater_id))
  ) THEN
    RAISE EXCEPTION 'You can only rate people you actually worked with · Você só pode avaliar quem realmente trabalhou com você · Solo puedes calificar a quien realmente trabajó contigo';
  END IF;
  PERFORM rating_check_rater(NEW.rater_id, NEW.comment, NULL);
  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS rental_ratings_guard_trg ON public.rental_ratings;
CREATE TRIGGER rental_ratings_guard_trg BEFORE INSERT ON public.rental_ratings
  FOR EACH ROW EXECUTE FUNCTION public.rental_ratings_guard();

-- These helpers are internal.
REVOKE EXECUTE ON FUNCTION public.rating_two_way_chat(uuid, uuid)                      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rating_relationship_ok(uuid, uuid, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rating_check_rater(uuid, text, uuid)                 FROM PUBLIC, anon, authenticated;
