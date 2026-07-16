import { createClient } from "./server";
import { mapDbFirmToFirm } from "./mappers";
import { Firm, LegalCategory, IntakeQuestion, AssessmentCriterion } from "@/types";
import { DbFirm } from "./types";
import { firms as localFirms, getFirmById as getLocalFirmById, getFirmsByPracticeArea as getLocalFirmsByPracticeArea } from "@/data/firms";
import { US_STATES } from "@/data/intakeV2";

const FIRM_SELECT = `
  *,
  attorneys ( * ),
  firm_assessment_items (
    id,
    criterion_id,
    passed,
    note,
    display_order,
    assessment_criteria ( id, label, description, display_order )
  ),
  firm_practice_areas ( practice_area_slug )
`;

export async function getAllFirms(): Promise<Firm[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("firms")
      .select(FIRM_SELECT)
      .order("overall_score", { ascending: false });

    if (!error && data && data.length > 0) {
      return (data as DbFirm[]).map(mapDbFirmToFirm);
    }
  } catch {
    // Supabase unavailable
  }
  return [...localFirms].sort((a, b) => b.overallScore - a.overallScore);
}

export async function getFirmById(id: string): Promise<Firm | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("firms")
      .select(FIRM_SELECT)
      .eq("id", id)
      .single();

    if (!error && data) return mapDbFirmToFirm(data as DbFirm);
  } catch {
    // Supabase unavailable
  }
  return getLocalFirmById(id) ?? null;
}

export async function getFirmsByPracticeArea(slug: string): Promise<Firm[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("firms")
      .select(`${FIRM_SELECT}, firm_practice_areas!inner(practice_area_slug)`)
      .eq("firm_practice_areas.practice_area_slug", slug)
      .order("overall_score", { ascending: false });

    if (!error && data && data.length > 0) {
      return (data as DbFirm[]).map(mapDbFirmToFirm);
    }
  } catch {
    // Supabase unavailable
  }
  return getLocalFirmsByPracticeArea(slug);
}

const VALID_STATE_ABBRS = new Set(US_STATES.map((s) => s.value).filter((v) => v !== "outside_us"));

// Firm locations are freeform strings ("New York, NY", "Phoenix, AZ (serves Tucson &
// Arizona)", "San Francisco", "London, UK") — pull the state code off the tail after
// the last comma and validate it against real US state/DC codes, so descriptive
// suffixes and non-US locations don't produce bogus "states".
function extractStateAbbr(location: string): string | null {
  const tail = location.split(",").pop()?.trim() ?? "";
  const match = tail.match(/^([A-Z]{2})\b/);
  return match && VALID_STATE_ABBRS.has(match[1]) ? match[1] : null;
}

// Powers the intake wizard's state dropdown so it only lists states the firm
// database can actually serve, instead of all 50+DC regardless of coverage.
// Paginated in 1000-row pages since PostgREST caps a single request's rows.
export async function getAvailableFirmStates(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const abbrs = new Set<string>();
    let offset = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("firms")
        .select("location")
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const row of data as { location: string }[]) {
        const abbr = extractStateAbbr(row.location);
        if (abbr) abbrs.add(abbr);
      }
      if (data.length < pageSize) break;
      offset += pageSize;
    }
    if (abbrs.size > 0) return [...abbrs].sort();
  } catch {
    // Supabase unavailable
  }
  return [...new Set(
    localFirms.map((f) => extractStateAbbr(f.location)).filter((a): a is string => !!a)
  )].sort();
}

export async function getAllCategories(): Promise<LegalCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_categories")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToCategory);
}

export async function getCategoryBySlug(slug: string): Promise<LegalCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return rowToCategory(data);
}

export async function getQuestionsForCategory(slug: string): Promise<IntakeQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intake_questions")
    .select("*")
    .eq("active", true)
    .in("category_slug", ["global", slug])
    .order("display_order");

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    categorySlug: row.category_slug,
    order: row.display_order,
    question: row.question,
    subtext: row.subtext ?? undefined,
    type: row.type,
    options: row.options ?? undefined,
    min: row.min_value ?? undefined,
    max: row.max_value ?? undefined,
    step: row.step_value ?? undefined,
    required: row.required,
  }));
}

export async function getAllAssessmentCriteria(): Promise<AssessmentCriterion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_criteria")
    .select("*")
    .eq("active", true)
    .order("display_order");

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    description: row.description ?? undefined,
    displayOrder: row.display_order,
    active: row.active,
  }));
}

function rowToCategory(row: Record<string, unknown>): LegalCategory {
  return {
    slug: row.slug as string,
    name: row.name as string,
    icon: row.icon as string,
    shortDescription: row.short_description as string,
    fullDescription: row.full_description as string,
    whatFirmsDo: row.what_firms_do as string,
    serviceExamples: row.service_examples as string[],
    heroTag: row.hero_tag as string,
  };
}
