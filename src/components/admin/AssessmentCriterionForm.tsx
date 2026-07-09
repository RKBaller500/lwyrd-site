"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAssessmentCriterion,
  updateAssessmentCriterion,
  type AssessmentCriterionInput,
} from "@/lib/actions/admin/assessmentCriteria";

interface AssessmentCriterionFormProps {
  initialData?: AssessmentCriterionInput & { id: string };
  mode: "create" | "edit";
}

const inputClass = "adm-input";
const labelClass = "adm-label";
const sectionClass = "adm-card adm-stack";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export default function AssessmentCriterionForm({
  initialData,
  mode,
}: AssessmentCriterionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [label, setLabel] = useState(initialData?.label ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(String(initialData?.display_order ?? "0"));
  const [active, setActive] = useState(initialData?.active ?? true);

  const handleSave = () => {
    setError("");
    if (!label.trim()) {
      setError("Label is required.");
      return;
    }

    const data: AssessmentCriterionInput = {
      label: label.trim(),
      description: description.trim(),
      display_order: parseInt(displayOrder) || 0,
      active,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createAssessmentCriterion(data)
          : await updateAssessmentCriterion(initialData!.id, data);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/criteria");
      }
    });
  };

  return (
    <div className="adm-form">
      <div className={sectionClass}>
        <h2 className="adm-card-title">Criterion Details</h2>
        <Field label="Label (shown on firm profiles)">
          <input
            className={inputClass}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Startup Incorporation & Entity Formation"
          />
        </Field>
        <Field label="Description (shown in admin form as helper text)">
          <textarea
            rows={3}
            className={inputClass + " resize-none"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Documented experience forming Delaware C-corps, LLCs..."
          />
        </Field>
        <div className="adm-row">
          <Field label="Display Order">
            <input
              type="number"
              className={inputClass}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="1"
            />
          </Field>
          <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
            <label className="adm-inline-check">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active (shown in firm assessment forms)
            </label>
          </div>
        </div>
      </div>

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-form-actions">
        <button onClick={handleSave} disabled={isPending} className="adm-btn adm-btn-primary">
          {isPending ? "Saving…" : mode === "create" ? "Create criterion" : "Save changes"}
        </button>
        <button onClick={() => router.push("/admin/criteria")} className="adm-btn adm-btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  );
}
