# LWYRD — Site Overview

## What It Is

LWYRD is a legal services matchmaking platform. Users describe their legal needs through a guided intake questionnaire, and the platform matches them with the most relevant law firms from a curated network. The product sits between a directory and a referral service — it does not provide legal advice, but connects people and companies to the right attorneys.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, TailwindCSS 4 |
| Icons | Lucide React |
| Animations | Framer Motion (whileInView for scroll-triggered, initial/animate for on-mount, AnimatePresence for transitions) |
| Database | Supabase (managed Postgres) |
| Auth | Supabase Auth (email + password) |
| Session management | `@supabase/ssr` (cookie-based) |
| Analytics | PostHog (gated by `NEXT_PUBLIC_POSTHOG_ENABLED=true`) |
| Form submission | FormSubmit.co (contact forms only) |
| Hosting | Not yet deployed |

The matching algorithm runs entirely client-side. There is no separate backend server — all data operations go through Supabase directly via the browser client (public reads) or server actions / server components (authenticated writes via service-role client).

---

## Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| Primary | `#002452` | Headlines, buttons, badges, icons |
| Background | `#f5f4f0` | Page background, navbar |
| Surface | `#fbfaf6` | Cards, sidebars, form inputs |
| Border | `#ddd7cc` | All borders and dividers |

### Typography
- **Headings:** Lora (serif), weight 500, applied inline via `style` prop — replaces EB Garamond
- **Body:** System sans-serif stack (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) — set as `--font-sans` CSS variable in `globals.css`
- **Small text / labels:** Tailwind `text-xs`, `text-sm`, slate color scale

### Component Style
- Rounded corners: `rounded-2xl` (buttons, inputs, small cards) and `rounded-3xl` (large cards, profile sections)
- Borders: minimal, always `border-[#ddd7cc]` — never `border-[#d8d1c5]` or other variants
- Shadows: `shadow-sm` base with `hover:shadow-md` on interactive cards — never `shadow-md` base or `hover:shadow-xl`
- Card surfaces: always `bg-[#fbfaf6]` — never `bg-white` for card backgrounds
- Buttons: two states — filled (`bg-[#002452] text-white`) and outlined (`border-[#ddd7cc] text-slate-600`)
- Disabled buttons: always `disabled:opacity-50` — never `opacity-40`, `opacity-60`, or other values
- Badges / tags: `rounded-full`, either `bg-[#002452] text-white px-3 py-1.5` (solid) or `bg-[#002452]/8 text-[#002452] px-3 py-1` (light tint)
- Icon containers (light bg): `rounded-2xl bg-[#002452]/8 border border-[#ddd7cc]`; size `w-10 h-10` (compact), `w-11 h-11` (card-level), `w-12 h-12` (featured)
- Inputs / textareas: always include `focus:border-[#002452] focus:ring-2 focus:ring-[#002452]/15 transition-colors`; start with `border-[#ddd7cc]` in all states including "other" follow-up inputs

### Logo
The LWYRD logo is served as PNG images from `/public/Logos/`. `src/components/ui/LwyrdLogo.tsx` wraps `next/image` and accepts a `variant` prop:
- `"navy"` → `/Logos/LWYRD_Navy.png` — used in Navbar (on cream background)
- `"white"` → `/Logos/LWYRD_White.png` — used in Footer (on navy background)
- `"black"` → `/Logos/LWYRD_Black.png` — available for dark/non-navy backgrounds

The Navbar logo uses `priority` for LCP. Sizing is controlled via Tailwind height classes (`h-8 w-auto`, `h-6 w-auto`) — the component sets `style={{ width: "auto" }}` to maintain the correct 4.1:1 aspect ratio.

### Animations
Framer Motion is used throughout the site. All components that animate are marked `"use client"`. The shared easing curve is `[0.25, 0.46, 0.45, 0.94]` (smooth ease-out) applied consistently everywhere.

**Patterns used:**
- **Scroll-triggered (landing page sections):** `whileInView` + `viewport={{ once: true, margin: "-60px" }}` with `variants` for stagger groups
- **On-mount (interior pages):** `initial` / `animate` — starts playing immediately when the component mounts
- **Step transitions (intake):** `AnimatePresence mode="wait"` with directional x-slide — direction state (`1` for forward, `-1` for back) controls slide direction

