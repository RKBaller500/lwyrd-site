/**
 * Matching simulation — fetches live firms from Supabase, then tests all
 * track/category/state/budget/stage/firmType combos and reports coverage gaps.
 *
 * Run: npx tsx src/scripts/sim-matches.ts
 */

import { createClient } from "@supabase/supabase-js";
import { mapDbFirmToFirm } from "../lib/supabase/mappers";
import { matchFirmsV2 } from "../lib/matching";
import { CATEGORY_SLUG_MAP } from "../data/intakeV2";
import { Firm } from "../types";
import { DbFirm } from "../lib/supabase/types";

const SUPABASE_URL  = "https://oxusluapgtuxjkrtcsmi.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dXNsdWFwZ3R1eGprcnRjc21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDA4MjIsImV4cCI6MjA5MTc3NjgyMn0.moIm0PiCaXlIsyUcQwvWYIAaYxaRaKJ9wwE0dO8JPnM";

const FIRM_SELECT = `
  *,
  attorneys ( * ),
  firm_assessment_items (
    id, criterion_id, passed, note, display_order,
    assessment_criteria ( id, label, description, display_order )
  ),
  firm_practice_areas ( practice_area_slug )
`;

async function fetchFirms(): Promise<Firm[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  const { data, error } = await supabase
    .from("firms")
    .select(FIRM_SELECT)
    .order("overall_score", { ascending: false });
  if (error) throw new Error(`Supabase error: ${error.message}`);
  if (!data?.length) throw new Error("No firms returned");
  return (data as DbFirm[]).map(mapDbFirmToFirm);
}

// ── Axes ─────────────────────────────────────────────────────────────────────

const TRACKS = ["startup", "individual", "small_business"] as const;
type Track = (typeof TRACKS)[number];

const STAGES: Record<Track, string[]> = {
  startup:        ["pre_incorp", "pre_seed", "seed", "series_a", "series_b_plus", "bootstrapped"],
  individual:     [""],
  small_business: [""],
};

const BUDGETS = [
  { label: "none",  value: 0 },
  { label: "tight", value: 750 },
  { label: "low",   value: 3000 },
  { label: "mid",   value: 10000 },
  { label: "high",  value: 50000 },
];

const STATES = [
  { code: "NY",   label: "New York" },
  { code: "CA",   label: "California" },
  { code: "TX",   label: "Texas" },
  { code: "FL",   label: "Florida" },
  { code: "IL",   label: "Illinois" },
  { code: "OH",   label: "Ohio" },
  { code: "none", label: "No preference" },
];

const STATE_CODE_TO_V2: Record<string, string> = {
  NY: "NY", CA: "CA", TX: "TX", FL: "FL", IL: "IL",
  OH: "other", none: "none",
};

const FIRM_TYPES = ["no_preference", "large", "boutique", "solo"] as const;

type SimRow = {
  track: string; category: string; slug: string;
  stage: string; state: string; budget: string; firmType: string;
  resultCount: number; isPartial: boolean; topScore: number; issue: string;
};

// ── Run ───────────────────────────────────────────────────────────────────────

