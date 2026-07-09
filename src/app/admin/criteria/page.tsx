import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus } from "lucide-react";
import CriteriaTable from "@/components/admin/CriteriaTable";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = { title: "Assessment Criteria, Admin" };

export default async function AdminCriteriaPage() {
  const db = createAdminClient();
  const { data: criteria } = await db
    .from("assessment_criteria")
    .select("id, label, description, display_order, active")
    .order("display_order");

  return (
    <div>
      <AdminHeader
        eyebrow="Content"
        title="Assessment Criteria"
        subtitle={`${criteria?.length ?? 0} criteria · standard checklist applied to all firms.`}
        actions={
          <Link href="/admin/criteria/new" className="adm-btn adm-btn-primary">
            <Plus size={16} strokeWidth={2} />
            Add criterion
          </Link>
        }
      />

      <CriteriaTable criteria={criteria ?? []} />
    </div>
  );
}
