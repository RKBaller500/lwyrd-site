"use client";

import { useTransition } from "react";
import { deleteCategory } from "@/lib/actions/admin/categories";

export default function DeleteCategoryButton({ slug, name }: { slug: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCategory(slug);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
