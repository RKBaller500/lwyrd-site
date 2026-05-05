import { createAdminClient } from "@/lib/supabase/admin";
import FirmForm from "@/components/admin/FirmForm";
import type { AssessmentItemInput } from "@/lib/actions/admin/firms";

export const metadata = { title: "New Firm — Admin" };

export default async function NewFirmPage() {
  const db = createAdminClient();
  const { data: allCriteria } = await db
    .from("assessment_criteria")
    .select("id, label, description")
    .eq("active", true)
    .order("display_order");

  const defaultAssessment: AssessmentItemInput[] = (allCriteria ?? []).map((c) => ({
    criterionId: c.id,
    passed: false,
    note: "",
  }));

  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        New Firm
      </h1>
      <p className="text-slate-500 text-sm mb-8">Fill in the details below to add a new firm.</p>
      <FirmForm
        mode="create"
        allCriteria={allCriteria ?? []}
        defaultAssessment={defaultAssessment}
      />
    </div>
  );
}
