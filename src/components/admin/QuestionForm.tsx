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
    <div className="space-y-8 max-w-3xl">
      <div className={sectionClass}>
        <h2
          className="text-lg text-[#002452]"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          Question Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
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
              className={inputClass}
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
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select
              className={inputClass}
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
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="required"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="w-4 h-4 accent-[#002452]"
          />
          <label htmlFor="required" className="text-sm text-slate-600">Required</label>
        </div>
      </div>

      {showOptions && (
        <div className={sectionClass}>
          <h2
            className="text-lg text-[#002452]"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Options
          </h2>
          <p className="text-xs text-slate-400">One option per line.</p>
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
          <h2
            className="text-lg text-[#002452]"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Scale Settings
          </h2>
          <div className="grid grid-cols-3 gap-4">
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

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pb-10">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-8 py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isPending ? "Saving..." : mode === "create" ? "Create Question" : "Save Changes"}
        </button>
        <button
          onClick={() => router.push("/admin/questions")}
          className="px-6 py-3 rounded-2xl border border-[#ddd7cc] text-slate-600 text-sm hover:border-[#002452] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
