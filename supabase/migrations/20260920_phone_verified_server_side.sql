-- profiles.phone_verified was writable by the account owner: the app sets it after
-- a real Twilio SMS check, but nothing stopped a signed-in user from PATCHing
-- their own row with phone_verified=true and skipping the SMS entirely (and the
-- rating gate trusts that flag). It can now only be true while auth.users has a
-- CONFIRMED phone that matches the number on the profile; changing the number to
-- something that is not the confirmed one drops it back to false.
CREATE OR REPLACE FUNCTION public.protect_profile_privilege_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tier_write boolean := COALESCE(current_setting('app.tier_write', true), '') = 'on';
  v_digits     text;
BEGIN
  IF NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role       := 'user';
      NEW.verified   := false;
      NEW.banned     := false;
      NEW.ban_reason := NULL;
      NEW.phone_verified := false;
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
      IF NEW.phone_verified IS DISTINCT FROM OLD.phone_verified
         OR NEW.phone IS DISTINCT FROM OLD.phone THEN
        v_digits := right(regexp_replace(coalesce(NEW.phone, ''), '\D', '', 'g'), 10);
        NEW.phone_verified := length(v_digits) = 10 AND EXISTS (
          SELECT 1 FROM auth.users u
           WHERE u.id = NEW.id
             AND u.phone_confirmed_at IS NOT NULL
             AND right(regexp_replace(coalesce(u.phone, ''), '\D', '', 'g'), 10) = v_digits
        );
      END IF;
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
$function$;
