-- The referral discount used to be percent-based (10% monthly / 5% annual)
-- while the referrer's commission was already a flat dollar amount. That
-- mismatch made the two sides impossible to compare at a glance (PRO
-- monthly: referrer got $5, referred person only saved $1.50) and gave no
-- clean way to describe the program in one sentence.
--
-- This makes both sides the same flat dollar amount per plan/billing pair
-- ("indique um amigo, vocês dois ganham $X"), matching the commission table
-- exactly:
--   PRO monthly $5/$5, PRO annual $7/$7, Premium monthly $7/$7, Premium annual $10/$10.
-- referral_discount_cents is intentionally its own function (not just a
-- reuse of referral_commission_cents) so the two can diverge again later
-- without touching the commission side.
CREATE OR REPLACE FUNCTION public.referral_discount_cents(p_plan text, p_billing text)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_plan = 'pro'     AND p_billing = 'monthly' THEN 500   -- $5
    WHEN p_plan = 'pro'     AND p_billing = 'annual'  THEN 700   -- $7
    WHEN p_plan = 'premium' AND p_billing = 'monthly' THEN 700   -- $7
    WHEN p_plan = 'premium' AND p_billing = 'annual'  THEN 1000  -- $10
    ELSE 0
  END;
$$;

-- subscription_events.discount_pct is kept (old rows still read fine) but
-- nothing writes to it anymore; discount_cents is the new record of what
-- was actually deducted, in the same unit as everything else in the wallet
-- system.
ALTER TABLE public.subscription_events ADD COLUMN IF NOT EXISTS discount_cents integer;

-- claim_referral no longer returns specific numbers: at claim time the
-- person hasn't picked a plan yet, and the discount now varies by both
-- plan AND billing (four different amounts) instead of just billing (two
-- percentages), so there's no single "your discount is X%" line that's
-- still accurate. The client shows a generic confirmation instead and the
-- real amount is surfaced later, in the paywall, once a plan is selected.
CREATE OR REPLACE FUNCTION public.claim_referral(p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me       uuid := auth.uid();
  v_code     text := upper(btrim(COALESCE(p_code, '')));
  v_referrer uuid;
BEGIN
  IF v_me IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF v_code = ''  THEN RETURN jsonb_build_object('ok', false, 'error', 'empty_code'); END IF;

  SELECT id INTO v_referrer FROM public.profiles WHERE referral_code = v_code;
  IF v_referrer IS NULL   THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_code'); END IF;
  IF v_referrer = v_me    THEN RETURN jsonb_build_object('ok', false, 'error', 'self_referral'); END IF;

  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = v_me) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_referred');
  END IF;

  -- Attribution must happen BEFORE paying, otherwise someone could
  -- subscribe first and then retro-attach a friend's code to farm it.
  IF EXISTS (SELECT 1 FROM public.subscription_events WHERE user_id = v_me) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_subscribed');
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, code_used)
  VALUES (v_referrer, v_me, v_code);

  RETURN jsonb_build_object('ok', true, 'discount_applied', true);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('ok', false, 'error', 'already_referred');
END $$;

-- my_referral_summary: my_discount now carries the actual cents for all
-- four plan/billing combos (the paywall knows which one the user is
-- looking at and picks the right field), instead of two percentages.
CREATE OR REPLACE FUNCTION public.my_referral_summary()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  RETURN jsonb_build_object(
    'ok', true,
    'code',            (SELECT referral_code FROM public.profiles WHERE id = v_me),
    'balance_cents',   public.wallet_balance_cents(v_me),
    'total_referred',  (SELECT count(*) FROM public.referrals WHERE referrer_id = v_me),
    'total_converted', (SELECT count(*) FROM public.referrals WHERE referrer_id = v_me AND status = 'converted'),
    'total_earned_cents', (SELECT COALESCE(SUM(amount_cents),0)::int FROM public.wallet_transactions
                            WHERE user_id = v_me AND kind = 'referral_commission'),
    'pending_withdrawal_cents', (SELECT COALESCE(SUM(amount_cents),0)::int FROM public.withdrawal_requests
                                  WHERE user_id = v_me AND status = 'pending'),
    -- The discount this user is entitled to as someone else's referral
    'my_discount', (SELECT jsonb_build_object(
                      'has', true,
                      'pro_monthly_cents',     public.referral_discount_cents('pro','monthly'),
                      'pro_annual_cents',      public.referral_discount_cents('pro','annual'),
                      'premium_monthly_cents', public.referral_discount_cents('premium','monthly'),
                      'premium_annual_cents',  public.referral_discount_cents('premium','annual'))
                    FROM public.referrals
                    WHERE referred_id = v_me AND status = 'pending')
  );
END $$;

-- confirm_subscription: record discount_cents instead of discount_pct.
-- Logic is otherwise unchanged from 20260915_clear_cancel_at_on_tier_change.sql.
CREATE OR REPLACE FUNCTION public.confirm_subscription(p_user_id uuid, p_plan text, p_billing text, p_source text DEFAULT 'stripe_webhook'::text, p_external_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.subscription_events (user_id, plan, billing, source, external_id, discount_cents)
  VALUES (p_user_id, p_plan, p_billing, p_source, p_external_id,
          CASE WHEN v_had_ref THEN public.referral_discount_cents(p_plan, p_billing) ELSE NULL END)
  RETURNING id INTO v_event_id;

  PERFORM set_config('app.tier_write', 'on', true);
  UPDATE public.profiles
     SET tier = p_plan, tier_source = p_source, tier_updated_at = now(), tier_expires_at = NULL,
         tier_cancel_at = NULL
   WHERE id = p_user_id;
  PERFORM set_config('app.tier_write', 'off', true);

  SELECT * INTO v_ref FROM public.referrals
   WHERE referred_id = p_user_id AND status = 'pending' FOR UPDATE;

  IF FOUND THEN
    v_cents := public.referral_commission_cents(p_plan, p_billing);
    IF v_cents > 0 THEN
      INSERT INTO public.wallet_transactions (user_id, amount_cents, kind, description, ref_table, ref_id, available_at)
      VALUES (v_ref.referrer_id, v_cents, 'referral_commission',
              'Indicação convertida — ' || p_plan || ' ' || p_billing, 'referrals', v_ref.id,
              now() + interval '30 days');
      UPDATE public.referrals SET status = 'converted', converted_at = now() WHERE id = v_ref.id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'event_id', v_event_id,
    'commission_cents', v_cents,
    'referrer_id', v_ref.referrer_id,
    'discount_cents', CASE WHEN v_had_ref THEN public.referral_discount_cents(p_plan, p_billing) ELSE 0 END
  );
END $function$;

-- Nothing else calls the old percent function anymore.
DROP FUNCTION IF EXISTS public.referral_discount_pct(text);
