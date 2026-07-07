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
    <div className="intake-card">
      <p className="intake-meta">
        {question.required ? "Required" : "Optional"}
      </p>
      <h2
        className="intake-question-title"
        style={{ fontFamily: "var(--display)", fontWeight: 500 }}
      >
        {question.question}
      </h2>
      {question.subtext && (
        <p className="intake-question-subtext">{question.subtext}</p>
      )}
      {!question.subtext && <div className="intake-spacer" />}

      {/* Render by type */}
      {question.type === "single-select" && (
        <div className="intake-options">
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
                  className={`intake-option ${isSelected ? "is-selected" : ""}`}
                >
                  <span className="intake-option-label">{opt}</span>
                </button>
                {isOther && isSelected && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Please specify…"
                    value={otherText}
                    onChange={(e) => handleSingleOtherText(e.target.value)}
                    className="intake-input intake-input-nested"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {question.type === "multi-select" && (
        <div className="intake-options">
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
                  className={`intake-option ${isSelected ? "is-selected" : ""}`}
                >
                  <span className="intake-option-label">{opt}</span>
                </button>
                {isOther && isSelected && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Please specify…"
                    value={otherText}
                    onChange={(e) => handleMultiOtherText(e.target.value)}
                    className="intake-input intake-input-nested"
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
          className="intake-input"
          placeholder="Your answer..."
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: 120, resize: "vertical" }}
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
    <div>
      <p className="intake-budget-value" style={{ fontFamily: "var(--display)", fontWeight: 500 }}>
        {display}
      </p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="intake-range"
      />
      <div className="intake-range-labels">
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
    <div>
      <p className="intake-budget-value" style={{ fontFamily: "var(--display)", fontWeight: 500, textAlign: "center" }}>
        {value}
      </p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="intake-range"
      />
      <div className="intake-range-labels">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
