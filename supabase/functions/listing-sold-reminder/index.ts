// Runs daily via pg_cron — reminds sellers about marketplace "sell" listings
// that have been live for 15+ days (and every 15 days again after that) to
// ask whether the item sold and whether to keep the listing active.
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SB_URL         = Deno.env.get('SUPABASE_URL')!;
const SB_SRK          = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:felipelwo@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*' } });

  const headers = { 'apikey': SB_SRK, 'Authorization': `Bearer ${SB_SRK}`, 'Content-Type': 'application/json' };

  const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

  // Live sell listings posted 15+ days ago, never reminded or last reminded 15+ days ago.
  const listingsRes = await fetch(
    `${SB_URL}/rest/v1/marketplace?select=id,name,author_id&type=eq.sell&status=eq.approved` +
    `&created_at=lte.${cutoff}&or=(last_reminder_at.is.null,last_reminder_at.lte.${cutoff})`,
    { headers }
  );
  const listings: any[] = await listingsRes.json();
  if (!Array.isArray(listings) || !listings.length) {
    return new Response(JSON.stringify({ sent: 0, listings: 0 }), { headers: { 'Content-Type':'application/json' } });
  }

  let totalSent = 0;

  for (const listing of listings) {
    if (!listing.author_id) continue;

    const title = { en:'Still for sale?', pt:'Ainda está à venda?', es:'¿Sigue en venta?' };
    const body  = {
      en: `Did you already sell "${listing.name || 'your item'}"? Tap to mark it sold, or keep the listing active.`,
      pt: `Você já vendeu "${listing.name || 'seu item'}"? Toque para marcar como vendido, ou manter o anúncio ativo.`,
      es: `¿Ya vendiste "${listing.name || 'tu artículo'}"? Toca para marcarlo como vendido, o mantener el anuncio activo.`,
    };
    const url = `/#market?listing=${listing.id}`;

    // In-app notification (bell) — always created, independent of push subscription state.
    await fetch(`${SB_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify([{
        user_id: listing.author_id, type: 'listing_reminder',
        title: JSON.stringify(title), body: JSON.stringify(body),
        link_id: listing.id,
      }]),
    });

    // Push notification, if subscribed.
    const subRes = await fetch(
      `${SB_URL}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth&user_id=eq.${listing.author_id}`,
      { headers }
    );
    const subs: any[] = await subRes.json();
    await Promise.allSettled((subs || []).map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: title.pt, body: body.pt, url, icon: '/icone.png', badge: '/icone.png', vibrate: [100,60,100] }),
          { TTL: 60 * 60 * 24 * 3, urgency: 'normal' }
        );
        totalSent++;
      } catch {}
    }));

    // Mark as reminded so this listing isn't re-scanned again until the next 15-day window.
    await fetch(`${SB_URL}/rest/v1/marketplace?id=eq.${listing.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ last_reminder_at: new Date().toISOString() }),
    });
  }

  return new Response(JSON.stringify({ sent: totalSent, listings: listings.length }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
});
