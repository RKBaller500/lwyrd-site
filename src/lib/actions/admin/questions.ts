"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./audit";

const VALID_TYPES = ["single-select", "multi-select", "text", "scale", "budget-range"] as const;
const SLUG_RE = /^[a-z0-9-]+$/;

function validateQuestion(data: QuestionInput): string | null {
  if (!data.question || data.question.trim().length === 0 || data.question.length > 500)
    return "question text is required and must be under 500 chars";
  if (!data.categorySlug || !SLUG_RE.test(data.categorySlug))
    return "categorySlug must be lowercase letters, numbers, and hyphens";
  if (!(VALID_TYPES as readonly string[]).includes(data.type))
    return `type must be one of: ${VALID_TYPES.join(", ")}`;
  if (data.subtext && data.subtext.length > 500)
    return "subtext must be under 500 chars";
  return null;
}

export interface QuestionInput {
  id: string;
  categorySlug: string;
  displayOrder: number;
  question: string;
  subtext: string;
  type: "single-select" | "multi-select" | "text" | "scale" | "budget-range";
  options: string[];
  minValue: number | null;
  maxValue: number | null;
  stepValue: number | null;
  required: boolean;
}

function toDbRow(data: QuestionInput) {
  return {
    id: data.id,
    category_slug: data.categorySlug,
    display_order: data.displayOrder,
    question: data.question,
    subtext: data.subtext || null,
    type: data.type,
    options: data.options.length > 0 ? data.options : null,
    min_value: data.minValue,
    max_value: data.maxValue,
    step_value: data.stepValue,
    required: data.required,
  };
}

export async function createQuestion(
  data: QuestionInput
): Promise<{ error?: string }> {
  const validationError = validateQuestion(data);
  if (validationError) return { error: validationError };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("intake_questions").insert(toDbRow(data));
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "create_question", targetType: "question", targetId: data.id, after: toDbRow(data) as Record<string, unknown> });

  revalidatePath("/admin/questions");
  return {};
}

export async function updateQuestion(
  id: string,
  data: QuestionInput
): Promise<{ error?: string }> {
  if (!id || id.trim().length === 0) return { error: "id is required" };
  const validationError = validateQuestion(data);
  if (validationError) return { error: validationError };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("intake_questions")
    .update(toDbRow(data))
    .eq("id", id);
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "update_question", targetType: "question", targetId: id, after: toDbRow(data) as Record<string, unknown> });

  revalidatePath("/admin/questions");
  return {};
}

export async function deleteQuestion(id: string): Promise<{ error?: string }> {
  if (!id || id.trim().length === 0) return { error: "id is required" };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("intake_questions")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "delete_question", targetType: "question", targetId: id });

  revalidatePath("/admin/questions");
  return {};
}
