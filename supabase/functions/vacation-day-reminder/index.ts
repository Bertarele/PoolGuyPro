// Runs daily via pg_cron — reminds an accepted pool guy about an upcoming
// vacation-coverage day, then warns them if it slips by unfinished:
//   "in_2_days" / "in_1_day" → heads-up while there's still time to plan.
//   "today"                  → the day has arrived, go do it and submit photos.
//   "missed"                 → the day was yesterday and pool_guy_done is still
//      false — warn that an unresolved no-show risks a penalty if the owner
//      reports it. Each kind only ever matches its exact day offset (see
//      get_due_vacation_completions), so every stage fires exactly once per
//      scheduled day with no extra "already warned" tracking needed.
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SB_URL        = Deno.env.get('SUPABASE_URL')!;
const SB_SRK        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:felipelwo@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

const headers = { 'apikey': SB_SRK, 'Authorization': `Bearer ${SB_SRK}`, 'Content-Type': 'application/json' };

type Kind = 'in_2_days' | 'in_1_day' | 'today' | 'missed';

function messagesFor(kind: Kind, ownerName: string) {
  const owner = ownerName || '';
  switch (kind) {
    case 'in_2_days':
      return {
        title: { en: '📅 Coverage in 2 days', pt: '📅 Cobertura em 2 dias', es: '📅 Cobertura en 2 días' },
        body: {
          en: `In 2 days you're covering ${owner || 'a'} pool route — just a heads-up so you can plan ahead.`,
          pt: `Em 2 dias você vai cobrir a rota de piscinas de ${owner} — é só um aviso pra você se organizar.`,
          es: `En 2 días cubrirás la ruta de piscinas de ${owner} — es solo un aviso para que te organices.`,
        },
        notifType: 'vacation_day_reminder',
      };
    case 'in_1_day':
      return {
        title: { en: '📅 Coverage is tomorrow', pt: '📅 Cobertura é amanhã', es: '📅 Cobertura es mañana' },
        body: {
          en: `Tomorrow's the day to cover ${owner || 'the'} pools — don't forget.`,
          pt: `Amanhã é o dia de cobrir as piscinas de ${owner} — não esqueça.`,
          es: `Mañana es el día de cubrir las piscinas de ${owner} — no lo olvides.`,
        },
        notifType: 'vacation_day_reminder',
      };
    case 'today':
      return {
        title: { en: '📅 Coverage day is today', pt: '📅 Hoje é o dia da cobertura', es: '📅 Hoy es el día de cobertura' },
        body: {
          en: `Today's the day to cover ${owner || 'the'} pools — do the work and submit your photos.`,
          pt: `Hoje é o dia de cobrir as piscinas de ${owner} — faça o serviço e envie as fotos.`,
          es: `Hoy es el día de cubrir las piscinas de ${owner} — haz el trabajo y envía las fotos.`,
        },
        notifType: 'vacation_day_today',
      };
    case 'missed':
      return {
        title: { en: '⚠️ Missed coverage day', pt: '⚠️ Dia de cobertura perdido', es: '⚠️ Día de cobertura perdido' },
        body: {
          en: `You didn't submit photos for your scheduled day. If ${owner || 'the owner'} reports it, you may face a penalty. Submit now if you completed it.`,
          pt: `Você não enviou as fotos do seu dia agendado. Se ${owner || 'o dono'} reportar, você pode receber uma penalidade. Envie agora se já concluiu.`,
          es: `No enviaste las fotos de tu día programado. Si ${owner || 'el dueño'} lo reporta, podrías recibir una penalización. Envíalas ahora si ya lo hiciste.`,
        },
        notifType: 'vacation_day_missed',
      };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*' } });

  const dueRes = await fetch(`${SB_URL}/rest/v1/rpc/get_due_vacation_completions`, {
    method: 'POST', headers, body: '{}',
  });
  const due: { app_id: string; applicant_id: string; author_id: string; vac_id: string; owner_name: string; day: number; kind: Kind }[] = await dueRes.json();
  if (!Array.isArray(due) || due.length === 0) return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } });

  let sent = 0;
  for (const row of due) {
    const msg = messagesFor(row.kind, row.owner_name);
    if (!msg) continue;
    const { title, body, notifType } = msg;

    // In-app notification (always, so the bell shows history even without push)
    await fetch(`${SB_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify([{
        user_id: row.applicant_id,
        type: notifType,
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
