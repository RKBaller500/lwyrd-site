import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type UnlockTierId = "single" | "bundle_3" | "bundle_5";
export type UnlockSource = "preview" | "stripe" | "credit";

export const UNLOCK_TIERS: Record<UnlockTierId, {
  id: UnlockTierId;
  name: string;
  credits: number;
  priceCents: number;
}> = {
  single: { id: "single", name: "1 intake", credits: 1, priceCents: 2500 },
  bundle_3: { id: "bundle_3", name: "3-intake bundle", credits: 3, priceCents: 6000 },
  bundle_5: { id: "bundle_5", name: "5-intake bundle", credits: 5, priceCents: 10000 },
};

type Client = SupabaseClient;

function writeClient(fallback: Client): Client {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient() as Client;
  }
  void fallback;
  throw new Error("Server payment writes are not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable unlock previews.");
}

async function hasCookiePreviewUnlock(submissionId?: string | null): Promise<boolean> {
  if (!submissionId) return false;
  const ids = await getPreviewUnlockCookieIds();
  return ids.includes(submissionId);
}

export async function getPreviewUnlockCookieIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("lwyrd_preview_unlock")?.value ?? "";
  return Array.from(new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  ));
}

export async function previewUnlockCookieValue(submissionId: string): Promise<string> {
  const cookieStore = await cookies();
  const current = cookieStore.get("lwyrd_preview_unlock")?.value ?? "";
  const ids = current
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return Array.from(new Set([...ids, submissionId])).join(",");
}

