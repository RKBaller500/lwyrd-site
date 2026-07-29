"use server";

import { createClient } from "@/lib/supabase/server";
import type { Firm, IntakeAnswers, LockedMatchResult, MatchResult, PublicMatchResult } from "@/types";
import { matchFirmsV2 } from "@/lib/matching";
import { mapDbFirmToFirm } from "@/lib/supabase/mappers";
import type { DbFirm } from "@/lib/supabase/types";
import { firms as localFirms } from "@/data/firms";
import { CATEGORY_SLUG_MAP } from "@/data/intakeV2";
import { buildPreparedMaterials } from "@/lib/intakePreparedMaterials";
import type { FirmProfileMatchContext } from "@/types";
import { hasDurableIntakeUnlock, previewUnlockCookieValue } from "@/lib/paywallUnlocks";

export { previewUnlockCookieValue };

async function loadMatchableFirms(
  supabase: Awaited<ReturnType<typeof createClient>>,
  practiceAreaSlug: string
): Promise<Firm[]> {
  let allFirms = localFirms;
  try {
    const { data, error } = await supabase
      .from("firms")
      .select("*, attorneys(*), firm_assessment_items(*), firm_practice_areas(practice_area_slug)");
    if (!error && data && data.length > 0) {
      allFirms = (data as DbFirm[]).map(mapDbFirmToFirm);
    }
  } catch {
    // proceed with local firms
  }

  try {
    const { data: fpaRows } = await supabase
      .from("firm_practice_areas")
      .select("firm_id")
      .eq("practice_area_slug", practiceAreaSlug);
    if (fpaRows && fpaRows.length > 0) {
      const eligibleIds = new Set(fpaRows.map((r: { firm_id: string }) => r.firm_id));
      allFirms = allFirms.filter((f) => eligibleIds.has(f.id));
    }
  } catch {
    // matchFirms will fall back to practiceAreas array filter
  }

  return allFirms;
}

async function loadOwnedSubmission(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  submissionId: string
) {
  const { data: submission, error } = await supabase
    .from("intake_submissions")
    .select("track, category_slug, legal_category, practice_area_slug, category_label, answers, created_at")
    .eq("id", submissionId)
    .eq("user_id", userId)
    .single();

  if (error || !submission) return null;
  return submission;
}

function submissionCategory(submission: {
  legal_category?: string | null;
  category_slug?: string | null;
}): string {
  return (
    submission.legal_category ??
    (submission.category_slug?.includes("/") ? submission.category_slug.split("/").pop() : submission.category_slug) ??
    ""
  );
}

function inferJurisdiction(firm: Firm): string {
  const location = firm.location || "";
  const stateLabels: Record<string, string> = {
    NY: "New York",
    CA: "California",
    TX: "Texas",
    FL: "Florida",
    IL: "Illinois",
    UT: "Utah",
    AZ: "Arizona",
    DE: "Delaware",
    NJ: "New Jersey",
    CT: "Connecticut",
    MA: "Massachusetts",
    CO: "Colorado",
  };

  for (const [abbr, label] of Object.entries(stateLabels)) {
    if (location.includes(abbr) || location.includes(label)) return label;
  }
  return "United States";
}

function qualitySignals(firm: Firm, practiceAreaLabel: string): string[] {
  const signals: string[] = [];
  if (firm.verified) signals.push("Bar standing verified");
  if (firm.founded) {
    const years = Math.max(1, new Date().getFullYear() - firm.founded);
    if (years >= 5) signals.push(`${years}+ years in practice`);
  }
  if (practiceAreaLabel) signals.push(`Specialist in ${practiceAreaLabel}`);
  if (firm.assessment.some((item) => item.passed && /response|contact|conflict|insurance/i.test(`${item.label} ${item.note ?? ""}`))) {
    signals.push("Quality standards reviewed");
  }
  return signals.slice(0, 3);
}

