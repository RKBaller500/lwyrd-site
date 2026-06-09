# Security Audit Report — Lwyrd Platform (Post-Resolution)

**Date:** 2026-06-09
**Scope:** Full platform re-audit after resolution of all findings in `SECURITY_AUDIT_JUNE.md`
**Auditor:** Claude Code (AI-assisted)
**Previous audit:** `SECURITY_AUDIT_JUNE.md` — all 9 findings resolved (see `RESOLVED_SECURITY_AUDIT.md`)

---

## Audit Checklist

| Category | Status |
|---|---|
| Input sanitization & injection protection | ⚠️ See Finding #2 → now fixed |
| Authentication & session management | ✅ Pass |
| API / Server Action authorization | ✅ Pass |
| Sensitive data storage & transmission | ⚠️ See Finding #1 (residual, architectural) |
| Environment variables & secrets | ✅ Pass |
| Third-party dependencies | ✅ Pass |
| Dangerous function usage (eval, dangerouslySetInnerHTML) | ✅ Pass |
| Admin access control | ✅ Pass |
| Client-side data handling (sessionStorage) | ⚠️ See Finding #1 (residual, architectural) |
| Security headers | ✅ Pass |
| Results paywall enforcement | ⚠️ See Finding #1 (partial fix only) |
| Input validation on server actions | ⚠️ See Finding #2 → now fixed |
| Admin audit logging | ✅ Pass |
| Open redirect | ✅ Pass |
| Rate limiting on auth | ✅ Pass |

---

## Findings

---

### Finding #1 — Results Paywall Still Bypassable via sessionStorage and DOM (Residual)

**File:** `src/components/intake/IntakeWizard.tsx:563-565`, `src/app/results/page.tsx:37`
**Severity:** High
**Category:** Authorization / Business Logic
**Status:** Open — architectural change required

**Issue:**

The previous audit's paywall fix (applied in Finding #1 of `SECURITY_AUDIT_JUNE.md`) was cosmetic. The `blurred` prop prevents users from *seeing* locked cards in the UI, but the full match data is still accessible via two paths:

**Path A — sessionStorage** (zero technical skill required):

`IntakeWizard.tsx:563-565` computes match results entirely on the client with `matchFirmsV2(...)`, then writes the full `MatchResult[]` array to `sessionStorage` before the results page ever loads:

```typescript
const results = matchFirmsV2(track, category, answers, allFirms);
sessionStorage.setItem("lwyrd_results", JSON.stringify(results));
```

Any authenticated user — free or paid — can open the browser console and run:
```javascript
JSON.parse(sessionStorage.getItem('lwyrd_results'))
```
This returns the complete data for every matched firm: name, tagline, location, match score, match reasons, and all structured fields.

**Path B — DOM inspection** (zero code required):

`MatchCard` renders all firm data into the DOM for blurred cards, including `firm.name`, `firm.tagline`, and `reasons`. Tailwind's `blur-sm` class (`filter: blur(4px)`) applies a CSS visual blur but the text nodes remain in the document. Any user can open DevTools → Elements tab and read them directly.

**Exploit scenario:**

1. Free user completes the intake wizard.
2. Browser redirects to `/results`, which reads the full result set from `sessionStorage`.
3. User opens DevTools → Console → `JSON.parse(sessionStorage.getItem('lwyrd_results'))`.
4. Full list of matched firms with names, scores, and contact context is visible.
5. The paid tier that was meant to gate this information is completely bypassed.

**Fix:**

Move match computation server-side. Replace the client-side `matchFirmsV2` call with a server action or API route that:
- Accepts intake answers and category as input
- Runs the matching logic
- For non-paying users: returns only the first result with restricted fields (no contact info, no reasons), or returns all results but replaces firm names/taglines with redacted placeholders
- Saves the (optionally truncated) result to the session or returns it directly to the page

The client should never receive data it isn't entitled to display.

---

### Finding #2 — No Input Validation on `updateProfile` (Fixed)

**File:** `src/lib/actions/profile.ts:7`
**Severity:** Medium
**Category:** Input Validation
**Status:** Fixed in this audit session

