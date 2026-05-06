"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { createClient } from "@/lib/supabase/client";
import { mapDbFirmToFirm } from "@/lib/supabase/mappers";
import { DbFirm } from "@/lib/supabase/types";
import { matchFirmsV2 } from "@/lib/matching";
import { saveIntakeSubmissionV2 } from "@/lib/actions/intake";
import { firms as localFirms } from "@/data/firms";
import {
  V2Track,
  V2Question,
  getQuestionSequence,
  getQ2ForTrack,
  TRACK_CONTEXT_QUESTIONS,
} from "@/data/intakeV2";
import ProgressBar from "./ProgressBar";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

type V2Answers = Record<string, string | string[] | number>;

const BUDGET_TO_BILLING_ID: Record<string, string> = {
  sf3: "sf2",
  if3: "if2",
  bf3: "bf2",
};

function getBillingUnit(pref: string | undefined): string {
  if (pref === "hourly") return "/hr";
  if (pref === "retainer") return "/month";
  return "";
}

function getEffectiveBudgetMax(pref: string | undefined, questionMax: number): number {
  if (pref === "hourly") return 1000;
  return questionMax;
}

function getEffectiveBudgetStep(pref: string | undefined, questionStep: number): number {
  if (pref === "hourly") return 25;
  return questionStep;
}

// ── Question renderer ─────────────────────────────────────────────────────────

