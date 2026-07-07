"use client";

import Link from "next/link";
import { Firm, MatchResult } from "@/types";
import { Award, MapPin, Building2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import SaveFirmButton from "@/components/firms/SaveFirmButton";

const serif = { fontFamily: '"Libre Baskerville", Georgia, serif' } as const;

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size",
  large: "Large",
};

const billingModelLabels: Record<string, string> = {
  hourly: "Hourly",
  "flat-fee": "Flat-fee",
  retainer: "Retainer",
  hybrid: "Hybrid",
};

const missedLabels: Record<string, string> = {
  "company-stage": "Stage: doesn't specialize in your company stage",
  budget: "Budget: outside your budget range",
  industry: "Industry: doesn't serve your vertical",
  location: "Location: may not be licensed in your state",
  timeline: "Timeline: may not match your urgency",
  language: "Language: may not have attorneys who speak your language",
};

function formatK(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function getMissedLabel(criterion: string, firm: Firm): string {
  if (criterion === "budget") {
    const { min, max } = firm.budgetRange;
    if (min > 0 && max > 0) return `Budget: firm's typical range is ${formatK(min)}–${formatK(max)}`;
    if (min > 0) return `Budget: firm typically starts at ${formatK(min)}`;
    return "Budget: outside your budget range";
  }
  if (criterion === "billing") {
    const model = billingModelLabels[firm.billingModel] ?? firm.billingModel;
    return `Billing: this firm uses ${model.toLowerCase()} billing`;
  }
  if (criterion === "firm-size") {
    const size = sizeLabels[firm.size]?.toLowerCase() ?? firm.size;
    return `Firm size: ${size} firm`;
  }
  return missedLabels[criterion] ?? criterion;
}

function ScoreRing({ score }: { score: number }) {
  const size = 124;
  const radius = 49;
  const stroke = 6.5;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2.5 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7E7E3" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#002B55" strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.85s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <span className="leading-none tabular-nums" style={{ ...serif, color: "var(--navy)", fontSize: "2rem" }}>
              {score}
            </span>
            <span className="text-sm text-[#6B6B70] font-medium">%</span>
          </div>
        </div>
      </div>
      <span className="text-[11px] text-[#9A9AA0] font-semibold tracking-widest uppercase">Match Score</span>
    </div>
  );
}

interface MatchCardProps {
  result: MatchResult;
  rank: number;
  initialSaved?: boolean;
}

export default function MatchCard({ result, rank, initialSaved = false }: MatchCardProps) {
  const { firm, score, reasons, isBestMatch } = result;
  const roundedScore = Math.round(score);
  const hasCriteria = reasons.length > 0 || result.missedCriteria.length > 0;
  const hasBoth = reasons.length > 0 && result.missedCriteria.length > 0;

  return (
    <div
      className="rounded-[18px] bg-white overflow-hidden transition-all hover:shadow-md"
      style={{
        border: isBestMatch ? "1.5px solid var(--navy)" : "1px solid var(--line)",
        boxShadow: isBestMatch ? "0 8px 28px rgba(0,43,85,0.12)" : "var(--shadow-sm)",
      }}
    >
      {isBestMatch && <div style={{ height: 3, background: "var(--navy)" }} />}

      <div className="p-8 sm:p-10">
        {/* Header */}
        <div className="flex items-start gap-8 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {isBestMatch && (
                <span className="inline-flex items-center gap-1.5 text-white text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ background: "var(--navy)" }}>
                  <Award size={9} strokeWidth={2.5} />
                  Best Match
                </span>
              )}
              {!isBestMatch && rank > 0 && (
                <span className="text-xs text-[#9A9AA0] font-medium">#{rank}</span>
              )}
            </div>
            <h3 style={{ ...serif, fontSize: "1.85rem", lineHeight: 1.2, marginBottom: ".5rem" }}>{firm.name}</h3>
            <p className="text-[#6B6B70] text-base leading-relaxed">{firm.tagline}</p>
          </div>

          <ScoreRing score={roundedScore} />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#6B6B70] pb-6" style={{ borderBottom: "1px solid var(--line)" }}>
          <span className="flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={1.75} className="shrink-0" />
            {firm.location}
          </span>
          <span className="text-[#D8D8D2]">·</span>
          <span className="flex items-center gap-1.5">
            <Building2 size={13} strokeWidth={1.75} className="shrink-0" />
            {sizeLabels[firm.size] ?? firm.size} firm
          </span>
          {firm.founded && (
            <>
              <span className="text-[#D8D8D2]">·</span>
              <span>Est. {firm.founded}</span>
            </>
          )}
          {firm.billingModel && (
            <>
              <span className="text-[#D8D8D2]">·</span>
              <span>{billingModelLabels[firm.billingModel] ?? firm.billingModel} billing</span>
            </>
          )}
        </div>

        {/* Criteria */}
        {hasCriteria && (
          <div className={`py-6 ${hasBoth ? "grid sm:grid-cols-2 gap-x-8 gap-y-2.5" : "space-y-2.5"}`} style={{ borderBottom: "1px solid var(--line)" }}>
            {hasBoth ? (
              <>
                <div className="space-y-2.5">
                  {reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-[#2A2A2E]">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      {r}
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {result.missedCriteria.map((c) => (
                    <div key={c} className="flex items-start gap-3 text-sm text-[#9A9AA0]">
                      <XCircle size={16} className="text-rose-500/80 mt-0.5 shrink-0" />
                      {getMissedLabel(c, firm)}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-[#2A2A2E]">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    {r}
                  </div>
                ))}
                {result.missedCriteria.map((c) => (
                  <div key={c} className="flex items-start gap-3 text-sm text-[#9A9AA0]">
                    <XCircle size={16} className="text-rose-500/80 mt-0.5 shrink-0" />
                    {getMissedLabel(c, firm)}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between gap-4 pt-6">
          <SaveFirmButton firmId={firm.id} initialSaved={initialSaved} compact />
          <Link href={`/firms/${firm.id}`} className="btn btn-primary">
            View full profile
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