| Component | Pattern | Details |
|---|---|---|
| `HeroSection` | On-mount stagger | Headline → subtext → CTAs → trust strip → "L" watermark |
| `HowItWorks` | whileInView stagger | Header fade-up, then step cards stagger (staggerChildren: 0.12) |
| `CategoryPreview` | whileInView stagger | Header fade-up, then tile grid stagger |
| `BenefitsCards` | whileInView stagger | Header fade-up, then card stagger |
| `ContactSection` | whileInView stagger | Both cards stagger in (staggerChildren: 0.14) |
| `Navbar` | On-mount | `motion.header` slides down from y:-10 with opacity fade |
| `BrowseCategoryGrid` | On-mount stagger | Category cards stagger in (staggerChildren: 0.05) |
| `ResultsContent` | On-mount stagger | Match cards stagger in after sessionStorage loads |
| `AccessContent` | On-mount stagger | Back link → header → option cards → reassurance |
| `FirmProfile` | On-mount stagger | Breadcrumb → main col → sidebar |
| `AccountContent` | On-mount stagger | Outer container with variant-based stagger |
| `IntakeWizard` | AnimatePresence | Per-step directional slide + fade (duration: 0.28s) |

The Navbar adds a `scrolled` state on `window.scrollY > 20` that applies `backdrop-blur-md` and a subtle shadow for a glass effect when the user scrolls.

---

## Routes

### Public / User-facing

| Route | Access | Rendered | Purpose |
|---|---|---|---|
| `/` | Public | Static | Landing page |
| `/browse` | Auth required | Dynamic (SSR) | Browse all legal categories |
| `/services/[slug]` | Auth required | SSG | Category detail page |
| `/intake/[slug]` | Auth required | SSG | Multi-step intake questionnaire |
| `/results` | Auth required | Static (client) | Matching results from sessionStorage |
| `/access` | Auth required | Static (client) | Unlock matches — Individual and Org access options |
| `/firms/[id]` | Auth required | SSG | Full law firm profile |
| `/account` | Auth required | Dynamic (SSR) | Saved firms + profile settings |

### Admin Panel (`/admin/*`)

| Route | Purpose |
|---|---|
| `/admin` | Dashboard — stat cards for firms, categories, questions, criteria, users |
| `/admin/firms` | List all firms with edit/delete |
| `/admin/firms/new` | Create a new firm |
| `/admin/firms/[id]` | Edit an existing firm (all fields + assessment) |
| `/admin/categories` | List all legal categories |
| `/admin/categories/new` | Create a category |
| `/admin/categories/[slug]` | Edit a category |
| `/admin/questions` | List all intake questions |
| `/admin/questions/new` | Create a question |
| `/admin/questions/[id]` | Edit a question |
| `/admin/criteria` | List all LWYRD Assessment criteria |
| `/admin/criteria/new` | Create a criterion |
| `/admin/criteria/[id]` | Edit a criterion |
| `/admin/users` | List all users — set access level, toggle admin, delete accounts |

SSG pages use `generateStaticParams` to pre-render at build time via a cookie-free build-time Supabase client (`src/lib/supabase/build.ts`).

---

## User Flow

```
Landing page (/)
  └─ Sign up or sign in (modal overlay)
       └─ Browse legal categories (/browse)
            └─ Click a category card
                 └─ Service detail page (/services/[slug])
                      └─ "Start Intake" button
                           └─ Intake wizard (/intake/[slug])
                                └─ Global questions + category-specific questions
                                     └─ Review summary
                                          └─ "Find My Matches"
                                               └─ Results page (/results)
                                                    ├─ [No access] Blurred cards + banner → /access
                                                    │     └─ Contact LWYRD to get access
                                                    └─ [Has access] Full match cards
                                                          └─ "View Profile" → Firm detail (/firms/[id])
                                                               └─ "Save" button → saves to account
                                                                    └─ Account page (/account)
```

