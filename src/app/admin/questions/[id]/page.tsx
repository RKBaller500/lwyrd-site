import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import QuestionForm from "@/components/admin/QuestionForm";
import type { QuestionInput } from "@/lib/actions/admin/questions";

export const metadata = { title: "Edit Question — Admin" };

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();

  const [{ data: q }, { data: categories }] = await Promise.all([
    db.from("intake_questions").select("*").eq("id", id).single(),
    db.from("legal_categories").select("slug, name").order("name"),
  ]);

  if (!q) notFound();

  const initialData: QuestionInput = {
    id: q.id,
    categorySlug: q.category_slug ?? "global",
    displayOrder: q.display_order ?? 0,
    question: q.question,
    subtext: q.subtext ?? "",
    type: q.type,
    options: q.options ?? [],
    minValue: q.min_value ?? null,
    maxValue: q.max_value ?? null,
    stepValue: q.step_value ?? null,
    required: q.required ?? true,
  };

  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        Edit Question
      </h1>
      <p className="text-slate-500 text-sm mb-8 max-w-xl truncate">
        Editing: <span className="font-medium text-slate-700">{q.question}</span>
      </p>
      <QuestionForm mode="edit" initialData={initialData} categories={categories ?? []} />
    </div>
  );
}
