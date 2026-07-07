import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import {
  UNLOCK_TIERS,
  userOwnsSubmission,
  type UnlockTierId,
} from "@/lib/paywallUnlocks";

const VALID_TIERS = new Set<UnlockTierId>(Object.keys(UNLOCK_TIERS) as UnlockTierId[]);

function parseSubmissionIdFromNext(next: unknown): string | null {
  if (typeof next !== "string") return null;
  const match = next.match(/^\/results\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest) {
  // Same-origin guard, matching the preview-unlock route.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tierId: UnlockTierId = VALID_TIERS.has(body?.tierId as UnlockTierId)
    ? (body.tierId as UnlockTierId)
    : "single";
  const submissionId: string | null =
    typeof body?.submissionId === "string"
      ? body.submissionId
      : parseSubmissionIdFromNext(body?.next);
  const tier = UNLOCK_TIERS[tierId];

  // If a submission is targeted, make sure this user actually owns it.
  if (submissionId) {
    const owned = await userOwnsSubmission(supabase, user.id, submissionId);
    if (!owned) {
      return NextResponse.json({ error: "Intake not found." }, { status: 400 });
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const returnPath = submissionId ? `/results/${submissionId}` : "/dashboard";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Intentionally no payment_method_types — enables dynamic payment methods.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: tier.priceCents,
            product_data: { name: `LWYRD — ${tier.name}` },
          },
        },
      ],
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        tierId,
        submissionId: submissionId ?? "",
      },
      success_url: `${siteUrl}${returnPath}?checkout=success`,
      cancel_url: `${siteUrl}${returnPath}?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start checkout." },
      { status: 400 }
    );
  }
}
