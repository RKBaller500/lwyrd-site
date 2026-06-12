@AGENTS.md

# lwyrd-site

## Overview

LWYRD is a legal services matchmaking platform. Users complete a guided intake questionnaire and get matched with vetted law firms. It handles sensitive personal and legal data — treat all user data, auth tokens, and Supabase credentials with care.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, TailwindCSS 4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Database | Supabase (managed Postgres) |
| Auth | Supabase Auth + `@supabase/ssr` (cookie-based sessions) |
| Analytics | PostHog (off by default; enable via `NEXT_PUBLIC_POSTHOG_ENABLED=true`) |
| Forms | FormSubmit.co (contact forms only) |

No separate backend — all reads go through the browser Supabase client; authenticated writes go through server actions using the service-role client.
https://docs.google.com/spreadsheets/d/17cAMdMyIn_LEIz4kE_X_zqMrR32zd2if/edit?gid=206185866#gid=206185866
---

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build
npm run lint       # ESLint

npx tsx scripts/seed.ts                      # seed firms, categories, questions
npx tsx scripts/seed-assessments.ts          # seed assessment pass/fail data
npx tsx scripts/fill-missing-assessments.ts  # default new firms to all 13 passed
```

---

## Conventions

**Git:** work on `preview`; PR back into `preview`; `main` is production.

**Colors — exact values only:**
- Primary: `#002452` (headlines, buttons, icons)
- Background: `#f5f4f0` (page bg, navbar)
- Surface: `#fbfaf6` (cards, inputs) — never `bg-white`
- Border: `#ddd7cc` — never `#d8d1c5`

**Components:**
- Cards: `rounded-3xl`, `shadow-sm` base, `hover:shadow-md` — never `shadow-md` base
- Buttons: `rounded-2xl`, filled (`bg-[#002452] text-white`) or outlined (`border-[#ddd7cc]`)
- Disabled: `disabled:opacity-50` — never `opacity-40` or `opacity-60`
- Inputs: always `focus:border-[#002452] focus:ring-2 focus:ring-[#002452]/15 transition-colors`
- Headings: Lora serif, weight 500, via inline `style` prop

**Framer Motion:** all animated components need `"use client"`. Shared easing: `[0.25, 0.46, 0.45, 0.94]`. Landing sections use `whileInView`; interior pages use `initial/animate`; intake steps use `AnimatePresence mode="wait"`.

**Supabase clients — use the right one:**
- `client.ts` — browser (public reads)
- `server.ts` — server components / actions
- `build.ts` — SSG `generateStaticParams` only
- `admin.ts` — service-role + `verifyAdmin()` (admin actions only)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    Landing page
│   ├── browse/                     Category browser (auth required)
│   ├── services/[slug]/            Category detail (SSG)
│   ├── intake/[slug]/              Intake wizard (SSG entry, client steps)
│   ├── results/                    Match results (access-gated)
│   ├── access/                     Unlock matches
│   ├── firms/[id]/                 Firm profile (SSG)
│   ├── account/                    Saved firms + settings
│   └── admin/                      Admin panel (is_admin required)
├── components/
│   ├── auth/                       AuthGuard, AuthModal
│   ├── intake/IntakeWizard.tsx     Questionnaire flow
│   ├── results/MatchCard.tsx       Blurred for no-access users
│   ├── firms/                      FirmProfile, SaveFirmButton
│   ├── landing/                    HeroSection, HowItWorks, CategoryPreview, BenefitsCards, ContactSection
│   └── ui/LwyrdLogo.tsx            Logo (variant: "navy" | "white" | "black")
├── context/AuthContext.tsx         user, login(), signup(), logout(), openModal()
├── lib/
│   ├── supabase/                   client, server, build, admin, queries, mappers, types
│   ├── actions/                    savedFirms, profile, saveIntakeSubmission, admin/*
│   └── matching.ts                 Client-side matching algorithm
├── data/                           Seed-only source data (categories.ts also used by CategoryPreview)
├── types/index.ts                  All TypeScript interfaces
└── proxy.ts                        Session refresh middleware (do not add other logic here)
```

---

## Always / Never

**Always:**
- Call `verifyAdmin()` at the top of every admin server action
- Use `createAdminClient()` for admin mutations (bypasses RLS)
- Update `next.config.ts` CSP when adding new external origins
- Run `fill-missing-assessments.ts` after adding a new firm

**Never:**
- Expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Use the admin client outside of admin actions
- Add logic to `src/proxy.ts` beyond session refresh
- Use `bg-white` for card or input backgrounds
- Skip the `verifyAdmin()` call in admin server actions
