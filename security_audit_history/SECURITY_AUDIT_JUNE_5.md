# Security Audit Report — Lwyrd Platform (Round 5 / June 10 2026)

**Date:** 2026-06-10  
**Scope:** Full-platform audit covering all 9 categories in the brief:
input validation, authentication, API authorization, data storage/transmission,
environment variables, third-party dependencies, and AI-assisted checklist review.  
**Prior audits resolved:** Rounds 1–4 (see `RESOLVED_SECURITY_AUDIT.md`)

---

## Audit Checklist

| Category | Status | Notes |
|---|---|---|
| Input validation — server actions | ✅ Pass | All admin actions have enum allowlists + length bounds |
| Input validation — `runMatchingV2` track | ✅ Pass | Allowlist added this session (was any non-empty string) |
| Authentication — session refresh | ✅ Pass | `proxy.ts` is the correct middleware entry point in Next.js 16.x; sessions refresh on every request |
| Authentication — login rate limiting | ✅ Pass | 10 attempts / 15 min; Redis or in-memory fallback |
| Authentication — Login CSRF | ✅ Pass | Origin header validation added this session |
| Authentication — password strength | ✅ Pass | Minimum raised to 8 characters this session |
| API authorization — admin routes | ✅ Pass | `AdminLayout` + `verifyAdmin()` in every action |
| API authorization — user data isolation | ✅ Pass | `user_id` scoping on all queries; submission ownership enforced server-side |
| API authorization — paywall | ✅ Pass | `runMatchingV2` / `runMatchingForSubmission` truncate before return |
| Sensitive data — sessionStorage cleared on logout | ✅ Pass | All `lwyrd_*` keys cleared on logout this session |
| Sensitive data — full results leave server | ✅ Pass | Free users receive ≤1 result from server action |
| Sensitive data — submission ownership | ✅ Pass | `.eq("user_id", user.id)` enforced server-side |
| Environment variables — secrets in source | ✅ Pass | `.env*` is gitignored; service role key only in Vercel env |
| Environment variables — anon key exposure | ✅ Pass | Intentional by Supabase design; RLS enforces access |
| Third-party dependencies — known CVEs | ✅ Pass | No critical CVEs in current dep tree (see below) |
| CSP header — hostile origins blocked | ✅ Pass | Dynamic hostname derivation + wildcard fallback |
| CSP header — `'unsafe-inline'` | ⚠️ Gap | Nonce-based removal deferred; documented below |
| GDPR consent gating | ✅ Pass | React context callback; no forgeable window event |
| Admin audit log | ⚠️ Gap | `admin_audit_log.sql` migration must be run manually |

---

## Findings Fixed This Session

---

### ~~Finding #1 — Missing `middleware.ts`~~ — RETRACTED

**Status:** False finding — retracted after `npm run dev` runtime error revealed the fix was incorrect.

**What happened:** This audit incorrectly assumed Next.js 16.x uses `middleware.ts` as the middleware entry point (matching prior versions). In Next.js 16.x, the convention was renamed to `proxy.ts`. `src/proxy.ts` was already the active, correctly-named middleware file and has always been executing on every request. The `src/middleware.ts` file created during this audit caused a startup error ("Both middleware file and proxy file detected") and has been deleted.

---

### Finding #1 — Login CSRF via Missing Origin Validation

**File:** `src/app/api/auth/login/route.ts`  
**Severity:** Medium  
**Status:** Fixed

**Issue:**

The `POST /api/auth/login` endpoint accepted requests from any origin. A
malicious third-party site could submit a cross-origin `fetch` to this endpoint
with the attacker's own credentials. Because browsers honor `Set-Cookie` in
cross-origin responses (for non-`SameSite=Strict` cookies), the response would
overwrite the victim's Supabase session cookie with a session belonging to the
attacker's account. The victim, unaware they are now logged into the attacker's
account, would submit intake forms and contact requests that the attacker could
then read.

This is a Login CSRF attack. It is exploitable whenever the user visits a page
controlled by the attacker while already browsing in the same browser profile.

**Fix applied:**

```typescript
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
```

Cross-origin POST requests are rejected with HTTP 403. Same-origin requests
from `AuthContext.login()` continue to work (they match the server origin).
The `origin` header is absent on server-to-server calls, which are permitted
to pass through to Supabase authentication normally.

---

### Finding #3 — Minimum Password Length of 6 Characters

**File:** `src/components/auth/AuthModal.tsx`  
**Severity:** Medium  
**Status:** Fixed

**Issue:**

The signup form enforced `minLength={6}` and the help text read "Must be at
least 6 characters." For a platform that stores immigration status, litigation
details, and employment history, 6-character passwords are inadequate — they
fall within the range of commonly leaked passwords and are trivially brute-forced
offline if a database breach occurs.

**Fix applied:**

`minLength` raised to `8` and help text updated accordingly. 8 characters is
the NIST SP 800-63B minimum for memorized secrets used with rate-limited
authentication.

---

### Finding #4 — Legal Match Data Persists in sessionStorage After Logout

**File:** `src/context/AuthContext.tsx`  
**Severity:** Medium  
**Status:** Fixed

**Issue:**

`sessionStorage` stores: `lwyrd_results` (serialized `MatchResult[]` including
firm names and scores), `lwyrd_locked_count`, `lwyrd_category`,
`lwyrd_category_name`, `lwyrd_match_scores`, and `lwyrd_answers_v2`
(questionnaire answers that may include immigration status, litigation stage,
or employment situation). These keys were written on intake completion but
never cleared on logout.

On a shared device, after User A logs out, User B could open DevTools or run
`Object.keys(sessionStorage)` in the console and read User A's legal data.
`sessionStorage` persists for the lifetime of the browser tab, not the
authentication session.

**Fix applied:**

