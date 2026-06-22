"use client";

import Link from "next/link";
import { Firm, MatchResult } from "@/types";
import { Award, MapPin, Building2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import SaveFirmButton from "@/components/firms/SaveFirmButton";

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size",
  large: "Large",
};

const missedLabels: Record<string, string> = {
  "company-stage": "Stage — doesn't specialize in your company stage",
  budget: "Budget — outside your budget range",
  industry: "Industry — doesn't serve your vertical",
  location: "Location — may not be licensed in your state",
  timeline: "Timeline — may not match your urgency",
  language: "Language — may not have attorneys who speak your language",
};

const billingModelLabels: Record<string, string> = {
  hourly: "Hourly",
  "flat-fee": "Flat-fee",
  retainer: "Retainer",
  hybrid: "Hybrid",
};

function formatK(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function getMissedLabel(criterion: string, firm: Firm): string {
  if (criterion === "budget") {
    const { min, max } = firm.budgetRange;
    if (min > 0 && max > 0) return `Budget — firm's typical range is ${formatK(min)}–${formatK(max)}`;
    if (min > 0) return `Budget — firm typically starts at ${formatK(min)}`;
    return "Budget — outside your budget range";
  }
  if (criterion === "billing") {
    const model = billingModelLabels[firm.billingModel] ?? firm.billingModel;
    return `Billing — this firm uses ${model.toLowerCase()} billing`;
  }
  if (criterion === "firm-size") {
    const size = sizeLabels[firm.size]?.toLowerCase() ?? firm.size;
    return `Firm size — ${size} firm`;
  }
  return missedLabels[criterion] ?? criterion;
}

function ScoreRing({ score }: { score: number }) {
  const size = 68;
  const radius = 27;
  const stroke = 4.5;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#ddd7cc" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#002452" strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s ease 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[#002452] leading-none"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500, fontSize: "1.1rem" }}
        >
          {score}
        </span>
        <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">%</span>
      </div>
    </div>
  );
}

function MetaChip({ icon: Icon, label }: { icon?: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#002452]/[0.05] text-[#002452]/70 text-xs px-3 py-1.5 rounded-full font-medium">
      {Icon && <Icon size={11} strokeWidth={1.75} />}
      {label}
    </span>
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

  return (
    <div
      className={`rounded-3xl overflow-hidden border transition-shadow hover:shadow-md ${
        isBestMatch
          ? "bg-[#fbfaf6] border-[#002452]/25 shadow-sm"
          : "bg-[#fbfaf6] border-[#ddd7cc] shadow-sm"
      }`}
    >
      {/* Best match accent bar */}
      {isBestMatch && (
        <div className="h-[3px] bg-[#002452]" />
      )}

      <div className="p-7">
        {/* Header row */}
        <div className="flex items-start justify-between gap-6 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isBestMatch && (
                <span className="inline-flex items-center gap-1.5 bg-[#002452] text-white text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-widest uppercase">
                  <Award size={9} strokeWidth={2.5} />
                  Best Match
                </span>
              )}
              {!isBestMatch && rank > 0 && (
                <span className="text-[11px] text-slate-400 font-medium tracking-wide">#{rank}</span>
              )}
            </div>
            <h3
              className="text-[#002452] text-[1.4rem] leading-tight"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              {firm.name}
            </h3>
            <p className="text-slate-500 text-sm mt-1.5 leading-snug">{firm.tagline}</p>
          </div>

          {/* Score ring */}
          <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
            <ScoreRing score={roundedScore} />
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Match</span>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          <MetaChip icon={MapPin} label={firm.location} />
          <MetaChip icon={Building2} label={`${sizeLabels[firm.size]} firm`} />
          <MetaChip label={`Est. ${firm.founded}`} />
          <MetaChip label={`${billingModelLabels[firm.billingModel] ?? firm.billingModel} billing`} />
        </div>

        {/* Criteria breakdown */}
        {hasCriteria && (
          <div className="mb-5 bg-[#002452]/[0.025] rounded-2xl px-4 py-3.5 space-y-2">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                {r}
              </div>
            ))}
            {result.missedCriteria.map((c) => (
              <div key={c} className="flex items-start gap-2.5 text-sm text-slate-400">
                <XCircle size={14} className="text-rose-400/70 mt-0.5 shrink-0" />
                {getMissedLabel(c, firm)}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-end gap-2.5">
          <SaveFirmButton firmId={firm.id} initialSaved={initialSaved} compact />
          <Link
            href={`/firms/${firm.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002452] focus-visible:ring-offset-2"
          >
            View Profile
            <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
