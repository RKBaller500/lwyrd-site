"use client";

import { useTransition } from "react";
import { deleteAssessmentCriterion } from "@/lib/actions/admin/assessmentCriteria";

export default function DeleteAssessmentCriterionButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        `Delete criterion "${label}"? This will remove it from all firm assessments and cannot be undone.`
      )
    )
      return;
    startTransition(async () => {
      await deleteAssessmentCriterion(id);
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
