import { Firm, IntakeAnswers, MatchResult } from "@/types";
import { CATEGORY_SLUG_MAP, US_STATES } from "@/data/intakeV2";

// ── Constants ─────────────────────────────────────────────────────────────────

// Practices governed by state law: a NY-licensed firm cannot represent clients
// in these matters if the legal issue arises in a different state.
const STATE_SPECIFIC_PRACTICES = new Set([
  "family-law",
  "personal-injury",
  "estate-planning",
  "real-estate",
  "criminal-defense",
  "bankruptcy",
  "consumer-protection",
]);

// Employment law is semi-state-specific (Title VII etc. are federal, but wage/hour
// and wrongful termination claims often depend on state law). For non-NY users it's
// a soft penalty, not a hard disqualification.
// Contract law is likewise semi-state-specific: contract formation/breach/interpretation
// is governed by state law (UCC as adopted per-state, state common law), not federal
// law, so an out-of-state firm shouldn't score identically to a firm actually
// licensed where the user is (previously bucketed under FEDERAL_PRACTICES below,
// which let e.g. NY/FL firms outscore in-state firms for a user explicitly asking
// for commercial contracts help in a state with no firms in the database).
// Corporate-formation, fundraising, regulatory-compliance, corporate-governance,
// mergers-acquisitions, and dispute-resolution moved here too — while these
// routinely cross state lines, they're not purely agency-driven like tax/IP/
// immigration, so an out-of-state firm should still take a real penalty against a
// firm actually local to the user, not score identically to one. (Delaware
// preference for the corporate-ish subset of these is still handled separately
// via DELAWARE_FRIENDLY_PRACTICES below, so a DE-filing firm isn't wrongly
// penalized just for not being HQ'd in the user's home state.)
const SEMI_STATE_SPECIFIC_PRACTICES = new Set([
  "employment-law",
  "contract-law",
  "corporate-formation",
  "fundraising",
  "regulatory-compliance",
  "corporate-governance",
  "mergers-acquisitions",
  "dispute-resolution",
]);

// Practices handled through a federal agency/court regardless of where the client
// or firm is located (USPTO, IRS, immigration court) — genuinely state-agnostic,
// unlike the semi-state-specific set above.
const FEDERAL_PRACTICES = new Set([
  "immigration",
  "intellectual-property",
  "tax-law",
]);

// Corporate-ish practices where a Delaware location preference specifically
// signals "handle my DE filings," not "be headquartered near me" — firms
// regularly do this work for out-of-state clients regardless of physical location.
const DELAWARE_FRIENDLY_PRACTICES = new Set([
  "corporate-formation",
  "fundraising",
  "mergers-acquisitions",
  "corporate-governance",
]);

// Maps full state names to abbreviations for HQ location matching
// Derived from the same US_STATES list the intake wizard uses, so every state a
// user can actually select is recognized here too (previously this only covered
// 16 of 51 states/DC — e.g. Alaska wasn't recognized at all, which meant a
// state-specific-practice search from an unrecognized state could never find a
// genuinely eligible firm, even if one existed).
const STATE_ABBRS: Record<string, string> = Object.fromEntries(
  US_STATES.filter((s) => s.value !== "outside_us").map((s) => [s.label, s.value])
);

const ABBR_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBRS).map(([name, abbr]) => [abbr, name])
);

// Sorted longest-name-first so substring matching below checks "West Virginia"
// before "Virginia", and "Washington D.C." before "Washington" — otherwise a user
// preference like "West Virginia" would incorrectly match "Virginia" first, since
// it's a substring of it.
const STATE_ABBRS_BY_LENGTH = Object.entries(STATE_ABBRS).sort((a, b) => b[0].length - a[0].length);

// Firms aren't all New York-based (location strings like "Miami, FL", "London, UK",
// "Washington, DC" exist in the dataset) — derive a firm's actual state/region label
// from its HQ location instead of assuming New York.
function getFirmStateLabel(firm: Firm): string {
  const suffix = firm.location.split(",").pop()?.trim();
  if (!suffix) return firm.location;
  return ABBR_TO_STATE[suffix] ?? suffix;
}

const INDUSTRY_MAP: Record<string, string> = {
  "Technology / Software": "tech",
  "Financial Services / FinTech": "fintech",
  "Healthcare / Life Sciences": "healthcare",
  "Real Estate": "real-estate",
  "Retail / Consumer": "consumer",
  "Manufacturing": "manufacturing",
  "Media / Entertainment": "media",
};

const STAGE_MAP: Record<string, string> = {
  "Individual / Personal matter": "individual",
  "Pre-Seed / Idea stage": "pre-seed",
  "Seed / Early startup": "seed",
  "Series A / Growing startup": "series-a",
  "Growth / Scaling company": "growth",
  "Enterprise / Established company": "enterprise",
};

// Linear stage progression, used to compute a numeric distance between the
// user's stage and whatever stage(s) a firm serves, instead of a fixed
// exact/adjacent/other tier system.
const STAGE_ORDER = ["pre-seed", "seed", "series-a", "growth", "enterprise"];

const RESPONSE_PRIORITY: Record<string, number> = {
  "same-day": 3, "24h": 2, "48h": 1, "72h": 0,
};

const TIMELINE_URGENCY: Record<string, number> = {
  "As soon as possible / This week": 3,
  "Within 1–2 weeks": 2,
  "Within a month": 1,
  "No specific timeline, exploring options": 0,
};

// ── Hard filters ──────────────────────────────────────────────────────────────