function QuestionCard({
  question,
  value,
  onChange,
  billingPreference,
}: {
  question: V2Question;
  value: string | string[] | number | undefined;
  onChange: (val: string | string[] | number) => void;
  billingPreference?: string;
}) {
  const [otherText, setOtherText] = useState(() => {
    if (typeof value === "string" && value.startsWith("other: ")) return value.slice(7);
    if (Array.isArray(value)) {
      const entry = value.find((v) => typeof v === "string" && v.startsWith("other: "));
      return entry ? (entry as string).slice(7) : "";
    }
    return "";
  });

  const isOtherVal = (v: string) => v === "other" || v.startsWith("other: ");

  // ── budget-range ─────────────────────────────────────────
  if (question.type === "budget-range") {
    const min = question.min ?? 0;
    const effectiveMax = getEffectiveBudgetMax(billingPreference, question.max ?? 100000);
    const effectiveStep = getEffectiveBudgetStep(billingPreference, question.step ?? 2500);
    const unit = getBillingUnit(billingPreference);
    const isNoFee = billingPreference === "contingency" || billingPreference === "equity";
    const budgetVal = typeof value === "number" ? Math.min(value, effectiveMax) : 0;

    const formatCap = (n: number) =>
      n >= 1000 ? `$${(n / 1000).toFixed(0)}k+${unit}` : `$${n}+${unit}`;
    const display =
      budgetVal === 0
        ? "Not specified"
        : budgetVal >= effectiveMax
        ? formatCap(effectiveMax)
        : `$${budgetVal.toLocaleString()}${unit}`;

    const subtext = (() => {
      if (billingPreference === "hourly") return "Estimate your comfortable hourly rate ceiling. Leave at $0 if unsure.";
      if (billingPreference === "retainer") return "Estimate your monthly retainer ceiling. Leave at $0 if unsure.";
      if (billingPreference === "flat_fee") return "Estimate your total project budget. Leave at $0 if unsure.";
      if (billingPreference === "contingency") return "With contingency arrangements, your attorney is paid only if you win, no upfront budget needed.";
      if (billingPreference === "equity") return "Equity arrangements are structured individually, no cash budget needed.";
      return question.subtext;
    })();

    return (
      <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">
          Optional
        </p>
        <h2
          className="text-xl sm:text-2xl text-[#002452] mb-2"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          {question.text}
        </h2>
        {subtext && (
          <p className="text-slate-500 text-sm mb-6">{subtext}</p>
        )}
        {!subtext && <div className="mb-5" />}

        {isNoFee ? (
          <div className="rounded-2xl bg-white border border-[#ddd7cc] px-5 py-4">
            <p className="text-slate-500 text-sm">
              {billingPreference === "contingency"
                ? "No upfront budget required. Your attorney's fee comes from your settlement or award."
                : "No cash budget required. Equity arrangements will be negotiated directly with the firm."}
            </p>
          </div>
        ) : (
          <>
            <p
              className="text-[#002452] text-3xl mb-5"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              {display}
            </p>
            <input
              type="range"
              min={min}
              max={effectiveMax}
              step={effectiveStep}
              value={budgetVal}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full accent-[#002452]"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Not specified</span>
              <span>{formatCap(effectiveMax)}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── state-dropdown ─────────────────────────────────────────
  if (question.type === "state-dropdown") {
    const selected = (value as string) ?? "";
    const isOutsideUS = selected === "outside_us";

    return (
      <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">
          {question.required ? "Required" : "Optional"}
        </p>
        <h2
          className="text-xl sm:text-2xl text-[#002452] mb-2"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          {question.text}
        </h2>
        {question.subtext && (
          <p className="text-slate-500 text-sm mb-6">{question.subtext}</p>
        )}
        {!question.subtext && <div className="mb-5" />}
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 focus:outline-none focus:border-[#002452] focus:ring-2 focus:ring-[#002452]/15 transition-all text-sm appearance-none cursor-pointer"
        >
          <option value="" disabled>Select a state…</option>
          {question.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {isOutsideUS && (
          <div className="mt-4">
            <p className="text-slate-500 text-xs mb-2">Which region(s) are involved? (optional)</p>
            <input
              type="text"
              placeholder="e.g., Europe, Canada, Southeast Asia"
              value={otherText}
              onChange={(e) => {
                setOtherText(e.target.value);
                onChange(`outside_us: ${e.target.value}`);
              }}
              className="w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm"
            />
          </div>
        )}
      </div>
    );
  }

  // ── single-select ─────────────────────────────────────────
  if (question.type === "single-select") {
    const selected = (value as string) ?? "";
    const isOtherSelected = isOtherVal(selected);

    const handleSelect = (optValue: string) => {
      if (optValue === "other") {
        onChange(otherText.trim() ? `other: ${otherText.trim()}` : "other");
      } else {
        onChange(optValue);
      }
    };

    const handleOtherText = (text: string) => {
      setOtherText(text);
      onChange(text.trim() ? `other: ${text.trim()}` : "other");
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
          {question.text}
        </h2>
        {question.subtext && (
          <p className="text-slate-500 text-sm mb-6">{question.subtext}</p>
        )}
        {!question.subtext && <div className="mb-5" />}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = opt.value === "other" ? isOtherSelected : selected === opt.value;
            return (
              <div key={opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002452] focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-[#002452] text-white border-[#002452]"
                      : "bg-white border-[#ddd7cc] text-slate-700 hover:border-[#002452]"
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  {opt.note && (
                    <span
                      className={`block text-xs mt-0.5 ${
                        isSelected ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {opt.note}
                    </span>
                  )}
                </button>
                {opt.value === "other" && isSelected && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Please describe…"
                    value={otherText}
                    onChange={(e) => handleOtherText(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── multi-select ─────────────────────────────────────────
  const selected = Array.isArray(value) ? (value as string[]) : [];
  const isOtherSelectedMulti = selected.some(isOtherVal);

  const handleMultiToggle = (optValue: string) => {
    if (optValue === "other") {
      if (isOtherSelectedMulti) {
        onChange(selected.filter((v) => !isOtherVal(v)));
      } else {
        onChange([...selected, otherText.trim() ? `other: ${otherText.trim()}` : "other"]);
      }
    } else {
      if (selected.includes(optValue)) {
        onChange(selected.filter((v) => v !== optValue));
      } else {
        onChange([...selected, optValue]);
      }
    }
  };

  const handleMultiOtherText = (text: string) => {
    setOtherText(text);
    const composed = text.trim() ? `other: ${text.trim()}` : "other";
    onChange(selected.map((v) => (isOtherVal(v) ? composed : v)));
  };

  return (
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8">
      <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">
        {question.required ? "Required" : "Optional"} · Select all that apply
      </p>
      <h2
        className="text-xl sm:text-2xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        {question.text}
      </h2>
      {question.subtext && (
        <p className="text-slate-500 text-sm mb-6">{question.subtext}</p>
      )}
      {!question.subtext && <div className="mb-5" />}
      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = opt.value === "other" ? isOtherSelectedMulti : selected.includes(opt.value);
          return (
            <div key={opt.value}>
              <button
                type="button"
                onClick={() => handleMultiToggle(opt.value)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002452] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-[#002452] text-white border-[#002452]"
                    : "bg-white border-[#ddd7cc] text-slate-700 hover:border-[#002452]"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                {opt.note && (
                  <span
                    className={`block text-xs mt-0.5 ${
                      isSelected ? "text-white/70" : "text-slate-400"
                    }`}
                  >
                    {opt.note}
                  </span>
                )}
              </button>
              {opt.value === "other" && isSelected && (
                <input
                  autoFocus
                  type="text"
                  placeholder="Please describe…"
                  value={otherText}
                  onChange={(e) => handleMultiOtherText(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Summary renderer ──────────────────────────────────────────────────────────

function SummaryView({
  questions,
  answers,
  onEdit,
}: {
  questions: V2Question[];
  answers: V2Answers;
  onEdit: (index: number) => void;
}) {
  const getDisplayValue = (q: V2Question, raw: string | string[] | number | undefined): string => {
    if (raw === undefined || raw === null) return "N/A";
    if (typeof raw === "number") {
      if (raw === 0) return "Not specified";
      const billingId = BUDGET_TO_BILLING_ID[q.id];
      const billingPref = billingId ? (answers[billingId] as string | undefined) : undefined;
      const unit = getBillingUnit(billingPref);
      const effectiveMax = getEffectiveBudgetMax(billingPref, q.max ?? 100000);
      const formatCap = (n: number) =>
        n >= 1000 ? `$${(n / 1000).toFixed(0)}k+${unit}` : `$${n}+${unit}`;
      return raw >= effectiveMax ? formatCap(effectiveMax) : `$${raw.toLocaleString()}${unit}`;
    }
    const formatVal = (v: string) => {
      if (v.startsWith("other: ")) return `Other: ${v.slice(7)}`;
      if (v.startsWith("outside_us: ")) return `Outside the US (${v.slice(12)})`;
      if (v === "other") return "Other";
      if (v === "outside_us") return "Outside the US";
      return q.options.find((o) => o.value === v)?.label ?? v;
    };
    if (Array.isArray(raw)) {
      if (raw.length === 0) return "N/A";
      return raw.map(formatVal).join(", ");
    }
    return formatVal(raw) || "N/A";
  };

  return (
    <div className="space-y-3">
      <p className="text-slate-500 text-sm mb-6">
        Review your answers below. Click any row to change that answer, then proceed to find your matches.
      </p>
      {questions.map((q, index) => {
        const val = answers[q.id];
        const hasAnswer =
          val !== undefined &&
          val !== null &&
          !(Array.isArray(val) && val.length === 0);
        return (
          <button
            key={q.id}
            onClick={() => onEdit(index)}
            className={`w-full text-left bg-[#fbfaf6] border border-[#ddd7cc] rounded-2xl p-5 group hover:border-[#002452] hover:bg-white transition-colors ${
              !hasAnswer && !q.required ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium mb-1">{q.text}</p>
                <p className="text-slate-700 text-sm font-medium">
                  {hasAnswer ? getDisplayValue(q, val) : "N/A"}
                </p>
              </div>
              <Pencil
                size={13}
                className="shrink-0 mt-1 text-slate-300 group-hover:text-[#002452] transition-colors"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function IntakeWizard() {
  const router = useRouter();
  const ph = usePostHog();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<V2Answers>({});
  const [showSummary, setShowSummary] = useState(false);
  const [editingFromSummary, setEditingFromSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  // Derived state
  const track = (answers.q1 as V2Track) ?? null;
  const category = (answers.q2 as string) ?? null;

  const categoryLabel = useMemo(() => {
    if (!track || !category) return null;
    return getQ2ForTrack(track).options.find((o) => o.value === category)?.label ?? null;
  }, [track, category]);

  const questions = useMemo(
    () => getQuestionSequence(track, category),
    [track, category]
  );

  const currentQuestion = questions[currentStep] ?? questions[0];
  const totalQuestions = category ? questions.length : null;

  // ── Answer handling ──────────────────────────────────────────────────────────

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    if (questionId === "q1") {
      const newTrack = value as string;
      if (newTrack !== answers.q1) {
        setAnswers({ q1: newTrack });
        setEditingFromSummary(false);
      } else {
        setAnswers((prev) => ({ ...prev, q1: newTrack }));
      }
      return;
    }

    if (questionId === "q2") {
      const newCategory = value as string;
      if (newCategory !== answers.q2 && track) {
        const contextQIds = TRACK_CONTEXT_QUESTIONS[track].map((q) => q.id);
        const preserved: V2Answers = { q1: answers.q1 as string, q2: newCategory };
        contextQIds.forEach((id) => {
          if (answers[id] !== undefined) preserved[id] = answers[id] as string | string[];
        });
        setAnswers(preserved);
        setEditingFromSummary(false);
      } else {
        setAnswers((prev) => ({ ...prev, q2: value as string }));
      }
      return;
    }

    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const canProceed = (): boolean => {
    if (!currentQuestion.required) return true;
    const val = answers[currentQuestion.id];
    if (val === undefined || val === null) return false;
    if (typeof val === "number") return true;
    if (typeof val === "string") return val.trim() !== "";
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const handleNext = () => {
    setDirection(1);
    if (editingFromSummary) {
      setEditingFromSummary(false);
      setShowSummary(true);
      return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (showSummary) {
      setShowSummary(false);
      setCurrentStep(questions.length - 1);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleEditQuestion = (index: number) => {
    setDirection(-1);
    setShowSummary(false);
    setCurrentStep(index);
    setEditingFromSummary(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!track || !category) return;
    setIsSubmitting(true);

    // Try to fetch firms from Supabase; fall back to local data if unavailable or empty.
    let allFirms = localFirms;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("firms")
        .select("*, attorneys(*), firm_assessment_items(*)");
      if (!error && data && data.length > 0) {
        allFirms = (data as DbFirm[]).map(mapDbFirmToFirm);
      }
    } catch {
      // Supabase unavailable — proceed with local firms
    }

    const results = matchFirmsV2(track, category, answers, allFirms);

    sessionStorage.setItem("lwyrd_results", JSON.stringify(results));
    sessionStorage.setItem("lwyrd_category", category);
    sessionStorage.setItem("lwyrd_category_name", categoryLabel ?? category);
    sessionStorage.setItem("lwyrd_track", track);
    sessionStorage.setItem("lwyrd_answers_v2", JSON.stringify(answers));

    void saveIntakeSubmissionV2(track, category, categoryLabel ?? category, answers, results);

    ph?.capture("intake_completed_v2", {
      track,
      category,
      result_count: results.length,
      top_score: results[0]?.score ?? 0,
    });

    router.push("/results");
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const pillLabel = categoryLabel ?? "Legal Intake";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <span className="inline-block bg-[#002452] text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-wide mb-4">
          {pillLabel}
        </span>
        <h1
          className="text-3xl sm:text-4xl text-[#002452]"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          {showSummary ? "Review your answers" : "Tell us about your needs"}
        </h1>
        {!showSummary && (
          <p className="text-slate-500 text-sm mt-2">
            Your answers help us find the most relevant firms for you. There are no right or wrong answers.
          </p>
        )}
      </div>

      {/* Progress bar */}
      {!showSummary && (
        <ProgressBar current={currentStep + 1} total={totalQuestions} />
      )}

      {/* Content */}
      <div className="mt-8 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={showSummary ? "summary" : currentStep}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.28, ease }}
          >
            {showSummary ? (
              <SummaryView
                questions={questions}
                answers={answers}
                onEdit={handleEditQuestion}
              />
            ) : (
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                value={answers[currentQuestion.id] as string | string[] | number | undefined}
                onChange={(val) => handleAnswerChange(currentQuestion.id, val)}
                billingPreference={
                  currentQuestion.type === "budget-range"
                    ? (answers[BUDGET_TO_BILLING_ID[currentQuestion.id] ?? ""] as string | undefined)
                    : undefined
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 && !showSummary}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#ddd7cc] text-slate-600 text-sm font-medium hover:border-[#002452] hover:text-[#002452] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {editingFromSummary && (
          <button
            onClick={() => {
              setDirection(1);
              setEditingFromSummary(false);
              setShowSummary(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#002452] text-[#002452] text-sm font-medium hover:bg-[#002452] hover:text-white transition-colors"
          >
            Back to Review
          </button>
        )}

        {showSummary ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Finding matches…" : "Find My Matches"}
            {!isSubmitting && <ArrowRight size={15} />}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep < questions.length - 1 ? "Next" : "Review"}
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
