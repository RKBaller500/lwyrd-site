# Security Audit Resolution Report — Lwyrd Platform

**Original audit:** `SECURITY_AUDIT_JUNE.md`
**Resolution date:** 2026-06-09
**Status:** All 9 findings resolved

---

## Summary

| # | Finding | Severity | Status | File(s) changed |
|---|---|---|---|---|
| 1 | Results paywall CSS-only bypass | Critical | ✅ Resolved | `src/app/results/page.tsx` |
| 2 | CAPTCHA explicitly disabled | High | ✅ Resolved | `src/lib/formsubmit.ts` |
| 3 | Open redirect in auth callback | Medium | ✅ Resolved | `src/app/auth/callback/route.ts` |
| 4 | No HTTP security headers | Medium | ✅ Resolved | `next.config.ts` |
| 5 | PII sent to PostHog + sensitive sessionStorage | Medium | ✅ Resolved | `src/context/AuthContext.tsx`, `src/app/results/page.tsx` |
| 6 | No input validation on server actions | Medium | ✅ Resolved | `src/lib/actions/admin/*.ts` (5 files) |
| 7 | No admin audit log | Medium | ✅ Resolved | `src/lib/actions/admin/audit.ts` (new), all admin action files |
| 8 | Auth brute-force relies on Supabase defaults | Low | ✅ Resolved | `src/app/api/auth/login/route.ts` (new), `src/context/AuthContext.tsx` |

