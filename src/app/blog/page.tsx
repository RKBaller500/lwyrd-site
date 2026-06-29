"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogCard from "@/components/blog/BlogCard";
import { BLOG_POSTS, BUSINESS_TYPE_LABELS, BUSINESS_FOCUS_LABELS } from "@/data/blogPosts";
import { BlogFilters, BusinessFocus, BusinessType, ContentType } from "@/types/blog";
import { X, SlidersHorizontal } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const DEFAULT_FILTERS: BlogFilters = {
  businessType: null,
  businessFocus: null,
  contentType: null,
  sortOrder: "newest",
  editorsPicksOnly: false,
};

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3.5 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap ${
        active
          ? "bg-[#3B82F6] border-[#3B82F6] text-white"
          : "bg-transparent border-[#1F2A3D] text-[#8A93A6] hover:border-[#3B82F6]/40 hover:text-[#E6EAF2]"
      }`}
    >
      {children}
    </button>
  );
}

export default function BlogPage() {
  const [filters, setFilters] = useState<BlogFilters>(DEFAULT_FILTERS);

  function set<K extends keyof BlogFilters>(key: K, value: BlogFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function toggle<K extends keyof BlogFilters>(key: K, value: BlogFilters[K]) {
    setFilters((f) => ({ ...f, [key]: f[key] === value ? null : value }));
  }

  const hasActiveFilters =
    filters.businessType !== null ||
    filters.businessFocus !== null ||
    filters.contentType !== null ||
    filters.sortOrder !== "newest";

  const filtered = useMemo(() => {
    let posts = [...BLOG_POSTS];

    if (filters.businessType) {
      posts = posts.filter((p) => p.businessTypes.includes(filters.businessType!));
    }
    if (filters.businessFocus) {
      posts = posts.filter((p) =>
        p.businessFocus.includes(filters.businessFocus as BusinessFocus)
      );
    }
    if (filters.contentType) {
      posts = posts.filter((p) => p.category === filters.contentType);
    }

    posts.sort((a, b) => {
      const diff = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return filters.sortOrder === "newest" ? -diff : diff;
    });

    return posts;
  }, [filters]);

  function getResultLabel(): string {
    const parts: string[] = [];
    if (filters.editorsPicksOnly) parts.push("Editor's Picks");
    if (filters.businessType) parts.push(BUSINESS_TYPE_LABELS[filters.businessType] ?? "");
    if (filters.businessFocus)
      parts.push(BUSINESS_FOCUS_LABELS[filters.businessFocus] ?? "");
    if (filters.contentType)
      parts.push(filters.contentType === "advice" ? "Advice" : "News");

    const count = filtered.length;
    const noun = count === 1 ? "article" : "articles";
    if (parts.length === 0) return `Showing all ${count} ${noun}`;
    return `Showing ${count} ${noun} for ${parts.join(", ")}`;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1C]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-10 max-w-2xl"
        >
          <h1
            className="text-5xl sm:text-6xl text-[#E6EAF2] mb-3"
            style={{ ...lora, fontWeight: 500 }}
          >
            Insights
          </h1>
          <p className="text-[#8A93A6] text-lg">
            Legal strategy, news, and analysis for founders, individuals, and growing businesses.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.08 }}
          className="flex flex-wrap items-center gap-2 mb-5"
        >
          <SlidersHorizontal size={13} className="text-[#8A93A6] shrink-0" strokeWidth={2} />

          {(Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map((bt) => (
            <ChipButton key={bt} active={filters.businessType === bt} onClick={() => toggle("businessType", bt)}>
              {BUSINESS_TYPE_LABELS[bt]}
            </ChipButton>
          ))}

          <span className="w-px h-4 bg-[#1F2A3D] mx-0.5 shrink-0" />

          {(Object.keys(BUSINESS_FOCUS_LABELS) as BusinessFocus[]).map((bf) => (
            <ChipButton key={bf} active={filters.businessFocus === bf} onClick={() => toggle("businessFocus", bf)}>
              {BUSINESS_FOCUS_LABELS[bf]}
            </ChipButton>
          ))}

          <span className="w-px h-4 bg-[#1F2A3D] mx-0.5 shrink-0" />

          {(["advice", "news"] as ContentType[]).map((ct) => (
            <ChipButton key={ct} active={filters.contentType === ct} onClick={() => toggle("contentType", ct)}>
              {ct === "advice" ? "Advice" : "News"}
            </ChipButton>
          ))}

          <span className="w-px h-4 bg-[#1F2A3D] mx-0.5 shrink-0" />

          <ChipButton active={filters.sortOrder === "newest"} onClick={() => set("sortOrder", "newest")}>
            Newest
          </ChipButton>
          <ChipButton active={filters.sortOrder === "oldest"} onClick={() => set("sortOrder", "oldest")}>
            Oldest
          </ChipButton>

        </motion.div>

        {/* Result count + clear */}
        <motion.div
          layout
          className="flex items-center justify-between mb-5"
        >
          <p className="text-sm text-[#8A93A6]">{getResultLabel()}</p>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A93A6] hover:text-[#E6EAF2] transition-colors"
            >
              <X size={12} strokeWidth={2} />
              Clear all filters
            </button>
          )}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease }}
              className="bg-[#141C2E] border border-[#1F2A3D] rounded-3xl p-12 text-center"
            >
              <p className="text-[#8A93A6] text-sm">
                No articles match those filters.{" "}
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-[#3B82F6] hover:underline"
                >
                  Clear all
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease, delay: i * 0.05 }}
                >
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
