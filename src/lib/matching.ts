import { Firm, IntakeAnswers, MatchResult } from "@/types";
import { CATEGORY_SLUG_MAP } from "@/data/intakeV2";

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
const SEMI_STATE_SPECIFIC_PRACTICES = new Set(["employment-law"]);

// Practices governed entirely by federal law: firm can advise regardless of state.
const FEDERAL_PRACTICES = new Set([
  "immigration",
  "intellectual-property",
  "corporate-formation",
  "fundraising",
  "contract-law",
  "regulatory-compliance",
  "corporate-governance",
  "mergers-acquisitions",
  "dispute-resolution",
  "tax-law",
]);

// Maps full state names to abbreviations for HQ location matching
const STATE_ABBRS: Record<string, string> = {
  "New York": "NY", "California": "CA", "Texas": "TX", "Florida": "FL",
  "Illinois": "IL", "Massachusetts": "MA", "Colorado": "CO", "Arizona": "AZ",
  "New Jersey": "NJ", "Connecticut": "CT", "Pennsylvania": "PA",
  "Georgia": "GA", "Washington": "WA", "Nevada": "NV", "Virginia": "VA",
  "Delaware": "DE",
};

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

const STAGE_ADJACENCY: Record<string, string[]> = {
  "pre-seed": ["seed"],
  "seed": ["pre-seed", "series-a"],
  "series-a": ["seed", "growth"],
  "growth": ["series-a", "enterprise"],
  "enterprise": ["growth"],
};

const RESPONSE_PRIORITY: Record<string, number> = {
  "same-day": 3, "24h": 2, "48h": 1, "72h": 0,
};

