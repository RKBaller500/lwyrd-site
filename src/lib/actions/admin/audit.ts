"use server";

import { createAdminClient } from "@/lib/supabase/admin";

interface AuditEntry {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export async function logAdminAction(entry: AuditEntry): Promise<void> {
  try {
    const db = createAdminClient();
    await db.from("admin_audit_log").insert({
      actor_id: entry.actorId,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
    });
  } catch {
    // Never block the primary action if audit logging fails
  }
}
