"use client";

import Link from "next/link";
import { MatchResult } from "@/types";
import { CheckCircle2, XCircle, Award, MapPin, Building2, ArrowRight, Lock } from "lucide-react";
import SaveFirmButton from "@/components/firms/SaveFirmButton";

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size",
  large: "Large",
};

interface MatchCardProps {
  result: MatchResult;
  rank: number;
  initialSaved?: boolean;
  blurred?: boolean;
}

export default function MatchCard({
  result,
  rank,
  initialSaved = false,
  blurred = false,
}: MatchCardProps) {
  const { firm, score, reasons, isBestMatch } = result;
  const passedCount = firm.assessment.filter((a) => a.passed).length;
  const totalCount = firm.assessment.length;

  if (blurred) {
    return (
      <div
        className={`rounded-3xl shadow-sm border overflow-hidden ${
          isBestMatch
            ? "bg-[#002452]/[0.03] border-[#002452]/30 border-l-4 border-l-[#002452]"
            : "bg-[#fbfaf6] border-[#ddd7cc] border-l-4 border-l-[#ddd7cc]"
        }`}
      >
        <div className="p-8">
          {/* Top row: rank + score */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {isBestMatch && (
                  <span className="inline-flex items-center gap-1 bg-[#002452] text-white text-xs px-3 py-1 rounded-full font-medium">
                    <Award size={11} />
                    Best Match
                  </span>
                )}
                {rank > 1 && (
                  <span className="text-xs text-slate-400">#{rank}</span>
                )}
              </div>
              {/* Blurred name + tagline */}
              <div className="blur-sm select-none pointer-events-none">
                <h3
                  className="text-[#002452] text-2xl leading-tight"
                  style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
                >
                  {firm.name}
                </h3>
                <p className="text-slate-500 text-sm mt-1">{firm.tagline}</p>
              </div>
            </div>

            {/* Score, always visible */}
            <div className="text-right shrink-0">
              <div
                className="text-4xl text-[#002452]"
                style={{ fontFamily: '"Lora", Georgia, serif' }}
              >
                {score}
              </div>
              <div className="text-xs text-slate-400">match score</div>
              <div className="mt-2 h-1.5 w-20 bg-[#ddd7cc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#002452] rounded-full"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Visible meta: size + practice area */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#002452]/8 text-[#002452] px-3 py-1.5 rounded-full font-medium">
              <Building2 size={11} />
              {sizeLabels[firm.size]} firm
            </span>
            {firm.practiceAreas[0] && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-[#002452]/8 text-[#002452] px-3 py-1.5 rounded-full font-medium capitalize">
                {firm.practiceAreas[0].replace(/-/g, " ")}
              </span>
            )}
            {totalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full font-medium">
                <CheckCircle2 size={11} />
                {passedCount}/{totalCount} LWYRD criteria met
              </span>
            )}
          </div>

          {/* Blurred match details */}
          <div className="blur-sm select-none pointer-events-none mb-5 space-y-1.5">
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {firm.location}
              </span>
              <span>Est. {firm.founded}</span>
              <span className="capitalize">{firm.billingModel} billing</span>
            </div>
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Locked footer */}
        <div className="border-t border-[#ddd7cc] bg-white/60 px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Lock size={14} className="text-slate-400 shrink-0" />
            Full profile and contact details are locked
          </div>
          <Link
            href="/access"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002452] focus-visible:ring-offset-2"
          >
            Get Access
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl shadow-sm p-8 border border-l-4 transition-shadow hover:shadow-md ${
        isBestMatch
          ? "bg-[#002452]/[0.03] border-[#002452]/30 border-l-[#002452]"
          : "bg-[#fbfaf6] border-[#ddd7cc] border-l-[#ddd7cc]"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        {/* Left: firm info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {isBestMatch && (
              <span className="inline-flex items-center gap-1 bg-[#002452] text-white text-xs px-3 py-1 rounded-full font-medium">
                <Award size={11} />
                Best Match
              </span>
            )}
            {rank > 1 && (
              <span className="text-xs text-slate-400">#{rank}</span>
            )}
          </div>
          <h3
            className="text-[#002452] text-2xl leading-tight"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            {firm.name}
          </h3>
          <p className="text-slate-500 text-sm mt-1">{firm.tagline}</p>
        </div>

        {/* Right: score */}
        <div className="text-right shrink-0">
          <div
            className="text-4xl text-[#002452]"
            style={{ fontFamily: '"Lora", Georgia, serif' }}
          >
            {score}
          </div>
          <div className="text-xs text-slate-400">match score</div>
          <div className="mt-2 h-1.5 w-20 bg-[#ddd7cc] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#002452] rounded-full transition-all duration-700 delay-300"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 mb-5 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {firm.location}
        </span>
        <span className="flex items-center gap-1">
          <Building2 size={12} />
          {sizeLabels[firm.size]} firm
        </span>
        <span>Est. {firm.founded}</span>
        <span className="capitalize">{firm.billingModel} billing</span>
      </div>

      {/* Match reasons */}
      {reasons.length > 0 && (
        <div className="mb-5 space-y-1.5">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Missed criteria */}
      {result.missedCriteria.includes("location") && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <XCircle size={12} className="text-amber-400 shrink-0" />
          May not be licensed in your preferred state
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-end gap-3">
        <SaveFirmButton firmId={firm.id} initialSaved={initialSaved} compact />
        <Link
          href={`/firms/${firm.id}`}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002452] focus-visible:ring-offset-2"
        >
          View Profile
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