/**
 * Returns true if the firm should be EXCLUDED from results entirely.
 * Hard filters represent cases where the firm genuinely cannot serve the user.
 */
function isHardDisqualified(
  categorySlug: string,
  answers: IntakeAnswers,
  firm: Firm
): { disqualified: boolean; reason?: string } {
  const statePref = answers["location-preference"] as string | undefined;
  const budget = (answers["budget-monthly"] as number) ?? 0;

  // ── 1. Location: state-specific law ──────────────────────────────────────
  // Firms are only licensed to practice state-specific law in their own HQ state.
  // If the user needs legal services in a different state for a practice area
  // governed by state law, a firm whose HQ isn't in that state cannot represent them.
  if (statePref && !statePref.includes("No preference") && STATE_SPECIFIC_PRACTICES.has(categorySlug)) {
    // Check if the firm's HQ is in the user's state, if so it can still serve.
    let firmIsInUserState = false;
    for (const [stateName, abbr] of STATE_ABBRS_BY_LENGTH) {
      if (statePref.includes(stateName)) {
        if (firm.location.includes(abbr) || firm.location.includes(stateName)) {
          firmIsInUserState = true;
        }
        break;
      }
    }
    if (!firmIsInUserState) {
      return {
        disqualified: true,
        reason: `This firm is licensed in ${getFirmStateLabel(firm)} and cannot handle ${categorySlug.replace(/-/g, " ")} matters in your state.`,
      };
    }
  }

  // ── 2. Budget: extreme mismatch ───────────────────────────────────────────
  // If the user's stated budget is less than 28% of the firm's minimum retainer,
  // they simply cannot engage this firm.
  const firmMin = firm.budgetRange.min;
  const isContingency = firmMin === 0;
  if (!isContingency && budget > 0 && firmMin > 0) {
    if (budget < firmMin * 0.28) {
      return {
        disqualified: true,
        reason: `Your budget is well below this firm's minimum engagement.`,
      };
    }
  }

  // ── 3. Stage: extreme mismatch (startup track only) ───────────────────────
  const rawStage = answers["company-stage"] as string;
  const stage = STAGE_MAP[rawStage];
  if (stage && stage !== "individual" && firm.companyStages.length > 0) {
    // If the user is pre-seed/seed and the firm only handles growth/enterprise, exclude.
    const earlyStages = new Set(["pre-seed", "seed"]);
    const lateStages = new Set(["growth", "enterprise"]);
    const userIsEarly = earlyStages.has(stage);
    const userIsLate = lateStages.has(stage);
    const firmServesSomeEarly = firm.companyStages.some((s) => earlyStages.has(s) || s === "series-a");
    const firmServesSomeLate = firm.companyStages.some((s) => lateStages.has(s) || s === "series-a");

    if (userIsEarly && !firmServesSomeEarly) {
      return {
        disqualified: true,
        reason: "This firm focuses on later-stage companies and does not typically work with early-stage startups.",
      };
    }
    if (userIsLate && !firmServesSomeLate) {
      return {
        disqualified: true,
        reason: "This firm focuses on early-stage companies and may not have the depth needed for your stage.",
      };
    }
  }

  return { disqualified: false };
}

// Practice areas where industry vertical is not a meaningful matching signal.
// Personal law matters are not sector-specific, a user's industry has no bearing
// on a family law or estate planning firm's ability to serve them.
const INDUSTRY_IRRELEVANT_PRACTICES = new Set([
  "family-law", "estate-planning", "personal-injury", "criminal-defense",
  "bankruptcy", "consumer-protection", "immigration", "real-estate",
]);

// ── Scoring criteria ──────────────────────────────────────────────────────────
// Normalised score: totalPts / maxPts × 100
// Signals marked * are excluded (pts=0, max=0) when the user expressed no preference,
// so they only affect ranking when they actually differentiate between firms.
//   Budget fit:           24 pts , Can the user actually afford this firm?
//   Industry fit:         18 pts , Does the firm specialize in the user's sector?
//   Stage fit:            14 pts , Right experience for this company stage? (* excluded for non-startup)
//   Firm size preference: 12 pts , Matches what the user asked for?
//   Location / state:      6 pts , Remaining soft location signal (after hard filter)
//   Billing model:         6 pts , Matches how the user wants to pay? (* excluded if no preference)
//   Quality (LWYRD):      10 pts , Squared ratio for top-end amplification
//   Language:              5 pts , Can the firm serve in the user's language? (* excluded if English-only)
//   Timeline / urgency:    4 pts , Can they respond fast enough? (* excluded if no urgency)
// ─────────────────────────────────────────────────────────────────────────────

function scoreBudget(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 24;
  const budget = (answers["budget-monthly"] as number) ?? 0;
  const { min, max } = firm.budgetRange;

  // No minimum, contingency or open-ended pricing; budget doesn't penalise
  if (min === 0) {
    return { pts: MAX, max: MAX, reason: "Works on contingency, no upfront cost" };
  }

  if (budget === 0) {
    // No budget stated, neutral, give 65% so it doesn't dominate the score
    return { pts: MAX * 0.65, max: MAX };
  }

  if (budget >= min && budget <= max) {
    return { pts: MAX, max: MAX, reason: `Within your $${(budget / 1000).toFixed(0)}k/month budget` };
  }

  if (budget > max) {
    // Client has more budget than ceiling, still a fine match. Scales down
    // continuously the further over the ceiling they are, floor at 65%.
    const overRatio = budget / max;
    return { pts: MAX * Math.max(0.65, 0.95 - (overRatio - 1) * 0.30), max: MAX };
  }

  // budget < min (but above the hard-filter threshold of 28% of min).
  // Continuous linear scale from 20% (right at the hard-filter edge) to 95%
  // (just under min) instead of snapping to 3 fixed tiers.
  const ratio = budget / min; // 0.28 – 0.99
  return { pts: MAX * (0.20 + ((ratio - 0.28) / (1 - 0.28)) * 0.75), max: MAX };
}

