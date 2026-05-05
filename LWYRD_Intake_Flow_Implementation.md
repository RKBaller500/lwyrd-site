# LWYRD Intake Flow — Implementation Specification
**Version 2.0 | Full Redesign | All Three Tracks**

---

## Purpose of This Document

This document is the complete specification for implementing the LWYRD intake flow. It is intended for Claude Code or a developer working on the existing LWYRD website. Every question, every answer option, every branching rule, and every data schema field is defined here. Nothing should be inferred or improvised — implement exactly what is specified.

---

## Overview

The intake flow is a multi-step questionnaire that routes users to a matched law firm. It is organized into three distinct tracks based on who the user is:

- **Startup** — VC-backable or growth-oriented companies, any funding stage
- **Individual** — Personal legal matters, not business-related
- **Small Business** — Operating businesses not seeking institutional funding

The flow has three parts:

1. **Part 1 — Universal Entry Questions** — Shown to every user; establishes track and legal category
2. **Part 2 — Track-Specific Questions** — Branches based on track (2A Startup, 2B Individual, 2C Small Business)
3. **Part 3 — Data Schemas** — Defines how every answer maps to a structured data field for export

**Typical question count per user: 10–14 questions total.** Users never see questions from other tracks or irrelevant sub-categories.

---

## General UI/UX Requirements

- Each question is displayed **one at a time** on its own screen (no scrolling through a long form)
- A **progress bar** is shown at the top (e.g., "Question 3 of 12 — 25% complete")
- Every question has a **Back** button and a **Next** button; Next is disabled until a selection is made
- Questions marked **REQUIRED** must be answered before advancing
- Questions marked **OPTIONAL** can be skipped
- Questions that accept **"Select all that apply"** use **multi-select checkboxes**; all other questions use **single-select radio buttons**
- At the end of the flow, show a **Review your answers** screen before submission, allowing the user to go back and edit any answer
- After submission, route the user to the **Your Matches** page
- The category pill/badge shown in the current flow (e.g., "Contract Law") should update to reflect the legal category the user selected in Q2

---

## Branching Logic — Summary

```
Entry → Q1 (Who are you?)
          ├── A: Startup  → Q2 (Startup legal categories) → S1–S4 → S5[a–p based on Q2] → SF1–SF8
          ├── B: Individual → Q2 (Individual legal categories) → I1–I2 → I3[a–q based on Q2] → IF1–IF6
          └── C: Small Business → Q2 (Small Business legal categories) → B1–B3 → B4[a–n based on Q2] → BF1–BF8
```

Q2 shows a **different set of options depending on the track selected in Q1**. See Part 1 below for full details.

---

---

# PART 1 — UNIVERSAL ENTRY QUESTIONS

These two questions appear for every user, before any track-specific branching begins.

---

## Q1 — Segment Routing

> **REQUIRED | Single-select**

**Question text:**
> Who best describes you?

**Sub-text (shown below question):**
> This routes you to the right set of questions. There are no wrong answers.

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Startup or early-stage company | VC-backable or growth-oriented, at any funding stage |
| B | Individual / Personal matter | Not a business — this is a personal legal need |
| C | Small business | Operating business, not seeking institutional funding |

**Branching:**
- A → Startup Track (Part 2A)
- B → Individual Track (Part 2B)
- C → Small Business Track (Part 2C)

> **⚑ Design decision:** This is Q1 — not buried later in the flow. Segment routing must happen first. Everything else is a downstream refinement.

---

## Q2 — Legal Category

> **REQUIRED | Single-select**

**Question text:**
> What area of law do you need help with?

**Sub-text:**
> Select the one that best fits your situation. You can always start multiple intake flows for different matters.

**IMPORTANT — IMPLEMENTATION NOTE:** Q2 shows a **different set of options depending on the answer to Q1.** Each track sees only its own options — never a mixed list. The three option sets are defined below.

---

### Q2 Options — Startup Track (shown only when Q1 = A)

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Corporate Formation & Structure | Entity type, founders' agreement, cap table |
| B | Intellectual Property | Patents, trademarks, trade secrets, IP assignment |
| C | Fundraising & Securities | SAFE notes, term sheets, equity rounds |
| D | Employment & Equity Compensation | Hiring, offer letters, stock options, contractors |
| E | Commercial Contracts | Customer agreements, vendor contracts, NDAs, SaaS |
| F | Regulatory & Compliance | Fintech/healthtech licensing, GDPR/CCPA, T&Cs |
| G | Corporate Governance | Board structure, shareholder agreements, amendments |
| H | M&A / Exit | Acquisition, acqui-hire, due diligence prep |
| I | Dispute Resolution | Co-founder disputes, IP claims, investor conflicts |

**Branching:** Answer drives which S5 sub-questions are shown (see Part 2A).

---

### Q2 Options — Individual Track (shown only when Q1 = B)

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Family Law | Divorce, custody, prenups, adoption |
| B | Estate Planning & Wills | Wills, trusts, power of attorney, probate |
| C | Real Estate | Home purchase/sale, landlord-tenant, lease review |
| D | Personal Injury & Civil Litigation | Accidents, malpractice, insurance disputes |
| E | Immigration | Work visas, green card, citizenship, deportation defense |
| F | Employment (as an employee) | Wrongful termination, discrimination, wage claims |
| G | Tax | IRS disputes, audit defense, back taxes |
| H | Criminal Defense | DUI, misdemeanor, felony, expungement |
| I | Bankruptcy & Debt | Chapter 7/13, debt negotiation |
| J | Consumer Protection | Fraud, identity theft, contract disputes |

**Branching:** Answer drives which I3 sub-questions are shown (see Part 2B).

---

### Q2 Options — Small Business Track (shown only when Q1 = C)

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Business Formation & Restructuring | Entity formation, operating agreements, succession |
| B | Commercial Contracts | Client agreements, vendor contracts, NDAs |
| C | Employment Law | Hiring, handbooks, wage compliance, terminations |
| D | Intellectual Property | Trademark, copyright, trade secrets, licensing |
| E | Business Disputes & Litigation | Contract breach, partner disputes, collections |
| F | Real Estate & Commercial Leases | Lease negotiation, property acquisition, disputes |
| G | Regulatory & Licensing | Industry permits, state/local compliance |
| H | Tax & Financial | Business tax, IRS disputes, payroll tax |
| I | M&A / Buying or Selling a Business | Purchase/sale, partner buyout, succession |
| J | Data Privacy & Cybersecurity | Privacy policy, data breach, CCPA/GDPR |

**Branching:** Answer drives which B4 sub-questions are shown (see Part 2C).

> **⚑ Design decision:** In the actual product, each track sees only its own 9–10 options, never a combined list. The answer to Q2 drives all subsequent sub-questions.

---

---

# PART 2A — STARTUP TRACK

**Trigger:** User selected "Startup or early-stage company" in Q1.

**Flow structure:**
1. Questions S1–S4 (universal startup context — shown to all startup users)
2. Questions S5a–S5p (category sub-questions — shown based on Q2 answer)
3. Questions SF1–SF8 (universal startup closing — shown to all startup users)

---

## S1–S4: Startup Universal Context Questions

Shown to every user in the startup track, regardless of legal category.

---

### Question S1 — Company Stage

> **REQUIRED | Single-select**

**Question text:**
> What stage best describes your company right now?

