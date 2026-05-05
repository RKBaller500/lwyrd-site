import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus } from "lucide-react";
import QuestionsTable from "@/components/admin/QuestionsTable";

export const metadata = { title: "Questions — Admin" };

export default async function AdminQuestionsPage() {
  const db = createAdminClient();
  const [{ data: questions }, { data: categories }] = await Promise.all([
    db
      .from("intake_questions")
      .select("id, question, category_slug, type, display_order, required")
      .order("category_slug")
      .order("display_order"),
    db.from("legal_categories").select("slug, name").order("name"),
  ]);

  const categoryMap = Object.fromEntries(
    (categories ?? []).map((c) => [c.slug, c.name])
  );

  const enrichedQuestions = (questions ?? []).map((q) => ({
    ...q,
    categoryName: q.category_slug === "global" ? "Global" : (categoryMap[q.category_slug] ?? q.category_slug),
  }));

  const categoryOptions = (categories ?? []).map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl text-[#002452] mb-1"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Questions
          </h1>
          <p className="text-slate-500 text-sm">{questions?.length ?? 0} questions total</p>
        </div>
        <Link
          href="/admin/questions/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add Question
        </Link>
      </div>

      <QuestionsTable questions={enrichedQuestions} categoryOptions={categoryOptions} />
    </div>
  );
}
