"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createQuestion,
  updateQuestion,
  type QuestionInput,
} from "@/lib/actions/admin/questions";

interface QuestionFormProps {
  initialData?: QuestionInput;
  mode: "create" | "edit";
  categories: { slug: string; name: string }[];
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

const QUESTION_TYPES = [
  { value: "single-select", label: "Single Select" },
  { value: "multi-select", label: "Multi Select" },
  { value: "text", label: "Text Input" },
  { value: "scale", label: "Scale / Slider" },
  { value: "budget-range", label: "Budget Range" },
] as const;

export default function QuestionForm({ initialData, mode, categories }: QuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [id, setId] = useState(initialData?.id ?? "");
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug ?? "global");
  const [displayOrder, setDisplayOrder] = useState(String(initialData?.displayOrder ?? "0"));
  const [question, setQuestion] = useState(initialData?.question ?? "");
  const [subtext, setSubtext] = useState(initialData?.subtext ?? "");
  const [type, setType] = useState<QuestionInput["type"]>(initialData?.type ?? "single-select");
  const [options, setOptions] = useState((initialData?.options ?? []).join("\n"));
  const [minValue, setMinValue] = useState(String(initialData?.minValue ?? ""));
  const [maxValue, setMaxValue] = useState(String(initialData?.maxValue ?? ""));
  const [stepValue, setStepValue] = useState(String(initialData?.stepValue ?? ""));
  const [required, setRequired] = useState(initialData?.required ?? true);

  const showOptions = type === "single-select" || type === "multi-select";
  const showScaleFields = type === "scale" || type === "budget-range";

  const handleSave = () => {
    setError("");
    const data: QuestionInput = {
      id: id.trim(),
      categorySlug: categorySlug.trim(),
      displayOrder: parseInt(displayOrder) || 0,
      question: question.trim(),
      subtext: subtext.trim(),
      type,
      options: showOptions
        ? options
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      minValue: showScaleFields && minValue ? parseInt(minValue) : null,
      maxValue: showScaleFields && maxValue ? parseInt(maxValue) : null,
      stepValue: showScaleFields && stepValue ? parseInt(stepValue) : null,
      required,
    };

    if (!data.id || !data.question) {
      setError("ID and Question text are required.");
      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createQuestion(data)
          : await updateQuestion(initialData!.id, data);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/questions");
      }
    });
  };

  return (
    <div className="adm-form">
      <div className={sectionClass}>
        <h2 className="adm-card-title">Question Details</h2>
        <div className="adm-row">
          <Field label="ID (unique key)">
            <input
              className={inputClass}
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="startup-law-stage"
              disabled={mode === "edit"}
            />
          </Field>
          <Field label="Category">
            <select
              className="adm-select"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
            >
              <option value="global">Global (all categories)</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="adm-row">
          <Field label="Type">
            <select
              className="adm-select"
              value={type}
              onChange={(e) => setType(e.target.value as QuestionInput["type"])}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Display Order">
            <input
              type="number"
              className={inputClass}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="1"
            />
          </Field>
        </div>
        <Field label="Question Text">
          <input
            className={inputClass}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What stage is your company at?"
          />
        </Field>
        <Field label="Subtext (optional helper text)">
          <input
            className={inputClass}
            value={subtext}
            onChange={(e) => setSubtext(e.target.value)}
            placeholder="This helps us match you with the right firm."
          />
        </Field>
        <label className="adm-inline-check">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
          />
          Required
        </label>
      </div>

      {showOptions && (
        <div className={sectionClass}>
          <h2 className="adm-card-title">Options</h2>
          <p className="adm-hint" style={{ marginTop: 0 }}>One option per line.</p>
          <textarea
            rows={6}
            className={inputClass + " resize-none"}
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder={"Pre-seed\nSeed\nSeries A\nSeries B+"}
          />
        </div>
      )}

      {showScaleFields && (
        <div className={sectionClass}>
          <h2 className="adm-card-title">Scale Settings</h2>
          <div className="adm-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <Field label="Min Value">
              <input
                type="number"
                className={inputClass}
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Max Value">
              <input
                type="number"
                className={inputClass}
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="100"
              />
            </Field>
            <Field label="Step">
              <input
                type="number"
                className={inputClass}
                value={stepValue}
                onChange={(e) => setStepValue(e.target.value)}
                placeholder="1"
              />
            </Field>
          </div>
        </div>
      )}

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-form-actions">
        <button onClick={handleSave} disabled={isPending} className="adm-btn adm-btn-primary">
          {isPending ? "Saving…" : mode === "create" ? "Create question" : "Save changes"}
        </button>
        <button onClick={() => router.push("/admin/questions")} className="adm-btn adm-btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  );
}