**Sub-text:**
> This shapes which firms and attorneys are most relevant for your needs.

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Pre-incorporation / Idea stage | Haven't formed the entity yet |
| B | Pre-Seed / Just incorporated | Entity formed, little or no outside capital raised |
| C | Seed stage | Raised a seed or pre-seed round, building product |
| D | Series A | First priced institutional round closed or in process |
| E | Series B or later | Growth stage, multiple institutional rounds |
| F | Bootstrapped / Revenue-funded | No outside institutional capital, self-sustaining |

**Data field:** `company_stage` → enum: `pre_incorp | pre_seed | seed | series_a | series_b_plus | bootstrapped`

> **⚑ Data note:** This is the single highest-value field for VC and accelerator data buyers. Capture and store as enum. Cross-referenced with industry and legal need, it maps demand by stage cohort.

---

### Question S2 — Industry

> **REQUIRED | Single-select**

**Question text:**
> What industry is your startup in?

**Sub-text:**
> Helps match you with attorneys who specialize in your sector's regulatory landscape.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Technology / SaaS / Software |
| B | AI / Machine Learning |
| C | Fintech / Financial Services |
| D | Healthtech / Life Sciences / Biotech |
| E | Consumer / E-commerce / Marketplace |
| F | Media / Content / Creator Economy |
| G | Hardware / Deep Tech / Robotics |
| H | Climate / Energy / Sustainability |
| I | Enterprise SaaS / B2B |
| J | Other — You'll describe it briefly in the next step |

**Data field:** `industry_vertical` → enum: `tech_saas | ai_ml | fintech | healthtech | consumer | media | hardware | climate | enterprise_b2b | other`

---

### Question S3 — Fundraising Status

> **REQUIRED | Single-select**

**Question text:**
> Are you currently fundraising or planning to raise capital in the next 6 months?

**Sub-text:**
> Some legal needs are urgent when a round is active or imminent.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Yes — actively in a fundraising process right now |
| B | Yes — planning to raise within 6 months |
| C | No — not raising capital at this time |
| D | Bootstrapped — no plans to raise institutional capital |

**Data fields:**
- `is_fundraising_active` → boolean: `true` (if A or B), `false` (if C or D)
- `fundraising_timeline` → enum: `active_now | within_6mo | not_raising | bootstrapped`

> **⚑ Data note:** This field is high-value for accelerators and pre-seed investors. A "Yes" answer with a specific stage signals an immediately actionable legal engagement.

---

### Question S4 — Founder Count

> **REQUIRED | Single-select**

**Question text:**
> How many co-founders does the company have?

**Sub-text:**
> Matters for governance, equity structure, and the complexity of formation or dispute work.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Solo founder |
| B | 2 founders |
| C | 3–4 founders |
| D | 5 or more |

**Data field:** `founder_count` → integer enum: `1 | 2 | 3_4 | 5_plus`

---

## S5+: Legal Category Sub-Questions (Startup)

The following sub-questions branch by the legal category selected in Q2. **Only the relevant sub-section appears to each user.** Implement as conditional rendering based on Q2 answer.

---

### If Q2 = A (Corporate Formation & Structure)

---

#### Question S5a

> **REQUIRED | Single-select**

**Question text:**
> What is the current status of your entity?

**Answer options:**

| Option | Label |
|--------|-------|
| A | No entity formed yet — starting from scratch |
| B | Entity formed but needs restructuring or amendments |
| C | Existing entity — need to add or remove a co-founder |
| D | Need to convert entity type (e.g., LLC to C-Corp) |

---

#### Question S5b

> **REQUIRED | Single-select**

**Question text:**
> Which entity type are you considering or currently using?

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Delaware C-Corp | Standard for VC-backed companies |
| B | LLC | |
| C | S-Corp | |
| D | Not sure — need guidance | |

---

#### Question S5c

> **REQUIRED | Single-select**

**Question text:**
> What is the most pressing issue you need help with?

**Sub-text:**
> Select the one that is most urgent.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Choosing the right entity and state of incorporation |
| B | Drafting founders' agreement and equity splits |
| C | Setting up vesting schedules |
| D | IP assignment agreements from founders |
| E | Cap table setup and management |
| F | Bylaws or operating agreement drafting |

---

### If Q2 = B (Intellectual Property)

---

#### Question S5d

> **REQUIRED | Multi-select**

**Question text:**
> What type of IP protection do you need?

**Sub-text:**
> Select all that apply.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Patent (utility or provisional filing) |
| B | Trademark registration |
| C | Copyright |
| D | Trade secret and NDA strategy |
| E | IP assignment from founders or contractors |
| F | Freedom-to-operate opinion |
| G | IP infringement — we are being accused or want to enforce |

---

#### Question S5e

> **REQUIRED | Single-select**

**Question text:**
> Has your core IP been assigned from founders and contractors to the company?

**Sub-text:**
> Investors will require clean IP chain of title.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Yes — all IP is assigned to the company |
| B | Partially — some but not all assignments are in place |
| C | No — this hasn't been done yet |
| D | Not sure |

**Data field:** `ip_assigned` → enum: `yes | partial | no | unsure`

> **⚑ Data note:** "B" or "C" answers here indicate a specific, urgent, recurring startup legal need. Valuable signal for legal tech and accelerator data buyers.

---

### If Q2 = C (Fundraising & Securities)

---

#### Question S5f

> **REQUIRED | Single-select**

**Question text:**
> What type of fundraising instrument are you working with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | SAFE note (Simple Agreement for Future Equity) |
| B | Convertible note |
| C | Priced equity round (Series Seed, A, etc.) |
| D | Friends and family / angel round |
| E | Not sure — need guidance on which instrument to use |

**Data field:** `fundraising_instrument` → enum: `safe | convertible_note | priced_equity | friends_family | unsure`

---

#### Question S5g

> **REQUIRED | Single-select**

**Question text:**
> What is the most pressing issue in your fundraising process?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Reviewing and negotiating a term sheet we received |
| B | Drafting investor documents from scratch |
| C | Cap table modeling and dilution analysis |
| D | Securities law compliance (SEC/state filings) |
| E | Investor rights agreements, side letters, or pro-rata rights |
| F | Closing mechanics and wire logistics |

---

#### Question S5h

> **REQUIRED | Single-select**

**Question text:**
> Approximately how large is the round you are raising or have raised?

**Sub-text:**
> Approximate is fine — this helps match you with firms that handle deals of your size.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Under $500K |
| B | $500K – $2M |
| C | $2M – $10M |
| D | $10M – $30M |
| E | Over $30M |
| F | Not yet determined |

**Data field:** `round_size_range` → enum: `under_500k | 500k_2m | 2m_10m | 10m_30m | over_30m | tbd`

> **⚑ Data note:** Round size is one of the most valuable data points for VC data buyers, as it segments the addressable market by deal stage and ticket size.

---

### If Q2 = D (Employment & Equity Compensation)

---

#### Question S5i

> **REQUIRED | Single-select**

**Question text:**
> What is the primary employment or equity issue you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Offer letters and employment agreements for first hires |
| B | Stock option plan (ESOP) setup and 409A valuation |
| C | Equity grants and option agreements for employees |
| D | Contractor agreements and worker classification (1099 vs W-2) |
| E | Non-compete and non-solicitation agreements |
| F | Severance, termination, or employee dispute |
| G | Equity refresh grants or secondary sales |

---

#### Question S5j

> **REQUIRED | Single-select**

**Question text:**
> How many employees or contractors are you currently managing?

**Answer options:**

| Option | Label |
|--------|-------|
| A | None yet — making our first hire |
| B | 1–5 |
| C | 6–20 |
| D | 21–50 |
| E | More than 50 |

**Data field:** `employee_count_range` → enum: `none | 1_5 | 6_20 | 21_50 | 50_plus`

