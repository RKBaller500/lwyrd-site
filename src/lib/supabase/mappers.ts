import { Firm } from "@/types";
import { DbFirm } from "./types";

export function mapDbFirmToFirm(row: DbFirm): Firm {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url ?? undefined,
    tagline: row.tagline,
    location: row.location,
    founded: row.founded_year ?? row.founded ?? 0,
    size: row.size,
    practiceAreas: row.practice_areas,
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
  };
}
