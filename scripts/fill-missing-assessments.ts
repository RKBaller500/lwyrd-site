// Run: npx tsx scripts/fill-missing-assessments.ts
// Finds all firms with no assessment items and seeds all 13 criteria as passed.
// Admins can then adjust individual items through /admin/firms/[id].

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fillMissingAssessments() {
  // Fetch all active criteria
  const { data: criteria, error: criteriaError } = await supabase
    .from("assessment_criteria")
    .select("id, label")
    .eq("active", true)
    .order("display_order");

  if (criteriaError || !criteria?.length) {
    console.error("Failed to fetch criteria:", criteriaError?.message);
    process.exit(1);
  }
  console.log(`Found ${criteria.length} criteria.\n`);

  // Fetch all firm IDs
  const { data: firms, error: firmsError } = await supabase
    .from("firms")
    .select("id, name");

  if (firmsError || !firms?.length) {
    console.error("Failed to fetch firms:", firmsError?.message);
    process.exit(1);
  }

  // Fetch firm IDs that already have assessment items
  const { data: existing } = await supabase
    .from("firm_assessment_items")
    .select("firm_id");

  const coveredFirmIds = new Set((existing ?? []).map((r: { firm_id: string }) => r.firm_id));

  const missing = firms.filter((f) => !coveredFirmIds.has(f.id));

  if (missing.length === 0) {
    console.log("All firms already have assessment items. Nothing to do.");
    return;
  }

  console.log(`Found ${missing.length} firm(s) with no assessment items:\n`);

  for (const firm of missing) {
    console.log(`  Seeding "${firm.name}" (${firm.id})...`);

    const rows = criteria.map((c, i) => ({
      firm_id: firm.id,
      criterion_id: c.id,
      passed: true,
      note: null,
      display_order: i,
    }));

    const { error } = await supabase.from("firm_assessment_items").insert(rows);
    if (error) {
      console.error(`    Error: ${error.message}`);
    } else {
      console.log(`    ✓ ${rows.length}/13 criteria set to passed`);
    }
  }

  console.log("\nDone. Review and adjust any firm's assessment at /admin/firms/[id].");
}

fillMissingAssessments().catch((e) => {
  console.error(e);
  process.exit(1);
});
