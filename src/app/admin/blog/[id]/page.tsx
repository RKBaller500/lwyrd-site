import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminHeader from "@/components/admin/AdminHeader";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import type { BlogPostInput } from "@/lib/actions/admin/blog";
import type { BlogPostRow } from "@/lib/supabase/blog";

export const metadata = { title: "Edit Post, Admin" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();
  const { data } = await db
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const row = data as BlogPostRow;

  const initial: BlogPostInput = {
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    content: row.content ?? "",
    authorName: row.author_name ?? "LWYRD Editorial",
    authorTitle: row.author_title ?? "",
    category: (row.category as BlogPostInput["category"]) ?? "news",
    businessTypes: row.business_types ?? [],
    businessFocus: row.business_focus ?? [],
    isEditorsPick: row.is_editors_pick,
    isWeeklyIntake: row.is_weekly_intake,
    thumbnailAccent: row.thumbnail_accent ?? "#002452",
    thumbnailImage: row.thumbnail_image ?? "",
    status: (row.status as BlogPostInput["status"]) ?? "draft",
  };

  return (
    <div>
      <Link href="/admin/blog" className="adm-back">
        <ArrowLeft size={14} /> Back to blog
      </Link>
      <AdminHeader
        eyebrow="Content"
        title="Edit post"
        subtitle={
          <>
            Editing <strong>{row.title}</strong>
          </>
        }
      />
      <BlogPostForm mode="edit" postId={row.id} initial={initial} />
    </div>
  );
}
