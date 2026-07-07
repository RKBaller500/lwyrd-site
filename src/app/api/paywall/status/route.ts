import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaywallAccountState } from "@/lib/paywallUnlocks";

function parseSubmissionId(request: NextRequest): string | null {
  const direct = request.nextUrl.searchParams.get("submissionId");
  if (direct) return direct;

  const next = request.nextUrl.searchParams.get("next");
  const match = next?.match(/^\/results\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const submissionId = parseSubmissionId(request);
  const state = await getPaywallAccountState(supabase, user.id, submissionId);

  return NextResponse.json({
    success: true,
    submissionId,
    ...state,
  });
}
