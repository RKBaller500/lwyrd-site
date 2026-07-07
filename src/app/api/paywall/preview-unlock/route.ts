import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPreviewUnlockDestination, previewUnlockCookieValue } from "@/lib/actions/intake";

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
  try {
    const body = await request.json();
    submissionId = typeof body?.submissionId === "string" ? body.submissionId : null;
  } catch {
    // Request body is optional.
  }

  const destination = await getPreviewUnlockDestination(submissionId);
  const response = NextResponse.json({ success: true, ...destination });
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
}
