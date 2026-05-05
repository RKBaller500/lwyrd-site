"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("legal_categories").insert(toDbRow(data));
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/browse");
  return {};
}

export async function updateCategory(
  slug: string,
  data: CategoryInput
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("legal_categories")
    .update(toDbRow(data))
    .eq("slug", slug);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath(`/services/${slug}`);
  revalidatePath("/browse");
  return {};
}

export async function deleteCategory(slug: string): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("legal_categories")
    .delete()
    .eq("slug", slug);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/browse");
  return {};
}
