"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./audit";
import { readingTimeMinutes } from "@/lib/blog/markdown";

const SLUG_RE = /^[a-z0-9-]+$/;
const CATEGORIES = ["news", "advice", "general"] as const;
const STATUSES = ["draft", "published"] as const;
const BLOG_IMAGE_BUCKET = "blog-images";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

function sanitizePathPart(value: string, fallback: string) {
  const clean = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return clean || fallback;
}

export async function uploadBlogImage(
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file to upload." };
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    return {
      error: "Upload a JPEG, PNG, WebP, GIF, or AVIF image.",
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be 8 MB or smaller." };
  }

  const db = createAdminClient();
  const slug = sanitizePathPart(String(formData.get("slug") ?? ""), "draft");
  const originalName = sanitizePathPart(
    file.name.replace(/\.[^.]+$/, ""),
    "cover"
  );
  const path = `${slug}/${Date.now()}-${crypto.randomUUID()}-${originalName}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await db.storage
    .from(BLOG_IMAGE_BUCKET)
    .upload(path, bytes, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) return { error: error.message };

  const { data } = db.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(path);
  const url = data.publicUrl;

  void logAdminAction({
    actorId: actor.id,
    action: "upload_blog_image",
    targetType: "blog_image",
    targetId: path,
    after: { url, contentType: file.type, size: file.size },
  });

  return { url };
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
