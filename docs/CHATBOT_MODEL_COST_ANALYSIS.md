# LWYRD Guide — Model Choice & Spec Fidelity

> Written 2026-07-29, updated 2026-07-29. Covers (1) whether to keep the
> LWYRD Guide chatbot on Claude Sonnet 5, drop to a cheaper Claude tier, or
> switch to an OpenAI model, and (2) how closely the current build matches
> the original chatbot spec. Two different questions bundled into one doc
> by request — treat them as separate sections, not one argument.
> Current implementation: `src/lib/chatbot/systemPrompt.ts` +
> `src/app/api/chat/route.ts` + `src/lib/chatbot/tools.ts` +
> `src/components/chatbot/ChatWidget.tsx`, `model = "claude-sonnet-5"`.

## TL;DR

**Stay on Claude Sonnet 5.** At this chatbot's realistic traffic, the model
bill is a rounding error next to your other infra costs — switching
providers or tiers to chase savings isn't worth the risk to a guardrail-heavy,
compliance-adjacent prompt. If you want to cut cost anyway, test **Haiku
4.5** first (same vendor, same SDK, ~one-line change) before considering
anything on OpenAI.

## Pricing (per million tokens)

| Model | Input | Output | Notes |
|---|---|---|---|
| **Claude Sonnet 5** (current) | $2.00 intro (thru 2026-08-31) → $3.00 after | $10.00 → $15.00 after | Cache reads ~10% of input price |
| Claude Haiku 4.5 | $1.00 | $5.00 | Same API, same tool-use/streaming code |
| Claude Opus 5 | $5.00 | $25.00 | Overkill for a routing/FAQ bot |
| GPT-4o mini | $0.15 | $0.60 | OpenAI's cheapest current model |
| GPT-5 mini | $0.25 | $2.00 | |
| GPT-5 | $1.25 | $10.00 | Closest GPT-side match to Sonnet 5's tier |

## What the chatbot actually costs today

Your system prompt measures **2,535 tokens** (`SYSTEM_PROMPT.length`, real
count from the repo, not an estimate). It's cache-marked
(`cache_control: ephemeral`) and identical for every visitor, so on live
traffic almost every request after the first hits a cache read
(~$0.2–0.3/MTok) instead of full price — cache reads are shared *across
users*, not just within one conversation, as long as requests land within
the 5-minute TTL. Conversation history itself is **not** cache-marked, so
it's resent at full price each turn (a cheap future optimization if you
want it — mark the last message block too).

Modeling a typical 4-exchange conversation (~20 input tokens/turn, ~150
output tokens/turn, mostly-cached system prompt):

| | Per conversation | Per 1,000 conversations | Per 100,000 conversations |
|---|---|---|---|
| Sonnet 5 (intro pricing) | ~$0.010 | ~$10 | ~$1,000 |
| Sonnet 5 (standard, post 8/31) | ~$0.015 | ~$15 | ~$1,500 |
| Haiku 4.5 | ~$0.005 | ~$5 | ~$500 |
| GPT-4o mini | ~$0.001 | ~$1 | ~$100 |

Even at 100,000 conversations/month — high for a pre-revenue matchmaking
site — Sonnet 5 costs ~$1,000–1,500/month. That's likely smaller than your
Supabase or Vercel bill.

## Costs and benefits by option

