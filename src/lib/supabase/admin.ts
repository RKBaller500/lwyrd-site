import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";

// Service-role client — bypasses RLS entirely.
// Use ONLY inside server actions, AFTER verifyAdmin() has confirmed the caller is an admin.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Call at the top of every admin server action.
// Returns the authenticated user if they are an admin, throws otherwise.
export async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Not authorized");

  return user;
}
