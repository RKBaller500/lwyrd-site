"use server";

import { createClient } from "@/lib/supabase/server";
import type { IntakeAnswers, MatchResult } from "@/types";

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

// V2 action — writes to general table + track-specific table
export async function saveIntakeSubmissionV2(
  track: string,
  category: string,
  categoryLabel: string,
  v2Answers: Record<string, string | string[] | number>,
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

  // Write general submission record
  const { data: generalRow, error: generalError } = await supabase
    .from("intake_submissions")
    .insert({
      user_id: user.id,
      category_slug: `${track}/${category}`,
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
