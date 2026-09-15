// Lets a signed-in user cancel their own subscription (or undo a pending
// cancellation) — the self-serve path that didn't exist before this. It
// never issues a refund and never ends access immediately: it only sets
// Stripe's cancel_at_period_end, so billing stops but the period already
// paid for runs out normally, same as Netflix/Spotify/any mainstream
// subscription app. The actual tier downgrade still happens exactly where
// it already did — the customer.subscription.deleted webhook handler, which
// only fires once Stripe finalizes the cancellation at the period's end —
// this function never touches profiles.tier.
//
// tier_cancel_at is written here too (not just left to the webhook) so the
// UI reflects the change immediately instead of waiting on webhook latency;
// the webhook's own sync of the same field on customer.subscription.updated
// is what keeps it correct if this direct write is ever missed.
import Stripe from 'npm:stripe@17.7.0';

const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const SB_URL     = Deno.env.get('SUPABASE_URL')!;
const SB_SRK     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(STRIPE_KEY, { httpClient: Stripe.createFetchHttpClient() });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const sbHeaders = { apikey: SB_SRK, Authorization: `Bearer ${SB_SRK}`, 'Content-Type': 'application/json' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'method_not_allowed' }, 405);

  try {
    // ── Who is calling ───────────────────────────────────────────────
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ error: 'unauthorized' }, 401);
    const whoRes = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_SRK, Authorization: `Bearer ${token}` },
    });
    if (!whoRes.ok) return json({ error: 'unauthorized' }, 401);
    const user = await whoRes.json();
    const uid: string = user?.id;
    if (!uid) return json({ error: 'unauthorized' }, 401);

    const { action } = await req.json().catch(() => ({}));
    if (!['cancel', 'resume'].includes(action)) return json({ error: 'invalid_action' }, 400);

    // ── Find their Stripe customer + active subscription ─────────────
    const profRes = await fetch(
      `${SB_URL}/rest/v1/profiles?id=eq.${uid}&select=stripe_customer_id`, { headers: sbHeaders });
    const customerId: string | null = (await profRes.json())?.[0]?.stripe_customer_id || null;
    if (!customerId) return json({ error: 'no_subscription' }, 400);

    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 5 });
    // Each PoolGuyX user has at most one active subscription (same
    // assumption the stripe-webhook refund handler already makes).
    const sub = subs.data[0];
    if (!sub) return json({ error: 'no_subscription' }, 400);

    const updated = await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: action === 'cancel',
    });
    const cancelAt = updated.cancel_at ? new Date(updated.cancel_at * 1000).toISOString() : null;

    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${uid}`, {
      method: 'PATCH', headers: { ...sbHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({ tier_cancel_at: cancelAt }),
    });

    return json({ ok: true, cancel_at: cancelAt });
  } catch (e) {
    console.error('[manage-subscription]', e);
    return json({ error: 'server_error', message: String(e?.message || e) }, 500);
  }
});