const TIMELINE_URGENCY: Record<string, number> = {
  "As soon as possible / This week": 3,
  "Within 1–2 weeks": 2,
  "Within a month": 1,
  "No specific timeline — exploring options": 0,
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
  // All firms in this database are licensed in New York. If the user needs legal
  // services in a different state for a practice area governed by state law, these
  // firms cannot represent them.
  if (statePref && !statePref.includes("No preference")) {
    const userWantsNY = statePref.includes("New York");

    if (!userWantsNY && STATE_SPECIFIC_PRACTICES.has(categorySlug)) {
      // Check if the firm's HQ is in the user's state — if so it can still serve.
      let firmIsInUserState = false;
      for (const [stateName, abbr] of Object.entries(STATE_ABBRS)) {
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
          reason: `This firm is licensed in New York and cannot handle ${categorySlug.replace(/-/g, " ")} matters in your state.`,
        };
      }
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
// Personal law matters are not sector-specific — a user's industry has no bearing
// on a family law or estate planning firm's ability to serve them.
const INDUSTRY_IRRELEVANT_PRACTICES = new Set([
  "family-law", "estate-planning", "personal-injury", "criminal-defense",
  "bankruptcy", "consumer-protection", "immigration", "real-estate",
]);

// ── Scoring criteria ──────────────────────────────────────────────────────────
// Normalised score: totalPts / maxPts × 100
// Signals marked * are excluded (pts=0, max=0) when the user expressed no preference,
// so they only affect ranking when they actually differentiate between firms.
//   Budget fit:           24 pts  — Can the user actually afford this firm?
//   Industry fit:         18 pts  — Does the firm specialize in the user's sector?
//   Stage fit:            14 pts  — Right experience for this company stage? (* excluded for non-startup)
//   Firm size preference: 12 pts  — Matches what the user asked for?
//   Location / state:      6 pts  — Remaining soft location signal (after hard filter)
//   Billing model:         6 pts  — Matches how the user wants to pay? (* excluded if no preference)
//   Quality (LWYRD):      10 pts  — Squared ratio for top-end amplification
//   Language:              5 pts  — Can the firm serve in the user's language? (* excluded if English-only)
//   Timeline / urgency:    4 pts  — Can they respond fast enough? (* excluded if no urgency)
// ─────────────────────────────────────────────────────────────────────────────

function scoreBudget(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 24;
  const budget = (answers["budget-monthly"] as number) ?? 0;
  const { min, max } = firm.budgetRange;

  // No minimum — contingency or open-ended pricing; budget doesn't penalise
  if (min === 0) {
    return { pts: MAX, max: MAX, reason: "Works on contingency, no upfront cost" };
  }

  if (budget === 0) {
    // No budget stated — neutral, give 65% so it doesn't dominate the score
    return { pts: Math.round(MAX * 0.65), max: MAX };
  }

  if (budget >= min && budget <= max) {
    return { pts: MAX, max: MAX, reason: `Within your $${(budget / 1000).toFixed(0)}k/month budget` };
  }

  if (budget > max) {
    // Client has more budget than ceiling — still a fine match, slight discount
    return { pts: Math.round(MAX * 0.80), max: MAX };
  }

  // budget < min (but above the hard-filter threshold of 28%)
  const ratio = budget / min; // 0.28 – 0.99
  if (ratio >= 0.80) return { pts: Math.round(MAX * 0.50), max: MAX };
  if (ratio >= 0.55) return { pts: Math.round(MAX * 0.25), max: MAX };
  return { pts: Math.round(MAX * 0.10), max: MAX }; // close to hard-filter threshold
}

function scoreQuality(firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 10;
  // Use LWYRD assessment pass rate if available; otherwise the LWYRD score (0–100).
  let qualityRatio: number;
  let reason: string | undefined;

  if (firm.assessment.length > 0) {
    const passed = firm.assessment.filter((a) => a.passed).length;
    qualityRatio = passed / firm.assessment.length;
    // no reason — quality score affects ranking silently
  } else {
    qualityRatio = firm.overallScore / 100;
  }

  // Square the ratio to amplify separation between top-rated and average firms
  return { pts: Math.round(MAX * Math.pow(qualityRatio, 2)), max: MAX, reason };
}

function scoreIndustry(categorySlug: string, answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 18;

  // Industry is not a meaningful signal for personal law — avoid penalising all results
  if (INDUSTRY_IRRELEVANT_PRACTICES.has(categorySlug)) {
    return { pts: MAX, max: MAX };
  }

  const raw = answers["industry"] as string | undefined;
  const industry = raw ? INDUSTRY_MAP[raw] : undefined;

  if (firm.industries.length === 0) {
    return { pts: Math.round(MAX * 0.50), max: MAX };
  }

  if (!industry) {
    // User didn't specify an industry — modest neutral, don't reward firms with no industry data equally
    return { pts: Math.round(MAX * 0.55), max: MAX };
  }

  if (firm.industries.includes(industry)) {
    return { pts: MAX, max: MAX, reason: `Experienced in ${raw!.split(" /")[0]}` };
  }

  // Near-match adjacencies
  if (industry === "fintech" && (firm.industries.includes("finance") || firm.industries.includes("tech"))) {
    return { pts: Math.round(MAX * 0.78), max: MAX };
  }
  if ((industry === "healthcare" && firm.industries.includes("biotech")) ||
      (industry === "biotech" && firm.industries.includes("healthcare"))) {
    return { pts: Math.round(MAX * 0.83), max: MAX };
  }
  if (industry === "saas" && firm.industries.includes("tech")) {
    return { pts: Math.round(MAX * 0.78), max: MAX };
  }
  if (["saas", "media", "consumer"].includes(industry) && firm.industries.includes("tech")) {
    return { pts: Math.round(MAX * 0.67), max: MAX };
  }
  if (industry === "real-estate" && firm.industries.includes("finance")) {
    return { pts: Math.round(MAX * 0.55), max: MAX };
  }

  // Mismatch — firm doesn't serve this sector
  return { pts: Math.round(MAX * 0.22), max: MAX };
}

function scoreStage(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 14;
  const rawStage = answers["company-stage"] as string;
  const stage = STAGE_MAP[rawStage];

  // Individual/personal track — stage not applicable, exclude from denominator
  if (!stage || stage === "individual") {
    return { pts: 0, max: 0 };
  }

  // Firm serves all stages (empty array = broad scope)
  if (firm.companyStages.length === 0) {
    return { pts: Math.round(MAX * 0.75), max: MAX };
  }

  if (firm.companyStages.includes(stage)) {
    return { pts: MAX, max: MAX, reason: `Specializes in ${rawStage.split("/")[0].trim()} companies` };
  }

  const adjacent = STAGE_ADJACENCY[stage] ?? [];
  if (adjacent.some((s) => firm.companyStages.includes(s))) {
    return { pts: Math.round(MAX * 0.60), max: MAX };
  }

  // Not adjacent — but hard filter already caught extreme mismatches, so this is a moderate gap
  return { pts: Math.round(MAX * 0.25), max: MAX };
}

function scoreFirmSize(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 18;
  const pref = answers["seniority-preference"] as string | undefined;

  if (!pref || pref.includes("No preference")) {
    return { pts: Math.round(MAX * 0.83), max: MAX }; // Slight discount for no preference expressed
  }

  if (pref.includes("Senior partner only")) {
    if (firm.size === "large") return { pts: MAX, max: MAX, reason: "Large firm with dedicated senior partners" };
    if (firm.size === "mid-size") return { pts: Math.round(MAX * 0.75), max: MAX };
    return { pts: Math.round(MAX * 0.50), max: MAX };
  }

  if (pref.includes("mix is fine") || pref.includes("Mix is fine")) {
    if (firm.size === "mid-size") return { pts: MAX, max: MAX, reason: "Mid-size firm, strong senior/associate mix" };
    return { pts: Math.round(MAX * 0.88), max: MAX }; // Any size works
  }

  if (pref.includes("Cost-efficiency")) {
    if (firm.size === "boutique") return { pts: MAX, max: MAX, reason: "Boutique firm, lean structure, competitive rates" };
    if (firm.size === "mid-size") return { pts: Math.round(MAX * 0.67), max: MAX };
    return { pts: Math.round(MAX * 0.33), max: MAX }; // Large firm = high overhead
  }

  if (pref.includes("Solo practitioner")) {
    // No solo practitioners in the database; boutique is the closest available option
    // but intentionally no positive reason so it doesn't surface as a green checkmark
    if (firm.size === "boutique") return { pts: Math.round(MAX * 0.6), max: MAX };
    if (firm.size === "mid-size") return { pts: Math.round(MAX * 0.33), max: MAX };
    return { pts: Math.round(MAX * 0.1), max: MAX };
  }

  return { pts: Math.round(MAX * 0.75), max: MAX };
}

function scoreLocation(
  categorySlug: string,
  answers: IntakeAnswers,
  firm: Firm
): { pts: number; max: number; reason?: string } {
  const MAX = 6;
  const pref = answers["location-preference"] as string | undefined;

  // No preference, or NY preference — all firms qualify fully (all have NYC offices)
  if (!pref || pref.includes("No preference") || pref.includes("New York")) {
    return { pts: MAX, max: MAX, reason: pref?.includes("New York") ? "Licensed and operating in New York" : undefined };
  }

  // Immigration is federal — can serve any state
  if (categorySlug === "immigration") {
    return { pts: MAX, max: MAX, reason: "Immigration law is federal, can represent you in any state" };
  }

  // Delaware: corporate/startup firms regularly handle DE matters
  if (pref.includes("Delaware")) {
    if (FEDERAL_PRACTICES.has(categorySlug)) {
      return { pts: Math.round(MAX * 0.92), max: MAX, reason: "Regularly handles Delaware corporate filings" };
    }
    return { pts: Math.round(MAX * 0.67), max: MAX };
  }

  // Check if the firm's HQ state matches the user's preferred state
  for (const [stateName] of Object.entries(STATE_ABBRS)) {
    if (pref.includes(stateName)) {
      const abbr = STATE_ABBRS[stateName];
      if (firm.location.includes(abbr) || firm.location.includes(stateName)) {
        return { pts: MAX, max: MAX, reason: `Headquartered in ${stateName}` };
      }
      break;
    }
  }

  // Federal practice — NYC firm can serve any US client regardless of state
  if (FEDERAL_PRACTICES.has(categorySlug)) {
    return { pts: MAX, max: MAX };
  }

  // Semi-state-specific (employment-law): partial credit
  if (SEMI_STATE_SPECIFIC_PRACTICES.has(categorySlug)) {
    return { pts: Math.round(MAX * 0.50), max: MAX };
  }

  // State-specific but firm HQ didn't match — should already be hard-filtered, but be safe
  return { pts: Math.round(MAX * 0.17), max: MAX };
}

function scoreTimeline(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 4;
  const rawTimeline = answers["timeline"] as string | undefined;
  const urgency = rawTimeline ? (TIMELINE_URGENCY[rawTimeline] ?? 0) : 0;
  const responseLevel = RESPONSE_PRIORITY[firm.responseTime] ?? 0;

  if (urgency === 3) {
    if (responseLevel >= 2) return { pts: MAX, max: MAX, reason: "Available on short notice" };
    if (responseLevel === 1) return { pts: Math.round(MAX * 0.50), max: MAX };
    return { pts: Math.round(MAX * 0.25), max: MAX };
  }
  if (urgency === 2) {
    if (responseLevel >= 1) return { pts: MAX, max: MAX };
    return { pts: Math.round(MAX * 0.75), max: MAX };
  }
  // No urgency expressed — signal doesn't differentiate, exclude from denominator
  return { pts: 0, max: 0 };
}

function scoreBillingModel(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 6;
  const pref = answers["billing-preference"] as string | undefined;

  if (!pref) return { pts: 0, max: 0 };

  if (pref === "Hourly"   && firm.billingModel === "hourly")                                      return { pts: MAX, max: MAX, reason: "Offers hourly billing" };
  if (pref === "Retainer" && (firm.billingModel === "retainer" || firm.billingModel === "hybrid")) return { pts: MAX, max: MAX, reason: "Offers monthly retainer arrangements" };
  if (pref === "Flat-fee" && firm.billingModel === "flat-fee")                                    return { pts: MAX, max: MAX, reason: "Offers flat-fee / fixed-cost arrangements" };
  if (pref === "Hourly"   && firm.billingModel === "hybrid")                                      return { pts: Math.round(MAX * 0.67), max: MAX };

  return { pts: Math.round(MAX * 0.33), max: MAX };
}

function scoreLanguage(answers: IntakeAnswers, firm: Firm): { pts: number; max: number; reason?: string } {
  const MAX = 5;
  const langs = answers["languages"] as string[] | undefined;

  if (!langs || langs.length === 0) return { pts: 0, max: 0 };
  const nonEnglish = langs.filter((l) => l !== "No — English only is fine");
  // No non-English needed — signal doesn't differentiate, exclude from denominator
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

  // If hard filters removed everything, fall back to practice-area-only set
  // so the user always sees some results (with low scores) rather than a blank page.
  const pool = eligible.length > 0 ? eligible : byPracticeArea;

  // Step 3: Score each firm
  const scored = pool.map((firm) => {
    const budgetResult    = scoreBudget(answers, firm);
    const qualityResult   = scoreQuality(firm);
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
      industryResult.max +
      stageResult.max +
      sizeResult.max +
      locationResult.max +
      timelineResult.max +
      billingResult.max +
      languageResult.max;

    const finalScore = Math.round((totalPts / maxPts) * 100);

    // Collect up to 3 reasons from criteria that scored well and have labels
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

    // Firm size — only track when a preference was explicitly expressed
    const sizePref = answers["seniority-preference"] as string | undefined;
    if (sizePref && !sizePref.includes("No preference")) {
      if (sizeResult.pts >= sizeResult.max * 0.7) matchedCriteria.push("firm-size");
      else missedCriteria.push("firm-size");
    }

    // Billing — only track when a preference was expressed (max > 0)
    if (billingResult.max > 0) {
      if (billingResult.pts >= billingResult.max * 0.7) matchedCriteria.push("billing");
      else missedCriteria.push("billing");
    }

    // Language — only track when a non-English language was requested (max > 0)
    if (languageResult.max > 0) {
      if (languageResult.pts >= languageResult.max * 0.7) matchedCriteria.push("language");
      else missedCriteria.push("language");
    }

    return { firm, score: finalScore, reasons, matchedCriteria, missedCriteria };
  });

  // Step 4: Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Step 5: Cap at 8 results, mark best match
  return scored.slice(0, 8).map((r, i) => ({
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

  // Budget — midpoint of the selected range
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
    exploring: "No specific timeline — exploring options",
    planning_ahead: "No specific timeline — exploring options",
  };
  const timelineAnswer = (v2Answers.sf5 ?? v2Answers.if4 ?? v2Answers.bf5) as string | undefined;
  if (timelineAnswer) result["timeline"] = timelineMap[timelineAnswer] ?? "";

  // Firm size preference
  const firmTypeMap: Record<string, string> = {
    large: "Senior partner only — I want the most experienced attorney",
    boutique: "Cost-efficiency — I want the most economical option",
    solo: "Solo practitioner — I want a single dedicated attorney",
    no_preference: "No preference",
  };
  const firmTypeAnswer = (v2Answers.sf1 ?? v2Answers.if1 ?? v2Answers.bf1) as string | undefined;
  if (firmTypeAnswer) result["seniority-preference"] = firmTypeMap[firmTypeAnswer] ?? "";

  // State requirement
  const stateNameMap: Record<string, string> = {
    none: "No preference — I can work with any qualified firm remotely",
    NY: "New York", CA: "California", TX: "Texas", FL: "Florida",
    IL: "Illinois", DE: "Delaware", NJ: "New Jersey", CT: "Connecticut",
    MA: "Massachusetts", CO: "Colorado", AZ: "Arizona",
    other: "No preference — I can work with any qualified firm remotely",
    multi_state: "No preference — I can work with any qualified firm remotely",
  };
  const stateAnswer = (v2Answers.sf7 ?? v2Answers.if5 ?? v2Answers.bf7) as string | undefined;
  if (stateAnswer) result["location-preference"] = stateNameMap[stateAnswer] ?? stateAnswer;

  // Language preference
  const langLabelMap: Record<string, string> = {
    english: "No — English only is fine", spanish: "Spanish",
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
