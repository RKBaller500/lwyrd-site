import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { grantStripeUnlock, UNLOCK_TIERS, type UnlockTierId } from "@/lib/paywallUnlocks";

const VALID_TIERS = new Set<UnlockTierId>(Object.keys(UNLOCK_TIERS) as UnlockTierId[]);

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Signature verification requires the raw, unparsed request body.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only grant when the payment actually succeeded.
    if (session.payment_status === "paid") {
      const userId = session.metadata?.userId;
      const rawTier = session.metadata?.tierId;
      const submissionId = session.metadata?.submissionId || null;
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;

      if (userId && rawTier && VALID_TIERS.has(rawTier as UnlockTierId)) {
        try {
          await grantStripeUnlock({
            userId,
            submissionId,
            tierId: rawTier as UnlockTierId,
            stripeSessionId: session.id,
            paymentIntentId,
          });
        } catch (error) {
          console.error("[stripe webhook] grantStripeUnlock failed:", error);
          // Return 500 so Stripe retries delivery; grantStripeUnlock is idempotent.
          return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to grant unlock" },
            { status: 500 }
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
