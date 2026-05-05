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
    <div className="space-y-3">
      <p className="text-slate-500 text-sm mb-6">
        Review your answers below. Click any row to change that answer, then proceed to find your matches.
      </p>
      {questions.map((q, index) => {
        const val = answers[q.id];
        const hasAnswer = val !== undefined && val !== null && val !== "" && !(Array.isArray(val) && val.length === 0);
        return (
          <button
            key={q.id}
            onClick={() => onEditQuestion(index)}
            className={`w-full text-left bg-[#fbfaf6] border border-[#ddd7cc] rounded-2xl p-5 group hover:border-[#002452] hover:bg-white transition-colors ${!hasAnswer && !q.required ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium mb-1">{q.question}</p>
                <p className="text-slate-700 text-sm font-medium">
                  {formatAnswer(q, val)}
                </p>
              </div>
              <Pencil size={13} className="shrink-0 mt-1 text-slate-300 group-hover:text-[#002452] transition-colors" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
