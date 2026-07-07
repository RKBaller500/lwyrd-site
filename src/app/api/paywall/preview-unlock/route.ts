import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPreviewUnlockDestination, previewUnlockCookieValue } from "@/lib/actions/intake";
import {
  grantPreviewUnlockPurchase,
  unlockIntakeWithExistingCredit,
  UNLOCK_TIERS,
  type UnlockTierId,
} from "@/lib/paywallUnlocks";

const VALID_TIERS = new Set<UnlockTierId>(Object.keys(UNLOCK_TIERS) as UnlockTierId[]);

function parseSubmissionIdFromNext(next: unknown): string | null {
  if (typeof next !== "string") return null;
  const match = next.match(/^\/results\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest) {
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

  let submissionId: string | null = null;
  let tierId: UnlockTierId = "single";
  let mode: "purchase" | "credit" = "purchase";
  try {
    const body = await request.json();
    submissionId = typeof body?.submissionId === "string" ? body.submissionId : parseSubmissionIdFromNext(body?.next);
    tierId = typeof body?.tierId === "string" && VALID_TIERS.has(body.tierId as UnlockTierId)
      ? (body.tierId as UnlockTierId)
      : "single";
    mode = body?.mode === "credit" ? "credit" : "purchase";
  } catch {
    // Request body is optional.
  }

  try {
    const state = mode === "credit"
      ? await unlockIntakeWithExistingCredit({ supabase, userId: user.id, submissionId: submissionId ?? "" })
      : await grantPreviewUnlockPurchase({ supabase, userId: user.id, submissionId, tierId });

    const destination = await getPreviewUnlockDestination(submissionId);
    const response = NextResponse.json({ success: true, mode, tierId, ...state, ...destination });
    if (submissionId && !destination.error) {
      response.cookies.set("lwyrd_preview_unlock", await previewUnlockCookieValue(submissionId), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to unlock this intake." },
      { status: 400 }
    );
  }
}