async function main() {
  process.stdout.write("Fetching firms from Supabase... ");
  const allFirms = await fetchFirms();
  console.log(`${allFirms.length} firms loaded.\n`);

  // Firm coverage by practice area
  const coveredSlugs: Record<string, number> = {};
  for (const firm of allFirms) {
    for (const slug of firm.practiceAreas) {
      coveredSlugs[slug] = (coveredSlugs[slug] ?? 0) + 1;
    }
  }
  const allSlugs = new Set(Object.values(CATEGORY_SLUG_MAP).flatMap(m => Object.values(m)));
  console.log("── FIRM COVERAGE BY PRACTICE AREA ───────────────────────────────────");
  for (const slug of [...allSlugs].sort()) {
    const n = coveredSlugs[slug] ?? 0;
    console.log(`  ${slug.padEnd(30)} ${String(n).padStart(3)}  ${"█".repeat(Math.min(n, 60)) || "(none)"}`);
  }
  console.log();

  // Full simulation
  const results: SimRow[] = [];
  let total = 0;

  for (const track of TRACKS) {
    for (const category of Object.keys(CATEGORY_SLUG_MAP[track])) {
      const slug = CATEGORY_SLUG_MAP[track][category];
      for (const stage of STAGES[track]) {
        for (const state of STATES) {
          for (const budget of BUDGETS) {
            for (const firmType of FIRM_TYPES) {
              total++;
              const answers: Record<string, string | string[] | number> = {};
              if (stage) answers.s1 = stage;

              const bk = track === "startup" ? "sf3" : track === "individual" ? "if3" : "bf3";
              if (budget.value > 0) answers[bk] = budget.value;

              const sk = track === "startup" ? "sf7" : track === "individual" ? "if5" : "bf7";
              answers[sk] = STATE_CODE_TO_V2[state.code] ?? "none";

              const fk = track === "startup" ? "sf1" : track === "individual" ? "if1" : "bf1";
              answers[fk] = firmType;

              const matches = matchFirmsV2(track, category, answers, allFirms);
              const resultCount = matches.length;
              const isPartial   = resultCount > 0 && !!matches[0].isPartialMatch;
              const topScore    = resultCount > 0 ? matches[0].score : 0;

              let issue = "";
              if (resultCount === 0)  issue = "NO_RESULTS";
              else if (isPartial)     issue = "PARTIAL_MATCH";
              else if (topScore < 50) issue = "POOR_SCORE";
              else if (topScore < 65) issue = "WEAK_SCORE";

              if (issue) results.push({
                track, category, slug,
                stage: stage || "n/a", state: state.label,
                budget: budget.label, firmType,
                resultCount, isPartial, topScore, issue,
              });
            }
          }
        }
      }
    }
  }

  console.log(`${"=".repeat(72)}`);
  console.log(`SIMULATION: ${results.length} issues out of ${total} total combos`);
  console.log(`${"=".repeat(72)}\n`);

  // Group by issue type — show unique slug+state+firmType+budget combos
  const byIssue: Record<string, SimRow[]> = {};
  for (const r of results) { byIssue[r.issue] = [...(byIssue[r.issue] ?? []), r]; }

  for (const issueType of ["NO_RESULTS", "PARTIAL_MATCH", "POOR_SCORE", "WEAK_SCORE"]) {
    const rows = byIssue[issueType];
    if (!rows?.length) continue;
    console.log(`── ${issueType} (${rows.length} combos) ──────────────────────────────`);

    // Show breakdown by firmType to expose root causes
    const byFirmType: Record<string, number> = {};
    const byBudget:   Record<string, number> = {};
    const bySlug:     Record<string, number> = {};
    const seen = new Set<string>();

    for (const r of rows) {
      byFirmType[r.firmType] = (byFirmType[r.firmType] ?? 0) + 1;
      byBudget[r.budget]     = (byBudget[r.budget]     ?? 0) + 1;
      bySlug[r.slug]         = (bySlug[r.slug]         ?? 0) + 1;
      const key = `  ${r.track}/${r.category} (${r.slug}) state=${r.state} firmType=${r.firmType} budget=${r.budget} → score=${r.topScore}`;
      if (!seen.has(key)) { seen.add(key); }
    }

    // Print unique slug+state combos
    const slugStateSeen = new Set<string>();
    for (const r of rows) {
      const k = `  ${r.track}/${r.category} | state=${r.state}`;
      if (!slugStateSeen.has(k)) { slugStateSeen.add(k); console.log(k); }
    }

    console.log("\n  Root causes:");
    console.log("  By firmType:", Object.entries(byFirmType).sort(([,a],[,b])=>b-a).map(([k,v])=>`${k}:${v}`).join("  "));
    console.log("  By budget:  ", Object.entries(byBudget).sort(([,a],[,b])=>b-a).map(([k,v])=>`${k}:${v}`).join("  "));
    console.log("  By slug:    ", Object.entries(bySlug).sort(([,a],[,b])=>b-a).map(([k,v])=>`${k}:${v}`).join("  "));
    console.log();
  }

  // Worst 15 individual combos by score
  console.log("── WORST 15 INDIVIDUAL COMBOS ───────────────────────────────────────");
  results
    .filter(r => !r.isPartial)
    .sort((a, b) => a.topScore - b.topScore)
    .slice(0, 15)
    .forEach(r => console.log(`  score=${String(r.topScore).padStart(3)}  ${r.track}/${r.category}  state=${r.state}  firmType=${r.firmType}  budget=${r.budget}  stage=${r.stage}`));

  console.log("\nDone.");
}

main().catch(e => { console.error(e); process.exit(1); });
