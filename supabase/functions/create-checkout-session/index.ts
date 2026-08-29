// Creates a Stripe Checkout Session for the signed-in user.
//
// The plan/billing pair is resolved to a price through a lookup_key, never
// a hardcoded price id — sandbox and live have different ids, so this same
// code works in both without an edit.
//
// The referral discount is decided HERE, server-side, from the referrals
// table. The client only says which plan it wants; it cannot ask for a
// discount it isn't entitled to.
import Stripe from 'npm:stripe@17.7.0';

const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const SB_URL     = Deno.env.get('SUPABASE_URL')!;
const SB_SRK     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL    = Deno.env.get('APP_URL') || 'https://poolguyx.com';

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

    // ── What they asked for ──────────────────────────────────────────
    const { plan, billing } = await req.json().catch(() => ({}));
    if (!['pro', 'premium'].includes(plan))     return json({ error: 'invalid_plan' }, 400);
    if (!['monthly', 'annual'].includes(billing)) return json({ error: 'invalid_billing' }, 400);

    const lookupKey = `poolguyx_${plan}_${billing}`;
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    if (!prices.data.length) return json({ error: 'price_not_configured', lookupKey }, 500);
    const price = prices.data[0];

    // ── Reuse (or create) this person's Stripe customer ──────────────
    const profRes = await fetch(
      `${SB_URL}/rest/v1/profiles?id=eq.${uid}&select=stripe_customer_id,email,name`, { headers: sbHeaders });
    const profile = (await profRes.json())?.[0] || {};
    let customerId: string | null = profile.stripe_customer_id || null;

    if (customerId) {
      // A customer deleted in the Stripe dashboard would 404 the session.
      try {
        const c = await stripe.customers.retrieve(customerId);
        if ((c as any).deleted) customerId = null;
      } catch { customerId = null; }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email || undefined,
        name: profile.name || undefined,
        metadata: { supabase_user_id: uid },
      });
      customerId = customer.id;
      await fetch(`${SB_URL}/rest/v1/rpc/set_stripe_customer`, {
        method: 'POST', headers: sbHeaders,
        body: JSON.stringify({ p_user_id: uid, p_customer_id: customerId }),
      });
    }

    // ── Referral discount, decided from the database ─────────────────
    const refRes = await fetch(
      `${SB_URL}/rest/v1/referrals?referred_id=eq.${uid}&status=eq.pending&select=id`, { headers: sbHeaders });
    const hasPendingReferral = ((await refRes.json()) || []).length > 0;
    const discounts = hasPendingReferral
      ? [{ coupon: billing === 'monthly' ? 'referral_monthly_10' : 'referral_annual_5' }]
      : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      // Both are carried so the webhook can identify the buyer even if one
      // of them is missing on a given event shape.
      client_reference_id: uid,
      subscription_data: { metadata: { supabase_user_id: uid, plan, billing } },
      metadata: { supabase_user_id: uid, plan, billing },
      discounts,
      allow_promotion_codes: discounts ? undefined : true,
      success_url: `${APP_URL}/?checkout=success`,
      cancel_url: `${APP_URL}/?checkout=cancel`,
    });

    return json({ url: session.url, discounted: !!discounts });
  } catch (e) {
    console.error('[create-checkout-session]', e);
    return json({ error: 'server_error', message: String(e?.message || e) }, 500);
  }
});
