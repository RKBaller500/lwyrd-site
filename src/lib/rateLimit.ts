// Generic namespaced rate limiter: in-memory by default, Upstash Redis REST API
// (multi-instance safe) when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set.

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

const memHits = new Map<string, { count: number; resetAt: number }>();

function memCheck(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const record = memHits.get(key);
  if (!record || now > record.resetAt) {
    memHits.set(key, { count: 1, resetAt: now + opts.windowMs });
    return false;
  }
  record.count += 1;
  return record.count > opts.max;
}

async function redisCheck(key: string, opts: RateLimitOptions, url: string, token: string): Promise<boolean> {
  const windowSecs = Math.ceil(opts.windowMs / 1000);
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSecs, "NX"],
    ]),
  });
  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  const results: Array<{ result: number }> = await res.json();
  const count = results[0]?.result ?? 1;
  return count > opts.max;
}

export async function checkRateLimit(namespace: string, key: string, opts: RateLimitOptions): Promise<boolean> {
  const namespacedKey = `rl:${namespace}:${key}`;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await redisCheck(namespacedKey, opts, url, token);
    } catch {
      // Redis unavailable, fall through to in-memory limiter
    }
  }
  return memCheck(namespacedKey, opts);
}
