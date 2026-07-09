import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";

export const metadata = { title: "New Post, Admin" };

export default function NewBlogPostPage() {
  return (
    <div>
      <Link href="/admin/blog" className="adm-back">
        <ArrowLeft size={14} /> Back to blog
      </Link>
      <AdminHeader
        eyebrow="Content"
        title="New post"
        subtitle="Draft your article, then save it as a draft or publish it live."
      />
      <BlogPostForm mode="create" />
    </div>
  );
}