Users can also save firms directly from the results page (compact bookmark icon on each match card), and unsave from anywhere the button appears.

---

## Authentication

- Email + password via Supabase Auth
- Sessions are stored in cookies (not localStorage) and refreshed on every request via `src/proxy.ts`
- On signup, a `profiles` row is auto-created via a Postgres trigger (`handle_new_user`)
- `AuthProvider` in `src/context/AuthContext.tsx` wraps the entire app and exposes `user`, `login()`, `signup()`, `logout()`, `openModal()`
- Logging out always redirects to `/` via `router.push("/")`
- `AuthGuard` component wraps all protected user-facing pages — shows loading state during hydration, opens login modal if unauthenticated
- The login/signup UI is a modal overlay (`AuthModal`) with a tab switcher

### User Types

| Type | Description |
|---|---|
| Regular user (no access) | Can browse and run intake, but match results are blurred |
| Regular user (subscription) | Full access to match results, firm profiles, and contact details |
| Regular user (org) | Same as subscription — granted via organization partnership |
| Admin user | All of the above + full access to `/admin` panel (automatically has full match access) |

Admin status is stored as `is_admin: boolean` on the `profiles` table. Access level is stored as `access_level: "none" | "subscription" | "org"` on the same table. Admin users always have full access regardless of `access_level`.

Admin pages verify `is_admin` server-side in `src/app/admin/layout.tsx` and all admin server actions call `verifyAdmin()` before executing. The navbar shows an "Admin" link only when `user.isAdmin === true`.

---

## Access Gating

Match results on `/results` are gated by access level:

- **No access (`access_level = "none"`):** All match cards are blurred. Firm name, tagline, location, match reasons, and contact details are hidden behind CSS blur. Visible: rank, match score, score bar, firm size, practice area, LWYRD assessment pass rate. A dark banner above the results directs users to `/access`.
- **Has access (`subscription`, `org`, or `is_admin`):** Full match cards with "View Profile" links and save buttons.

The `/access` page presents two options — Individual Access and Organization Access — each with a benefit list and a CTA that opens `ContactLwyrdModal`. Access is granted manually by an admin via the Users admin panel (`/admin/users`).

To grant access in the admin panel: select a user's access level from the dropdown in the Access column.

---

## Data Layer

### Database Tables (Supabase)

| Table | Description |
|---|---|
| `profiles` | One row per user — name, `is_admin` flag, `access_level` ("none"/"subscription"/"org"), linked to `auth.users` |
| `legal_categories` | Practice area categories |
| `intake_questions` | All questionnaire questions — `category_slug = "global"` for shared questions |
| `intake_submissions` | Persisted intake answers — one row per submission, keyed by user ID, category slug, and timestamp |
| `firms` | Law firms with full profile data |
| `attorneys` | Individual attorneys, linked to firms via `firm_id` |
| `assessment_criteria` | Standard LWYRD Assessment criteria (13 quality/vetting standards) |
| `firm_assessment_items` | Per-firm pass/fail results for each criterion, with optional notes |
| `saved_firms` | User ↔ firm bookmarks (many-to-many) |

### Row Level Security
- `profiles` and `saved_firms`: users can only read/write their own rows
- `intake_submissions`: users can only write their own rows; admin reads all
- `firms`, `attorneys`, `firm_assessment_items`, `legal_categories`, `intake_questions`: public read, no write from client
- `assessment_criteria`: public read for active criteria; writes only via service-role client (admin actions)
- All admin mutations bypass RLS using a service-role Supabase client (`src/lib/supabase/admin.ts`)

### Source Files
The original hardcoded data files (`src/data/firms.ts`, `src/data/categories.ts`, `src/data/intake.ts`) still exist. `categories.ts` is also used by the `CategoryPreview` landing page component for the static category tile grid. All runtime DB queries go through `src/lib/supabase/queries.ts`.

---

## Legal Categories

Currently 12 categories: Startup Law, Fund Formation, Intellectual Property, Personal Injury, Employment Law, Corporate Formation, Mergers & Acquisitions, Immigration, Tax Law, Family Law, Real Estate, Contract Law.

Manageable at `/admin/categories`.

