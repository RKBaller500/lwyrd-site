"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("intake_questions").insert(toDbRow(data));
  if (error) return { error: error.message };

  revalidatePath("/admin/questions");
  return {};
}

export async function updateQuestion(
  id: string,
  data: QuestionInput
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("intake_questions")
    .update(toDbRow(data))
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/questions");
  return {};
}

export async function deleteQuestion(id: string): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("intake_questions")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/questions");
  return {};
}
