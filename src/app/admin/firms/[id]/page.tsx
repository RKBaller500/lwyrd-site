import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import FirmForm from "@/components/admin/FirmForm";
import type { FirmInput } from "@/lib/actions/admin/firms";

export const metadata = { title: "Edit Firm — Admin" };

export default async function EditFirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();

  const [
    { data: firm },
    { data: attorneys },
    { data: existingItems },
    { data: allCriteria },
  ] = await Promise.all([
    db.from("firms").select("*").eq("id", id).single(),
    db.from("attorneys").select("*").eq("firm_id", id).order("display_order"),
    db.from("firm_assessment_items").select("*").eq("firm_id", id),
    db.from("assessment_criteria").select("id, label, description").eq("active", true).order("display_order"),
  ]);

  if (!firm) notFound();

  const itemMap = Object.fromEntries(
    (existingItems ?? []).map((item) => [item.criterion_id, item])
  );

  const assessmentItems = (allCriteria ?? []).map((c) => ({
    criterionId: c.id,
    passed: itemMap[c.id]?.passed ?? false,
    note: itemMap[c.id]?.note ?? "",
  }));

  const initialData: FirmInput = {
    id: firm.id,
    name: firm.name,
    tagline: firm.tagline ?? "",
    location: firm.location ?? "",
    founded: firm.founded ?? 0,
    size: firm.size,
    billingModel: firm.billing_model,
    hourlyRate: firm.hourly_rate ?? null,
    budgetMin: firm.budget_min ?? 0,
    budgetMax: firm.budget_max ?? 0,
    responseTime: firm.response_time,
    overallScore: firm.overall_score ?? 0,
    verified: firm.verified ?? false,
    logoUrl: firm.logo_url ?? null,
    description: firm.description ?? "",
    practiceAreas: firm.practice_areas ?? [],
    industries: firm.industries ?? [],
    companyStages: firm.company_stages ?? [],
    languages: firm.languages ?? [],
    strengths: firm.strengths ?? [],
    attorneys: (attorneys ?? []).map((a) => ({
      name: a.name,
      title: a.title ?? "",
      bio: a.bio ?? "",
      barAdmissions: a.bar_admissions ?? [],
    })),
    assessmentItems,
  };

  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        Edit Firm
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Editing <span className="font-medium text-slate-700">{firm.name}</span>
      </p>
      <FirmForm mode="edit" initialData={initialData} allCriteria={allCriteria ?? []} />
    </div>
  );
}
