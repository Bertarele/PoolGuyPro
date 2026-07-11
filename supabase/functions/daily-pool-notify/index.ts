// Runs daily at 7 AM via pg_cron — notifies pool guys for jobs scheduled today
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SB_URL        = Deno.env.get('SUPABASE_URL')!;
const SB_SRK        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:felipelwo@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*' } });

  const headers = { 'apikey': SB_SRK, 'Authorization': `Bearer ${SB_SRK}`, 'Content-Type': 'application/json' };

  // Find all jobs whose notify_at is today (between 7am and 8am local = UTC window)
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(6, 55, 0, 0);
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 0);

  // daily_notified_at guards against duplicate sends if this function is re-triggered
  // (cron misfire, manual retry, overlapping schedule) within the same day.
  const jobsRes = await fetch(
    `${SB_URL}/rest/v1/quick_pool_jobs?select=*&status=eq.open&notify_at=gte.${todayStart.toISOString()}&notify_at=lte.${todayEnd.toISOString()}&daily_notified_at=is.null`,
    { headers }
  );
  const jobs: any[] = await jobsRes.json();
  if (!jobs.length) return new Response(JSON.stringify({ sent: 0, jobs: 0 }), { headers: { 'Content-Type':'application/json' } });

  let totalSent = 0;

  for (const job of jobs) {
    // Get all profiles and find those with matching city+day — exclude the poster
    // themselves, they shouldn't be notified about their own job.
    const profilesRes = await fetch(`${SB_URL}/rest/v1/profiles?select=id,regions_by_day`, { headers });
    const profiles: any[] = await profilesRes.json();
    const matching = profiles.filter(p => {
      if (p.id === job.poster_id) return false;
      const rbd = p.regions_by_day;
      if (!rbd) return false;
      const dayCities: string[] = rbd[job.day_of_week] || [];
      return dayCities.includes(job.city);
    });
    // Mark this job as notified regardless of whether anyone matched, so it's never
    // re-scanned/re-sent on a later invocation the same day.
    await fetch(`${SB_URL}/rest/v1/quick_pool_jobs?id=eq.${job.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ daily_notified_at: new Date().toISOString() }),
    });
    if (!matching.length) continue;

    const matchIds = matching.map(p => p.id);
    const subRes = await fetch(
      `${SB_URL}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth&user_id=in.(${matchIds.map((id:string)=>`"${id}"`).join(',')})`,
      { headers }
    );
    const subs: any[] = await subRes.json();

    const title = `💧 Piscina hoje em ${job.city}`;
    const body  = `${job.pools_count} piscina${job.pools_count>1?'s':''} · ${job.price_per_pool ? `$${job.price_per_pool}/piscina` : 'Negociável'} · ${job.when_label || ''}`;
    const url   = `/#quick?job=${job.id}`;

    await Promise.allSettled(subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, url, icon: '/icone.png', badge: '/icone.png', vibrate: [100,60,100] })
        );
        totalSent++;
      } catch {}
    }));

    // Create in-app notifications so the bell shows history even without push
    if (matching.length > 0) {
      const rows = matching.map((p: any) => ({
        user_id: p.id, type: 'quick_pool_new', title, body,
        link_id: String(job.id), read: false,
      }));
      await fetch(`${SB_URL}/rest/v1/notifications`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify(rows),
      });
    }
  }

  return new Response(JSON.stringify({ sent: totalSent, jobs: jobs.length }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
});
