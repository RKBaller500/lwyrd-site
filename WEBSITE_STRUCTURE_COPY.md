# LWYRD — Complete Site Copy & Structure Audit

This document catalogs every page, section, and piece of copy on the LWYRD website exactly as it currently exists in the codebase. It is intended as a reference for a full content overhaul: every heading, subheading, body paragraph, label, button, pill tag, placeholder, and status message is recorded verbatim.

---

## GLOBAL ELEMENTS

### Navbar

The navbar is sticky, appears on every page, and has two states based on authentication.

**Logo:** LWYRD wordmark (SVG, navy variant)

**Logged-out nav links (desktop):**
- How It Works
- About
- Sign in *(button)*
- Contact Us *(filled navy pill button)*

**Logged-in nav links (desktop):**
- Get Matched
- How It Works
- About
- Contact
- Admin *(only visible to admin users)*
- [User's name] *(account link with dropdown)*

**Account dropdown (logged-in):**
- Profile
- Settings
- Support
- Sign out *(separated, red on hover)*

---

### Footer

**Tagline (below logo):**
> Making specialized legal services accessible.

**Column: Platform**
- Get Matched
- How It Works
- Contact Us

**Column: Company**
- About
- FAQ
- Privacy Policy
- Terms of Service

**Bottom bar:**
> © [year] LWYRD. All rights reserved.

---

## PAGE: Home (`/`)

The homepage assembles six landing sections in this order:

1. HeroSection
2. HowItWorks
3. CategoryPreview
4. BenefitsCards
5. BrowseCta
6. ContactSection

---

### Section 1 — Hero

**Visual:** Full-width cream (`#f5f4f0`) section with a decorative oversized watermark "L" in the top-right corner. Centered text layout.

**H1:**
> Making Specialized Legal Services Accessible

**Body paragraph:**
> LWYRD helps startups, small businesses, and individuals get access to specialized legal help through our curated network of vetted law firms and guided tools that help you understand your legal needs before hiring.

**Buttons (side by side):**
- `Get Matched` → `/intake` (primary, navy, with arrow icon) — *triggers login modal if not authenticated*
- `Book a Consultation` → `/contact` (outline, navy border)

**Trust strip (icon + label, four items):**
- ✓ Vetted law firms
- ✓ Structured intake
- ✓ No cold calls
- ✓ Free to match

---

### Section 2 — How It Works

**Visual:** Navy (`#002452`) background. Overline label + h2, then a three-column step grid. Link at bottom.

**Overline label:** THE PROCESS

**H2:**
> How LWYRD works

**Step 01:**
- Title: *Tell us your situation*
- Body: Answer a short guided intake — who you are, what you need, and what matters most to you. No legal jargon.

**Step 02:**
- Title: *We assess your needs*
- Body: Your answers are scored against our curated network of vetted firms across every area of law.

**Step 03:**
- Title: *Get matched*
- Body: We surface the firms best suited to your needs, scored and ranked by the LWYRD assessment.

**Bottom link:**
> Learn more about the process → *(links to `/how-it-works`)*

---

### Section 3 — Who We Serve (Category Preview)

**Visual:** Cream background. Overline label + h2, then three cards in a grid.

**Overline label:** WHO WE SERVE

**H2:**
> Legal help built around you

**Card 1 — Startups**
- Tagline: *From formation to fundraising*
- Body: Whether you're incorporating, closing a seed round, protecting IP, or navigating employment agreements, LWYRD connects early-stage founders with firms that specialize in startup law.
- Example pills: Entity formation · Fundraising & SAFEs · IP assignment · Equity & cap tables
- Link: `Get matched →`

**Card 2 — Small Businesses**
- Tagline: *Built for growth, not just survival*
- Body: Running a business comes with real legal complexity. We match small business owners with firms experienced in contracts, employment, commercial real estate, and litigation.
- Example pills: Contracts & vendors · Employment compliance · Business disputes · Regulatory matters
- Link: `Get matched →`

**Card 3 — Individuals**
- Tagline: *Personal legal needs, handled with care*
- Body: From family law and immigration to employment disputes and personal injury, LWYRD helps individuals find specialized legal representation without the guesswork.
- Example pills: Family & divorce · Immigration · Employment disputes · Personal injury
- Link: `Get matched →`

---

### Section 4 — Why LWYRD (Benefits)

**Visual:** Navy background. Overline label + h2 with link to About, then stacked rows separated by dividers.

**Overline label:** OUR APPROACH

**H2:**
> Why LWYRD

**Link (top right):**
> Learn more about LWYRD → *(links to `/about`)*

**Row 01:**
- Title: *Curated attorney matching*
- Body: We focus on fit, not just visibility. LWYRD helps people find lawyers based on the actual issue at hand, so they spend less time sorting through noise and more time talking to the right specialist.

**Row 02:**
- Title: *Guided education*
- Body: Legal issues are confusing when you do not know where to start. We give users clearer context around what they may need before they reach out, so the process feels more informed from the very beginning.

**Row 03:**
- Title: *Structured intake*
- Body: Good legal relationships start with better information. Our intake approach helps surface the basics early, making it easier for both the client and the firm to understand whether there is a real match.

---

### Section 5 — Get Started CTA (BrowseCta)

**Visual:** Navy background. Left-aligned text, right-aligned button.

**Overline label:** GET STARTED

**H2:**
> Find the right firm for your situation

**Button:**
> `Get Matched →` *(white button, navy text; triggers login modal if not authenticated)*

---

### Section 6 — Stay Updated (Contact/Newsletter)

**Visual:** Cream background with top border. Centered card.

**Card header (with mail icon):**
> Stay Updated

**Card body:**
> Subscribe to receive product updates, new firm announcements, and legal insights.

**Input placeholder:** Your email

**Button:** Subscribe *(+ mail icon)*

**Success state:**
> You are on the list. We will keep you posted.

**Error state:**
> Something went wrong. Please try again.

---

## PAGE: About (`/about`)

**Page title metadata:** *(not explicitly set in this file)*

**Visual structure:** Cream background. Hero → What We Do → Our Values → LWYRD Assessment (navy) → CTA.

---

### Section 1 — Hero

**Pill label:** Our Story

**H1:**
> Expanding Access to Specialized Legal Help

**Body paragraph:**
> Legal help is one of the most important services people will ever need, and one of the hardest to navigate. LWYRD was built to change that — to create a guided, structured path from legal problem to the right specialist.

---

### Section 2 — What We Do / The Problem We Solve

**Two-column layout:** Left = narrative copy, Right = How It Works visual card.

**Left column:**

Overline label: WHAT WE DO

**H2:**
> The problem we solve

**Three paragraphs:**
> Most people who need legal help do not know where to start. They search online, get overwhelmed by generic directories, and either pick a firm at random or give up entirely. The result is a mismatch — a client paired with a generalist when they needed a specialist, or a firm taking on a case that was never a good fit.

> LWYRD is a curated legal matchmaking platform. We guide people through a structured intake process to understand their specific situation, then surface the law firms best suited to their needs — scored and ranked by a real vetting standard, not by who paid to appear first.

> We are not a law firm. We do not provide legal advice. What we provide is a better starting point: the clarity, context, and confidence to walk into the right firm's office and get real help.

**Right column — How It Works visual card:**

Overline: HOW IT WORKS

Three steps (with icon, number, label, and subtext):

| # | Label | Subtext |
|---|-------|---------|
| 01 | Intake | Tell us who you are and what you need — no legal jargon |
| 02 | Assess | Your answers are scored against our vetted firm network |
| 03 | Match | We surface the firms best suited to your specific situation |

---

### Section 3 — Our Values

**Overline:** OUR VALUES

**H2:**
> What we stand for

**Card 1 — Transparency**
> LWYRD is clear about what it is and what it is not. We are not a law firm and do not provide legal advice. We surface information, explain tradeoffs, and let you make the call — with the right specialist by your side.

**Card 2 — Accessibility**
> Legal help should not require knowing someone who knows someone. Our intake process is designed to be approachable and jargon-free, so anyone can start the process of finding the right firm — regardless of prior legal experience.

**Card 3 — Quality**
> Every firm on LWYRD has passed a 13-point assessment. We evaluate bar standing, experience depth, client responsiveness, fee transparency, and more — so the firms you see are ones we would feel confident recommending.

---

### Section 4 — LWYRD Assessment (navy)

**Overline:** OUR STANDARD

**H2:**
> The LWYRD Assessment

**Body:**
> Every firm on LWYRD is evaluated against a 13-point universal standard before appearing on the platform. The Assessment covers bar standing and disciplinary history, depth of experience in core practice areas, client responsiveness commitments, written engagement standards, and full fee transparency — among other criteria. A firm's Assessment score is factored into every match, so quality is built into the algorithm, not bolted on afterward.

**Three stats:**
- 13 — Points of evaluation
- 100% — Firms vetted before listing
- Zero — Pay-to-play listings

---

### Section 5 — CTA

**H2:**
> Ready to find the right firm?

**Body:**
> Start the guided intake — tell us who you are and what you need. It takes about five minutes, and there is no cost to get matched.

**Buttons:**
- `Get Matched` → `/intake` (primary)
- `Contact Us` → `/contact` (outline)

---

## PAGE: How It Works (`/how-it-works`)

**Visual structure:** Cream hero → Step-by-step detail section → LWYRD Assessment (navy) → Why It Matters → CTA.

---

### Section 1 — Hero

**Pill label:** The Process

**H1:**
> How LWYRD Works

**Body:**
> From your legal situation to the right specialist — a clear, guided path with no cold calls, no guesswork, and no pay-to-play rankings.

---

### Section 2 — Steps (detailed)

Three steps, each in a two-column layout (left: copy + detail, right: "What to expect" card with bullet checklist).

**Step 01**

H2: Tell us your situation
Summary: Start the guided intake — no legal background required.

Detail:
> LWYRD's intake begins by asking who you are — a startup, a small business, or an individual — and what legal area you need help with. From there, you answer a focused set of questions about your specific situation: stage, budget, timeline, and any circumstances that affect the kind of firm you need. The whole process takes about five minutes.

What to expect:
- Three tracks: Startups, Small Businesses, Individuals
- Plain language — no legal training needed
- Your answers are private and secure

**Step 02**

H2: We assess your needs
Summary: Your answers are scored against our vetted firm network.

Detail:
> Once you submit, LWYRD's algorithm scores every vetted firm against your specific answers — taking into account your legal issue, timeline, budget, stage, and any other factors you surfaced during intake. A firm's LWYRD Assessment score is also factored in, so quality is built into every result, not added as an afterthought.

What to expect:
- Scored against your specific answers — not generic criteria
- Assessment performance factors into every match
- No pay-to-play rankings

**Step 03**

H2: Get matched
Summary: We surface the firms best suited to your needs.

Detail:
> After you submit your intake, LWYRD's algorithm scores every vetted firm in that category against your specific answers. You receive a ranked list of matches — each one with a fit score, the firm's LWYRD Assessment result, and a clear explanation of why it's a strong match for your situation. You can save firms, compare them, and reach out when you're ready.

What to expect:
- Ranked matches with fit scores and reasons
- Assessment results visible for every firm
- Save and compare multiple firms before deciding

---

### Section 3 — LWYRD Assessment (navy)

**Overline:** OUR STANDARD

**H2:**
> The LWYRD Assessment

**Body:**
> Every firm on LWYRD is evaluated against a 13-point universal standard before appearing on the platform. The Assessment covers bar standing and disciplinary history, depth of experience in core practice areas, client responsiveness commitments, written engagement standards, and full fee transparency — among other criteria. A firm's Assessment score is factored into every match, so quality is built into the algorithm, not bolted on afterward.

**Three stats:**
- 13 — Points of evaluation
- 100% — Firms vetted before listing
- Zero — Pay-to-play listings

---

### Section 4 — Why It Matters

**Overline:** WHY IT MATTERS

**H2:**
> Built around your situation, not a search algorithm

**Card 1 — No cold calls**
> You control when and how firms hear from you. LWYRD surfaces your options — you decide who to contact.

**Card 2 — No pay-to-play**
> Firms cannot buy their way to the top of your results. Rankings are based entirely on fit score and Assessment performance.

**Card 3 — Free to match**
> Completing the intake and receiving matches costs nothing. There is no catch — your first step is always free.

---

### Section 5 — CTA

**H2:**
> Ready to get started?

**Body:**
> Start the guided intake — tell us who you are and what you need. It takes about five minutes, and there is no cost to get matched.

**Buttons:**
- `Get Matched` → `/intake` (primary, with arrow)
- `Contact Us` → `/contact` (outline)

---

## PAGE: Contact (`/contact`)

**Visual structure:** Left-heavy two-column layout. Left = form (3/5 width), Right = info sidebar (2/5 width).

---

### Header

**Pill label:** Get in Touch

**H1:**
> Book a Consultation

**Subhead:**
> Whether you have a question, want to learn more about the platform, or are ready to get matched — reach out and we will get back to you promptly.

---

### Left Column — Contact Form

**Form fields:**

| Label | Placeholder | Type | Required |
|-------|-------------|------|----------|
| Full name | Jane Smith | text | ✓ |
| Email address | jane@company.com | email | ✓ |
| Organization or company | Acme Corp (optional) | text | — |
| Subject | Select a topic | select | ✓ |
| Message | Tell us a bit about your situation or what you need help with... | textarea | ✓ |

**Subject dropdown options:**
- Select a topic *(placeholder, disabled)*
- Book a consultation
- General question about LWYRD
- Firm listing inquiry
- Organization or partnership
- Other

**Submit button:** `Send Message` *(with send icon)*
Loading state: `Sending...`

**Error state:**
> Something went wrong. Please try again or email us directly at rahul@lwyrd.co

**Success state:**

H2: Message received

Body: Thanks for reaching out. Someone from the LWYRD team will be in touch within one to two business days.

---

### Right Column — Info Sidebar

**Why reach out card:**

H3 (style): Common reasons to reach out

Three items (icon + label):
- Book a consultation with the LWYRD team
- Ask a question about how the platform works
- Explore a partnership or firm listing

**Response time card (navy background):**

H3: We respond within 48 hours

Body: Every message goes directly to the LWYRD team. We do not use automated responses — you will hear from a real person.

---

## PAGE: FAQ (`/faq`)

**Visual structure:** Header + tab selector + accordion card + bottom link.

---

### Header

**Pill label:** FAQ

**H1:**
> Frequently Asked Questions

**Body:**
> Answers to common questions about how LWYRD works — for individuals, organizations, and law firms.

---

### Tab Selector

Three tabs:
- **General**
- **For Startups, Small Businesses, and Individuals**
- **For Law Firms**

**Bottom link:**
> Don't see your question? [Get in touch] *(links to /contact)*

---

### Tab: General

**Q: What is LWYRD?**
A: LWYRD is a legal matchmaking platform. We guide individuals and organizations through a structured intake process to understand their legal situation, then connect them with vetted law firms best suited to their specific needs. We are not a law firm and do not provide legal advice.

**Q: Is LWYRD free to use?**
A: Creating an account and completing the intake questionnaire are both free. Viewing your full matched firm profiles and contacting firms directly requires access — reach out to our team to learn more.

**Q: Is LWYRD a law firm?**
A: No. LWYRD is not a law firm and does not practice law. We do not provide legal advice, represent clients, or establish attorney-client relationships. Our role is to help people find the right specialist — nothing more.

**Q: Do I need an account to use LWYRD?**
A: You need a free account to complete the intake questionnaire and receive matches.

**Q: Who does LWYRD serve?**
A: LWYRD serves three groups: startups (entity formation, fundraising, IP, equity), small businesses (contracts, employment, commercial disputes, regulatory matters), and individuals (family law, immigration, employment disputes, personal injury). Within each group, we cover multiple specific legal categories.

---

### Tab: For Startups, Small Businesses, and Individuals

**Q: How does the matching process work?**
A: The intake starts by asking who you are — a startup, small business, or individual — and which legal area you need help with. From there you answer a focused set of questions about your specific situation. LWYRD's algorithm then scores every vetted firm against your answers and returns a ranked list of matches, each with a score and the reasons it is a strong fit.

**Q: What is the intake questionnaire?**
A: The intake is a short guided wizard — typically five to ten minutes. There is no legal jargon. It begins with a few questions to understand your situation and legal area, then asks more specific questions based on your track (startup, small business, or individual) and the category you selected. Your answers are stored securely and never shared without your consent.

**Q: How are law firms vetted?**
A: Every firm on LWYRD passes a 13-point LWYRD Assessment before being listed. The assessment evaluates bar standing, disciplinary history, years of experience in the practice area, professional liability insurance, client reference verification, fee transparency, billing practices, and more.

**Q: What is the LWYRD Assessment?**
A: The LWYRD Assessment is a 13-point vetting standard applied to every firm on the platform. It covers criteria like active bar status, no disciplinary history in the past five years, minimum five years of core practice experience, written engagement agreements, 48-hour response commitments, and transparent fee structures. Each firm's assessment score factors into your match ranking.

**Q: Are my answers confidential?**
A: Yes. Your intake answers are stored securely and used only to generate your matches. We do not share your information with law firms without your knowledge, and we do not sell your data.

**Q: Can I be matched with more than one firm?**
A: Yes. Your results page shows multiple matched firms, ranked by fit. You can review all of them, save the ones that interest you, and compare before deciding who to contact.

---

### Tab: For Law Firms

**Q: How does my firm get listed on LWYRD?**
A: Firms apply to join LWYRD and go through the LWYRD Assessment process. Once assessed and approved, your firm profile is built out on the platform. To start the conversation, reach out to our team through the contact form on our website.

**Q: What does the LWYRD Assessment evaluate?**
A: The Assessment covers 13 universal criteria: active bar status and good standing, no disciplinary history in the past five years, professional liability insurance, verified client references, a minimum of five years in the core practice area, written engagement agreements, conflicts of interest procedures, a dedicated point of contact for each client, a 48-hour client response commitment, upfront fee disclosure, itemized billing, secure document handling, and proactive communication of relevant legal updates.

**Q: How are client-to-firm matches determined?**
A: LWYRD's matching algorithm scores firms against a client's intake answers — taking into account the practice area, the specifics of the legal issue, timeline, and any other factors surfaced during intake. A firm's LWYRD Assessment score is also factored in. The result is a ranked list of firms, ordered by overall fit.

**Q: Is there a cost for firms to be listed on LWYRD?**
A: For information on listing fees and partnership arrangements, please contact our team directly. We evaluate each firm's situation individually and would be happy to walk you through the options.

**Q: What happens when a client is matched to my firm?**
A: When a client unlocks their matches and your firm appears in their results, LWYRD facilitates the introduction. Clients are provided your contact details and are encouraged to reach out directly. We do not intercept the relationship — once a client contacts your firm, the engagement is entirely between you and them.

---

## PAGE: Intake (`/intake`)

**Page metadata title:** Get Matched — LWYRD
**Page metadata description:** Tell us about your legal needs and we'll match you with the right firm.

**Auth requirement:** Login required (AuthGuard — triggers login modal if not authenticated).

The page renders the `IntakeWizard` component.

---

### IntakeWizard — Header (always shown)

**Pill label (dynamic):** Shows the selected legal category name (e.g., "Corporate Formation & Structure"), or "Legal Intake" before a category is chosen.

**H1 (non-summary state):**
> Tell us about your needs

**Subhead (non-summary state):**
> Your answers help us find the most relevant firms for you. There are no right or wrong answers.

**H1 (summary/review state):**
> Review your answers

---

### IntakeWizard — Question Card (per question)

Each question is shown one at a time. The card shows:

- **Required/Optional** label (small caps, slate)
- **Question text** (H2, serif, navy)
- **Subtext** (slate, optional — shown when present)
- **Answer options** (see intake questions below)

**"Other" free-text behavior:** When an "Other" option is selected, a text input appears below:
- Placeholder: `Please describe…`

---

### IntakeWizard — Navigation

**Back button:** `← Back`
- Disabled on step 0 (no summary showing)

**Back to Review button:** `Back to Review` *(only shown when editing from summary)*

**Next button:** `Next →`
- Changes to `Review →` on the last question

**Submit button (summary screen):** `Find My Matches →`
Loading state: `Finding matches…`

---

### IntakeWizard — Summary Screen

**Intro text:**
> Review your answers below. Click any row to change that answer, then proceed to find your matches.

Each row shows:
- Small: Question text
- Bold: Selected answer(s), or "—" if not answered
- Edit icon (pencil, appears on hover)

---

### IntakeWizard — Budget Slider (SF3 / IF3 / BF3)

The budget questions now render a slider instead of radio options.

**Display text (dynamic):**
- At $0: `Not specified`
- At max: `$[max]k+`
- Otherwise: `$[amount]` (formatted with locale commas)

**Bottom labels:**
- Left: `Not specified`
- Right: `$[max]k+`

---

### Intake Questions — Q1 (Track Selection)

**Question:** Who best describes you?
**Subtext:** This routes you to the right set of questions. There are no wrong answers.

Options:
- Startup or early-stage company *(VC-backable or growth-oriented, at any funding stage)*
- Individual / Personal matter *(Not a business — this is a personal legal need)*
- Small business *(Operating business, not seeking institutional funding)*

---

### Intake Questions — Q2 (Legal Area, varies by track)

**Question:** What area of law do you need help with?
**Subtext:** Select the one that best fits your situation. You can always start multiple intake flows for different matters.

**Startup options:**
- Corporate Formation & Structure *(Entity type, founders' agreement, cap table)*
- Intellectual Property *(Patents, trademarks, trade secrets, IP assignment)*
- Fundraising & Securities *(SAFE notes, term sheets, equity rounds)*
- Employment & Equity Compensation *(Hiring, offer letters, stock options, contractors)*
- Commercial Contracts *(Customer agreements, vendor contracts, NDAs, SaaS)*
- Regulatory & Compliance *(Fintech/healthtech licensing, GDPR/CCPA, T&Cs)*
- Corporate Governance *(Board structure, shareholder agreements, amendments)*
- M&A / Exit *(Acquisition, acqui-hire, due diligence prep)*
- Dispute Resolution *(Co-founder disputes, IP claims, investor conflicts)*

**Individual options:**
- Family Law *(Divorce, custody, prenups, adoption)*
- Estate Planning & Wills *(Wills, trusts, power of attorney, probate)*
- Real Estate *(Home purchase/sale, landlord-tenant, lease review)*
- Personal Injury & Civil Litigation *(Accidents, malpractice, insurance disputes)*
- Immigration *(Work visas, green card, citizenship, deportation defense)*
- Employment (as an employee) *(Wrongful termination, discrimination, wage claims)*
- Tax *(IRS disputes, audit defense, back taxes)*
- Criminal Defense *(DUI, misdemeanor, felony, expungement)*
- Bankruptcy & Debt *(Chapter 7/13, debt negotiation)*
- Consumer Protection *(Fraud, identity theft, contract disputes)*

**Small Business options:**
- Business Formation & Restructuring *(Entity formation, operating agreements, succession)*
- Commercial Contracts *(Client agreements, vendor contracts, NDAs)*
- Employment Law *(Hiring, handbooks, wage compliance, terminations)*
- Intellectual Property *(Trademark, copyright, trade secrets, licensing)*
- Business Disputes & Litigation *(Contract breach, partner disputes, collections)*
- Real Estate & Commercial Leases *(Lease negotiation, property acquisition, disputes)*
- Regulatory & Licensing *(Industry permits, state/local compliance)*
- Tax & Financial *(Business tax, IRS disputes, payroll tax)*
- M&A / Buying or Selling a Business *(Purchase/sale, partner buyout, succession)*
- Data Privacy & Cybersecurity *(Privacy policy, data breach, CCPA/GDPR)*

---

### Intake Questions — Startup Context (S1–S4)

**S1 — Company stage**
Question: What stage best describes your company right now?
Subtext: This shapes which firms and attorneys are most relevant for your needs.
Options: Pre-incorporation / Idea stage · Pre-Seed / Just incorporated · Seed stage · Series A · Series B or later · Bootstrapped / Revenue-funded

**S2 — Industry**
Question: What industry is your startup in?
Subtext: Helps match you with attorneys who specialize in your sector's regulatory landscape.
Options: Technology / SaaS / Software · AI / Machine Learning · Fintech / Financial Services · Healthtech / Life Sciences / Biotech · Consumer / E-commerce / Marketplace · Media / Content / Creator Economy · Hardware / Deep Tech / Robotics · Climate / Energy / Sustainability · Enterprise SaaS / B2B · Other — You'll describe it briefly in the next step

**S3 — Fundraising**
Question: Are you currently fundraising or planning to raise capital in the next 6 months?
Subtext: Some legal needs are urgent when a round is active or imminent.
Options: Yes — actively in a fundraising process right now · Yes — planning to raise within 6 months · No — not raising capital at this time · Bootstrapped — no plans to raise institutional capital

**S4 — Co-founders**
Question: How many co-founders does the company have?
Subtext: Matters for governance, equity structure, and the complexity of formation or dispute work.
Options: Solo founder · 2 founders · 3–4 founders · 5 or more

---

### Intake Questions — Startup Sub-questions (S5a–S5p)

*These appear based on the Q2 category selected.*

**S5a — Formation: entity status**
Question: What is the current status of your entity?
Options: No entity formed yet — starting from scratch · Entity formed but needs restructuring or amendments · Existing entity — need to add or remove a co-founder · Need to convert entity type (e.g., LLC to C-Corp) · Other situation

**S5b — Formation: entity type**
Question: Which entity type are you considering or currently using?
Options: Delaware C-Corp *(Standard for VC-backed companies)* · LLC · S-Corp · Not sure — need guidance

**S5c — Formation: most pressing issue**
Question: What is the most pressing issue you need help with?
Subtext: Select the one that is most urgent.
Options: Choosing the right entity and state of incorporation · Drafting founders' agreement and equity splits · Setting up vesting schedules · IP assignment agreements from founders · Cap table setup and management · Bylaws or operating agreement drafting · Other issue

**S5d — IP: protection type** *(multi-select)*
Question: What type of IP protection do you need?
Subtext: Select all that apply.
Options: Patent (utility or provisional filing) · Trademark registration · Copyright · Trade secret and NDA strategy · IP assignment from founders or contractors · Freedom-to-operate opinion · IP infringement — we are being accused or want to enforce · Other IP matter

**S5e — IP: assignment status**
Question: Has your core IP been assigned from founders and contractors to the company?
Subtext: Investors will require clean IP chain of title.
Options: Yes — all IP is assigned to the company · Partially — some but not all assignments are in place · No — this hasn't been done yet · Not sure

**S5f — Fundraising: instrument**
Question: What type of fundraising instrument are you working with?
Options: SAFE note (Simple Agreement for Future Equity) · Convertible note · Priced equity round (Series Seed, A, etc.) · Friends and family / angel round · Not sure — need guidance on which instrument to use

**S5g — Fundraising: pressing issue**
Question: What is the most pressing issue in your fundraising process?
Options: Reviewing and negotiating a term sheet we received · Drafting investor documents from scratch · Cap table modeling and dilution analysis · Securities law compliance (SEC/state filings) · Investor rights agreements, side letters, or pro-rata rights · Closing mechanics and wire logistics · Other concern

**S5h — Fundraising: round size**
Question: Approximately how large is the round you are raising or have raised?
Subtext: Approximate is fine — this helps match you with firms that handle deals of your size.
Options: Under $500K · $500K – $2M · $2M – $10M · $10M – $30M · Over $30M · Not yet determined

**S5i — Employment: primary issue**
Question: What is the primary employment or equity issue you need help with?
Options: Offer letters and employment agreements for first hires · Stock option plan (ESOP) setup and 409A valuation · Equity grants and option agreements for employees · Contractor agreements and worker classification (1099 vs W-2) · Non-compete and non-solicitation agreements · Severance, termination, or employee dispute · Equity refresh grants or secondary sales · Other employment matter

**S5j — Employment: headcount**
Question: How many employees or contractors are you currently managing?
Options: None yet — making our first hire · 1–5 · 6–20 · 21–50 · More than 50

**S5k — Contracts: type**
Question: What type of contract do you need help with?
Options: Customer / client agreement or MSA · Vendor or supplier agreement · SaaS or software license agreement · Partnership or reseller agreement · NDA / confidentiality agreement · Terms of Service and Privacy Policy · Contract review — the other side sent us a draft · Contract dispute or breach · Other contract type

**S5l — Contracts: drafting vs reviewing**
Question: Are you drafting this contract or reviewing one presented to you?
Options: Drafting from scratch · Reviewing and negotiating a draft from the other side · Both — mutual negotiation of terms · Dealing with a breach or dispute about an existing contract

**S5m — Regulatory: issue type**
Question: What type of regulatory or compliance issue do you need help with?
Options: Industry-specific licensing (e.g., fintech, healthtech, insurance) · Data privacy — GDPR, CCPA, or similar · Terms of Service and Privacy Policy drafting · AML / KYC compliance (financial services) · FDA or healthcare-specific regulatory compliance · Export controls or international trade compliance · General regulatory audit or compliance review · Other regulatory matter

**S5n — Governance: matter**
Question: What governance matter do you need help with?
Options: Setting up or restructuring the board of directors · Board consents and written resolutions · Investor rights and information rights agreements · Shareholder agreement amendments · Protective provisions or voting agreements · General corporate housekeeping and records cleanup · Other governance matter

**S5o — M&A: situation**
Question: What type of M&A or exit situation are you navigating?
Options: We are being acquired (asset or stock purchase) · We are acquiring another company · Acqui-hire — our team is being hired by an acquirer · Preparing for exit — due diligence cleanup · Secondary sale — founders or early investors selling shares · Merger or joint venture · Other M&A or exit situation

**S5p — Dispute: type**
Question: What type of dispute are you dealing with?
Options: Co-founder or partner conflict · Investor or board dispute · IP infringement — someone is using our IP · IP infringement — we've been accused · Employee or contractor dispute · Commercial contract breach · Other business dispute

---

### Intake Questions — Startup Closing (SF1–SF8)

**SF1 — Firm type preference**
Question: What type of law firm are you looking for?
Subtext: Think about the relationship you want, not just the deliverable.
Options: Large / full-service firm *(Broad resources, multiple practice areas, typically higher cost — you may work primarily with associates)* · Boutique firm with direct partner access *(Smaller team, senior attorney involvement, specialist focus)* · Solo practitioner *(One attorney handles everything — maximum relationship and often most cost-efficient for focused matters)* · No preference — match me on fit

**SF2 — Billing preference**
Question: How do you prefer to pay for legal services?
Subtext: Different matters suit different billing structures. Select what matters most to you.
Options: Flat fee — I want a fixed price for this specific project · Hourly — I expect ongoing work and am comfortable with hourly billing · Retainer / subscription — I want ongoing access to a firm for a monthly fee · Equity / deferred — open to non-cash arrangements *(Uncommon but exists for early-stage startups)* · Not sure — I'd like guidance on what's appropriate for my situation · Other billing arrangement

**SF3 — Budget** *(budget-range slider, Optional)*
Question: What is your approximate budget for this matter?
Subtext: For ongoing relationships, estimate your monthly ceiling. For one-time work, estimate your total project budget. Leave at $0 if unsure.
Slider: $0 (Not specified) → $100k+, step $2,500

**SF4 — Engagement type**
Question: Is this a one-time project or the start of an ongoing relationship?
Options: One-time project — discrete deliverable with a defined end · Ongoing — I expect to need legal counsel regularly · Not sure yet

**SF5 — Timeline**
Question: How soon do you need to get started?
Options: Urgent — this week or within a few days · Soon — within the next 2 weeks · Within a month · No rush — exploring my options

**SF6 — Prior counsel**
Question: Have you worked with a startup attorney before?
Subtext: This helps us calibrate how much context-setting a firm may need to do.
Options: Yes — we have or had dedicated legal counsel · Partially — used a lawyer for a specific matter but no ongoing relationship · No — this is our first time hiring legal counsel

**SF7 — State requirement** *(Optional)*
Question: Does your firm need to be licensed in a specific state?
Subtext: Required for matters involving state-specific filings or litigation. Many startup matters (e.g., Delaware formation) do not require local counsel.
Options: No preference — the work is not state-specific · Yes — California · Yes — New York · Yes — Texas · Yes — Delaware (formation/corporate matters) · Yes — another state

**SF8 — Language** *(multi-select, Optional)*
Question: Are non-English language capabilities important?
Subtext: Select all that apply.
Options: No — English only is fine · Spanish · Mandarin · Hindi · Portuguese · Korean · Other

---

### Intake Questions — Individual Context (I1–I2)

**I1 — Current situation**
Question: What best describes your current situation?
Subtext: This gives attorneys useful context before the first conversation.
Options: I have an active legal issue that needs immediate attention · I'm planning ahead for something I know is coming *(e.g., upcoming divorce, planned home purchase, estate planning)* · I want to protect myself or my family proactively *(e.g., wills, prenups, asset protection)* · I need advice before making a major decision · I'm responding to legal action taken against me · Other situation

**I2 — Prior experience**
Question: Have you worked with an attorney on a personal legal matter before?
Options: Yes — I have prior experience with personal legal counsel · No — this is my first time seeking legal representation · Not sure

---

### Intake Questions — Individual Sub-questions (I3a–I3q)

**I3a — Family law: primary matter**
Question: What is the primary family law matter you need help with?
Options: Divorce or separation · Child custody and visitation · Child support · Spousal support / alimony · Prenuptial or postnuptial agreement · Adoption · Guardianship · Domestic violence / protective order · Other family law matter

**I3b — Family law: contested**
Question: Is this matter contested or uncontested?
Subtext: Contested means the other party disagrees; uncontested means both parties are largely aligned.
Options: Uncontested — both parties are in general agreement · Contested — there is significant disagreement · Not yet clear

**I3c — Family law: children**
Question: Are children involved in this matter?
Options: Yes — custody and/or support arrangements are at issue · Yes — but custody and support are agreed upon · No children involved

**I3d — Estate: documents needed** *(multi-select)*
Question: What estate planning documents do you need?
Subtext: Select all that apply.
Options: Will / Last Testament · Revocable living trust · Power of Attorney (financial) · Healthcare directive / living will · Trust for a minor or beneficiary with special needs · Medicaid planning or elder law advice · Estate administration or probate (someone has passed) · Contested will or trust dispute · Other estate planning matter

**I3e — Estate: existing plan**
Question: Do you have an existing estate plan that needs updating?
Options: Yes — documents exist but need revision · No — starting from scratch · Not sure if existing documents are still valid

**I3f — Real estate: matter type**
Question: What real estate matter do you need help with?
Options: Buying a home · Selling a home · Landlord-tenant dispute · Lease review · Eviction (as landlord or tenant) · HOA or neighbor dispute · Foreclosure defense · Title or boundary dispute · Contractor or construction dispute · Other real estate matter

**I3g — Real estate: role**
Question: Are you the buyer/seller, landlord, or tenant in this matter?
Options: Buyer · Seller · Landlord · Tenant · Not applicable

**I3h — Personal injury: type**
Question: What type of personal injury or civil matter is this?
Options: Car accident or vehicle collision · Slip and fall / premises liability · Medical malpractice · Wrongful death · Insurance dispute or bad faith claim · Defamation or invasion of privacy · General civil litigation or lawsuit · Other civil or injury matter

**I3i — Personal injury: role**
Question: Are you the plaintiff (bringing the claim) or defendant (defending a claim)?
Options: Plaintiff — I was harmed and want to bring a claim · Defendant — a claim has been filed against me · Not yet determined

**I3j — Immigration: type**
Question: What type of immigration matter do you need help with?
Options: Work visa (H-1B, O-1, L-1, TN, etc.) · Green card / permanent residency · Citizenship and naturalization · Family-based immigration (sponsoring a relative) · Investor visa (EB-5) · Asylum or humanitarian protection · Deportation defense / removal proceedings · DACA or other status adjustment · Other immigration matter

**I3k — Immigration: current status**
Question: What is your current immigration status in the US?
Subtext: This helps match you with attorneys experienced with your specific situation.
Options: US citizen · Permanent resident (green card holder) · Visa holder (work, student, or other) · No current valid status · Prefer not to say

**I3l — Employment: primary issue**
Question: What is the primary employment issue you are facing?
Options: Wrongful termination · Workplace discrimination (race, gender, age, disability, etc.) · Sexual harassment or hostile work environment · Wage theft or unpaid overtime · Non-compete agreement review or challenge · Severance negotiation · Whistleblower retaliation · FMLA or leave-related dispute · Other employment issue

**I3m — Employment: still employed**
Question: Are you still employed at the company where the issue occurred?
Options: Yes — still employed and the issue is ongoing · No — I have already been terminated or resigned · It's complicated — on leave, under a PIP, or transitioning out

**I3n — Tax: issue type**
Question: What tax issue do you need legal help with?
Options: IRS audit or examination · Tax debt and payment plans (OIC, installment agreement) · Penalty abatement or interest reduction · Unfiled returns or back taxes · International tax or FBAR compliance · Tax lien or levy on assets · Tax fraud allegations · Other tax matter

**I3o — Criminal: matter type**
Question: What type of criminal matter are you facing?
Options: DUI / DWI · Drug-related offense · Misdemeanor (non-violent) · Felony charge · White-collar crime (fraud, embezzlement, etc.) · Expungement or record sealing · Probation or parole violation · Criminal appeal · Other criminal matter

**I3p — Criminal: stage**
Question: What stage is this matter at?
Options: Pre-arrest — I'm under investigation or expect to be charged · Arrested — charges have been filed · Pre-trial — in the process of building a defense · Post-conviction — appeals or sentencing modification · Seeking expungement of a past conviction

**I3q — Bankruptcy: situation**
Question: What debt or bankruptcy situation are you navigating?
Options: Chapter 7 personal bankruptcy (discharge of debts) · Chapter 13 bankruptcy (repayment plan) · Debt negotiation or settlement without bankruptcy · Creditor harassment or collection defense · Student loan issues · Not sure — need help evaluating options · Other debt situation

---

### Intake Questions — Individual Closing (IF1–IF6)

**IF1 — Firm type**
Question: What type of attorney or firm are you looking for?
Options: Large firm with full resources and a team approach · Boutique firm — smaller, specialist, direct partner access · Solo practitioner — one attorney who handles everything · No preference — match me based on fit and expertise

**IF2 — Billing preference**
Question: How do you prefer to pay for legal services?
Options: Flat fee — a fixed price for the work *(Common for wills, immigration, simple closings)* · Hourly billing · Contingency — attorney is paid only if you win *(Common for personal injury, employment discrimination)* · Retainer — upfront deposit drawn down over time *(Common for divorce, ongoing matters)* · Not sure — I'd like guidance · Other billing arrangement

**IF3 — Budget** *(budget-range slider, Optional)*
Question: What is your approximate budget for this matter?
Subtext: For ongoing matters, estimate a total range. For one-time matters, estimate the project cost. Leave at $0 if unsure.
Slider: $0 (Not specified) → $75k+, step $1,500

**IF4 — Urgency**
Question: How urgently do you need legal help?
Options: Urgent — this week or immediately · Soon — within the next 2 weeks · Within a month · No immediate urgency — planning ahead

**IF5 — State** *(Required)*
Question: In which state does this legal matter primarily take place?
Subtext: Most personal legal matters require locally licensed counsel.
Options: California · New York · Texas · Florida · Illinois · Another state (specify at intake)

**IF6 — Language** *(multi-select, Optional)*
Question: Are non-English language capabilities important?
Subtext: Select all that apply.
Options: No — English only · Spanish · Mandarin · Hindi · Portuguese · Korean · Other

---

### Intake Questions — Small Business Context (B1–B3)

**B1 — Business age**
Question: How long has your business been operating?
Subtext: This shapes which legal issues are most likely relevant and how complex they are.
Options: We're in the process of starting — not yet open · Less than 1 year · 1–3 years · 4–10 years · More than 10 years

**B2 — Employee count**
Question: How many people work in your business (including yourself)?
Options: Just me — solo operator · 2–5 (including myself) · 6–20 · 21–50 · 51–100

**B3 — Industry**
Question: What industry is your business in?
Options: Retail / E-commerce · Food & Beverage / Restaurant · Professional Services (consulting, accounting, marketing, etc.) · Healthcare / Medical · Construction / Trades / Real Estate · Technology · Manufacturing / Distribution · Hospitality / Events · Creative / Media / Agency · Other

---

### Intake Questions — Small Business Sub-questions (B4a–B4n)

**B4a — Formation: specific matter**
Question: What is the specific formation or restructuring matter?
Options: Forming a new entity from scratch · Converting from one entity type to another (e.g., sole prop to LLC) · Adding or removing a partner/owner · Drafting or updating an operating agreement · Buy-sell agreement between owners · Business succession or ownership transition planning · Dissolving or closing the business · Other formation matter

**B4b — Formation: current structure**
Question: How is the business currently structured?
Options: Sole proprietorship · LLC · S-Corp · C-Corp · Partnership · Not yet formed / no formal entity

**B4c — Contracts: type**
Question: What type of contract do you need help with?
Options: Client or customer service agreement · Vendor or supplier contract · Independent contractor agreement · Non-disclosure agreement (NDA) · Non-compete or non-solicitation agreement · Commercial lease · Distribution or reseller agreement · Website terms of service and privacy policy · Contract dispute or breach · Other contract type

**B4d — Contracts: drafting vs reviewing**
Question: Are you the drafting party or reviewing a contract presented to you?
Options: We are drafting the contract · We are reviewing a contract the other side provided · Mutual negotiation · Dealing with a breach or dispute

**B4e — Employment: matter**
Question: What employment law matter do you need help with?
Options: Hiring — offer letters or employment agreements · Employee vs. contractor classification · Employee handbook drafting or review · Wage and hour compliance (overtime, minimum wage) · Termination — need to lay off or fire an employee · Discrimination or harassment claim against the business · Non-compete enforcement or defense · Workplace investigation · Severance agreements · Other employment matter

**B4f — IP: matter**
Question: What type of IP matter does your business need help with?
Options: Trademark registration for our brand name or logo · Copyright for creative assets (website, content, products) · Trade secret protection and NDAs · Licensing our IP to others · IP infringement — someone is copying us · IP infringement — we've been accused of infringement · Other IP matter

**B4g — Disputes: type**
Question: What type of business dispute are you navigating?
Options: Contract breach — a client, vendor, or partner didn't perform · Partnership or ownership dispute · Customer dispute or complaint · Debt collection — collecting what we are owed · Non-compete enforcement or defense · Lawsuit filed against the business · Regulatory or government action · Other business dispute

**B4h — Disputes: litigation stage**
Question: Is this matter in active litigation, or are you trying to resolve it before it gets there?
Options: A lawsuit has already been filed · Pre-litigation — trying to resolve before it escalates · Demand letter received or sent · Not sure of the stage

**B4i — Real estate: matter**
Question: What commercial real estate matter do you need help with?
Options: Reviewing or negotiating a new commercial lease · Lease renewal or amendment · Landlord dispute or lease breach · Purchasing commercial property · Zoning or permitting issue · Tenant build-out or construction dispute · Other real estate matter

**B4j — Regulatory: matter**
Question: What regulatory or licensing matter does your business face?
Options: Obtaining initial business licenses or permits · Industry-specific regulatory compliance (food, health, construction, etc.) · Alcohol or liquor licensing · Environmental compliance · Government investigation or enforcement action · Foreign registration in a new state · Other regulatory matter

**B4k — Tax: issue**
Question: What tax or financial legal issue do you need help with?
Options: IRS audit or dispute · Payroll tax issues · Sales tax compliance · Business structuring for tax efficiency · Tax debt resolution · Estate or succession tax planning for business owners · Other tax matter

**B4l — M&A: transaction type**
Question: What type of transaction are you involved in?
Options: Selling my business · Buying another business · Partner or co-owner buyout · Merging with another business · Business succession — transferring to family or employees · Valuation support before a sale · Other transaction type

**B4m — M&A: business value**
Question: What is the approximate value of the business being bought or sold?
Options: Under $500K · $500K – $2M · $2M – $10M · Over $10M · Not yet determined

**B4n — Data privacy: matter**
Question: What data privacy or cybersecurity matter does your business need help with?
Options: Privacy policy and terms of service drafting · CCPA or GDPR compliance assessment · Vendor data processing agreements · Data breach response and notification · Employee data and HR privacy compliance · Other data privacy matter

---

### Intake Questions — Small Business Closing (BF1–BF8)

**BF1 — Firm type**
Question: What type of law firm are you looking for?
Options: Large full-service firm with broad resources · Boutique firm — smaller, specialist, direct partner access · Solo practitioner — one attorney for everything *(Most cost-efficient for defined matters)* · No preference — match me on fit

**BF2 — Billing preference**
Question: How do you prefer to pay for legal services?
Options: Flat fee — fixed price for a specific project · Hourly billing · Retainer — monthly fee for ongoing access *(Good for businesses with regular legal needs)* · Not sure — I'd like guidance on what's appropriate · Other billing arrangement

**BF3 — Budget** *(budget-range slider, Optional)*
Question: What is your approximate budget for this matter?
Subtext: For retainer relationships, estimate your monthly ceiling. For project work, estimate total cost. Leave at $0 if unsure.
Slider: $0 (Not specified) → $100k+, step $2,500

**BF4 — Engagement type**
Question: Is this a one-time project or the start of an ongoing relationship?
Options: One-time — defined project with a clear end · Ongoing — I expect to need regular legal counsel · Not sure yet

**BF5 — Timeline**
Question: How soon do you need to get started?
Options: Urgent — this week · Soon — within 2 weeks · Within a month · No rush — planning ahead

**BF6 — Prior counsel**
Question: Does your business currently have or recently had legal counsel?
Options: Yes — we have an ongoing relationship with a law firm · We have used lawyers in the past but have no current relationship · No — this is our first time seeking legal counsel for the business

**BF7 — State** *(Required)*
Question: In which state(s) does your business primarily operate?
Subtext: Many business law matters require locally licensed counsel.
Options: California · New York · Texas · Florida · Illinois · Another state (specify at intake) · Multiple states

**BF8 — Language** *(multi-select, Optional)*
Question: Are non-English language capabilities important?
Subtext: Select all that apply.
Options: No — English only · Spanish · Mandarin · Hindi · Portuguese · Other

---

## PAGE: Results (`/results`)

**Auth requirement:** Login required.

**Breadcrumb:** Intake / Your Matches

**H1:**
> Your Matches

**Dynamic subhead (with results):**
> We found [N] firm(s) that match your needs in [Category Name].

**Dynamic subhead (no results):**
> No firms matched your criteria. Try adjusting your preferences.

---

### Access Gate Banner (shown when user has no access and results exist)

**Text:**
> Your matches are ready — unlock to see them

**Subtext:**
> Subscribe or get org access to view firm profiles and connect directly.

**Button:** `Get Access →` → `/access`

---

### Empty State (no results)

**H3:**
> No firms matched your criteria

**Body:**
> Try adjusting your answers — different budget, timeline, or stage preferences may surface more results.

**Buttons:**
- `Redo intake` → `/intake`
- `Start a new intake` → `/intake`

---

### Match Card — Locked/Blurred State

**Label (if best match):** Best Match *(navy pill with star icon)*
**Score display:** [Number] / match score *(always visible even when blurred)*
**Visible meta:** Firm size · Practice area · N/M LWYRD criteria met

**Locked footer:**
> Full profile and contact details are locked
**Button:** `Get Access →` → `/access`

---

### Match Card — Unlocked State

**Best Match pill:** Best Match *(navy)*
**Rank label:** #[N] *(for non-first results)*
**Firm name:** [dynamic]
**Tagline:** [dynamic]
**Score display:** [Number] / match score
**Meta row:** [Location] · [Size] firm · Est. [Year] · [Billing] billing

**Match reasons:** ✓ [Reason text] *(one per line)*

**Missed criteria (if applicable):**
> May not be licensed in your preferred state

**Buttons:**
- Save button *(heart/bookmark icon)*
- `View Profile →` → `/firms/[id]`

---

### Bottom Link (results with results)

> Not seeing what you need? [Refine your answers] *(links to /intake)*

---

## PAGE: Firm Profile (`/firms/[id]`)

**Auth requirement:** Login required (via AuthGuard on the parent page).
**Breadcrumb:** Legal Services / Your Matches / [Firm Name]

---

### Main Column

**Verification badge (if verified):** 🛡 LWYRD Verified

**H1:** [Firm name]
**Tagline:** [dynamic]
**Score display:** [N] / match score *(or "LWYRD Score" if no session match)*

**Meta row:** [City, State] · Founded [Year] · [Firm size]

---

**H2:** About the firm
**Body:** [Firm description — dynamic]

---

**H2:** Key strengths
*(bullet list with star icons — dynamic)*

---

**H2:** The team
*(attorney cards — dynamic)*

Each attorney card shows:
- Initial avatar
- Name
- Title
- Bio (truncated to 3 lines)
- Bar admissions (pills)

---

**H2:** LWYRD Assessment
**Subhead (count):** [N]/[total] criteria met

Assessment panel header (navy background):
> Every firm in the LWYRD network is evaluated against a standard set of criteria before being listed. These assessments are conducted as part of our onboarding process and updated periodically.

Assessment items: ✓ or ✗ [Criterion label] + optional note

---

### Sidebar

**CTA Card (navy):**

H3: Book a consultation

Body: Reach out to [Firm Name] to discuss your legal needs and get started.

Button: `Contact This Firm →`

---

**Firm Details Card:**

H3: Firm details

Rows:
- Billing model: [Hourly / Monthly retainer / Flat fee / Hybrid (hourly + flat fee options)]
- Hourly rate (approx.): $[N]/hr *(only shown if set)*
- Monthly range: $[N]k – $[N]k *(only shown if set)*
- Response time: [Same-day response / Within 24 hours / Within 48 hours / Within 72 hours]
- Languages: [list] *(only shown if more than English)*

---

**Practice Areas Card:**

H3: Practice areas

*(clickable pills linking to `/services/[slug]`)*

---

**Industries Served Card:** *(only shown if industries are set)*

H3: Industries served

*(pills — dynamic)*

---

## PAGE: Access (`/access`)

**Auth requirement:** Login required.

**Back link:** `← Back to your matches`

**Pill label:** Get Access

**H1:**
> Unlock your matches

**Body:**
> You've already completed your intake. LWYRD has your matches ready — get access to view the full results and connect directly with the right firm for your needs.

---

### Card 1 — Individual Access (cream)

**H2:** Individual Access

**Body:**
> For founders, executives, and individuals who need legal representation. Get full access to your matched firms and a personal debrief from the LWYRD team.

**Benefits checklist:**
- Full access to all matched firm profiles
- Direct contact details for each firm
- Personalized intake debrief with the LWYRD team
- Save and compare firms across multiple categories
- Priority response from our matching team

**Button:** `Get in touch`

---

### Card 2 — Organization Access (navy)

**H2:** Organization Access

**Body:**
> For entrepreneurship institutes, university clubs, accelerators, and incubators. Give your entire community access to LWYRD's legal matching platform.

**Benefits checklist:**
- Unlimited access for all members of your organization
- Dedicated LWYRD point of contact for your program
- Custom intake flows tailored to your community's needs
- Aggregated reporting on member legal needs
- Co-branding and white-label options available

**Button:** `Partner with us`

---

### Reassurance Card (bottom)

**H3:**
> Your intake is already complete

**Body:**
> You've already told us everything we need to find your match. Once you get access, LWYRD will walk you through your results personally — no need to start over.

---

## MODAL: Sign In / Sign Up (AuthModal)

Triggered by "Sign in" in the navbar or when unauthenticated users try to access protected pages.

---

### Login State

**H2:** Welcome back

**Subhead:** Sign in to access your LWYRD dashboard.

**Tabs:** Sign In · Sign Up

**Fields:**
- Your email *(email)*
- Password *(password)*

**Button:** `Sign In`
Loading: `Signing in…`

---

### Sign Up State

**H2:** Create your account

**Subhead:** Join LWYRD to find the right legal partner.

**Tabs:** Sign In · Sign Up

**Fields:**
- Your full name *(text)*
- Your email *(email)*
- Password *(password)*
  - Helper: Must be at least 6 characters.

**Button:** `Create Account`
Loading: `Creating account…`

---

**Footer disclaimer (both states):**
> Your information is secured and never shared.

---

## MODAL: Contact This Firm (ContactFirmModal)

Triggered from the firm profile "Contact This Firm" button.

**Header (with send icon):** Contact [Firm Name]

**Subhead:**
> Send a message directly to [Firm Name]. They will follow up with you at the email you provide.

**Fields:**
- Your name *(text)*
- Your email *(email)*
- Describe your legal needs and what you are looking for *(textarea)*

**Submit button:** `Send Message to [Firm Name]`
Loading: `Sending…`

**Success state:**
- ✓ Message sent.
- [Firm Name] will be in touch with you shortly.

**Error state:**
> Something went wrong. Please try again.

---

## MODAL: Book a Consultation (ContactLwyrdModal)

Triggered from the Access page "Get in touch" and "Partner with us" buttons.

**Header (with calendar icon):** Book a Consultation

**Subhead (with category):**
> Tell us about your [Category Name] needs and our team will follow up to match you with the right firm.

**Subhead (without category):**
> Tell us about your needs and our team will follow up personally.

**Fields:**
- Your name *(text)*
- Your email *(email)*
- Briefly describe what you need help with *(textarea)*

**Submit button:** `Send Request`
Loading: `Sending…`

**Success state:**
- ✓ Request received.
- Our team will be in touch with you shortly.

**Error state:**
> Something went wrong. Please try again.

---

## PAGE: Browse (`/browse`)

This route immediately redirects to `/intake`. It has no content of its own.

---

## NOTES FOR COPY OVERHAUL

**Recurring structural patterns used throughout:**
- Overline labels (small caps, muted) appear above every H1/H2 to signal section identity
- Navy pills/badges used for status, verification, and CTA labels
- "5 minutes" mentioned across multiple pages as the intake time estimate
- "13-point" assessment referenced on About, How It Works, FAQ, and firm profiles
- Three commitment phrases appear repeatedly: "No cold calls," "No pay-to-play," "Free to match"
- LWYRD consistently describes itself as "not a law firm" across FAQ, About, and the contact page
- Error messages reference `rahul@lwyrd.co` as a fallback on the Contact page form

**Pages with no public-facing copy (admin/account only):**
- `/admin` and all sub-pages (analytics, firms, questions, categories, criteria, submissions, users)
- `/account`
- `/services/[slug]` (dynamic, renders firm/service data from database)
- `/firms/[id]` (dynamic, renders from database — structure documented above)