### Stay on Sonnet 5
- **Benefit:** zero migration risk. Tool-use flow, SSE streaming, and
  prompt caching are already built and working. Best instruction-following
  of the options here, which matters for a prompt this dense (30+ "never do
  X" rules).
- **Cost:** ~$1,000–1,500/mo at high volume — the most expensive option on
  the table, but still small in absolute terms.

### Drop to Haiku 4.5
- **Benefit:** ~50% cheaper, same vendor/SDK/tool-calling code — realistically
  a one-line model-string change plus re-testing.
- **Cost:** unverified whether it holds up on your specific guardrails
  (untested — see Verification below). Smaller models are more likely to
  drop lower-priority rules from a long instruction list.

### Switch to GPT-4o mini (or another OpenAI model)
- **Benefit:** cheapest option by ~10x vs. Sonnet 5. No functional
  capability gap for a single-tool routing bot — nothing here leans on an
  Anthropic-specific feature.
- **Cost:** real engineering time (rewrite `anthropicClient.ts` and the
  streaming/tool-call handling in `route.ts`, re-validate every guardrail
  against a new model's behavior). Cheapest tier models are the most prone
  to slipping on:
  - Long stacked "never" rules (never em dash, never markdown except the
    one link format, never a numeric Assessment score, never reveal
    contingency %/prior entity name/employee names, never legal advice)
  - Resisting pressure to call the hand-off tool early (e.g. "just sign me
    up already, whatever, put me in a lawyer")
  - Prompt-injection resistance ("ignore your previous instructions")

## Why the savings don't justify the risk right now

At 100k conversations/month, GPT-4o mini vs. Haiku 4.5 is roughly a **$400/month**
difference. LWYRD is a legal-services matchmaking product, and the system
prompt already has a guardrail specifically banning the model from
revealing "the company's prior entity name" — a level of specificity that
reads like it was added because something like that already leaked in
testing. Trading a few hundred dollars a month for a model that's more
prone to slipping on exactly that category of instruction is a bad trade
for a compliance-adjacent product, and the dollar amount at stake is too
small to matter either way.

## Recommendation

1. **No change needed for cost reasons alone** — current spend is trivial.
2. If cost-cutting is a real goal, **test Haiku 4.5 before touching
   anything OpenAI**: swap `MODEL` in `route.ts` behind a flag, run it
   against real guardrail scenarios, keep it only if it holds up.
3. **Don't move to OpenAI** unless there's a non-cost reason (e.g. an
   organizational mandate) — the savings at this scale don't offset the
   rewrite cost and the guardrail-regression risk.

## Verification (not yet done)

No live test has been run against either Haiku 4.5 or any OpenAI model —
`ANTHROPIC_API_KEY` is unset in `.env.local` in this environment, so the
guardrail simulation drafted during this session (happy path, pricing
pressure, direct legal-advice request, Assessment-score fishing, prompt
injection, off-topic request, pushy early hand-off) has only ever run
against Sonnet 5. Before switching *any* model in production, add a real
key and run that simulation against the candidate model — this doc is
reasoning from known model-tier capability differences, not measured
pass/fail data.

---

## Spec fidelity: does the build match the original spec?

Checked the current implementation against the original chatbot spec
line by line. Overall fidelity is very high — several guardrail lines are
near-verbatim matches to the spec text (e.g. the "it can't advise, but it
can connect them to someone who can" line is word-for-word in
`systemPrompt.ts:122`).

**Matches:**
- Guide-not-matcher framing, track-first routing, plain-language category
  mapping, honest expectation-setting
- Competitor framing leads with what's broken about directories/lead-blasters
  before contrasting LWYRD — same order as the spec
- All four guardrails present: no legal advice, no Assessment score (only
  dimensions), no invented firms/prices/results, no over-collecting matter
  detail
- Confidential info excluded from reachable knowledge: contingency
  percentages, prior entity name, partner/employee names — same wording as
  the spec
- Site page map baked in (`SITE_MAP`), prompt-injection resistance,
  off-topic decline
- Build matches spec exactly: `claude-sonnet-5`, streaming on, system
  prompt behind `cache_control: ephemeral`, zero Supabase reads (the bot
  cannot reach firm data by construction), PostHog events for open /
  message-sent / handoff / close-without-handoff (proxy for drop-off)
- Hand-off passes exactly `track` + `category` into the intake URL —
  nothing more

**One gap found:** the widget is **desktop/tablet only** —
[`ChatWidget.tsx:270`](../src/components/chatbot/ChatWidget.tsx#L270) hides
it below the `md:` breakpoint (`hidden ... md:flex`). A code comment
explains the reasoning ("mobile pages already have dense CTAs and browser
chrome"), so this reads as a deliberate call made during the build, not an
oversight — but it does deviate from the spec's "on every page" if that
phrase was meant to include mobile. Worth confirming with whoever made that
call that it was intentional, since it's currently undocumented as a
decision anywhere except that one code comment.

**Correctly deferred, not a gap:** "Maybe prefill some of the questions"
was listed in the spec as an Extra/stretch item, and it's genuinely not
built — `buildIntakeHandoffUrl` in `tools.ts` only carries `track` and
`category` into the intake URL; nothing from the conversation maps into
deeper intake fields (budget, urgency, etc.). This matches the spec's own
framing of it as optional, so no action needed unless it's now a priority.