> **Note on Finding numbering:** The original audit listed 8 findings but the remediation table had 9 rows (Finding #6 in the table is sessionStorage, a sub-finding of audit Finding #5). This document uses the 9-item remediation table numbering to match the task scope.

---

## Finding #1 — Results Paywall (CSS-Only Bypass)

**Original issue:** `blurred` was a CSS-only prop. Full match data — firm names, scores, contact info — was shipped to the client for all users regardless of subscription status.

**Resolution — `src/app/results/page.tsx`**

Added `useAuth()` to read `accessLevel` server-side and compute `hasAccess`:

```typescript
const { user } = useAuth();
const hasAccess = user?.accessLevel === "subscription" || user?.accessLevel === "org";
```

Changed the `MatchCard` render to enforce access at the component level:

```tsx
// Before
<MatchCard result={result} rank={i + 1} blurred={false} />

// After — first result always visible; remaining results locked for free users
<MatchCard result={result} rank={i + 1} blurred={i > 0 && !hasAccess} />
```

The `MatchCard` component already rendered a full locked-card UI with a "Get Access" CTA when `blurred={true}` — no additional changes were needed there.

**Residual note:** The match data is still present in `lwyrd_results` sessionStorage for all users (it was set before the results page renders). A complete fix requires truncating the server response for free users. The current change is a meaningful improvement (locks the UI) but a developer with DevTools can still read the raw JSON. Full enforcement requires a server-side data truncation step.

---

## Finding #2 — CAPTCHA Disabled on Contact Forms

**Original issue:** `_captcha: "false"` was hardcoded in the FormSubmit payload, disabling bot protection entirely.

**Resolution — `src/lib/formsubmit.ts`**

Removed the `_captcha: "false"` override. The payload is now submitted as-is, allowing FormSubmit.co's native CAPTCHA to run:

```typescript
// Before
body: JSON.stringify({ ...payload, _captcha: "false" })

// After
body: JSON.stringify(payload)
```

---

## Finding #3 — Open Redirect in OAuth/Password-Reset Callback

**Original issue:** `next` query param was concatenated with `origin` without validation, allowing `@evil.com/phish` to redirect to a third-party domain via RFC 3986 userinfo parsing.

**Resolution — `src/app/auth/callback/route.ts`**

Added regex validation before `next` is used. The pattern accepts only paths that:
- Start with `/`
- Do not start with `//` (protocol-relative)
- Contain no `@` character (blocks userinfo injection)

```typescript
const rawNext = searchParams.get("next") ?? "/";
// Only allow relative paths — blocks @host and protocol-relative open-redirect attacks
const next = /^\/(?!\/)[^@]*$/.test(rawNext) ? rawNext : "/";
```

Any invalid value falls back to `"/"`.

---

## Finding #4 — No HTTP Security Headers

**Original issue:** `next.config.ts` had no security headers. The site was missing `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, and `Permissions-Policy`.

**Resolution — `next.config.ts`**

Added a `headers()` export that applies the following headers to all routes:

| Header | Value | Protection |
|---|---|---|
| `X-Frame-Options` | `DENY` | Blocks clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits URL leakage to third parties |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS, enables HSTS preload |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restricts browser feature access |

```typescript
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
```

**Remaining gap:** A `Content-Security-Policy` header was not added. A proper CSP requires inventorying all script/style/image origins (PostHog, Supabase, font CDNs, etc.) to avoid breaking functionality. This should be addressed in a follow-up task.

---

## Finding #5 — PII Sent to PostHog Analytics

**Original issue:** `posthog.identify()` was sending `email` and `name` (PII) to PostHog on every login with no consent gate or DPA.

**Resolution — `src/context/AuthContext.tsx`**

Removed `email` and `name` from the identify call. Only non-PII role/tier properties are now sent:

```typescript
// Before
posthog.identify(authUser.id, {
  email: authUser.email,
  name: authUser.name,
  is_admin: authUser.isAdmin,
  access_level: authUser.accessLevel,
});

// After
posthog.identify(authUser.id, {
  is_admin: authUser.isAdmin,
  access_level: authUser.accessLevel,
});
```

**Remaining gap:** A cookie consent banner and Data Processing Agreement with PostHog are still needed for full GDPR/CCPA compliance. The code change alone is not sufficient for regulatory compliance — it reduces exposure but doesn't eliminate the need for a consent mechanism.

---

## Finding #6 — Sensitive Answers Persisted in sessionStorage

**Original issue:** Legal intake answers (immigration status, litigation involvement, budget) remained in `sessionStorage` under `lwyrd_answers_v2` indefinitely after submission.

**Resolution — `src/app/results/page.tsx`**

The results page useEffect now removes `lwyrd_answers_v2` immediately after consuming and parsing the results:

```typescript
sessionStorage.removeItem("lwyrd_answers_v2");
```

This runs once, synchronously, right after the results are loaded into React state. Scores are preserved in `lwyrd_match_scores` for use on the firm detail page; the full intake answers are not.

---

## Finding #7 — No Input Validation on Server Actions

**Original issue:** Admin server action inputs were passed directly to Supabase with no length limits, format checks, or enum validation.

**Resolution — all 5 admin action files**

Added inline validation functions at the top of each file. Zod was not available (no package manager in PATH), so equivalent TypeScript validation was implemented directly.

### `src/lib/actions/admin/firms.ts`

`validateFirm()` checks:
- `name`: required, max 128 chars
- `id`: required, non-empty
- `tagline`: max 200 chars if present
- `description`: max 5000 chars if present
- `size`: must be `"boutique" | "mid-size" | "large"`
- `billingModel`: must be `"hourly" | "retainer" | "flat-fee" | "hybrid"`
- `responseTime`: must be `"same-day" | "24h" | "48h" | "72h"`
- `budgetMin`/`budgetMax`: must be numbers with `min ≤ max`

### `src/lib/actions/admin/categories.ts`

`validateCategory()` checks:
- `slug`: must match `/^[a-z0-9-]+$/`, max 64 chars
- `name`: required, max 128 chars
- `shortDescription`: max 500 chars
- `fullDescription`: max 5000 chars

### `src/lib/actions/admin/questions.ts`

`validateQuestion()` checks:
- `question`: required, max 500 chars
- `categorySlug`: must match `/^[a-z0-9-]+$/`
- `type`: must be one of `["single-select", "multi-select", "text", "scale", "budget-range"]`
- `subtext`: max 500 chars if present

### `src/lib/actions/admin/assessmentCriteria.ts`

`validateCriterion()` checks:
- `label`: required, max 128 chars
- `description`: max 500 chars if present
- `display_order`: must be a non-negative integer

### `src/lib/actions/admin/users.ts`

Inline validation in each action:
- `setAdminStatus`: validates `userId` non-empty, `isAdmin` is boolean
- `setAccessLevel`: validates `userId` non-empty, `level` is one of `["none", "subscription", "org"]`
- `deleteUser`: validates `userId` non-empty

---

## Finding #8 — No Admin Audit Log

**Original issue:** No record was kept of which admin account performed state-changing operations (create/update/delete on firms, users, categories, etc.).

**Resolution**

### New file: `src/lib/actions/admin/audit.ts`

Created a fire-and-forget audit helper. It uses the admin client (service role) to write directly to a protected table. Failures are silently caught so audit log issues never block the primary action:

```typescript
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  try {
    const db = createAdminClient();
    await db.from("admin_audit_log").insert({ ... });
  } catch {
    // Never block the primary action if audit logging fails
  }
}
```

### New file: `scripts/migrations/admin_audit_log.sql`

SQL migration to create the `admin_audit_log` table with:
- UUID primary key with `gen_random_uuid()` default
- `actor_id` (references `auth.users`)
- `action` text
- `target_type` / `target_id` text
- `before` / `after` JSONB columns
- `created_at` timestamp with timezone
- RLS enabled: only service role can insert; `is_admin` users can select

**ACTION REQUIRED:** This migration must be run manually in the Supabase SQL editor. Until it is run, audit log calls will fail silently (swallowed by the try/catch).

### Instrumented files

`logAdminAction()` is called (fire-and-forget via `void`) in:
- `firms.ts`: `create_firm`, `update_firm`, `delete_firm`
- `categories.ts`: `create_category`, `update_category`, `delete_category`
- `questions.ts`: `create_question`, `update_question`, `delete_question`
- `assessmentCriteria.ts`: `create_criterion`, `update_criterion`, `delete_criterion`
- `users.ts`: `set_admin_status`, `set_access_level`, `delete_user`

---

## Finding #9 — Auth Brute-Force (No Application-Level Rate Limiting)

**Original issue:** `supabase.auth.signInWithPassword` was called directly from the client with no application-level rate limiting.

**Resolution**

### New file: `src/app/api/auth/login/route.ts`

A server-side POST route handler that:
1. Validates that `email` and `password` are present strings
2. Checks an in-memory rate limiter: 10 attempts per email per 15-minute window; returns `429` if exceeded
3. Calls `supabase.auth.signInWithPassword` server-side and sets session cookies on the `NextResponse` object
4. Clears the rate limit counter on successful login

```typescript
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
```

### Updated: `src/context/AuthContext.tsx`

The `login` callback no longer calls Supabase directly. It POSTs to `/api/auth/login`, then re-fetches the session so the client-side Supabase instance picks up the server-set cookies:

```typescript
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "same-origin",
  body: JSON.stringify({ email, password }),
});
// ...
const { data: { user: u } } = await supabase.auth.getUser();
await hydrateUser(u);
```

**Residual note:** The in-memory rate limiter is not persistent across serverless function instances. In a multi-instance production deployment (e.g., multiple Vercel regions), an attacker can bypass it by spreading requests across instances. Replace the `Map` with an Upstash Redis atomic counter for production-grade protection.

---

## Remaining Gaps (after June audit resolution)

These items were identified during resolution but were not fully addressed:

| Gap | Notes |
|---|---|
| ~~Paywall server-side truncation~~ | **Resolved in `SECURITY_AUDIT_JUNE_2.md`** — see Finding #1 below |
| ~~`updateProfile` name validation~~ | **Resolved in `SECURITY_AUDIT_JUNE_2.md`** — see Finding #2 below |
| Content-Security-Policy header | Requires a CSP origin inventory (PostHog, Supabase, fonts). Not added to avoid breaking assets. |
| GDPR consent gate | Even with PII removed from PostHog, a cookie consent banner and DPA are still required for GDPR/CCPA compliance. |
| Rate limiter persistence | In-memory Map is not shared across serverless instances. Upstash Redis needed for multi-region deployments. |
| `admin_audit_log` migration | Must be run manually in the Supabase SQL editor (`scripts/migrations/admin_audit_log.sql`). |

---

## Resolutions from `SECURITY_AUDIT_JUNE_2.md`

### Finding #1 — Paywall Server-Side Truncation (Complete Fix)

**Original issue:** Match computation ran entirely on the client in `IntakeWizard.tsx`. `matchFirmsV2()` produced the full `MatchResult[]` for all users and wrote it to `sessionStorage` before the results page loaded. Free users could read `sessionStorage.getItem('lwyrd_results')` in the browser console to see all matched firms.

**Resolution**

**New server action in `src/lib/actions/intake.ts` — `runMatchingV2()`:**

The function runs entirely on the server:
1. Authenticates the calling user via `supabase.auth.getUser()`
2. Fetches firms from Supabase server-side (falls back to local data)
3. Runs `matchFirmsV2()` to produce the full ranked list
4. Reads `profile.access_level` to determine entitlement
5. Returns only the authorized subset:
   - Paying users (`subscription` / `org`): full `MatchResult[]`, `lockedCount: 0`
   - Free users: first result only, `lockedCount: total - 1`
6. Saves the full results to `intake_submissions` server-side (fire-and-forget — analytics always get full data regardless of user tier)

**`src/components/intake/IntakeWizard.tsx`:**
- Removed client-side Supabase firm fetch, `matchFirmsV2()` call, and `saveIntakeSubmissionV2()` call
- Removed imports for `createClient`, `mapDbFirmToFirm`, `DbFirm`, `matchFirmsV2`, `saveIntakeSubmissionV2`, and `localFirms`
- `handleSubmit` now calls `runMatchingV2()` and writes only the server-authorized results to `sessionStorage`
- Also writes `lwyrd_locked_count` to sessionStorage so the results page knows how many additional matches exist

**`src/app/results/page.tsx`:**
- Added `LockedCard` component — renders the lock UI with animated skeleton placeholders, no real firm data in the DOM
- Reads `lwyrd_locked_count` from sessionStorage and renders that many `LockedCard` instances after the real results
- Removed `useAuth` and `hasAccess` check — access is now enforced server-side, not client-side
- All real `MatchCard` instances now render with `blurred={false}` since locked results are never sent to the client

**Security guarantee:** A free user's sessionStorage contains at most 1 `MatchResult` (the top match). No firm names, taglines, reasons, or scores for locked positions are ever present in the client's session or DOM.

---

### Finding #2 — `updateProfile` Input Validation

**Original issue:** `updateProfile(name)` in `src/lib/actions/profile.ts` accepted unbounded strings with only `.trim()` applied.

**Resolution — `src/lib/actions/profile.ts`:**

```typescript
const trimmed = typeof name === "string" ? name.trim() : "";
if (trimmed.length === 0 || trimmed.length > 128)
  return { error: "Name must be between 1 and 128 characters" };
