// Stripe webhook — the ONLY thing in production that credits a wallet.
//
// Must be deployed with --no-verify-jwt: Stripe sends no Supabase JWT, so
// the platform's default JWT check would reject every event before this
// code runs (silently, from Stripe's point of view just a 401). Auth here
// is the Stripe signature instead, which is strictly stronger for this
// purpose — it proves the payload came from Stripe and wasn't tampered
// with, which a JWT could not.
import Stripe from 'npm:stripe@17.7.0';

const STRIPE_KEY    = Deno.env.get('STRIPE_SECRET_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SB_URL        = Deno.env.get('SUPABASE_URL')!;
const SB_SRK        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(STRIPE_KEY, { httpClient: Stripe.createFetchHttpClient() });
const sbHeaders = { apikey: SB_SRK, Authorization: `Bearer ${SB_SRK}`, 'Content-Type': 'application/json' };

async function rpc(fn: string, args: Record<string, unknown>) {
  const res = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST', headers: sbHeaders, body: JSON.stringify(args),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${fn} failed ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}

// Resolves the buyer to a Supabase user id. Metadata is set by
// create-checkout-session; the customer lookup is the fallback for
// subscriptions created any other way (e.g. from the Stripe dashboard).
async function resolveUserId(sub: Stripe.Subscription, session?: Stripe.Checkout.Session): Promise<string | null> {
  const fromMeta = sub.metadata?.supabase_user_id || session?.metadata?.supabase_user_id || session?.client_reference_id;
  if (fromMeta) return String(fromMeta);
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  if (!customerId) return null;
  const res = await fetch(
    `${SB_URL}/rest/v1/profiles?stripe_customer_id=eq.${customerId}&select=id`, { headers: sbHeaders });
  const rows = await res.json();
  return rows?.[0]?.id ?? null;
}

// plan/billing come from the price's own metadata, so the catalogue stays
// the single source of truth and this function never guesses from amounts.
function planFromSubscription(sub: Stripe.Subscription) {
  const price = sub.items?.data?.[0]?.price;
  const plan = price?.metadata?.plan ?? sub.metadata?.plan;
  const billing = price?.metadata?.billing ?? sub.metadata?.billing
    ?? (price?.recurring?.interval === 'year' ? 'annual' : 'monthly');
  return { plan, billing };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('missing signature', { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, WEBHOOK_SECRET);
  } catch (e) {
    console.error('[stripe-webhook] bad signature:', e?.message);
    return new Response('invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;
        const sub = await stripe.subscriptions.retrieve(
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id,
          { expand: ['items.data.price'] },
        );
        const userId = await resolveUserId(sub, session);
        const { plan, billing } = planFromSubscription(sub);
        if (!userId || !plan || !billing) {
          console.error('[stripe-webhook] cannot resolve purchase', { userId, plan, billing, event: event.id });
          break;
        }
        // event.id is the idempotency key: Stripe reuses it on retries, so
        // a redelivered event can never pay a second commission.
        const result = await rpc('confirm_subscription', {
          p_user_id: userId, p_plan: plan, p_billing: billing,
          p_source: 'stripe_webhook', p_external_id: event.id,
        });
        console.log('[stripe-webhook] confirmed', event.id, JSON.stringify(result));
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(sub);
        if (!userId) break;
        console.log('[stripe-webhook] cancelled', await rpc('cancel_subscription', {
          p_user_id: userId, p_source: 'stripe_webhook',
        }));
        break;
      }

      case 'customer.subscription.updated': {
        // Only acts on a subscription that has actually lapsed. `canceled`
        // arrives as its own deleted event; this catches unpaid/incomplete
        // expiry, where access should stop but no deletion event fires.
        const sub = event.data.object as Stripe.Subscription;
        if (!['unpaid', 'incomplete_expired'].includes(sub.status)) break;
        const userId = await resolveUserId(sub);
        if (!userId) break;
        await rpc('cancel_subscription', { p_user_id: userId, p_source: 'stripe_webhook' });
        break;
      }
    }
  } catch (e) {
    // 500 makes Stripe retry with the same event.id, which confirm_subscription
    // already de-duplicates — safe to fail loudly here.
    console.error('[stripe-webhook] handler error', event.type, e);
    return new Response('handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