function redactMatchResult(result: MatchResult, index: number, practiceAreaLabel: string): LockedMatchResult {
  // result.reasons is templated from the user's own answers (budget fit, location,
  // etc.) and is often sparse or identical across top matches by design — see the
  // "no reason text on purpose" notes in matching.ts. firmHighlights differentiates
  // cards but can identify the firm (named clients, rankings) so it's excluded here.
  // strengths[0] is the one exception: every firm's data follows a fixed "Deep
  // expertise in X and Y" template describing specialization only, never a firm
  // name or named client, so it's safe to surface pre-paywall and gives each locked
  // card a genuinely firm-specific first reason instead of repeating generic text.
  const specialization = result.firm.strengths[0];
  const reasons = specialization
    ? [specialization, ...result.reasons].slice(0, 3)
    : result.reasons.slice(0, 3);

  return {
    isLocked: true,
    score: result.score,
    rank: index + 1,
    firmSize: result.firm.size,
    practiceAreaMatch: practiceAreaLabel,
    jurisdiction: inferJurisdiction(result.firm),
    reasons,
    credibilitySignals: qualitySignals(result.firm, practiceAreaLabel),
    feeLevel: result.firm.costTier,
    matchedCriteria: result.matchedCriteria,
    missedCriteria: result.missedCriteria,
    isBestMatch: result.isBestMatch,
  };
}

function publicResultsForAccess(
  results: MatchResult[],
  practiceAreaLabel: string,
  intakeUnlocked = false
): { results: PublicMatchResult[]; lockedCount: number; unlocked: boolean } {
  if (intakeUnlocked) return { results, lockedCount: 0, unlocked: true };

  return {
    results: results.map((result, index) => redactMatchResult(result, index, practiceAreaLabel)),
    lockedCount: results.length,
    unlocked: false,
  };
}

// Legacy action, kept for backward compatibility
export async function saveIntakeSubmission(
  categorySlug: string,
  answers: IntakeAnswers,
  matchResults: MatchResult[]
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const topMatches = matchResults.slice(0, 5).map((r) => ({
    firmId: r.firm.id,
    firmName: r.firm.name,
    score: r.score,
  }));

  await supabase.from("intake_submissions").insert({
    user_id: user.id,
    category_slug: categorySlug,
    answers,
    top_matches: topMatches,
  });
}

