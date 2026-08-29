-- Lets an admin manually grant PRO/PREMIUM to a user for a fixed number of
-- days (or permanently), from the admin panel — for comps, testing,
-- compensation, etc. Independent of Stripe: a real paying subscriber's
-- tier is never touched by this, and an admin grant never earns anyone a
-- referral commission (no payment happened).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier_expires_at timestamptz;

-- Same protection as tier/referral_code/stripe_customer_id: even if the
-- table-level UPDATE grant were ever restored, a client still can't set
-- this directly — only admin_grant_tier()/confirm_subscription()/
-- cancel_subscription() can, via the app.tier_write flag.
CREATE OR REPLACE FUNCTION public.protect_profile_privilege_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tier_write boolean := COALESCE(current_setting('app.tier_write', true), '') = 'on';
BEGIN
  IF NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role       := 'user';
      NEW.verified   := false;
      NEW.banned     := false;
      NEW.ban_reason := NULL;
      IF NOT v_tier_write THEN
        NEW.tier            := 'free';
        NEW.tier_source     := NULL;
        NEW.tier_updated_at := NULL;
        NEW.tier_expires_at := NULL;
        NEW.stripe_customer_id := NULL;
      END IF;
    ELSE
      NEW.role       := OLD.role;
      NEW.verified   := OLD.verified;
      NEW.banned     := OLD.banned;
      NEW.ban_reason := OLD.ban_reason;
      NEW.referral_code := OLD.referral_code;
      IF NOT v_tier_write THEN
        NEW.tier               := OLD.tier;
        NEW.tier_source        := OLD.tier_source;
        NEW.tier_updated_at    := OLD.tier_updated_at;
        NEW.tier_expires_at    := OLD.tier_expires_at;
        NEW.stripe_customer_id := OLD.stripe_customer_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Real payments never expire on a timer (they end via the cancellation
-- webhook instead) — clear any leftover admin-granted expiry the moment a
-- real subscription takes over.
CREATE OR REPLACE FUNCTION public.confirm_subscription(
  p_user_id     uuid,
  p_plan        text,
  p_billing     text,
  p_source      text DEFAULT 'stripe_webhook',
  p_external_id text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_event_id uuid;
  v_ref      public.referrals%ROWTYPE;
  v_cents    int := 0;
  v_had_ref  boolean;
BEGIN
  IF p_plan    NOT IN ('pro','premium')    THEN RAISE EXCEPTION 'invalid plan: %', p_plan; END IF;
  IF p_billing NOT IN ('monthly','annual') THEN RAISE EXCEPTION 'invalid billing: %', p_billing; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'no such profile: %', p_user_id;
  END IF;

  IF p_external_id IS NOT NULL THEN
    SELECT id INTO v_event_id FROM public.subscription_events WHERE external_id = p_external_id;
    IF v_event_id IS NOT NULL THEN
      RETURN jsonb_build_object('ok', true, 'duplicate', true, 'event_id', v_event_id, 'commission_cents', 0);
    END IF;
  END IF;

  v_had_ref := EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = p_user_id);

  INSERT INTO public.subscription_events (user_id, plan, billing, source, external_id, discount_pct)
  VALUES (p_user_id, p_plan, p_billing, p_source, p_external_id,
          CASE WHEN v_had_ref THEN public.referral_discount_pct(p_billing) ELSE NULL END)
  RETURNING id INTO v_event_id;

  PERFORM set_config('app.tier_write', 'on', true);
  UPDATE public.profiles
     SET tier = p_plan, tier_source = p_source, tier_updated_at = now(), tier_expires_at = NULL
   WHERE id = p_user_id;
  PERFORM set_config('app.tier_write', 'off', true);

  SELECT * INTO v_ref FROM public.referrals
   WHERE referred_id = p_user_id AND status = 'pending' FOR UPDATE;

  IF FOUND THEN
    v_cents := public.referral_commission_cents(p_plan, p_billing);
    IF v_cents > 0 THEN
      INSERT INTO public.wallet_transactions (user_id, amount_cents, kind, description, ref_table, ref_id)
      VALUES (v_ref.referrer_id, v_cents, 'referral_commission',
              'Indicação convertida — ' || p_plan || ' ' || p_billing, 'referrals', v_ref.id);
      UPDATE public.referrals SET status = 'converted', converted_at = now() WHERE id = v_ref.id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'event_id', v_event_id,
    'commission_cents', v_cents,
    'referrer_id', v_ref.referrer_id,
    'discount_pct', CASE WHEN v_had_ref THEN public.referral_discount_pct(p_billing) ELSE 0 END
  );
