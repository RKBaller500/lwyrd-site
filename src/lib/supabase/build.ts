// Build-time Supabase client — does NOT use cookies.
// Use only inside generateStaticParams() which runs without an HTTP request context.
import { createClient } from "@supabase/supabase-js";
import { firms as localFirms } from "@/data/firms";

export function createBuildTimeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getAllFirmIdsForStaticParams(): Promise<{ id: string }[]> {
  // Always include local firms so all firm profile pages are statically generated.
  const localIds = localFirms.map((f) => ({ id: f.id }));
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return localIds;
  try {
    const supabase = createBuildTimeClient();
    const { data } = await supabase.from("firms").select("id");
    const dbIds = (data ?? []).map((row) => ({ id: row.id as string }));
    // Merge: db ids take priority, plus any local-only ids
    const dbIdSet = new Set(dbIds.map((r) => r.id));
    const localOnly = localIds.filter((r) => !dbIdSet.has(r.id));
    return [...dbIds, ...localOnly];
  } catch {
    return localIds;
  }
}

export async function getAllCategorySlugsForStaticParams(): Promise<
  { slug: string }[]
> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = createBuildTimeClient();
  const { data } = await supabase.from("legal_categories").select("slug");
  return (data ?? []).map((row) => ({ slug: row.slug as string }));
}
