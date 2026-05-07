"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveFirm(firmId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("saved_firms")
    .insert({ user_id: user.id, firm_id: firmId });

  if (error && error.code !== "23505") {
    // 23505 = unique_violation (already saved — not an error)
    return { error: error.message };
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return {};
}

export async function unsaveFirm(firmId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("saved_firms")
    .delete()
    .eq("user_id", user.id)
    .eq("firm_id", firmId);

  if (error) return { error: error.message };

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return {};
}

export async function getSavedFirmIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("saved_firms")
    .select("firm_id")
    .eq("user_id", user.id);

  return (data ?? []).map((row) => row.firm_id as string);
}
