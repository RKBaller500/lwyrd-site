import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_SECS = 15 * 60;
const MAX_ATTEMPTS = 10;

// ── In-memory fallback (single-instance only) ─────────────────────────────────
const memAttempts = new Map<string, { count: number; resetAt: number }>();

function memCheck(key: string): boolean {
  const now = Date.now();
  const record = memAttempts.get(key);
  if (!record || now > record.resetAt) {
    memAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  record.count += 1;
  return record.count > MAX_ATTEMPTS;
}

function memClear(key: string) {
  memAttempts.delete(key);
}

// ── Upstash Redis REST API (multi-instance safe) ──────────────────────────────
// Uses Upstash's HTTP pipeline endpoint, no package required.
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars to enable.
async function redisCheck(key: string, url: string, token: string): Promise<boolean> {
  const redisKey = `rl:login:${key}`;
  // INCR + EXPIRE NX in a single pipeline call
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, WINDOW_SECS, "NX"],
    ]),
  });

  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  const results: Array<{ result: number }> = await res.json();
  const count = results[0]?.result ?? 1;
  return count > MAX_ATTEMPTS;
}

async function redisClear(key: string, url: string, token: string): Promise<void> {
  const res = await fetch(`${url}/del/rl:login:${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Redis clear failed: ${res.status}`);
}

// ── Public interface ──────────────────────────────────────────────────────────
async function checkRateLimit(key: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await redisCheck(key, url, token);
    } catch {
      // Redis unavailable, fall through to in-memory limiter
    }
  }
  return memCheck(key);
}

async function clearRateLimit(key: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      await redisClear(key, url, token);
      return;
    } catch {
      // fall through
    }
  }
  memClear(key);
}

// ── Route handler ─────────────────────────────────────────────────────────────
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

  // Block cross-origin login requests to prevent Login CSRF
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

  const key = email.toLowerCase().trim();

  if (await checkRateLimit(key)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

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

  await clearRateLimit(key);
  return response;
}
