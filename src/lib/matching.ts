import { Firm, IntakeAnswers, MatchResult } from "@/types";
import { CATEGORY_SLUG_MAP } from "@/data/intakeV2";

// Maps intake answer strings to internal industry keys
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

// Adjacent stages for partial matching
const STAGE_ADJACENCY: Record<string, string[]> = {
  "pre-seed": ["seed"],
  "seed": ["pre-seed", "series-a"],
  "series-a": ["seed", "growth"],
  "growth": ["series-a", "enterprise"],
  "enterprise": ["growth"],
};

const RESPONSE_PRIORITY: Record<string, number> = {
  "same-day": 3,
  "24h": 2,
  "48h": 1,
  "72h": 0,
};

const TIMELINE_URGENCY: Record<string, number> = {
  "As soon as possible / This week": 3,
  "Within 1–2 weeks": 2,
  "Within a month": 1,
  "No specific timeline — exploring options": 0,
};

function scoreStageCriterion(answers: IntakeAnswers, firm: Firm): { score: number; reason?: string } {
  const rawStage = answers["company-stage"] as string;
  const stage = STAGE_MAP[rawStage];
  if (!stage || stage === "individual") {
    return { score: 1.0 };
  }
  if (firm.companyStages.length === 0) {
    // Firm serves all stages (personal law firms, broad-scope firms)
    return { score: 0.8 };
  }
  if (firm.companyStages.includes(stage)) {
    return { score: 1.0, reason: `Specializes in ${rawStage.split("/")[0].trim()} companies` };
  }
  const adjacent = STAGE_ADJACENCY[stage] ?? [];
  if (adjacent.some((s) => firm.companyStages.includes(s))) {
    return { score: 0.65 };
  }
  return { score: 0.15 };
}

function scoreBudgetCriterion(answers: IntakeAnswers, firm: Firm): { score: number; reason?: string } {
  const budget = answers["budget-monthly"] as number ?? 0;
  if (budget === 0) return { score: 0.7 };

  // Contingency (personal injury) — no upfront cost
  if (firm.billingModel === "flat-fee" && firm.budgetRange.min === 0 && firm.budgetRange.max === 0) {
    return { score: 1.0, reason: "Works on contingency — no upfront cost" };
  }

  if (budget >= firm.budgetRange.min && budget <= firm.budgetRange.max) {
    return { score: 1.0, reason: `Within your $${(budget / 1000).toFixed(0)}k/month budget` };
  }
  if (budget < firm.budgetRange.min) {
    const gap = firm.budgetRange.min - budget;
    const ratio = gap / firm.budgetRange.min;
    if (ratio < 0.2) return { score: 0.75 };
    if (ratio < 0.5) return { score: 0.45 };
    return { score: 0.15 };
  }
  // budget > max — client has more than this firm's ceiling; still a fine match
  return { score: 0.9 };
}

function scoreIndustryCriterion(answers: IntakeAnswers, firm: Firm): { score: number; reason?: string } {
  const raw = answers["industry"] as string;
  const industry = INDUSTRY_MAP[raw];
  if (!industry) return { score: 0.7 };
  if (firm.industries.length === 0) return { score: 0.75 };
  if (firm.industries.includes(industry)) {
    return { score: 1.0, reason: `Experienced in ${raw.split(" /")[0]}` };
  }
  // Near-matches
  if (industry === "fintech" && (firm.industries.includes("finance") || firm.industries.includes("tech"))) {
    return { score: 0.8 };
  }
  if (industry === "healthcare" && firm.industries.includes("biotech")) return { score: 0.85 };
  if (industry === "biotech" && firm.industries.includes("healthcare")) return { score: 0.85 };
  if (industry === "saas" && firm.industries.includes("tech")) return { score: 0.75 };
  if (["saas", "fintech", "media"].includes(industry) && firm.industries.includes("tech")) return { score: 0.7 };
  if (industry === "real-estate" && firm.industries.includes("finance")) return { score: 0.6 };
  return { score: 0.3 };
}

function scoreTimelineCriterion(answers: IntakeAnswers, firm: Firm): { score: number; reason?: string } {
  const rawTimeline = answers["timeline"] as string;
  const urgency = TIMELINE_URGENCY[rawTimeline] ?? 0;
  const responseLevel = RESPONSE_PRIORITY[firm.responseTime] ?? 0;

  if (urgency === 3) {
    if (responseLevel >= 2) return { score: 1.0, reason: "Available on short notice" };
    if (responseLevel === 1) return { score: 0.6 };
    return { score: 0.3 };
  }
  if (urgency >= 2) {
    if (responseLevel >= 1) return { score: 1.0 };
    return { score: 0.7 };
  }
  return { score: 1.0 };
}