// Pulled out of scoreQuality so matchFirms can compute every eligible firm's ratio
// up front (to find the pool's min/max) before scoring any single firm.
function computeQualityRatio(firm: Firm): number {
  if (firm.assessment.length > 0) {
    const passed = firm.assessment.filter((a) => a.passed).length;
    const assessRatio = passed / firm.assessment.length;

    // overall_score of exactly 0 on an assessed firm means the score hasn't been
    // computed yet, not that the firm scored zero — every firm we've seen with
    // overall_score=0 actually passed its full assessment. Treating 0 as a real
    // score would wrongly tank an already-vetted firm. Use the same neutral 65%
    // placeholder this file already uses elsewhere for "no data" cases, instead
    // of letting a missing score read as the worst possible one.
    const effectiveOverallScore = firm.overallScore === 0 ? 65 : firm.overallScore;

    // Blend assessment pass rate (30%) with overallScore (70%). Most firms currently
    // pass 100% of assessment items, so pass rate rarely differentiates in practice;
    // weighting overallScore higher keeps quality scores spread out using the signal
    // that actually varies, while assessment failures can still pull a score down.
    return assessRatio * 0.3 + (effectiveOverallScore / 100) * 0.7;
  }
  return firm.overallScore / 100;
}

function scoreQuality(
  firm: Firm,
  pool: { min: number; max: number }
): { pts: number; max: number; rawRatio: number; reason?: string } {
  const MAX = 28; // increased from 10 (then 20) — the strongest signal with genuine per-firm
  // variance (overallScore has 36 distinct values 64-98 in the real data, vs. budget/stage
  // which are heavily duplicated across firms)
  const qualityRatio = computeQualityRatio(firm);

  // Scored relative to the OTHER eligible firms in this specific search, not on an absolute
  // 0-100 scale. Real firm quality clusters tightly (mostly 80-95), so an absolute formula
  // barely separated firms that were actually meaningfully different within a given result
  // set — the best and 5th-best firm for the same search could land within a few points of
  // each other. Stretching the pool's actual min-max range across the full point allocation
  // means the best-in-pool firm always gets full marks and the weakest-in-pool gets ~0,
  // regardless of how tightly or widely the absolute scores happen to cluster.
  const spread = pool.max - pool.min;
  const normalized = spread > 0 ? (qualityRatio - pool.min) / spread : 1;

  // Still squared, but now on the normalized (already pool-relative) ratio — this widens the
  // gap further between the top firms and the mid-pack, on top of the stretch above.
  // Not rounded here — only the final composite score is rounded, so this signal's full
  // precision survives into the total instead of being quantized to 1 of 11 values.
  return { pts: MAX * Math.pow(normalized, 2), max: MAX, rawRatio: qualityRatio };
}

// Rewards firms with a narrower practice-area footprint as more specialized. Always
// active regardless of what the user answered (firm-intrinsic, not preference-based),
// so it helps differentiate firms even in "minimal answers" scenarios where most
// preference-based signals go flat. Real data: 15 distinct values 1-15 practice
// areas, no single value dominating.
function scoreSpecialization(firm: Firm): { pts: number; max: number } {
  const MAX = 12; // increased from 8 — meant to be a clear differentiator, not a nudge
  // Full marks at 1 practice area, floors at 8+ so full-service generalist firms
  // aren't crushed — specialization is a plus, not a requirement.
  const specRatio = Math.max(0.2, 1 - (firm.practiceAreas.length - 1) / 7);
  return { pts: MAX * specRatio, max: MAX };
}

// Rewards firms with a longer track record. Also always active regardless of user
// answers. Real data: founded year ranges 1792-2025 with zero missing values, so
// this is safe to lean on unlike budget/stage's heavily-duplicated data.
function scoreFounded(firm: Firm): { pts: number; max: number } {
  const MAX = 12; // increased from 6 — meant to be a clear differentiator, not a nudge
  const yearsSinceFounding = new Date().getFullYear() - firm.founded;
  // Full marks at 100+ years old, not 30 — a 30-year cap flattened most real firms
  // in the data (e.g. a set of NY estate-planning firms founded 1866-1997 nearly
  // all capped out identically at "30+ years", throwing away 130 years of real
  // spread). 100 years still treats truly historic firms (1866, 1888, 1948) as
  // similarly "very established" while giving the much larger 1970s-2010s cohort
  // real room to differentiate on actual tenure.
  const tenureRatio = 0.15 + 0.85 * Math.min(1, Math.max(0, yearsSinceFounding) / 100);
  return { pts: MAX * tenureRatio, max: MAX };
}

