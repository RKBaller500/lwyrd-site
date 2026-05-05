import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import AssessmentCriterionForm from "@/components/admin/AssessmentCriterionForm";

export const metadata = { title: "Edit Criterion — Admin" };

export default async function EditCriterionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();

  const { data: criterion } = await db
    .from("assessment_criteria")
    .select("*")
    .eq("id", id)
    .single();

  if (!criterion) notFound();

  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        Edit Criterion
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Editing <span className="font-medium text-slate-700">{criterion.label}</span>
      </p>
      <AssessmentCriterionForm
        mode="edit"
        initialData={{
          id: criterion.id,
          label: criterion.label,
          description: criterion.description ?? "",
          display_order: criterion.display_order,
          active: criterion.active,
        }}
      />
    </div>
  );
}