function scoreSeniorityPreference(answers: IntakeAnswers, firm: Firm): { score: number; reason?: string } {
  const pref = answers["seniority-preference"] as string;
  if (!pref || pref.includes("No preference")) return { score: 1.0 };

  if (pref.includes("Senior partner only")) {
    if (firm.size === "large") return { score: 1.0, reason: "Large firm with dedicated senior partners" };
    if (firm.size === "mid-size") return { score: 0.8 };
    return { score: 0.55, reason: "Boutique — direct senior attorney access likely" };
  }
  if (pref.includes("mix is fine") || pref.includes("Mix is fine")) {
    return { score: 1.0 };
  }
  if (pref.includes("Cost-efficiency")) {
    if (firm.size === "boutique") return { score: 1.0, reason: "Boutique firm — competitive rates" };
    if (firm.size === "mid-size") return { score: 0.75 };
    return { score: 0.4 };
  }
  return { score: 0.8 };
}

function scoreLocationCriterion(answers: IntakeAnswers, firm: Firm): { score: number; reason?: string } {
  const pref = answers["location-preference"] as string;
  if (!pref || pref.includes("No preference")) return { score: 1.0 };

  // All firms in the LWYRD database have NYC offices and are licensed in New York.
  // New York / NY match: always full credit.
  if (pref.includes("New York") || pref === "NY") {
    return { score: 1.0, reason: "Licensed and operating in New York" };
  }

  // Delaware: many NYC startup firms handle DE incorporations regardless of physical location
  if (pref.includes("Delaware") || pref === "DE") {
    const startupPractices = ["corporate-formation", "fundraising", "corporate-governance", "mergers-acquisitions"];
    if (firm.practiceAreas.some((p) => startupPractices.includes(p))) {
      return { score: 0.85, reason: "Routinely handles Delaware incorporations and corporate filings" };
    }
    return { score: 0.6 };
  }

  // New Jersey / Connecticut: close to NYC, many NYC firms serve these markets
  if (pref.includes("New Jersey") || pref === "NJ" || pref.includes("Connecticut") || pref === "CT") {
    return { score: 0.75 };
  }

  // Other US states: these are NYC-based firms; state-specific matters (family law, real estate,
  // personal injury, criminal) typically require local counsel. Score low for hard mismatch.
  const personalLawPractices = ["family-law", "personal-injury", "estate-planning", "immigration"];
  const hasPersonalLaw = firm.practiceAreas.some((p) => personalLawPractices.includes(p));
  if (hasPersonalLaw && firm.practiceAreas.length <= 2) {
    // Primarily personal law firm — unlikely to serve other states
    return { score: 0.15 };
  }

  // Startup/corporate law firms can often handle federal and multi-state matters
  const corporatePractices = ["corporate-formation", "intellectual-property", "fundraising",
    "contract-law", "regulatory-compliance", "corporate-governance", "mergers-acquisitions"];
  const isCorporate = firm.practiceAreas.some((p) => corporatePractices.includes(p));
  if (isCorporate) {
    return { score: 0.55, reason: "NYC-based firm; can advise on federal and multi-state matters" };
  }

  return { score: 0.3 };
}

function scoreLanguageCriterion(answers: IntakeAnswers, firm: Firm): { score: number; reason?: string } {
  const langs = answers["languages"] as string[];
  if (!langs || langs.length === 0 || langs.includes("No — English only is fine")) {
    return { score: 1.0 };
  }
  const needed = langs.filter((l) => l !== "No — English only is fine");
  if (needed.length === 0) return { score: 1.0 };
  const matched = needed.filter((l) => firm.languages.includes(l));
  if (matched.length === needed.length) {
    return { score: 1.0, reason: `Supports ${matched.join(", ")}` };
  }
  if (matched.length > 0) return { score: 0.6 };
  return { score: 0.5 }; // Slight penalty but not catastrophic — can still work in English
}

function scoreQualityBaseline(firm: Firm): { score: number; reason?: string } {
  if (firm.assessment.length > 0) {
    const passed = firm.assessment.filter((a) => a.passed).length;
    const rate = passed / firm.assessment.length;
    const reason =
      rate === 1
        ? "Meets every LWYRD vetting criterion"
        : passed >= firm.assessment.length - 1
        ? "Meets nearly all LWYRD vetting criteria"
        : undefined;
    return { score: rate, reason };
  }
  return { score: firm.overallScore / 100 };
}