export async function userOwnsSubmission(
  supabase: Client,
  userId: string,
  submissionId?: string | null
): Promise<boolean> {
  if (!submissionId) return false;
  const { data, error } = await supabase
    .from("intake_submissions")
    .select("id")
    .eq("id", submissionId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && !!data;
}

export async function hasDurableIntakeUnlock(
  supabase: Client,
  userId: string,
  submissionId?: string | null
): Promise<boolean> {
  if (!submissionId) return false;

  const { data, error } = await supabase
    .from("intake_unlocks")
    .select("id")
    .eq("user_id", userId)
    .eq("intake_submission_id", submissionId)
    .maybeSingle();

  if (!error && data) return true;
  return hasCookiePreviewUnlock(submissionId);
}

export async function reconcilePreviewCookieUnlocks(
  supabase: Client,
  userId: string
): Promise<Set<string>> {
  const cookieIds = await getPreviewUnlockCookieIds();
  if (cookieIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("intake_submissions")
    .select("id")
    .eq("user_id", userId)
    .in("id", cookieIds);

  if (error || !data) return new Set();

  const ownedIds = (data as { id: string }[]).map((row) => row.id);
  const ownedSet = new Set(ownedIds);

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && ownedIds.length > 0) {
    try {
      const writer = createAdminClient() as Client;
      await writer.from("intake_unlocks").upsert(
        ownedIds.map((id) => ({
          user_id: userId,
          intake_submission_id: id,
          source: "preview",
          purchase_tier: "single",
          metadata: { reconciledFromCookie: true },
        })),
        { onConflict: "user_id,intake_submission_id" }
      );
    } catch {
      // Cookie unlocks still count for this session; durable backfill can retry later.
    }
  }

  return ownedSet;
}

export async function getUnlockCreditBalance(supabase: Client, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("unlock_credit_ledger")
    .select("delta")
    .eq("user_id", userId);

  if (error || !data) return 0;
  return Math.max(0, data.reduce((sum: number, row: { delta: number | null }) => sum + (row.delta ?? 0), 0));
}

export async function getPaywallAccountState(
  supabase: Client,
  userId: string,
  submissionId?: string | null
): Promise<{ creditsAvailable: number; currentIntakeUnlocked: boolean }> {
  const [creditsAvailable, currentIntakeUnlocked] = await Promise.all([
    getUnlockCreditBalance(supabase, userId),
    hasDurableIntakeUnlock(supabase, userId, submissionId),
  ]);

  return { creditsAvailable, currentIntakeUnlocked };
}

async function insertLedger(
  supabase: Client,
  row: {
    user_id: string;
    intake_submission_id?: string | null;
    delta: number;
    reason: string;
    source: UnlockSource;
    tier?: UnlockTierId | null;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from("unlock_credit_ledger").insert({
    user_id: row.user_id,
    intake_submission_id: row.intake_submission_id ?? null,
    delta: row.delta,
    reason: row.reason,
    source: row.source,
    tier: row.tier ?? null,
    metadata: row.metadata ?? {},
  });

  if (error) throw new Error(error.message);
}

async function unlockIntake(
  supabase: Client,
  userId: string,
  submissionId: string,
  source: UnlockSource,
  tier?: UnlockTierId | null
) {
  const { error } = await supabase
    .from("intake_unlocks")
    .upsert(
      {
        user_id: userId,
        intake_submission_id: submissionId,
        source,
        purchase_tier: tier ?? null,
      },
      { onConflict: "user_id,intake_submission_id" }
    );

  if (error) throw new Error(error.message);
}

export async function grantPreviewUnlockPurchase({
  supabase,
  userId,
  submissionId,
  tierId,
}: {
  supabase: Client;
  userId: string;
  submissionId?: string | null;
  tierId: UnlockTierId;
}): Promise<{ creditsAvailable: number; currentIntakeUnlocked: boolean }> {
  const tier = UNLOCK_TIERS[tierId];
  if (!tier) throw new Error("Invalid unlock option.");

  const writer = writeClient(supabase);
  const purchaseId = crypto.randomUUID();
  const hasSubmission = !!submissionId;

  if (hasSubmission) {
    const owned = await userOwnsSubmission(supabase, userId, submissionId);
    if (!owned) throw new Error("Intake not found.");
  }

  await insertLedger(writer, {
    user_id: userId,
    intake_submission_id: submissionId ?? null,
    delta: tier.credits,
    reason: "preview_purchase",
    source: "preview",
    tier: tierId,
    metadata: { purchaseId, priceCents: tier.priceCents },
  });

  if (submissionId) {
    const alreadyUnlocked = await hasDurableIntakeUnlock(supabase, userId, submissionId);
    if (!alreadyUnlocked) {
      await unlockIntake(writer, userId, submissionId, "preview", tierId);
      await insertLedger(writer, {
        user_id: userId,
        intake_submission_id: submissionId,
        delta: -1,
        reason: "intake_unlock",
        source: "preview",
        tier: tierId,
        metadata: { purchaseId },
      });
    }
  }

  return getPaywallAccountState(supabase, userId, submissionId);
}

export async function unlockIntakeWithExistingCredit({
  supabase,
  userId,
  submissionId,
}: {
  supabase: Client;
  userId: string;
  submissionId: string;
}): Promise<{ creditsAvailable: number; currentIntakeUnlocked: boolean }> {
  const owned = await userOwnsSubmission(supabase, userId, submissionId);
  if (!owned) throw new Error("Intake not found.");

  const alreadyUnlocked = await hasDurableIntakeUnlock(supabase, userId, submissionId);
  if (alreadyUnlocked) return getPaywallAccountState(supabase, userId, submissionId);

  const creditsAvailable = await getUnlockCreditBalance(supabase, userId);
  if (creditsAvailable < 1) throw new Error("No unlock credits available.");

  const writer = writeClient(supabase);
  await unlockIntake(writer, userId, submissionId, "credit", null);
  await insertLedger(writer, {
    user_id: userId,
    intake_submission_id: submissionId,
    delta: -1,
    reason: "intake_unlock",
    source: "credit",
    metadata: { appliedAt: new Date().toISOString() },
  });

  return getPaywallAccountState(supabase, userId, submissionId);
}
