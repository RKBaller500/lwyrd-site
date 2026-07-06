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
      .select("*, attorneys(*), firm_assessment_items(id, criterion_id, passed, note, display_order, assessment_criteria(id, label, description, display_order)), firm_practice_areas(practice_area_slug)")
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
  // Log-normal via Box-Muller: mode ~14% of range, median ~22%, mean ~29%
  const u1 = Math.random(), u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const t = Math.max(0, Math.min(1, Math.exp(-1.5 + 0.7 * z)));
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(t * (steps + 1)) * step;
}

function answerQuestion(q: V2Question): string | string[] | number {
  if (q.type === "state-dropdown") return q.options.find((o) => o.value === "FL")?.value ?? "FL";
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

// ── Preference gap helpers ────────────────────────────────────────────────────

// Maps raw intake industry slugs directly to the firm.industries slug used in matching
const INDUSTRY_SLUG_MAP: Record<string, string> = {
  tech_saas: "tech", ai_ml: "tech", fintech: "fintech", healthtech: "healthcare",
  consumer: "consumer", media: "media", hardware: "tech", climate: "tech",
  enterprise_b2b: "tech",
  retail_ecomm: "consumer", food_bev: "consumer", professional_svcs: "",
  healthcare: "healthcare", construction_re: "real-estate", technology: "tech",
  manufacturing: "manufacturing", hospitality: "consumer", creative: "media",
};

// Which billing intake values map to which firm billingModel values
const BILLING_MATCH: Record<string, string[]> = {
  hourly:    ["hourly", "hybrid"],
  retainer:  ["retainer", "hybrid"],
  flat_fee:  ["flat-fee"],
};

interface GapResult {
  // size preference gap
  sizePreference: "boutique" | "solo" | "large" | "no_preference" | null;
  sizeMet: boolean; // at least one firm in results has the requested size

  // billing preference gap
  billingPreference: string | null;
  billingMet: boolean;

  // language preference gap
  languageNeeded: boolean; // user needs non-English
  languageMet: boolean;

  // industry preference gap
  industrySlug: string | null; // null if no/unknown preference
  industryMet: boolean; // at least one firm has this industry
}

function analyzePreferenceGaps(
  answers: Record<string, string | string[] | number>,
  matches: ReturnType<typeof matchFirmsV2>
): GapResult {
  // ── Size ──────────────────────────────────────────────────────────────────
  const firmTypePref = (answers.sf1 ?? answers.if1 ?? answers.bf1) as string | undefined;
  const sizePreference = (firmTypePref as GapResult["sizePreference"]) ?? null;
  let sizeMet = true;
  if (firmTypePref === "boutique" || firmTypePref === "solo") {
    sizeMet = matches.some((m) => m.firm.size === "boutique");
  } else if (firmTypePref === "large") {
    sizeMet = matches.some((m) => m.firm.size === "large");
  }

  // ── Billing ───────────────────────────────────────────────────────────────
  const billingPref = (answers.sf2 ?? answers.if2 ?? answers.bf2) as string | undefined;
  const hasBillingPref = !!billingPref && billingPref !== "no_preference" && billingPref !== "unsure" && billingPref !== "other";
  const billingPreference = hasBillingPref ? billingPref! : null;
  const billingMet = !hasBillingPref ||
    matches.some((m) => (BILLING_MATCH[billingPref!] ?? []).includes(m.firm.billingModel));

  // ── Language ──────────────────────────────────────────────────────────────
  const langPref = (answers.sf8 ?? answers.if6 ?? answers.bf8) as string[] | undefined;
  const nonEnglish = (langPref ?? []).filter((l) => l !== "english" && l !== "No — English only is fine");
  const languageNeeded = nonEnglish.length > 0;
  const languageMet = !languageNeeded || matches.some((m) =>
    nonEnglish.some((lang) =>
      m.firm.languages.some((fl) => fl.toLowerCase().includes(lang.toLowerCase()))
    )
  );

  // ── Industry ─────────────────────────────────────────────────────────────
  const rawIndustry = (answers.s2 ?? answers.b3) as string | undefined;
  const industrySlug = rawIndustry ? (INDUSTRY_SLUG_MAP[rawIndustry] ?? null) : null;
  const industryMet = !industrySlug || matches.some((m) => m.firm.industries.includes(industrySlug));

  return { sizePreference, sizeMet, billingPreference, billingMet, languageNeeded, languageMet, industrySlug, industryMet };
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
  gap: GapResult;
  stageValue: string | null; // raw s1 value
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
    const gap = analyzePreferenceGaps(answers, matches);

    results.push({
      track,
      categoryLabel: categoryOpt.label,
      matchCount: matches.length,
      topScore: matches[0]?.score ?? null,
      secondScore: matches[1]?.score ?? null,
      topFirmName: matches[0]?.firm.name ?? null,
      missedCriteria: matches[0]?.missedCriteria ?? [],
      gap,
      stageValue: (answers.s1 as string | undefined) ?? null,
    });
  }

  console.log(" done.\n");

  // ── ANSI colours ──────────────────────────────────────────────────────────

  const C = {
    reset:  "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
    blue:   "\x1b[34m", cyan: "\x1b[36m", green: "\x1b[32m",
    yellow: "\x1b[33m", red:  "\x1b[31m", gray:  "\x1b[90m",
  };

  const DBAR = "═".repeat(62);
  const BAR  = "─".repeat(62);

  const pct  = (n: number) => n.toFixed(1) + "%";
  const num  = (n: number) => n.toLocaleString();
  const avg  = (n: number) => n.toFixed(1);

  // ── Standard stats ────────────────────────────────────────────────────────

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

  // ── Preference gap stats ──────────────────────────────────────────────────

  // Helper: for a subset of gap-miss runs, which categories are worst?
  function worstCategoriesForGap(
    gapRuns: RunResult[],
    allRunsWithPref: RunResult[],
    topN = 8
  ) {
    const catMap: Record<string, { gap: number; total: number }> = {};
    for (const r of allRunsWithPref) {
      const key = `${r.track} / ${r.categoryLabel}`;
      if (!catMap[key]) catMap[key] = { gap: 0, total: 0 };
      catMap[key].total++;
    }
    for (const r of gapRuns) {
      const key = `${r.track} / ${r.categoryLabel}`;
      if (!catMap[key]) catMap[key] = { gap: 0, total: 0 };
      catMap[key].gap++;
    }
    return Object.entries(catMap)
      .filter(([, v]) => v.total >= 10)
      .map(([label, v]) => ({ label, rate: (v.gap / v.total) * 100, gap: v.gap, total: v.total }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, topN);
  }

  // -- Size: boutique/solo
  const wantsBoutique    = matchedRuns.filter((r) => r.gap.sizePreference === "boutique" || r.gap.sizePreference === "solo");
  const boutiqueSatisfied = wantsBoutique.filter((r) => r.gap.sizeMet);
  const boutiqueGap      = wantsBoutique.filter((r) => !r.gap.sizeMet);
  const boutiqueGapRate  = wantsBoutique.length > 0 ? (boutiqueGap.length / wantsBoutique.length) * 100 : 0;
  const boutiqueWorstCats = worstCategoriesForGap(boutiqueGap, wantsBoutique);

  // -- Size: large
  const wantsLarge       = matchedRuns.filter((r) => r.gap.sizePreference === "large");
  const largeGap         = wantsLarge.filter((r) => !r.gap.sizeMet);
  const largeGapRate     = wantsLarge.length > 0 ? (largeGap.length / wantsLarge.length) * 100 : 0;

  // -- Boutique gaps by company stage (startup only)
  const STAGE_LABELS: Record<string, string> = {
    pre_incorp: "Pre-incorp", pre_seed: "Pre-seed", seed: "Seed",
    series_a: "Series A", series_b_plus: "Growth/Series B+",
    bootstrapped: "Bootstrapped/Enterprise",
  };
  const boutiqueGapByStage: Record<string, { gap: number; total: number }> = {};
  for (const r of wantsBoutique.filter((r) => r.track === "startup" && r.stageValue)) {
    const stage = STAGE_LABELS[r.stageValue!] ?? r.stageValue!;
    if (!boutiqueGapByStage[stage]) boutiqueGapByStage[stage] = { gap: 0, total: 0 };
    boutiqueGapByStage[stage].total++;
    if (!r.gap.sizeMet) boutiqueGapByStage[stage].gap++;
  }

  // -- Billing
  const wantsBilling     = matchedRuns.filter((r) => r.gap.billingPreference !== null);
  const billingGap       = wantsBilling.filter((r) => !r.gap.billingMet);
  const billingGapRate   = wantsBilling.length > 0 ? (billingGap.length / wantsBilling.length) * 100 : 0;
  const billingByPref: Record<string, { gap: number; total: number }> = {};
  for (const r of wantsBilling) {
    const p = r.gap.billingPreference!;
    if (!billingByPref[p]) billingByPref[p] = { gap: 0, total: 0 };
    billingByPref[p].total++;
    if (!r.gap.billingMet) billingByPref[p].gap++;
  }
  const billingWorstCats = worstCategoriesForGap(billingGap, wantsBilling);

  // -- Language
  const needsLanguage    = matchedRuns.filter((r) => r.gap.languageNeeded);
  const languageGap      = needsLanguage.filter((r) => !r.gap.languageMet);
  const languageGapRate  = needsLanguage.length > 0 ? (languageGap.length / needsLanguage.length) * 100 : 0;
  const langWorstCats    = worstCategoriesForGap(languageGap, needsLanguage);

  // -- Industry
  const wantsIndustry    = matchedRuns.filter((r) => r.gap.industrySlug !== null && r.gap.industrySlug !== "");
  const industryGap      = wantsIndustry.filter((r) => !r.gap.industryMet);
  const industryGapRate  = wantsIndustry.length > 0 ? (industryGap.length / wantsIndustry.length) * 100 : 0;
  const industryBySlug: Record<string, { gap: number; total: number }> = {};
  for (const r of wantsIndustry) {
    const p = r.gap.industrySlug!;
    if (!industryBySlug[p]) industryBySlug[p] = { gap: 0, total: 0 };
    industryBySlug[p].total++;
    if (!r.gap.industryMet) industryBySlug[p].gap++;
  }
  const industryWorstCats = worstCategoriesForGap(industryGap, wantsIndustry);

  // ── Print ──────────────────────────────────────────────────────────────────

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

  if (worstCategories.length > 0) {
    console.log(`\n  ${C.bold}${C.cyan}Worst categories  ${C.dim}(zero-match rate)${C.reset}`);
    console.log(`  ${BAR}`);
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

  // ── Preference gap section ─────────────────────────────────────────────────

  console.log(`\n${C.bold}${C.blue}${DBAR}${C.reset}`);
  console.log(`${C.bold}${C.blue}  PREFERENCE GAP ANALYSIS${C.reset}`);
  console.log(`${C.bold}${C.blue}  (runs where NO matched firm satisfied the user's expressed preference)${C.reset}`);
  console.log(`${C.bold}${C.blue}${DBAR}${C.reset}\n`);

  // ── FIRM SIZE ──────────────────────────────────────────────────────────────
  console.log(`  ${C.bold}${C.cyan}FIRM SIZE PREFERENCE${C.reset}`);
  console.log(`  ${BAR}`);
  console.log(`  ${C.dim}Boutique / solo preference (${num(wantsBoutique.length)} runs expressing this)${C.reset}`);
  const bBar = `${C.red}${"█".repeat(Math.max(1, Math.round(boutiqueGapRate / 2)))}${C.reset}`;
  console.log(`    ${C.bold}Gap rate:${C.reset}  ${C.yellow}${C.bold}${pct(boutiqueGapRate)}${C.reset}  ${C.dim}— no boutique firm in results${C.reset}  ${bBar}`);
  console.log(`    ${C.dim}Satisfied: ${pct(wantsBoutique.length > 0 ? (boutiqueSatisfied.length / wantsBoutique.length) * 100 : 0)}${C.reset}`);

  if (Object.keys(boutiqueGapByStage).length > 0) {
    console.log(`\n    ${C.dim}Gap rate by company stage (startup track only):${C.reset}`);
    const stageEntries = Object.entries(boutiqueGapByStage)
      .map(([stage, v]) => ({ stage, rate: (v.gap / v.total) * 100, gap: v.gap, total: v.total }))
      .sort((a, b) => b.rate - a.rate);
    for (const s of stageEntries) {
      const sBar = `${C.yellow}${"█".repeat(Math.max(1, Math.round(s.rate / 3)))}${C.reset}`;
      console.log(
        `      ${s.stage.padEnd(30)}  ${C.bold}${pct(s.rate).padStart(6)}${C.reset}` +
        `  ${C.dim}(${s.gap}/${s.total})${C.reset}  ${sBar}`
      );
    }
  }

  if (boutiqueWorstCats.length > 0) {
    console.log(`\n    ${C.dim}Worst categories for boutique gaps:${C.reset}`);
    for (const cat of boutiqueWorstCats) {
      const cBar = `${C.red}${"█".repeat(Math.max(1, Math.round(cat.rate / 3)))}${C.reset}`;
      console.log(
        `      ${cat.label.padEnd(44)}  ${C.bold}${pct(cat.rate).padStart(6)}${C.reset}` +
        `  ${C.dim}(${cat.gap}/${cat.total})${C.reset}  ${cBar}`
      );
    }
  }

  if (wantsLarge.length > 0) {
    console.log();
    const lBar = `${C.red}${"█".repeat(Math.max(1, Math.round(largeGapRate / 2)))}${C.reset}`;
    console.log(`  ${C.dim}Large firm preference (${num(wantsLarge.length)} runs):${C.reset}`);
    console.log(`    ${C.bold}Gap rate:${C.reset}  ${C.yellow}${C.bold}${pct(largeGapRate)}${C.reset}  ${C.dim}— no large firm in results${C.reset}  ${lBar}`);
  }

  // ── BILLING ────────────────────────────────────────────────────────────────
  console.log(`\n  ${C.bold}${C.cyan}BILLING MODEL PREFERENCE${C.reset}`);
  console.log(`  ${BAR}`);
  console.log(`  ${C.dim}${num(wantsBilling.length)} runs expressed a billing preference — ${pct(billingGapRate)} had zero matching firms${C.reset}`);
  const billingPrefOrder = ["flat_fee", "hourly", "retainer"];
  for (const p of billingPrefOrder) {
    const v = billingByPref[p];
    if (!v) continue;
    const rate = (v.gap / v.total) * 100;
    const bBar = `${C.yellow}${"█".repeat(Math.max(1, Math.round(rate / 2)))}${C.reset}`;
    const label = p === "flat_fee" ? "flat-fee" : p;
    console.log(
      `    ${label.padEnd(12)}  ${C.bold}${pct(rate).padStart(6)}${C.reset} gap` +
      `  ${C.dim}(${v.gap}/${v.total} runs)${C.reset}  ${bBar}`
    );
  }
  if (billingWorstCats.length > 0) {
    console.log(`\n    ${C.dim}Worst categories for billing gaps:${C.reset}`);
    for (const cat of billingWorstCats.slice(0, 5)) {
      const cBar = `${C.yellow}${"█".repeat(Math.max(1, Math.round(cat.rate / 3)))}${C.reset}`;
      console.log(
        `      ${cat.label.padEnd(44)}  ${C.bold}${pct(cat.rate).padStart(6)}${C.reset}` +
        `  ${C.dim}(${cat.gap}/${cat.total})${C.reset}  ${cBar}`
      );
    }
  }

  // ── LANGUAGE ───────────────────────────────────────────────────────────────
  console.log(`\n  ${C.bold}${C.cyan}LANGUAGE PREFERENCE${C.reset}`);
  console.log(`  ${BAR}`);
  console.log(`  ${C.dim}${num(needsLanguage.length)} runs needed non-English capability — ${pct(languageGapRate)} had zero matching firms${C.reset}`);
  if (langWorstCats.length > 0) {
    console.log(`    ${C.dim}Worst categories:${C.reset}`);
    for (const cat of langWorstCats.slice(0, 5)) {
      const cBar = `${C.yellow}${"█".repeat(Math.max(1, Math.round(cat.rate / 3)))}${C.reset}`;
      console.log(
        `      ${cat.label.padEnd(44)}  ${C.bold}${pct(cat.rate).padStart(6)}${C.reset}` +
        `  ${C.dim}(${cat.gap}/${cat.total})${C.reset}  ${cBar}`
      );
    }
  }

  // ── INDUSTRY ───────────────────────────────────────────────────────────────
  console.log(`\n  ${C.bold}${C.cyan}INDUSTRY PREFERENCE${C.reset}`);
  console.log(`  ${BAR}`);
  console.log(`  ${C.dim}${num(wantsIndustry.length)} runs had an industry — ${pct(industryGapRate)} had zero firms with that industry${C.reset}`);
  const industryBySlugSorted = Object.entries(industryBySlug)
    .map(([slug, v]) => ({ slug, rate: (v.gap / v.total) * 100, gap: v.gap, total: v.total }))
    .sort((a, b) => b.rate - a.rate);
  for (const s of industryBySlugSorted) {
    const iBar = `${C.yellow}${"█".repeat(Math.max(1, Math.round(s.rate / 2)))}${C.reset}`;
    console.log(
      `    ${s.slug.padEnd(16)}  ${C.bold}${pct(s.rate).padStart(6)}${C.reset} gap` +
      `  ${C.dim}(${s.gap}/${s.total} runs)${C.reset}  ${iBar}`
    );
  }
  if (industryWorstCats.length > 0) {
    console.log(`\n    ${C.dim}Worst categories for industry gaps:${C.reset}`);
    for (const cat of industryWorstCats.slice(0, 5)) {
      const cBar = `${C.yellow}${"█".repeat(Math.max(1, Math.round(cat.rate / 3)))}${C.reset}`;
      console.log(
        `      ${cat.label.padEnd(44)}  ${C.bold}${pct(cat.rate).padStart(6)}${C.reset}` +
        `  ${C.dim}(${cat.gap}/${cat.total})${C.reset}  ${cBar}`
      );
    }
  }

  console.log(`\n${C.bold}${C.blue}${DBAR}${C.reset}\n`);
}

main();
