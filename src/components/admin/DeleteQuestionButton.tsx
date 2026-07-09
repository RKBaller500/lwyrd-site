"use client";

import { useTransition } from "react";
import { deleteQuestion } from "@/lib/actions/admin/questions";

export default function DeleteQuestionButton({ id, question }: { id: string; question: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const preview = question.length > 60 ? question.slice(0, 60) + "…" : question;
    if (!confirm(`Delete question "${preview}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteQuestion(id);
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
