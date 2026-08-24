// Runs daily via pg_cron — two things:
//   1. "kind=today"  → the pool guy's scheduled coverage day has arrived, remind
//      them to do the pools and submit photos.
//   2. "kind=missed" → the scheduled day was yesterday and pool_guy_done is
//      still false — warn them that an unresolved no-show risks a penalty if
//      the owner reports it. Fires exactly once per missed day (the SQL
//      function only matches yesterday, so it naturally stops matching once
//      another day passes — no extra "already warned" tracking needed).
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SB_URL        = Deno.env.get('SUPABASE_URL')!;
const SB_SRK        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:felipelwo@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

const headers = { 'apikey': SB_SRK, 'Authorization': `Bearer ${SB_SRK}`, 'Content-Type': 'application/json' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*' } });

  const dueRes = await fetch(`${SB_URL}/rest/v1/rpc/get_due_vacation_completions`, {
    method: 'POST', headers, body: '{}',
  });
  const due: { app_id: string; applicant_id: string; author_id: string; vac_id: string; owner_name: string; day: number; kind: 'today' | 'missed' }[] = await dueRes.json();
  if (!Array.isArray(due) || due.length === 0) return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } });

  let sent = 0;
  for (const row of due) {
    const isToday = row.kind === 'today';
    const title = isToday
      ? { en: '📅 Coverage day is today', pt: '📅 Hoje é o dia da cobertura', es: '📅 Hoy es el día de cobertura' }
      : { en: '⚠️ Missed coverage day', pt: '⚠️ Dia de cobertura perdido', es: '⚠️ Día de cobertura perdido' };
    const body = isToday
      ? {
          en: `Today's the day to cover ${row.owner_name || 'the'}'s pools — do the work and submit your photos.`,
          pt: `Hoje é o dia de cobrir as piscinas de ${row.owner_name || ''} — faça o serviço e envie as fotos.`,
          es: `Hoy es el día de cubrir las piscinas de ${row.owner_name || ''} — haz el trabajo y envía las fotos.`,
        }
      : {
          en: `You didn't submit photos for your scheduled day. If ${row.owner_name || 'the owner'} reports it, you may face a penalty. Submit now if you completed it.`,
          pt: `Você não enviou as fotos do seu dia agendado. Se ${row.owner_name || 'o dono'} reportar, você pode receber uma penalidade. Envie agora se já concluiu.`,
          es: `No enviaste las fotos de tu día programado. Si ${row.owner_name || 'el dueño'} lo reporta, podrías recibir una penalización. Envíalas ahora si ya lo hiciste.`,
        };

    // In-app notification (always, so the bell shows history even without push)
    await fetch(`${SB_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify([{
        user_id: row.applicant_id,
        type: isToday ? 'vacation_day_today' : 'vacation_day_missed',
        title: JSON.stringify(title), body: JSON.stringify(body),
        link_id: row.vac_id, read: false,
      }]),
    });

    // Push
    const subRes = await fetch(`${SB_URL}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth&user_id=eq.${row.applicant_id}`, { headers });
    const subs: any[] = await subRes.json();
    await Promise.allSettled((subs || []).map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: title.pt, body: body.pt, url: '/#work', icon: '/icone.png', badge: '/icone.png', vibrate: [150, 80, 150] }),
          { TTL: 60 * 60 * 24, urgency: 'high' }
        );
        sent++;
      } catch {}
    }));
  }

  return new Response(JSON.stringify({ sent, rows: due.length }), { headers: { 'Content-Type': 'application/json' } });
});