// V2 action, writes to general table + track-specific table + matches table
export async function saveIntakeSubmissionV2(
  track: string,
  category: string,
  categoryLabel: string,
  v2Answers: Record<string, string | string[] | number>,
  matchResults: MatchResult[],
  practiceAreaSlug: string
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const topMatches = matchResults.slice(0, 5).map((r) => ({
    firmId: r.firm.id,
    firmName: r.firm.name,
    score: r.score,
  }));

  // Write general submission record
  const { data: generalRow, error: generalError } = await supabase
    .from("intake_submissions")
    .insert({
      user_id: user.id,
      category_slug: `${track}/${category}`,
      practice_area_slug: practiceAreaSlug,
      track,
      legal_category: category,
      category_label: categoryLabel,
      answers: v2Answers as Record<string, unknown>,
      top_matches: topMatches,
    })
    .select("id")
    .single();

  if (generalError) {
    // Swallow, never block UX
    return null;
  }

  const generalId = generalRow?.id ?? null;

  // Write track-specific structured record
  if (track === "startup") {
    const langRaw = (v2Answers.sf8 as string[] | undefined) ?? null;
    await supabase.from("startup_submissions").insert({
      general_submission_id: generalId,
      intake_submission_id: generalId,
      user_id: user.id,
      track: "startup",
      legal_category: category,
      company_stage: (v2Answers.s1 as string) ?? null,
      industry_vertical: (v2Answers.s2 as string) ?? null,
      is_fundraising_active: v2Answers.s3
        ? ["active_now", "within_6mo"].includes(v2Answers.s3 as string)
        : null,
      fundraising_timeline: (v2Answers.s3 as string) ?? null,
      founder_count: (v2Answers.s4 as string) ?? null,
      round_size_range: (v2Answers.s5h as string) ?? null,
      ip_assigned: (v2Answers.s5e as string) ?? null,
      fundraising_instrument: (v2Answers.s5f as string) ?? null,
      employee_count_range: (v2Answers.s5j as string) ?? null,
      firm_type_preference: (v2Answers.sf1 as string) ?? null,
      billing_preference: (v2Answers.sf2 as string) ?? null,
      budget_range: v2Answers.sf3 !== undefined ? String(v2Answers.sf3) : null,
      engagement_type: (v2Answers.sf4 as string) ?? null,
      urgency: (v2Answers.sf5 as string) ?? null,
      prior_counsel: (v2Answers.sf6 as string) ?? null,
      state_requirement: (v2Answers.sf7 as string) ?? null,
      language_requirement: langRaw,
      sub_question_json: extractSubQuestionJson(track, category, v2Answers),
    });
  } else if (track === "individual") {
    const langRaw = (v2Answers.if6 as string[] | undefined) ?? null;
    await supabase.from("individual_submissions").insert({
      general_submission_id: generalId,
      intake_submission_id: generalId,
      user_id: user.id,
      track: "individual",
      legal_category: category,
      situation_type: (v2Answers.i1 as string) ?? null,
      prior_personal_counsel: (v2Answers.i2 as string) ?? null,
      contested: (v2Answers.i3b as string) ?? null,
      children_involved: (v2Answers.i3c as string) ?? null,
      plaintiff_or_defendant: (v2Answers.i3i as string) ?? null,
      immigration_status: (v2Answers.i3k as string) ?? null,
      still_employed: (v2Answers.i3m as string) ?? null,
      firm_type_preference: (v2Answers.if1 as string) ?? null,
      billing_preference: (v2Answers.if2 as string) ?? null,
      budget_range: v2Answers.if3 !== undefined ? String(v2Answers.if3) : null,
      urgency: (v2Answers.if4 as string) ?? null,
      state_of_matter: (v2Answers.if5 as string) ?? null,
      language_requirement: langRaw,
      sub_question_json: extractSubQuestionJson(track, category, v2Answers),
    });
  } else if (track === "small_business") {
    const langRaw = (v2Answers.bf8 as string[] | undefined) ?? null;
    await supabase.from("small_business_submissions").insert({
      general_submission_id: generalId,
      intake_submission_id: generalId,
      user_id: user.id,
      track: "small_business",
      legal_category: category,
      years_in_operation: (v2Answers.b1 as string) ?? null,
      employee_count_range: (v2Answers.b2 as string) ?? null,
      industry_vertical: (v2Answers.b3 as string) ?? null,
      entity_type: (v2Answers.b4b as string) ?? null,
      transaction_size_range: (v2Answers.b4m as string) ?? null,
      litigation_stage: (v2Answers.b4h as string) ?? null,
      has_current_counsel: (v2Answers.bf6 as string) ?? null,
      firm_type_preference: (v2Answers.bf1 as string) ?? null,
      billing_preference: (v2Answers.bf2 as string) ?? null,
      budget_range: v2Answers.bf3 !== undefined ? String(v2Answers.bf3) : null,
      engagement_type: (v2Answers.bf4 as string) ?? null,
      urgency: (v2Answers.bf5 as string) ?? null,
      state_requirement: (v2Answers.bf7 as string) ?? null,
      language_requirement: langRaw,
      sub_question_json: extractSubQuestionJson(track, category, v2Answers),
    });
  }

  // Write match results to the matches table
  if (generalId && matchResults.length > 0) {
    const matchRows = matchResults.map((result, index) => {
      const rank = index + 1;
      return {
        intake_submission_id: generalId,
        firm_id: result.firm.id,
        user_id: user.id,
        practice_area_slug: practiceAreaSlug,
        match_score: result.score,
        match_rank: rank,
        matched_criteria: result.matchedCriteria,
        missed_criteria: result.missedCriteria,
        is_best_match: rank === 1 && result.score >= 60,
        // legacy columns, keep writing until told otherwise
        score: result.score,
        rank,
      };
    });
    await supabase.from("matches").insert(matchRows);
  }

  return generalId;
}

