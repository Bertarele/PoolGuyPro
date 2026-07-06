-- ============================================================================
-- PoolGuyX — Anti-manipulação de avaliações (ratings)
-- Já aplicado no banco em produção. Guardado aqui como documentação.
-- Data: 2026-07-05
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1+2. Fecha o forjamento de avaliação em nome de terceiros + bloqueia
-- autoavaliação.
--
-- Antes: WITH CHECK (auth.uid() = from_id OR auth.uid() = to_id) — permitia
-- inserir uma avaliação JÁ COMPLETA (stars preenchido, pending=false)
-- fingindo ser outra pessoa, bastando ser o destinatário (to_id). Também não
-- impedia from_id = to_id (autoavaliação).
--
-- O "OR auth.uid() = to_id" existe porque o app cria um par de placeholders
-- pendentes após uma transação (marketplace.jsx): uma linha para o usuário
-- atual avaliar a outra parte, e outra linha inversa (from_id=outra parte,
-- to_id=usuário atual, stars=NULL, pending=true) que só a outra parte poderá
-- preencher depois via UPDATE. Isso continua funcionando — só passamos a
-- exigir que essa linha "em nome de outra pessoa" seja SEMPRE um placeholder
-- vazio, nunca uma avaliação já completa.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "insert own ratings" ON ratings;
CREATE POLICY "insert own ratings" ON ratings FOR INSERT
WITH CHECK (
  from_id IS DISTINCT FROM to_id
  AND (
    auth.uid() = from_id
    OR (auth.uid() = to_id AND stars IS NULL AND pending = true)
  )
);

-- ----------------------------------------------------------------------------
-- Bug crítico encontrado durante os testes (não relacionado à manipulação,
-- mas achado ao validar a correção acima): o trigger mutual_rating_trigger
-- causava STACK OVERFLOW (recursão infinita) sempre que um par de avaliações
-- mútuas completas existia. A função rodava um UPDATE que sempre re-batia no
-- próprio critério de disparo do trigger (AFTER UPDATE), nunca convergindo.
-- Havia 2 pares reais já em produção prontos para estourar no próximo toque.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_mutual_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM ratings
    WHERE from_id = NEW.to_id AND to_id = NEW.from_id AND stars IS NOT NULL
  ) THEN
    UPDATE ratings SET pending = false
    WHERE ((from_id = NEW.from_id AND to_id = NEW.to_id) OR (from_id = NEW.to_id AND to_id = NEW.from_id))
      AND pending IS DISTINCT FROM false;
  END IF;
  RETURN NEW;
END;
$function$;

-- ----------------------------------------------------------------------------
-- View para o painel admin: avaliações sinalizadas como suspeitas.
-- Motivos possíveis (coluna reasons, pode ter mais de um por linha):
--   mutual_high       — par recíproco, ambos ≥4 estrelas (conluio típico)
--   mutual_low        — par recíproco, ambos ≤2 estrelas (ataque mútuo)
--   fast_reciprocal   — avaliação recíproca criada em <2h da outra
--   new_account_rater — quem avaliou tinha <24h de conta no momento
--
-- Segurança: a view roda com o RLS do CALLER (comportamento padrão, sem
-- security_invoker=off). Usuário comum só vê linhas onde ele mesmo é uma das
-- partes (herda a policy "read own ratings"); admin vê tudo (herda "admin
-- all ratings"). Nenhuma policy extra precisa ser escrita para a view.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW flagged_ratings AS
WITH base AS (
  SELECT
    r1.id,
    r1.from_id, r1.to_id, r1.stars, r1.comment, r1.created_at,
    r1.listing_name, r1.connection_type,
    r2.id AS reciprocal_id, r2.stars AS reciprocal_stars, r2.created_at AS reciprocal_created_at,
    p_from.created_at AS rater_account_created_at,
    p_from.name AS from_name,
    p_to.name AS to_name
  FROM ratings r1
  LEFT JOIN ratings r2
    ON r2.from_id = r1.to_id AND r2.to_id = r1.from_id AND r2.stars IS NOT NULL
  LEFT JOIN profiles p_from ON p_from.id = r1.from_id
  LEFT JOIN profiles p_to   ON p_to.id   = r1.to_id
  WHERE r1.stars IS NOT NULL
),
flagged AS (
  SELECT *,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN reciprocal_id IS NOT NULL AND stars >= 4 AND reciprocal_stars >= 4 THEN 'mutual_high' END,
      CASE WHEN reciprocal_id IS NOT NULL AND stars <= 2 AND reciprocal_stars <= 2 THEN 'mutual_low' END,
      CASE WHEN reciprocal_id IS NOT NULL AND ABS(EXTRACT(EPOCH FROM (created_at - reciprocal_created_at))) < 7200 THEN 'fast_reciprocal' END,
      CASE WHEN rater_account_created_at IS NOT NULL AND created_at - rater_account_created_at < INTERVAL '24 hours' THEN 'new_account_rater' END
    ], NULL) AS reasons
  FROM base
)
SELECT * FROM flagged WHERE array_length(reasons, 1) > 0;

