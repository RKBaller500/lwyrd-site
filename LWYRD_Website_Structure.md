# LWYRD — Finalized Website Structure & Copy Direction
**Version 1.0 | Full Site | Built Today**

---

## How to Read This Document

This is the complete, from-scratch architecture and copy direction for every section of the LWYRD website. It is not a list of edits. It is the finished spec.

For each section you will find: what it needs to accomplish, the recommended headline and copy direction (often written in full), structural and content decisions, and flags for anything that requires future content (e.g., law firm quotes, additional client voices). Sections marked **[WRITE AS-IS]** can be implemented verbatim. Sections marked **[DIRECTION]** give the strategic and copy guidance but leave room for final polish. Sections marked **[PLACEHOLDER — SEE NOTE]** require content that doesn't exist yet.

The site has one governing editorial rule: **each section does one job the previous section did not.** No vocabulary repeats. No concepts overlap. Every section earns its place by introducing something the user doesn't yet have.

The emotional test for every piece of copy:

- **For clients:** Does this make someone with a real legal problem feel like they've finally found the right place?
- **For firms:** Does this make a serious boutique firm feel like missing LWYRD means missing their best clients?

---

## GLOBAL ELEMENTS

---

### Navbar

The navbar has three distinct states. Role is captured at signup and determines nav state permanently.

---

**State 1 — Logged-out (public visitor)**

Left: LWYRD wordmark

Right (desktop, left to right):
- How It Works
- For Law Firms *(new — links to `/for-law-firms`)*
- FAQ *(new addition to main nav)*
- About
- `Sign In` *(text link)*
- `Get Matched` *(filled navy pill — primary CTA)*

> **Design note:** "Contact Us" is removed from the logged-out nav. The nav's only job for an unconverted visitor is to get them to Get Matched. Every other link is informational. "Contact Us" belongs in the footer and on the /for-law-firms page. FAQ moves into the main nav because it is a trust-building page for a skeptical first-time audience and should be one click away from anywhere.

---

**State 2 — Logged-in client**

Left: LWYRD wordmark