> **⚑ Data note:** Team size is a strong proxy for company maturity and legal complexity. Cross-referenced with stage and industry, this helps segment legal demand for data partners.

---

### If Q2 = E (Commercial Contracts)

---

#### Question S5k

> **REQUIRED | Single-select**

**Question text:**
> What type of contract do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Customer / client agreement or MSA |
| B | Vendor or supplier agreement |
| C | SaaS or software license agreement |
| D | Partnership or reseller agreement |
| E | NDA / confidentiality agreement |
| F | Terms of Service and Privacy Policy |
| G | Contract review — the other side sent us a draft |
| H | Contract dispute or breach |

---

#### Question S5l

> **REQUIRED | Single-select**

**Question text:**
> Are you drafting this contract or reviewing one presented to you?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Drafting from scratch |
| B | Reviewing and negotiating a draft from the other side |
| C | Both — mutual negotiation of terms |
| D | Dealing with a breach or dispute about an existing contract |

---

### If Q2 = F (Regulatory & Compliance)

---

#### Question S5m

> **REQUIRED | Single-select**

**Question text:**
> What type of regulatory or compliance issue do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Industry-specific licensing (e.g., fintech, healthtech, insurance) |
| B | Data privacy — GDPR, CCPA, or similar |
| C | Terms of Service and Privacy Policy drafting |
| D | AML / KYC compliance (financial services) |
| E | FDA or healthcare-specific regulatory compliance |
| F | Export controls or international trade compliance |
| G | General regulatory audit or compliance review |

---

### If Q2 = G (Corporate Governance)

---

#### Question S5n

> **REQUIRED | Single-select**

**Question text:**
> What governance matter do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Setting up or restructuring the board of directors |
| B | Board consents and written resolutions |
| C | Investor rights and information rights agreements |
| D | Shareholder agreement amendments |
| E | Protective provisions or voting agreements |
| F | General corporate housekeeping and records cleanup |

---

### If Q2 = H (M&A / Exit)

---

#### Question S5o

> **REQUIRED | Single-select**

**Question text:**
> What type of M&A or exit situation are you navigating?

**Answer options:**

| Option | Label |
|--------|-------|
| A | We are being acquired (asset or stock purchase) |
| B | We are acquiring another company |
| C | Acqui-hire — our team is being hired by an acquirer |
| D | Preparing for exit — due diligence cleanup |
| E | Secondary sale — founders or early investors selling shares |
| F | Merger or joint venture |

---

### If Q2 = I (Dispute Resolution)

---

#### Question S5p

> **REQUIRED | Single-select**

**Question text:**
> What type of dispute are you dealing with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Co-founder or partner conflict |
| B | Investor or board dispute |
| C | IP infringement — someone is using our IP |
| D | IP infringement — we've been accused |
| E | Employee or contractor dispute |
| F | Commercial contract breach |
| G | Other business dispute |

---

## S-FINAL: Startup Universal Closing Questions

These 8 questions appear at the end of every startup intake, regardless of legal category selected in Q2. They capture firm preference, billing structure, budget, engagement type, timeline, prior experience, state, and language.

---

### Question SF1 — Firm Type

> **REQUIRED | Single-select**

**Question text:**
> What type of law firm are you looking for?

**Sub-text:**
> Think about the relationship you want, not just the deliverable.

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Large / full-service firm | Broad resources, multiple practice areas, typically higher cost — you may work primarily with associates |
| B | Boutique firm with direct partner access | Smaller team, senior attorney involvement, specialist focus |
| C | Solo practitioner | One attorney handles everything — maximum relationship and often most cost-efficient for focused matters |
| D | No preference — match me on fit | |

**Data field:** `firm_type_preference` → enum: `large | boutique | solo | no_preference`

