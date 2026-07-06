import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const SB_URL        = Deno.env.get('SUPABASE_URL')!;
const SB_SRK        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

webpush.setVapidDetails('mailto:felipelwo@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }
  });

  const { user_id, title, body, url, notif_type, convo_id } = await req.json();
  if (!user_id || !title) return new Response('missing fields', { status: 400 });

  const headers = {
    'apikey': SB_SRK,
    'Authorization': `Bearer ${SB_SRK}`,
    'Content-Type': 'application/json',
  };

  // Check user notification preferences, and whether they're already looking at
  // this exact conversation, before sending
  if (notif_type) {
    const prefRes = await fetch(
      `${SB_URL}/rest/v1/profiles?select=notif_prefs,active_conversation_id&id=eq.${user_id}&limit=1`,
      { headers }
    );
    const [prof] = await prefRes.json();
    const prefs = prof?.notif_prefs;
    if (prefs && prefs[notif_type] === false) {
      return new Response(JSON.stringify({ sent: 0, reason: 'disabled by user' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    if (notif_type === 'chat' && convo_id && prof?.active_conversation_id === convo_id) {
      return new Response(JSON.stringify({ sent: 0, reason: 'viewing conversation' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  const subRes = await fetch(
    `${SB_URL}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth&user_id=eq.${user_id}`,
    { headers }
  );
  const subs: any[] = await subRes.json();

  if (!subs || subs.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no subscription' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  let sent = 0;
  await Promise.allSettled(subs.map(async sub => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body: body || '', url: url || '/', icon: '/icone.png', badge: '/icone.png', vibrate: [150, 80, 150] })
      );
      sent++;
    } catch(e) {
      console.error('Push error:', e);
    }
  }));

  return new Response(JSON.stringify({ sent }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
});
