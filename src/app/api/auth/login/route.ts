import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// In-memory rate limiter keyed by lowercase email.
// Not persistent across serverless instances — replace with Upstash Redis for
// multi-instance production deployments.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = attempts.get(email);
  if (!record || now > record.resetAt) {
    attempts.set(email, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  record.count += 1;
  return record.count > MAX_ATTEMPTS;
}

function clearRateLimit(email: string) {
  attempts.delete(email);
}

export async function POST(request: NextRequest) {
  let email: string, password: string;
  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const key = email.toLowerCase().trim();

  if (checkRateLimit(key)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  // Build the response object first so the SSR client can set cookies on it.
  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email: key, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  clearRateLimit(key);
  return response;
}
