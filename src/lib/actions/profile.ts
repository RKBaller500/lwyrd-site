"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateProfile(name: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  return {};
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const db = createAdminClient();

  // Explicitly delete all user-owned data before removing the auth record.
  // FK cascades may handle some of this, but explicit deletion ensures nothing is orphaned.
  await db.from("saved_firms").delete().eq("user_id", user.id);
  await db.from("startup_submissions").delete().eq("user_id", user.id);
  await db.from("individual_submissions").delete().eq("user_id", user.id);
  await db.from("small_business_submissions").delete().eq("user_id", user.id);
  await db.from("intake_submissions").delete().eq("user_id", user.id);

  // Deleting from auth.users will cascade-delete the profiles row.
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  return {};
}
