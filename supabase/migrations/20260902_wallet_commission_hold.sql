-- Referral commissions become withdrawable 30 days after the sale — long
-- enough that a Stripe refund or straight cancellation (both already end in
-- cancel_subscription, see the refund-webhook fix earlier) has time to
-- happen first. Every OTHER wallet_transactions kind (withdrawal,
-- withdrawal_refund, adjustment, redemption) keeps applying immediately —
-- only commissions get held, via the column's default staying "now" for
-- everything that doesn't explicitly set a future one.

ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS available_at timestamptz NOT NULL DEFAULT now();

-- Withdrawable balance now excludes anything still on hold. This is the
-- only place that needed to change to make the $50 minimum, the wallet
-- hero number, and request_withdrawal's insufficient-funds check all
-- respect the hold automatically — none of them touch available_at
-- directly, they all go through this function.
CREATE OR REPLACE FUNCTION public.wallet_balance_cents(p_user_id uuid)
 RETURNS integer
 LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(SUM(amount_cents), 0)::int
    FROM public.wallet_transactions
   WHERE user_id = p_user_id AND available_at <= now();
$function$;

-- confirm_subscription: the commission it inserts is now held 30 days.
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
     SET tier = p_plan, tier_source = p_source, tier_updated_at = now(), tier_expires_at = NULL
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

-- cancel_subscription: if the person being cancelled/refunded is the one
-- whose conversion earned a commission that's STILL on hold, void it with
-- an offsetting adjustment row (never delete — the paid commission stays
-- in the ledger for the audit trail, this just cancels it out). A
-- commission that already cleared the hold (and may already be withdrawn)
-- is untouched — that's the entire point of the hold existing.
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
     SET tier = 'free', tier_source = p_source, tier_updated_at = now(), tier_expires_at = NULL
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
    -- Carries the SAME available_at as the commission it cancels out —
    -- not now(). If this reversal applied immediately while the original
    -- +700 stays locked another three weeks, wallet_balance_cents (which
    -- only sums rows past their available_at) would count the -700 right
    -- away but not yet the +700 it's supposed to offset, showing a
    -- negative "available" balance for those three weeks. Matching the
    -- date makes both rows land in the sum together, netting to zero the
    -- instant either would otherwise have shown up.
    INSERT INTO public.wallet_transactions (user_id, amount_cents, kind, description, ref_table, ref_id, available_at)
    VALUES (v_locked.referrer_id, -v_locked.amount_cents, 'adjustment',
            'Comissão revertida — assinatura cancelada antes de 30 dias', 'referrals', v_locked.ref_id,
            v_locked.available_at);
    v_reversed := true;
  END IF;

  RETURN jsonb_build_object('ok', true, 'previous_tier', v_prev, 'commission_reversed', v_reversed);
END $function$;

-- my_referral_summary: surface the locked portion separately so the wallet
-- screen can show "available now" vs "still on hold" instead of one number.
CREATE OR REPLACE FUNCTION public.my_referral_summary()
 RETURNS jsonb
 LANGUAGE plpgsql STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  RETURN jsonb_build_object(
    'ok', true,
    'code',            (SELECT referral_code FROM public.profiles WHERE id = v_me),
    'balance_cents',   public.wallet_balance_cents(v_me),
    'locked_cents',    (SELECT COALESCE(SUM(amount_cents),0)::int FROM public.wallet_transactions
                         WHERE user_id = v_me AND kind = 'referral_commission' AND available_at > now()),
    'total_referred',  (SELECT count(*) FROM public.referrals WHERE referrer_id = v_me),
    'total_converted', (SELECT count(*) FROM public.referrals WHERE referrer_id = v_me AND status = 'converted'),
    -- Net of any reversed commission (a referral whose subscriber cancelled
    -- or got refunded inside the hold window), not the raw commission
    -- total — a reversed sale was never really earned, so it shouldn't
    -- still count toward "Earned" just because the reversal is a separate
    -- ledger row from the original credit.
    'total_earned_cents', (SELECT COALESCE(SUM(amount_cents),0)::int FROM public.wallet_transactions
                            WHERE user_id = v_me AND ref_table = 'referrals'
                              AND kind IN ('referral_commission','adjustment')),
    'pending_withdrawal_cents', (SELECT COALESCE(SUM(amount_cents),0)::int FROM public.withdrawal_requests
                                  WHERE user_id = v_me AND status = 'pending'),
    'my_discount', (SELECT jsonb_build_object(
                      'has', true,
                      'monthly_pct', public.referral_discount_pct('monthly'),
                      'annual_pct',  public.referral_discount_pct('annual'))
                    FROM public.referrals
                    WHERE referred_id = v_me AND status = 'pending')
  );
END $function$;
