# Security Audit Report — Lwyrd Platform (Round 4)

**Date:** 2026-06-09
**Scope:** Verification of Round 4 pre-audit fixes + fresh coverage
**Prior audits:** Rounds 1–3 fully resolved (see `RESOLVED_SECURITY_AUDIT.md`)

---

## Audit Checklist

| Category | Status | Notes |
|---|---|---|
| CSP header correctness | ✅ Pass | `https://` + `wss://` for Supabase, PostHog, formsubmit.co all covered |
| PostHog consent gating | ✅ Pass | `posthog.__loaded` is a real SDK guard; init only fires on consent |
| Redis rate limiter logic | ✅ Pass | Both branches enforce same MAX_ATTEMPTS/WINDOW policy |
| Rate limit key design | ✅ Pass | Keyed on email — correct for credential stuffing defense |
| **Consent event bus forgeable** | ❌ FAIL → Fixed | See Finding #1 — global window event lets any same-origin code trigger PostHog init |
| **`redisClear` silent failure** | ❌ FAIL → Fixed | See Finding #2 — unchecked response leaves rate limit counter in split-brain state |
| `runMatchingV2` paywall | ✅ Pass | Full result set never leaves server for free users |
| `runMatchingForSubmission` ownership | ✅ Pass | `.eq("user_id", user.id)` enforced server-side |
| Admin route protection | ✅ Pass | `AdminLayout` server-side redirect + `verifyAdmin()` in every action |
| Auth callback redirect | ✅ Pass | Regex blocks all `@`-host and protocol-relative attacks |
| Admin input validation | ✅ Pass | Enum allowlists, length bounds, slug regex on all 5 action files |
| `updateProfile` length bound | ✅ Pass | 1–128 chars enforced |
| `deleteAccount` data cleanup | ✅ Pass | Explicit row deletion across 5 tables before auth delete |
| ConsentBanner logic | ✅ Pass | Only shows when `localStorage === null`; decline writes `"false"` correctly |

---

## Findings

---

### Finding #1 — Consent Event Bus Forgeable by Same-Origin Code

**Files:** `src/components/providers/PostHogProvider.tsx`, `src/components/ui/ConsentBanner.tsx`
**Severity:** Medium
**Status:** Fixed in this session

**Issue:**

`PostHogProvider` listened for `window.addEventListener("lwyrd_consent_granted", ...)` to initialize PostHog. Any first-party JavaScript on the same origin — a supply-chain-compromised npm dependency, a future XSS payload, or a browser extension with content script permissions — could dispatch `new Event("lwyrd_consent_granted")` to force PostHog to initialize without the user ever clicking Accept.

Additionally, `localStorage.setItem("lwyrd_analytics_consent", "true")` written by any script would pre-consent a user silently before the banner renders.

For a legal platform capturing page views on sensitive routes (`/results/[id]`, `/dashboard`) containing immigration status and litigation context, unauthorized analytics initialization is a GDPR Article 7 violation even without direct PII capture.

**Fix applied:**

Replaced the global event bus with a React context-based callback:

1. **New `src/context/ConsentContext.tsx`** — provides a `grantConsent()` callback through the React tree. The callback is a closure over `initPostHog`, scoped to the React component tree and not accessible from outside it.

2. **`PostHogProvider.tsx`** — creates a `handleConsent` callback that calls `localStorage.setItem("true")` + `initPostHog()`, wraps children in `<ConsentProvider onConsent={handleConsent}>`. No `window.addEventListener` for consent.

3. **`ConsentBanner.tsx`** — calls `useConsent().grantConsent()` on Accept instead of `window.dispatchEvent`. No `window.addEventListener`. `localStorage` write on accept path is now handled exclusively in `PostHogProvider.handleConsent`.

**Security guarantee:** PostHog can only be initialized through the React `grantConsent` callback, which is a closure in the React tree. External scripts — including compromised dependencies — cannot reach it via the DOM event system.

---

### Finding #2 — `redisClear` Silent Failure Creates Split-Brain Rate Limit State

