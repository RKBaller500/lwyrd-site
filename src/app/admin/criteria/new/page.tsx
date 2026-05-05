import { createAdminClient } from "@/lib/supabase/admin";
import AssessmentCriterionForm from "@/components/admin/AssessmentCriterionForm";

export const metadata = { title: "New Criterion — Admin" };

export default async function NewCriterionPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("assessment_criteria")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = data && data.length > 0 ? data[0].display_order + 1 : 1;

  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        New Criterion
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Add a new standard criterion to the LWYRD Assessment checklist.
      </p>
      <AssessmentCriterionForm
        mode="create"
        initialData={{ id: "", label: "", description: "", display_order: nextOrder, active: true }}
      />
    </div>
  );
}
