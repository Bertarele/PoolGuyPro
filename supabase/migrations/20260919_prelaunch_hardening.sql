-- Pre-beta hardening (audit 2026-09-18).
--
-- 1. send_chat_message was SECURITY DEFINER with no caller checks: any
--    signed-in user could write a message into ANY conversation whose id they
--    knew (ids are built from the two user ids, which profiles_public exposes),
--    and ON CONFLICT would overwrite that conversation's last_message/unread
--    counters. Now the caller must be signed in, must not message themselves,
--    the convo id must be the canonical <lowUid>_<highUid>[...] for THIS caller
--    + recipient, and an existing row is only touched if the caller is in it.
-- 2. Several SECURITY DEFINER helpers were executable by anon (Postgres grants
--    EXECUTE to PUBLIC by default). Lock down the ones that are cron/internal
--    only, and the wallet balance reader that leaked anyone's balance.
-- 3. handle_new_user now also reads `region` from signup metadata, so name +
--    region survive email-confirmation signups (the client-side profile insert
--    runs with no session at that point and silently failed under RLS).

CREATE OR REPLACE FUNCTION public.send_chat_message(
  p_convo_id text, p_body text, p_other_id uuid,
  p_my_name text DEFAULT ''::text, p_other_name text DEFAULT ''::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  me      uuid := auth.uid();
  msg_id  uuid;
  p1      uuid;
  p2      uuid;
  am_p1   boolean;
  n1      text;
  n2      text;
  touched int;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF p_other_id IS NULL OR p_other_id = me THEN RAISE EXCEPTION 'invalid recipient'; END IF;
  IF p_body IS NULL OR btrim(p_body) = '' OR length(p_body) > 4000 THEN
    RAISE EXCEPTION 'invalid message body';
  END IF;

  p1 := LEAST(me, p_other_id);
  p2 := GREATEST(me, p_other_id);
  IF p_convo_id IS NULL OR left(p_convo_id, 73) <> p1::text || '_' || p2::text THEN
    RAISE EXCEPTION 'invalid conversation id';
  END IF;

  am_p1 := (me = p1);
  n1 := CASE WHEN am_p1 THEN p_my_name ELSE p_other_name END;
  n2 := CASE WHEN am_p1 THEN p_other_name ELSE p_my_name END;

  INSERT INTO conversations (id, participant_1, participant_2, name_1, name_2,
                             last_message, last_message_at, unread_1, unread_2)
  VALUES (p_convo_id, p1, p2, n1, n2, p_body, now(),
          CASE WHEN am_p1 THEN 0 ELSE 1 END,
          CASE WHEN am_p1 THEN 1 ELSE 0 END)
  ON CONFLICT (id) DO UPDATE SET
    last_message    = p_body,
    last_message_at = now(),
    unread_1 = CASE WHEN am_p1 THEN conversations.unread_1     ELSE conversations.unread_1 + 1 END,
    unread_2 = CASE WHEN am_p1 THEN conversations.unread_2 + 1 ELSE conversations.unread_2     END,
    name_1   = CASE WHEN conversations.name_1 = '' THEN n1 ELSE conversations.name_1 END,
    name_2   = CASE WHEN conversations.name_2 = '' THEN n2 ELSE conversations.name_2 END
  WHERE conversations.participant_1 = me OR conversations.participant_2 = me;

  GET DIAGNOSTICS touched = ROW_COUNT;
  IF touched = 0 THEN RAISE EXCEPTION 'not a participant of this conversation'; END IF;

  INSERT INTO messages (conversation_id, sender_id, body)
  VALUES (p_convo_id, me, p_body)
  RETURNING id INTO msg_id;

  RETURN msg_id;
END;
$function$;

-- Internal / cron-only: nobody but service_role (edge functions) and the owner.
REVOKE EXECUTE ON FUNCTION public.get_due_vacation_completions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.wallet_balance_cents(uuid)     FROM PUBLIC, anon, authenticated;

-- Signed-in only (never anonymous).
REVOKE EXECUTE ON FUNCTION public.send_chat_message(text,text,uuid,text,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_chat_read(text)                       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_unread_count()                      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_referral(text)                       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reveal_mutual_rating(uuid,uuid)            FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid)                    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_marketplace()              FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_sold_listings()                FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_quick_pool_jobs()                  FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.send_chat_message(text,text,uuid,text,text) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_chat_read(text)                       TO authenticated;
GRANT  EXECUTE ON FUNCTION public.get_my_unread_count()                      TO authenticated;
GRANT  EXECUTE ON FUNCTION public.claim_referral(text)                       TO authenticated;
GRANT  EXECUTE ON FUNCTION public.reveal_mutual_rating(uuid,uuid)            TO authenticated;
GRANT  EXECUTE ON FUNCTION public.admin_delete_user(uuid)                    TO authenticated;
GRANT  EXECUTE ON FUNCTION public.cleanup_expired_marketplace()              TO authenticated;
GRANT  EXECUTE ON FUNCTION public.cleanup_old_sold_listings()                TO authenticated;
GRANT  EXECUTE ON FUNCTION public.cleanup_quick_pool_jobs()                  TO authenticated;

-- Signup metadata: keep the region the user picked.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, role, phone, region, photo_url, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
             NULLIF(NEW.raw_user_meta_data->>'name', ''),
             split_part(NEW.email, '@', 1)),
    'user', '',
    COALESCE(NULLIF(left(NEW.raw_user_meta_data->>'region', 80), ''), ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = CASE WHEN profiles.name = '' OR profiles.name IS NULL OR profiles.name = split_part(profiles.email, '@', 1)
                THEN EXCLUDED.name ELSE profiles.name END,
    region = CASE WHEN profiles.region = '' OR profiles.region IS NULL THEN EXCLUDED.region ELSE profiles.region END,
    photo_url = CASE WHEN profiles.photo_url = '' OR profiles.photo_url IS NULL THEN EXCLUDED.photo_url ELSE profiles.photo_url END;
  RETURN NEW;
END;
$function$;

-- post-images had no size / type limit: any free account could fill the 1 GB
-- storage quota (or host non-image files) through the public bucket.
UPDATE storage.buckets
   SET file_size_limit = 10485760,
       allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/heic','image/heif','image/gif']
 WHERE id = 'post-images';