> **⚑ Design decision:** Firm type is recommended over a seniority-only question. It captures the same signal (who you'll actually work with) while also conveying cultural fit, cost structure, and service model expectations. This is richer data for matching.

---

### Question SF2 — Billing Preference

> **REQUIRED | Single-select**

**Question text:**
> How do you prefer to pay for legal services?

**Sub-text:**
> Different matters suit different billing structures. Select what matters most to you.

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Flat fee — I want a fixed price for this specific project | |
| B | Hourly — I expect ongoing work and am comfortable with hourly billing | |
| C | Retainer / subscription — I want ongoing access to a firm for a monthly fee | |
| D | Equity / deferred — open to non-cash arrangements | Uncommon but exists for early-stage startups |
| E | Not sure — I'd like guidance on what's appropriate for my situation | |

**Data field:** `billing_preference` → enum: `flat_fee | hourly | retainer | equity | unsure`

> **⚑ Design decision:** Billing structure is asked before dollar amount. This prevents anchoring on a raw number and surfaces preference first — a flat-fee seeker at $5K is a very different client from a retainer buyer at $5K/month.

---

### Question SF3 — Budget

> **REQUIRED | Single-select**

**Question text:**
> What is your approximate budget for this matter?

**Sub-text:**
> For ongoing relationships, estimate your monthly ceiling. For one-time work, estimate your total project budget. Approximate is fine.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Under $2,500 |
| B | $2,500 – $10,000 |
| C | $10,000 – $25,000 |
| D | $25,000 – $75,000 |
| E | Over $75,000 |
| F | Not sure — I need help estimating |

**Data field:** `budget_range` → enum: `under_2500 | 2500_10k | 10k_25k | 25k_75k | over_75k | unsure`

---

### Question SF4 — Engagement Type

> **REQUIRED | Single-select**

**Question text:**
> Is this a one-time project or the start of an ongoing relationship?

**Answer options:**

| Option | Label |
|--------|-------|
| A | One-time project — discrete deliverable with a defined end |
| B | Ongoing — I expect to need legal counsel regularly |
| C | Not sure yet |

**Data field:** `engagement_type` → enum: `one_time | ongoing | unsure`

---

### Question SF5 — Timeline

> **REQUIRED | Single-select**

**Question text:**
> How soon do you need to get started?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Urgent — this week or within a few days |
| B | Soon — within the next 2 weeks |
| C | Within a month |
| D | No rush — exploring my options |

**Data field:** `urgency` → enum: `this_week | within_2_weeks | within_month | exploring`

---

### Question SF6 — Prior Counsel

> **REQUIRED | Single-select**

**Question text:**
> Have you worked with a startup attorney before?

**Sub-text:**
> This helps us calibrate how much context-setting a firm may need to do.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Yes — we have or had dedicated legal counsel |
| B | Partially — used a lawyer for a specific matter but no ongoing relationship |
| C | No — this is our first time hiring legal counsel |

**Data field:** `prior_counsel` → enum: `yes_ongoing | yes_prior | no`

---

### Question SF7 — State Requirement

> **OPTIONAL | Single-select**

**Question text:**
> Does your firm need to be licensed in a specific state?

**Sub-text:**
> Required for matters involving state-specific filings or litigation. Many startup matters (e.g., Delaware formation) do not require local counsel.

**Answer options:**

| Option | Label |
|--------|-------|
| A | No preference — the work is not state-specific |
| B | Yes — California |
| C | Yes — New York |
| D | Yes — Texas |
| E | Yes — Delaware (formation/corporate matters) |
| F | Yes — another state |

**Data field:** `state_requirement` → enum: `none | CA | NY | TX | DE | other`

---

### Question SF8 — Language

> **OPTIONAL | Multi-select**

**Question text:**
> Are non-English language capabilities important?

**Sub-text:**
> Select all that apply.

**Answer options:**

| Option | Label |
|--------|-------|
| A | No — English only is fine |
| B | Spanish |
| C | Mandarin |
| D | Hindi |
| E | Portuguese |
| F | Korean |
| G | Other |

**Data field:** `language_requirement` → enum (multi-select): `english | spanish | mandarin | hindi | portuguese | korean | other`

---

---

# PART 2B — INDIVIDUAL TRACK

**Trigger:** User selected "Individual / Personal matter" in Q1.

**Flow structure:**
1. Questions I1–I2 (universal individual context — shown to all individual users)
2. Questions I3a–I3q (category sub-questions — shown based on Q2 answer)
3. Questions IF1–IF6 (universal individual closing — shown to all individual users)

---

## I1–I2: Individual Universal Context Questions

Shown to every user in the individual track, regardless of legal category.

---

### Question I1 — Situation Type

> **REQUIRED | Single-select**

**Question text:**
> What best describes your current situation?

**Sub-text:**
> This gives attorneys useful context before the first conversation.

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | I have an active legal issue that needs immediate attention | |
| B | I'm planning ahead for something I know is coming | e.g., upcoming divorce, planned home purchase, estate planning |
| C | I want to protect myself or my family proactively | e.g., wills, prenups, asset protection |
| D | I need advice before making a major decision | |
| E | I'm responding to legal action taken against me | |

**Data field:** `situation_type` → enum: `active_issue | upcoming_planned | proactive | seeking_advice | responding_to_action`

---

### Question I2 — Prior Counsel

> **REQUIRED | Single-select**

**Question text:**
> Have you worked with an attorney on a personal legal matter before?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Yes — I have prior experience with personal legal counsel |
| B | No — this is my first time seeking legal representation |
| C | Not sure |

**Data field:** `prior_personal_counsel` → enum: `yes | no | unsure`

---

## I3+: Legal Category Sub-Questions (Individual)

Branch based on Q2 answer. Only the relevant sub-section appears.

---

### If Q2 = A (Family Law)

---

#### Question I3a

> **REQUIRED | Single-select**

**Question text:**
> What is the primary family law matter you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Divorce or separation |
| B | Child custody and visitation |
| C | Child support |
| D | Spousal support / alimony |
| E | Prenuptial or postnuptial agreement |
| F | Adoption |
| G | Guardianship |
| H | Domestic violence / protective order |

---

#### Question I3b

> **REQUIRED | Single-select**

**Question text:**
> Is this matter contested or uncontested?

**Sub-text:**
> Contested means the other party disagrees; uncontested means both parties are largely aligned.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Uncontested — both parties are in general agreement |
| B | Contested — there is significant disagreement |
| C | Not yet clear |

**Data field:** `contested` → enum: `contested | uncontested | unclear | na`

---

#### Question I3c

> **REQUIRED | Single-select**

**Question text:**
> Are children involved in this matter?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Yes — custody and/or support arrangements are at issue |
| B | Yes — but custody and support are agreed upon |
| C | No children involved |

**Data field:** `children_involved` → enum: `yes_at_issue | yes_not_at_issue | no | na`

---

### If Q2 = B (Estate Planning & Wills)

---

#### Question I3d

> **REQUIRED | Multi-select**

**Question text:**
> What estate planning documents do you need?

**Sub-text:**
> Select all that apply.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Will / Last Testament |
| B | Revocable living trust |
| C | Power of Attorney (financial) |
| D | Healthcare directive / living will |
| E | Trust for a minor or beneficiary with special needs |
| F | Medicaid planning or elder law advice |
| G | Estate administration or probate (someone has passed) |
| H | Contested will or trust dispute |

---

#### Question I3e

> **REQUIRED | Single-select**

**Question text:**
> Do you have an existing estate plan that needs updating?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Yes — documents exist but need revision |
| B | No — starting from scratch |
| C | Not sure if existing documents are still valid |

---

### If Q2 = C (Real Estate — Individual)

---

#### Question I3f

> **REQUIRED | Single-select**

**Question text:**
> What real estate matter do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Buying a home |
| B | Selling a home |
| C | Landlord-tenant dispute |
| D | Lease review |
| E | Eviction (as landlord or tenant) |
| F | HOA or neighbor dispute |
| G | Foreclosure defense |
| H | Title or boundary dispute |
| I | Contractor or construction dispute |

---

#### Question I3g

> **REQUIRED | Single-select**

**Question text:**
> Are you the buyer/seller, landlord, or tenant in this matter?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Buyer |
| B | Seller |
| C | Landlord |
| D | Tenant |
| E | Not applicable |

---

### If Q2 = D (Personal Injury & Civil Litigation)

---

#### Question I3h

> **REQUIRED | Single-select**

**Question text:**
> What type of personal injury or civil matter is this?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Car accident or vehicle collision |
| B | Slip and fall / premises liability |
| C | Medical malpractice |
| D | Wrongful death |
| E | Insurance dispute or bad faith claim |
| F | Defamation or invasion of privacy |
| G | General civil litigation or lawsuit |

---

#### Question I3i

> **REQUIRED | Single-select**

**Question text:**
> Are you the plaintiff (bringing the claim) or defendant (defending a claim)?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Plaintiff — I was harmed and want to bring a claim |
| B | Defendant — a claim has been filed against me |
| C | Not yet determined |

**Data field:** `plaintiff_or_defendant` → enum: `plaintiff | defendant | tbd | na`

---

### If Q2 = E (Immigration)

---

#### Question I3j

> **REQUIRED | Single-select**

**Question text:**
> What type of immigration matter do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Work visa (H-1B, O-1, L-1, TN, etc.) |
| B | Green card / permanent residency |
| C | Citizenship and naturalization |
| D | Family-based immigration (sponsoring a relative) |
| E | Investor visa (EB-5) |
| F | Asylum or humanitarian protection |
| G | Deportation defense / removal proceedings |
| H | DACA or other status adjustment |

---

#### Question I3k

> **REQUIRED | Single-select**

**Question text:**
> What is your current immigration status in the US?

**Sub-text:**
> This helps match you with attorneys experienced with your specific situation.

**Answer options:**

| Option | Label |
|--------|-------|
| A | US citizen |
| B | Permanent resident (green card holder) |
| C | Visa holder (work, student, or other) |
| D | No current valid status |
| E | Prefer not to say |

**Data field:** `immigration_status` → enum: `us_citizen | permanent_resident | visa_holder | no_status | prefer_not | na`

---

### If Q2 = F (Employment — as an employee)

---

#### Question I3l

> **REQUIRED | Single-select**

**Question text:**
> What is the primary employment issue you are facing?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Wrongful termination |
| B | Workplace discrimination (race, gender, age, disability, etc.) |
| C | Sexual harassment or hostile work environment |
| D | Wage theft or unpaid overtime |
| E | Non-compete agreement review or challenge |
| F | Severance negotiation |
| G | Whistleblower retaliation |
| H | FMLA or leave-related dispute |

---

#### Question I3m

> **REQUIRED | Single-select**

**Question text:**
> Are you still employed at the company where the issue occurred?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Yes — still employed and the issue is ongoing |
| B | No — I have already been terminated or resigned |
| C | It's complicated — on leave, under a PIP, or transitioning out |

**Data field:** `still_employed` → enum: `yes | no | complicated | na`

---

### If Q2 = G (Tax — Individual)

---

#### Question I3n

> **REQUIRED | Single-select**

**Question text:**
> What tax issue do you need legal help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | IRS audit or examination |
| B | Tax debt and payment plans (OIC, installment agreement) |
| C | Penalty abatement or interest reduction |
| D | Unfiled returns or back taxes |
| E | International tax or FBAR compliance |
| F | Tax lien or levy on assets |
| G | Tax fraud allegations |

---

### If Q2 = H (Criminal Defense)

---

#### Question I3o

> **REQUIRED | Single-select**

**Question text:**
> What type of criminal matter are you facing?

**Answer options:**

| Option | Label |
|--------|-------|
| A | DUI / DWI |
| B | Drug-related offense |
| C | Misdemeanor (non-violent) |
| D | Felony charge |
| E | White-collar crime (fraud, embezzlement, etc.) |
| F | Expungement or record sealing |
| G | Probation or parole violation |
| H | Criminal appeal |

---

#### Question I3p

> **REQUIRED | Single-select**

**Question text:**
> What stage is this matter at?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Pre-arrest — I'm under investigation or expect to be charged |
| B | Arrested — charges have been filed |
| C | Pre-trial — in the process of building a defense |
| D | Post-conviction — appeals or sentencing modification |
| E | Seeking expungement of a past conviction |

---

### If Q2 = I (Bankruptcy & Debt)

---

#### Question I3q

> **REQUIRED | Single-select**

**Question text:**
> What debt or bankruptcy situation are you navigating?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Chapter 7 personal bankruptcy (discharge of debts) |
| B | Chapter 13 bankruptcy (repayment plan) |
| C | Debt negotiation or settlement without bankruptcy |
| D | Creditor harassment or collection defense |
| E | Student loan issues |
| F | Not sure — need help evaluating options |

---

### If Q2 = J (Consumer Protection)

> **No sub-questions for this category.** Proceed directly to I-FINAL closing questions after Q2.

---

## I-FINAL: Individual Universal Closing Questions

These 6 questions appear at the end of every individual intake, regardless of legal category.

---

### Question IF1 — Firm Type

> **REQUIRED | Single-select**

**Question text:**
> What type of attorney or firm are you looking for?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Large firm with full resources and a team approach |
| B | Boutique firm — smaller, specialist, direct partner access |
| C | Solo practitioner — one attorney who handles everything |
| D | No preference — match me based on fit and expertise |

**Data field:** `firm_type_preference` → enum: `large | boutique | solo | no_preference`

> **⚑ Design decision:** Same firm-type framing as Startup track — consistent across all three tracks.

---

### Question IF2 — Billing Preference

> **REQUIRED | Single-select**

**Question text:**
> How do you prefer to pay for legal services?

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Flat fee — a fixed price for the work | Common for wills, immigration, simple closings |
| B | Hourly billing | |
| C | Contingency — attorney is paid only if you win | Common for personal injury, employment discrimination |
| D | Retainer — upfront deposit drawn down over time | Common for divorce, ongoing matters |
| E | Not sure — I'd like guidance | |

**Data field:** `billing_preference` → enum: `flat_fee | hourly | contingency | retainer | unsure`

> **⚑ Design decision:** Contingency is added to the individual track **only**. Personal injury and employment discrimination are the primary use cases where attorneys work on contingency — not relevant for startups or small businesses.

---

### Question IF3 — Budget

> **REQUIRED | Single-select**

**Question text:**
> What is your approximate budget for this matter?

**Sub-text:**
> For ongoing matters like divorce, estimate a total range. For one-time matters, estimate the project cost.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Under $1,500 |
| B | $1,500 – $5,000 |
| C | $5,000 – $15,000 |
| D | $15,000 – $50,000 |
| E | Over $50,000 |
| F | Not sure — I need help estimating |

**Data field:** `budget_range` → enum: `under_1500 | 1500_5k | 5k_15k | 15k_50k | over_50k | unsure`

---

### Question IF4 — Timeline

> **REQUIRED | Single-select**

**Question text:**
> How urgently do you need legal help?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Urgent — this week or immediately |
| B | Soon — within the next 2 weeks |
| C | Within a month |
| D | No immediate urgency — planning ahead |

**Data field:** `urgency` → enum: `this_week | within_2_weeks | within_month | planning_ahead`

---

### Question IF5 — State

> **REQUIRED | Single-select**

**Question text:**
> In which state does this legal matter primarily take place?

**Sub-text:**
> Most personal legal matters require locally licensed counsel.

**Answer options:**

| Option | Label |
|--------|-------|
| A | California |
| B | New York |
| C | Texas |
| D | Florida |
| E | Illinois |
| F | Another state (specify at intake) |

**Data field:** `state_of_matter` → enum: `CA | NY | TX | FL | IL | other`

> **⚑ Design decision:** For individuals, state is **REQUIRED** (not optional). Almost all personal legal matters — family law, real estate, criminal, employment — require state-specific counsel. This is the opposite of many startup matters.

---

### Question IF6 — Language

> **OPTIONAL | Multi-select**

**Question text:**
> Are non-English language capabilities important?

**Sub-text:**
> Select all that apply.

**Answer options:**

| Option | Label |
|--------|-------|
| A | No — English only |
| B | Spanish |
| C | Mandarin |
| D | Hindi |
| E | Portuguese |
| F | Korean |
| G | Other |

**Data field:** `language_requirement` → enum (multi-select): `english | spanish | mandarin | hindi | portuguese | korean | other`

---

---

# PART 2C — SMALL BUSINESS TRACK

**Trigger:** User selected "Small business" in Q1.

**Flow structure:**
1. Questions B1–B3 (universal small business context — shown to all small business users)
2. Questions B4a–B4n (category sub-questions — shown based on Q2 answer)
3. Questions BF1–BF8 (universal small business closing — shown to all small business users)

---

## B1–B3: Small Business Universal Context Questions

Shown to every user in the small business track, regardless of legal category.

---

### Question B1 — Years in Operation

> **REQUIRED | Single-select**

**Question text:**
> How long has your business been operating?

**Sub-text:**
> This shapes which legal issues are most likely relevant and how complex they are.

**Answer options:**

| Option | Label |
|--------|-------|
| A | We're in the process of starting — not yet open |
| B | Less than 1 year |
| C | 1–3 years |
| D | 4–10 years |
| E | More than 10 years |

**Data field:** `years_in_operation` → enum: `pre_launch | under_1yr | 1_3yr | 4_10yr | over_10yr`

> **⚑ Design decision:** For small businesses, the equivalent of the startup "stage" question is years in operation. It's the most reliable proxy for legal complexity, and the most intuitive for this audience.

---

### Question B2 — Employee Count

> **REQUIRED | Single-select**

**Question text:**
> How many people work in your business (including yourself)?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Just me — solo operator |
| B | 2–5 (including myself) |
| C | 6–20 |
| D | 21–50 |
| E | 51–100 |

**Data field:** `employee_count_range` → enum: `solo | 2_5 | 6_20 | 21_50 | 51_100`

---

### Question B3 — Industry

> **REQUIRED | Single-select**

**Question text:**
> What industry is your business in?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Retail / E-commerce |
| B | Food & Beverage / Restaurant |
| C | Professional Services (consulting, accounting, marketing, etc.) |
| D | Healthcare / Medical |
| E | Construction / Trades / Real Estate |
| F | Technology |
| G | Manufacturing / Distribution |
| H | Hospitality / Events |
| I | Creative / Media / Agency |
| J | Other |

**Data field:** `industry_vertical` → enum: `retail_ecomm | food_bev | professional_svcs | healthcare | construction_re | technology | manufacturing | hospitality | creative | other`

---

## B4+: Legal Category Sub-Questions (Small Business)

Branch based on Q2 answer. Only the relevant sub-section appears.

---

### If Q2 = A (Business Formation & Restructuring)

---

#### Question B4a

> **REQUIRED | Single-select**

**Question text:**
> What is the specific formation or restructuring matter?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Forming a new entity from scratch |
| B | Converting from one entity type to another (e.g., sole prop to LLC) |
| C | Adding or removing a partner/owner |
| D | Drafting or updating an operating agreement |
| E | Buy-sell agreement between owners |
| F | Business succession or ownership transition planning |
| G | Dissolving or closing the business |

---

#### Question B4b

> **REQUIRED | Single-select**

**Question text:**
> How is the business currently structured?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Sole proprietorship |
| B | LLC |
| C | S-Corp |
| D | C-Corp |
| E | Partnership |
| F | Not yet formed / no formal entity |

**Data field:** `entity_type` → enum: `sole_prop | llc | s_corp | c_corp | partnership | not_formed`

---

### If Q2 = B (Commercial Contracts — Small Business)

---

#### Question B4c

> **REQUIRED | Single-select**

**Question text:**
> What type of contract do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Client or customer service agreement |
| B | Vendor or supplier contract |
| C | Independent contractor agreement |
| D | Non-disclosure agreement (NDA) |
| E | Non-compete or non-solicitation agreement |
| F | Commercial lease |
| G | Distribution or reseller agreement |
| H | Website terms of service and privacy policy |
| I | Contract dispute or breach |

---

#### Question B4d

> **REQUIRED | Single-select**

**Question text:**
> Are you the drafting party or reviewing a contract presented to you?

**Answer options:**

| Option | Label |
|--------|-------|
| A | We are drafting the contract |
| B | We are reviewing a contract the other side provided |
| C | Mutual negotiation |
| D | Dealing with a breach or dispute |

---

### If Q2 = C (Employment Law — Small Business)

---

#### Question B4e

> **REQUIRED | Single-select**

**Question text:**
> What employment law matter do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Hiring — offer letters or employment agreements |
| B | Employee vs. contractor classification |
| C | Employee handbook drafting or review |
| D | Wage and hour compliance (overtime, minimum wage) |
| E | Termination — need to lay off or fire an employee |
| F | Discrimination or harassment claim against the business |
| G | Non-compete enforcement or defense |
| H | Workplace investigation |
| I | Severance agreements |

---

### If Q2 = D (Intellectual Property — Small Business)

---

#### Question B4f

> **REQUIRED | Single-select**

**Question text:**
> What type of IP matter does your business need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Trademark registration for our brand name or logo |
| B | Copyright for creative assets (website, content, products) |
| C | Trade secret protection and NDAs |
| D | Licensing our IP to others |
| E | IP infringement — someone is copying us |
| F | IP infringement — we've been accused of infringement |

---

### If Q2 = E (Business Disputes & Litigation)

---

#### Question B4g

> **REQUIRED | Single-select**

**Question text:**
> What type of business dispute are you navigating?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Contract breach — a client, vendor, or partner didn't perform |
| B | Partnership or ownership dispute |
| C | Customer dispute or complaint |
| D | Debt collection — collecting what we are owed |
| E | Non-compete enforcement or defense |
| F | Lawsuit filed against the business |
| G | Regulatory or government action |

---

#### Question B4h

> **REQUIRED | Single-select**

**Question text:**
> Is this matter in active litigation, or are you trying to resolve it before it gets there?

**Answer options:**

| Option | Label |
|--------|-------|
| A | A lawsuit has already been filed |
| B | Pre-litigation — trying to resolve before it escalates |
| C | Demand letter received or sent |
| D | Not sure of the stage |

**Data field:** `litigation_stage` → enum: `filed | pre_litigation | demand_letter | unsure | na`

---

### If Q2 = F (Real Estate & Commercial Leases)

---

#### Question B4i

> **REQUIRED | Single-select**

**Question text:**
> What commercial real estate matter do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Reviewing or negotiating a new commercial lease |
| B | Lease renewal or amendment |
| C | Landlord dispute or lease breach |
| D | Purchasing commercial property |
| E | Zoning or permitting issue |
| F | Tenant build-out or construction dispute |

---

### If Q2 = G (Regulatory & Licensing)

---

#### Question B4j

> **REQUIRED | Single-select**

**Question text:**
> What regulatory or licensing matter does your business face?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Obtaining initial business licenses or permits |
| B | Industry-specific regulatory compliance (food, health, construction, etc.) |
| C | Alcohol or liquor licensing |
| D | Environmental compliance |
| E | Government investigation or enforcement action |
| F | Foreign registration in a new state |

---

### If Q2 = H (Tax & Financial — Small Business)

---

#### Question B4k

> **REQUIRED | Single-select**

**Question text:**
> What tax or financial legal issue do you need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | IRS audit or dispute |
| B | Payroll tax issues |
| C | Sales tax compliance |
| D | Business structuring for tax efficiency |
| E | Tax debt resolution |
| F | Estate or succession tax planning for business owners |

---

### If Q2 = I (M&A / Buying or Selling a Business)

---

#### Question B4l

> **REQUIRED | Single-select**

**Question text:**
> What type of transaction are you involved in?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Selling my business |
| B | Buying another business |
| C | Partner or co-owner buyout |
| D | Merging with another business |
| E | Business succession — transferring to family or employees |
| F | Valuation support before a sale |

---

#### Question B4m

> **REQUIRED | Single-select**

**Question text:**
> What is the approximate value of the business being bought or sold?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Under $500K |
| B | $500K – $2M |
| C | $2M – $10M |
| D | Over $10M |
| E | Not yet determined |

**Data field:** `transaction_size_range` → enum: `under_500k | 500k_2m | 2m_10m | over_10m | tbd | na`

---

### If Q2 = J (Data Privacy & Cybersecurity)

---

#### Question B4n

> **REQUIRED | Single-select**

**Question text:**
> What data privacy or cybersecurity matter does your business need help with?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Privacy policy and terms of service drafting |
| B | CCPA or GDPR compliance assessment |
| C | Vendor data processing agreements |
| D | Data breach response and notification |
| E | Employee data and HR privacy compliance |

---

## B-FINAL: Small Business Universal Closing Questions

These 8 questions appear at the end of every small business intake, regardless of legal category.

---

### Question BF1 — Firm Type

> **REQUIRED | Single-select**

**Question text:**
> What type of law firm are you looking for?

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Large full-service firm with broad resources | |
| B | Boutique firm — smaller, specialist, direct partner access | |
| C | Solo practitioner — one attorney for everything | Most cost-efficient for defined matters |
| D | No preference — match me on fit | |

**Data field:** `firm_type_preference` → enum: `large | boutique | solo | no_preference`

---

### Question BF2 — Billing Preference

> **REQUIRED | Single-select**

**Question text:**
> How do you prefer to pay for legal services?

**Answer options:**

| Option | Label | Note shown to user |
|--------|-------|--------------------|
| A | Flat fee — fixed price for a specific project | |
| B | Hourly billing | |
| C | Retainer — monthly fee for ongoing access | Good for businesses with regular legal needs |
| D | Not sure — I'd like guidance on what's appropriate | |

**Data field:** `billing_preference` → enum: `flat_fee | hourly | retainer | unsure`

---

### Question BF3 — Budget

> **REQUIRED | Single-select**

**Question text:**
> What is your approximate budget for this matter?

**Sub-text:**
> For ongoing retainer relationships, estimate your monthly ceiling.

**Answer options:**

| Option | Label |
|--------|-------|
| A | Under $2,500 |
| B | $2,500 – $10,000 |
| C | $10,000 – $30,000 |
| D | $30,000 – $75,000 |
| E | Over $75,000 |
| F | Not sure — I need help estimating |

**Data field:** `budget_range` → enum: `under_2500 | 2500_10k | 10k_30k | 30k_75k | over_75k | unsure`

---

### Question BF4 — Engagement Type

> **REQUIRED | Single-select**

**Question text:**
> Is this a one-time project or the start of an ongoing relationship?

**Answer options:**

| Option | Label |
|--------|-------|
| A | One-time — defined project with a clear end |
| B | Ongoing — I expect to need regular legal counsel |
| C | Not sure yet |

**Data field:** `engagement_type` → enum: `one_time | ongoing | unsure`

---

### Question BF5 — Timeline

> **REQUIRED | Single-select**

**Question text:**
> How soon do you need to get started?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Urgent — this week |
| B | Soon — within 2 weeks |
| C | Within a month |
| D | No rush — planning ahead |

**Data field:** `urgency` → enum: `this_week | within_2_weeks | within_month | planning_ahead`

---

### Question BF6 — Prior Counsel

> **REQUIRED | Single-select**

**Question text:**
> Does your business currently have or recently had legal counsel?

**Answer options:**

| Option | Label |
|--------|-------|
| A | Yes — we have an ongoing relationship with a law firm |
| B | We have used lawyers in the past but have no current relationship |
| C | No — this is our first time seeking legal counsel for the business |

**Data field:** `has_current_counsel` → enum: `yes_ongoing | yes_prior | no`

---

### Question BF7 — State

> **REQUIRED | Single-select**

**Question text:**
> In which state(s) does your business primarily operate?

**Sub-text:**
> Many business law matters require locally licensed counsel.

**Answer options:**

| Option | Label |
|--------|-------|
| A | California |
| B | New York |
| C | Texas |
| D | Florida |
| E | Illinois |
| F | Another state (specify at intake) |
| G | Multiple states |

**Data field:** `state_requirement` → enum: `CA | NY | TX | FL | IL | other | multi_state`

---

### Question BF8 — Language

> **OPTIONAL | Multi-select**

**Question text:**
> Are non-English language capabilities important?

**Answer options:**

| Option | Label |
|--------|-------|
| A | No — English only |
| B | Spanish |
| C | Mandarin |
| D | Hindi |
| E | Portuguese |
| F | Other |

**Data field:** `language_requirement` → enum (multi-select): `english | spanish | mandarin | hindi | portuguese | other`

---

---

# PART 3 — DATA SCHEMAS & EXPORT STRATEGY

Every response in the intake flow maps to a structured data field. The schemas below define the three track-specific tables. All fields use consistent data types and controlled vocabulary (enum values) — no free-text fields appear in the core matching flow. Open text, if captured, is reserved for an optional "anything else" field at the very end of each flow, outside the matching logic.

> **★ Note:** The Startup schema is the highest-value data asset for external buyers. Fields marked "VC/Accel" in the Notes column are specifically identified as valuable to venture capital firms, accelerators, and incubators.

---

## 3A — Startup Track Data Schema

| Field Name | Data Type | Values / Range | Notes |
|------------|-----------|----------------|-------|
| session_id | UUID | System-generated | Unique per intake session |
| timestamp | Datetime | ISO 8601 | Date/time of intake submission |
| track | Enum | `startup` | Always 'startup' in this table |
| legal_category | Enum | `formation \| ip \| fundraising \| employment \| contracts \| regulatory \| governance \| ma \| dispute` | From Q2 |
| company_stage | Enum | `pre_incorp \| pre_seed \| seed \| series_a \| series_b_plus \| bootstrapped` | **VC/Accel — highest priority field** |
| industry_vertical | Enum | `tech_saas \| ai_ml \| fintech \| healthtech \| consumer \| media \| hardware \| climate \| enterprise_b2b \| other` | VC/Accel — cross-referenced with stage |
| is_fundraising_active | Boolean | `true \| false` | VC/Accel — derived from S3 A or B |
| fundraising_timeline | Enum | `active_now \| within_6mo \| not_raising \| bootstrapped` | VC/Accel — from S3 |
| founder_count | Integer | `1 \| 2 \| 3_4 \| 5_plus` | From S4 |
| round_size_range | Enum | `under_500k \| 500k_2m \| 2m_10m \| 10m_30m \| over_30m \| tbd` | VC/Accel — from S5h (fundraising sub-track only) |
| ip_assigned | Enum | `yes \| partial \| no \| unsure` | From S5e (IP sub-track only) |
| fundraising_instrument | Enum | `safe \| convertible_note \| priced_equity \| friends_family \| unsure` | VC/Accel — from S5f |
| employee_count_range | Enum | `none \| 1_5 \| 6_20 \| 21_50 \| 50_plus` | VC/Accel — from S5j (employment sub-track) |
| firm_type_preference | Enum | `large \| boutique \| solo \| no_preference` | From SF1 |
| billing_preference | Enum | `flat_fee \| hourly \| retainer \| equity \| unsure` | From SF2 |
| budget_range | Enum | `under_2500 \| 2500_10k \| 10k_25k \| 25k_75k \| over_75k \| unsure` | From SF3 |
| engagement_type | Enum | `one_time \| ongoing \| unsure` | From SF4 |
| urgency | Enum | `this_week \| within_2_weeks \| within_month \| exploring` | From SF5 |
| prior_counsel | Enum | `yes_ongoing \| yes_prior \| no` | From SF6 |
| state_requirement | Enum | `none \| CA \| NY \| TX \| DE \| other` | From SF7 |
| language_requirement | Enum (multi) | `english \| spanish \| mandarin \| hindi \| portuguese \| korean \| other` | From SF8; multi-select |
| sub_question_json | JSON | Varies by legal_category | Captures all category-specific sub-answers in structured JSON blob |

---

## 3B — Individual Track Data Schema

| Field Name | Data Type | Values / Range | Notes |
|------------|-----------|----------------|-------|
| session_id | UUID | System-generated | Unique per session |
| timestamp | Datetime | ISO 8601 | |
| track | Enum | `individual` | Always 'individual' in this table |
| legal_category | Enum | `family \| estate \| real_estate \| personal_injury \| immigration \| employment \| tax \| criminal \| bankruptcy \| consumer` | From Q2 |
| situation_type | Enum | `active_issue \| upcoming_planned \| proactive \| seeking_advice \| responding_to_action` | From I1 — urgency proxy |
| prior_personal_counsel | Enum | `yes \| no \| unsure` | From I2 |
| contested | Enum | `contested \| uncontested \| unclear \| na` | From I3b (family law only) |
| children_involved | Enum | `yes_at_issue \| yes_not_at_issue \| no \| na` | From I3c (family law only) |
| plaintiff_or_defendant | Enum | `plaintiff \| defendant \| tbd \| na` | From I3i (personal injury only) |
| immigration_status | Enum | `us_citizen \| permanent_resident \| visa_holder \| no_status \| prefer_not \| na` | From I3k (immigration only) |
| still_employed | Enum | `yes \| no \| complicated \| na` | From I3m (employment only) |
| firm_type_preference | Enum | `large \| boutique \| solo \| no_preference` | From IF1 |
| billing_preference | Enum | `flat_fee \| hourly \| contingency \| retainer \| unsure` | From IF2 — contingency added for individuals only |
| budget_range | Enum | `under_1500 \| 1500_5k \| 5k_15k \| 15k_50k \| over_50k \| unsure` | From IF3 |
| urgency | Enum | `this_week \| within_2_weeks \| within_month \| planning_ahead` | From IF4 |
| state_of_matter | Enum | `CA \| NY \| TX \| FL \| IL \| other` | From IF5 — **REQUIRED for individuals** |
| language_requirement | Enum (multi) | `english \| spanish \| mandarin \| hindi \| portuguese \| korean \| other` | From IF6; multi-select |
| sub_question_json | JSON | Varies by legal_category | All category-specific answers in structured JSON |

---

## 3C — Small Business Track Data Schema

| Field Name | Data Type | Values / Range | Notes |
|------------|-----------|----------------|-------|
| session_id | UUID | System-generated | |
| timestamp | Datetime | ISO 8601 | |
| track | Enum | `small_business` | |
| legal_category | Enum | `formation \| contracts \| employment \| ip \| disputes \| real_estate \| regulatory \| tax \| ma \| data_privacy` | From Q2 |
| years_in_operation | Enum | `pre_launch \| under_1yr \| 1_3yr \| 4_10yr \| over_10yr` | From B1 — maturity proxy |
| employee_count_range | Enum | `solo \| 2_5 \| 6_20 \| 21_50 \| 51_100` | From B2 |
| industry_vertical | Enum | `retail_ecomm \| food_bev \| professional_svcs \| healthcare \| construction_re \| technology \| manufacturing \| hospitality \| creative \| other` | From B3 |
| entity_type | Enum | `sole_prop \| llc \| s_corp \| c_corp \| partnership \| not_formed` | From B4b (formation sub-track) |
| transaction_size_range | Enum | `under_500k \| 500k_2m \| 2m_10m \| over_10m \| tbd \| na` | From B4m (M&A sub-track only) |
| litigation_stage | Enum | `filed \| pre_litigation \| demand_letter \| unsure \| na` | From B4h (disputes sub-track only) |
| has_current_counsel | Enum | `yes_ongoing \| yes_prior \| no` | From BF6 |
| firm_type_preference | Enum | `large \| boutique \| solo \| no_preference` | From BF1 |
| billing_preference | Enum | `flat_fee \| hourly \| retainer \| unsure` | From BF2 |
| budget_range | Enum | `under_2500 \| 2500_10k \| 10k_30k \| 30k_75k \| over_75k \| unsure` | From BF3 |
| engagement_type | Enum | `one_time \| ongoing \| unsure` | From BF4 |
| urgency | Enum | `this_week \| within_2_weeks \| within_month \| planning_ahead` | From BF5 |
| state_requirement | Enum | `CA \| NY \| TX \| FL \| IL \| other \| multi_state` | From BF7 |
| language_requirement | Enum (multi) | `english \| spanish \| mandarin \| hindi \| portuguese \| other` | From BF8; multi-select |
| sub_question_json | JSON | Varies by legal_category | Category-specific answers stored as structured JSON |

---

## 3D — Data Buyer Strategy

The intake data LWYRD captures has value beyond attorney matching. The following summarizes which data points are most commercially valuable, by buyer type.

| Buyer Type | What They Want | Most Valuable LWYRD Fields |
|------------|----------------|---------------------------|
| VC Firms | Deal flow signals; early-stage startup demand by stage and vertical | `company_stage`, `industry_vertical`, `is_fundraising_active`, `fundraising_timeline`, `round_size_range`, `founder_count` |
| Accelerators / Incubators | Portfolio legal needs; cohort benchmarking; resource planning | `legal_category`, `company_stage`, `industry_vertical`, `ip_assigned`, `employee_count_range`, `urgency` |
| Legal Tech Platforms | Unmet legal demand; product-market fit for specific tools | `legal_category`, `billing_preference`, `budget_range`, `prior_counsel`, `engagement_type` |
| Law School Clinics / Pro Bono | Underserved segments; matter type distribution | `budget_range` (under $2,500), `track`, `legal_category`, `state_requirement` |
| Insurance / Fintech | Small business risk profiling; legal spend patterns | `industry_vertical`, `years_in_operation`, `employee_count_range`, `legal_category`, `litigation_stage` |

> **★ Important:** All data shared with third parties should be anonymized and aggregated. Individual intake sessions should never be sold individually — only as cohort-level or trend-level reporting. This protects users and is essential to maintaining trust in the platform.

---

## 3E — Question Count & Flow Summary

| | Startup | Individual | Small Business |
|---|---------|------------|----------------|
| Universal Entry Qs | 2 | 2 | 2 |
| Track Context Qs | 4 (S1–S4) | 2 (I1–I2) | 3 (B1–B3) |
| Legal Category Options | 9 categories | 10 categories | 10 categories |
| Sub-Qs per Category | 2–3 per category | 2–3 per category | 2–3 per category |
| Closing / Universal Qs | 8 (SF1–SF8) | 6 (IF1–IF6) | 8 (BF1–BF8) |
| Total Qs (typical user) | ~12–14 | ~10–12 | ~12–14 |

---

---

# Implementation Notes for Claude Code

The following are critical implementation requirements. These are not style suggestions — they define the correctness of the build.

## Routing & Branching

1. **Q1 always comes first.** No other question, routing logic, or UI element should appear before Q1.
2. **Q2 is track-gated.** The options shown in Q2 are determined entirely by the Q1 answer. Render three separate question instances with different option sets, or use a single component with conditional option arrays. Never show a combined list.
3. **Sub-questions are category-gated.** After Q2, only the sub-questions matching the selected legal category are shown. All other sub-question blocks are hidden. Users in the "Startup + Commercial Contracts" path never see "Startup + IP" questions.
4. **Closing questions are universal per track.** Every startup user sees SF1–SF8 regardless of category. Every individual user sees IF1–IF6. Every small business user sees BF1–BF8.
5. **Consumer Protection (Individual Q2 = J) has no sub-questions.** Route directly from Q2 to IF1 for this category.

## Input Types

- **Single-select:** Radio button or button-group; one choice required before advancing
- **Multi-select:** Checkboxes; zero or more choices allowed; "Select all that apply" must be visible in the sub-text

## Progress Bar

- Display as "Question X of Y — Z% complete"
- Y (total questions) should be calculated dynamically based on track and category selected, since different paths have different lengths
- Do not show a fixed "10 of 10" — calculate the actual expected total for the user's specific path

## Data Persistence

- All answers must be stored in session state throughout the flow
- On the Review screen, display every question and its selected answer(s)
- On submission, write one record to the appropriate track table (startup, individual, or small_business)
- Track-specific sub-question answers should be serialized as a JSON blob in the `sub_question_json` field
- Fields that are not applicable for a given track (e.g., `ip_assigned` for a user who selected Commercial Contracts, not IP) should be stored as `null` or omitted — not as empty string

## State Management

- If a user changes their Q1 answer after already answering Q2 or later questions, **clear all downstream answers** and restart from Q2 with the correct option set
- If a user changes their Q2 answer after already completing sub-questions, **clear all sub-question answers** and show the correct new sub-question set
- Back navigation must restore previous answers without clearing them (only forward changes trigger clears)

## Existing Site Integration

- The category label pill (currently visible in the flow, e.g., "Contract Law") should display the selected Q2 answer label once Q2 is answered
- The existing "Tell us about your needs" header and "Your answers help us find the most relevant firms for you. There are no right or wrong answers." sub-header should be retained on every question screen
- The existing Review screen and Matches screen UI can be retained — only the question content and branching logic change

---

*End of Specification — LWYRD Intake Flow v2.0*
