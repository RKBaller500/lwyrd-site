/* eslint-disable @typescript-eslint/no-require-imports */
// Run once: npx tsx scripts/seed.ts
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { createClient } from "@supabase/supabase-js";
import { firms } from "../src/data/firms";
import { categories } from "../src/data/categories";
import { globalQuestions, categorySpecificQuestions } from "../src/data/intake";

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
  console.log("Starting seed...\n");

  // ── 1. Legal categories ──────────────────────────────────────
  console.log(`Seeding ${categories.length} categories...`);
  const categoryRows = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    short_description: c.shortDescription,
    full_description: c.fullDescription,
    what_firms_do: c.whatFirmsDo,
    service_examples: c.serviceExamples,
    hero_tag: c.heroTag,
  }));
  const { error: catError } = await supabase
    .from("legal_categories")
    .upsert(categoryRows, { onConflict: "slug" });
  if (catError) {
    console.error("Categories error:", catError.message);
    process.exit(1);
  }
  console.log("  Categories done.\n");

  // ── 2. Intake questions ──────────────────────────────────────
  const allQuestions = [...globalQuestions, ...categorySpecificQuestions];
  console.log(`Seeding ${allQuestions.length} intake questions...`);
  const questionRows = allQuestions.map((q) => ({
    id: q.id,
    category_slug: q.categorySlug,
    display_order: q.order,
    question: q.question,
    subtext: q.subtext ?? null,
    type: q.type,
    options: q.options ?? null,
    min_value: q.min ?? null,
    max_value: q.max ?? null,
    step_value: q.step ?? null,
    required: q.required,
  }));
  const { error: qError } = await supabase
    .from("intake_questions")
    .upsert(questionRows, { onConflict: "id" });
  if (qError) {
    console.error("Questions error:", qError.message);
    process.exit(1);
  }
  console.log("  Questions done.\n");

  // ── 3. Firms + attorneys + assessment items ──────────────────
  console.log(`Seeding ${firms.length} firms...`);
  for (const firm of firms) {
    // Insert firm
    const { error: firmError } = await supabase.from("firms").upsert(
      {
        id: firm.id,
        name: firm.name,
        logo_url: firm.logoUrl ?? null,
        tagline: firm.tagline,
        location: firm.location,
        founded: firm.founded,
        size: firm.size,
        practice_areas: firm.practiceAreas,
        industries: firm.industries,
        company_stages: firm.companyStages,
        budget_min: firm.budgetRange.min,
        budget_max: firm.budgetRange.max,
        billing_model: firm.billingModel,
        hourly_rate: firm.hourlyRate ?? null,
        response_time: firm.responseTime,
        languages: firm.languages,
        description: firm.description,
        strengths: firm.strengths,
        overall_score: firm.overallScore,
        verified: firm.verified,
      },
      { onConflict: "id" }
    );
    if (firmError) {
      console.error(`  Firm "${firm.name}" error:`, firmError.message);
      process.exit(1);
    }

    // Replace attorneys (delete + insert for idempotency)
    await supabase.from("attorneys").delete().eq("firm_id", firm.id);
    if (firm.team.length > 0) {
      const { error: attError } = await supabase.from("attorneys").insert(
        firm.team.map((a, i) => ({
          firm_id: firm.id,
          name: a.name,
          title: a.title,
          bio: a.bio,
          bar_admissions: a.barAdmissions,
          display_order: i,
        }))
      );
      if (attError) {
        console.error(`  Attorneys for "${firm.name}" error:`, attError.message);
        process.exit(1);
      }
    }

    // Assessment items are now managed via the admin panel using standard criteria.
    // No seeding needed here.

    console.log(`  ✓ ${firm.name}`);
  }

  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