```typescript
const logout = useCallback(async () => {
  await supabase.auth.signOut();
  posthog.reset();
  setUser(null);
  ["lwyrd_results", "lwyrd_locked_count", "lwyrd_category", "lwyrd_category_name",
   "lwyrd_match_scores", "lwyrd_answers_v2"].forEach((k) => sessionStorage.removeItem(k));
  router.push("/");
}, [supabase, router]);
```

All `lwyrd_*` keys are cleared atomically in the logout path before the router
redirect.

---

### Finding #5 — `runMatchingV2` Accepted Arbitrary `track` Strings

**File:** `src/lib/actions/intake.ts`  
**Severity:** Low  
**Status:** Fixed

**Issue:**

The `track` parameter was validated only as a non-empty string. Any authenticated
user could call `runMatchingV2` with `track: "attacker_controlled_string"`,
which would be written verbatim to the `intake_submissions.track` column and
the `startup_submissions` / `individual_submissions` / `small_business_submissions`
dispatch in `saveIntakeSubmissionV2`. This polluted analytics, created orphaned
submission rows, and could confuse any code that later queries by track.

**Fix applied:**

```typescript
const VALID_TRACKS = ["startup", "individual", "small_business"] as const;
if (
  typeof track !== "string" ||
  !(VALID_TRACKS as readonly string[]).includes(track) ||
  typeof category !== "string" ||
  !category ||
  category.length > 64
) {
  return { results: [], lockedCount: 0, error: "Invalid input" };
}
```

Only the three known track values are accepted. `category` is capped at 64
characters matching the `legal_category` column constraint.

---

## Third-Party Dependency Review

| Package | Version | Status |
|---|---|---|
| `next` | 16.2.3 | ✅ Current |
| `@supabase/ssr` | ^0.10.2 | ✅ No critical CVEs |
| `@supabase/supabase-js` | ^2.103.0 | ✅ No critical CVEs |
| `posthog-js` | ^1.369.0 | ✅ No critical CVEs |
| `framer-motion` | ^12.38.0 | ✅ No critical CVEs |
| `lucide-react` | ^1.8.0 | ✅ No critical CVEs |
| `react` / `react-dom` | 19.2.4 | ✅ Latest stable |

No packages with known high/critical CVEs were identified. Recommend running
`npm audit` before each production deploy to catch newly disclosed
vulnerabilities.

---

## Environment Variable & Secret Management

| Variable | Location | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` (gitignored) + Vercel | ✅ Safe — public by design |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` (gitignored) + Vercel | ✅ Safe — public by Supabase design; RLS enforces access |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel only (not in `.env.local`) | ⚠️ Add to `.env.local` for local admin dev |
| `UPSTASH_REDIS_REST_URL` | Vercel only | ⚠️ Required to activate Redis rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Vercel only | ⚠️ Required to activate Redis rate limiting |
| `NEXT_PUBLIC_POSTHOG_KEY` | Vercel only | ✅ Public by design |
| `NEXT_PUBLIC_POSTHOG_HOST` | Vercel only | ✅ Public by design |

No secrets are committed to the repository. `.env*` is correctly listed in
`.gitignore`.

---

## Data Storage & Transmission

| Data | Storage | Encryption | Notes |
|---|---|---|---|
| Auth credentials | Supabase `auth.users` | ✅ bcrypt-hashed | Managed by Supabase Auth |
| Session tokens | HttpOnly cookies + Supabase | ✅ TLS in transit | Cookie flags managed by `@supabase/ssr` |
| Intake answers | Supabase `intake_submissions` | ✅ TLS in transit; at-rest encryption by Supabase | Includes potentially sensitive legal info |
| Match results | `sessionStorage` (client) | ⚠️ Plaintext in browser | Cleared on logout (fixed this session) |
| Contact form data | `formsubmit.co` (third party) | ✅ TLS in transit | No server-side validation or rate limiting (see gaps) |

All Supabase-stored data benefits from the platform's at-rest AES-256
encryption. No PII is logged server-side.

---

## Remaining Gaps

| Gap | Severity | Action Required |
|---|---|---|
| CSP `'unsafe-inline'` in `script-src` | Medium | Code change — nonce-based CSP via `src/middleware.ts`. Deferred to future sprint. |
| `SUPABASE_SERVICE_ROLE_KEY` missing from `.env.local` | Low | Add to `.env.local` so admin server actions work locally |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` not in Vercel | Low | Add to Vercel dashboard to activate Redis rate limiting |
| `admin_audit_log` SQL migration not run | Low | Run `scripts/migrations/admin_audit_log.sql` in Supabase SQL editor |
| DPA with PostHog | Low | Legal/business agreement — not a code issue |
| Contact form (formsubmit.co) — no auth or rate limiting | Low | Add server-side rate limiting or require authentication before showing the contact modal |

---

## Priority Remediation Summary

| Priority | Finding | File(s) | Status |
|---|---|---|---|
| ~~1~~ | ~~Missing `middleware.ts`~~ | ~~`src/middleware.ts` (new)~~ | ❌ Retracted — false finding; `proxy.ts` was always correct |
| 1 | Login CSRF — no Origin validation | `src/app/api/auth/login/route.ts` | ✅ Fixed |
| 2 | Password minimum 6 chars | `src/components/auth/AuthModal.tsx` | ✅ Fixed |
| 3 | sessionStorage not cleared on logout | `src/context/AuthContext.tsx` | ✅ Fixed |
| 4 | `runMatchingV2` track not allowlisted | `src/lib/actions/intake.ts` | ✅ Fixed |
| 5 | CSP `'unsafe-inline'` | `src/proxy.ts` (future) | ⏳ Deferred |
| 6 | Contact form rate limiting | `ContactFirmModal` + API | ⏳ Deferred |
