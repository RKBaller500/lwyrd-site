import { Pencil } from "lucide-react";
import { IntakeQuestion, IntakeAnswers } from "@/types";

interface IntakeSummaryProps {
  questions: IntakeQuestion[];
  answers: IntakeAnswers;
  onEditQuestion: (index: number) => void;
}

export default function IntakeSummary({ questions, answers, onEditQuestion }: IntakeSummaryProps) {
  const formatAnswer = (q: IntakeQuestion, val: string | string[] | number | undefined): string => {
    if (val === undefined || val === null || val === "") return "N/A";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "N/A";
    if (q.type === "budget-range") {
      const n = Number(val);
      if (n === 0) return "Not set";
      if (n >= (q.max ?? 50000)) return `$${((q.max ?? 50000) / 1000).toFixed(0)}k+ / month`;
      return `$${n.toLocaleString()} / month`;
    }
    return String(val);
  };

  return (
    <div className="intake-summary">
      <p className="intake-summary-intro">
        Review your answers below. Click any row to change that answer, then proceed to find your matches.
      </p>
      {questions.map((q, index) => {
        const val = answers[q.id];
        const hasAnswer = val !== undefined && val !== null && val !== "" && !(Array.isArray(val) && val.length === 0);
        return (
          <button
            key={q.id}
            onClick={() => onEditQuestion(index)}
            className={`intake-summary-row ${!hasAnswer && !q.required ? "is-empty" : ""}`}
          >
            <div className="intake-summary-row-inner">
              <div>
                <p className="intake-summary-question">{q.question}</p>
                <p className="intake-summary-answer">
                  {formatAnswer(q, val)}
                </p>
              </div>
              <Pencil size={13} className="intake-summary-icon" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
