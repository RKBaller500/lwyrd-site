"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./audit";

function validateCriterion(data: AssessmentCriterionInput): string | null {
  if (!data.label || data.label.trim().length === 0 || data.label.length > 128)
    return "label is required and must be under 128 chars";
  if (data.description && data.description.length > 500)
    return "description must be under 500 chars";
  if (typeof data.display_order !== "number" || !Number.isInteger(data.display_order) || data.display_order < 0)
    return "display_order must be a non-negative integer";
  return null;
}

export interface AssessmentCriterionInput {
  label: string;
  description: string;
  display_order: number;
  active: boolean;
}

export async function createAssessmentCriterion(
  data: AssessmentCriterionInput
): Promise<{ error?: string }> {
  const validationError = validateCriterion(data);
  if (validationError) return { error: validationError };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const row = { label: data.label, description: data.description || null, display_order: data.display_order, active: data.active };
  const { error } = await db.from("assessment_criteria").insert(row);

  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "create_criterion", targetType: "criterion", after: row });

  revalidatePath("/admin/criteria");
  return {};
}

export async function updateAssessmentCriterion(
  id: string,
  data: AssessmentCriterionInput
): Promise<{ error?: string }> {
  if (!id || id.trim().length === 0) return { error: "id is required" };
  const validationError = validateCriterion(data);
  if (validationError) return { error: validationError };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const row = { label: data.label, description: data.description || null, display_order: data.display_order, active: data.active };
  const { error } = await db
    .from("assessment_criteria")
    .update(row)
    .eq("id", id);

  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "update_criterion", targetType: "criterion", targetId: id, after: row });

  revalidatePath("/admin/criteria");
  return {};
}

export async function deleteAssessmentCriterion(
  id: string
): Promise<{ error?: string }> {
  if (!id || id.trim().length === 0) return { error: "id is required" };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("assessment_criteria").delete().eq("id", id);
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "delete_criterion", targetType: "criterion", targetId: id });

  revalidatePath("/admin/criteria");
  return {};
}
