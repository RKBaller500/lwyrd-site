"use server";

import { createClient } from "@/lib/supabase/server";
import { reconcilePreviewCookieUnlocks } from "@/lib/paywallUnlocks";

export interface DashboardIntake {
  id: string;
  categorySlug: string;
  categoryLabel: string;
  legalCategory: string;
  track: string | null;
  createdAt: string;
  matchCount: number;
  topScore: number | null;
  unlocked: boolean;
}

export interface DashboardSavedFirm {
  firmId: string;
  savedAt: string;
  firm: {
    id: string;
    name: string;
    tagline: string | null;
    location: string | null;
    size: string | null;
    overallScore: number | null;
    verified: boolean;
  } | null;
}

export interface DashboardData {
  intakes: DashboardIntake[];
  savedFirms: DashboardSavedFirm[];
  unlockCreditsAvailable: number;
}

type IntakeRow = {
  id: string;
  category_slug: string | null;
  legal_category: string | null;
  category_label: string | null;
  created_at: string;
  track: string | null;
  top_matches: { score?: number }[] | null;
  matches?: { match_rank: number | null; match_score: number | null }[] | null;
};

type FirmRow = {
  id: string;
  name: string;
  tagline: string | null;
  location: string | null;
  size: string | null;
  overall_score: number | null;
  verified: boolean | null;
  is_verified?: boolean | null;
};

type SavedFirmRow = {
  firm_id: string;
  saved_at: string;
  firms?: FirmRow | FirmRow[] | null;
};

type UnlockRow = {
  intake_submission_id: string | null;
};

type CreditLedgerRow = {
  delta: number | null;
};

function titleize(value: string | null | undefined): string {
  if (!value) return "Legal intake";
  return value
    .replace(/^[^/]+\//, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeFirm(firms: SavedFirmRow["firms"]): FirmRow | null {
  if (Array.isArray(firms)) return firms[0] ?? null;
  return firms ?? null;
}

function normalizeIntake(row: IntakeRow, unlockedIds: Set<string>): DashboardIntake {
  const matches = row.matches ?? [];
  const topMatches = row.top_matches ?? [];
  const matchCount = matches.length || topMatches.length;
  const scores = [
    ...matches.map((match) => match.match_score),
    ...topMatches.map((match) => match.score ?? null),
  ].filter((score): score is number => typeof score === "number");

  return {
    id: row.id,
    categorySlug: row.category_slug ?? "",
    legalCategory: row.legal_category ?? "",
    categoryLabel: row.category_label ?? titleize(row.legal_category ?? row.category_slug),
    track: row.track,
    createdAt: row.created_at,
    matchCount,
    topScore: scores.length ? Math.round(Math.max(...scores)) : null,
    unlocked: unlockedIds.has(row.id),
  };
}

function normalizeSavedFirm(row: SavedFirmRow): DashboardSavedFirm {
  const firm = normalizeFirm(row.firms);
  return {
    firmId: row.firm_id,
    savedAt: row.saved_at,
    firm: firm
      ? {
          id: firm.id,
          name: firm.name,
          tagline: firm.tagline,
          location: firm.location,
          size: firm.size,
          overallScore: firm.overall_score,
          verified: firm.verified ?? firm.is_verified ?? false,
        }
      : null,
  };
}

export async function getDashboardData(): Promise<{ data?: DashboardData; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const [intakesRes, savedRes, unlocksRes, creditsRes] = await Promise.all([
    supabase
      .from("intake_submissions")
      .select("id, category_slug, legal_category, category_label, created_at, track, top_matches, matches(match_rank, match_score)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_firms")
      .select("firm_id, saved_at, firms(id, name, tagline, location, size, overall_score, verified, is_verified)")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false }),
    supabase
      .from("intake_unlocks")
      .select("intake_submission_id")
      .eq("user_id", user.id),
    supabase
      .from("unlock_credit_ledger")
      .select("delta")
      .eq("user_id", user.id),
  ]);

  if (intakesRes.error) return { error: intakesRes.error.message };
  if (savedRes.error) return { error: savedRes.error.message };

  const unlockedIds = new Set(
    (((unlocksRes.error ? [] : unlocksRes.data) ?? []) as UnlockRow[])
      .map((row) => row.intake_submission_id)
      .filter((id): id is string => !!id)
  );
  const cookieUnlockedIds = await reconcilePreviewCookieUnlocks(supabase, user.id);
  cookieUnlockedIds.forEach((id) => unlockedIds.add(id));
  const unlockCreditsAvailable = Math.max(
    0,
    (((creditsRes.error ? [] : creditsRes.data) ?? []) as CreditLedgerRow[])
      .reduce((sum, row) => sum + (row.delta ?? 0), 0)
  );

  return {
    data: {
      intakes: ((intakesRes.data ?? []) as IntakeRow[]).map((row) => normalizeIntake(row, unlockedIds)),
      savedFirms: ((savedRes.data ?? []) as SavedFirmRow[]).map(normalizeSavedFirm),
      unlockCreditsAvailable,
    },
  };
}
