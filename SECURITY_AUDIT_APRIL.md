# LWYRD Security Audit

**Date:** April 16, 2026  
**Scope:** Full codebase review — Next.js 16 / Supabase / legal services marketplace  

---

## Summary

The foundation is more solid than expected. `.env.local` is covered by `.gitignore` (`.env*`), so credentials are not in version control. `verifyAdmin()` is called inside every server action that touches sensitive data. The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is correctly server-only — never prefixed with `NEXT_PUBLIC_`. Supabase RLS handles most data-layer access control. The admin layout enforces `is_admin` before rendering any admin page. These are the right instincts.

**However, the site is not production-ready.** See findings below.

---

## 🔴 Critical

### 1. Results paywall is CSS-only — trivially bypassed

**File:** `src/app/results/page.tsx:112`

`blurred={!hasAccess}` is a CSS prop. The full match data — firm names, scores, contact info, reasons — is already loaded into React state at line 17 regardless of access level. Any user can open DevTools, inspect the component state, or read the raw JSON from `sessionStorage.getItem('lwyrd_results')`. This is the core monetization gate and it offers zero real protection.

**Fix:** Never send the full results to the client for non-paying users. Either server-render a truncated version (e.g., only the top result, firm names redacted), or require a server-side access check before match data is returned at all.

---

### 2. No security headers whatsoever

**File:** `next.config.ts` (empty)

The site has no:
- **CSP** (Content Security Policy) — allows XSS to load arbitrary scripts
- **X-Frame-Options / frame-ancestors** — allows clickjacking
- **X-Content-Type-Options** — allows MIME-type sniffing
- **HSTS** — doesn't enforce HTTPS
- **Referrer-Policy** — leaks the full URL (including sensitive paths) to third parties

For a site handling legal consultations, clickjacking and XSS are real concerns.

**Fix:** Add a `headers()` block to `next.config.ts`:

```ts
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      // CSP should be tailored to your actual asset origins
    ],
  }];
}
```

HSTS is best configured at the hosting layer (Vercel handles it). A proper CSP takes more thought but should be done.

---

## 🟠 High

### 3. Sensitive intake answers stored in plaintext sessionStorage

**Files:** `src/components/intake/IntakeWizard.tsx:104–107`, `src/app/results/page.tsx:38`

`IntakeWizard` writes `lwyrd_answers` to sessionStorage — the user's verbatim intake responses: budget, company stage, legal needs, timeline. `results/page.tsx` adds `lwyrd_match_scores` on top of that. This data is:
- Readable by any JavaScript running on the page (including analytics scripts)
- Visible in DevTools to anyone with physical access to the device
- Persists across page refreshes in the same session

For a legal services platform, a user's intake answers — "I need help with an employment dispute" + their budget + company stage — is sensitive data.

**Fix:** Once results are displayed, clear the raw intake answers from sessionStorage. Keep only the score map if needed for the firm detail page. The full answers don't need to live on the client after the intake is submitted.

---

### 4. CAPTCHA explicitly disabled on contact forms, no rate limiting

**File:** `src/lib/formsubmit.ts:16`

`_captcha: "false"` is hardcoded. The contact firm and contact LWYRD forms are openly spammable with automated requests. This also routes through `formsubmit.co`, a third-party service, which means user messages (including potentially sensitive legal questions) are stored on their servers before being forwarded.

**Fix:** At minimum, remove `_captcha: "false"` and let formsubmit.co's native CAPTCHA run. Longer term, move contact handling to your own API route so you control data residency. Add rate limiting via Vercel Edge middleware or Supabase Edge Functions.

---

### 5. No input validation on server actions

**Files:** `src/lib/actions/admin/firms.ts`, `questions.ts`, `criteria.ts`, `users.ts`

Inputs are passed directly to Supabase `.insert()` / `.update()` with no length limits, no format checks, no sanitization. Examples:
- The `question` field on an intake question has no max length
- The `slug` field on a category has no format validation (slugs with spaces or special characters would break routing)
- The `access_level` parameter in `setAccessLevel()` accepts any string even though it should only be `"none" | "subscription" | "org"`

Supabase parameterizes queries so SQL injection isn't a risk, but malformed data, huge strings, or invalid enum values can still be inserted.

**Fix:** Add a validation layer (Zod is the standard choice) to every server action before the DB call.

---

### 6. No audit log for admin actions

None of the admin server actions (`deleteFirm`, `deleteUser`, `setAdminStatus`, `setAccessLevel`, etc.) record who did what and when. If a firm gets deleted or a user gets promoted to admin, there is no record of which admin account was responsible.

For a legal services platform, this is a compliance and liability issue, not just a nice-to-have.

**Fix:** Create an `admin_audit_log` table in Supabase. Log `actor_id`, `action`, `target_type`, `target_id`, `before`, `after`, `created_at` in every state-changing server action.

---

## 🟡 Medium

### 7. Auth brute-force relies entirely on Supabase defaults

**File:** `src/context/AuthContext.tsx:103–115`

`signInWithPassword` has no application-level rate limiting, no account lockout, no CAPTCHA after repeated failures. Supabase does have some built-in rate limiting at the infrastructure level, but you have no visibility into it and no control over the thresholds.

**Fix:** Add a server-side login route (rather than calling Supabase auth directly from the client) so you can implement your own rate limiting and alerting.

---

### 8. Third-party data storage via formsubmit.co

Legal questions and contact requests sent through contact forms are routed through `formsubmit.co` servers before being forwarded to your email. Depending on what users write, this may create data residency issues. Your privacy policy must disclose this.

---

### 9. No error boundaries

A client component crash will white-screen the entire page with no recovery path. `results/page.tsx` has a try/catch on the JSON parse and redirects on failure (good), but the rest of the client-side components have no fallback UI.

---

## ✅ What's Already Handled Correctly

- `.env.local` is in `.gitignore` — credentials are not in git
- `verifyAdmin()` re-checks the database in every server action — the admin check isn't just a JWT claim
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is never exposed to the browser
- Supabase RLS is the correct approach for row-level data protection
- Admin layout enforces `is_admin` before any admin page renders
- Next.js server actions have built-in CSRF origin-checking — this is not an open hole
- `AuthGuard` wraps the results page — unauthenticated users cannot reach it at all

---

## Priority Order

| Priority | Issue | File(s) | Effort |
|----------|-------|---------|--------|
| 1 | Fix results paywall — server-side truncation for unpaid users | `src/app/results/page.tsx` | Medium |
| 2 | Add security headers | `next.config.ts` | Low |
| 3 | Clear intake answers from sessionStorage after results render | `src/components/intake/IntakeWizard.tsx`, `src/app/results/page.tsx` | Low |
| 4 | Re-enable CAPTCHA on contact forms | `src/lib/formsubmit.ts` | Low |
| 5 | Add Zod validation to all server actions | `src/lib/actions/admin/*.ts` | Medium |
| 6 | Implement admin audit log table | `src/lib/actions/admin/*.ts` + new Supabase table | Medium |
| 7 | Add server-side rate limiting on auth | `src/context/AuthContext.tsx` + new API route | Medium |

**The results paywall bypass (#1) is the most urgent** — it is both a security issue and a business issue. Your entire monetization model can be circumvented today with zero technical skill.