function scoreIndustry(categorySlug: string, answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 18;

  // Industry is not a meaningful signal for personal law, avoid penalising all results
  if (INDUSTRY_IRRELEVANT_PRACTICES.has(categorySlug)) {
    return { pts: MAX, max: MAX };
  }

  const raw = answers["industry"] as string | undefined;
  const industry = raw ? INDUSTRY_MAP[raw] : undefined;

  // Small continuous nudge from how many industries a firm covers, so firms that
  // land in the same categorical tier below still differentiate from each other.
  // Capped well under the smallest gap between tiers (5%) so it can never bump a
  // firm into a higher tier than its actual match quality earned.
  const breadthBonus = MAX * 0.025 * (Math.min(firm.industries.length, 6) / 6);

  if (firm.industries.length === 0) {
    return { pts: MAX * 0.50, max: MAX };
  }

  if (!industry) {
    // User didn't specify an industry, modest neutral, don't reward firms with no industry data equally
    return { pts: MAX * 0.55 + breadthBonus, max: MAX };
  }

  if (firm.industries.includes(industry)) {
    // No reason text here on purpose: this just echoes the industry the user already
    // selected, and since top-ranked firms are the ones that matched it, the phrase
    // ends up identical across nearly every card. firm.strengths highlights carry
    // the differentiating detail instead.
    return { pts: MAX, max: MAX };
  }

  // Near-match adjacencies
  if (industry === "fintech" && (firm.industries.includes("finance") || firm.industries.includes("tech"))) {
    return { pts: MAX * 0.78 + breadthBonus, max: MAX };
  }
  if ((industry === "healthcare" && firm.industries.includes("biotech")) ||
      (industry === "biotech" && firm.industries.includes("healthcare"))) {
    return { pts: MAX * 0.83 + breadthBonus, max: MAX };
  }
  if (industry === "saas" && firm.industries.includes("tech")) {
    return { pts: MAX * 0.78 + breadthBonus, max: MAX };
  }
  if (["saas", "media", "consumer"].includes(industry) && firm.industries.includes("tech")) {
    return { pts: MAX * 0.67 + breadthBonus, max: MAX };
  }
  if (industry === "real-estate" && firm.industries.includes("finance")) {
    return { pts: MAX * 0.55 + breadthBonus, max: MAX };
  }

  // Mismatch, firm doesn't serve this sector
  return { pts: MAX * 0.22 + breadthBonus, max: MAX };
}

function scoreStage(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 14;
  const rawStage = answers["company-stage"] as string;
  const stage = STAGE_MAP[rawStage];

  // Individual/personal track, stage not applicable, exclude from denominator
  if (!stage || stage === "individual") {
    return { pts: 0, max: 0 };
  }

  // Firm serves all stages (empty array = broad scope)
  if (firm.companyStages.length === 0) {
    return { pts: MAX * 0.85, max: MAX };
  }

  const stageIdx = STAGE_ORDER.indexOf(stage);
  const firmStageIndices = firm.companyStages
    .map((s) => STAGE_ORDER.indexOf(s))
    .filter((i) => i !== -1);

  if (stageIdx === -1 || firmStageIndices.length === 0) {
    // Unrecognized stage token, fall back to the old neutral behavior
    return { pts: MAX * 0.60, max: MAX };
  }

  if (firm.companyStages.includes(stage)) {
    // No reason text here on purpose, same rationale as the industry exact-match
    // above: it just echoes the stage the user already selected, so it's near-
    // universal across top-ranked cards instead of differentiating between them.
    return { pts: MAX, max: MAX };
  }

  // Distance (in stage-progression hops) to the closest stage the firm actually
  // serves. Docks continuously with distance instead of snapping between a fixed
  // exact/adjacent/other tier system, so firms with a 1-stage gap score
  // meaningfully higher than firms with a 3-stage gap.
  const minDistance = Math.min(...firmStageIndices.map((i) => Math.abs(i - stageIdx)));
  return { pts: MAX * Math.max(0.12, 1 - minDistance * 0.35), max: MAX };
}

function scoreFirmSize(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 18;
  const pref = answers["seniority-preference"] as string | undefined;

  // Continuous nudge from actual team depth, so firms sharing the same size
  // category still differentiate. Capped well under the smallest tier gap (12%)
  // so it can never bump a firm into a higher tier than its size category earned.
  const depth = Math.min(firm.team.length, 20) / 20; // 0-1, more attorneys = deeper bench
  const leanness = 1 - depth; // 0-1, fewer attorneys = leaner

  if (!pref || pref.includes("No preference")) {
    return { pts: MAX * 0.83, max: MAX }; // Slight discount for no preference expressed
  }

  if (pref.includes("Senior partner only")) {
    // Deeper bench favors this preference, more senior partners likely available
    const bonus = MAX * 0.03 * depth;
    if (firm.size === "large") return { pts: MAX, max: MAX, reason: "Large firm with dedicated senior partners" };
    if (firm.size === "mid-size") return { pts: MAX * 0.75 + bonus, max: MAX };
    return { pts: MAX * 0.50 + bonus, max: MAX };
  }

  if (pref.includes("mix is fine") || pref.includes("Mix is fine")) {
    if (firm.size === "mid-size") return { pts: MAX, max: MAX, reason: "Mid-size firm, strong senior/associate mix" };
    return { pts: MAX * 0.88 + MAX * 0.03 * depth, max: MAX }; // Any size works, deeper bench a mild plus
  }

  if (pref.includes("Cost-efficiency")) {
    // Leaner team favors this preference, less overhead
    const bonus = MAX * 0.03 * leanness;
    // Intake has no mid-size option, mid-size is treated as equivalent to boutique
    if (firm.size === "boutique") return { pts: MAX, max: MAX, reason: "Boutique firm, lean structure, competitive rates" };
    if (firm.size === "mid-size") return { pts: MAX, max: MAX, reason: "Boutique firm, lean structure, competitive rates" };
    return { pts: MAX * 0.33 + bonus, max: MAX }; // Large firm = high overhead
  }

  if (pref.includes("Solo practitioner")) {
    // No solo practitioners in the database. Boutique is the closest structural equivalent;
    // no positive reason label so it doesn't show as a green checkmark on the card.
    const bonus = MAX * 0.03 * leanness;
    if (firm.size === "boutique") return { pts: MAX * 0.85 + bonus, max: MAX };
    if (firm.size === "mid-size") return { pts: MAX * 0.55 + bonus, max: MAX };
    return { pts: MAX * 0.40 + bonus, max: MAX }; // large firm: notable mismatch
  }

  return { pts: MAX * 0.75, max: MAX };
}

