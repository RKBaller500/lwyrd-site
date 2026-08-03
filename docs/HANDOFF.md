# LWYRD — Handoff Doc

> Living document, started 2026-07-29. Add to this as you go — the goal is that
> a new intern/worker can get productive without pinging someone for context.
> See also [`CLAUDE.md`](../CLAUDE.md) and [`AGENTS.md`](../AGENTS.md) at the repo
> root — those are the authoritative conventions doc (colors, component rules,
> git workflow); this doc is the narrative tour + gotchas that don't fit there.

## What LWYRD is

A legal services matchmaking platform. A user completes a guided intake
questionnaire (`/intake/[slug]`) describing their legal situation, and a
scoring algorithm (`src/lib/matching.ts`) ranks vetted law firms against it.
Results are access-gated (`/results`) — currently **free for all users until
July 31, 2026** (see the countdown banner on results; paywall code still
exists, see [Paywall / unlocks](#paywall--unlocks-currently-disabled) below).

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000 (falls back to 3001+ if taken)
npm run build    # production build — run before opening a PR
npm run lint
```

Env vars live in `.env.local` (not committed). Required:

| Var | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Supabase clients |
| `ANTHROPIC_API_KEY` | The chatbot (`/api/chat`) |
| `STRIPE_SECRET_KEY` (not set in dev) | Paywall checkout — absent = paywall silently no-ops, doesn't crash the app |

Useful scripts (`scripts/`):
- `npx tsx scripts/seed.ts` — seed firms/categories/questions
- `npx tsx scripts/seed-assessments.ts` — seed pass/fail assessment data
- `npx tsx scripts/fill-missing-assessments.ts` — run after adding a new firm
- `npx tsx scripts/test-matching.ts` — run one randomized intake through the
  matching algorithm and pretty-print the results. **The fastest way to
  sanity-check a matching change before touching the UI.**
- `npx tsx scripts/simulate-matching.ts` / `src/scripts/sim-matches.ts` —
  bulk simulation variants

⚠️ **These scripts do NOT auto-load `.env.local`** (only the seed scripts do
— check for a `dotenv` import at the top of whichever script you're running).
Run bare, `npx tsx scripts/test-matching.ts` silently falls back to the
113-firm offline dataset in `src/data/firms.ts` instead of live Supabase data
— which has very different (much narrower) state/practice-area coverage and
can hide or fake a bug. To test against real data:
```bash
set -a; source .env.local; set +a
npx tsx scripts/test-matching.ts
```
`npm run dev` doesn't have this problem — Next.js loads `.env.local`
automatically.

⚠️ Read [`AGENTS.md`](../AGENTS.md) before assuming Next.js APIs work like you
remember — this repo pins a Next.js version with breaking changes from what
most training data / tutorials assume.

## Codebase map

```
src/
├── app/                    Next.js App Router pages
│   ├── intake/[slug]/      Intake wizard (the questionnaire)
│   ├── results/            Match results (access-gated)
│   ├── firms/[id]/         Public firm profile (SSG)
│   ├── browse/, services/[slug]/   Category browsing (auth required)
│   ├── dashboard/          Consumer-facing: past intakes, saved firms
│   ├── portal/             Law-firm-facing portal (NOT the same as dashboard)
│   ├── account/            User settings
│   ├── admin/              Internal admin panel (is_admin required) — firms,
│   │                       questions, categories, criteria, blog, submissions,
│   │                       users, analytics
│   └── api/chat/           Chatbot backend (Claude via @anthropic-ai/sdk)
├── components/
│   ├── intake/IntakeWizard.tsx   Questionnaire flow — reads question defs from
│   │                              `src/data/intakeV2.ts` ("V2" = the current
│   │                              intake schema; a `src/scripts/migrate-intake-v2.ts`
│   │                              exists, implying an older V1 schema was retired)
│   ├── results/MatchCard.tsx     The match result card (locked + unlocked variants)
│   ├── chatbot/ChatWidget.tsx    Floating chat widget
│   └── ...
├── lib/
│   ├── matching.ts          THE scoring algorithm — see deep dive below
│   ├── supabase/            client.ts (browser), server.ts (server actions,
│   │                        respects RLS + user session), build.ts (SSG,
│   │                        anon/no-session), admin.ts (service-role, admin-only)
│   ├── actions/intake.ts    Server actions that run matching + enforce paywall
│   │                        redaction (`redactMatchResult`)
│   ├── paywallUnlocks.ts    Credit/unlock bookkeeping
│   ├── stripe.ts            Lazy Stripe client (throws only if actually used)
│   └── chatbot/             System prompt + tool defs for the Claude-powered chat
├── data/                    Seed-only source data (`firms.ts` is also the
│                            offline fallback when Supabase isn't configured)
└── types/index.ts           All shared TypeScript interfaces
```

## Key subsystems

### The matching algorithm (`src/lib/matching.ts`)

This is the most complex, most-frequently-touched file in the repo — read it
end to end before changing it, the file's own comments explain *why* almost
every constant is what it is (they're worth trusting; several encode real
past bugs).

Two-stage pipeline:
1. **Hard filters** (`isHardDisqualified`) — a firm is fully excluded if: it's
   not licensed in the user's state for a state-specific practice area
   (family law, personal injury, estate planning, real estate, criminal
   defense, bankruptcy, consumer protection), the user's budget is under 28%
   of the firm's minimum, or there's an extreme company-stage mismatch.
2. **Scoring** — every surviving firm gets points across ~12 weighted signals
   (budget fit, industry, stage, firm size, location, billing model, quality
   score, Google reviews, language, timeline, specialization, firm age).
   Normalized to 0–100, capped at the top 8, floor of 50 to ever show up.

**Known sharp edge:** the state-specific hard filter is legally correct (a
firm can't practice state-specific law where it isn't licensed) but the firm
database only has meaningful state coverage in ~9 states (UT, IL, AZ, NY, FL,
PA, CA, NJ, GA — check `scripts/test-matching.ts` output against live data to
see current coverage). Any other state on those 7 practice areas will
usually fall through to the **partial-match fallback**: when zero firms
survive the hard filter, `matchFirms` returns up to 5 of the closest
disqualified firms instead of the normal 8, each tagged `isPartialMatch:
true` with a `partialMatchReasons` string explaining specifically why (e.g.
"licensed in Illinois, can't handle estate planning in your state"). This is
now correctly wired into `MatchCard.tsx` (badge + real reason text) — if you
see a card with a generic "Matches the legal need described in your intake"
reason, that fallback path is failing to produce a real reason again;
that's a bug, go check `isHardDisqualified`'s return messages are
interpolating real numbers, not static strings.

**Testing changes:** don't just read the code — run
`npx tsx scripts/test-matching.ts` repeatedly, or write a one-off script that
calls `matchFirmsV2` directly against real Supabase data (see the pattern in
`scripts/test-matching.ts`'s `fetchFirms()`). The result *counts* and
*distribution* across many random intakes catch regressions that a single
manual UI test won't — e.g. "does this change collapse every search for
category X to 1 result" is easy to miss by eyeballing one result page.

### Auth & Supabase clients

Four clients, each for a specific context — see the table in `CLAUDE.md`.
Mixing these up is the #1 way to leak service-role access or hit RLS
surprises. `server.ts` respects the logged-in user's session (RLS-scoped);
`build.ts` has no session at all (effectively anonymous — only use in
`generateStaticParams`); `admin.ts` bypasses RLS entirely and must only be
reached through a function that calls `verifyAdmin()` first.

### Paywall / unlocks (currently disabled)

`src/lib/stripe.ts` + `src/lib/paywallUnlocks.ts` implement a credit-based
unlock system (`UNLOCK_TIERS`: single/bundle_3/bundle_5) for full match
results. `STRIPE_SECRET_KEY` isn't set in the current `.env.local`, and the
product is currently in a **free promo period until 2026-07-31** — after
that date, expect the paywall to matter again. `redactMatchResult` in
`lib/actions/intake.ts` is what actually enforces the locked/unlocked split
server-side (never trust a client-side check for this — full match data
must never reach an unpaid session).

### AI chatbot

`src/app/api/chat/route.ts` + `src/lib/chatbot/` (system prompt, tool defs)
+ `src/components/chatbot/ChatWidget.tsx`. Uses `@anthropic-ai/sdk` directly
(`ANTHROPIC_API_KEY`). Chat history persists client-side in `localStorage`
under `lwyrd_chat_history_v1` (see `HISTORY_STORAGE_KEY` in
`ChatWidget.tsx`) — it's per-browser, not synced server-side, so it won't
follow a user across devices and clears if they wipe site data.

### Admin panel

`src/app/admin/**`, gated by `is_admin` — every server action here must call
`verifyAdmin()` first (see `CLAUDE.md` "Always/Never"). Covers firms,
intake questions, categories, assessment criteria, blog, submissions, users,
analytics.

## Recent work log (for context, not a changelog — see `git log` for that)

- Google Reviews are now fully seeded in Supabase (`cost`, `google_review`,
  `google_review_count` columns) and factored into the matching algorithm as
  a Bayesian confidence-weighted signal (`scoreReviews` — a firm with few
  reviews gets pulled toward the pool average so 1 review at 5.0 can't beat
  500 reviews at 4.8).
- Fixed the "quality signals" section reading identically across cards.
- Fixed a bug where searches could collapse to a single match (see the
  partial-match fallback section above).
- Fixed `MatchCard.tsx` showing an arbitrary firm practice area instead of
  the category actually searched.
- All pushed to `preview` as of 2026-07-29.

## Open items / things to watch

- [ ] State coverage for the 7 state-specific practice areas is thin outside
      ~9 states — either add firms in more states, or reconsider whether the
      hard filter should soften for practice areas with near-zero coverage
      in a given state.
- [ ] `README.md` is still the default `create-next-app` boilerplate — worth
      replacing with a pointer to this doc.
- [ ] Confirm Stripe env vars / webhook are ready before 2026-07-31 (free
      promo end date) so the paywall doesn't silently misbehave when it
      starts mattering again.
