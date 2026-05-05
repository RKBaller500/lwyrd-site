"use server";

import { verifyAdmin, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface AdminUserRow {
  id: string;
  name: string;
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
    .select("id, name, is_admin, access_level, created_at")
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
    name: p.name,
    email: emailMap[p.id] ?? "",
    is_admin: p.is_admin,
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
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}

export async function setAccessLevel(
  userId: string,
  level: "none" | "subscription" | "org"
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ access_level: level })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const db = createAdminClient();
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}