---

## Law Firms

| Firm | Location | Size | Specialty |
|---|---|---|---|
| Meridian Legal Group | San Francisco, CA | Mid-size | Startup law |
| Apex Ventures Law | New York, NY | Boutique | Fund formation |
| Nova IP Partners | Austin, TX | Boutique | Intellectual property |
| Harbor Employment Law | Chicago, IL | Mid-size | Employment law |
| Summit M&A Advisors | New York, NY | Large | Mergers & acquisitions |
| Pacific Immigration Law | Los Angeles, CA | Boutique | Immigration |
| Clover Family Law | Denver, CO | Boutique | Family law |
| Axiom Tax Group | Dallas, TX | Mid-size | Tax law |
| Ironclad Real Estate Law | Miami, FL | Mid-size | Real estate |
| Vertex Corporate Law | San Francisco, CA | Large | Corporate formation |
| Brightfield Personal Injury | Phoenix, AZ | Mid-size | Personal injury |
| Centennial Fund Law | Boston, MA | Large | Fund formation |

Manageable at `/admin/firms`. New firms added via admin get all 13 assessment criteria defaulted to passed — run `npx tsx scripts/fill-missing-assessments.ts` after adding any new firm to populate their assessment.

---

## LWYRD Assessment

Every firm in the network is evaluated against 13 universal quality and vetting criteria before being listed. These are not practice-area-specific capability checks — they are operational and professional standards that any reputable firm should meet.

**The 13 criteria:**
1. Active & In Good Standing with State Bar
2. No Disciplinary History (Past 5 Years)
3. Carries Professional Liability Insurance
4. Client References Verified
5. Minimum 5 Years in Core Practice Area
6. Written Engagement Agreement Provided
7. Conflicts of Interest Check Performed
8. Dedicated Point of Contact for Each Client
9. Responds to Client Inquiries Within 48 Hours
10. Transparent Fee Structure Disclosed Upfront
11. Itemized Billing Provided
12. Secure Document Handling & Confidentiality Practices
13. Proactively Communicates Relevant Legal Updates

The criteria list is stored in the `assessment_criteria` table and manageable via `/admin/criteria`. Each firm's results (pass/fail + optional note per criterion) are stored in `firm_assessment_items`.

Because all listed firms are heavily vetted before onboarding, every firm passes 12–13 of the 13 criteria. The assessment is displayed on each firm's public profile page as a checklist with a summary count ("X/13 criteria met"). The pass rate also feeds into the match score.

---

## Intake Questionnaire

Each intake session consists of global questions (shown for every category) plus category-specific questions.

**Global questions (8):**
1. Industry
2. Company stage
3. Timeline / urgency
4. Monthly budget
5. Prior legal counsel experience
6. Attorney seniority preference
7. Location preference
8. Languages needed

**Category-specific questions (1–3 per category):** Targeted to the practice area — e.g., funding round and co-founder count for Startup Law, fund type and LP count for Fund Formation, incident type for Personal Injury, etc.

**Question types:** `single-select`, `multi-select`, `text`, `scale`, `budget-range`

Answers are stored in sessionStorage during the session and also persisted to the `intake_submissions` table in Supabase (fire-and-forget via `src/lib/actions/saveIntakeSubmission.ts` — never blocks navigation).

Questions are manageable at `/admin/questions`.

---

## Matching Algorithm

File: `src/lib/matching.ts`

Runs entirely in the browser after the intake is submitted. Steps:

1. **Hard filter:** Only firms whose `practiceAreas` array includes the selected category slug are considered.
2. **Scoring (8 weighted criteria):**

| Criterion | Weight |
|---|---|
| Company stage compatibility | 20% |
| Budget fit | 20% |
| Industry experience | 15% |
| Timeline / response time | 10% |
| Attorney seniority preference | 10% |
| Location / state licensing | 10% |
| LWYRD Assessment pass rate | 10% |
| Language support | 5% |

3. **Output:** Array of `MatchResult` objects sorted by score (0–100), with the top firm flagged as `isBestMatch` if its score is ≥ 70. Each result includes human-readable match reasons and missed criteria.

