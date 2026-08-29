-- Closes the other end of the subscription lifecycle: Stripe telling us a
-- subscription ended. Without this a cancelled/failed subscriber would keep
-- premium access forever, since tier is only ever written server-side.
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
     SET tier = 'free', tier_source = p_source, tier_updated_at = now()
   WHERE id = p_user_id;
  PERFORM set_config('app.tier_write', 'off', true);

  -- Deliberately does NOT touch referrals or the wallet: a commission that
  -- was already earned on a real payment stays earned.
  RETURN jsonb_build_object('ok', true, 'previous_tier', v_prev);
END $$;

REVOKE ALL ON FUNCTION public.cancel_subscription(uuid,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_subscription(uuid,text) TO service_role;