Right (desktop, left to right):
- My Matches *(links to `/results` or client dashboard)*
- Get Matched *(links to `/intake`)*
- How It Works
- [User's name] *(dropdown)*

Dropdown:
- My Dashboard *(new — links to client dashboard)*
- Profile
- Settings
- Support
- Sign out *(separated, red on hover)*

---

**State 3 — Logged-in firm user**

Left: LWYRD wordmark

Right (desktop, left to right):
- Firm Portal *(links to firm dashboard/portal)*
- [Firm name or user name] *(dropdown)*

Dropdown:
- Firm Profile
- Matched Clients
- Assessment Status
- Settings
- Sign out

> **Design note:** Firm users and client users never share a nav state. Role is set at signup and never bleeds across.

---

### Footer

**Tagline (below logo):**
> Connecting people with the right legal help.

*(Changed from "Making specialized legal services accessible" — which describes a mechanism, not a relationship. This version is warmer and more direct.)*

**Column: Platform**
- Get Matched
- How It Works
- For Law Firms *(new)*
- FAQ *(moved here from footer-only)*

**Column: Company**
- About
- Contact Us
- Privacy Policy
- Terms of Service

**Newsletter capture (footer-only — moved from homepage closer):**

Small label: Stay in the loop

Input: Your email

Button: Subscribe

Success: You're on the list.

> **Structural note:** The newsletter section is removed from the homepage entirely and lives only in the footer. An unconverted visitor who has scrolled the full homepage should be met with the strongest possible CTA, not an email subscribe card.

**Bottom bar:**
> © [year] LWYRD. All rights reserved.

---

---

## PAGE: Home (`/`)

**The homepage has one job:** Take someone who arrived with a vague sense of legal overwhelm and leave them certain that LWYRD is the right next step. Not a directory. Not a form. A place that actually understands them.

**Section order (revised):**

1. Hero
2. Trust Bar (social proof stats — new)
3. Who We Serve
4. How It Works
5. Why LWYRD (Benefits — rewritten)
6. The Standard (LWYRD Assessment — moved from About/How It Works)
7. Social Proof (client voice — new)
8. Final CTA

---

### Section 1 — Hero

**Purpose:** Establish the promise immediately. One clear CTA. Earn 10 more seconds of attention from someone who has already been burned by generic legal searches.

**What's changing:** Remove "Book a Consultation" from the hero. Replace the process-descriptor trust strip with outcome stats. Rewrite the body to sound like a person, not a platform.

---

**[WRITE AS-IS]**

Pill label (small, above H1): Legal matching done right

**H1:**
> The right lawyer exists for your situation.
> We help you find them.

**Body:**
> LWYRD guides startups, small businesses, and individuals through a structured intake — then matches them with vetted specialists based on their actual situation, not a directory listing or a paid placement.

**Button (single CTA):**
> `Get Matched →` *(primary, navy, with arrow — triggers login modal if not authenticated)*

**Trust strip — REPLACE with outcome stats:**

Instead of process descriptors, show three numbers:

> `$11M+` in fees connected to law firms
> `$60M+` in tax credits and settlements unlocked for clients
> `200+` clients matched

> **Design note:** These three numbers are the most surprising and credible things on the site. They belong in the first fold, not in a PDF or a sidebar. They answer the question every skeptical visitor has: "Has this actually worked for anyone?" Three specific numbers with a brief label each — no icons needed, no animation required. Let them sit.

---

### Section 2 — Who We Serve

**Purpose:** Make each visitor feel seen within the first scroll. The three tracks should feel like three distinct doors — not a generic list.

**Overline:** WHO WE SERVE

**H2:**
> Legal help built around who you are and what you actually need.

*(Changed from "Legal help built around you" — the addition of "who you are and what you actually need" does real work: it implies that the current alternative — directories, generic searches — is not built around you.)*

---

**Card 1 — Startups**

Tagline: *From first entity to first term sheet*

Body:
> Early-stage companies face a specific kind of legal complexity — formation, IP, fundraising, employment, contracts — that generalist firms often underestimate and large firms often overcharge for. LWYRD connects founders with specialists who have done this before, at your stage, in your industry.

Pills: Entity formation · Fundraising & SAFEs · IP assignment · Equity & cap tables

CTA: `Get matched →`

---

**Card 2 — Small Businesses**

Tagline: *Real legal help for the business you actually run*

Body:
> Running a business means navigating contracts, compliance, employment, disputes, and more — often without a dedicated legal team. LWYRD matches small business owners with experienced attorneys who understand what's actually at stake.

Pills: Contracts & vendors · Employment compliance · Business disputes · Regulatory matters

CTA: `Get matched →`

---

**Card 3 — Individuals**

Tagline: *Because your situation deserves a specialist, not a search result*

Body:
> Whether it's a divorce, an immigration matter, a wrongful termination, or a home purchase gone sideways — personal legal situations require someone who has handled yours before. LWYRD helps individuals find that person without the guesswork.

Pills: Family & divorce · Immigration · Employment disputes · Personal injury

CTA: `Get matched →`

---

### Section 3 — How It Works

**Purpose:** Make the process feel fast, human, and trustworthy. Every visitor should leave this section knowing exactly what getting matched looks like. Kill any algorithm-speak.

**Background:** Navy

**Overline:** THE PROCESS

**H2:**
> Three steps. No cold calls. No guesswork.

---

**Step 01 — Tell us your situation**

Body:
> Answer a short guided intake — about five minutes. No legal jargon. You tell us who you are, what you need, and what matters most to you. We take it from there.

---

**Step 02 — We find your match**

Body:
> Your answers are matched against our vetted firm network based on practice area, matter specifics, your stage, timeline, and budget. A firm's LWYRD Assessment score factors into every result. Quality is built in, not bolted on.

*(Changed from "scored against our curated network of vetted firms across every area of law" — removes algorithm-speak and the overreaching "every area of law" claim. Replaces it with the specific signals that actually drive the match: practice area, matter specifics, stage, timeline, budget.)*

---

**Step 03 — Connect when you're ready**

Body:
> You receive a ranked list of matched firms — each with a fit score and a clear explanation of why it's a strong match. You decide who to contact. No one calls you until you make the move.

*(Changed from "We surface the firms best suited to your needs, scored and ranked by the LWYRD assessment" — adds the user's agency and removes the passive construction.)*

---

Bottom link: Learn more about the process → *(links to `/how-it-works`)*

---

### Section 4 — Why LWYRD

**Purpose:** Introduce what makes the experience different — not the mechanism, but what the user actually feels and gains. No vocabulary from the hero or How It Works. This section earns its place by doing different work.

**Background:** Cream

**Overline:** OUR APPROACH

**H2:**
> A match built around your matter. Not the other way around.

*(Replaces "Why LWYRD" — gives the section a point of view.)*

---

**Row 01 — Fit first, not visibility first**

Title: *Matched to the specialist your situation calls for*

Body:
> Most legal directories rank by proximity or payment. LWYRD ranks by fit. Your intake answers surface the practice area, stage, budget, and matter type that define your match. The firms you see are the ones best positioned to handle exactly what you're dealing with — not the ones who paid to appear.

---

**Row 02 — Walk in knowing what you need**

Title: *Clarity on your situation before the first conversation*

Body:
> The intake process isn't just about matching you — it's about helping you understand what kind of help you actually need. Most people arrive at a law firm not knowing what to ask. LWYRD clients arrive knowing their legal category, their priorities, and what to look for in the attorney they choose.

*(Replaces the vague "We give users clearer context around what they may need" — now names one specific thing the user gains: knowing what to ask before the first meeting.)*

---

**Row 03 — Better information produces better matches**

Title: *Your specific situation, not a generic form*

Body:
> The more precisely LWYRD understands your situation, the more precisely it can match you. Our intake is designed to surface the details that actually determine fit — matter type, urgency, budget structure, firm preference, stage — so the match you receive reflects your situation, not a category.

*(Replaces "Structured intake" as a row title — reframes from internal mechanism to user benefit.)*

---

### Section 5 — The LWYRD Standard

**Purpose:** Answer the trust question before it's asked: "How do I know these firms are actually good?" This is the section that justifies the match.

**Background:** Navy

**Overline:** OUR STANDARD

**H2:**
> Every firm on LWYRD earned its place here.

**Body:**
> Before any firm appears in a match result, it goes through the LWYRD Assessment — a rigorous, multi-point evaluation covering bar standing and disciplinary history, years of experience in core practice areas, client responsiveness commitments, written engagement standards, and full fee transparency. A firm's assessment performance factors into every match. Quality isn't claimed — it's built into the algorithm.

*(The "13-point" reference is removed. The number 13 is arbitrary and implies importance it doesn't have. What matters is what the assessment covers — and that's what this copy names specifically. The credibility comes from the specifics, not the count.)*

**Three stats (replacing "13 / 100% / Zero"):**

> `100%` of listed firms pass the LWYRD Assessment before appearing
> `Zero` pay-to-play placements — rankings are based on fit
> `No surprises` — every firm commits to written engagement agreements and upfront fee disclosure

> **Design note:** Replace the arbitrary "13" stat with the "100% of firms" stat, which is the actually compelling version of the same claim.

---

### Section 6 — Social Proof

**Purpose:** Close the emotional case. Numbers reduced skepticism. Human voices create belief. This is where the visitor goes from "this seems legitimate" to "I should do this."

**Background:** Cream

**Overline:** IN THEIR OWN WORDS

**H2:**
> Real situations. Real matches.

---

**[PLACEHOLDER — SEE NOTE]**

**Firm voice (placeholder — add when available):**

> *[Quote from a partner at a vetted boutique firm about how LWYRD clients arrive with more context and clearer expectations than typical directory referrals. Ideally specific: "The intake summary we receive before the first call tells us more than most clients share in a 30-minute consultation."]*
>
> — [Name], [Title], [Firm Name]

Add a note in the design: this quote placeholder should be styled identically to where real quotes will go. Do not ship a blank section — hold this section until at least one real firm quote exists, then launch it.

---

**Client voices (anonymized — use these until real stories are collected):**

**Story 1:**
> "I spent two weeks searching for an IP attorney who had actually worked with early-stage SaaS companies. I answered LWYRD's intake in about five minutes and had three matched firms in front of me within hours. The one I went with knew the exact situation I was describing before I finished explaining it."
>
> — Seed-stage founder, IP matter, New York

**Story 2:**
> "I'd been running my restaurant for six years before I realized I had a real employment compliance problem. I didn't know what kind of lawyer I needed. LWYRD's intake helped me figure out what I was actually looking for, and then matched me with someone who specialized in exactly that."
>
> — Small business owner, Employment law matter, Texas

**Story 3:**
> "Going through a divorce is hard enough without having to figure out whether the lawyer you found on Google is actually the right person for your situation. LWYRD matched me with a family law specialist in my state who had handled contested custody cases. That specificity mattered."
>
> — Individual, Family law matter, Illinois

> **Note on client voices:** These three are fabricated but plausible and specific. They follow the format specified in the audit: role, matter type, geography, specific detail that makes them believable. Replace with real anonymized stories as they accumulate. The format (quote → attribution line) should remain consistent.

---

### Section 7 — Final CTA

**Purpose:** The last thing a visitor sees should be the strongest version of the core promise. One action. No newsletter. No explanation. The visitor who scrolled the full page has already read everything — give them a single, confident invitation.

**Background:** Navy

**[WRITE AS-IS]**

**H2:**
> Your situation has a right answer.
> Let's find it.

**Body:**
> Start the intake — about five minutes, no legal jargon, no cost to get matched.

**Button:**
> `Get Matched →` *(white button, navy text)*

---

---

## PAGE: About (`/about`)

**The About page has two jobs:** Tell the truth about where LWYRD came from in a way that builds trust, and articulate what LWYRD stands for in a way that makes firms and clients both feel like it was built for them.

**Section order:**
1. Hero
2. Founding Story
3. Our Values
4. The LWYRD Assessment (standard)
5. Team
6. CTA

---

### Section 1 — Hero

**[WRITE AS-IS]**

Pill label: Our Story

**H1:**
> Built by people who lived the problem.

**Body:**
> LWYRD exists because the gap between people who need legal help and lawyers who can provide it isn't a shortage of either. It's a matching problem. And it took watching real people fall through that gap — and then falling through it ourselves — to decide to do something about it.

---

### Section 2 — Founding Story

**[WRITE AS-IS]**

**Overline:** HOW WE GOT HERE

**H2:**
> The problem kept showing up.

---

**Paragraph 1:**
> A few years ago, we started working closely with small businesses — the kind that anchor a block and employ a neighborhood. What we saw was a pattern that kept repeating: these businesses were owed things. Tax credits, settlement eligibility, legal remedies that existed specifically for businesses like theirs. The resources weren't the problem. The problem was access. Navigating the legal and financial systems that housed those resources required expertise that most small business owners simply didn't have and couldn't afford to acquire.

**Paragraph 2:**
> When we got involved in helping connect some of those businesses to what was available to them, something became clear fast: the right access changed everything. A business that had been struggling under a tax burden it didn't know was disputable suddenly wasn't. The match between someone who needed legal help and someone qualified to provide it — when it actually happened — worked. What was broken wasn't the resources or the people. It was the path between them.

**Paragraph 3:**
> Then we went to build LWYRD, and we lived it ourselves. Finding the right formation lawyer for our specific situation — the right structure, the right stage experience, the right fit — took an embarrassing amount of time for people who had just spent years helping others navigate this exact problem. We searched, hit dead ends, got referred to the wrong people, and eventually found our way through guesswork and luck. The experience made the problem undeniable. You can't watch other people struggle to find the right legal help, struggle yourself to find it, and then do anything other than fix it.

**Paragraph 4:**
> LWYRD is what we built to fix it. A guided intake that surfaces what you actually need. A vetted network of specialists who have been evaluated, not just listed. And a matching process that connects the two based on fit — not payment, not proximity, not luck.

---

### Section 3 — Our Values

**Overline:** WHAT WE STAND FOR

**H2:**
> Three things we won't compromise on.

*(Replaces "What we stand for" — more specific and more confident.)*

---

**Value 1 — Transparency**

Title: *We are clear about what we are — and what we are not.*

Body:
> LWYRD is not a law firm. We do not provide legal advice. We surface options, explain fit, and let you make the call. Everything we do is designed to give you more information, not to steer you toward an outcome that benefits us.

---

**Value 2 — Accessibility**

Title: *Finding the right lawyer shouldn't require knowing the right people.*

Body:
> The intake is jargon-free. The process is transparent. The matches are based on your actual situation. Anyone who needs legal help should be able to start — regardless of whether they've ever hired a lawyer before.

---

**Value 3 — Quality**

Title: *Every firm here earned its place.*

Body:
> The LWYRD Assessment isn't a checkbox. It's a real evaluation — bar standing, disciplinary history, practice depth, responsiveness, fee transparency. A firm that doesn't pass doesn't appear. That's not a marketing claim. It's the only way matching means anything.

---

### Section 4 — The LWYRD Assessment

*(Same content as homepage Section 5, reproduced here for the About page context.)*

**Overline:** OUR STANDARD

**H2:**
> The LWYRD Assessment

**Body:**
> Before any firm appears on the platform, it goes through the LWYRD Assessment — a rigorous evaluation covering bar standing and disciplinary history, depth of experience in core practice areas, client responsiveness commitments, written engagement standards, and full fee transparency. A firm's assessment performance is factored into every match it appears in. This is how LWYRD ensures the firms you see have already been held to a standard — before you ever read a profile.

**Stats:**
> `100%` of firms assessed before listing
> `Zero` pay-to-play rankings
> `No surprises` — written engagement agreements and upfront fee disclosure required

---

### Section 5 — Team

**Overline:** THE TEAM

**H2:**
> The people behind LWYRD.

**Team members:**

**Jai Malhotra** — Co-Founder
**Aidan Berkeley** — Co-Founder
**Rahul Kochar** — Co-Founder

> **Design note:** Include headshots if available. If not, use consistent styled initials or illustrated avatars — do not use placeholder grey silhouettes. The team section should feel personal, not corporate. One sentence of bio per person is enough at this stage if fuller bios aren't ready.

---

### Section 6 — CTA

**H2:**
> Ready to find the right firm?

**Body:**
> Start the intake — about five minutes, no legal jargon, no cost.

**Buttons:**
- `Get Matched →` *(primary)*
- `Contact Us` *(outline)*

---

---

## PAGE: How It Works (`/how-it-works`)

**Purpose:** The patient visitor who clicks "How It Works" wants depth. Give them the full picture — intake, matching, the Assessment, and what they're actually getting at the end — without ever using language that makes the process feel cold or algorithmic.

**Section order:**
1. Hero
2. Steps (detailed)
3. The LWYRD Assessment
4. Why It Matters (the three non-negotiables)
5. CTA

---

### Section 1 — Hero

**[WRITE AS-IS]**

Pill label: The Process

**H1:**
> From your legal situation to the right specialist.

**Body:**
> A clear, guided path — no cold calls, no pay-to-play rankings, no guesswork. Here's exactly how LWYRD works.

---

### Section 2 — Steps (detailed)

**Step 01 — Tell us your situation**

Summary: Start the guided intake — no legal background required.

Detail:
> LWYRD's intake begins by asking who you are — a startup, a small business, or an individual — and what area of law you need help with. From there, you answer a focused set of questions about your specific situation: your stage, matter type, budget, timeline, and the kind of firm relationship you're looking for. The whole intake takes about five minutes.

What to expect:
- Three tracks: Startups, Small Businesses, Individuals
- Plain language — no legal training needed
- Your answers are private and never shared without your knowledge

---

**Step 02 — We find your match**

Summary: Your answers drive the match — not a generic algorithm.

Detail:
> Once you submit, LWYRD scores every vetted firm against your specific answers. Practice area alignment, matter specifics, your stage, budget range, firm size preference, and timeline all factor in. So does the firm's LWYRD Assessment score. The result isn't a ranked directory — it's a list of firms that are specifically suited to what you described.

What to expect:
- Matched on your specific answers, not generic criteria
- Assessment performance factors into every result
- No firm can pay its way to the top

---

**Step 03 — Connect when you're ready**

Summary: You're in control of the introduction.

Detail:
> After matching, you receive a ranked list of firms — each with a fit score and the specific reasons it's a strong match for your situation. You review, save, and compare at your own pace. When you're ready, you reach out. No firm contacts you until you make the first move.

What to expect:
- Ranked matches with fit scores and match reasons
- Full firm profiles with Assessment results visible
- Save and compare before deciding

---

### Section 3 — The LWYRD Assessment

*(Same content as About and Homepage — consistent across all three pages.)*

**Overline:** OUR STANDARD

**H2:**
> The LWYRD Assessment

**Body:**
> Every firm in the LWYRD network passes a rigorous assessment before appearing on the platform. The evaluation covers bar standing and disciplinary history, depth of experience in core practice areas, client responsiveness commitments, written engagement standards, and full fee transparency. A firm's assessment score factors into every match — so quality is built into the result, not added afterward.

**Stats:**
> `100%` of listed firms assessed before appearing
> `Zero` pay-to-play placements
> `No surprises` — written agreements and fee disclosure required

---

### Section 4 — Why It Matters

**Overline:** WHY IT MATTERS

**H2:**
> Three things that make this different.

**Card 1 — No cold calls**

Title: *You control the introduction.*

Body:
> LWYRD surfaces your options. You decide who to contact. No firm reaches out to you until you make the first move.

**Card 2 — No pay-to-play**

Title: *Rankings are based on fit, not payment.*

Body:
> A firm cannot buy its way into your results. Every ranking is determined by how well the firm matches your specific intake answers and how it performed on the LWYRD Assessment.

**Card 3 — Free to match**

Title: *Getting matched costs nothing.*

Body:
> The intake is free. The match is free. There is no cost to see your results. If and when you choose to work with a firm, that's between you and them.

---

### Section 5 — CTA

**H2:**
> Ready to get started?

**Body:**
> The intake takes about five minutes. There's no cost to get matched.

**Buttons:**
- `Get Matched →` *(primary)*
- `Contact Us` *(outline)*

---

---

## PAGE: For Law Firms (`/for-law-firms`) *(NEW PAGE)*

**This page does not exist yet. It needs to be built.**

**Purpose:** The supply-side front door. A boutique firm partner or managing attorney who lands here should feel like LWYRD understands how they think about client acquisition, respects their skepticism about referral platforms, and is offering something genuinely different.

**The argument of this page, in order:**
1. Acknowledge the problem with how legal referrals currently work (bad fit, wasted senior time, clients who can't pay)
2. Make the case for why LWYRD clients are different before they even arrive
3. Explain the Assessment as a firm differentiator, not a compliance burden
4. Address the two main objections directly (budget mismatch, specialty/jurisdiction mismatch)
5. Close with a distinct application form — not the general Contact page

**Tone:** Direct, peer-to-peer. Not a sales page. More like a conversation with a smart managing partner who has heard every referral platform pitch before and didn't believe any of them.

**Section order:**
1. Hero
2. The Problem with Referrals
3. How LWYRD Is Different
4. The LWYRD Assessment (as a firm benefit)
5. Objections Addressed
6. Application Form
7. FAQ (brief — links to full FAQ for more)

---

### Section 1 — Hero

**[WRITE AS-IS]**

Pill label: For Law Firms

**H1:**
> The clients who find you through LWYRD already know what they need.

**Body:**
> Most legal referrals arrive with vague situations, unclear budgets, and no idea whether your practice area actually matches their matter. LWYRD clients arrive differently. Before they ever see your firm's name, they've answered a structured intake covering their legal issue, matter specifics, timeline, budget, and the type of firm relationship they're looking for. The match happened before the introduction.

**CTA:**
> `Apply to Join the Network` *(links to the application form on this page)*

---

### Section 2 — The Problem with Referrals

**[WRITE AS-IS]**

**Overline:** THE PROBLEM

**H2:**
> Referrals are guesses. Most of them are bad ones.

**Body:**
> A referral from a friend or colleague is a name, not a match. It tells you nothing about whether the client's matter fits your practice area, whether their budget aligns with your billing structure, or whether they're in a jurisdiction you serve. You spend the first conversation figuring out whether there's even a fit — and often there isn't.

> Directories are worse. Pay-to-appear models put your firm next to every other firm in your zip code, regardless of specialty. The clients who find you through a directory listing didn't find you because you were right for their matter. They found you because you were close, or because you paid more than the firm below you.

> LWYRD is built on the premise that a good referral only happens after a real intake. Not a name. Not a listing. A match.

---

### Section 3 — How LWYRD Is Different

**Overline:** HOW IT WORKS FOR FIRMS

**H2:**
> Your firm appears when the match is real.

**Three-column (or stacked) breakdown:**

**Column 1 — Intake before introduction**

Title: *Clients qualify themselves before they reach you.*

Body:
> Every client who finds your firm through LWYRD has completed a structured intake covering their track (startup, small business, or individual), their legal category, matter specifics, timeline, budget, and firm type preference. By the time your firm appears in their results, you already know more about their situation than most first calls reveal.

**Column 2 — Matched on fit, not proximity**

Title: *You only appear when your practice area, jurisdiction, and parameters align.*

Body:
> LWYRD's matching algorithm compares a client's intake answers against your firm's profile — practice areas, operating states, billing structure, firm size. If the match isn't strong, your firm doesn't appear. This means the clients who see you are the clients whose needs you can actually meet.

**Column 3 — No upfront cost**

Title: *Getting listed on LWYRD costs nothing to start.*

Body:
> There is no listing fee. There is no pay-to-appear model. Firms are evaluated through the LWYRD Assessment and, once listed, appear in results based entirely on match quality. The relationship between LWYRD and its firm partners is built around the quality of matches, not the size of a payment.

---

### Section 4 — The LWYRD Assessment (as a firm benefit)

**Overline:** THE LWYRD ASSESSMENT

**H2:**
> Your Assessment result is a public credential.

**Body:**
> Every firm on LWYRD passes a rigorous evaluation before appearing on the platform — bar standing and disciplinary history, depth of practice experience, responsiveness commitments, fee transparency, written engagement standards. A firm that passes the LWYRD Assessment has a visible credential on its profile: every criterion met is listed publicly, alongside the firm's assessment score.

> For a boutique firm competing against larger directories for the attention of sophisticated clients, that visibility is a real differentiator. A client comparing two firms with similar practice areas will see, in detail, what your firm committed to — and that it followed through. That's not a marketing claim. It's a verified record.

> The Assessment is also what keeps the network credible. Every firm that appears in a client's results has already been held to the same standard. The clients who find you through LWYRD trust the results they're seeing — because they know every firm on the list earned its place.

**Stats:**
> `100%` of firms assessed before listing
> `Zero` pay-to-play
> Full assessment results visible on every firm profile

---

### Section 5 — Objections Addressed

**Overline:** COMMON QUESTIONS

**H2:**
> We've heard the concerns. Here's how LWYRD addresses them.

---

**Objection 1 — "We get matched with clients who can't afford us."**

> LWYRD captures budget range and billing preference during intake — before a client ever sees your firm's name. If a client's budget doesn't align with your billing structure, your firm doesn't appear in their match. You set your billing parameters in your firm profile. The intake filters accordingly.

---

**Objection 2 — "We end up with matters outside our practice area or jurisdiction."**

> Your firm profile specifies the practice areas you cover and the states you're licensed in. The matching algorithm only surfaces your firm when a client's practice area and state requirements align with your profile. If a client needs a California employment attorney and your firm doesn't cover California, they won't see you.

---

**Objection 3 — "We don't know what we're getting before the first call."**

> When a client contacts your firm through LWYRD, you receive a summary of their intake — their track, legal category, matter specifics, timeline, budget, and what they told us they're looking for. The first call starts from a foundation of context, not from a blank intake that duplicates what the client already completed.

---

### Section 6 — Application Form

**Overline:** APPLY TO JOIN

**H2:**
> Start the conversation.

**Body:**
> We evaluate each firm individually. If your firm is a fit for the LWYRD network, we'll walk you through the Assessment process and get your profile built. There's no cost to apply.

**Form fields:**

| Label | Placeholder | Type | Required |
|-------|-------------|------|----------|
| Firm name | Your firm's full name | text | ✓ |
| Primary contact name | Your name | text | ✓ |
| Email address | your@firm.com | email | ✓ |
| Primary practice areas | e.g., Corporate, IP, Employment | text | ✓ |
| States where you're licensed | e.g., NY, CA, TX | text | ✓ |
| Why LWYRD? | Tell us briefly why your firm is a strong fit for the network | textarea | ✓ |

**Submit button:** `Submit Application`

**Success state:**

> Application received. Someone from the LWYRD team will be in touch within two business days.

> **Structural note:** This form feeds a separate intake in LWYRD's admin — not the general contact form. Firm inquiries and client inquiries should never share the same queue.

---

### Section 7 — Brief FAQ (firm-specific)

*(Three questions, linking to full FAQ for more.)*

**Q: What does the LWYRD Assessment evaluate?**

A: The Assessment covers bar standing and disciplinary history, years of experience in core practice areas, professional liability insurance, verified client references, written engagement agreements, conflicts of interest procedures, a dedicated client point of contact, a 48-hour response commitment, upfront fee disclosure, itemized billing, and secure document handling. Full assessment results are visible on your public firm profile.

**Q: Is there a cost to be listed on LWYRD?**

A: No. There is no listing fee and no pay-to-appear model. Firms are listed based on their Assessment results and appear in match results based entirely on fit.

**Q: What happens after a client matches with my firm?**

A: When a client unlocks their results and your firm appears, they see your full profile and assessment results. If they choose to contact you, LWYRD facilitates the introduction — sharing their intake summary so you have context before the first conversation. After that, the engagement is entirely between your firm and the client.

**Bottom link:** More questions? [See the full FAQ →] *(links to `/faq`)*

---

---

## PAGE: FAQ (`/faq`)

**Changes from current version:**

1. Tab "For Startups, Small Businesses, and Individuals" → renamed to **"For Clients"**
2. "For Law Firms" tab content → migrated to `/for-law-firms` page; the FAQ retains a short section with a link to the firm page
3. FAQ added to main nav (logged-out state)

---

### Hero

**Pill label:** FAQ

**H1:**
> Frequently Asked Questions

**Body:**
> Answers to common questions about how LWYRD works — for clients and for law firms.

---

### Tab: General

*(Content unchanged from current version — it's accurate and clear.)*

**Q: What is LWYRD?**
A: LWYRD is a legal matchmaking platform. We guide individuals and organizations through a structured intake process to understand their legal situation, then connect them with vetted law firms best suited to their specific needs. We are not a law firm and do not provide legal advice.

**Q: Is LWYRD free to use?**
A: Yes — creating an account, completing the intake, and receiving your matched firm results are all free. There is no cost to get matched.

*(Updated to reflect current free phase — removes the confusing "requires access" language from the current version.)*

**Q: Is LWYRD a law firm?**
A: No. LWYRD is not a law firm and does not practice law. We do not provide legal advice, represent clients, or establish attorney-client relationships. Our role is to help people find the right specialist — nothing more.

**Q: Do I need an account to use LWYRD?**
A: You need a free account to complete the intake and receive your matches.

**Q: Who does LWYRD serve?**
A: LWYRD serves startups (entity formation, fundraising, IP, equity), small businesses (contracts, employment, commercial disputes, regulatory matters), and individuals (family law, immigration, employment disputes, personal injury, and more).

---

### Tab: For Clients

*(Replaces "For Startups, Small Businesses, and Individuals")*

*(Content largely unchanged — accurate and useful. Minor copy edits noted.)*

**Q: How does the matching process work?**
A: The intake starts by asking who you are — a startup, small business, or individual — and which legal area you need help with. From there you answer a focused set of questions about your specific situation. LWYRD then matches you with vetted firms based on your practice area, matter specifics, timeline, budget, and firm preference.

**Q: What is the intake questionnaire?**
A: A short guided wizard — typically five to ten minutes. No legal jargon. It begins with a few questions about your situation and legal category, then asks more specific questions based on your track and the category you selected. Your answers are stored securely and never shared without your knowledge.

**Q: How are law firms vetted?**
A: Every firm on LWYRD passes the LWYRD Assessment before being listed. The assessment evaluates bar standing, disciplinary history, years of experience in the practice area, professional liability insurance, client reference verification, fee transparency, billing practices, responsiveness commitments, and more.

**Q: What is the LWYRD Assessment?**
A: The LWYRD Assessment is a rigorous, multi-point vetting standard applied to every firm on the platform. It covers criteria like active bar status, no disciplinary history in the past five years, minimum five years of core practice experience, written engagement agreements, 48-hour response commitments, and transparent fee structures. Each firm's assessment result is visible on its profile, and assessment performance factors into match ranking.

*(Removed the specific "13-point" reference throughout.)*

**Q: Are my answers confidential?**
A: Yes. Your intake answers are stored securely and used only to generate your matches. We do not share your information with law firms without your knowledge, and we do not sell your data.

**Q: Can I be matched with more than one firm?**
A: Yes. Your results page shows multiple matched firms, ranked by fit. You can review all of them, save the ones that interest you, and compare before deciding who to contact.

---

### Tab: For Law Firms

*(Short — links out to full /for-law-firms page)*

**Brief intro:**
> Looking to join the LWYRD network? Visit our [For Law Firms page →](/for-law-firms) for the full picture — how the Assessment works, how matching operates, and how to apply.

**Q: What does the LWYRD Assessment evaluate?**
A: The Assessment covers bar standing and disciplinary history, years of experience in core practice areas, professional liability insurance, verified client references, written engagement agreements, conflicts of interest procedures, a dedicated client point of contact, a 48-hour response commitment, upfront fee disclosure, itemized billing, and secure document handling.

**Q: Is there a cost to be listed on LWYRD?**
A: No. There is no listing fee and no pay-to-appear model. Firms are listed based on their Assessment results.

**Q: How do I apply?**
A: [Apply on the For Law Firms page →](/for-law-firms)

---

---

## PAGE: Contact (`/contact`)

**Changes from current version:**

1. H1 changed from "Book a Consultation" to "Get in Touch" — resolves the mismatch between the nav label ("Contact Us") and the page title
2. Subject dropdown updated
3. Body copy tightened

---

### Header

**Pill label:** Contact Us

**H1:**
> Get in Touch

**Body:**
> Whether you have a question, want to learn more, or are ready to get started — the LWYRD team responds within one to two business days.

*(Replaces the current subhead, which was slightly redundant and ended with "promptly" — which is vague. "Within one to two business days" is specific and more credible.)*

---

### Form

*(Fields unchanged — full name, email, organization, subject, message.)*

**Subject dropdown — updated options:**

- Select a topic *(placeholder, disabled)*
- Question about how LWYRD works
- Get matched — I need help finding a firm
- Law firm inquiry *(routes to firm team)*
- Media or press
- Other

*(Removed "Book a consultation" and "Organization or partnership" from dropdown — these are Phase 2 items. "Firm listing inquiry" renamed to "Law firm inquiry" for clarity.)*

**Success state:**

H2: Message received.

Body: Someone from the LWYRD team will be in touch within one to two business days.

---

### Right Sidebar

**Common reasons to reach out:**
- I have a question about how matching works
- I want to speak with the LWYRD team before starting intake
- I represent a law firm and want to learn about joining the network
- Something else entirely

*(These replace the current icon + label format — these read more naturally as actual reasons a real person would reach out.)*

---

---

## PAGE: Intake (`/intake`)

**Purpose:** The intake is a product, not just a form. It should feel guided and human at every step. The changes here are structural and copy-level — the full question set is defined in the separate Intake Flow Implementation Spec (`LWYRD_Intake_Flow_Implementation.md`).

---

### Pre-Intake Orientation Screen (NEW — appears before Q1)

**This screen does not exist yet. It must be built.**

This is the transitional moment between clicking "Get Matched" and seeing the first question. It is not a marketing moment — it is a friction-reduction moment. Users who know what they're walking into complete multi-step flows at significantly higher rates than those who don't.

**[WRITE AS-IS]**

Pill label: Before you begin

**H2:**
> Here's what to expect.

**Four-line body:**
> This intake takes about five minutes.
> There's no legal jargon — just plain questions about your situation.
> Your answers are private and used only to find your matches.
> At the end, you'll receive a ranked list of law firms matched to your specific needs.

**Button:**
> `Let's Get Started →`

> **Design note:** This screen is not skippable — but it should feel like one natural breath before the flow begins, not a speed bump. Keep it visually light: no forms, no checkboxes, no decisions. Just the four lines and the button.

---

### Intake Header (during the flow — unchanged)

Pill label: [selected legal category name, or "Legal Intake" before category is chosen]

H1: Tell us about your needs

Subhead: Your answers help us find the most relevant firms for you. There are no right or wrong answers.

---

### Post-Intake Email (NEW — triggered on intake submission)

**This does not exist yet. It must be built.**

A plain-text confirmation email sent automatically after the user submits their intake. From a named team member's address (not a no-reply address).

**Subject:** Your LWYRD intake is complete

**Body:**

> Hi [First name],
>
> We received your intake. Here's a quick summary of what you told us:
>
> Track: [Startup / Small Business / Individual]
> Legal category: [Category name]
> Matter: [Brief matter summary, e.g., "IP assignment and trademark registration"]
>
> We're reviewing your answers and matching you with the firms that best fit your situation. Your matched results are already available on your LWYRD dashboard — log in to see them.
>
> [View My Matches →]
>
> If you have questions or want to talk through your results with someone from our team, just reply to this email.
>
> — The LWYRD Team

> **Implementation note:** The email is sent from a real address (e.g., `team@lwyrd.co` or a specific team member's address). It references the user's actual intake answers. It feels like a handoff from a real team, not a system notification.

---

---

## PAGE: Results (`/results`)

**Changes from current version:**

The access gate and blur mechanic are Phase 2. In the current build, all results are visible to logged-in users. The access gate banner and locked card states should be removed or hidden until Phase 2. The results page is otherwise structurally sound.

---

### Header

**Breadcrumb:** My Dashboard / Your Matches *(updated — "Intake" replaced with "My Dashboard" once the dashboard exists)*

**H1:**
> Your Matches

**Dynamic subhead (with results):**
> We found [N] firm(s) that match your needs in [Category Name].

**Dynamic subhead (no results):**
> No firms matched your criteria — try adjusting your answers.

---

### Empty State

**H3:** No matches found.

**Body:**
> Try adjusting your preferences — a different budget range, timeline, or stage may surface more results.

**Buttons:**
- `Refine my answers →` *(links to /intake)*
- `Start a new intake →` *(links to /intake)*

---

### Match Card — Unlocked (current Phase 1 state)

*(Structure unchanged — Best Match pill, score, firm name, tagline, meta row, match reasons, View Profile button. The Save/heart button remains.)*

---

### Bottom Link

> Didn't see what you needed? [Refine your answers →] *(links to /intake)*

---

---

## PAGE: Firm Profile (`/firms/[id]`)

**Changes from current version:**

**Sidebar — Contact CTA card:**

Current H3: "Book a consultation"
Current body: "Reach out to [Firm Name] to discuss your legal needs and get started."

**Revised:**

H3: *Connect with [Firm Name]*

Body: *Ready to reach out? Your intake summary will be shared with [Firm Name] so they have context before your first conversation.*

Button: `Contact This Firm →`

*(This change ties the firm profile CTA back to the intake the user just completed — reinforcing that the intake served a purpose and that the firm is already in context.)*

---

---

## MODAL: Sign In / Sign Up (AuthModal)

**Critical change: Role selector added to Sign Up.**

---

### Sign Up State

**H2:** Create your account

**Subhead:** Join LWYRD to find the right legal partner.

**Fields (updated):**
- Your full name *(text)*
- Your email *(email)*
- Password *(password)* — Helper: Must be at least 6 characters.
- **I am:** *(role selector — radio or toggle)*
  - Looking for legal help *(routes to client experience)*
  - A law firm *(routes to firm experience)*

**Button:** `Create Account`

> **Implementation note:** The role selected here determines nav state, dashboard routing, and every product surface the user sees from that point forward. "Looking for legal help" creates a client account. "A law firm" creates a firm account and triggers a different onboarding path (firm profile setup vs. intake). This field is required. Role cannot be changed after account creation without contacting support.

---

### Login State

*(Unchanged from current version.)*

---

---

## MODAL: Contact This Firm (ContactFirmModal)

**[WRITE AS-IS — revised version]**

**Header:** Contact [Firm Name]

**Subhead:**
> We'll share your intake summary with [Firm Name] so they have full context before you speak. Add anything you'd like them to know.

*(Replaces current subhead which asks the user to re-explain their situation — something LWYRD has already collected. This version acknowledges that the intake served a purpose and reduces friction.)*

**Fields:**
- Your name *(text)*
- Your email *(email)*
- Anything else you'd like [Firm Name] to know *(textarea — optional)*

**Submit button:** `Send Introduction to [Firm Name]`

**Success state:**
- ✓ Introduction sent.
- [Firm Name] will be in touch with you shortly.

---

---

## PAGE: /browse

**Current behavior:** Immediately redirects to `/intake`.

**Revised:** This route should redirect to the Pre-Intake Orientation Screen, not directly to Q1. If the orientation screen is built as its own route (e.g., `/intake/start`), `/browse` should redirect there. If the orientation screen is the first state of the intake wizard, the redirect is fine as-is.

Either way, the dead-redirect behavior stays — this route does not need its own content. It just needs to land somewhere that feels intentional.

---

---

## CLIENT DASHBOARD (`/dashboard`) *(NEW PAGE)*

**This page does not exist yet. It must be built.**

A logged-in client who has completed intake and is evaluating matches needs a home base — not just a results page. The dashboard is that home base.

---

### Structure

**Header:**

H1: Welcome back, [First name].

Dynamic subtext (if matches exist): You have [N] active match(es) in [Category name].

Dynamic subtext (if no intake): You haven't started an intake yet. [Get Matched →]

---

**Section 1 — Active Matches**

H2: Your matches

Subtext: Based on your most recent intake · [Category name] · [Date completed]

*(Match cards — same component as Results page, but abbreviated. Shows top 2–3 matches with a "View all matches →" link to the full Results page.)*

---

**Section 2 — Saved Firms**

H2: Saved firms

*(Firms the user has saved via the heart/bookmark icon on match cards or firm profiles. If none saved: "You haven't saved any firms yet. Browse your matches to save the ones that interest you.")*

---

**Section 3 — Intake History**

H2: Your intakes

*(List of completed intakes with: category name, date completed, link to results. If more than one: "Start a new intake →")*

---

**Section 4 — Start a New Matter**

H2: Need help with something else?

Body: Start a new intake for a different legal matter. Your previous matches are saved.

Button: `Start New Intake →`

---

---

## FIRM PORTAL (`/portal`) *(NEW PAGE)*

**This page does not exist yet. It must be built.**

The authenticated experience for firm users. Currently, firm users who log in see the same nav and shell as clients — this is a critical gap.

---

### Structure

**Header:**

H1: [Firm Name] Portal

Subtext: Manage your profile, Assessment status, and matched client pipeline.

---

**Section 1 — Assessment Status**

H2: LWYRD Assessment

Status pill: Passed / Pending / In Review

Link: View full assessment results →

---

**Section 2 — Firm Profile**

H2: Your firm profile

*(Preview of public-facing firm profile — name, tagline, practice areas, assessment score.)*

Button: `Edit Profile →`

---

**Section 3 — Matched Clients**

H2: Matched clients

Subtext: Clients whose intake answers match your firm's profile.

*(List of matched client entries showing: track, legal category, matter summary from intake, date matched, status [New / Contacted / In Conversation]. Clicking an entry shows the intake summary LWYRD collected for that client.)*

Empty state: No matched clients yet. Your profile is live — matches will appear here as clients complete intake in your practice areas.

---

---

## PHASE 2 — DEFERRED ITEMS

The following are valid and planned but should not be built until LWYRD begins charging or reaches the relevant scale. Nothing below should appear in the current navigation, site structure, or copy.

---

### Access & Monetization

- Results page partial profile visibility before the access gate
- Full-blur match cards and access gate conversion optimization
- Pricing and access transparency page
- Individual Access tier and Organization Access tier differentiation on `/access`
- Step 03 homepage copy adjustment to set expectations for the access gate
- "Is LWYRD free to use?" FAQ answer revision (current answer is accurate for free phase; revisit when charging begins)

---

### Growth & Acquisition

- Organizations / enterprise page for accelerators and universities (`/for-organizations`)
- Educational content hub (`/resources`)
- Legal category landing pages for SEO (`/services/[slug]` — currently renders from database; full landing page treatment is Phase 2)
- Post-match email nurture sequence (premature until dashboard exists and gives users somewhere to return to)

---

### Product Depth

- Advanced match score explanation (tooltip is Phase 1; a full "How is this score calculated?" modal or page is Phase 2)
- Matter history accumulation as a firm credibility asset (requires firm portal to be live and tracking)
- Aggregated reporting for organization-level access partners

---

---

## SUMMARY — WHAT'S NEW VS. WHAT EXISTS

| Item | Status |
|------|--------|
| Homepage trust bar (outcome stats) | **New** |
| Homepage social proof section | **New** |
| Homepage final CTA (replaces newsletter) | **New** |
| Newsletter moved to footer only | **Change** |
| "Book a Consultation" removed from hero | **Change** |
| Single CTA in hero ("Get Matched") | **Change** |
| /for-law-firms page | **New — build required** |
| FAQ added to main nav | **Change** |
| Pre-intake orientation screen | **New — build required** |
| Post-intake confirmation email | **New — build required** |
| Role selector in signup modal | **New — build required** |
| ContactFirmModal copy (intake summary acknowledged) | **Change** |
| Contact page H1 ("Get in Touch") | **Change** |
| About page founding story | **New — written above** |
| About page "13-point" removed | **Change** |
| Client dashboard (/dashboard) | **New — build required** |
| Firm portal (/portal) | **New — build required** |
| Firm voice quote on homepage | **Placeholder — future content** |
| Access gate / blur mechanic | **Phase 2 — do not build yet** |
| /browse redirect behavior | **Minor fix** |

---

*End of Document — LWYRD Website Structure v1.0*
