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

const inputClass =
  "w-full px-4 py-2.5 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm";
const labelClass = "block text-xs text-slate-400 font-medium mb-1.5";
const sectionClass =
  "bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 space-y-5";

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
    <div className="space-y-8 max-w-3xl">
      <div className={sectionClass}>
        <h2
          className="text-lg text-[#002452]"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          Criterion Details
        </h2>
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
        <div className="grid grid-cols-2 gap-4">
          <Field label="Display Order">
            <input
              type="number"
              className={inputClass}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="1"
            />
          </Field>
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-[#002452]"
              />
              <label htmlFor="active" className="text-sm text-slate-600">
                Active (shown in firm assessment forms)
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pb-10">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-8 py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isPending ? "Saving..." : mode === "create" ? "Create Criterion" : "Save Changes"}
        </button>
        <button
          onClick={() => router.push("/admin/criteria")}
          className="px-6 py-3 rounded-2xl border border-[#ddd7cc] text-slate-600 text-sm hover:border-[#002452] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
