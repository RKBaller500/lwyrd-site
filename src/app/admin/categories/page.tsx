import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus } from "lucide-react";
import CategoriesTable from "@/components/admin/CategoriesTable";

export const metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  const db = createAdminClient();
  const { data: categories } = await db
    .from("legal_categories")
    .select("slug, name, icon, short_description")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl text-[#002452] mb-1"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Categories
          </h1>
          <p className="text-slate-500 text-sm">{categories?.length ?? 0} categories total</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Add Category
        </Link>
      </div>

      <CategoriesTable categories={categories ?? []} />
    </div>
  );
}
