-- There was no self-serve way to cancel a subscription at all. The only
-- existing call to stripe.subscriptions.cancel() is inside the
-- charge.refunded handler — an immediate, full cancellation triggered BY a
-- refund, which is correct there (money left, access should leave with it)
-- but wrong as the general cancel path: a user who decides to stop paying
-- should keep what they already paid for until the period they paid for
-- actually ends, with nothing refunded — the standard behavior almost every
-- subscription app uses (Stripe's own `cancel_at_period_end`).
--
-- tier_cancel_at is display-only: NULL means no cancellation is scheduled;
-- a timestamp means the subscription will end (and access revert to free)
-- at that moment unless the user resumes it first. It never gates access by
-- itself — the existing customer.subscription.deleted handler is still the
-- only thing that ever downgrades a tier, firing exactly once, the moment
-- Stripe actually finalizes the cancellation at period end. This column
-- only lets the profile screen say "access until <date>" without calling
-- Stripe live on every page view.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier_cancel_at timestamptz;
