"use server";

import { createClient } from "@/lib/supabase/server";
import type { IntakeAnswers, MatchResult } from "@/types";
import { matchFirmsV2 } from "@/lib/matching";
import { mapDbFirmToFirm } from "@/lib/supabase/mappers";
import type { DbFirm } from "@/lib/supabase/types";
import { firms as localFirms } from "@/data/firms";
import { CATEGORY_SLUG_MAP } from "@/data/intakeV2";

// Legacy action — kept for backward compatibility
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

// V2 action — writes to general table + track-specific table + matches table
export async function saveIntakeSubmissionV2(
  track: string,
  category: string,
  categoryLabel: string,
  v2Answers: Record<string, string | string[] | number>,
  matchResults: MatchResult[],
  practiceAreaSlug: string
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
    // Swallow — never block UX
    return;
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
        // legacy columns — keep writing until told otherwise
        score: result.score,
        rank,
      };
    });
    await supabase.from("matches").insert(matchRows);
  }
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
// Free users receive the top result only; paying users receive all results.
// This prevents full match data from ever reaching the client for unpaid sessions.
export async function runMatchingV2(
  track: string,
  category: string,
  categoryLabel: string,
  answers: IntakeAnswers
): Promise<{ results: MatchResult[]; lockedCount: number; error?: string }> {
  const VALID_TRACKS = ["startup", "individual", "small_business"] as const;
  if (
    typeof track !== "string" ||
    !(VALID_TRACKS as readonly string[]).includes(track) ||
    typeof category !== "string" ||
    !category ||
    category.length > 64
  ) {
    return { results: [], lockedCount: 0, error: "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { results: [], lockedCount: 0, error: "Not authenticated" };

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

  // Fetch firms server-side; fall back to local data if unavailable
  let allFirms = localFirms;
  try {
    const { data, error } = await supabase
      .from("firms")
      .select("*, attorneys(*), firm_assessment_items(*)");
    if (!error && data && data.length > 0) {
      allFirms = (data as DbFirm[]).map(mapDbFirmToFirm);
    }
  } catch {
    // proceed with local firms
  }

  // Filter to firms that serve this practice area via the normalized join table
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

  const allResults = matchFirmsV2(track, category, answers, allFirms, practiceAreaSlug);

  // Check access level to determine how many results to return
  const { data: profile } = await supabase
    .from("profiles")
    .select("access_level")
    .eq("id", user.id)
    .single();
  const hasAccess =
    profile?.access_level === "subscription" || profile?.access_level === "org";

  const results = hasAccess ? allResults : allResults.slice(0, 1);
  const lockedCount = hasAccess ? 0 : Math.max(0, allResults.length - 1);

  // Save submission with full results for analytics (fire-and-forget)
  void saveIntakeSubmissionV2(track, category, categoryLabel, answers, allResults, practiceAreaSlug);

  return { results, lockedCount };
}

// Re-runs matching for a past submission server-side, enforcing the same
// access-level truncation as runMatchingV2.
export async function runMatchingForSubmission(submissionId: string): Promise<{
  results: MatchResult[];
  lockedCount: number;
  categorySlug: string;
  categoryName: string;
  intakeDate: string;
  error?: string;
}> {
  const empty = { results: [] as MatchResult[], lockedCount: 0, categorySlug: "", categoryName: "", intakeDate: "" };

  if (!submissionId || typeof submissionId !== "string") {
    return { ...empty, error: "Invalid submission ID" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ...empty, error: "Not authenticated" };

  // Ownership enforced server-side — users can only load their own submissions
  const { data: submission, error: subError } = await supabase
    .from("intake_submissions")
    .select("track, category_slug, practice_area_slug, category_label, answers, created_at")
    .eq("id", submissionId)
    .eq("user_id", user.id)
    .single();

  if (subError || !submission) return { ...empty, error: "Not found" };

  // Use practice_area_slug from submission; fall back to category_slug for legacy rows
  const practiceAreaSlug = (submission.practice_area_slug ?? submission.category_slug) as string;

  let allFirms = localFirms;
  try {
    const { data, error } = await supabase
      .from("firms")
      .select("*, attorneys(*), firm_assessment_items(*)");
    if (!error && data && data.length > 0) {
      allFirms = (data as DbFirm[]).map(mapDbFirmToFirm);
    }
  } catch {
    // proceed with local firms
  }

  // Filter to firms that serve this practice area via the normalized join table
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

  const answers = submission.answers as IntakeAnswers;
  const allResults = matchFirmsV2(submission.track, submission.category_slug, answers, allFirms, practiceAreaSlug);

  const { data: profile } = await supabase
    .from("profiles")
    .select("access_level")
    .eq("id", user.id)
    .single();
  const hasAccess =
    profile?.access_level === "subscription" || profile?.access_level === "org";

  return {
    results: hasAccess ? allResults : allResults.slice(0, 1),
    lockedCount: hasAccess ? 0 : Math.max(0, allResults.length - 1),
    categorySlug: submission.category_slug,
    categoryName: submission.category_label ?? submission.category_slug,
    intakeDate: submission.created_at,
  };
}
