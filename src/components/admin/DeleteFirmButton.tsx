"use client";

import { useTransition } from "react";
import { deleteFirm } from "@/lib/actions/admin/firms";

export default function DeleteFirmButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteFirm(id);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="adm-del"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
