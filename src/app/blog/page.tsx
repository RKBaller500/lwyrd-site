import type { Metadata } from "next";
import "@/styles/lwyrd-ds.css";
import "@/styles/blog-site.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import BlogListing from "@/components/blog/BlogListing";
import { getPublishedPosts } from "@/lib/supabase/blog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | LWYRD",
  description:
    "Practical legal guides, founder notes, and plain-English explainers for people and businesses deciding what to do next.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="lwyrd-ds ds-page blog-page">
      <MarketingNav current="blog" />
      <BlogListing posts={posts} />
      <MarketingFooter />
    </div>
  );
}
