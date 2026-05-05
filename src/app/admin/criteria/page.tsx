import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus } from "lucide-react";
import CriteriaTable from "@/components/admin/CriteriaTable";

export const metadata = { title: "Assessment Criteria — Admin" };

export default async function AdminCriteriaPage() {
  const db = createAdminClient();
  const { data: criteria } = await db
    .from("assessment_criteria")
    .select("id, label, description, display_order, active")
    .order("display_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl text-[#002452] mb-1"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Assessment Criteria
          </h1>
          <p className="text-slate-500 text-sm">
            {criteria?.length ?? 0} criteria · standard checklist applied to all firms
          </p>
        </div>
        <Link
          href="/admin/criteria/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add Criterion
        </Link>
      </div>

      <CriteriaTable criteria={criteria ?? []} />
    </div>
  );
}
