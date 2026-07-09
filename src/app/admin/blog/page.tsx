import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus, Newspaper } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import BlogPostsTable, {
  type BlogPostRowLite,
} from "@/components/admin/blog/BlogPostsTable";

export const metadata = { title: "Blog, Admin" };

export default async function AdminBlogPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("blog_posts")
    .select(
      "id, slug, title, category, status, is_editors_pick, read_time_minutes, published_at, updated_at"
    )
    .order("updated_at", { ascending: false });

  const posts = (data ?? []) as BlogPostRowLite[];

  return (
    <div>
      <AdminHeader
        eyebrow="Content"
        title="Blog"
        subtitle="Write, edit, publish, and manage every article on the LWYRD blog."
        actions={
          <Link href="/admin/blog/new" className="adm-btn adm-btn-primary">
            <Plus size={16} strokeWidth={2} />
            New post
          </Link>
        }
      />

      {posts.length === 0 ? (
        <div className="adm-empty">
          <span className="adm-stat-ico">
            <Newspaper size={20} strokeWidth={1.75} />
          </span>
          <h3>No posts yet</h3>
          <p>
            Publish your first article to start building the LWYRD blog. Drafts
            stay private until you publish them.
          </p>
          <Link href="/admin/blog/new" className="adm-btn adm-btn-primary">
            <Plus size={16} strokeWidth={2} />
            Write your first post
          </Link>
        </div>
      ) : (
        <BlogPostsTable posts={posts} />
      )}
    </div>
  );
}
