-- cancel_subscription and confirm_subscription both flip profiles.tier, but
-- neither touched the new tier_cancel_at column — so a user whose
-- subscription actually finished (tier back to 'free') would keep showing a
-- stale "access until <date that already passed>" until something else
-- happened to overwrite it, and someone who re-subscribes after a full
-- cancellation would carry forward a leftover cancel-at date from the
-- subscription that no longer exists. Both functions now clear it in the
-- same statement that changes the tier, so it's never a separate step
-- someone can forget.

CREATE OR REPLACE FUNCTION public.cancel_subscription(p_user_id uuid, p_source text DEFAULT 'stripe_webhook'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prev text;
  v_locked RECORD;
  v_reversed boolean := false;
BEGIN
  SELECT tier INTO v_prev FROM public.profiles WHERE id = p_user_id;
  IF v_prev IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_such_profile');
  END IF;

  PERFORM set_config('app.tier_write', 'on', true);
  UPDATE public.profiles
     SET tier = 'free', tier_source = p_source, tier_updated_at = now(), tier_expires_at = NULL,
         tier_cancel_at = NULL
   WHERE id = p_user_id;
  PERFORM set_config('app.tier_write', 'off', true);

  SELECT wt.id, wt.amount_cents, wt.user_id AS referrer_id, wt.ref_id, wt.available_at
    INTO v_locked
    FROM public.wallet_transactions wt
    JOIN public.referrals r ON r.id = wt.ref_id AND wt.ref_table = 'referrals'
   WHERE r.referred_id = p_user_id
     AND wt.kind = 'referral_commission'
     AND wt.available_at > now()
   LIMIT 1;

  IF FOUND THEN
    INSERT INTO public.wallet_transactions (user_id, amount_cents, kind, description, ref_table, ref_id, available_at)
    VALUES (v_locked.referrer_id, -v_locked.amount_cents, 'adjustment',
            'Comissão revertida — assinatura cancelada antes de 30 dias', 'referrals', v_locked.ref_id,
            v_locked.available_at);
    v_reversed := true;
  END IF;

  RETURN jsonb_build_object('ok', true, 'previous_tier', v_prev, 'commission_reversed', v_reversed);
END $function$;

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

  INSERT INTO public.subscription_events (user_id, plan, billing, source, external_id, discount_pct)
  VALUES (p_user_id, p_plan, p_billing, p_source, p_external_id,
          CASE WHEN v_had_ref THEN public.referral_discount_pct(p_billing) ELSE NULL END)
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
    'discount_pct', CASE WHEN v_had_ref THEN public.referral_discount_pct(p_billing) ELSE 0 END
  );
END $function$;
