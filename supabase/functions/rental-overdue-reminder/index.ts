// Runs daily via pg_cron — chases rentals that are past their return date.
//
// Nothing used to react when end_date passed. The return-by badge rendered the
// same calm amber forever, there was no reminder of any kind, and the only way
// an unreturned item got noticed was the owner happening to reopen the listing.
// The whole "pool guy didn't give it back" case depended on the owner's memory.
//
// Both sides are told, on purpose: the renter usually just forgot, and telling
// only the owner turns an oversight into a dispute. The owner is told too so
// they know it is late without having to check, and can report if it stays out.
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SB_URL        = Deno.env.get('SUPABASE_URL')!;
const SB_SRK        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:felipelwo@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*' } });
  }

  const headers = { apikey: SB_SRK, Authorization: `Bearer ${SB_SRK}`, 'Content-Type': 'application/json' };
  const today   = new Date().toISOString().slice(0, 10);
  // Re-nag every 3 days rather than daily: a daily push about the same item is
  // how people turn notifications off altogether.
  const throttle = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(
    `${SB_URL}/rest/v1/rental_requests?select=id,listing_id,listing_name,owner_id,requester_id,requester_name,end_date` +
    `&status=eq.approved&end_date=lt.${today}` +
    `&or=(overdue_reminder_at.is.null,overdue_reminder_at.lte.${throttle})`,
    { headers },
  );
  const rentals: any[] = await res.json();
  if (!Array.isArray(rentals) || !rentals.length) {
    return new Response(JSON.stringify({ overdue: 0, sent: 0 }), { headers: { 'Content-Type': 'application/json' } });
  }

  let sent = 0;

  const notify = async (userId: string, title: any, body: any, url: string, type: string, linkId: string | null) => {
    if (!userId) return;
    await fetch(`${SB_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify([{ user_id: userId, type, title: JSON.stringify(title), body: JSON.stringify(body), link_id: linkId }]),
    });
    const subRes = await fetch(
      `${SB_URL}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth&user_id=eq.${userId}`, { headers });
    const subs: any[] = await subRes.json();
    await Promise.allSettled((subs || []).map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: title.pt, body: body.pt, url, icon: '/icone.png', badge: '/icone.png', vibrate: [100, 60, 100] }),
          { TTL: 60 * 60 * 24 * 2, urgency: 'normal' },
        );
        sent++;
      } catch {}
    }));
  };

  for (const r of rentals) {
    const days = Math.max(1, Math.floor((Date.now() - new Date(r.end_date + 'T23:59:59').getTime()) / 86400000));
    const name = r.listing_name || 'o item';
    const link = `/#market?listing=${r.listing_id || ''}`;

    await notify(r.requester_id,
      { en: 'Rental overdue', pt: 'Devolução atrasada', es: 'Devolución atrasada' },
      { en: `"${name}" was due ${days} day(s) ago. Please arrange the return with the owner.`,
        pt: `"${name}" venceu há ${days} dia(s). Combine a devolução com o dono.`,
        es: `"${name}" venció hace ${days} día(s). Coordina la devolución con el dueño.` },
      link, 'rental_overdue', r.listing_id || null);

    await notify(r.owner_id,
      { en: 'Item not returned yet', pt: 'Item ainda não devolvido', es: 'Artículo aún no devuelto' },
      { en: `"${name}" is ${days} day(s) overdue with ${r.requester_name || 'the renter'}. You can report a problem from the listing.`,
        pt: `"${name}" está ${days} dia(s) atrasado com ${r.requester_name || 'o locatário'}. Você pode reportar um problema pelo anúncio.`,
        es: `"${name}" está ${days} día(s) atrasado con ${r.requester_name || 'el arrendatario'}. Puedes reportar un problema desde el anuncio.` },
      link, 'rental_overdue', r.listing_id || null);

    await fetch(`${SB_URL}/rest/v1/rental_requests?id=eq.${r.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ overdue_reminder_at: new Date().toISOString() }),
    });
  }

  return new Response(JSON.stringify({ overdue: rentals.length, sent }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
