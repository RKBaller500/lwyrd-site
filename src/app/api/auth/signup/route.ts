import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";

type SignupRole = "client" | "firm";

const ALLOWED_ROLES = new Set<SignupRole>(["client", "firm"]);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeRole(role: unknown): SignupRole {
  return typeof role === "string" && ALLOWED_ROLES.has(role as SignupRole)
    ? (role as SignupRole)
    : "client";
}

async function upsertProfile(userId: string, name: string, role: SignupRole) {
  const baseProfile = {
    id: userId,
    role,
    is_admin: false,
    access_level: "none",
  };

  const variants: Array<Record<string, unknown>> = [
    { ...baseProfile, name, full_name: name, updated_at: new Date().toISOString() },
    { ...baseProfile, name, updated_at: new Date().toISOString() },
    { ...baseProfile, full_name: name, updated_at: new Date().toISOString() },
    { ...baseProfile, name, full_name: name },
    { ...baseProfile, name },
    { ...baseProfile, full_name: name },
  ];

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient();
      for (const profile of variants) {
        const { error } = await admin.from("profiles").upsert(profile, { onConflict: "id" });
        if (!error) return;
      }
    }
  } catch {
    // Auth account creation should not fail because profile backfill is unavailable.
  }
}

export async function POST(request: NextRequest) {
  let body: { name?: unknown; email?: unknown; password?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = normalizeRole(body.role);

  if (name.length < 2 || name.length > 128) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const serverOrigin = new URL(request.url).origin;
      if (origin !== serverOrigin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const pendingCookies: Array<{ name: string; value: string; options: Parameters<NextResponse["cookies"]["set"]>[2] }> = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach((cookie) => pendingCookies.push(cookie));
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Unable to create your account. Please try again." }, { status: 400 });
  }

  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in instead." },
      { status: 409 }
    );
  }

  await upsertProfile(data.user.id, name, role);

  const response = NextResponse.json({
    success: true,
    requiresEmailConfirmation: !data.session,
  });
  pendingCookies.forEach(({ name: cookieName, value, options }) => {
    response.cookies.set(cookieName, value, options);
  });
  return response;
}
