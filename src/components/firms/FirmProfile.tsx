"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import { Firm } from "@/types";
import { MapPin, Calendar, CheckCircle2, XCircle, Shield, Users, ArrowRight, Star } from "lucide-react";
import ContactFirmModal from "@/components/ui/ContactFirmModal";
import SaveFirmButton from "./SaveFirmButton";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size firm",
  large: "Large firm",
};

const billingLabels: Record<string, string> = {
  hourly: "Hourly",
  retainer: "Monthly retainer",
  "flat-fee": "Flat fee",
  hybrid: "Hybrid (hourly + flat fee options)",
};

const responseLabels: Record<string, string> = {
  "same-day": "Same-day response",
  "24h": "Within 24 hours",
  "48h": "Within 48 hours",
  "72h": "Within 72 hours",
};

interface FirmProfileProps {
  firm: Firm;
  initialSaved?: boolean;
}

export default function FirmProfile({ firm, initialSaved }: FirmProfileProps) {
  const passedItems = firm.assessment.filter((a) => a.passed).length;
  const totalItems = firm.assessment.length;
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const ph = usePostHog();

  useEffect(() => {
    let score: number | null = null;
    try {
      const raw = sessionStorage.getItem("lwyrd_match_scores");
      if (raw) {
        const map = JSON.parse(raw) as Record<string, number>;
        if (map[firm.id] !== undefined) score = map[firm.id];
      }
    } catch {
      // sessionStorage unavailable or malformed, fall back to overallScore
    }
    if (score !== null) setMatchScore(score);
    ph?.capture("firm_viewed", {
      firm_id: firm.id,
      firm_name: firm.name,
      match_score: score,
    });
  }, [firm.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
    <ContactFirmModal
      isOpen={contactModalOpen}
      onClose={() => setContactModalOpen(false)}
      firmName={firm.name}
    />
    <div className="max-w-7xl mx-auto px-6 py-14">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="flex items-center gap-2 text-sm text-slate-400 mb-8"
      >
        <Link href="/browse" className="hover:text-[#002452] transition-colors">Legal Services</Link>
        <span>/</span>
        <Link href="/results" className="hover:text-[#002452] transition-colors">Your Matches</Link>
        <span>/</span>
        <span className="text-slate-600">{firm.name}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.08 }}
          className="lg:col-span-2 space-y-10"
        >
          {/* Hero */}
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {firm.verified && (
                  <div className="inline-flex items-center gap-1.5 bg-[#002452] text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                    <Shield size={11} />
                    LWYRD Verified
                  </div>
                )}
                <h1
                  className="text-4xl sm:text-5xl text-[#002452] leading-tight"
                  style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
                >
                  {firm.name}
                </h1>
                <p className="text-slate-500 text-base mt-2">{firm.tagline}</p>
              </div>
              {/* Score */}
              <div className="text-center shrink-0">
                <div
                  className="text-5xl text-[#002452]"
                  style={{ fontFamily: '"Lora", Georgia, serif' }}
                >
                  {matchScore ?? firm.overallScore}
                </div>
                <div className="text-xs text-slate-400">
                  {matchScore !== null ? "match score" : "LWYRD Score"}
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 border-t border-[#ddd7cc] pt-5 mt-5">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {firm.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Founded {firm.founded}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {sizeLabels[firm.size]}
              </span>
            </div>
          </div>

          {/* About */}
          <div>
            <h2
              className="text-[#002452] text-2xl mb-4"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              About the firm
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">{firm.description}</p>
          </div>

          {/* Strengths */}
          {firm.strengths.length > 0 && (
            <div>
              <h2
                className="text-[#002452] text-2xl mb-4"
                style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
              >
                Key strengths
              </h2>
              <div className="space-y-2">
                {firm.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#fbfaf6] border border-[#ddd7cc] rounded-2xl p-4">
                    <Star size={14} className="text-[#002452] mt-0.5 shrink-0" strokeWidth={1.5} />
                    <span className="text-slate-600 text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {firm.team.length > 0 && (
            <div>
              <h2
                className="text-[#002452] text-2xl mb-5"
                style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
              >
                The team
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {firm.team.map((attorney) => (
                  <div key={attorney.name} className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
                    {/* Avatar placeholder */}
                    <div className="w-12 h-12 rounded-full bg-[#002452]/10 border border-[#ddd7cc] flex items-center justify-center mb-4">
                      <span
                        className="text-[#002452] text-xl"
                        style={{ fontFamily: '"Lora", Georgia, serif' }}
                      >
                        {attorney.name[0]}
                      </span>
                    </div>
                    <p
                      className="text-[#002452] text-lg mb-0.5"
                      style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
                    >
                      {attorney.name}
                    </p>
                    <p className="text-slate-400 text-xs font-medium mb-3">{attorney.title}</p>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-3">{attorney.bio}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {attorney.barAdmissions.map((b) => (
                        <span
                          key={b}
                          className="text-xs bg-[#002452]/8 text-[#002452] px-3 py-1 rounded-full"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LWYRD Assessment */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-[#002452] text-2xl"
                style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
              >
                LWYRD Assessment
              </h2>
              <span className="text-sm text-slate-500">
                {passedItems}/{totalItems} criteria met
              </span>
            </div>
            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden">
              <div className="bg-[#002452] px-6 py-4">
                <p className="text-white/85 text-sm leading-relaxed">
                  Every firm in the LWYRD network is evaluated against a standard set of criteria before being listed. These assessments are conducted as part of our onboarding process and updated periodically.
                </p>
              </div>
              <div className="p-6 space-y-3">
                {firm.assessment.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {item.passed ? (
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <span className={`text-sm ${item.passed ? "text-slate-700" : "text-slate-500"}`}>
                        {item.label}
                      </span>
                      {item.note && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.18 }}
          className="space-y-5"
        >
          {/* CTA card */}
          <div className="bg-[#002452] rounded-3xl p-8 text-white">
            <h3
              className="text-2xl mb-3"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Connect with {firm.name}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Ready to reach out? Your intake summary will be shared with {firm.name} so they have context before your first conversation.
            </p>
            <button
              onClick={() => setContactModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white text-[#002452] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Contact This Firm
              <ArrowRight size={14} />
            </button>
          </div>
          <SaveFirmButton firmId={firm.id} initialSaved={initialSaved} />

          {/* Firm details */}
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 space-y-4">
            <h3
              className="text-[#002452] text-lg mb-3"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Firm details
            </h3>
            <DetailRow label="Billing model" value={billingLabels[firm.billingModel]} />
            {firm.hourlyRate && (
              <DetailRow label="Hourly rate (approx.)" value={`$${firm.hourlyRate.toLocaleString()}/hr`} />
            )}
            {firm.budgetRange.min > 0 && (
              <DetailRow
                label="Monthly range"
                value={`$${(firm.budgetRange.min / 1000).toFixed(0)}k – $${(firm.budgetRange.max / 1000).toFixed(0)}k`}
              />
            )}
            <DetailRow label="Response time" value={responseLabels[firm.responseTime]} />
            {firm.languages.length > 1 && (
              <DetailRow label="Languages" value={firm.languages.join(", ")} />
            )}
          </div>

          {/* Practice areas */}
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <h3
              className="text-[#002452] text-lg mb-4"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Practice areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {firm.practiceAreas.map((slug) => (
                <Link
                  key={slug}
                  href={`/services/${slug}`}
                  className="text-xs bg-[#002452]/10 text-[#002452] px-3 py-1.5 rounded-full hover:bg-[#002452] hover:text-white transition-colors capitalize"
                >
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>

          {/* Industries */}
          {firm.industries.length > 0 && (
            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
              <h3
                className="text-[#002452] text-lg mb-4"
                style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
              >
                Industries served
              </h3>
              <div className="flex flex-wrap gap-2">
                {firm.industries.map((ind) => (
                  <span
                    key={ind}
                    className="text-xs bg-[#f5f4f0] border border-[#ddd7cc] text-slate-600 px-3 py-1.5 rounded-full capitalize"
                  >
                    {ind.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="text-slate-700 text-sm">{value}</p>
    </div>
  );
}
