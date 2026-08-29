-- Links a profile to its Stripe customer so we never create a duplicate
-- customer for the same person, and so the billing portal can be opened
-- later. Deliberately NOT added to the authenticated UPDATE grant — only
-- the Edge Functions (service_role) write it.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_key
  ON public.profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Same guard as tier/referral_code: even if the table-level UPDATE grant
-- were ever restored, a client still cannot rewrite this.
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
        NEW.stripe_customer_id := OLD.stripe_customer_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Lets the checkout function record the customer id without granting the
-- client any way to do so.
CREATE OR REPLACE FUNCTION public.set_stripe_customer(p_user_id uuid, p_customer_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.tier_write', 'on', true);
  UPDATE public.profiles SET stripe_customer_id = p_customer_id WHERE id = p_user_id;
  PERFORM set_config('app.tier_write', 'off', true);
END $$;

REVOKE ALL ON FUNCTION public.set_stripe_customer(uuid,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_stripe_customer(uuid,text) TO service_role;
