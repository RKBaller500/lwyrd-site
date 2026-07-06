/**
 * Simulation: verify that disabled billing options are never selectable
 * across all (track, category) combos.
 *
 * Usage: npx tsx scripts/sim-billing.ts
 */

import { getQuestionSequence } from "../src/data/intakeV2";

type V2Track = "startup" | "individual" | "small_business";

const TRACKS_AND_CATEGORIES: Record<V2Track, string[]> = {
  startup: [
    "formation", "ip", "fundraising", "employment", "contracts",
    "regulatory", "governance", "ma", "dispute",
  ],
  individual: [
    "family", "estate", "real_estate", "personal_injury", "immigration",
    "employment", "tax", "criminal", "bankruptcy", "consumer",
  ],
  small_business: [
    "formation", "contracts", "employment", "ip", "disputes",
    "real_estate", "regulatory", "tax", "ma", "data_privacy",
  ],
};

const BILLING_QUESTION_IDS = new Set(["sf2", "if2", "bf2"]);

// Ground truth for what should be blocked per (track, category)
const EXPECTED_DISABLED: Partial<Record<V2Track, Record<string, string[]>>> = {
  individual: {
    family:       ["contingency"],
    estate:       ["contingency"],
    real_estate:  ["contingency"],
    immigration:  ["contingency"],
    tax:          ["contingency"],
    criminal:     ["contingency"],
    bankruptcy:   ["contingency"],
    consumer:     ["contingency"],
  },
  startup: {
    ip:          ["equity"],
    employment:  ["equity"],
    contracts:   ["equity"],
    regulatory:  ["equity"],
    governance:  ["equity", "flat_fee"],
    ma:          ["equity", "flat_fee"],
    dispute:     ["equity", "flat_fee"],
    fundraising: ["flat_fee"],
  },
  small_business: {
    disputes:   ["flat_fee"],
    ma:         ["flat_fee"],
    regulatory: ["flat_fee"],
  },
};

const allCombos = Object.entries(TRACKS_AND_CATEGORIES) as [V2Track, string[]][];
const totalCombos = allCombos.reduce((a, [, cats]) => a + cats.length, 0);
const TRIALS_PER_COMBO = Math.ceil(1_000_000 / totalCombos);

let totalTrials = 0;
let failures = 0;
const failureLog: string[] = [];

for (const [track, categories] of allCombos) {
  for (const category of categories) {
    const questions = getQuestionSequence(track, category);
    const billingQ = questions.find((q) => BILLING_QUESTION_IDS.has(q.id));
    if (!billingQ) continue;

    const shouldBeDisabled = new Set(
      EXPECTED_DISABLED[track]?.[category] ?? []
    );

    // Deterministic check: every option, every combo
    for (const opt of billingQ.options) {
      const shouldBlock = shouldBeDisabled.has(opt.value);
      const isBlocked   = opt.disabled === true;

      if (shouldBlock && !isBlocked) {
        const msg = `FAIL [${track}/${category}] "${opt.value}" should be disabled but is NOT`;
        if (!failureLog.includes(msg)) { failureLog.push(msg); failures++; }
      }
      if (!shouldBlock && isBlocked) {
        const msg = `FAIL [${track}/${category}] "${opt.value}" is disabled but SHOULD be enabled`;
        if (!failureLog.includes(msg)) { failureLog.push(msg); failures++; }
      }
    }

    // Monte Carlo: random user picks across 1M total trials
    const opts = billingQ.options;
    for (let t = 0; t < TRIALS_PER_COMBO; t++) {
      totalTrials++;
      const picked = opts[Math.floor(Math.random() * opts.length)];
      const shouldBlock = shouldBeDisabled.has(picked.value);
      const isBlocked   = picked.disabled === true;

      if (shouldBlock && !isBlocked) failures++;
      if (!shouldBlock && isBlocked) failures++;
    }
  }
}

console.log(`\n=== Billing Options Simulation ===`);
console.log(`(track, category) combos: ${totalCombos}`);
console.log(`Monte Carlo trials       : ${totalTrials.toLocaleString()}`);
console.log(`Failure events           : ${failures.toLocaleString()}`);
console.log(``);

if (failureLog.length === 0) {
  console.log("All checks passed — no disabled gaps found.");
} else {
  console.log("Failures:");
  for (const f of failureLog) console.log("  " + f);
  process.exit(1);
}

// Summary table of what's disabled
console.log(`\n=== Disabled options per (track, category) ===`);
for (const [track, categories] of allCombos) {
  for (const category of categories) {
    const questions = getQuestionSequence(track, category);
    const billingQ = questions.find((q) => BILLING_QUESTION_IDS.has(q.id));
    if (!billingQ) continue;

    const disabledOpts = billingQ.options.filter((o) => o.disabled);
    if (disabledOpts.length === 0) continue;

    const enabledOpts = billingQ.options.filter((o) => !o.disabled);
    console.log(`  ${track}/${category}`);
    console.log(`    enabled : ${enabledOpts.map((o) => o.value).join(", ")}`);
    console.log(`    disabled: ${disabledOpts.map((o) => o.value).join(", ")}`);
  }
}
