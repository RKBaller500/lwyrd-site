"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/types/blog";
import { BUSINESS_TYPE_LABELS, BUSINESS_FOCUS_LABELS } from "@/data/blogPosts";


const THUMBNAIL_PATTERNS = [
  // Geometric grid
  `repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 29px),
   repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 29px)`,
  // Diagonal lines
  `repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.07) 12px, rgba(255,255,255,0.07) 13px)`,
  // Concentric-ish radials
  `radial-gradient(ellipse at 30% 60%, rgba(255,255,255,0.12) 0%, transparent 55%),
   radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 45%)`,
  // Cross-hatch
  `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px),
   repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px)`,
  // Horizontal bands
  `repeating-linear-gradient(180deg, transparent, transparent 18px, rgba(255,255,255,0.05) 18px, rgba(255,255,255,0.05) 36px)`,
];

function getThumbnailPattern(id: string): string {
  const index = parseInt(id, 10) % THUMBNAIL_PATTERNS.length;
  return THUMBNAIL_PATTERNS[index] ?? THUMBNAIL_PATTERNS[0]!;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const pattern = getThumbnailPattern(post.id);

  const firstBusinessType = post.businessTypes[0];
  const typeLabel = firstBusinessType
    ? BUSINESS_TYPE_LABELS[firstBusinessType]
    : null;
  const focusLabel = post.businessFocus[0]
    ? BUSINESS_FOCUS_LABELS[post.businessFocus[0]]
    : null;

  const categoryLabel = post.isWeeklyIntake
    ? "The Intake"
    : post.category === "advice"
      ? "Advice"
      : "News";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-3xl bg-[#141C2E] border border-[#1F2A3D] shadow-sm hover:shadow-md hover:border-[#2A3850] overflow-hidden transition-all duration-300"
    >
      {/* Thumbnail, 16:9 */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {post.thumbnailImage ? (
          <Image
            src={post.thumbnailImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ backgroundColor: post.thumbnailAccent, backgroundImage: pattern }}
          />
        )}
        {/* Category badge */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
            }}
          >
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {typeLabel && (
            <span className="text-[10px] font-medium text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">
              {typeLabel}
            </span>
          )}
          {focusLabel && (
            <span className="text-[10px] font-medium text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">
              {focusLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-[#E6EAF2] text-base font-semibold leading-snug mb-2 line-clamp-2"
          style={{ fontFamily: '"Lora", Georgia, serif' }}
        >
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-[#8A93A6] text-sm leading-relaxed line-clamp-3 flex-1">
          {post.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1F2A3D]">
          <div>
            <p className="text-xs font-medium text-[#C8CDD8]">{post.author.name}</p>
            <p className="text-[11px] text-[#8A93A6]">{formatDate(post.publishedAt)}</p>
          </div>
          <span className="text-[11px] text-[#8A93A6]">{post.readTimeMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
