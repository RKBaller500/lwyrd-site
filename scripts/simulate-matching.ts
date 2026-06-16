/**
 * Run: npx tsx scripts/simulate-matching.ts --runs 10000
 */

import {
  getQ2ForTrack,
  TRACK_CONTEXT_QUESTIONS,
  CLOSING_QUESTIONS,
  getSubQuestions,
  CATEGORY_SLUG_MAP,
  type V2Question,
  type V2Track,
} from "../src/data/intakeV2";
import { matchFirmsV2 } from "../src/lib/matching";
import { firms as localFirms } from "../src/data/firms";
import { createBuildTimeClient } from "../src/lib/supabase/build";
import { mapDbFirmToFirm } from "../src/lib/supabase/mappers";
import type { DbFirm } from "../src/lib/supabase/types";
import type { Firm } from "../src/types";

// ── CLI args ──────────────────────────────────────────────────────────────────

const runsIdx = process.argv.indexOf("--runs");
const RUNS = runsIdx !== -1 ? parseInt(process.argv[runsIdx + 1], 10) : 1000;
if (isNaN(RUNS) || RUNS < 1) {
  console.error("Usage: npx tsx scripts/simulate-matching.ts --runs <N>");
  process.exit(1);
}

// ── Supabase fetch ────────────────────────────────────────────────────────────

async function fetchFirms(): Promise<Firm[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return localFirms;
  try {
    const supabase = createBuildTimeClient();
    const { data, error } = await supabase
      .from("firms")
      .select("*, attorneys(*), firm_assessment_items(id, criterion_id, passed, note, display_order, assessment_criteria(id, label, description, display_order))")
      .order("overall_score", { ascending: false });
    if (!error && data && data.length > 0) return (data as DbFirm[]).map(mapDbFirmToFirm);
  } catch {}
  return localFirms;
}

// ── Random helpers ────────────────────────────────────────────────────────────

