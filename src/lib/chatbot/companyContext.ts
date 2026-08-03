// Curated, visitor-safe subset of the internal LWYRD master context doc.
// Anything NOT in this file (founder emails, intern roster, YC application
// content, the agentic-infra plan, prior-entity figures, named university/
// firm partners, contingency percentages) is intentionally excluded: the
// chatbot's strongest guardrail against leaking that info is that it never
// sees it in the first place. Before adding anything here, ask: would this
// be fine to say to a stranger, including one trying to prompt-inject past
// the guardrails? If not, it doesn't belong in this file.
export const COMPANY_CONTEXT = `
# About LWYRD (background, for richer answers)

LWYRD's mission is demystifying specialized legal services. Finding the right lawyer is broken
today because directories and referrals don't capture the signals that actually determine whether
a firm is a good fit: client stage, matter type, budget, timeline, jurisdiction, and firm-size
preference. LWYRD treats this as an information problem, not a search problem: a structured intake
collects those signals up front, so matching is based on real fit rather than who paid for
placement or who happened to be recommended.

LWYRD was founded by a small team who had already spent time helping small businesses and
community organizations access legal resources they didn't know they were entitled to, and who
then went through a frustrating, disjointed search for a lawyer themselves when forming the
company. That firsthand experience, on both sides, is why LWYRD exists.

## How LWYRD is different from the alternatives

- Directories (the Avvo/Martindale-Hubbell model) are ranked lists sorted by who paid for
  placement, with no intake and no accountability for whether the result is actually a fit.
- Document and subscription platforms (the LegalZoom model) are fine for simple, templated
  matters, but hand you a generic list the moment a matter needs a real specialist.
- Lead-blasting matching services send one submitted case to every paying attorney in the area and
  let firms compete to respond fastest, with no budget qualification and no distinction between,
  say, a startup and a small business. That produces cold-calling and mismatched leads, and it's
  exactly the pattern LWYRD avoids: no firm contacts a client until the client chooses to reach
  out, and matching is based on structured fit signals, not who replies first.

## How firms are chosen (expanded)

Beyond the five Assessment dimensions already described, the underlying criteria include: active
bar status, no disciplinary history in a defined recent window, a minimum threshold of
practice-area experience, professional liability insurance, verified client references, written
engagement agreements, conflicts-of-interest procedures, a dedicated client point of contact, a
48-hour response commitment, upfront fee disclosure, itemized billing, and secure document
handling. LWYRD targets boutique and specialized firms with real depth in their practice area, not
generalist large firms.

## What intake covers, beyond track and category

After track and category, intake asks a set of closing questions that shape the match: firm type
preference (a large firm may route a client to a junior associate, while a boutique or solo
practice means talking directly to the person who runs the show), billing structure preference,
budget, engagement type, timeline, prior counsel experience, state requirements, and language
needs. It's fine to mention these exist if a visitor asks what intake will cover, but the chatbot
itself only needs track and category confirmed before handing off, per the guardrails above.

## For law firms considering joining

Firms don't pay to join and don't pay for placement. The two complaints firms most often have
about lead-generation platforms are budget mismatch (leads they can't serve profitably) and
specialty or jurisdiction mismatch (leads outside their practice area or state). LWYRD's structured
intake exists specifically to prevent both, because qualification happens before any introduction
is made. Firms are only introduced to clients who already fit their practice area, budget range,
and jurisdiction.
`.trim();
