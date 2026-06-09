"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./audit";

const VALID_SIZES = ["boutique", "mid-size", "large"] as const;
const VALID_BILLING = ["hourly", "retainer", "flat-fee", "hybrid"] as const;
const VALID_RESPONSE_TIMES = ["same-day", "24h", "48h", "72h"] as const;

function validateFirm(data: FirmInput): string | null {
  if (!data.name || data.name.trim().length === 0 || data.name.length > 128)
    return "name is required and must be under 128 chars";
  if (!data.id || data.id.trim().length === 0)
    return "id is required";
  if (data.tagline && data.tagline.length > 200)
    return "tagline must be under 200 chars";
  if (data.description && data.description.length > 5000)
    return "description must be under 5000 chars";
  if (!(VALID_SIZES as readonly string[]).includes(data.size))
    return `size must be one of: ${VALID_SIZES.join(", ")}`;
  if (!(VALID_BILLING as readonly string[]).includes(data.billingModel))
    return `billingModel must be one of: ${VALID_BILLING.join(", ")}`;
  if (!(VALID_RESPONSE_TIMES as readonly string[]).includes(data.responseTime))
    return `responseTime must be one of: ${VALID_RESPONSE_TIMES.join(", ")}`;
  if (typeof data.budgetMin !== "number" || typeof data.budgetMax !== "number" || data.budgetMin > data.budgetMax)
    return "budgetMin and budgetMax must be valid numbers with min ≤ max";
  return null;
}

export interface AttorneyInput {
  name: string;
  title: string;
  bio: string;
  barAdmissions: string[];
}

export interface AssessmentItemInput {
  criterionId: string;
  passed: boolean;
  note: string;
}

export interface FirmInput {
  id: string;
  name: string;
  tagline: string;
  location: string;
  founded: number;
  size: "boutique" | "mid-size" | "large";
  practiceAreas: string[];
  industries: string[];
  companyStages: string[];
  budgetMin: number;
  budgetMax: number;
  billingModel: "hourly" | "retainer" | "flat-fee" | "hybrid";
  hourlyRate: number | null;
  responseTime: "same-day" | "24h" | "48h" | "72h";
  languages: string[];
  description: string;
  strengths: string[];
  overallScore: number;
  verified: boolean;
  logoUrl: string | null;
  attorneys: AttorneyInput[];
  assessmentItems: AssessmentItemInput[];
}

function toDbRow(data: FirmInput) {
  return {
    id: data.id,
    name: data.name,
    tagline: data.tagline,
    location: data.location,
    founded: data.founded,
    size: data.size,
    practice_areas: data.practiceAreas,
    industries: data.industries,
    company_stages: data.companyStages,
    budget_min: data.budgetMin,
    budget_max: data.budgetMax,
    billing_model: data.billingModel,
    hourly_rate: data.hourlyRate,
    response_time: data.responseTime,
    languages: data.languages,
    description: data.description,
    strengths: data.strengths,
    overall_score: data.overallScore,
    verified: data.verified,
    logo_url: data.logoUrl,
  };
}

async function saveRelations(
  firmId: string,
  attorneys: AttorneyInput[],
  assessmentItems: AssessmentItemInput[]
) {
  const db = createAdminClient();

  await db.from("attorneys").delete().eq("firm_id", firmId);
  if (attorneys.length > 0) {
    await db.from("attorneys").insert(
      attorneys.map((a, i) => ({
        firm_id: firmId,
        name: a.name,
        title: a.title,
        bio: a.bio,
        bar_admissions: a.barAdmissions,
        display_order: i,
      }))
    );
  }

  await db.from("firm_assessment_items").delete().eq("firm_id", firmId);
  if (assessmentItems.length > 0) {
    await db.from("firm_assessment_items").insert(
      assessmentItems.map((item, i) => ({
        firm_id: firmId,
        criterion_id: item.criterionId,
        passed: item.passed,
        note: item.note || null,
        display_order: i,
      }))
    );
  }
}

export async function createFirm(
  data: FirmInput
): Promise<{ error?: string }> {
  const validationError = validateFirm(data);
  if (validationError) return { error: validationError };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("firms").insert(toDbRow(data));
  if (error) return { error: error.message };

  await saveRelations(data.id, data.attorneys, data.assessmentItems);
  void logAdminAction({ actorId: actor.id, action: "create_firm", targetType: "firm", targetId: data.id, after: toDbRow(data) as Record<string, unknown> });

  revalidatePath("/admin/firms");
  revalidatePath("/browse");
  return {};
}

export async function updateFirm(
  id: string,
  data: FirmInput
): Promise<{ error?: string }> {
  if (!id || id.trim().length === 0) return { error: "id is required" };
  const validationError = validateFirm(data);
  if (validationError) return { error: validationError };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("firms").update(toDbRow(data)).eq("id", id);
  if (error) return { error: error.message };

  await saveRelations(id, data.attorneys, data.assessmentItems);
  void logAdminAction({ actorId: actor.id, action: "update_firm", targetType: "firm", targetId: id, after: toDbRow(data) as Record<string, unknown> });

  revalidatePath("/admin/firms");
  revalidatePath(`/firms/${id}`);
  return {};
}

export async function deleteFirm(id: string): Promise<{ error?: string }> {
  if (!id || id.trim().length === 0) return { error: "id is required" };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("firms").delete().eq("id", id);
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "delete_firm", targetType: "firm", targetId: id });

  revalidatePath("/admin/firms");
  revalidatePath("/browse");
  return {};
}