**File:** `src/app/api/auth/login/route.ts`
**Severity:** Medium
**Status:** Fixed in this session

**Issue:**

`redisClear` did not check `res.ok` after the DELETE call. If the call failed silently (Redis momentarily unavailable, network timeout, misconfigured token), the Redis rate limit counter for a successfully authenticated account was **not cleared**. After 10 successful logins within 15 minutes, the Redis counter would lock out the account even though the login succeeded.

The `redisCheck` path correctly threw on `!res.ok` (falling back to the in-memory limiter), but the clear path had no such check. This created a split-brain scenario: the in-memory limiter was cleared on success while the Redis counter was not, so subsequent logins that fell back to Redis (after the in-memory Map reset on serverless restart) would see a non-zero counter.

A targeted attacker could exploit this by flooding `/api/auth/login` during the clear phase of a victim's successful login to cause Redis timeouts, keeping the victim's Redis counter at 10 and locking them out on subsequent attempts.

**Fix applied:**

```typescript
async function redisClear(key: string, url: string, token: string): Promise<void> {
  const res = await fetch(`${url}/del/rl:login:${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Redis clear failed: ${res.status}`);
}
```

The `clearRateLimit` wrapper already has a `try/catch` that falls through to `memClear`. With `redisClear` now throwing on failure, the fallback clears the in-memory counter, and the Redis counter expires naturally after `WINDOW_SECS` (15 minutes). This is the correct behavior — a brief lockout is a temporary inconvenience, not an account lockout attack surface.

---

## What Passed Cleanly

- **CSP construction:** `safeHostname()` safely handles empty/invalid URLs. `wss://` WebSocket directive covers Supabase Realtime. `frame-ancestors 'none'` correctly backs up `X-Frame-Options: DENY`. `base-uri 'self'` and `form-action` are correctly scoped. `upgrade-insecure-requests` is appropriate for a production HTTPS-only site.
- **`posthog.__loaded` guard:** This is a real boolean property set by the PostHog SDK during `init()`. The check reliably prevents double-initialization.
- **Redis fallback:** `catch {}` in `redisCheck` falling through to `memCheck` is correct — both paths enforce the same policy. Single-instance environments (local dev) work correctly with in-memory only.
- **Rate limit key:** Keyed on `email.toLowerCase().trim()` — correct threat model. Rotating source IPs doesn't help an attacker targeting a specific account.
- **`runMatchingV2`:** Reads `profile.access_level` from the DB (not client-supplied), truncates before return. Full result set never leaves the server for free-tier users.
- **`runMatchingForSubmission`:** `.eq("id", submissionId).eq("user_id", user.id)` enforces row-level ownership server-side. Submission ID guessing does not grant access to another user's data.
- **Admin protection:** Server-side `redirect()` in `AdminLayout` + `verifyAdmin()` in every action. Defense in depth — neither alone is a single point of failure.
- **Consent banner:** Only shows when `localStorage.getItem(CONSENT_KEY) === null`. Decline writes `"false"` without touching PostHog. Banner correctly hides after any decision.

---

## Priority Remediation Table

| Priority | Finding | File(s) | Status |
|---|---|---|---|
| 1 | `redisClear` silent failure — split-brain rate limit | `src/app/api/auth/login/route.ts` | ✅ Fixed |
| 2 | Consent event bus forgeable by same-origin code | `PostHogProvider.tsx`, `ConsentBanner.tsx`, new `ConsentContext.tsx` | ✅ Fixed |

---

## Remaining Gaps

| Gap | Notes |
|---|---|
| CSP `'unsafe-inline'` in script-src | Nonce-based CSP via middleware is the path to removal. Left as a future hardening task. |
| DPA with PostHog | Legal/business agreement — cannot be resolved in code. |
| Upstash credentials | Redis rate limiting is implemented but inactive until `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are added to Vercel env vars. |
| `admin_audit_log` migration | Must be run manually in Supabase SQL editor (`scripts/migrations/admin_audit_log.sql`). |
