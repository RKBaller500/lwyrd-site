import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus } from "lucide-react";
import FirmsTable from "@/components/admin/FirmsTable";

export const metadata = { title: "Firms — Admin" };

export default async function AdminFirmsPage() {
  const db = createAdminClient();
  const { data: firms } = await db
    .from("firms")
    .select("id, name, location, size, overall_score, verified, practice_areas")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl text-[#002452] mb-1"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Firms
          </h1>
          <p className="text-slate-500 text-sm">{firms?.length ?? 0} firms total</p>
        </div>
        <Link
          href="/admin/firms/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add Firm
        </Link>
      </div>

      <FirmsTable firms={firms ?? []} />
    </div>
  );
}