export function matchFirms(
  categorySlug: string,
  answers: IntakeAnswers,
  allFirms: Firm[]
): MatchResult[] {
  // Step 1: Hard filter by practice area
  const eligible = allFirms.filter((f) => f.practiceAreas.includes(categorySlug));
  if (eligible.length === 0) return [];

  // Step 2: Score each firm
  const scored = eligible.map((firm) => {
    const stageResult = scoreStageCriterion(answers, firm);
    const budgetResult = scoreBudgetCriterion(answers, firm);
    const industryResult = scoreIndustryCriterion(answers, firm);
    const timelineResult = scoreTimelineCriterion(answers, firm);
    const seniorityResult = scoreSeniorityPreference(answers, firm);
    const locationResult = scoreLocationCriterion(answers, firm);
    const languageResult = scoreLanguageCriterion(answers, firm);
    const qualityResult = scoreQualityBaseline(firm);

    // Hard disqualification: if location score is very low (user explicitly needs a different state
    // and this is a personal law firm), disqualify completely
    if (locationResult.score < 0.2) {
      return {
        firm,
        score: 0,
        reasons: [],
        matchedCriteria: [],
        missedCriteria: ["location", "practice-area"],
        _skip: true,
      };
    }

    const weightedScore =
      stageResult.score * 18 +
      budgetResult.score * 20 +
      industryResult.score * 15 +
      timelineResult.score * 10 +
      seniorityResult.score * 10 +
      locationResult.score * 12 +
      languageResult.score * 5 +
      qualityResult.score * 10;

    const finalScore = Math.round(Math.min(100, weightedScore));

    const reasonCandidates = [
      { result: stageResult, weight: 18 },
      { result: budgetResult, weight: 20 },
      { result: industryResult, weight: 15 },
      { result: timelineResult, weight: 10 },
      { result: seniorityResult, weight: 10 },
      { result: locationResult, weight: 12 },
      { result: qualityResult, weight: 10 },
      { result: languageResult, weight: 5 },
    ];

    const reasons: string[] = reasonCandidates
      .filter((r) => r.result.reason && r.result.score >= 0.8)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((r) => r.result.reason!);

    const matchedCriteria: string[] = [];
    const missedCriteria: string[] = [];

    if (stageResult.score >= 0.7) matchedCriteria.push("company-stage");
    else missedCriteria.push("company-stage");

    if (budgetResult.score >= 0.7) matchedCriteria.push("budget");
    else missedCriteria.push("budget");

    if (industryResult.score >= 0.7) matchedCriteria.push("industry");
    else missedCriteria.push("industry");

    if (timelineResult.score >= 0.7) matchedCriteria.push("timeline");
    else missedCriteria.push("timeline");

    if (locationResult.score >= 0.7) matchedCriteria.push("location");
    else if (locationResult.score < 0.5) missedCriteria.push("location");

    return {
      firm,
      score: finalScore,
      reasons,
      matchedCriteria,
      missedCriteria,
    };
  });

  // Remove hard-disqualified firms and sort descending by score
  const valid = scored
    .filter((r) => !("_skip" in r && r._skip))
    .sort((a, b) => b.score - a.score);

  // Mark best match
  const results: MatchResult[] = valid.map((r, i) => ({
    ...r,
    isBestMatch: i === 0 && r.score >= 65,
  }));

  return results;
}

