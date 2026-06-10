# Security Audit Report — Lwyrd Platform (Round 3)

**Date:** 2026-06-09
**Scope:** Targeted review — areas not covered in Rounds 1 and 2
**Prior audits:** `SECURITY_AUDIT_JUNE.md` (9 findings, all resolved), `SECURITY_AUDIT_JUNE_2.md` (2 findings, both resolved)
**Resolution log:** `RESOLVED_SECURITY_AUDIT.md`

---

## Audit Checklist

| Category | Status | Notes |
|---|---|---|
| `runMatchingV2` authentication | ✅ Pass | `supabase.auth.getUser()` called; unauthenticated returns error |
| `runMatchingV2` input injection | ✅ Pass | Inputs validated; answers passed to pure TS functions; all DB calls parameterized |
| Paywall — `/results` (fresh intake) | ✅ Pass | Fixed in Round 2 |
| **Paywall — `/results/[id]` (past results)** | ❌ FAIL → Fixed | See Finding #1 — full paywall bypass via past results page |
| Signup `role` — server-side privilege escalation | ✅ Pass | `role` in `user_metadata` is display-only; all authorization reads DB |
| Firm detail page data gating | ✅ Pass | Firm data is intentionally public to authenticated users |
| Dashboard / saved firms auth | ✅ Pass | All queries use `user.id` from server-verified session |
| API routes | ✅ Pass | Only `/api/auth/login` exists; properly implemented |
| Intake submission isolation | ✅ Pass | All reads/writes enforce `.eq("user_id", user.id)` |
| Middleware / session refresh | ✅ Pass | `proxy.ts` is cookie-maintenance only; admin access checked in layout + server actions |
| Admin layout enforcement | ✅ Pass | `admin/layout.tsx` + `verifyAdmin()` in every action — defense in depth |
| Open redirect in auth callback | ✅ Pass | Regex validation confirmed |
| Security headers | ✅ Pass | All 5 headers configured |
| PostHog PII | ✅ Pass | Only `is_admin` and `access_level` sent |
| Admin input validation | ✅ Pass | All 5 admin action files have inline validators |
| Admin audit log | ✅ Pass | 15 admin operations instrumented |

---

## Findings

---

### Finding #1 — Past-Results Page Ran Matching Client-Side with No Paywall

**File:** `src/app/results/[id]/page.tsx` (pre-fix)
**Severity:** High
**Category:** Authorization / Business Logic
**Status:** Fixed in this session

**Issue:**

Round 2 fixed the paywall on `/results` (the fresh intake flow) by moving matching to the `runMatchingV2` server action. The fix was not applied to `/results/[id]`, the "past results" page accessible from the dashboard.

That page fetched all firms from Supabase client-side and ran `matchFirmsV2` in the browser with no access level check. All results were written to React state and rendered with `blurred={false}`. A free user could:

1. Complete the intake on `/results` (sees only 1 result due to Round 2 fix).
2. Navigate to their dashboard → click "Results" on the same intake.
3. The browser re-ran the match client-side and showed all results, completely bypassing the paywall.

This made the Round 2 paywall fix trivially bypassable — the exact same session's full results were always one navigation away.

**Fix applied:**

Added `runMatchingForSubmission(submissionId)` server action to `src/lib/actions/intake.ts`:
- Authenticates the caller via `supabase.auth.getUser()`
- Fetches the submission with `.eq("user_id", user.id)` (ownership enforced server-side)
- Fetches firms server-side
- Re-runs `matchFirmsV2` server-side
- Reads `profile.access_level` and applies the same truncation as `runMatchingV2`:
  - Paying users: full results, `lockedCount: 0`
  - Free users: first result only, `lockedCount: total - 1`
- Returns the authorized subset along with submission metadata (category, date)

Updated `src/app/results/[id]/page.tsx`:
- Removed all client-side imports: `createClient`, `matchFirmsV2`, `mapDbFirmToFirm`, `DbFirm`, `useAuth`
- `useEffect` now calls `runMatchingForSubmission(submissionId)` instead of the client-side chain
- Added `lockedCount` state; renders `LockedCard` placeholder components for locked results
- `MatchCard` instances all render with `blurred={false}` since locked results are never sent to the client

---

## What Passed Cleanly

- **`runMatchingV2` injection risk:** `track` and `category` are validated as non-empty strings. The `answers` object is passed to pure TypeScript scoring functions only — no DB writes use answer data directly.
- **Signup privilege escalation:** `signUp` passes only `{ name, role }` to `user_metadata`. Admin status and subscription level are read exclusively from `profiles.is_admin` and `profiles.access_level`, which are RLS-protected. Signing up with any role or metadata value grants zero additional privileges.
- **Firm detail page:** Behind `AuthGuard`. Firm data (name, practice areas, billing model, budget range) is intentionally public to authenticated users. No additional gating needed.
- **Dashboard auth:** Client-side queries use `user.id` from the auth context (populated from `supabase.auth.getUser()` server-verified session). RLS on the database independently enforces ownership.
- **Only one API route:** `/api/auth/login` — has server-side rate limiting, input type validation, and SSR cookie management.
- **Submission isolation:** Even in the pre-fix version, `.eq("user_id", user!.id)` was correctly applied on the submission fetch. A user could not read another user's answers — only the number of results they could see was miscounted.
- **Admin defense-in-depth:** `admin/layout.tsx` performs full server-side auth + DB `is_admin` check for all `/admin/*` routes. Every admin server action also independently calls `verifyAdmin()`. No single point of failure.

---

## Priority Remediation Table

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Past-results page client-side matching / no paywall | High | ✅ Fixed in this session |

---

## Remaining Gaps (carried forward)

| Gap | Notes |
|---|---|
| Content-Security-Policy | Requires origin inventory across PostHog, Supabase, fonts. Not yet added. |
| GDPR consent gate | Cookie consent banner and DPA with PostHog needed. |
| Rate limiter persistence | In-memory Map not shared across serverless instances. Upstash Redis for multi-region. |
| `admin_audit_log` migration | Must be run manually in Supabase SQL editor (`scripts/migrations/admin_audit_log.sql`). |
