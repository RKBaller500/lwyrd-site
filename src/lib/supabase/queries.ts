import { createClient } from "./server";
import { mapDbFirmToFirm } from "./mappers";
import { Firm, LegalCategory, IntakeQuestion, AssessmentCriterion } from "@/types";
import { DbFirm } from "./types";

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
  )
`;

export async function getAllFirms(): Promise<Firm[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("firms")
    .select(FIRM_SELECT)
    .order("overall_score", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DbFirm[]).map(mapDbFirmToFirm);
}

export async function getFirmById(id: string): Promise<Firm | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("firms")
    .select(FIRM_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapDbFirmToFirm(data as DbFirm);
}

export async function getFirmsByPracticeArea(slug: string): Promise<Firm[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("firms")
    .select(FIRM_SELECT)
    .contains("practice_areas", [slug])
    .order("overall_score", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DbFirm[]).map(mapDbFirmToFirm);
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
