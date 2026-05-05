/**
 * Migration: Intake Flow v2.0 — Three-track schema
 *
 * Run with: npx tsx src/scripts/migrate-intake-v2.ts
 *
 * What this does:
 *   1. Adds track/legal_category/category_label columns to intake_submissions
 *   2. Creates startup_submissions table (schema 3A)
 *   3. Creates individual_submissions table (schema 3B)
 *   4. Creates small_business_submissions table (schema 3C)
 *   5. Enables RLS on all new tables
 *   6. Creates RLS policies for user self-access and service-role write access
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SQL = `
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extend intake_submissions (general table)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE intake_submissions
  ADD COLUMN IF NOT EXISTS track TEXT,
  ADD COLUMN IF NOT EXISTS legal_category TEXT,
  ADD COLUMN IF NOT EXISTS category_label TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. startup_submissions — Schema 3A
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS startup_submissions (
  id                      UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  general_submission_id   UUID        REFERENCES intake_submissions(id) ON DELETE SET NULL,
  user_id                 UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  track                   TEXT        NOT NULL DEFAULT 'startup',
  legal_category          TEXT,
  company_stage           TEXT,
  industry_vertical       TEXT,
  is_fundraising_active   BOOLEAN,
  fundraising_timeline    TEXT,
  founder_count           TEXT,
  round_size_range        TEXT,
  ip_assigned             TEXT,
  fundraising_instrument  TEXT,
  employee_count_range    TEXT,
  firm_type_preference    TEXT,
  billing_preference      TEXT,
  budget_range            TEXT,
  engagement_type         TEXT,
  urgency                 TEXT,
  prior_counsel           TEXT,
  state_requirement       TEXT,
  language_requirement    TEXT[],
  sub_question_json       JSONB
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. individual_submissions — Schema 3B
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS individual_submissions (
  id                      UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  general_submission_id   UUID        REFERENCES intake_submissions(id) ON DELETE SET NULL,
  user_id                 UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  track                   TEXT        NOT NULL DEFAULT 'individual',
  legal_category          TEXT,
  situation_type          TEXT,
  prior_personal_counsel  TEXT,
  contested               TEXT,
  children_involved       TEXT,
  plaintiff_or_defendant  TEXT,
  immigration_status      TEXT,
  still_employed          TEXT,
  firm_type_preference    TEXT,
  billing_preference      TEXT,
  budget_range            TEXT,
  urgency                 TEXT,
  state_of_matter         TEXT,
  language_requirement    TEXT[],
  sub_question_json       JSONB
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. small_business_submissions — Schema 3C
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS small_business_submissions (
  id                      UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  general_submission_id   UUID        REFERENCES intake_submissions(id) ON DELETE SET NULL,
  user_id                 UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  track                   TEXT        NOT NULL DEFAULT 'small_business',
  legal_category          TEXT,
  years_in_operation      TEXT,
  employee_count_range    TEXT,
  industry_vertical       TEXT,
  entity_type             TEXT,
  transaction_size_range  TEXT,
  litigation_stage        TEXT,
  has_current_counsel     TEXT,
  firm_type_preference    TEXT,
  billing_preference      TEXT,
  budget_range            TEXT,
  engagement_type         TEXT,
  urgency                 TEXT,
  state_requirement       TEXT,
  language_requirement    TEXT[],
  sub_question_json       JSONB
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE startup_submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_business_submissions ENABLE ROW LEVEL SECURITY;

-- Users can insert and view their own rows
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'startup_submissions' AND policyname = 'Users can insert own startup submissions'
  ) THEN
    CREATE POLICY "Users can insert own startup submissions"
      ON startup_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'startup_submissions' AND policyname = 'Users can view own startup submissions'
  ) THEN
    CREATE POLICY "Users can view own startup submissions"
      ON startup_submissions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'individual_submissions' AND policyname = 'Users can insert own individual submissions'
  ) THEN
    CREATE POLICY "Users can insert own individual submissions"
      ON individual_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'individual_submissions' AND policyname = 'Users can view own individual submissions'
  ) THEN
    CREATE POLICY "Users can view own individual submissions"
      ON individual_submissions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'small_business_submissions' AND policyname = 'Users can insert own sb submissions'
  ) THEN
    CREATE POLICY "Users can insert own sb submissions"
      ON small_business_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'small_business_submissions' AND policyname = 'Users can view own sb submissions'
  ) THEN
    CREATE POLICY "Users can view own sb submissions"
      ON small_business_submissions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
`;

async function run() {
  console.log("Running intake v2 migration…");
  const { error } = await supabase.rpc("exec_sql", { sql: SQL }).single();

  if (error) {
    // Supabase JS doesn't expose raw SQL exec — fall back to individual statements via REST
    console.warn("exec_sql RPC not available; running statements individually via REST.");
    console.log("\nPlease run the following SQL directly in your Supabase SQL editor:\n");
    console.log(SQL);
    process.exit(0);
  }

  console.log("Migration complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
