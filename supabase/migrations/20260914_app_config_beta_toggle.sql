-- A single admin-controlled switch: "plans_enabled". On (the default, so
-- nothing changes for anyone until an admin acts) the app behaves exactly as
-- it does today — free/pro/premium gating, Stripe checkout, the works. Off,
-- every real user is granted premium-level access for free, with nothing
-- written to their actual profiles.tier — the moment an admin flips it back
-- on, everyone reverts to whatever they'd actually paid for.
--
-- This exists to let a free-beta launch happen without exposing the Stripe
-- SANDBOX checkout to real users (they would see a "Sandbox" badge on the
-- Apple Pay sheet — an unmistakable sign the app isn't finished) and without
-- needing a second code path: the client reads this flag once and treats it
-- as the effective tier for every existing `user.tier === 'free'` check
-- already in the app, so nothing downstream needs to change.
--
-- id boolean primary key + the CHECK below is a standard trick to force this
-- table to hold exactly one row, forever, at id = true.
CREATE TABLE IF NOT EXISTS public.app_config (
  id           boolean PRIMARY KEY DEFAULT true,
  plans_enabled boolean NOT NULL DEFAULT true,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid REFERENCES public.profiles(id),
  CONSTRAINT app_config_singleton CHECK (id)
);

INSERT INTO public.app_config (id, plans_enabled)
VALUES (true, true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Every visitor needs this before they've even logged in (it decides whether
-- the login screen's "Continue as guest" preview shows paywalled sections),
-- so the read policy has no auth requirement at all.
CREATE POLICY app_config_public_read ON public.app_config
  FOR SELECT USING (true);

CREATE POLICY app_config_admin_write ON public.app_config
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
