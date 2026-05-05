"use client";

import { useState } from "react";
import { IntakeQuestion } from "@/types";

interface IntakeQuestionProps {
  question: IntakeQuestion;
  value: string | string[] | number | undefined;
  onChange: (val: string | string[] | number) => void;
}

// Any option whose label starts with "other" (case-insensitive) gets a free-text follow-up
const isOtherOption = (opt: string) => opt.toLowerCase().startsWith("other");

// Given the raw option label and typed text, produce the stored value
const composeOtherValue = (opt: string, text: string) =>
  text.trim() ? `${opt}: ${text.trim()}` : opt;

// Extract typed text from a stored "Other: ..." value
const extractOtherText = (opt: string, stored: string) =>
  stored.startsWith(`${opt}: `) ? stored.slice(opt.length + 2) : "";

export default function IntakeQuestionComponent({ question, value, onChange }: IntakeQuestionProps) {
  // Initialise other-text from any existing stored value so edit-from-summary works correctly
  const otherOption = question.options?.find(isOtherOption);

  const [otherText, setOtherText] = useState<string>(() => {
    if (!otherOption) return "";
    if (typeof value === "string") return extractOtherText(otherOption, value);
    if (Array.isArray(value)) {
      const entry = value.find((v) => v.startsWith(`${otherOption}: `));
      return entry ? extractOtherText(otherOption, entry) : "";
    }
    return "";
  });

  // ── single-select helpers ────────────────────────────────
  const singleIsOtherSelected =
    otherOption &&
    typeof value === "string" &&
    (value === otherOption || value.startsWith(`${otherOption}: `));

  const handleSingleSelect = (opt: string) => {
    if (isOtherOption(opt)) {
      // Keep existing other text if re-selecting the same option
      onChange(composeOtherValue(opt, otherText));
    } else {
      onChange(opt);
    }
  };

  const handleSingleOtherText = (text: string) => {
    setOtherText(text);
    onChange(composeOtherValue(otherOption!, text));
  };

  // ── multi-select helpers ─────────────────────────────────
  const multiIsOtherSelected =
    otherOption &&
    Array.isArray(value) &&
    value.some((v) => v === otherOption || v.startsWith(`${otherOption}: `));

  const handleMultiToggle = (opt: string) => {
    const current = Array.isArray(value) ? value : [];
    if (isOtherOption(opt)) {
      if (multiIsOtherSelected) {
        // Deselect: remove any "Other" or "Other: ..." entry
        onChange(current.filter((v) => v !== opt && !v.startsWith(`${opt}: `)));
      } else {
        onChange([...current, composeOtherValue(opt, otherText)]);
      }
    } else {
      if (current.includes(opt)) {
        onChange(current.filter((v) => v !== opt));
      } else {
        onChange([...current, opt]);
      }
    }
  };

  const handleMultiOtherText = (text: string) => {
    setOtherText(text);
    const current = Array.isArray(value) ? value : [];
    // Replace the existing Other entry with the updated composed value
    onChange(
      current.map((v) =>
        v === otherOption || v.startsWith(`${otherOption!}: `)
          ? composeOtherValue(otherOption!, text)
          : v
      )
    );
  };

  return (
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8">
      <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">
        {question.required ? "Required" : "Optional"}
      </p>
      <h2
        className="text-xl sm:text-2xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        {question.question}
      </h2>
      {question.subtext && (
        <p className="text-slate-500 text-sm mb-6">{question.subtext}</p>
      )}
      {!question.subtext && <div className="mb-5" />}

      {/* Render by type */}
      {question.type === "single-select" && (
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const isOther = isOtherOption(opt);
            const isSelected = isOther
              ? !!singleIsOtherSelected
              : value === opt;
            return (
              <div key={opt}>
                <button
                  type="button"
                  onClick={() => handleSingleSelect(opt)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002452] focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-[#002452] text-white border-[#002452]"
                      : "bg-white border-[#ddd7cc] text-slate-700 hover:border-[#002452]"
                  }`}
                >
                  {opt}
                </button>
                {isOther && isSelected && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Please specify…"
                    value={otherText}
                    onChange={(e) => handleSingleOtherText(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {question.type === "multi-select" && (
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const isOther = isOtherOption(opt);
            const isSelected = isOther
              ? !!multiIsOtherSelected
              : Array.isArray(value) && value.includes(opt);
            return (
              <div key={opt}>
                <button
                  type="button"
                  onClick={() => handleMultiToggle(opt)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002452] focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-[#002452] text-white border-[#002452]"
                      : "bg-white border-[#ddd7cc] text-slate-700 hover:border-[#002452]"
                  }`}
                >
                  {opt}
                </button>
                {isOther && isSelected && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Please specify…"
                    value={otherText}
                    onChange={(e) => handleMultiOtherText(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {question.type === "text" && (
        <textarea
          rows={4}
          className="w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm resize-none"
          placeholder="Your answer..."
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "budget-range" && (
        <BudgetRangeInput
          value={value as number ?? 0}
          min={question.min ?? 0}
          max={question.max ?? 50000}
          step={question.step ?? 500}
          onChange={onChange}
        />
      )}

      {question.type === "scale" && (
        <ScaleInput
          value={value as number ?? question.min ?? 1}
          min={question.min ?? 1}
          max={question.max ?? 10}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function BudgetRangeInput({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const display =
    value === 0
      ? "Not sure / no budget set"
      : value >= max
      ? `$${(max / 1000).toFixed(0)}k+ / month`
      : `$${value.toLocaleString()} / month`;

  return (
    <div className="space-y-4">
      <p className="text-[#002452] text-2xl font-medium" style={{ fontFamily: '"Lora", Georgia, serif' }}>
        {display}
      </p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#002452]"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>No budget set</span>
        <span>${(max / 1000).toFixed(0)}k+</span>
      </div>
    </div>
  );
}

function ScaleInput({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[#002452] text-3xl font-medium text-center" style={{ fontFamily: '"Lora", Georgia, serif' }}>
        {value}
      </p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#002452]"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
