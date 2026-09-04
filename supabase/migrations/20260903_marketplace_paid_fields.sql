-- The owner-update policy on marketplace lets an author write ANY column of
-- their own listing, which quietly handed them three things they shouldn't
-- have: `featured` (free front-page placement), `boosted_until` (the paid
-- Boost, which the app itself used to grant for free right after opening a
-- checkout tab it never waited on) and `status = 'approved'` (self-approval,
-- skipping admin review entirely — marketplace_public_read only shows
-- approved listings, so review is the only thing standing between a posted
-- listing and every user seeing it).
--
-- RLS can't express "this row but not that column", so the guard is a trigger.
-- It follows protect_profile_privilege_fields: silently restore the old value
-- rather than raise, so an ordinary edit that happens to send the whole row
-- back still succeeds on the fields the author legitimately owns.

CREATE OR REPLACE FUNCTION public.protect_marketplace_paid_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  -- Escape hatch for a future server-side Boost webhook, which runs as the
  -- service role and so is not is_admin(). Same pattern as app.tier_write.
  v_paid_write boolean := COALESCE(current_setting('app.marketplace_paid_write', true), '') = 'on';
BEGIN
  IF is_admin() OR v_paid_write THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status        := 'pending';
    NEW.featured      := false;
    NEW.boosted_until := NULL;
  ELSE
    NEW.featured      := OLD.featured;
    NEW.boosted_until := OLD.boosted_until;
    -- An author may take their own listing OUT of the approved state — an
    -- edit sends it back to 'pending', and 'sold'/'expired' are both normal
    -- owner actions. They may never put it IN: that is the review step.
    IF NEW.status = 'approved' AND COALESCE(OLD.status, '') <> 'approved' THEN
      NEW.status := OLD.status;
    END IF;
  END IF;

  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS protect_marketplace_paid_fields ON public.marketplace;
CREATE TRIGGER protect_marketplace_paid_fields
  BEFORE INSERT OR UPDATE ON public.marketplace
  FOR EACH ROW EXECUTE FUNCTION public.protect_marketplace_paid_fields();
