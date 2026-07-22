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

  const headers = {
    'apikey': SB_SRK,
    'Authorization': `Bearer ${SB_SRK}`,
    'Content-Type': 'application/json',
  };

  // ── Require a valid signed-in caller ──────────────────────────────
  // Without this, anyone on the internet could POST arbitrary title/body to any
  // user_id and deliver a native phishing push. We only accept requests carrying
  // a valid Supabase user JWT.
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

  const { user_id, title, body, url, notif_type, convo_id } = await req.json();
  if (!user_id || !title) return new Response('missing fields', { status: 400 });

  // Harden attacker-controlled fields: an authenticated user can invoke this to
  // push ANY user_id, so never let them deliver an external click target (which
  // the service worker would openWindow → phishing) or oversized text.
  const safeUrl = (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) ? url : '/';
  const safeTitle = String(title).slice(0, 120);
  const safeBody  = String(body || '').slice(0, 300);

  // Check user notification preferences, and whether they're already looking at
  // this exact conversation, before sending
  if (notif_type) {
    const prefRes = await fetch(
      `${SB_URL}/rest/v1/profiles?select=notif_prefs,active_conversation_id,active_conversation_set_at&id=eq.${user_id}&limit=1`,
      { headers }
    );
    const [prof] = await prefRes.json();
    const prefs = prof?.notif_prefs;
    if (prefs && prefs[notif_type] === false) {
      return new Response(JSON.stringify({ sent: 0, reason: 'disabled by user' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    // The client stamps active_conversation_set_at and refreshes it every 30s
    // while the chat is open, clearing both fields on a clean close. If the
    // app gets force-closed instead, that cleanup never runs — only trust the
    // flag while the stamp is fresh (~90s) so a stuck value can't silently
    // suppress every future push for that conversation forever.
    const isFresh = prof?.active_conversation_set_at
      && (Date.now() - new Date(prof.active_conversation_set_at).getTime()) < 90_000;
    if (notif_type === 'chat' && convo_id && prof?.active_conversation_id === convo_id && isFresh) {
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
  const deadEndpoints: string[] = [];
  await Promise.allSettled(subs.map(async sub => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title: safeTitle, body: safeBody, url: safeUrl, icon: '/icone.png', badge: '/icone.png', vibrate: [150, 80, 150] }),
        // TTL: how long the push service should keep retrying delivery to an
        // offline/unreachable device before giving up. Left unset this defaults
        // to 0 on some services, which silently drops the push for anyone not
        // immediately reachable — exactly the "works in foreground, never
        // arrives when the app is closed" symptom. urgency:high asks iOS/APNs
        // to wake the device rather than coalesce/defer it.
        { TTL: 60 * 60 * 24 * 3, urgency: 'high' }
      );
      sent++;
    } catch(e: any) {
      console.error('Push error:', e);
      // 404/410 = the push service has permanently discarded this subscription
      // (uninstalled, permission revoked, endpoint rotated) — stop retrying it.
      if (e?.statusCode === 404 || e?.statusCode === 410) deadEndpoints.push(sub.endpoint);
    }
  }));

  if (deadEndpoints.length > 0) {
    fetch(`${SB_URL}/rest/v1/push_subscriptions?endpoint=in.(${deadEndpoints.map(e => `"${e}"`).join(',')})`, {
      method: 'DELETE', headers,
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ sent, attempted: subs.length, pruned: deadEndpoints.length }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
});
