-- 1. notifications: INSERT was open to any signed-in user for ANY recipient with
--    arbitrary text, so a user could forge "you got paid" / "admin says..."
--    notifications to someone else. The app legitimately notifies other users
--    (applicant accepted, new message...), so recipients stay open, but now:
--      * every client-created row records who created it (sender_id, forced to
--        the caller — cannot be spoofed or nulled),
--      * a trigger caps how many a single account can create per hour and how
--        long title/body may be, so it cannot be used to spam.
--    Server-side inserts (edge functions / SECURITY DEFINER) bypass RLS and
--    leave sender_id NULL, so they are unaffected.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS sender_id uuid DEFAULT auth.uid();
CREATE INDEX IF NOT EXISTS notifications_sender_created_idx ON public.notifications (sender_id, created_at);

DROP POLICY IF EXISTS "Auth insert" ON public.notifications;
CREATE POLICY notifications_insert_as_self ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notifications_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;  -- server-side insert
  IF length(coalesce(NEW.title, '')) > 200 OR length(coalesce(NEW.body, '')) > 1000 THEN
    RAISE EXCEPTION 'notification too long';
  END IF;
  IF (SELECT count(*) FROM public.notifications
       WHERE sender_id = auth.uid() AND created_at > now() - interval '1 hour') >= 200 THEN
    RAISE EXCEPTION 'notification rate limit';
  END IF;
  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS notifications_guard_trg ON public.notifications;
CREATE TRIGGER notifications_guard_trg BEFORE INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.notifications_guard();

-- 2. In-app account deletion (App Store guideline 5.1.1(v) + privacy laws).
--    Refuses while money is still in play (active paid tier, wallet balance or
--    an unpaid withdrawal) — deleting the profile cascades wallet/subscription
--    rows, so it must never silently eat someone's balance or leave Stripe
--    billing them. Otherwise removes the user's content and their auth row
--    (which cascades profile, sessions, chats, ratings, referrals, warnings).
--    Dispute reports and rental records are kept on purpose: they involve
--    another person and are the admin's audit trail.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  me   uuid := auth.uid();
  prof public.profiles%ROWTYPE;
BEGIN
  IF me IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  SELECT * INTO prof FROM public.profiles WHERE id = me;
  IF prof.role = 'admin' THEN RETURN jsonb_build_object('ok', false, 'error', 'admin_account'); END IF;
  IF coalesce(prof.tier, 'free') <> 'free' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'active_subscription');
  END IF;
  IF coalesce((SELECT sum(amount_cents) FROM public.wallet_transactions WHERE user_id = me), 0) > 0
     OR EXISTS (SELECT 1 FROM public.withdrawal_requests WHERE user_id = me AND status IN ('pending','approved')) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wallet_pending');
  END IF;

  -- Vacations / jobs I posted (+ the applications to them, which point at them by text id)
  DELETE FROM public.job_applications
   WHERE job_id IN (SELECT id::text FROM public.vacations WHERE author_id = me
                    UNION SELECT id::text FROM public.jobs WHERE author_id = me);
  DELETE FROM public.job_applications WHERE applicant_id = me;
  DELETE FROM public.vacations WHERE author_id = me;
  DELETE FROM public.jobs      WHERE author_id = me;
  DELETE FROM public.techs     WHERE author_id = me;

  -- Express Pools (ids are text here). Jobs first: they reference the route.
  DELETE FROM public.quick_pool_applications WHERE applicant_id = me::text;
  DELETE FROM public.quick_pool_jobs   WHERE poster_id = me::text;
  DELETE FROM public.quick_routes      WHERE owner_id  = me::text;
  DELETE FROM public.pool_handoffs     WHERE poster_id = me::text;

  -- Marketplace
  UPDATE public.marketplace SET buyer_id = NULL WHERE buyer_id = me;
  DELETE FROM public.marketplace WHERE author_id = me;
  DELETE FROM public.marketplace_history WHERE author_id = me;

  DELETE FROM public.push_subscriptions WHERE user_id = me::text;
  DELETE FROM public.notifications WHERE user_id = me;

  -- Cascades: profiles, sessions, identities, conversations/messages, ratings,
  -- saved_listings, referrals, warnings, wallet/subscription rows.
  DELETE FROM auth.users WHERE id = me;

  RETURN jsonb_build_object('ok', true);
END $function$;

REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