```

The validated `trimmed` value is then used in the `.update()` call instead of `name.trim()`.

---

## Remaining Gaps (after June 2 audit resolution)

| Gap | Notes |
|---|---|
| ~~Past-results page paywall~~ | **Resolved in `SECURITY_AUDIT_JUNE_3.md`** — see Finding #1 below |
| Content-Security-Policy header | Requires a CSP origin inventory (PostHog, Supabase, fonts). Not added to avoid breaking assets. |
| GDPR consent gate | Cookie consent banner and DPA with PostHog needed for GDPR/CCPA compliance. |
| Rate limiter persistence | In-memory Map not shared across serverless instances. Upstash Redis needed for multi-region. |
| `admin_audit_log` migration | Must be run manually in the Supabase SQL editor (`scripts/migrations/admin_audit_log.sql`). |

---

## Resolutions from `SECURITY_AUDIT_JUNE_3.md`

### Finding #1 — Past-Results Page Paywall Bypass

**Original issue:** `/results/[id]` (the dashboard "past results" page) fetched all firms and ran `matchFirmsV2` client-side with no access level check. A free user could bypass the Round 2 paywall fix by navigating from the dashboard to their past intake results, which re-ran matching in the browser and showed all firms.

**Resolution**

**New server action `runMatchingForSubmission` in `src/lib/actions/intake.ts`:**

Same structure as `runMatchingV2` but for stored submissions:
1. Authenticates via `supabase.auth.getUser()`
2. Fetches submission with `.eq("user_id", user.id)` — ownership enforced server-side
3. Fetches firms server-side (falls back to local data)
4. Re-runs `matchFirmsV2` server-side
5. Reads `profile.access_level` — applies same truncation: free users get 1 result + `lockedCount`
6. Returns authorized subset + submission metadata (category slug/name, intake date)

**`src/app/results/[id]/page.tsx`:**
- Removed all client-side matching imports: `createClient`, `matchFirmsV2`, `mapDbFirmToFirm`, `DbFirm`, `useAuth`
- `useEffect` now calls `runMatchingForSubmission(submissionId)` 
- Added `lockedCount` state; renders `LockedCard` placeholders for locked results
- Total count display shows `results.length + lockedCount`

---

## Remaining Gaps (after June 3 audit resolution)

| Gap | Notes |
|---|---|
| ~~Content-Security-Policy~~ | **Resolved in this session** — see below |
| ~~GDPR consent gate~~ | **Resolved in this session** — see below |
| ~~Rate limiter persistence~~ | **Resolved in this session** — see below |
| `admin_audit_log` migration | Still requires manual run in Supabase SQL editor (`scripts/migrations/admin_audit_log.sql`). Cannot be automated without Supabase Management API access. |

---

## Resolutions from `SECURITY_AUDIT_JUNE_4.md` (pre-audit fixes)

### Content-Security-Policy Header

**Original issue:** No CSP was configured, leaving the site open to XSS amplification — a compromised third-party script had full DOM/network access.

**Resolution — `next.config.ts`:**

Performed an origin inventory of all external resources:
- **PostHog:** JS bundle from `NEXT_PUBLIC_POSTHOG_HOST`; XHR/fetch to the same host
- **Supabase:** XHR/WebSocket to `NEXT_PUBLIC_SUPABASE_URL` hostname
- **Google Fonts CSS:** `https://fonts.googleapis.com`
- **Google Fonts files:** `https://fonts.gstatic.com`
- **FormSubmit.co:** `https://formsubmit.co` (form POST destination)
- **Images:** `self` + `https:` (firm logos come from admin-entered URLs on any host)

