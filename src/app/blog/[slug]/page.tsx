import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReadingProgress from "@/components/blog/ReadingProgress";
import Link from "next/link";
import { BLOG_POSTS, BUSINESS_TYPE_LABELS } from "@/data/blogPosts";
import { ArrowLeft, Clock } from "lucide-react";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | LWYRD Insights`,
    description: post.description,
  };
}

const THUMBNAIL_PATTERNS = [
  `repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 29px),
   repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 29px)`,
  `repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.07) 12px, rgba(255,255,255,0.07) 13px)`,
  `radial-gradient(ellipse at 30% 60%, rgba(255,255,255,0.12) 0%, transparent 55%),
   radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 45%)`,
  `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px),
   repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px)`,
  `repeating-linear-gradient(180deg, transparent, transparent 18px, rgba(255,255,255,0.05) 18px, rgba(255,255,255,0.05) 36px)`,
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function renderContent(md: string): string {
  return md
    // h3
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    // h2
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // italic / em (including *…* used for The Intake byline)
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // hr
    .replace(/^---$/gm, "<hr />")
    // blank lines → paragraph breaks
    .split(/\n{2,}/)
    .map((chunk) => {
      const c = chunk.trim();
      if (!c) return "";
      if (/^<(h[23]|hr|ul|ol|li)/.test(c)) return c;
      return `<p>${c.replace(/\n/g, " ")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const patternIndex = parseInt(post.id, 10) % THUMBNAIL_PATTERNS.length;
  const pattern = THUMBNAIL_PATTERNS[patternIndex] ?? THUMBNAIL_PATTERNS[0]!;
  const categoryLabel = post.isWeeklyIntake
    ? "The Intake"
    : post.category === "advice"
      ? "Advice"
      : "News";

  const html = renderContent(post.content);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1C]">
      <ReadingProgress />
      <Navbar />
      <main className="flex-1">
        {/* Hero thumbnail */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "clamp(200px, 30vw, 320px)" }}
        >
          {post.thumbnailImage ? (
            <Image
              src={post.thumbnailImage}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: post.thumbnailAccent, backgroundImage: pattern }}
            />
          )}
        </div>

        {/* Article container */}
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#8A93A6] hover:text-[#E6EAF2] transition-colors mb-8"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Back to Insights
          </Link>

          {/* Category + Editor's Pick */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#E6EAF2]/50 bg-white/8 px-2.5 py-1 rounded-full">
              {categoryLabel}
            </span>
            {post.businessTypes.map((bt) => (
              <span
                key={bt}
                className="text-[10px] font-medium text-[#8A93A6] bg-slate-100 px-2.5 py-1 rounded-full"
              >
                {BUSINESS_TYPE_LABELS[bt]}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl text-[#E6EAF2] leading-tight mb-4"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-[#8A93A6] leading-relaxed mb-6 border-l-[3px] border-[#002452]/20 pl-4">
            {post.description}
          </p>

          {/* Author + date */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#1F2A3D]">
            <div>
              <p className="text-sm font-semibold text-[#E6EAF2]">{post.author.name}</p>
              {post.author.title && (
                <p className="text-xs text-[#8A93A6]">{post.author.title}</p>
              )}
              <p className="text-xs text-[#8A93A6] mt-0.5">{formatDate(post.publishedAt)}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#8A93A6]">
              <Clock size={12} strokeWidth={1.75} />
              {post.readTimeMinutes} min read
            </span>
          </div>

          {/* Body */}
          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
