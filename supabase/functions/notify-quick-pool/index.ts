import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SB_URL        = Deno.env.get('SUPABASE_URL')!;
const SB_SRK        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:felipelwo@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

const DAY_LABELS: Record<string, string> = {
  mon:'Segunda', tue:'Terça', wed:'Quarta', thu:'Quinta', fri:'Sexta', sat:'Sábado', sun:'Domingo'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, {
    headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*' }
  });

  const headers = {
    'apikey': SB_SRK,
    'Authorization': `Bearer ${SB_SRK}`,
    'Content-Type': 'application/json',
  };

  // ── Require a valid signed-in caller ──────────────────────────────
  // Prevents anonymous abuse: without this anyone could blast a push + in-app
  // notification to every user matching a city/day by POSTing a fake job.
  const callerToken = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!callerToken) return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
  const whoRes = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { 'apikey': SB_SRK, 'Authorization': `Bearer ${callerToken}` },
  });
  if (!whoRes.ok) return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
  const caller = await whoRes.json();

  const { job } = await req.json();
  if (!job?.city || !job?.day_of_week) return new Response('missing fields', { status: 400 });

  // The caller may only trigger notifications for a job they actually posted —
  // stops one user spamming a city under someone else's name.
  if (job.poster_id && caller?.id && job.poster_id !== caller.id) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // ── Anti-spam throttle ─────────────────────────────────────────────
  // Nothing stops a poster from deleting+reposting the same job, or making a
  // trivial edit and "publishing" again, purely to re-blast a notification.
  // One cooldown per poster, shared by every Quick Pools/Rotas Rápidas post,
  // is far more robust than trying to detect "is this basically the same
  // content" — enforced here (the single chokepoint every posting path
  // already calls through) rather than trusted to the client.
  const NOTIFY_COOLDOWN_MS = 15 * 60 * 1000;
  const callerProfileRes = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${caller.id}&select=last_qp_notified_at`, { headers });
  const callerProfileRows = await callerProfileRes.json();
  const lastNotifiedAt = callerProfileRows?.[0]?.last_qp_notified_at ? new Date(callerProfileRows[0].last_qp_notified_at).getTime() : 0;
  const msSinceLast = Date.now() - lastNotifiedAt;
  if (msSinceLast < NOTIFY_COOLDOWN_MS) {
    return new Response(JSON.stringify({
      sent: 0, matched: 0, throttled: true,
      retryAfterSeconds: Math.ceil((NOTIFY_COOLDOWN_MS - msSinceLast) / 1000),
    }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  // Rotas Rápidas can span more than one city (each pool has its own address/
  // city) — job.cities carries the full list when present; every other job
  // shape is still just the single job.city.
  const jobCities: string[] = Array.isArray(job.cities) && job.cities.length > 0 ? job.cities : [job.city];

  // Find all users who have any of this job's cities on this day_of_week
  const profilesRes = await fetch(`${SB_URL}/rest/v1/profiles?select=id,name,regions_by_day,is_online,last_seen`, { headers });
  const profiles: any[] = await profilesRes.json();

  const matching = profiles.filter(p => {
    if (p.id === job.poster_id) return false; // never notify the poster about their own job
    const rbd = p.regions_by_day;
    if (!rbd) return false;
    const dayCities: string[] = rbd[job.day_of_week] || [];
    return jobCities.some(c => dayCities.includes(c));
  });

  // Every call that gets this far (even a zero-match one) consumes the
  // cooldown window — it's still one "notification attempt" by this poster.
  await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${caller.id}`, {
    method: 'PATCH', headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ last_qp_notified_at: new Date().toISOString() }),
  }).catch(() => {});

  if (!matching.length) {
    return new Response(JSON.stringify({ sent: 0, matched: 0 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const matchingIds = matching.map(p => p.id);

  // Users with the app genuinely open right now get the in-app "ride request"
  // alert (client-side poll, see app.jsx) instead — an OS push on top would be
  // redundant. is_online is a heartbeat (see app.jsx's presence effect), so
  // gate on last_seen freshness too: a stale "online" flag from a crashed tab
  // must not silently swallow the only notification that would reach them.
  const ONLINE_FRESHNESS_MS = 60_000;
  const onlineIds = new Set(
    profiles
      .filter(p => p.is_online && p.last_seen && (Date.now() - new Date(p.last_seen).getTime()) < ONLINE_FRESHNESS_MS)
      .map(p => p.id)
  );
  const pushTargetIds = matchingIds.filter(id => !onlineIds.has(id));

  // Get push subscriptions for matching users who aren't currently online
  const subs: any[] = pushTargetIds.length ? await (async () => {
    const subRes = await fetch(
      `${SB_URL}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth,user_id&user_id=in.(${pushTargetIds.map(id=>`"${id}"`).join(',')})`,
      { headers }
    );
    return subRes.json();
  })() : [];

  const dayLabel = DAY_LABELS[job.day_of_week] || job.day_of_week;
  const isRoute = !!job.source_route_id;
  const citiesLabel = jobCities.slice(0, 2).join(', ') + (jobCities.length > 2 ? ` +${jobCities.length - 2}` : '');
  const title = isRoute ? `🚨 Rota disponível em ${citiesLabel}` : `💧 Piscina em ${job.city}`;
  const payLabel = job.split_taker_pct ? `${job.split_taker_pct}/${100 - job.split_taker_pct} split` : (job.price_per_pool ? `$${job.price_per_pool}/piscina` : 'Negociável');
  const body  = `${dayLabel} · ${job.pools_count ?? 1} piscina${(job.pools_count??1)>1?'s':''} · ${payLabel}`;
  const url   = `/#quick?job=${job.id}`;

  // ── 1. Send push notifications ──────────────────────────────────
  let sent = 0;
  await Promise.allSettled(subs.map(async sub => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url, icon: '/icone.png', badge: '/icone.png', vibrate: [100,60,100] })
      );
      sent++;
    } catch(e) {
      console.error('Push send error:', e);
    }
  }));

  // ── 2. Create in-app notifications for matching users (poster already excluded above) ──
  if (matching.length > 0) {
    await Promise.allSettled(matching.map(p =>
      fetch(`${SB_URL}/rest/v1/notifications`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          user_id: p.id,
          type:    'quick_pool_new',
          title,
          body,
          link_id: String(job.id || ''),
          read:    false,
        }),
      })
    ));
  }

  return new Response(JSON.stringify({ sent, matched: matching.length }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
});
