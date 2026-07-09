"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./audit";
import { readingTimeMinutes } from "@/lib/blog/markdown";

const SLUG_RE = /^[a-z0-9-]+$/;
const CATEGORIES = ["news", "advice"] as const;
const STATUSES = ["draft", "published"] as const;

export interface BlogPostInput {
  slug: string;
  title: string;
  description: string;
  content: string;
  authorName: string;
  authorTitle: string;
  category: (typeof CATEGORIES)[number];
  businessTypes: string[];
  businessFocus: string[];
  isEditorsPick: boolean;
  isWeeklyIntake: boolean;
  thumbnailAccent: string;
  thumbnailImage: string;
  status: (typeof STATUSES)[number];
}

function validate(data: BlogPostInput): string | null {
  if (!data.slug || !SLUG_RE.test(data.slug) || data.slug.length > 80)
    return "Slug must be lowercase letters, numbers, and hyphens (max 80 chars).";
  if (!data.title.trim() || data.title.length > 200)
    return "Title is required and must be under 200 characters.";
  if (data.description.length > 500)
    return "Description must be under 500 characters.";
  if (!CATEGORIES.includes(data.category)) return "Invalid category.";
  if (!STATUSES.includes(data.status)) return "Invalid status.";
  if (data.thumbnailImage && !/^https?:\/\//.test(data.thumbnailImage))
    return "Cover image must be a valid http(s) URL.";
  return null;
}

function toDbRow(data: BlogPostInput) {
  return {
    slug: data.slug,
    title: data.title.trim(),
    description: data.description.trim(),
    content: data.content,
    author_name: data.authorName.trim() || "LWYRD Editorial",
    author_title: data.authorTitle.trim() || null,
    category: data.category,
    business_types: data.businessTypes,
    business_focus: data.businessFocus,
    is_editors_pick: data.isEditorsPick,
    is_weekly_intake: data.isWeeklyIntake,
    read_time_minutes: readingTimeMinutes(data.content),
    thumbnail_accent: data.thumbnailAccent || "#002452",
    thumbnail_image: data.thumbnailImage.trim() || null,
    status: data.status,
  };
}

function revalidateBlog(slug: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export async function createBlogPost(
  data: BlogPostInput
): Promise<{ error?: string; id?: string }> {
  const err = validate(data);
  if (err) return { error: err };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const row = {
    ...toDbRow(data),
    // Stamp published_at the first time a post is published.
    published_at: data.status === "published" ? new Date().toISOString() : null,
  };

  const { data: inserted, error } = await db
    .from("blog_posts")
    .insert(row)
    .select("id")
    .single();

  if (error) return { error: error.message };

  void logAdminAction({
    actorId: actor.id,
    action: "create_blog_post",
    targetType: "blog_post",
    targetId: data.slug,
    after: row as Record<string, unknown>,
  });

  revalidateBlog(data.slug);
  return { id: inserted?.id as string };
}

export async function updateBlogPost(
  id: string,
  data: BlogPostInput
): Promise<{ error?: string }> {
  if (!id) return { error: "Missing post id." };
  const err = validate(data);
  if (err) return { error: err };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();

  // Preserve the original published_at across unpublish/republish; set it the
  // first time the post goes live.
  const { data: existing } = await db
    .from("blog_posts")
    .select("published_at, status")
    .eq("id", id)
    .single();

  let publishedAt = existing?.published_at ?? null;
  if (data.status === "published" && !publishedAt) {
    publishedAt = new Date().toISOString();
  }

  const row = { ...toDbRow(data), published_at: publishedAt };

  const { error } = await db.from("blog_posts").update(row).eq("id", id);
  if (error) return { error: error.message };

  void logAdminAction({
    actorId: actor.id,
    action: "update_blog_post",
    targetType: "blog_post",
    targetId: data.slug,
    after: row as Record<string, unknown>,
  });

  revalidateBlog(data.slug);
  return {};
}

export async function setBlogPostStatus(
  id: string,
  slug: string,
  status: "draft" | "published"
): Promise<{ error?: string }> {
  if (!id) return { error: "Missing post id." };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { data: existing } = await db
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .single();

  let publishedAt = existing?.published_at ?? null;
  if (status === "published" && !publishedAt) {
    publishedAt = new Date().toISOString();
  }

  const { error } = await db
    .from("blog_posts")
    .update({ status, published_at: publishedAt })
    .eq("id", id);
  if (error) return { error: error.message };

  void logAdminAction({
    actorId: actor.id,
    action: status === "published" ? "publish_blog_post" : "unpublish_blog_post",
    targetType: "blog_post",
    targetId: slug,
  });

  revalidateBlog(slug);
  return {};
}

export async function deleteBlogPost(
  id: string,
  slug: string
): Promise<{ error?: string }> {
  if (!id) return { error: "Missing post id." };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };

  void logAdminAction({
    actorId: actor.id,
    action: "delete_blog_post",
    targetType: "blog_post",
    targetId: slug,
  });

  revalidateBlog(slug);
  return {};
}