// Maps v2 enum answers back to the string format the existing scoring functions expect
function mapV2AnswersForMatching(
  v2Answers: Record<string, string | string[] | number>
): IntakeAnswers {
  const result: IntakeAnswers = {};

  // Company stage (startup only)
  const stageEnumMap: Record<string, string> = {
    pre_incorp: "Pre-Seed / Idea stage",
    pre_seed: "Pre-Seed / Idea stage",
    seed: "Seed / Early startup",
    series_a: "Series A / Growing startup",
    series_b_plus: "Growth / Scaling company",
    bootstrapped: "Enterprise / Established company",
  };
  if (v2Answers.s1) {
    result["company-stage"] = stageEnumMap[v2Answers.s1 as string] ?? "";
  } else {
    result["company-stage"] = "Individual / Personal matter";
  }

  // Industry
  const startupIndustryMap: Record<string, string> = {
    tech_saas: "Technology / Software",
    ai_ml: "Technology / Software",
    fintech: "Financial Services / FinTech",
    healthtech: "Healthcare / Life Sciences",
    consumer: "Retail / Consumer",
    media: "Media / Entertainment",
    hardware: "Technology / Software",
    climate: "Technology / Software",
    enterprise_b2b: "Technology / Software",
    other: "",
  };
  const sbIndustryMap: Record<string, string> = {
    retail_ecomm: "Retail / Consumer",
    food_bev: "Retail / Consumer",
    professional_svcs: "",
    healthcare: "Healthcare / Life Sciences",
    construction_re: "Real Estate",
    technology: "Technology / Software",
    manufacturing: "Manufacturing",
    hospitality: "Retail / Consumer",
    creative: "Media / Entertainment",
    other: "",
  };
  if (v2Answers.s2) result["industry"] = startupIndustryMap[v2Answers.s2 as string] ?? "";
  else if (v2Answers.b3) result["industry"] = sbIndustryMap[v2Answers.b3 as string] ?? "";

  // Budget
  const budgetMidMap: Record<string, number> = {
    under_2500: 1250,
    "2500_10k": 5000,
    "10k_25k": 17500,
    "10k_30k": 20000,
    "25k_75k": 50000,
    "30k_75k": 50000,
    over_75k: 100000,
    under_1500: 750,
    "1500_5k": 3250,
    "5k_15k": 10000,
    "15k_50k": 32500,
    over_50k: 75000,
    unsure: 0,
  };
  const budgetRaw = v2Answers.sf3 ?? v2Answers.if3 ?? v2Answers.bf3;
  if (budgetRaw !== undefined) {
    result["budget-monthly"] = typeof budgetRaw === "number"
      ? budgetRaw
      : budgetMidMap[budgetRaw as string] ?? 0;
  }

  // Timeline
  const timelineMap: Record<string, string> = {
    this_week: "As soon as possible / This week",
    within_2_weeks: "Within 1–2 weeks",
    within_month: "Within a month",
    exploring: "No specific timeline — exploring options",
    planning_ahead: "No specific timeline — exploring options",
  };
  const timelineAnswer = (v2Answers.sf5 ?? v2Answers.if4 ?? v2Answers.bf5) as string | undefined;
  if (timelineAnswer) result["timeline"] = timelineMap[timelineAnswer] ?? "";

  // Firm type / seniority preference
  const firmTypeMap: Record<string, string> = {
    large: "Senior partner only — I want the most experienced attorney",
    boutique: "Mix is fine — senior attorneys plus associates for routine work",
    solo: "Cost-efficiency — I want the most economical option",
    no_preference: "No preference",
  };
  const firmTypeAnswer = (v2Answers.sf1 ?? v2Answers.if1 ?? v2Answers.bf1) as string | undefined;
  if (firmTypeAnswer) result["seniority-preference"] = firmTypeMap[firmTypeAnswer] ?? "";

  // State requirement — maps state abbreviation to full name for location scoring
  const stateNameMap: Record<string, string> = {
    none: "No preference — I can work with any qualified firm remotely",
    NY: "New York",
    CA: "California",
    TX: "Texas",
    FL: "Florida",
    IL: "Illinois",
    DE: "Delaware",
    NJ: "New Jersey",
    CT: "Connecticut",
    MA: "Massachusetts",
    CO: "Colorado",
    AZ: "Arizona",
    other: "No preference — I can work with any qualified firm remotely",
    multi_state: "No preference — I can work with any qualified firm remotely",
  };
  const stateAnswer = (v2Answers.sf7 ?? v2Answers.if5 ?? v2Answers.bf7) as string | undefined;
  if (stateAnswer) result["location-preference"] = stateNameMap[stateAnswer] ?? stateAnswer;

  // Languages
  const langLabelMap: Record<string, string> = {
    english: "No — English only is fine",
    spanish: "Spanish",
    mandarin: "Mandarin",
    hindi: "Hindi",
    portuguese: "Portuguese",
    korean: "Korean",
    other: "Other",
  };
  const langAnswer = (v2Answers.sf8 ?? v2Answers.if6 ?? v2Answers.bf8) as string[] | undefined;
  if (langAnswer?.length) {
    result["languages"] = langAnswer.map((l) => langLabelMap[l] ?? l);
  }

  return result;
}

export function matchFirmsV2(
  track: string,
  category: string,
  v2Answers: Record<string, string | string[] | number>,
  allFirms: Firm[]
): MatchResult[] {
  const categorySlug =
    CATEGORY_SLUG_MAP[track]?.[category] ?? "corporate-formation";
  const mappedAnswers = mapV2AnswersForMatching(v2Answers);
  return matchFirms(categorySlug, mappedAnswers, allFirms);
}