// Collects category-specific sub-question answers into a JSON blob
function extractSubQuestionJson(
  track: string,
  category: string,
  answers: Record<string, string | string[] | number>
): Record<string, string | string[]> {
  const subQIds: Record<string, Record<string, string[]>> = {
    startup: {
      formation: ["s5a", "s5b", "s5c"],
      ip: ["s5d", "s5e"],
      fundraising: ["s5f", "s5g", "s5h"],
      employment: ["s5i", "s5j"],
      contracts: ["s5k", "s5l"],
      regulatory: ["s5m"],
      governance: ["s5n"],
      ma: ["s5o"],
      dispute: ["s5p"],
    },
    individual: {
      family: ["i3a", "i3b", "i3c"],
      estate: ["i3d", "i3e"],
      real_estate: ["i3f", "i3g"],
      personal_injury: ["i3h", "i3i"],
      immigration: ["i3j", "i3k"],
      employment: ["i3l", "i3m"],
      tax: ["i3n"],
      criminal: ["i3o", "i3p"],
      bankruptcy: ["i3q"],
      consumer: [],
    },
    small_business: {
      formation: ["b4a", "b4b"],
      contracts: ["b4c", "b4d"],
      employment: ["b4e"],
      ip: ["b4f"],
      disputes: ["b4g", "b4h"],
      real_estate: ["b4i"],
      regulatory: ["b4j"],
      tax: ["b4k"],
      ma: ["b4l", "b4m"],
      data_privacy: ["b4n"],
    },
  };

  const ids = subQIds[track]?.[category] ?? [];
  const result: Record<string, string | string[]> = {};
  ids.forEach((id) => {
    const val = answers[id];
    if (val !== undefined) result[id] = typeof val === "number" ? String(val) : val;
  });
  return result;
}

