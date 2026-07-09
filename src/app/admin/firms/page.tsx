import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus } from "lucide-react";
import FirmsTable from "@/components/admin/FirmsTable";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = { title: "Firms, Admin" };

export default async function AdminFirmsPage() {
  const db = createAdminClient();
  const { data: rawFirms } = await db
    .from("firms")
    .select("id, name, location, size, overall_score, verified, is_verified, practice_areas")
    .order("name");

  // Normalize to new column names; keep verified field the component expects
  const firms = (rawFirms ?? []).map((f) => ({
    ...f,
    verified: (f.is_verified ?? f.verified) as boolean,
  }));

  return (
    <div>
      <AdminHeader
        eyebrow="Content"
        title="Firms"
        subtitle={`${firms.length} firm${firms.length !== 1 ? "s" : ""} in the directory.`}
        actions={
          <Link href="/admin/firms/new" className="adm-btn adm-btn-primary">
            <Plus size={16} strokeWidth={2} />
            Add firm
          </Link>
        }
      />
      <FirmsTable firms={firms} />
    </div>
  );
}
