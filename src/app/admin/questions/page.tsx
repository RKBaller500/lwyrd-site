import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus } from "lucide-react";
import QuestionsTable from "@/components/admin/QuestionsTable";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = { title: "Questions, Admin" };

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
      <AdminHeader
        eyebrow="Content"
        title="Questions"
        subtitle={`${questions?.length ?? 0} intake question${(questions?.length ?? 0) !== 1 ? "s" : ""}.`}
        actions={
          <Link href="/admin/questions/new" className="adm-btn adm-btn-primary">
            <Plus size={16} strokeWidth={2} />
            Add question
          </Link>
        }
      />

      <QuestionsTable questions={enrichedQuestions} categoryOptions={categoryOptions} />
    </div>
  );
}
