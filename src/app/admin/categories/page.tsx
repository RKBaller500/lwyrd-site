import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus } from "lucide-react";
import CategoriesTable from "@/components/admin/CategoriesTable";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = { title: "Categories, Admin" };

export default async function AdminCategoriesPage() {
  const db = createAdminClient();
  const { data: categories } = await db
    .from("legal_categories")
    .select("slug, name, icon, short_description")
    .order("name");

  return (
    <div>
      <AdminHeader
        eyebrow="Content"
        title="Categories"
        subtitle={`${categories?.length ?? 0} legal categor${(categories?.length ?? 0) !== 1 ? "ies" : "y"}.`}
        actions={
          <Link href="/admin/categories/new" className="adm-btn adm-btn-primary">
            <Plus size={16} strokeWidth={2} />
            Add category
          </Link>
        }
      />

      <CategoriesTable categories={categories ?? []} />
    </div>
  );
}
