# Security Audit Report — Lwyrd Platform

**Date:** 2026-06-09
**Scope:** Full platform (Next.js 16, Supabase, React 19)
**Auditor:** Claude Code (AI-assisted)

---

## Audit Checklist

| Category | Status |
|---|---|
| Input sanitization & injection protection | ✅ Pass |
| Authentication & session management | ⚠️ See Finding #3 |
| API / Server Action authorization | ✅ Pass |
| Sensitive data storage & transmission | ⚠️ See Findings #2, #5 |
| Environment variables & secrets | ✅ Pass |
| Third-party dependencies | ✅ Pass |
| Dangerous function usage (eval, dangerouslySetInnerHTML) | ✅ Pass |
| Admin access control | ✅ Pass |
| Client-side data handling (sessionStorage) | ⚠️ See Finding #5 |
| Security headers | ⚠️ See Finding #4 |
| Results paywall enforcement | ❌ See Finding #1 |
| Input validation on server actions | ⚠️ See Finding #6 |
| Admin audit logging | ⚠️ See Finding #7 |

---

## Findings

---

### Finding #1 — Results Paywall Is CSS-Only (Trivially Bypassed)

**File:** `src/app/results/page.tsx:112`
**Severity:** Critical
**Category:** Authorization / Business Logic

**Issue:**
`blurred={!hasAccess}` is a CSS prop. The full match data — firm names, scores, contact info, reasons — is already loaded into React state regardless of access level. Any user can open DevTools, inspect the component state, or read the raw JSON from `sessionStorage.getItem('lwyrd_results')`. This is the core monetization gate and it offers zero real protection.

**Fix:**
Never send the full results to the client for non-paying users. Either server-render a truncated version (e.g., only the top result, firm names redacted), or require a server-side access check before match data is returned at all.

---

### Finding #2 — CAPTCHA Explicitly Disabled on Contact Forms

**File:** `src/lib/formsubmit.ts:16`
**Severity:** High
**Category:** Abuse / Third-Party Data Exposure

**Issue:**
`_captcha: "false"` is hardcoded. The contact forms are openly spammable with automated requests. Contact requests also route through `formsubmit.co`, a third-party service, which means user messages (potentially containing sensitive legal questions) are stored on their servers before being forwarded. Your privacy policy must disclose this.

**Fix:**
Remove `_captcha: "false"` and let formsubmit.co's native CAPTCHA run. Longer term, move contact handling to your own API route so you control data residency.

---

### Finding #3 — Open Redirect in OAuth/Password-Reset Callback

**File:** `src/app/auth/callback/route.ts:8-31`
**Severity:** Medium
**Category:** Authentication / Open Redirect

**Code:**
```typescript
const next = searchParams.get("next") ?? "/";
// ...
return NextResponse.redirect(`${origin}${next}`);  // line 31
```

**Issue:**
`next` is a user-controlled query parameter concatenated directly with the server origin and passed to `NextResponse.redirect()` without validation. A value of `@evil.com/phish` produces `https://lwyrd.co@evil.com/phish`, which URL parsers (per RFC 3986) interpret as host `evil.com` with userinfo `lwyrd.co`. The browser follows the redirect to the attacker's domain.

**Exploit scenario:**
1. Attacker crafts a link encoding `next=@evil.com/credential-harvest` in the callback URL.
2. Victim completes a legitimate login or password-reset flow.
3. Supabase returns a valid `code` to `/auth/callback?code=VALID&next=@evil.com/credential-harvest`.
4. Callback exchanges the code, establishes a session, then redirects the victim to `evil.com`.
5. Victim is now logged in and lands on a phishing page — highly convincing post-auth context.

This is particularly dangerous in the password-reset flow because users are already in a high-trust email-click context.

**Fix:**
```typescript
// src/app/auth/callback/route.ts
const rawNext = searchParams.get("next") ?? "/";
// Accept only paths starting with / and containing no protocol or @
const next = /^\/(?!\/)[^@]*$/.test(rawNext) ? rawNext : "/";
```

---

### Finding #4 — No HTTP Security Headers Configured

**File:** `next.config.ts` (empty)
**Severity:** Medium
**Category:** Defense-in-depth

**Issue:**
The site has no `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Strict-Transport-Security` headers. For a site handling legal consultations:

- Without `X-Frame-Options: DENY` — allows clickjacking.
- Without CSP — a compromised third-party script has full script execution rights on the page.
- Without HSTS — cookie theft via downgrade is possible on first-connect.
- Without `Referrer-Policy` — leaks full URLs (including sensitive paths) to third parties.