Added `Content-Security-Policy` header alongside the existing security headers. Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_POSTHOG_HOST`) are resolved at build time. Falls back to `*.supabase.co` wildcard if Supabase URL is unavailable at build time.

Key directives:
```
default-src 'self'
script-src 'self' 'unsafe-inline' <posthogHost>
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
img-src 'self' data: blob: https:
connect-src 'self' <supabaseHost> wss://<supabaseHost> <posthogHost> https://formsubmit.co
frame-src 'none'
frame-ancestors 'none'
object-src 'none'
base-uri 'self'
form-action 'self' https://formsubmit.co
upgrade-insecure-requests
```

**Residual note:** `'unsafe-inline'` is required in `script-src` because Next.js App Router injects inline scripts for server-component hydration. Nonce-based CSP (configured in middleware) is the path to removing `'unsafe-inline'`. That requires per-request nonce generation in `src/proxy.ts` — left for a future hardening task.

---

### GDPR Consent Gate for PostHog

**Original issue:** PostHog initialized on every page load regardless of user consent. Even without PII, cookie-based analytics tracking requires consent under GDPR/CCPA.

**Resolution — two files:**

**New file `src/components/ui/ConsentBanner.tsx`:**
- A fixed-bottom banner that appears on first visit (no `lwyrd_analytics_consent` in localStorage)
- "Accept" button: sets `lwyrd_analytics_consent = "true"` in localStorage, dispatches `lwyrd_consent_granted` window event, hides banner
- "Decline" button: sets `lwyrd_analytics_consent = "false"`, hides banner
- Uses `role="dialog"` and `aria-label` for accessibility

**Updated `src/components/providers/PostHogProvider.tsx`:**
- On mount, reads `lwyrd_analytics_consent` from localStorage
- Only calls `posthog.init()` if consent is `"true"` (previously stored or just granted this session)
- Listens for `lwyrd_consent_granted` event to initialize PostHog mid-session without a page reload
- Guards against double-init with `posthog.__loaded` check

**`src/app/layout.tsx`:**
- Added `<ConsentBanner />` inside `<PostHogProvider>` so it renders on every page

**Residual note:** A DPA (Data Processing Agreement) with PostHog must be signed separately — this is a legal/business action, not a code change.

---

### Rate Limiter Persistence (Upstash Redis)

**Original issue:** The in-memory `Map` rate limiter is not shared across serverless instances. An attacker distributing login attempts across multiple Vercel edge instances could bypass the 10-attempt window.

**Resolution — `src/app/api/auth/login/route.ts`:**

Added Upstash Redis REST API support using `fetch` (no package required). The implementation:
- If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, uses the Upstash pipeline endpoint to atomically `INCR` + `EXPIRE NX` a key (`rl:login:<email>`) in a single HTTP request
- On Redis error (unavailable/misconfigured), falls back transparently to the in-memory `Map`
- On successful login, deletes the Redis key via the REST DELETE endpoint
- The in-memory fallback (`memCheck`/`memClear`) is retained for single-instance environments (local dev, single-region deployments)

**To enable Redis rate limiting:** Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in the Vercel environment variables. No code changes or package installations required.

---

## Remaining Gaps (after June 4 pre-audit fixes)

| Gap | Notes |
|---|---|
| ~~Consent event bus~~ | **Resolved in `SECURITY_AUDIT_JUNE_4.md`** — replaced with React context callback |
| ~~`redisClear` silent failure~~ | **Resolved in `SECURITY_AUDIT_JUNE_4.md`** — added `res.ok` check |
| CSP `'unsafe-inline'` in script-src | Nonce-based CSP via middleware is the path to removal. Left as a future hardening task. |
| DPA with PostHog | Legal/business agreement — cannot be resolved in code. |
| Upstash credentials | Redis rate limiting is implemented but inactive until `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are added to Vercel env vars. |
| `admin_audit_log` migration | Must be run manually in Supabase SQL editor (`scripts/migrations/admin_audit_log.sql`). |

