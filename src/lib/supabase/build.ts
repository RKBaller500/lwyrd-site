// Build-time Supabase client — does NOT use cookies.
// Use only inside generateStaticParams() which runs without an HTTP request context.
import { createClient } from "@supabase/supabase-js";

export function createBuildTimeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getAllFirmIdsForStaticParams(): Promise<{ id: string }[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = createBuildTimeClient();
  const { data } = await supabase.from("firms").select("id");
  return (data ?? []).map((row) => ({ id: row.id as string }));
}

export async function getAllCategorySlugsForStaticParams(): Promise<
  { slug: string }[]
> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = createBuildTimeClient();
  const { data } = await supabase.from("legal_categories").select("slug");
  return (data ?? []).map((row) => ({ slug: row.slug as string }));
}