### Score Consistency
When a user clicks "View Profile" from the results page, the match score is stored in `sessionStorage` as a `firmId → score` map (`lwyrd_match_scores`). The firm detail page reads this and displays the same match score instead of the static LWYRD Score. If the firm page is visited directly (no session context), it falls back to the firm's `overallScore` from the database.

---

## Saved Firms Feature

- **Save button** appears in two places: the sidebar of every firm profile page (full button with label), and the bottom-right of each match card on the results page (compact icon-only button)
- Clicking save when not logged in opens the login modal
- Saves use optimistic UI — the button toggles instantly and reverts if the server action fails
- Saved state is stored in the `saved_firms` Supabase table with RLS
- The `/account` page fetches saved firms server-side and renders a card grid
- Unsaving works from any button instance — account page, firm profile, or results

---

## Landing Page

The landing page (`/`) is composed of these sections in order:

| Section | Component | Background | Purpose |
|---|---|---|---|
| Hero | `HeroSection` | `#f5f4f0` | Headline, CTAs, trust strip |
| How it works | `HowItWorks` | `#002452` (navy) | 3-step process: Browse → Intake → Get matched |
| Legal services | `CategoryPreview` | `#f5f4f0` | 6 featured category tiles linking to `/services/[slug]` |
| Why LWYRD | `BenefitsCards` | `#f5f4f0` | 3 value-prop cards with top border divider |
| Contact | `ContactSection` | `#f5f4f0` | Contact form + email signup |

The `HowItWorks` section is the only dark (navy) section on the landing page and provides the main contrast break. `StayTunedCallout` has been removed and replaced by `HowItWorks`.

---

## Analytics

PostHog is integrated via `src/components/providers/PostHogProvider.tsx`. It is disabled by default — set `NEXT_PUBLIC_POSTHOG_ENABLED=true` in `.env.local` to enable. When enabled:

- Manual `$pageview` events are fired on route changes (App Router compatible — `capture_pageview: false` is set on init to prevent double-firing)
- Users are identified on login with `email`, `name`, `is_admin`, and `access_level`
- PostHog is reset on logout

---

## Admin Panel

The admin panel (`/admin`) is accessible only to users with `is_admin = true` on their profile. Access is enforced at two levels: the layout server component redirects non-admins before rendering, and every admin server action calls `verifyAdmin()`.

### Admin Server Actions

| File | Actions |
|---|---|
| `src/lib/actions/admin/firms.ts` | `createFirm`, `updateFirm`, `deleteFirm` |
| `src/lib/actions/admin/categories.ts` | `createCategory`, `updateCategory`, `deleteCategory` |
| `src/lib/actions/admin/questions.ts` | `createQuestion`, `updateQuestion`, `deleteQuestion` |
| `src/lib/actions/admin/assessmentCriteria.ts` | `createAssessmentCriterion`, `updateAssessmentCriterion`, `deleteAssessmentCriterion` |
| `src/lib/actions/admin/users.ts` | `getAllUsers`, `setAdminStatus`, `setAccessLevel`, `deleteUser` |

All actions use `createAdminClient()` (service-role key, bypasses RLS) after `verifyAdmin()` confirms the requesting user is an admin.

### Granting Admin Access
In Supabase SQL Editor:
```sql
UPDATE profiles SET is_admin = true WHERE id = 'your-user-uuid';
```

### Granting Match Access
Via the admin UI at `/admin/users` — use the access level dropdown next to any user to set `none`, `subscription`, or `org`.

---

## Scripts

| Script | Purpose |
|---|---|
| `scripts/seed.ts` | One-time seed of all firms, categories, and intake questions |
| `scripts/seed-assessments.ts` | Seeds pass/fail assessment data for all known firms |
| `scripts/fill-missing-assessments.ts` | Finds any firm with no assessment items and defaults all 13 to passed. Run after adding new firms. |

---

## Key Files Reference

