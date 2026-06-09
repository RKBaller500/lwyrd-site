"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./audit";

const SLUG_RE = /^[a-z0-9-]+$/;

function validateCategory(data: CategoryInput): string | null {
  if (!data.slug || !SLUG_RE.test(data.slug) || data.slug.length > 64)
    return "slug must be lowercase letters, numbers, and hyphens, max 64 chars";
  if (!data.name || data.name.trim().length === 0 || data.name.length > 128)
    return "name is required and must be under 128 chars";
  if (data.shortDescription.length > 500)
    return "shortDescription must be under 500 chars";
  if (data.fullDescription.length > 5000)
    return "fullDescription must be under 5000 chars";
  return null;
}

export interface CategoryInput {
  slug: string;
  name: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  whatFirmsDo: string;
  serviceExamples: string[];
  heroTag: string;
}

function toDbRow(data: CategoryInput) {
  return {
    slug: data.slug,
    name: data.name,
    icon: data.icon,
    short_description: data.shortDescription,
    full_description: data.fullDescription,
    what_firms_do: data.whatFirmsDo,
    service_examples: data.serviceExamples,
    hero_tag: data.heroTag,
  };
}

export async function createCategory(
  data: CategoryInput
): Promise<{ error?: string }> {
  const validationError = validateCategory(data);
  if (validationError) return { error: validationError };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("legal_categories").insert(toDbRow(data));
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "create_category", targetType: "category", targetId: data.slug, after: toDbRow(data) as Record<string, unknown> });

  revalidatePath("/admin/categories");
  revalidatePath("/browse");
  return {};
}

export async function updateCategory(
  slug: string,
  data: CategoryInput
): Promise<{ error?: string }> {
  if (!slug || !SLUG_RE.test(slug)) return { error: "invalid slug" };
  const validationError = validateCategory(data);
  if (validationError) return { error: validationError };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("legal_categories")
    .update(toDbRow(data))
    .eq("slug", slug);
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "update_category", targetType: "category", targetId: slug, after: toDbRow(data) as Record<string, unknown> });

  revalidatePath("/admin/categories");
  revalidatePath(`/services/${slug}`);
  revalidatePath("/browse");
  return {};
}

export async function deleteCategory(slug: string): Promise<{ error?: string }> {
  if (!slug || !SLUG_RE.test(slug)) return { error: "invalid slug" };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("legal_categories")
    .delete()
    .eq("slug", slug);
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "delete_category", targetType: "category", targetId: slug });

  revalidatePath("/admin/categories");
  revalidatePath("/browse");
  return {};
}
