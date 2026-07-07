import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Lazily construct the Stripe client. Throws only when actually invoked (e.g. a
 * checkout or webhook request) — never at import/build time — so the rest of the
 * app (and the free preview-unlock flow) works even before STRIPE_SECRET_KEY is set.
 */
export function getStripe(): Stripe {
  if (cached) return cached;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set. Stripe payments are not configured yet.");
  }

  // Pin to a known API version so Stripe dashboard changes never silently alter behavior.
  cached = new Stripe(secretKey, { apiVersion: "2026-06-24.dahlia" });
  return cached;
}
