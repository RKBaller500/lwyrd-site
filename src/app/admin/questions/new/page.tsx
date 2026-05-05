import { createAdminClient } from "@/lib/supabase/admin";
import QuestionForm from "@/components/admin/QuestionForm";

export const metadata = { title: "New Question — Admin" };

export default async function NewQuestionPage() {
  const db = createAdminClient();
  const { data: categories } = await db
    .from("legal_categories")
    .select("slug, name")
    .order("name");

  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        New Question
      </h1>
      <p className="text-slate-500 text-sm mb-8">Add an intake question for a category or globally.</p>
      <QuestionForm mode="create" categories={categories ?? []} />
    </div>
  );
}