function scoreLocation(
  categorySlug: string,
  answers: IntakeAnswers,
  firm: Firm
): { pts: number; max: number; reason?: string; isOutOfState?: boolean } {
  // Raised from 6 — at 6 points, even a 0% out-of-state score barely moved a firm's
  // rank (out of ~150+ total points across all signals). An explicit state
  // preference should carry real weight, not a token nudge.
  const MAX = 18;
  const pref = answers["location-preference"] as string | undefined;

  // No preference: all firms qualify fully, no location-specific reason to show.
  if (!pref || pref.includes("No preference")) {
    return { pts: MAX, max: MAX };
  }

  // Immigration is federal, can serve any state
  if (categorySlug === "immigration") {
    return { pts: MAX, max: MAX, reason: "Immigration law is federal, can represent you in any state" };
  }

  // Delaware: corporate/startup firms regularly handle DE matters
  if (pref.includes("Delaware")) {
    if (FEDERAL_PRACTICES.has(categorySlug) || DELAWARE_FRIENDLY_PRACTICES.has(categorySlug)) {
      return { pts: MAX * 0.92, max: MAX, reason: "Regularly handles Delaware corporate filings" };
    }
    return { pts: MAX * 0.67, max: MAX };
  }

  // Check if the firm's HQ state matches the user's preferred state
  for (const [stateName] of STATE_ABBRS_BY_LENGTH) {
    if (pref.includes(stateName)) {
      const abbr = STATE_ABBRS[stateName];
      if (firm.location.includes(abbr) || firm.location.includes(stateName)) {
        return { pts: MAX, max: MAX, reason: `Headquartered in ${stateName}` };
      }
      break;
    }
  }

  // Federal practice, NYC firm can serve any US client regardless of state
  if (FEDERAL_PRACTICES.has(categorySlug)) {
    return { pts: MAX, max: MAX };
  }

  // Semi-state-specific (employment-law, contract-law, etc.): minimal credit only.
  // Lowered from 0.50, then 0.15 — an out-of-state firm for these practices is a
  // real mismatch, not a near-equivalent. Not a hard exclusion (out-of-state counsel
  // genuinely can still do this work), but scored as close to a mismatch as
  // possible while leaving a token amount so it never fully ties with a true
  // disqualification tier.
  if (SEMI_STATE_SPECIFIC_PRACTICES.has(categorySlug)) {
    return { pts: MAX * 0.05, max: MAX, isOutOfState: true };
  }

  // State-specific but firm HQ didn't match, should already be hard-filtered, but be safe
  return { pts: MAX * 0.17, max: MAX, isOutOfState: true };
}

// Out-of-state firms in semi-state-specific categories no longer just take a hit on
// the location line item (which gets diluted to ~11% of the total score once
// blended with budget/quality/industry/etc.) — this multiplies the firm's WHOLE
// score down, so being out-of-state drags the overall match percentage, not just
// one sub-score among many. Tuned so it's not an automatic wipeout: a firm that
// was already a strong match on everything else (budget/quality/industry) can
// still clear the 50 floor and show up in the low 50s, while an average or weak
// out-of-state match gets pushed under it and excluded.
const OUT_OF_STATE_SCORE_MULTIPLIER = 0.75;

function scoreTimeline(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 4;
  const rawTimeline = answers["timeline"] as string | undefined;
  const urgency = rawTimeline ? (TIMELINE_URGENCY[rawTimeline] ?? 0) : 0;
  const responseLevel = RESPONSE_PRIORITY[firm.responseTime] ?? 0;

  if (urgency === 3) {
    if (responseLevel >= 2) return { pts: MAX, max: MAX, reason: "Available on short notice" };
    if (responseLevel === 1) return { pts: MAX * 0.50, max: MAX };
    return { pts: MAX * 0.25, max: MAX };
  }
  if (urgency === 2) {
    if (responseLevel >= 1) return { pts: MAX, max: MAX };
    return { pts: MAX * 0.75, max: MAX };
  }
  // No urgency expressed, signal doesn't differentiate, exclude from denominator
  return { pts: 0, max: 0 };
}

function scoreBillingModel(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 6;
  const pref = answers["billing-preference"] as string | undefined;

  if (!pref) return { pts: 0, max: 0 };

  if (pref === "Hourly"   && firm.billingModel === "hourly")                                      return { pts: MAX, max: MAX, reason: "Offers hourly billing" };
  if (pref === "Retainer" && (firm.billingModel === "retainer" || firm.billingModel === "hybrid")) return { pts: MAX, max: MAX, reason: "Offers monthly retainer arrangements" };
  if (pref === "Flat-fee" && firm.billingModel === "flat-fee")                                    return { pts: MAX, max: MAX, reason: "Offers flat-fee / fixed-cost arrangements" };
  if (pref === "Hourly"   && firm.billingModel === "hybrid")                                      return { pts: MAX * 0.67, max: MAX };

  return { pts: MAX * 0.33, max: MAX };
}