**Fix:**
```typescript
// next.config.ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

HSTS is best configured at the hosting layer (Vercel handles it). A full CSP requires inventorying all asset origins but should be done.

---

### Finding #5 — User PII Sent to Third-Party Analytics + Sensitive Answers in sessionStorage

**Files:** `src/context/AuthContext.tsx:88-93`, `src/components/intake/IntakeWizard.tsx`, `src/app/results/page.tsx`
**Severity:** Medium
**Category:** Data Exposure / Compliance

**Issue — PostHog PII:**
Every authenticated user's email and full name are transmitted to PostHog on login with no consent gate:

```typescript
posthog.identify(authUser.id, {
  email: authUser.email,   // PII
  name: authUser.name,     // PII
  is_admin: authUser.isAdmin,
  access_level: authUser.accessLevel,
});
```

For a legal platform, GDPR/CCPA compliance requires lawful basis, privacy policy disclosure, and a Data Processing Agreement with PostHog.

**Issue — sessionStorage:**
Intake answers (immigration status, litigation involvement, criminal matters, family disputes, budget) are written to `sessionStorage` under keys `lwyrd_answers_v2`, `lwyrd_results`, `lwyrd_track` and persist across page refreshes. These are readable by any JavaScript running on the same origin, including third-party analytics scripts.

**Fix — PostHog:**
```typescript
// Remove PII from identify call
posthog.identify(authUser.id, {
  is_admin: authUser.isAdmin,
  access_level: authUser.accessLevel,
});
```

**Fix — sessionStorage:**
Clear intake answer keys immediately after the server action completes and the results page has consumed them. The full answers don't need to live on the client after submission.

---

### Finding #6 — No Input Validation on Server Actions

**Files:** `src/lib/actions/admin/firms.ts`, `questions.ts`, `criteria.ts`, `users.ts`
**Severity:** Medium
**Category:** Input Validation

**Issue:**
Inputs are passed directly to Supabase `.insert()` / `.update()` with no length limits, format checks, or enum validation. Examples:
- `question` field on intake questions has no max length.
- `slug` fields have no format validation — slugs with spaces or special characters break routing.
- `setAccessLevel()` accepts any string at the TypeScript level even though the DB expects `"none" | "subscription" | "org"`.

Supabase parameterizes queries so SQL injection is not a risk, but malformed data and huge strings can still be inserted.

**Fix:**
Add Zod validation at the top of every server action before the DB call:

```typescript
import { z } from "zod";

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(64),
  question: z.string().min(1).max(500),
});
```

---

### Finding #7 — No Audit Log for Admin Actions

**Files:** `src/lib/actions/admin/*.ts`
**Severity:** Medium
**Category:** Compliance / Accountability

**Issue:**
None of the admin server actions (`deleteFirm`, `deleteUser`, `setAdminStatus`, `setAccessLevel`, etc.) record who performed the action and when. If a firm is deleted or a user is promoted to admin, there is no record of which admin account was responsible. For a legal services platform this is a compliance and liability issue.

**Fix:**
Create an `admin_audit_log` table in Supabase and log `actor_id`, `action`, `target_type`, `target_id`, `before`, `after`, `created_at` in every state-changing server action.

---

### Finding #8 — Auth Brute-Force Relies Entirely on Supabase Defaults

**File:** `src/context/AuthContext.tsx:114-122`
**Severity:** Low
**Category:** Authentication

**Issue:**
`signInWithPassword` is called directly from the client with no application-level rate limiting, account lockout, or CAPTCHA after repeated failures. Supabase has some infrastructure-level rate limiting but thresholds are not configurable from the application layer.

**Fix:**
Add a server-side login route rather than calling Supabase auth directly from the client, so you can implement your own rate limiting and alerting.

---

## What Passed

- **SQL/NoSQL injection**: All database operations use the Supabase JS SDK with parameterized queries. No raw SQL. ✅
- **Admin authorization**: `verifyAdmin()` correctly reads the session via `supabase.auth.getUser()` (server-verified JWT) and checks `is_admin` from the database. Every admin server action calls this. The admin layout enforces the check at the routing layer. No bypass path found. ✅
- **Service role key**: `SUPABASE_SERVICE_ROLE_KEY` is server-only (no `NEXT_PUBLIC_` prefix), used exclusively in `"use server"` actions. Not exposed to the client bundle. ✅
- **Secrets in repo**: No `.env` files committed. No hardcoded credentials. `.env.local` is covered by `.gitignore`. ✅
- **Dangerous functions**: No `eval()`, no `dangerouslySetInnerHTML`, no `innerHTML` assignments found. ✅
- **XSS**: React's default escaping protects all rendered content. ✅
- **deleteAccount isolation**: Uses `user.id` from the server-verified session — a user can only delete their own data. ✅
- **CSRF**: Next.js server actions have built-in CSRF origin-checking. ✅
- **Dependencies**: No known CVEs in `next@16.2.3`, `@supabase/supabase-js@^2.103`, `react@19.2.4`. ✅
- **Middleware**: Auth session refresh in `src/proxy.ts` is correctly implemented per Supabase SSR guidance. ✅

---

## Priority Remediation Order

| # | Finding | File(s) | Effort | Impact |
|---|---|---|---|---|
| 1 | Fix results paywall — server-side truncation for unpaid users | `src/app/results/page.tsx` | Medium | Closes monetization bypass |
| 2 | Validate `next` param in auth callback | `src/app/auth/callback/route.ts` | Low | Closes phishing vector in auth flows |
| 3 | Add security headers | `next.config.ts` | Low | Blocks clickjacking, baseline hardening |
| 4 | Re-enable CAPTCHA on contact forms | `src/lib/formsubmit.ts` | Low | Prevents form spam/abuse |
| 5 | Remove PII from PostHog identify | `src/context/AuthContext.tsx` | Low | GDPR compliance |
| 6 | Clear sessionStorage after DB write | `IntakeWizard.tsx`, `results/page.tsx` | Low | Reduces PII exposure window |
| 7 | Add Zod validation to server actions | `src/lib/actions/admin/*.ts` | Medium | Data integrity |
| 8 | Implement admin audit log | `src/lib/actions/admin/*.ts` + new table | Medium | Compliance / accountability |
| 9 | Server-side rate limiting on auth | `src/context/AuthContext.tsx` + new API route | Medium | Brute-force protection |

**Finding #1 (results paywall bypass) is the most urgent** — it is both a security issue and a business issue. Your entire monetization model can be circumvented today with zero technical skill. Finding #2 (open redirect) is the highest-risk security-only issue and is a 10-minute fix.
