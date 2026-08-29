-- ═══════════════════════════════════════════════════════════════════
-- Referral + Wallet system
--
-- Money model: a referrer earns commission ONLY when the person they
-- referred is confirmed to have actually paid. That confirmation has a
-- single chokepoint — confirm_subscription() — which is executable by
-- service_role only (Stripe webhook / admin), never by the app client.
-- Nothing the client can call credits a wallet.
--
-- Amounts are integer CENTS everywhere. Never floats for money.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Lock down profiles column writes ────────────────────────────
-- profiles currently has a TABLE-level UPDATE grant (arwdDxtm), which
-- means every column — including any column added later — is writable
-- by the row's owner. Adding `tier` under that grant would literally
-- let any user make themselves premium with one PATCH. Re-grant the
-- exact column list that is writable today (so no existing flow
-- changes) and leave the new columns out.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;

GRANT UPDATE (
  active_conversation_id, active_conversation_set_at, age, ban_reason, banned,
  created_at, email, equipment, experience, has_car, has_equipment, has_license,
  id, is_online, last_qp_notified_at, last_seen, name, notif_prefs,
  notify_pools, notify_routes, notify_service, phone, phone_verified, photo_url,
  region, regions_by_day, role, verification_requested, verified
) ON public.profiles TO anon, authenticated;

-- ── 2. profiles: referral code + persisted tier ────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier_source text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier_updated_at timestamptz;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_tier_check
    CHECK (tier IN ('free','pro','premium'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_key
  ON public.profiles (referral_code) WHERE referral_code IS NOT NULL;

-- ── 3. Referral code generation ────────────────────────────────────
-- Alphabet excludes I/L/O/0/1 — these codes get read aloud and retyped
-- off a shared link, so ambiguous glyphs cause real support tickets.
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..7 LOOP
      code := code || substr(alphabet, floor(random() * length(alphabet))::int + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;
  RETURN code;
END $$;

CREATE OR REPLACE FUNCTION public.profiles_set_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_profiles_referral_code ON public.profiles;
CREATE TRIGGER trg_profiles_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_set_referral_code();

-- Backfill everyone who already exists
UPDATE public.profiles
   SET referral_code = public.generate_referral_code()
 WHERE referral_code IS NULL;

-- ── 4. referrals — who brought whom ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- UNIQUE: a person can only ever be referred once, by one person.
  referred_id  uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  code_used    text NOT NULL,
  status       text NOT NULL DEFAULT 'pending',
  converted_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referrals_status_check CHECK (status IN ('pending','converted')),
  CONSTRAINT referrals_no_self CHECK (referrer_id <> referred_id)
);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals (referrer_id);

-- ── 5. wallet_transactions — append-only ledger ────────────────────
-- Balance is always SUM(amount_cents); never a stored counter that can
-- drift out of sync with its own history.
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,           -- >0 credit, <0 debit
  kind         text NOT NULL,
  description  text,
  ref_table    text,
  ref_id       uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wallet_tx_kind_check
    CHECK (kind IN ('referral_commission','withdrawal','withdrawal_refund','redemption','adjustment')),
  CONSTRAINT wallet_tx_nonzero CHECK (amount_cents <> 0)
);
CREATE INDEX IF NOT EXISTS wallet_tx_user_idx ON public.wallet_transactions (user_id, created_at DESC);

-- Hard guarantee that one referral can never be paid twice, even if
-- confirm_subscription is somehow invoked concurrently.
CREATE UNIQUE INDEX IF NOT EXISTS wallet_tx_one_commission_per_referral
  ON public.wallet_transactions (ref_id) WHERE kind = 'referral_commission';

-- ── 6. subscription_events — the "they really paid" record ─────────
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan         text NOT NULL,
  billing      text NOT NULL,
  source       text NOT NULL,
  external_id  text UNIQUE,     -- Stripe id; also the idempotency key
  discount_pct numeric,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sub_events_plan_check CHECK (plan IN ('pro','premium')),
  CONSTRAINT sub_events_billing_check CHECK (billing IN ('monthly','annual'))
);
CREATE INDEX IF NOT EXISTS sub_events_user_idx ON public.subscription_events (user_id, created_at DESC);

