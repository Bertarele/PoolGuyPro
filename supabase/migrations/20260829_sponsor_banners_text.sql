-- Adds optional overlay text to sponsor_banners: a title, a smaller
-- subtitle, and a flexible "contact" line — many small sponsors (a solo
-- pool tech, say) have a phone or email but no website, so this replaces
-- the single link_url with a typed contact instead of assuming a URL.
-- All of it is optional — a banner can still be pure artwork with no text
-- at all, same as before this migration.

ALTER TABLE public.sponsor_banners ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.sponsor_banners ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE public.sponsor_banners ADD COLUMN IF NOT EXISTS contact_type text NOT NULL DEFAULT 'none';
ALTER TABLE public.sponsor_banners ADD COLUMN IF NOT EXISTS contact_value text;

DO $$ BEGIN
  ALTER TABLE public.sponsor_banners ADD CONSTRAINT sponsor_banners_contact_type_check
    CHECK (contact_type IN ('none','website','phone','email'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- link_url served the same purpose (what happens when the banner is
-- tapped) — contact_type/contact_value replaces it with a typed version
-- that also drives what's shown in the small line at the bottom.
ALTER TABLE public.sponsor_banners DROP COLUMN IF EXISTS link_url;
