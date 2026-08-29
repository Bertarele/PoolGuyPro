-- Second, independent sponsor format: a pure image banner (the artwork
-- comes ready-made from the sponsoring company — no headline/subtext/logo
-- fields, just an image + a link). Coexists with sponsored_cards, which is
-- untouched. Mirrors its RLS/storage pattern exactly.

CREATE TABLE IF NOT EXISTS public.sponsor_banners (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name     text,              -- admin-facing label only; never rendered on the banner itself
  image_url        text NOT NULL,
  link_url         text,
  duration_seconds integer NOT NULL DEFAULT 6,
  active           boolean NOT NULL DEFAULT true,
  expires_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sponsor_banners_duration_check CHECK (duration_seconds BETWEEN 2 AND 60)
);

ALTER TABLE public.sponsor_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active sponsor_banners" ON public.sponsor_banners;
CREATE POLICY "Public read active sponsor_banners" ON public.sponsor_banners
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage sponsor_banners" ON public.sponsor_banners;
CREATE POLICY "Admins manage sponsor_banners" ON public.sponsor_banners
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

GRANT SELECT ON public.sponsor_banners TO anon, authenticated;
GRANT ALL ON public.sponsor_banners TO authenticated;

-- ── Storage bucket for the artwork, same pattern as sponsor-logos ──────
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-banners', 'sponsor-banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read sponsor banners" ON storage.objects;
CREATE POLICY "Public read sponsor banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'sponsor-banners');

DROP POLICY IF EXISTS "admin_upload_sponsor_banners" ON storage.objects;
CREATE POLICY "admin_upload_sponsor_banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sponsor-banners' AND is_admin());

DROP POLICY IF EXISTS "admin_update_sponsor_banners" ON storage.objects;
CREATE POLICY "admin_update_sponsor_banners" ON storage.objects
  FOR UPDATE USING (bucket_id = 'sponsor-banners' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_sponsor_banners" ON storage.objects;
CREATE POLICY "admin_delete_sponsor_banners" ON storage.objects
  FOR DELETE USING (bucket_id = 'sponsor-banners' AND is_admin());