-- ── 7. withdrawal_requests ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  status       text NOT NULL DEFAULT 'pending',
  method       text,
  details      text,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  resolved_at  timestamptz,
  resolved_by  uuid REFERENCES public.profiles(id),
  CONSTRAINT withdrawal_status_check CHECK (status IN ('pending','approved','rejected','paid')),
  CONSTRAINT withdrawal_min CHECK (amount_cents >= 5000)   -- $50 minimum
);
CREATE INDEX IF NOT EXISTS withdrawal_user_idx ON public.withdrawal_requests (user_id, created_at DESC);

-- ── 8. Privileges: users may READ their own rows, never write ──────
-- Supabase default privileges grant ALL on new public tables to
-- anon/authenticated, so revoking is mandatory, not decorative.
ALTER TABLE public.referrals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.referrals           FROM anon, authenticated;
REVOKE ALL ON public.wallet_transactions FROM anon, authenticated;
REVOKE ALL ON public.subscription_events FROM anon, authenticated;
REVOKE ALL ON public.withdrawal_requests FROM anon, authenticated;

GRANT SELECT ON public.referrals           TO authenticated;
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT SELECT ON public.subscription_events TO authenticated;
GRANT SELECT ON public.withdrawal_requests TO authenticated;

DROP POLICY IF EXISTS referrals_select_own ON public.referrals;
CREATE POLICY referrals_select_own ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());
DROP POLICY IF EXISTS referrals_select_admin ON public.referrals;
CREATE POLICY referrals_select_admin ON public.referrals FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS wallet_tx_select_own ON public.wallet_transactions;
CREATE POLICY wallet_tx_select_own ON public.wallet_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS wallet_tx_select_admin ON public.wallet_transactions;
CREATE POLICY wallet_tx_select_admin ON public.wallet_transactions FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS sub_events_select_own ON public.subscription_events;
CREATE POLICY sub_events_select_own ON public.subscription_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS sub_events_select_admin ON public.subscription_events;
CREATE POLICY sub_events_select_admin ON public.subscription_events FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS withdrawal_select_own ON public.withdrawal_requests;
CREATE POLICY withdrawal_select_own ON public.withdrawal_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS withdrawal_select_admin ON public.withdrawal_requests;
CREATE POLICY withdrawal_select_admin ON public.withdrawal_requests FOR SELECT TO authenticated
  USING (public.is_admin());

-- ── 9. Commission + discount rules (single source of truth) ────────
CREATE OR REPLACE FUNCTION public.referral_commission_cents(p_plan text, p_billing text)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_plan = 'pro'     AND p_billing = 'monthly' THEN 500   -- $5
    WHEN p_plan = 'pro'     AND p_billing = 'annual'  THEN 700   -- $7
    WHEN p_plan = 'premium' AND p_billing = 'monthly' THEN 700   -- $7
    WHEN p_plan = 'premium' AND p_billing = 'annual'  THEN 1000  -- $10
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.referral_discount_pct(p_billing text)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p_billing = 'monthly' THEN 10 WHEN p_billing = 'annual' THEN 5 ELSE 0 END;
$$;

-- ── 10. Balance helper ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.wallet_balance_cents(p_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(amount_cents), 0)::int
    FROM public.wallet_transactions WHERE user_id = p_user_id;
$$;

-- ── 11. claim_referral — the ONLY way attribution is created ───────
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

  RETURN jsonb_build_object('ok', true, 'discount_monthly_pct', public.referral_discount_pct('monthly'),
                            'discount_annual_pct', public.referral_discount_pct('annual'));
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('ok', false, 'error', 'already_referred');
END $$;

