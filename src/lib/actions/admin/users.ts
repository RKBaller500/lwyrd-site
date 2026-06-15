"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./audit";

export interface AdminUserRow {
  id: string;
  name: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  access_level: "none" | "subscription" | "org";
  created_at: string;
  saved_firms_count: number;
}

export async function getAllUsers(): Promise<{
  data?: AdminUserRow[];
  error?: string;
}> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();

  // Get all profiles
  const { data: profiles, error: profilesError } = await db
    .from("profiles")
    .select("id, full_name, is_admin, role, access_level, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) return { error: profilesError.message };

  // Get saved firms counts per user
  const { data: savedCounts } = await db
    .from("saved_firms")
    .select("user_id");

  const countMap: Record<string, number> = {};
  (savedCounts ?? []).forEach((row: { user_id: string }) => {
    countMap[row.user_id] = (countMap[row.user_id] ?? 0) + 1;
  });

  // Get emails from auth.users via admin API
  const {
    data: { users: authUsers },
  } = await db.auth.admin.listUsers();

  const emailMap: Record<string, string> = {};
  authUsers.forEach((u) => {
    emailMap[u.id] = u.email ?? "";
  });

  const rows: AdminUserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    name: p.full_name,
    email: emailMap[p.id] ?? "",
    is_admin: p.role === "admin" || p.is_admin,
    access_level: (p.access_level as "none" | "subscription" | "org") ?? "none",
    created_at: p.created_at,
    saved_firms_count: countMap[p.id] ?? 0,
  }));

  return { data: rows };
}

export async function setAdminStatus(
  userId: string,
  isAdmin: boolean
): Promise<{ error?: string }> {
  if (!userId || userId.trim().length === 0) return { error: "userId is required" };
  if (typeof isAdmin !== "boolean") return { error: "isAdmin must be a boolean" };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ is_admin: isAdmin, role: isAdmin ? "admin" : "user" })
    .eq("id", userId);

  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "set_admin_status", targetType: "user", targetId: userId, after: { is_admin: isAdmin, role: isAdmin ? "admin" : "user" } });

  revalidatePath("/admin/users");
  return {};
}

const VALID_ACCESS_LEVELS = ["none", "subscription", "org"] as const;

export async function setAccessLevel(
  userId: string,
  level: "none" | "subscription" | "org"
): Promise<{ error?: string }> {
  if (!userId || userId.trim().length === 0) return { error: "userId is required" };
  if (!(VALID_ACCESS_LEVELS as readonly string[]).includes(level))
    return { error: `level must be one of: ${VALID_ACCESS_LEVELS.join(", ")}` };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ access_level: level })
    .eq("id", userId);

  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "set_access_level", targetType: "user", targetId: userId, after: { access_level: level } });

  revalidatePath("/admin/users");
  return {};
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  if (!userId || userId.trim().length === 0) return { error: "userId is required" };

  let actor;
  try {
    actor = await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  void logAdminAction({ actorId: actor.id, action: "delete_user", targetType: "user", targetId: userId });

  revalidatePath("/admin/users");
  return {};
}
