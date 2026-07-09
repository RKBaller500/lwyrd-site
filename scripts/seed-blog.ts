// Run: npx tsx scripts/seed-blog.ts
// Upserts the original hand-authored blog posts (src/data/blogPosts.ts) into the
// blog_posts table as PUBLISHED, so the DB-backed blog ships populated.
// Requires the blog_posts migration to have been run first.

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { createClient } from "@supabase/supabase-js";
import { BLOG_POSTS } from "../src/data/blogPosts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  const rows = BLOG_POSTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    content: p.content,
    author_name: p.author.name,
    author_title: p.author.title ?? null,
    category: p.category,
    business_types: p.businessTypes,
    business_focus: p.businessFocus,
    is_editors_pick: p.isEditorsPick,
    is_weekly_intake: p.isWeeklyIntake,
    read_time_minutes: p.readTimeMinutes,
    thumbnail_accent: p.thumbnailAccent,
    thumbnail_image: p.thumbnailImage ?? null,
    status: "published" as const,
    published_at: new Date(p.publishedAt).toISOString(),
  }));

  const { error } = await supabase
    .from("blog_posts")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${rows.length} blog posts (published).`);
}

seed();
