import Stripe from "stripe";

let stripe: Stripe | null = null;

/** Returns a Stripe client, or null if STRIPE_SECRET_KEY isn't configured yet. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export const PLATFORM_FEE_RATE = 0.1; // 10%, kept in sync with lib/actions/bookings.ts
