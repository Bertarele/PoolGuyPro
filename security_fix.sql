-- ============================================================================
-- PoolGuyX — Correção de Segurança (RLS + views + policies)
-- Executar no Supabase → SQL Editor (ou via Management API com PAT)
-- Data: 2026-07-04
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES — parar o vazamento de email/telefone
--    Antes: qualquer anônimo lia name/email/phone de TODOS os usuários.
--    Depois: cada usuário só lê a PRÓPRIA linha completa (com email/phone).
--            Dados públicos (nome, foto, etc.) vão por um VIEW seguro.
-- ----------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas de SELECT abertas (nomes comuns; ignora se não existir)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- SELECT: somente a própria linha (dono vê email/phone/prefs)
DROP POLICY IF EXISTS "own_profile_select" ON profiles;
CREATE POLICY "own_profile_select" ON profiles FOR SELECT
USING (auth.uid() = id);

-- SELECT: admins veem tudo
DROP POLICY IF EXISTS "admin_profile_select" ON profiles;
CREATE POLICY "admin_profile_select" ON profiles FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin'));

-- UPDATE: dono edita a própria linha (NÃO pode mudar role/verified/banned)
DROP POLICY IF EXISTS "own_profile_update" ON profiles;
CREATE POLICY "own_profile_update" ON profiles FOR UPDATE
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- UPDATE / DELETE: admins
DROP POLICY IF EXISTS "admin_profile_update" ON profiles;
CREATE POLICY "admin_profile_update" ON profiles FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin'));

DROP POLICY IF EXISTS "admin_profile_delete" ON profiles;
CREATE POLICY "admin_profile_delete" ON profiles FOR DELETE
USING (EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin'));

-- INSERT: usuário cria apenas o próprio perfil
DROP POLICY IF EXISTS "own_profile_insert" ON profiles;
CREATE POLICY "own_profile_insert" ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Impede escalonamento de privilégio: usuário comum NÃO define/muda
-- role/verified/banned — nem no cadastro (INSERT) nem na edição (UPDATE).
-- Só quem já é admin pode alterar esses campos (via painel admin).
CREATE OR REPLACE FUNCTION protect_profile_privilege_fields()
RETURNS TRIGGER AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    IF TG_OP = 'INSERT' THEN
      -- Cadastro: força valores seguros, ignora o que o cliente mandar
      NEW.role     := 'user';
      NEW.verified := false;
      NEW.banned   := false;
      NEW.ban_reason := NULL;
    ELSE -- UPDATE
      NEW.role     := OLD.role;
      NEW.verified := OLD.verified;
      NEW.banned   := OLD.banned;
      NEW.ban_reason := OLD.ban_reason;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile ON profiles;
CREATE TRIGGER trg_protect_profile
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION protect_profile_privilege_fields();

-- VIEW público: só colunas seguras (SEM email/phone/prefs/ban_reason)
DROP VIEW IF EXISTS profiles_public;
CREATE VIEW profiles_public
WITH (security_invoker = off) AS
SELECT id, name, region, role, photo_url, verified,
       verification_requested, regions_by_day, is_online, last_seen
FROM profiles;

GRANT SELECT ON profiles_public TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. JOBS / TECHS / VACATIONS / MARKETPLACE — exigir login para publicar
--    Antes: anônimo podia inserir listagens falsas (spam).
--    Depois: só usuário autenticado insere, e como o próprio autor.
-- ----------------------------------------------------------------------------

-- JOBS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jobs_insert_anon"  ON jobs;
DROP POLICY IF EXISTS "Enable insert for all" ON jobs;
DROP POLICY IF EXISTS "jobs_public_read"  ON jobs;
CREATE POLICY "jobs_public_read"  ON jobs FOR SELECT USING (true);
CREATE POLICY "jobs_auth_insert"  ON jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "jobs_owner_update" ON jobs FOR UPDATE TO authenticated
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "jobs_owner_delete" ON jobs FOR DELETE TO authenticated
  USING (auth.uid() = author_id);
CREATE POLICY "jobs_admin_all"    ON jobs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- TECHS
ALTER TABLE techs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "techs_insert_anon" ON techs;
DROP POLICY IF EXISTS "techs_public_read" ON techs;
CREATE POLICY "techs_public_read"  ON techs FOR SELECT USING (true);
CREATE POLICY "techs_auth_insert"  ON techs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "techs_owner_update" ON techs FOR UPDATE TO authenticated
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "techs_owner_delete" ON techs FOR DELETE TO authenticated
  USING (auth.uid() = author_id);
CREATE POLICY "techs_admin_all"    ON techs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- VACATIONS
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vacations_insert_anon" ON vacations;
DROP POLICY IF EXISTS "vacations_public_read" ON vacations;
CREATE POLICY "vacations_public_read"  ON vacations FOR SELECT USING (true);
CREATE POLICY "vacations_auth_insert"  ON vacations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "vacations_owner_update" ON vacations FOR UPDATE TO authenticated
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "vacations_owner_delete" ON vacations FOR DELETE TO authenticated
  USING (auth.uid() = author_id);
CREATE POLICY "vacations_admin_all"    ON vacations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- MARKETPLACE
ALTER TABLE marketplace ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "marketplace_insert_anon" ON marketplace;
DROP POLICY IF EXISTS "marketplace_public_read" ON marketplace;
CREATE POLICY "marketplace_public_read"  ON marketplace FOR SELECT USING (true);
CREATE POLICY "marketplace_auth_insert"  ON marketplace FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "marketplace_owner_update" ON marketplace FOR UPDATE TO authenticated
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "marketplace_owner_delete" ON marketplace FOR DELETE TO authenticated
  USING (auth.uid() = author_id);
CREATE POLICY "marketplace_admin_all"    ON marketplace FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------------------
-- 3. Confirmar RLS ligado nas tabelas sensíveis (já estavam protegidas na
--    leitura, mas garantimos o ENABLE + policy de admin para o painel)
-- ----------------------------------------------------------------------------
ALTER TABLE ratings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings    ENABLE ROW LEVEL SECURITY;

-- Admin pode gerenciar disputas/warnings/rentals a partir do painel
DROP POLICY IF EXISTS "admin_dispute_all" ON dispute_reports;
CREATE POLICY "admin_dispute_all" ON dispute_reports FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_warnings_all" ON user_warnings;
CREATE POLICY "admin_warnings_all" ON user_warnings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_rentals_all" ON rental_requests;
CREATE POLICY "admin_rentals_all" ON rental_requests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------------------
-- 4. TECHS — esconder o email na listagem pública (o telefone continua, é o
--    botão de contato). O dono ainda vê/edita o próprio email via 'profiles'.
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS techs_public;
CREATE VIEW techs_public
WITH (security_invoker = off) AS
SELECT id, name, specialty, loc, phone, rate_mode, rate,
       author, created_at, author_id, photo_url
FROM techs;
GRANT SELECT ON techs_public TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. STORAGE — admin sobe logos de patrocinador com o próprio token (não mais
--    com service_role). Policy no bucket sponsor-logos.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_upload_sponsor_logos" ON storage.objects;
CREATE POLICY "admin_upload_sponsor_logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'sponsor-logos'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_sponsor_logos" ON storage.objects;
CREATE POLICY "admin_update_sponsor_logos" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'sponsor-logos'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- FIM. Depois de aplicar, a service_role key DEVE ser rotacionada no
-- Dashboard (Settings → API → Rotate) porque ela esteve exposta publicamente.
-- ============================================================================
