-- Defense-in-depth for the referral/wallet columns on profiles.
--
-- The column-level GRANTs added in 20260828_referral_wallet.sql already
-- stop a user from writing `tier` / `referral_code`. This adds a second,
-- independent layer inside the existing trg_protect_profile trigger, so
-- the protection survives someone later re-running a broad
-- `GRANT ALL ON profiles` while fixing something unrelated.

-- ── Referral code is never client-supplied ─────────────────────────
-- Previously it only generated when NULL, which let an INSERT squat a
-- chosen (or someone else's shaped) code. Always mint it server-side.
CREATE OR REPLACE FUNCTION public.profiles_set_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.referral_code := public.generate_referral_code();
  ELSIF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END $$;

-- ── Extend the existing privilege guard to tier + referral_code ────
-- confirm_subscription() is the one legitimate writer of tier, and it
-- runs with no admin identity (a Stripe webhook has no auth.uid()), so
-- it signals intent through a transaction-local flag that only it sets.
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
        NEW.tier         := 'free';
        NEW.tier_source  := NULL;
        NEW.tier_updated_at := NULL;
      END IF;
    ELSE
      NEW.role       := OLD.role;
      NEW.verified   := OLD.verified;
      NEW.banned     := OLD.banned;
      NEW.ban_reason := OLD.ban_reason;
      -- referral_code is immutable once minted: it lives in links
      -- people have already shared.
      NEW.referral_code := OLD.referral_code;
      IF NOT v_tier_write THEN
        NEW.tier            := OLD.tier;
        NEW.tier_source     := OLD.tier_source;
        NEW.tier_updated_at := OLD.tier_updated_at;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ── confirm_subscription now declares its intent to write tier ─────
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

  -- Transaction-local; the guard trigger reverts any tier write made
  -- without it, and it cannot be set from the client.
  PERFORM set_config('app.tier_write', 'on', true);
  UPDATE public.profiles
     SET tier = p_plan, tier_source = p_source, tier_updated_at = now()
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