const TRACKS: V2Track[] = ["startup", "individual", "small_business"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMulti(opts: { value: string }[]): string[] {
  const count = Math.floor(Math.random() * Math.min(3, opts.length)) + 1;
  return [...opts].sort(() => Math.random() - 0.5).slice(0, count).map((o) => o.value);
}

function randomBudget(min: number, max: number, step: number): number {
  const steps = Math.floor((max - min) / step);
  const t = Math.random() ** 3;
  return min + Math.floor(t * (steps + 1)) * step;
}

function answerQuestion(q: V2Question): string | string[] | number {
  if (q.type === "state-dropdown") return pick(q.options).value;
  if (q.type === "single-select") return pick(q.options).value;
  if (q.type === "multi-select") return pickMulti(q.options);
  if (q.type === "budget-range") return randomBudget(q.min ?? 0, q.max ?? 100000, q.step ?? 2500);
  return "";
}

function buildAnswers(track: V2Track, category: string): Record<string, string | string[] | number> {
  const questions: V2Question[] = [
    ...TRACK_CONTEXT_QUESTIONS[track],
    ...getSubQuestions(track, category),
    ...CLOSING_QUESTIONS[track],
  ];
  const answers: Record<string, string | string[] | number> = {};
  for (const q of questions) answers[q.id] = answerQuestion(q);
  return answers;
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface RunResult {
  track: V2Track;
  categoryLabel: string;
  matchCount: number;
  topScore: number | null;
  secondScore: number | null;
  topFirmName: string | null;
  missedCriteria: string[];
}

async function main() {
  const firms = await fetchFirms();
  const source = process.env.NEXT_PUBLIC_SUPABASE_URL ? "Supabase" : "local data";
  process.stderr.write(`Loaded ${firms.length} firms from ${source}.\n`);

  process.stdout.write(`Running ${RUNS.toLocaleString()} simulations`);

  const results: RunResult[] = [];

  for (let i = 0; i < RUNS; i++) {
    if (i > 0 && i % Math.ceil(RUNS / 20) === 0) process.stdout.write(".");

    const track = pick(TRACKS);
    const q2 = getQ2ForTrack(track);
    const categoryOpt = pick(q2.options);
    const category = categoryOpt.value;
    const practiceAreaSlug = CATEGORY_SLUG_MAP[track]?.[category] ?? "corporate-formation";

    const answers = buildAnswers(track, category);
    const matches = matchFirmsV2(track, category, answers, firms, practiceAreaSlug);

    results.push({
      track,
      categoryLabel: categoryOpt.label,
      matchCount: matches.length,
      topScore: matches[0]?.score ?? null,
      secondScore: matches[1]?.score ?? null,
      topFirmName: matches[0]?.firm.name ?? null,
      missedCriteria: matches[0]?.missedCriteria ?? [],
    });
  }

  console.log(" done.\n");

  // ── Analysis ────────────────────────────────────────────────────────────────

  const zeroMatchRuns = results.filter((r) => r.matchCount === 0);
  const matchedRuns   = results.filter((r) => r.matchCount > 0);

  const zeroMatchRate = (zeroMatchRuns.length / RUNS) * 100;
  const avgMatchCount = matchedRuns.reduce((s, r) => s + r.matchCount, 0) / matchedRuns.length;
  const avgTopScore   = matchedRuns.reduce((s, r) => s + r.topScore!, 0) / matchedRuns.length;

  const runsWithGap = matchedRuns.filter((r) => r.secondScore !== null);
  const avgScoreGap = runsWithGap.length > 0
    ? runsWithGap.reduce((s, r) => s + r.topScore! - r.secondScore!, 0) / runsWithGap.length
    : 0;

  const categoryMap: Record<string, { total: number; zeros: number }> = {};
  for (const r of results) {
    const key = `${r.track} / ${r.categoryLabel}`;
    if (!categoryMap[key]) categoryMap[key] = { total: 0, zeros: 0 };
    categoryMap[key].total++;
    if (r.matchCount === 0) categoryMap[key].zeros++;
  }
  const worstCategories = Object.entries(categoryMap)
    .filter(([, v]) => v.zeros > 0)
    .map(([label, v]) => ({ label, rate: (v.zeros / v.total) * 100, zeros: v.zeros, total: v.total }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 7);

  const firmWins: Record<string, number> = {};
  for (const r of matchedRuns) {
    if (r.topFirmName) firmWins[r.topFirmName] = (firmWins[r.topFirmName] ?? 0) + 1;
  }
  const topFirms = Object.entries(firmWins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, wins]) => ({ name, wins, pct: (wins / matchedRuns.length) * 100 }));

  const missedCounts: Record<string, number> = {};
  for (const r of matchedRuns) {
    for (const c of r.missedCriteria) {
      missedCounts[c] = (missedCounts[c] ?? 0) + 1;
    }
  }
  const topMissed = Object.entries(missedCounts).sort((a, b) => b[1] - a[1]);

  // ── Print ────────────────────────────────────────────────────────────────────

  const C = {
    reset:  "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
    blue:   "\x1b[34m", cyan: "\x1b[36m", green: "\x1b[32m",
    yellow: "\x1b[33m", red:  "\x1b[31m", gray:  "\x1b[90m",
  };

  const DBAR = "═".repeat(62);
  const BAR  = "─".repeat(62);

  const pct = (n: number) => n.toFixed(1) + "%";
  const num = (n: number) => n.toLocaleString();
  const avg = (n: number) => n.toFixed(1);

  console.log(`${C.bold}${C.blue}${DBAR}${C.reset}`);
  console.log(`${C.bold}${C.blue}  LWYRD · MATCHING SIMULATION REPORT${C.reset}`);
  console.log(`${C.bold}${C.blue}${DBAR}${C.reset}\n`);

  console.log(`  ${C.bold}Runs${C.reset}                      ${C.bold}${num(RUNS)}${C.reset}`);
  console.log(`  ${C.bold}Firms loaded${C.reset}              ${C.bold}${firms.length}${C.reset}  ${C.dim}(${source})${C.reset}`);
  console.log();
  console.log(`  ${C.bold}Zero-match rate${C.reset}           ${C.yellow}${C.bold}${pct(zeroMatchRate)}${C.reset}  ${C.dim}(${num(zeroMatchRuns.length)} of ${num(RUNS)} runs)${C.reset}`);
  console.log(`  ${C.bold}Avg matched firms${C.reset}         ${avg(avgMatchCount)}`);
  console.log(`  ${C.bold}Avg top score${C.reset}             ${avg(avgTopScore)}`);
  console.log(`  ${C.bold}Avg score gap #1 → #2${C.reset}     ${avg(avgScoreGap)} pts`);

  console.log(`\n  ${C.bold}${C.cyan}Worst categories  ${C.dim}(zero-match rate)${C.reset}`);
  console.log(`  ${BAR}`);
  if (worstCategories.length === 0) {
    console.log(`  ${C.dim}None — every category returned results in every run.${C.reset}`);
  } else {
    for (const cat of worstCategories) {
      const filled = Math.max(1, Math.round(cat.rate / 4));
      const bar    = `${C.red}${"█".repeat(filled)}${C.reset}`;
      const detail = `${C.dim}(${cat.zeros}/${cat.total})${C.reset}`;
      console.log(
        `  ${C.dim}${cat.label.padEnd(48)}${C.reset}` +
        `  ${C.yellow}${C.bold}${pct(cat.rate).padStart(6)}${C.reset}  ${detail}  ${bar}`
      );
    }
  }

  console.log(`\n  ${C.bold}${C.cyan}Most dominant firms  ${C.dim}(% of matched runs as #1)${C.reset}`);
  console.log(`  ${BAR}`);
  for (const f of topFirms) {
    const filled = Math.max(1, Math.round(f.pct * 1.5));
    const bar    = `${C.green}${"█".repeat(filled)}${C.reset}`;
    console.log(
      `  ${f.name.padEnd(42)}` +
      `  ${C.bold}${pct(f.pct).padStart(6)}${C.reset}` +
      `  ${C.dim}${num(f.wins)} wins${C.reset}  ${bar}`
    );
  }

  console.log(`\n  ${C.bold}${C.cyan}Most common missed criteria  ${C.dim}(best match only)${C.reset}`);
  console.log(`  ${BAR}`);
  for (const [crit, count] of topMissed) {
    const pctVal = (count / matchedRuns.length) * 100;
    const filled = Math.max(1, Math.round(pctVal / 3));
    const bar    = `${C.yellow}${"█".repeat(filled)}${C.reset}`;
    console.log(
      `  ${crit.padEnd(22)}` +
      `  ${C.bold}${num(count).padStart(7)}${C.reset} misses` +
      `  ${C.dim}${pct(pctVal).padStart(6)} of matched runs${C.reset}  ${bar}`
    );
  }

  console.log(`\n${C.bold}${C.blue}${DBAR}${C.reset}\n`);
}

main();
