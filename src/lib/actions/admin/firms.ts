"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("firms").insert(toDbRow(data));
  if (error) return { error: error.message };

  await saveRelations(data.id, data.attorneys, data.assessmentItems);

  revalidatePath("/admin/firms");
  revalidatePath("/browse");
  return {};
}

export async function updateFirm(
  id: string,
  data: FirmInput
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("firms").update(toDbRow(data)).eq("id", id);
  if (error) return { error: error.message };

  await saveRelations(id, data.attorneys, data.assessmentItems);

  revalidatePath("/admin/firms");
  revalidatePath(`/firms/${id}`);
  return {};
}

export async function deleteFirm(id: string): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("firms").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/firms");
  revalidatePath("/browse");
  return {};
}