END $$;

REVOKE ALL ON FUNCTION public.confirm_subscription(uuid,text,text,text,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_subscription(uuid,text,text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.cancel_subscription(
  p_user_id uuid,
  p_source  text DEFAULT 'stripe_webhook'
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_prev text;
BEGIN
  SELECT tier INTO v_prev FROM public.profiles WHERE id = p_user_id;
  IF v_prev IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_such_profile');
  END IF;

  PERFORM set_config('app.tier_write', 'on', true);
  UPDATE public.profiles
     SET tier = 'free', tier_source = p_source, tier_updated_at = now(), tier_expires_at = NULL
   WHERE id = p_user_id;
  PERFORM set_config('app.tier_write', 'off', true);

  RETURN jsonb_build_object('ok', true, 'previous_tier', v_prev);
END $$;

REVOKE ALL ON FUNCTION public.cancel_subscription(uuid,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_subscription(uuid,text) TO service_role;

-- ── admin_grant_tier — the admin panel's button ─────────────────────
-- p_days: NULL = permanent (no expiry). Otherwise the tier reverts to
-- free automatically after that many days (see expire_admin_tiers below).
-- p_tier = 'free' revokes immediately regardless of p_days.
CREATE OR REPLACE FUNCTION public.admin_grant_tier(
  p_user_id uuid,
  p_tier    text,
  p_days    integer DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_expires timestamptz;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_admin');
  END IF;
  IF p_tier NOT IN ('free','pro','premium') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_tier');
  END IF;
  IF p_days IS NOT NULL AND p_days <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_days');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_such_profile');
  END IF;

  v_expires := CASE WHEN p_tier = 'free' OR p_days IS NULL THEN NULL ELSE now() + (p_days || ' days')::interval END;

  PERFORM set_config('app.tier_write', 'on', true);
  UPDATE public.profiles
     SET tier = p_tier,
         tier_source = 'admin_grant',
         tier_updated_at = now(),
         tier_expires_at = v_expires
   WHERE id = p_user_id;
  PERFORM set_config('app.tier_write', 'off', true);

  RETURN jsonb_build_object('ok', true, 'tier', p_tier, 'expires_at', v_expires);
END $$;

-- EXECUTE is open to any authenticated caller — the function itself
-- refuses non-admins (returns {ok:false,error:'not_admin'}), the same
-- pattern already used by resolve_withdrawal. No privilege escalation:
-- the is_admin() check happens inside, server-side, every call.
REVOKE ALL ON FUNCTION public.admin_grant_tier(uuid,text,integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_tier(uuid,text,integer) TO authenticated;

-- ── Auto-expiry ──────────────────────────────────────────────────────
-- Runs as the job owner (postgres), not exposed to any client role.
CREATE OR REPLACE FUNCTION public.expire_admin_tiers()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.tier_write', 'on', true);
  UPDATE public.profiles
     SET tier = 'free', tier_source = 'admin_grant_expired', tier_expires_at = NULL, tier_updated_at = now()
   WHERE tier_expires_at IS NOT NULL AND tier_expires_at < now() AND tier <> 'free';
  PERFORM set_config('app.tier_write', 'off', true);
END $$;

REVOKE ALL ON FUNCTION public.expire_admin_tiers() FROM public, anon, authenticated;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expire-admin-tiers-hourly';
SELECT cron.schedule('expire-admin-tiers-hourly', '5 * * * *', $$SELECT public.expire_admin_tiers();$$);