GRANT SELECT ON flagged_ratings TO authenticated;

-- ----------------------------------------------------------------------------
-- Pares que trocam "vendido" entre si mais de uma vez.
-- Compra/venda repetida entre o MESMO par de contas é incomum organicamente
-- (estranhos raramente voltam a negociar repetidamente) — sinal forte de
-- conluio, independente de qual nota cada um deu.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW repeated_trade_pairs AS
SELECT
  LEAST(m.author_id, m.buyer_id)    AS user_a,
  GREATEST(m.author_id, m.buyer_id) AS user_b,
  pa.name AS user_a_name,
  pb.name AS user_b_name,
  COUNT(*) AS trade_count,
  ARRAY_AGG(m.id ORDER BY m.sold_at)   AS listing_ids,
  ARRAY_AGG(m.name ORDER BY m.sold_at) AS listing_names,
  MIN(m.sold_at) AS first_trade_at,
  MAX(m.sold_at) AS last_trade_at
FROM marketplace m
LEFT JOIN profiles pa ON pa.id = LEAST(m.author_id, m.buyer_id)
LEFT JOIN profiles pb ON pb.id = GREATEST(m.author_id, m.buyer_id)
WHERE m.status = 'sold' AND m.author_id IS NOT NULL AND m.buyer_id IS NOT NULL
GROUP BY LEAST(m.author_id, m.buyer_id), GREATEST(m.author_id, m.buyer_id), pa.name, pb.name
HAVING COUNT(*) > 1;

GRANT SELECT ON repeated_trade_pairs TO authenticated;

-- ----------------------------------------------------------------------------
-- Contas novas com velocidade alta de avaliação: já avaliaram 2+ pessoas
-- diferentes nos primeiros 7 dias de conta. Uma avaliação isolada de conta
-- nova (já coberta por 'new_account_rater' em flagged_ratings) é normal;
-- várias avaliações em sequência logo na criação da conta é padrão de farm.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW new_account_raters AS
SELECT
  r.from_id,
  p.name AS rater_name,
  p.created_at AS account_created_at,
  COUNT(*) AS ratings_given,
  ARRAY_AGG(r.to_id)   AS rated_user_ids,
  ARRAY_AGG(pt.name)   AS rated_user_names,
  ARRAY_AGG(r.stars)   AS stars_given,
  MIN(r.created_at) AS first_rating_at,
  MAX(r.created_at) AS last_rating_at
FROM ratings r
JOIN profiles p ON p.id = r.from_id
LEFT JOIN profiles pt ON pt.id = r.to_id
WHERE r.stars IS NOT NULL
  AND r.created_at - p.created_at < INTERVAL '7 days'
GROUP BY r.from_id, p.name, p.created_at
HAVING COUNT(*) >= 2;

GRANT SELECT ON new_account_raters TO authenticated;

-- ============================================================================
-- Próximos passos possíveis (não implementados ainda, decisão de produto):
--   - Fricção de tempo: exigir que um anúncio fique visível X horas antes de
--     poder ser marcado como vendido (dificulta ciclo rápido criar→vender→
--     avaliar entre contas colaborando).
--   - Limite de velocidade reforçado no banco (não só detecção): bloquear via
--     trigger mais de N avaliações/dia por usuário.
--   - Idade mínima de conta antes de poder publicar/avaliar.
--   - Correlação de IP/dispositivo entre contas (precisa de infraestrutura
--     extra de captura, não coberto aqui).
--   - Ponderar a nota pública pela idade/verificação da conta que avaliou.
-- ============================================================================
