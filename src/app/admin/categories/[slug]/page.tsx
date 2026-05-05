import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import CategoryForm from "@/components/admin/CategoryForm";
import type { CategoryInput } from "@/lib/actions/admin/categories";

export const metadata = { title: "Edit Category — Admin" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = createAdminClient();

  const { data: cat } = await db
    .from("legal_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!cat) notFound();

  const initialData: CategoryInput = {
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon ?? "",
    shortDescription: cat.short_description ?? "",
    fullDescription: cat.full_description ?? "",
    whatFirmsDo: cat.what_firms_do ?? "",
    serviceExamples: cat.service_examples ?? [],
    heroTag: cat.hero_tag ?? "",
  };

  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        Edit Category
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Editing <span className="font-medium text-slate-700">{cat.name}</span>
      </p>
      <CategoryForm mode="edit" initialData={initialData} />
    </div>
  );
}
