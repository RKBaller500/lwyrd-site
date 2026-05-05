import CategoryForm from "@/components/admin/CategoryForm";

export const metadata = { title: "New Category — Admin" };

export default function NewCategoryPage() {
  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        New Category
      </h1>
      <p className="text-slate-500 text-sm mb-8">Add a new legal category to the platform.</p>
      <CategoryForm mode="create" />
    </div>
  );
}