**Issue (original):**

`updateProfile(name: string)` passed the `name` parameter directly to `.update()` with only `.trim()` applied — no length limit. Any authenticated user could submit an arbitrarily large string that would be stored in the `profiles` table. PostgreSQL `text` columns have no built-in length limit.

```typescript
// Before — no length check
.update({ name: name.trim(), updated_at: new Date().toISOString() })
```

**Fix applied:**

```typescript
// After — validates before DB write
const trimmed = typeof name === "string" ? name.trim() : "";
if (trimmed.length === 0 || trimmed.length > 128)
  return { error: "Name must be between 1 and 128 characters" };
```

The `name` variable used in the `.update()` call was also changed to `trimmed` so the already-trimmed value is used consistently.

---

## What Passed Cleanly

- **Open redirect fix** — `auth/callback/route.ts` correctly validates `next` with `/^\/(?!\/)[^@]*$/`. Confirmed no other redirect points use unvalidated parameters. ✅
- **Security headers** — `next.config.ts` applies `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `HSTS`, and `Permissions-Policy` to all routes. ✅
- **Admin authorization** — `verifyAdmin()` uses `supabase.auth.getUser()` (server-verified JWT) + `is_admin` from DB. All admin server actions call it at the top. ✅
- **Signup cannot grant `is_admin`** — `signUp` passes only `{ name, role }` to `user_metadata`; `is_admin` is never set at signup and can only be changed via `setAdminStatus` which requires `verifyAdmin()`. ✅
- **CAPTCHA re-enabled** — `formsubmit.ts` no longer sends `_captcha: "false"`. ✅
- **PostHog PII** — `email` and `name` removed from `posthog.identify`. Only `is_admin` and `access_level` are sent. ✅
- **sessionStorage cleanup** — `lwyrd_answers_v2` (full intake answers) is removed in `results/page.tsx` after consumption. ✅
- **Admin input validation** — All 5 admin action files have inline validators with length limits and enum checks. ✅
- **Admin audit log** — `logAdminAction` is called on all state-changing admin operations across 5 files (15 actions total). ✅
- **Rate limiting on login** — `/api/auth/login` enforces 10 attempts per 15-minute window per email. ✅
- **SQL injection** — All DB operations use Supabase JS SDK with parameterized queries. No raw SQL. ✅
- **Service role key** — `SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix and is only used in server contexts. ✅
- **Dangerous functions** — No `eval()`, no `dangerouslySetInnerHTML`, no `innerHTML` assignments found. ✅
- **deleteAccount isolation** — Uses `user.id` from server-verified session. Can only delete own data. ✅
- **CSRF** — Next.js server actions have built-in CSRF origin-checking. ✅

---

## Priority Remediation Table

| # | Finding | Severity | File(s) | Effort | Impact |
|---|---|---|---|---|---|
| 1 | Move match computation server-side; truncate results for non-paying users before writing to sessionStorage | High | `src/components/intake/IntakeWizard.tsx`, new server action/API route | Medium | Closes paywall bypass — the subscription model is currently circumventable with zero technical skill |
| 2 | `updateProfile` name validation | Medium | `src/lib/actions/profile.ts` | Low | **Fixed** in this session — length-bounded to 128 chars |

**Finding #1 is the only open issue.** It requires architectural changes (server-side match computation) rather than a line-level fix. Until it is addressed, the platform's core monetization gate can be bypassed by any authenticated user.

---

## Remaining Gaps (Carried Forward from Previous Audit)

| Gap | Notes |
|---|---|
| Paywall server-side truncation | See Finding #1 above — architectural change needed |
| Content-Security-Policy header | Requires CSP origin inventory across PostHog, Supabase, fonts. Not yet added. |
| GDPR consent gate | Cookie consent banner and DPA with PostHog still needed for GDPR/CCPA compliance. |
| Rate limiter persistence | In-memory Map not shared across serverless instances. Upstash Redis needed for multi-region production. |
| `admin_audit_log` migration | Must be run manually in the Supabase SQL editor (`scripts/migrations/admin_audit_log.sql`). |