```
src/
├── app/
│   ├── page.tsx                              Landing page
│   ├── browse/page.tsx                       Category browser
│   ├── intake/[slug]/page.tsx                Intake entry point
│   ├── results/page.tsx                      Match results (access-gated)
│   ├── access/page.tsx                       Unlock matches page
│   ├── firms/[id]/page.tsx                   Firm detail
│   ├── services/[slug]/page.tsx              Category detail
│   ├── account/page.tsx                      User account
│   └── admin/
│       ├── layout.tsx                        Admin auth guard + layout
│       ├── page.tsx                          Dashboard
│       ├── firms/                            Firms CRUD
│       ├── categories/                       Categories CRUD
│       ├── questions/                        Questions CRUD
│       ├── criteria/                         Assessment criteria CRUD
│       └── users/                            User management + access level
├── components/
│   ├── auth/AuthGuard.tsx                    Route protection
│   ├── auth/AuthModal.tsx                    Login/signup modal
│   ├── admin/
│   │   ├── AdminSidebar.tsx                  Admin nav
│   │   ├── FirmForm.tsx                      Firm create/edit form
│   │   ├── CategoryForm.tsx                  Category create/edit form
│   │   ├── QuestionForm.tsx                  Question create/edit form
│   │   ├── AssessmentCriterionForm.tsx       Criterion create/edit form
│   │   └── AdminUserActions.tsx              Access level dropdown, toggle admin, delete user
│   ├── firms/FirmProfile.tsx                 Full firm display (shows match score if available)
│   ├── firms/SaveFirmButton.tsx              Bookmark toggle
│   ├── intake/IntakeWizard.tsx               Questionnaire flow
│   ├── landing/
│   │   ├── HeroSection.tsx                   Hero with trust strip
│   │   ├── HowItWorks.tsx                    3-step process (dark navy bg)
│   │   ├── CategoryPreview.tsx               6 featured category tiles
│   │   ├── BenefitsCards.tsx                 3 value-prop cards
│   │   └── ContactSection.tsx               Contact form + email signup
│   ├── results/MatchCard.tsx                 Match card (blurred variant for no-access users)
│   ├── account/AccountContent.tsx            Account page UI
│   ├── ui/LwyrdLogo.tsx                      PNG-based logo via next/image (variant prop: "navy" / "white" / "black")
│   ├── ui/ContactLwyrdModal.tsx              Contact LWYRD modal (used on /access)
│   └── layout/
│       ├── Navbar.tsx                        Global nav with pill hover states
│       └── Footer.tsx                        Footer with white logo + text
├── context/AuthContext.tsx                   Auth state + accessLevel + PostHog identify
├── providers/PostHogProvider.tsx             PostHog init + pageview tracking
├── lib/
│   ├── supabase/client.ts                    Browser Supabase client
│   ├── supabase/server.ts                    Server Supabase client (cookies)
│   ├── supabase/build.ts                     Build-time client (no cookies)
│   ├── supabase/admin.ts                     Service-role client + verifyAdmin()
│   ├── supabase/queries.ts                   All data-fetching functions
│   ├── supabase/mappers.ts                   DB row → app type conversion
│   ├── supabase/types.ts                     DB row TypeScript interfaces
│   ├── actions/savedFirms.ts                 Save/unsave server actions
│   ├── actions/profile.ts                    Profile update server action
│   ├── actions/saveIntakeSubmission.ts       Persist intake answers to DB (fire-and-forget)
│   └── matching.ts                           Matching algorithm
├── data/
│   ├── firms.ts                              Source data (seed script only)
│   ├── categories.ts                         Source data + CategoryPreview component
│   └── intake.ts                             Source data (seed script only)
├── types/index.ts                            All TypeScript interfaces
└── proxy.ts                                  Session refresh (Next.js 16 middleware)
scripts/
├── seed.ts                                   One-time DB population
├── seed-assessments.ts                       Assessment data seed
└── fill-missing-assessments.ts              Fill gaps for new firms
```

---

## Contact / Form Submission

The "Contact This Firm" flow (from the firm profile sidebar) and the general contact form on the landing page both submit via [FormSubmit.co](https://formsubmit.co) to `rahul@lwyrd.co`. This is handled by `src/lib/formsubmit.ts` and the `ContactFirmModal` / `ContactLwyrdModal` components. These are separate from the Supabase backend.
