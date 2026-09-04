-- Feature-usage statistics for the admin panel's "Uso" tab.
--
-- This has to be an RPC rather than a set of client-side selects: the admin has
-- no read policy on messages, conversations, job_applications or saved_listings
-- (only the two participants of a conversation can read it), so querying them
-- from the panel would quietly return zero rows and draw an empty chart that
-- looks like real data. Going through SECURITY DEFINER also keeps it that way
-- on purpose — the panel gets counts and never message content, so answering
-- "what are pool guys using?" doesn't hand anyone the ability to read private
-- conversations.
--
-- Everything is derived from rows the app already writes; there is no event
-- tracking in this project, and adding some isn't a prerequisite for this.

CREATE OR REPLACE FUNCTION public.admin_usage_stats(p_days integer DEFAULT 90)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_from      timestamptz;
  v_prev_from timestamptz;
  v_out       jsonb;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_admin');
  END IF;

  p_days      := LEAST(GREATEST(COALESCE(p_days, 90), 7), 365);
  v_from      := now() - make_interval(days => p_days);
  v_prev_from := v_from - make_interval(days => p_days);

  WITH acts AS (
    -- Every user-initiated action the app records, flattened to
    -- (who, which feature, when). Several id columns are text rather than uuid,
    -- so they go through a shape check before casting — a malformed one becomes
    -- NULL and simply drops out of the distinct-user counts instead of raising.
    SELECT sender_id AS actor, 'messages' AS kind, created_at FROM messages
    UNION ALL SELECT CASE WHEN poster_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN poster_id::uuid END,
                     'quick_pools', created_at FROM quick_pool_jobs
    UNION ALL SELECT CASE WHEN applicant_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN applicant_id::uuid END,
                     'qp_applications', created_at FROM quick_pool_applications
    UNION ALL SELECT author_id,    'listings',         created_at FROM marketplace
    UNION ALL SELECT applicant_id, 'job_applications', created_at FROM job_applications
    UNION ALL SELECT author_id,    'jobs',             created_at FROM jobs
    UNION ALL SELECT requester_id, 'rentals',          created_at FROM rental_requests
    UNION ALL SELECT CASE WHEN owner_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN owner_id::uuid END,
                     'routes', created_at FROM quick_routes
    UNION ALL SELECT from_id,      'ratings',   created_at FROM ratings
    UNION ALL SELECT author_id,    'vacations', created_at FROM vacations
    UNION ALL SELECT CASE WHEN poster_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN poster_id::uuid END,
                     'handoffs', created_at FROM pool_handoffs
  ),
  cur  AS (SELECT * FROM acts WHERE created_at >= v_from),
  prev AS (SELECT * FROM acts WHERE created_at >= v_prev_from AND created_at < v_from),

  -- Ranking: how much each feature is actually used, and by how many distinct
  -- people (a single power user hammering one feature shouldn't read as broad
  -- adoption, so both numbers travel together).
  features AS (
    SELECT kind, count(*)::int AS n, count(DISTINCT actor)::int AS users
      FROM cur GROUP BY kind
  ),
  -- Weekly buckets for the trend. Weeks with no activity still need a column,
  -- so the series is generated and left-joined rather than grouped from rows.
  weeks AS (
    SELECT generate_series(date_trunc('week', v_from), date_trunc('week', now()), interval '1 week') AS wk
  ),
  weekly AS (
    SELECT w.wk,
           COALESCE(count(c.kind) FILTER (WHERE c.kind = 'messages'), 0)::int        AS messages,
           COALESCE(count(c.kind) FILTER (WHERE c.kind = 'quick_pools'), 0)::int     AS quick_pools,
           COALESCE(count(c.kind) FILTER (WHERE c.kind = 'qp_applications'), 0)::int AS qp_applications,
           COALESCE(count(c.kind) FILTER (WHERE c.kind = 'listings'), 0)::int        AS listings,
           COALESCE(count(c.kind) FILTER (WHERE c.kind NOT IN
             ('messages','quick_pools','qp_applications','listings')), 0)::int       AS other
      FROM weeks w
      LEFT JOIN cur c ON date_trunc('week', c.created_at) = w.wk
     GROUP BY w.wk
  ),
  -- Most active people, by number of actions. Named so the panel doesn't have
  -- to resolve uuids against its own users list.
  top_users AS (
    SELECT p.name, p.email, p.tier, count(*)::int AS actions,
           count(DISTINCT c.kind)::int AS features_used
      FROM cur c JOIN profiles p ON p.id = c.actor
     GROUP BY p.id, p.name, p.email, p.tier
     ORDER BY count(*) DESC
     LIMIT 8
  )
  SELECT jsonb_build_object(
    'ok', true,
    'range_days',   p_days,
    'generated_at', now(),
    'totals', jsonb_build_object(
      'actions',           (SELECT count(*)::int FROM cur),
      'actions_prev',      (SELECT count(*)::int FROM prev),
      'active_users',      (SELECT count(DISTINCT actor)::int FROM cur WHERE actor IS NOT NULL),
      'active_users_prev', (SELECT count(DISTINCT actor)::int FROM prev WHERE actor IS NOT NULL),
      'total_users',       (SELECT count(*)::int FROM profiles)
    ),
    'features', COALESCE((SELECT jsonb_agg(jsonb_build_object('key', kind, 'n', n, 'users', users)
                            ORDER BY n DESC) FROM features), '[]'::jsonb),
    'weekly',   COALESCE((SELECT jsonb_agg(jsonb_build_object(
                            'week', wk, 'messages', messages, 'quick_pools', quick_pools,
                            'qp_applications', qp_applications, 'listings', listings, 'other', other)
                            ORDER BY wk) FROM weekly), '[]'::jsonb),
    -- Marketplace category mix. Free-text column, so blanks collapse into one
    -- explicit "sem categoria" bucket instead of a nameless bar.
    'market_cats', COALESCE((
      SELECT jsonb_agg(x ORDER BY (x->>'n')::int DESC) FROM (
        SELECT jsonb_build_object('cat', COALESCE(NULLIF(btrim(cat), ''), '—'), 'n', count(*)::int) AS x
          FROM marketplace WHERE created_at >= v_from
         GROUP BY COALESCE(NULLIF(btrim(cat), ''), '—')
      ) s), '[]'::jsonb),
    -- Express Pools funnel. Each stage is a subset of the one above it, so the
    -- bars are monotone by construction: a completed job also counts as filled.
    'qp_funnel', (
      SELECT jsonb_build_object(
        'posted',    count(*)::int,
        'with_apps', count(*) FILTER (WHERE EXISTS (
                       SELECT 1 FROM quick_pool_applications a WHERE a.job_id = j.id))::int,
        'filled',    count(*) FILTER (WHERE j.status IN ('filled','completed'))::int,
        'completed', count(*) FILTER (WHERE j.status = 'completed')::int)
        FROM quick_pool_jobs j WHERE j.created_at >= v_from),
    'top_users', COALESCE((SELECT jsonb_agg(jsonb_build_object(
                    'name', name, 'email', email, 'tier', tier,
                    'actions', actions, 'features_used', features_used)) FROM top_users), '[]'::jsonb)
  ) INTO v_out;

  RETURN v_out;
END $function$;

REVOKE ALL ON FUNCTION public.admin_usage_stats(integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_usage_stats(integer) TO authenticated;
