// Public blog reads. These run in server components against the anon client,
// which — through RLS — only ever returns published posts.
import { createClient } from "@supabase/supabase-js";
import type { BlogPost, BusinessType, BusinessFocus, ContentType } from "@/types/blog";

// A plain anon client without cookies. Public content only; RLS enforces that
// unauthenticated reads see published rows exclusively.
function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"
  );
}

// Shape of a blog_posts row as returned by Supabase.
export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author_name: string;
  author_title: string | null;
  category: string;
  business_types: string[] | null;
  business_focus: string[] | null;
  is_editors_pick: boolean;
  is_weekly_intake: boolean;
  read_time_minutes: number;
  thumbnail_accent: string;
  thumbnail_image: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapBlogRow(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    author: {
      name: row.author_name,
      title: row.author_title ?? undefined,
    },
    publishedAt: row.published_at ?? row.created_at,
    category: (row.category as ContentType) ?? "news",
    businessTypes: (row.business_types ?? []) as BusinessType[],
    businessFocus: (row.business_focus ?? []) as BusinessFocus[],
    isEditorsPick: row.is_editors_pick,
    isWeeklyIntake: row.is_weekly_intake,
    readTimeMinutes: row.read_time_minutes,
    thumbnailAccent: row.thumbnail_accent,
    thumbnailImage: row.thumbnail_image ?? undefined,
    status: row.status === "published" ? "published" : "draft",
    updatedAt: row.updated_at,
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return (data as BlogPostRow[]).map(mapBlogRow);
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return mapBlogRow(data as BlogPostRow);
}

export async function getRelatedPosts(
  post: BlogPost,
  limit = 3
): Promise<BlogPost[]> {
  const all = await getPublishedPosts();
  return all
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      // Prefer same category, then shared business types.
      const aScore =
        (a.category === post.category ? 2 : 0) +
        a.businessTypes.filter((t) => post.businessTypes.includes(t)).length;
      const bScore =
        (b.category === post.category ? 2 : 0) +
        b.businessTypes.filter((t) => post.businessTypes.includes(t)).length;
      return bScore - aScore;
    })
    .slice(0, limit);
}

export async function getAllPublishedSlugs(): Promise<{ slug: string }[]> {
  const db = createPublicClient();
  const { data } = await db
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((r) => ({ slug: r.slug as string }));
}