function scoreLanguage(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 5;
  const langs = answers["languages"] as string[] | undefined;

  if (!langs || langs.length === 0) return { pts: 0, max: 0 };
  const nonEnglish = langs.filter((l) => l !== "No, English only is fine");
  // No non-English needed, signal doesn't differentiate, exclude from denominator
  if (nonEnglish.length === 0) return { pts: 0, max: 0 };

  const firmLangs = firm.languages.map((l) => l.toLowerCase());
  const hasMatch = nonEnglish.some((lang) =>
    firmLangs.some((fl) => fl.includes(lang.toLowerCase()))
  );

  if (hasMatch) return { pts: MAX, max: MAX, reason: `Attorneys fluent in ${nonEnglish.join(", ")}` };
  return { pts: 0, max: MAX };
}

// ── Main matching function ────────────────────────────────────────────────────

export function matchFirms(
  categorySlug: string,
  answers: IntakeAnswers,
  allFirms: Firm[]
): MatchResult[] {
  // Step 1: Hard filter by practice area
  const byPracticeArea = allFirms.filter((f) => f.practiceAreas.includes(categorySlug));
  if (byPracticeArea.length === 0) return [];

  // Step 2: Hard filter by location, budget, and stage
  const eligible = byPracticeArea.filter((firm) => {
    const { disqualified } = isHardDisqualified(categorySlug, answers, firm);
    return !disqualified;
  });

  // Hard filters are intentional disqualifications. If nothing passes, return
  // the single best-scoring firm from the practice-area pool as a partial match.
  if (eligible.length === 0) {
    const fallbackQualityRatios = byPracticeArea.map(computeQualityRatio);
    const fallbackQualityPool = { min: Math.min(...fallbackQualityRatios), max: Math.max(...fallbackQualityRatios) };
    const scored = byPracticeArea.map((firm) => {
      const { reason } = isHardDisqualified(categorySlug, answers, firm);
      const budgetResult   = scoreBudget(answers, firm);
      const qualityResult  = scoreQuality(firm, fallbackQualityPool);
      const specResult     = scoreSpecialization(firm);
      const foundedResult  = scoreFounded(firm);
      const industryResult = scoreIndustry(categorySlug, answers, firm);
      const stageResult    = scoreStage(answers, firm);
      const sizeResult     = scoreFirmSize(answers, firm);
      const locationResult = scoreLocation(categorySlug, answers, firm);
      const timelineResult = scoreTimeline(answers, firm);
      const billingResult  = scoreBillingModel(answers, firm);
      const languageResult = scoreLanguage(answers, firm);
      const totalPts = budgetResult.pts + qualityResult.pts + specResult.pts + foundedResult.pts +
        industryResult.pts + stageResult.pts + sizeResult.pts + locationResult.pts +
        timelineResult.pts + billingResult.pts + languageResult.pts;
      const maxPts = budgetResult.max + qualityResult.max + specResult.max + foundedResult.max +
        industryResult.max + stageResult.max + sizeResult.max + locationResult.max +
        timelineResult.max + billingResult.max + languageResult.max;
      const rawScoreBeforePenalty = maxPts > 0 ? totalPts / maxPts : 0;
      const rawScore = locationResult.isOutOfState
        ? rawScoreBeforePenalty * OUT_OF_STATE_SCORE_MULTIPLIER
        : rawScoreBeforePenalty;
      return { firm, rawScore, reason };
    });
    scored.sort((a, b) => b.rawScore - a.rawScore || b.firm.overallScore - a.firm.overallScore);
    const top = scored[0];
    // Never surface a match under 50%, even as a best-effort fallback — below that
    // it's not a useful suggestion, it's noise.
    if (Math.round(top.rawScore * 100) < 50) return [];
    const partialMatchReasons: string[] = top.reason ? [top.reason] : [];
    return [{
      firm: top.firm,
      score: Math.round(top.rawScore * 100),
      reasons: [],
      firmHighlights: [],
      matchedCriteria: [],
      missedCriteria: [],
      isBestMatch: false,
      isPartialMatch: true,
      partialMatchReasons,
    }];
  }

  // Step 3: Score each firm
  const qualityRatios = eligible.map(computeQualityRatio);
  const qualityPool = { min: Math.min(...qualityRatios), max: Math.max(...qualityRatios) };
  const scored = eligible.map((firm) => {
    const budgetResult    = scoreBudget(answers, firm);
    const qualityResult   = scoreQuality(firm, qualityPool);
    const specResult      = scoreSpecialization(firm);
    const foundedResult   = scoreFounded(firm);
    const industryResult  = scoreIndustry(categorySlug, answers, firm);
    const stageResult     = scoreStage(answers, firm);
    const sizeResult      = scoreFirmSize(answers, firm);
    const locationResult  = scoreLocation(categorySlug, answers, firm);
    const timelineResult  = scoreTimeline(answers, firm);
    const billingResult   = scoreBillingModel(answers, firm);
    const languageResult  = scoreLanguage(answers, firm);

    const totalPts =
      budgetResult.pts +
      qualityResult.pts +
      specResult.pts +
      foundedResult.pts +
      industryResult.pts +
      stageResult.pts +
      sizeResult.pts +
      locationResult.pts +
      timelineResult.pts +
      billingResult.pts +
      languageResult.pts;

    const maxPts =
      budgetResult.max +
      qualityResult.max +
      specResult.max +
      foundedResult.max +
      industryResult.max +
      stageResult.max +
      sizeResult.max +
      locationResult.max +
      timelineResult.max +
      billingResult.max +
      languageResult.max;

    const rawScoreBeforePenalty = maxPts > 0 ? totalPts / maxPts : 0;
    // Out-of-state firms in semi-state-specific categories take a cut on their
    // WHOLE score here, not just the location line item above — otherwise the
    // location penalty gets diluted to a fraction of the total and barely moves
    // the needle once budget/quality/industry/etc. are blended in.
    const rawScore = locationResult.isOutOfState
      ? rawScoreBeforePenalty * OUT_OF_STATE_SCORE_MULTIPLIER
      : rawScoreBeforePenalty;
    const finalScore = Math.round(rawScore * 100);

    // Collect up to 3 reasons from criteria that scored well and have labels. These
    // are generic (budget fit, location, etc.) and safe to show even before a user
    // has paid — they don't reveal which firm this is.
    const reasons: string[] = [
      budgetResult,
      qualityResult,
      industryResult,
      stageResult,
      sizeResult,
      locationResult,
      timelineResult,
      billingResult,
      languageResult,
    ]
      .filter((r) => r.reason && r.pts >= r.max * 0.8)
      .map((r) => r.reason!)
      .slice(0, 3);

    // Separately, up to 2 firm-specific highlights from their curated strengths
    // (rankings, named attorneys, specializations). These are what actually
    // differentiate the top matches from each other, since `reasons` above is
    // templated from the user's own answers and repeats across every card that
    // shares them. Kept as a SEPARATE field (not merged into `reasons`) because
    // this text can identify the firm — callers must exclude it from locked/
    // pre-paywall results (see redactMatchResult in lib/actions/intake.ts).
    // Prefers a strength that mentions the category itself, then fills the rest
    // from the firm's other top-billed strengths.
    const categoryWords = categorySlug.split("-").filter((w) => w.length >= 3 && w !== "law");
    const relevantStrength = firm.strengths.find((s) =>
      categoryWords.some((w) => s.toLowerCase().includes(w))
    );
    const firmHighlights = [relevantStrength, ...firm.strengths]
      .filter((s, i, arr): s is string => !!s && arr.indexOf(s) === i)
      .slice(0, 2);

    // Matched vs missed criteria summary
    const matchedCriteria: string[] = [];
    const missedCriteria: string[] = [];

    const rawStageForCriteria = answers["company-stage"] as string | undefined;
    const stageForCriteria = rawStageForCriteria ? STAGE_MAP[rawStageForCriteria] : undefined;
    if (stageForCriteria && stageForCriteria !== "individual") {
      if (stageResult.pts >= stageResult.max * 0.7) matchedCriteria.push("company-stage");
      else if (stageResult.pts < stageResult.max * 0.4) missedCriteria.push("company-stage");
    }

    if (budgetResult.pts >= budgetResult.max * 0.7) matchedCriteria.push("budget");
    else missedCriteria.push("budget");

    if (industryResult.pts >= industryResult.max * 0.7) matchedCriteria.push("industry");
    else if (industryResult.pts < industryResult.max * 0.4) missedCriteria.push("industry");

    if (locationResult.pts >= locationResult.max * 0.7) matchedCriteria.push("location");
    else missedCriteria.push("location");

    if (timelineResult.pts >= timelineResult.max * 0.7) matchedCriteria.push("timeline");

    // Firm size, only track when a preference was explicitly expressed
    const sizePref = answers["seniority-preference"] as string | undefined;
    if (sizePref && !sizePref.includes("No preference")) {
      if (sizeResult.pts >= sizeResult.max * 0.7) matchedCriteria.push("firm-size");
      else missedCriteria.push("firm-size");
    }

    // Billing, only track when a preference was expressed (max > 0)
    if (billingResult.max > 0) {
      if (billingResult.pts >= billingResult.max * 0.7) matchedCriteria.push("billing");
      else missedCriteria.push("billing");
    }

    // Language, only track when a non-English language was requested (max > 0)
    if (languageResult.max > 0) {
      if (languageResult.pts >= languageResult.max * 0.7) matchedCriteria.push("language");
      else missedCriteria.push("language");
    }

    return { firm, score: finalScore, rawScore, reasons, firmHighlights, matchedCriteria, missedCriteria };
  });

  // Step 4: Sort by raw ratio (before rounding) so tied integer scores are ordered
  // by actual quality rather than arbitrary insertion order.
  scored.sort((a, b) => b.rawScore - a.rawScore || b.firm.overallScore - a.firm.overallScore);

  // Step 5: Never surface a match under 50% — below that it's not a useful
  // suggestion, it's noise. Then cap at 8 results and mark best match (strip
  // rawScore, not part of MatchResult).
  return scored
    .filter((r) => r.score >= 50)
    .slice(0, 8)
    .map(({ rawScore: _raw, ...r }, i) => ({
      ...r,
      isBestMatch: i === 0 && r.score >= 60,
    }));
}

