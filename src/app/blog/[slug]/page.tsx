import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import "@/styles/lwyrd-ds.css";
import "@/styles/blog-site.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import {
  getPublishedPostBySlug,
  getRelatedPosts,
  getAllPublishedSlugs,
} from "@/lib/supabase/blog";
import { renderMarkdown } from "@/lib/blog/markdown";
import type { BlogPost } from "@/types/blog";

export const revalidate = 60;

export async function generateStaticParams() {
  return getAllPublishedSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | LWYRD`,
    description: post.description,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function tagLabel(post: BlogPost): string {
  if (post.isWeeklyIntake) return "The Intake";
  return post.category === "advice" ? "Advice" : "News";
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const html = renderMarkdown(post.content);

  return (
    <div className="lwyrd-ds ds-page blog-page">
      <MarketingNav current="blog" />
      <main>
        <div
          className="post-hero-media"
          style={{ background: post.thumbnailAccent || "#002452" }}
        >
          {post.thumbnailImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.thumbnailImage} alt={post.title} />
          ) : null}
        </div>

        <article className="article-wrap">
          <Link href="/blog" className="article-back">
            <ArrowLeft size={14} /> Back to blog
          </Link>

          <div className="article-head">
            <div className="meta">
              <span className="tag">{tagLabel(post)}</span>
            </div>
            <h1>{post.title}</h1>
            {post.description ? (
              <p className="article-lede">{post.description}</p>
            ) : null}
          </div>

          <div className="article-byline">
            <div>
              <div className="who">{post.author.name}</div>
              <div className="when">
                {post.author.title ? `${post.author.title} · ` : ""}
                {formatDate(post.publishedAt)}
              </div>
            </div>
            <span className="read">
              <Clock size={13} /> {post.readTimeMinutes} min read
            </span>
          </div>

          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {related.length > 0 ? (
          <section className="related">
            <div className="wrap">
              <h2>More from the blog</h2>
              <div className="post-grid">
                {related.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
                    <div
                      className="post-img"
                      style={
                        p.thumbnailImage
                          ? undefined
                          : { background: p.thumbnailAccent || "#002452" }
                      }
                    >
                      {p.thumbnailImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnailImage} alt={p.title} />
                      ) : null}
                    </div>
                    <div className="post-in">
                      <div className="meta">
                        <span className="tag">{tagLabel(p)}</span>
                      </div>
                      <h3>{p.title}</h3>
                      <p>{p.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <MarketingFooter />
    </div>
  );
}