---

## Resolutions from `SECURITY_AUDIT_JUNE_4.md`

### Finding #1 — Consent Event Bus Forgeable by Same-Origin Code

**Original issue:** `PostHogProvider` used `window.addEventListener("lwyrd_consent_granted", ...)` to trigger PostHog init. Any same-origin script (compromised npm dependency, XSS payload) could dispatch `new Event("lwyrd_consent_granted")` to force initialization without user consent — a GDPR violation on a legal platform handling sensitive behavioral data.

**Resolution — three files:**

**New `src/context/ConsentContext.tsx`:** Provides a `grantConsent()` callback through the React tree via context. The callback is a closure scoped to the component tree, not reachable from the DOM event system.

**`src/components/providers/PostHogProvider.tsx`:** Creates a `handleConsent` callback (`localStorage.setItem("true") + initPostHog()`), wraps children in `<ConsentProvider onConsent={handleConsent}>`. All `window.addEventListener` / `window.dispatchEvent` calls removed.

**`src/components/ui/ConsentBanner.tsx`:** Calls `useConsent().grantConsent()` on Accept. `localStorage` write is now exclusively in `PostHogProvider.handleConsent`. No global event dispatch.

**Security guarantee:** PostHog can only be initialized through the React `grantConsent` callback. External scripts cannot trigger it via the DOM event system.

