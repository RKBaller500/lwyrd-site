/**
 * Run: npx tsx scripts/test-matching.ts
 *
 * Randomly picks valid answers to all intake questions for a random
 * track + category, runs the matching algorithm, and prints every
 * answer plus the ranked firm results with scores and reasons.
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

// ── Supabase fetch ─────────────────────────────────────────────────────────────

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

// ── Random helpers ─────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMulti(opts: { value: string }[]): string[] {
  const count = Math.floor(Math.random() * Math.min(3, opts.length)) + 1;
  return [...opts]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((o) => o.value);
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
  if (q.type === "state-dropdown") {
    return q.options.find((o) => o.value === "NY")?.value ?? "NY";
  }
  if (q.type === "single-select") {
    return pick(q.options).value;
  }
  if (q.type === "multi-select") {
    return pickMulti(q.options);
  }
  if (q.type === "budget-range") {
    return randomBudget(q.min ?? 0, q.max ?? 100000, q.step ?? 2500);
  }
  return "";
}

function resolveLabel(q: V2Question, answer: string | string[] | number): string {
  if (q.type === "budget-range") return `$${(answer as number).toLocaleString()}`;
  if (q.type === "multi-select") {
    return (answer as string[])
      .map((v) => q.options.find((o) => o.value === v)?.label ?? v)
      .join(", ");
  }
  return q.options.find((o) => o.value === answer)?.label ?? String(answer);
}

// ── ANSI colours ───────────────────────────────────────────────────────────────

const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  blue:   "\x1b[34m",
  cyan:   "\x1b[36m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  gray:   "\x1b[90m",
  bgBlue: "\x1b[44m",
  white:  "\x1b[37m",
};

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const firms = await fetchFirms();
  const source = process.env.NEXT_PUBLIC_SUPABASE_URL ? "Supabase" : "local data";
  process.stderr.write(`Loaded ${firms.length} firms from ${source}.\n`);

  const TRACKS: V2Track[] = ["startup", "individual", "small_business"];
  const track = pick(TRACKS);

  const q2 = getQ2ForTrack(track);
  const categoryOpt = pick(q2.options);
  const category = categoryOpt.value;
  const categoryLabel = categoryOpt.label;
  const practiceAreaSlug = CATEGORY_SLUG_MAP[track]?.[category] ?? "corporate-formation";

  const allQuestions: V2Question[] = [
    ...TRACK_CONTEXT_QUESTIONS[track],
    ...getSubQuestions(track, category),
    ...CLOSING_QUESTIONS[track],
  ];

  const answers: Record<string, string | string[] | number> = {};
  const log: Array<{ q: V2Question; label: string }> = [];

  for (const q of allQuestions) {
    const answer = answerQuestion(q);
    answers[q.id] = answer;
    log.push({ q, label: resolveLabel(q, answer) });
  }

  const results = matchFirmsV2(track, category, answers, firms, practiceAreaSlug);

  const BAR  = "─".repeat(68);
  const DBAR = "═".repeat(68);

  console.log(`\n${C.bold}${C.blue}${DBAR}${C.reset}`);
  console.log(`${C.bold}${C.blue}  LWYRD · RANDOM MATCH TEST${C.reset}`);
  console.log(`${C.bold}${C.blue}${DBAR}${C.reset}`);
  console.log();
  console.log(`  ${C.bold}Track${C.reset}     ${track}`);
  console.log(`  ${C.bold}Category${C.reset}  ${categoryLabel}`);
  console.log(`  ${C.bold}Slug${C.reset}      ${practiceAreaSlug}`);

  console.log(`\n${C.bold}${C.cyan}  INTAKE ANSWERS${C.reset}`);
  console.log(`  ${BAR}`);

  for (const { q, label } of log) {
    const qShort = q.text.length > 50 ? q.text.slice(0, 48) + "…" : q.text;
    console.log(
      `  ${C.gray}${q.id.padEnd(5)}${C.reset}  ` +
      `${C.dim}${qShort.padEnd(51)}${C.reset}  ` +
      `${C.bold}${label}${C.reset}`
    );
  }

  console.log(`\n${C.bold}${C.cyan}  MATCH RESULTS${C.reset}  ${C.dim}${results.length} firm${results.length !== 1 ? "s" : ""} matched${C.reset}`);
  console.log(`  ${BAR}`);

  if (results.length === 0) {
    console.log(`\n  ${C.yellow}⚠  No firms matched — all were hard-filtered out.${C.reset}`);
    console.log(`  ${C.dim}Try re-running; a different state or budget may yield results.${C.reset}`);
  } else {
    for (const result of results) {
      const { firm, score, reasons, isBestMatch, matchedCriteria, missedCriteria } = result;

      const scoreColor = score >= 75 ? C.green : score >= 55 ? C.yellow : C.red;
      const filledBars = Math.round(score / 5);
      const bar = `${scoreColor}${"█".repeat(filledBars)}${C.dim}${"░".repeat(20 - filledBars)}${C.reset}`;

      const tag = isBestMatch
        ? `${C.bgBlue}${C.white}${C.bold} BEST MATCH ${C.reset}`
        : `${C.dim}           ${C.reset}`;

      console.log();
      console.log(`  ${tag}  ${C.bold}${firm.name}${C.reset}`);
      console.log(`             ${C.dim}${firm.size} · ${firm.location} · ${firm.billingModel} billing · est. ${firm.founded}${C.reset}`);
      console.log(`             ${scoreColor}${C.bold}${score}${C.reset}${C.dim}/100${C.reset}  ${bar}`);

      if (reasons.length > 0) {
        for (const r of reasons) {
          console.log(`             ${C.green}✓${C.reset}  ${r}`);
        }
      }
      if (matchedCriteria.length > 0) {
        console.log(`             ${C.dim}Matched: ${matchedCriteria.join(", ")}${C.reset}`);
      }
      if (missedCriteria.length > 0) {
        console.log(`             ${C.red}✗${C.reset}  ${C.dim}Missed:  ${missedCriteria.join(", ")}${C.reset}`);
      }
    }
  }

  console.log(`\n${C.bold}${C.blue}${DBAR}${C.reset}\n`);
}

main();