-- ── 12. confirm_subscription — service_role ONLY ───────────────────
-- This is the seam Stripe's webhook will call. It is the only path that
-- can ever credit a wallet, and the app client cannot execute it.
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
  IF p_plan    NOT IN ('pro','premium')      THEN RAISE EXCEPTION 'invalid plan: %', p_plan; END IF;
  IF p_billing NOT IN ('monthly','annual')   THEN RAISE EXCEPTION 'invalid billing: %', p_billing; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'no such profile: %', p_user_id;
  END IF;

  -- Idempotency: Stripe retries webhooks. Same external_id must never
  -- pay a second commission.
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

  UPDATE public.profiles
     SET tier = p_plan, tier_source = p_source, tier_updated_at = now()
   WHERE id = p_user_id;

  -- Commission pays once, on the referred user's first conversion.
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

-- ── 13. request_withdrawal — authenticated, balance-checked ────────
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_amount_cents integer, p_method text DEFAULT NULL, p_details text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me      uuid := auth.uid();
  v_balance int;
  v_id      uuid;
BEGIN
  IF v_me IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF p_amount_cents IS NULL OR p_amount_cents < 5000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'below_minimum');
  END IF;

  -- Serialize per user so two concurrent requests can't both pass the
  -- balance check and overdraw the wallet.
  PERFORM pg_advisory_xact_lock(hashtext('wallet:' || v_me::text));

  v_balance := public.wallet_balance_cents(v_me);
  IF p_amount_cents > v_balance THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_funds', 'balance_cents', v_balance);
  END IF;

  INSERT INTO public.withdrawal_requests (user_id, amount_cents, method, details)
  VALUES (v_me, p_amount_cents, p_method, p_details)
  RETURNING id INTO v_id;

  -- Debit immediately as a hold. Otherwise the same balance could be
  -- requested again while the first request is still pending.
  INSERT INTO public.wallet_transactions (user_id, amount_cents, kind, description, ref_table, ref_id)
  VALUES (v_me, -p_amount_cents, 'withdrawal', 'Saque solicitado', 'withdrawal_requests', v_id);

  RETURN jsonb_build_object('ok', true, 'request_id', v_id,
                            'balance_cents', public.wallet_balance_cents(v_me));
END $$;

REVOKE ALL ON FUNCTION public.request_withdrawal(integer,text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(integer,text,text) TO authenticated;

-- ── 14. resolve_withdrawal — admin only ────────────────────────────
CREATE OR REPLACE FUNCTION public.resolve_withdrawal(
  p_id uuid, p_status text, p_note text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_req public.withdrawal_requests%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN RETURN jsonb_build_object('ok', false, 'error', 'not_admin'); END IF;
  IF p_status NOT IN ('approved','rejected','paid') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_status');
  END IF;

  SELECT * INTO v_req FROM public.withdrawal_requests WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'not_found'); END IF;
  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_resolved', 'status', v_req.status);
  END IF;

  UPDATE public.withdrawal_requests
     SET status = p_status, note = p_note, resolved_at = now(), resolved_by = auth.uid()
   WHERE id = p_id;

  -- Rejection returns the held amount to the wallet.
  IF p_status = 'rejected' THEN
    INSERT INTO public.wallet_transactions (user_id, amount_cents, kind, description, ref_table, ref_id)
    VALUES (v_req.user_id, v_req.amount_cents, 'withdrawal_refund',
            'Saque recusado — valor devolvido', 'withdrawal_requests', v_req.id);
  END IF;

  RETURN jsonb_build_object('ok', true, 'status', p_status);
END $$;

REVOKE ALL ON FUNCTION public.resolve_withdrawal(uuid,text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.resolve_withdrawal(uuid,text,text) TO authenticated;

-- ── 15. my_referral_summary — one round-trip for the wallet UI ─────
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
                      'monthly_pct', public.referral_discount_pct('monthly'),
                      'annual_pct',  public.referral_discount_pct('annual'))
                    FROM public.referrals
                    WHERE referred_id = v_me AND status = 'pending')
  );
END $$;

REVOKE ALL ON FUNCTION public.my_referral_summary() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.my_referral_summary() TO authenticated;