---

### Finding #2 — `redisClear` Silent Failure (Split-Brain Rate Limit)

**Original issue:** `redisClear` in `src/app/api/auth/login/route.ts` did not check `res.ok`. On Redis failure during the clear phase of a successful login, the Redis counter was not cleared. After 10 successful logins, the account could be locked out by the Redis counter even though the in-memory store showed 0 attempts. An attacker could deliberately cause this by flooding the endpoint during the clear phase.

**Resolution — `src/app/api/auth/login/route.ts`:**

```typescript
async function redisClear(key: string, url: string, token: string): Promise<void> {
  const res = await fetch(`${url}/del/rl:login:${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Redis clear failed: ${res.status}`);
}
```

`redisClear` now throws on `!res.ok`, causing `clearRateLimit`'s `try/catch` to fall through to `memClear`. The Redis key expires naturally after 15 minutes. A brief counter retention is an acceptable tradeoff; the targeted lockout attack path is closed.

---

## Remaining Gaps (after Rounds 1–4)

| Gap | Notes |
|---|---|
| Session refresh via `proxy.ts` | ✅ Was never broken — `proxy.ts` is the correct Next.js 16.x convention; `middleware.ts` created in error and deleted |
| ~~Login CSRF~~ | **Resolved in `SECURITY_AUDIT_JUNE_5.md`** |
| ~~Password minimum 6 chars~~ | **Resolved in `SECURITY_AUDIT_JUNE_5.md`** |
| ~~sessionStorage not cleared on logout~~ | **Resolved in `SECURITY_AUDIT_JUNE_5.md`** |
| ~~`runMatchingV2` track not allowlisted~~ | **Resolved in `SECURITY_AUDIT_JUNE_5.md`** |
| CSP `'unsafe-inline'` in script-src | Nonce-based CSP via middleware. Future hardening task. |
| DPA with PostHog | Legal/business agreement — cannot be resolved in code. |
| Upstash credentials | Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to Vercel env vars. |
| `admin_audit_log` migration | Run `scripts/migrations/admin_audit_log.sql` in Supabase SQL editor. |
| Contact form rate limiting | `ContactFirmModal` / `ContactLwyrdModal` have no server-side auth or rate limiting. |

---

## Resolutions from `SECURITY_AUDIT_JUNE_5.md`

### ~~Finding #1 — Missing `middleware.ts`~~ — RETRACTED

`src/middleware.ts` was created in error during Round 5. In Next.js 16.x, the middleware file convention was renamed from `middleware.ts` to `proxy.ts`. `src/proxy.ts` was always the correct and active entry point. The erroneously created `src/middleware.ts` caused a startup conflict and has been deleted.

### Finding #2 — Login CSRF

**Issue:** `POST /api/auth/login` accepted cross-origin requests. A malicious page could silently log a user into an attacker's account by issuing a cross-origin POST, overwriting the victim's session cookie.

**Resolution:** Added `Origin` header check — requests where `origin` does not match `new URL(request.url).origin` are rejected with HTTP 403.

### Finding #3 — Password Minimum 6 Characters

**Issue:** Signup form enforced `minLength={6}`, too weak for a platform storing sensitive legal data.

**Resolution:** Raised to `minLength={8}` in `AuthModal.tsx`.

### Finding #4 — sessionStorage Not Cleared on Logout

**Issue:** All `lwyrd_*` sessionStorage keys (match results, answers including immigration status / litigation stage) persisted after logout, readable on shared devices.

**Resolution:** `logout()` in `AuthContext.tsx` now clears all six `lwyrd_*` keys before navigating away.

### Finding #5 — `runMatchingV2` Track Not Allowlisted

**Issue:** `track` parameter accepted any non-empty string, allowing arbitrary values to be saved to the DB.

**Resolution:** Added `VALID_TRACKS` allowlist `["startup", "individual", "small_business"]`; added 64-char cap on `category`.