// Runs matching server-side and returns only the results the caller is entitled to.
// Free users receive redacted result cards; paying or preview-unlocked users receive full results.
// This prevents full match data from ever reaching the client for unpaid sessions.
export async function runMatchingV2(
  track: string,
  category: string,
  categoryLabel: string,
  answers: IntakeAnswers
): Promise<{ results: PublicMatchResult[]; lockedCount: number; unlocked?: boolean; submissionId?: string | null; error?: string }> {
  const VALID_TRACKS = ["startup", "individual", "small_business"] as const;
  if (
    typeof track !== "string" ||
    !(VALID_TRACKS as readonly string[]).includes(track) ||
    typeof category !== "string" ||
    !category ||
    category.length > 64
  ) {
    return { results: [], lockedCount: 0, unlocked: false, error: "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { results: [], lockedCount: 0, unlocked: false, error: "Not authenticated" };
  // Resolve practice area slug from DB; fall back to CATEGORY_SLUG_MAP if unavailable
  let practiceAreaSlug = CATEGORY_SLUG_MAP[track]?.[category] ?? "corporate-formation";
  try {
    const { data: mapRow } = await supabase
      .from("legal_category_practice_area_map")
      .select("practice_area_slug")
      .eq("track", track)
      .eq("category_key", category)
      .single();
    if (mapRow?.practice_area_slug) {
      practiceAreaSlug = mapRow.practice_area_slug as string;
    }
  } catch {
    // proceed with CATEGORY_SLUG_MAP fallback
  }

  const allFirms = await loadMatchableFirms(supabase, practiceAreaSlug);

  const allResults = matchFirmsV2(track, category, answers, allFirms, practiceAreaSlug);

  // Save before returning so the dashboard and past-result links are immediately consistent.
  const submissionId = await saveIntakeSubmissionV2(track, category, categoryLabel, answers, allResults, practiceAreaSlug);
  const intakeUnlocked = await hasDurableIntakeUnlock(supabase, user.id, submissionId);

  return {
    ...publicResultsForAccess(allResults, categoryLabel, intakeUnlocked),
    submissionId,
  };
}

// Re-runs matching for a past submission server-side, enforcing the same
// access-level truncation as runMatchingV2.
export async function runMatchingForSubmission(submissionId: string): Promise<{
  results: PublicMatchResult[];
  lockedCount: number;
  unlocked?: boolean;
  categorySlug: string;
  categoryName: string;
  intakeDate: string;
  error?: string;
}> {
  const empty = { results: [] as PublicMatchResult[], lockedCount: 0, unlocked: false, categorySlug: "", categoryName: "", intakeDate: "" };

  if (!submissionId || typeof submissionId !== "string") {
    return { ...empty, error: "Invalid submission ID" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ...empty, error: "Not authenticated" };
  const submission = await loadOwnedSubmission(supabase, user.id, submissionId);
  if (!submission) return { ...empty, error: "Not found" };
  const intakeUnlocked = await hasDurableIntakeUnlock(supabase, user.id, submissionId);

  // Use practice_area_slug from submission; fall back to category_slug for legacy rows
  const practiceAreaSlug = (submission.practice_area_slug ?? submission.category_slug) as string;

  const allFirms = await loadMatchableFirms(supabase, practiceAreaSlug);

  const track = (submission.track ?? "") as string;
  const category = submissionCategory(submission);
  const answers = submission.answers as IntakeAnswers;
  const allResults = matchFirmsV2(track, category, answers, allFirms, practiceAreaSlug);
  const publicResults = publicResultsForAccess(
    allResults,
    submission.category_label ?? submission.category_slug,
    intakeUnlocked
  );

  return {
    ...publicResults,
    categorySlug: submission.category_slug,
    categoryName: submission.category_label ?? submission.category_slug,
    intakeDate: submission.created_at,
  };
}

export async function getPreviewUnlockDestination(submissionId?: string | null): Promise<{
  destination: string;
  firmId?: string;
  error?: string;
}> {
  if (!submissionId) return { destination: "/results" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { destination: "/results", error: "Not authenticated" };

  const submission = await loadOwnedSubmission(supabase, user.id, submissionId);
  if (!submission) return { destination: "/results", error: "Not found" };

  return { destination: `/results/${submissionId}` };
}

export async function getFirmProfileMatchContext(
  firmId: string,
  submissionId?: string | null
): Promise<FirmProfileMatchContext | null> {
  if (!submissionId) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const intakeUnlocked = await hasDurableIntakeUnlock(supabase, user.id, submissionId);
  if (!intakeUnlocked) return null;

  const submission = await loadOwnedSubmission(supabase, user.id, submissionId);
  if (!submission) return null;

  const practiceAreaSlug = (submission.practice_area_slug ?? submission.category_slug) as string;
  const allFirms = await loadMatchableFirms(supabase, practiceAreaSlug);
  const track = (submission.track ?? "") as string;
  const category = submissionCategory(submission);
  const answers = submission.answers as IntakeAnswers;
  const results = matchFirmsV2(track, category, answers, allFirms, practiceAreaSlug);
  const match = results.find((result) => result.firm.id === firmId);
  if (!match) return null;

  const prepared = buildPreparedMaterials({
    track,
    category,
    categoryName: submission.category_label ?? submission.category_slug,
    firmName: match.firm.name,
    answers,
  });

  return {
    intakeId: submissionId,
    categoryName: prepared.categoryName,
    score: match.score,
    reasons: match.reasons,
    matchedCriteria: match.matchedCriteria,
    missedCriteria: match.missedCriteria,
    contactRole: prepared.contactRole,
    prepared,
  };
}
