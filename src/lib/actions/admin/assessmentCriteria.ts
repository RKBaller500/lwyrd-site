"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface AssessmentCriterionInput {
  label: string;
  description: string;
  display_order: number;
  active: boolean;
}

export async function createAssessmentCriterion(
  data: AssessmentCriterionInput
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("assessment_criteria").insert({
    label: data.label,
    description: data.description || null,
    display_order: data.display_order,
    active: data.active,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/criteria");
  return {};
}

export async function updateAssessmentCriterion(
  id: string,
  data: AssessmentCriterionInput
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("assessment_criteria")
    .update({
      label: data.label,
      description: data.description || null,
      display_order: data.display_order,
      active: data.active,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/criteria");
  return {};
}

export async function deleteAssessmentCriterion(
  id: string
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("assessment_criteria").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/criteria");
  return {};
}
