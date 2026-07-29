import { Firm } from "@/types";
import { DbFirm } from "./types";

function fallbackContactType(id: string): Firm["contactType"] {
  const bucket = id.length % 3;
  if (bucket === 0) return "form";
  if (bucket === 1) return "email";
  return "phone";
}

function normalizeCostTier(cost: string | null | undefined): Firm["costTier"] {
  if (cost === "$" || cost === "$$" || cost === "$$$") return cost;
  return undefined;
}

export function mapDbFirmToFirm(row: DbFirm): Firm {
  const contactType = row.contact_type ?? fallbackContactType(row.id);
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url ?? undefined,
    tagline: row.tagline,
    location: row.location,
    founded: row.founded_year ?? row.founded ?? 0,
    size: row.size,
    practiceAreas: (row.firm_practice_areas && row.firm_practice_areas.length > 0)
      ? row.firm_practice_areas.map((pa) => pa.practice_area_slug).filter(Boolean)
      : row.practice_areas,
    industries: row.industries,
    companyStages: row.company_stages,
    budgetRange: { min: row.typical_budget_min ?? row.budget_min, max: row.typical_budget_max ?? row.budget_max },
    billingModel: row.primary_billing_model ?? row.billing_model,
    hourlyRate: row.hourly_rate ?? undefined,
    responseTime: row.response_time,
    languages: row.languages,
    description: row.bio ?? row.description,
    strengths: row.strengths,
    team: (row.attorneys ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((a) => ({
        name: a.name,
        title: a.title,
        bio: a.bio,
        barAdmissions: a.bar_admissions,
      })),
    assessment: (row.firm_assessment_items ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((a) => ({
        criterionId: a.criterion_id,
        label: a.assessment_criteria?.label ?? "",
        passed: a.passed,
        note: a.note ?? undefined,
      })),
    overallScore: row.overall_score,
    verified: row.is_verified ?? row.verified,
    costTier: normalizeCostTier(row.cost),
    googleReview: row.google_review ?? undefined,
    googleReviewCount: row.google_review_count ?? undefined,
    contactType,
    contactUrl: row.contact_url ?? `https://www.google.com/search?q=${encodeURIComponent(`${row.name} contact`)}`,
    contactEmail: row.contact_email ?? `intake@${row.id.replace(/[^a-z0-9-]/g, "")}.example`,
    contactPhone: row.contact_phone ?? "(212) 555-0198",
  };
}