// ── V2 intake answer mapping ──────────────────────────────────────────────────

function mapV2AnswersForMatching(
  v2Answers: Record<string, string | string[] | number>
): IntakeAnswers {
  const result: IntakeAnswers = {};

  // Company stage
  const stageEnumMap: Record<string, string> = {
    pre_incorp: "Pre-Seed / Idea stage",
    pre_seed: "Pre-Seed / Idea stage",
    seed: "Seed / Early startup",
    series_a: "Series A / Growing startup",
    series_b_plus: "Growth / Scaling company",
    bootstrapped: "Enterprise / Established company",
  };
  result["company-stage"] = v2Answers.s1
    ? (stageEnumMap[v2Answers.s1 as string] ?? "")
    : "Individual / Personal matter";

  // Industry
  const startupIndustryMap: Record<string, string> = {
    tech_saas: "Technology / Software", ai_ml: "Technology / Software",
    fintech: "Financial Services / FinTech", healthtech: "Healthcare / Life Sciences",
    consumer: "Retail / Consumer", media: "Media / Entertainment",
    hardware: "Technology / Software", climate: "Technology / Software",
    enterprise_b2b: "Technology / Software", other: "",
  };
  const sbIndustryMap: Record<string, string> = {
    retail_ecomm: "Retail / Consumer", food_bev: "Retail / Consumer",
    professional_svcs: "", healthcare: "Healthcare / Life Sciences",
    construction_re: "Real Estate", technology: "Technology / Software",
    manufacturing: "Manufacturing", hospitality: "Retail / Consumer",
    creative: "Media / Entertainment", other: "",
  };
  if (v2Answers.s2) result["industry"] = startupIndustryMap[v2Answers.s2 as string] ?? "";
  else if (v2Answers.b3) result["industry"] = sbIndustryMap[v2Answers.b3 as string] ?? "";

  // Budget, midpoint of the selected range
  const budgetMidMap: Record<string, number> = {
    under_2500: 1250, "2500_10k": 5000, "10k_25k": 17500, "10k_30k": 20000,
    "25k_75k": 50000, "30k_75k": 50000, over_75k: 100000,
    under_1500: 750, "1500_5k": 3250, "5k_15k": 10000, "15k_50k": 32500,
    over_50k: 75000, unsure: 0,
  };
  const budgetRaw = v2Answers.sf3 ?? v2Answers.if3 ?? v2Answers.bf3;
  if (budgetRaw !== undefined) {
    result["budget-monthly"] = typeof budgetRaw === "number"
      ? budgetRaw
      : (budgetMidMap[budgetRaw as string] ?? 0);
  }

  // Timeline / urgency
  const timelineMap: Record<string, string> = {
    this_week: "As soon as possible / This week",
    within_2_weeks: "Within 1–2 weeks",
    within_month: "Within a month",
    exploring: "No specific timeline, exploring options",
    planning_ahead: "No specific timeline, exploring options",
  };
  const timelineAnswer = (v2Answers.sf5 ?? v2Answers.if4 ?? v2Answers.bf5) as string | undefined;
  if (timelineAnswer) result["timeline"] = timelineMap[timelineAnswer] ?? "";

  // Firm size preference
  const firmTypeMap: Record<string, string> = {
    large: "Senior partner only, I want the most experienced attorney",
    boutique: "Cost-efficiency, I want the most economical option",
    solo: "Solo practitioner, I want a single dedicated attorney",
    no_preference: "No preference",
  };
  const firmTypeAnswer = (v2Answers.sf1 ?? v2Answers.if1 ?? v2Answers.bf1) as string | undefined;
  if (firmTypeAnswer) result["seniority-preference"] = firmTypeMap[firmTypeAnswer] ?? "";

  // State requirement. Non-state sentinel values map to the "no preference" phrase
  // isHardDisqualified/scoreLocation check for; every real 2-letter state/DC code
  // resolves through the same ABBR_TO_STATE table used elsewhere in this file, so
  // every state the intake wizard can produce is recognized here too. (This used to
  // be a hardcoded 11-state map — any other state, e.g. Georgia or Pennsylvania,
  // fell through to the raw 2-letter code, which never matches the full state names
  // isHardDisqualified/scoreLocation search for. That silently hard-disqualified
  // every firm for state-specific practices whenever a user picked one of the other
  // 40 states, collapsing results down to the single partial-match fallback.)
  const NO_PREFERENCE_TOKENS = new Set(["none", "other", "multi_state"]);
  const stateAnswer = (v2Answers.sf7 ?? v2Answers.if5 ?? v2Answers.bf7) as string | undefined;
  if (stateAnswer) {
    if (NO_PREFERENCE_TOKENS.has(stateAnswer)) {
      result["location-preference"] = "No preference, I can work with any qualified firm remotely";
    } else {
      result["location-preference"] = ABBR_TO_STATE[stateAnswer] ?? stateAnswer;
    }
  }

  // Language preference
  const langLabelMap: Record<string, string> = {
    english: "No, English only is fine", spanish: "Spanish",
    mandarin: "Mandarin", hindi: "Hindi", portuguese: "Portuguese",
    korean: "Korean", other: "Other",
  };
  const langAnswer = (v2Answers.sf8 ?? v2Answers.if6 ?? v2Answers.bf8) as string[] | undefined;
  if (langAnswer?.length) {
    result["languages"] = langAnswer.map((l) => langLabelMap[l] ?? l);
  }

  // Billing model preference
  const billingPrefMap: Record<string, string> = {
    hourly: "Hourly", retainer: "Retainer", flat_fee: "Flat-fee", no_preference: "",
  };
  const billingAnswer = (v2Answers.sf2 ?? v2Answers.if2 ?? v2Answers.bf2) as string | undefined;
  if (billingAnswer) result["billing-preference"] = billingPrefMap[billingAnswer] ?? "";

  return result;
}

export function matchFirmsV2(
  track: string,
  category: string,
  v2Answers: Record<string, string | string[] | number>,
  allFirms: Firm[],
  practiceAreaSlug?: string
): MatchResult[] {
  const categorySlug = practiceAreaSlug ?? CATEGORY_SLUG_MAP[track]?.[category] ?? "corporate-formation";
  const mappedAnswers = mapV2AnswersForMatching(v2Answers);
  return matchFirms(categorySlug, mappedAnswers, allFirms);
}
