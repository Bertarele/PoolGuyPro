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

  const { job } = await req.json();
  if (!job?.city || !job?.day_of_week) return new Response('missing fields', { status: 400 });

  const headers = {
    'apikey': SB_SRK,
    'Authorization': `Bearer ${SB_SRK}`,
    'Content-Type': 'application/json',
  };

  // Find all users who have this city on this day_of_week
  const profilesRes = await fetch(`${SB_URL}/rest/v1/profiles?select=id,name,regions_by_day`, { headers });
  const profiles: any[] = await profilesRes.json();

  const matching = profiles.filter(p => {
    const rbd = p.regions_by_day;
    if (!rbd) return false;
    const dayCities: string[] = rbd[job.day_of_week] || [];
    return dayCities.includes(job.city);
  });

  if (!matching.length) {
    return new Response(JSON.stringify({ sent: 0, matched: 0 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const matchingIds = matching.map(p => p.id);

  // Get push subscriptions for matching users
  const subRes = await fetch(
    `${SB_URL}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth,user_id&user_id=in.(${matchingIds.map(id=>`"${id}"`).join(',')})`,
    { headers }
  );
  const subs: any[] = await subRes.json();

  const dayLabel = DAY_LABELS[job.day_of_week] || job.day_of_week;
  const title = `💧 Piscina em ${job.city}`;
  const body  = `${dayLabel} · ${job.pools_count ?? 1} piscina${(job.pools_count??1)>1?'s':''} · ${job.price_per_pool ? `$${job.price_per_pool}/piscina` : 'Negociável'}`;
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

  // ── 2. Create in-app notifications for matching users (skip poster) ──
  const toNotify = matching.filter(p => p.id !== job.poster_id);
  if (toNotify.length > 0) {
    await Promise.allSettled(toNotify.map(p =>
      fetch(`${SB_URL}/rest/v1/notifications`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          user_id: p.id,
          type:    'quick_pool_new',
          title,
          body,
          link_id: null,
          read:    false,
        }),
      })
    ));
  }

  return new Response(JSON.stringify({ sent, matched: matching.length }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
});
