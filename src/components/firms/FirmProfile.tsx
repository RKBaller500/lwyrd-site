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
const serif = { fontFamily: '"Libre Baskerville", Georgia, serif' } as const;

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
      <div className="ds-shell">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="ds-breadcrumb"
          style={{ marginBottom: "2rem" }}
        >
          <Link href="/results">Your matches</Link>
          <span className="sep">/</span>
          <span style={{ color: "var(--ink-2)" }}>{firm.name}</span>
        </motion.nav>

        <div className="fp-grid">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.08 }}
            style={{ display: "grid", gap: "2.5rem" }}
          >
            {/* Hero */}
            <div className="ds-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {firm.verified && (
                    <div className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4" style={{ background: "var(--navy)" }}>
                      <Shield size={11} />
                      LWYRD Verified
                    </div>
                  )}
                  <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1.1 }}>{firm.name}</h1>
                  <p className="text-[#6B6B70] text-base mt-2">{firm.tagline}</p>
                </div>
                {/* Score */}
                <div className="text-center shrink-0">
                  <div style={{ ...serif, fontSize: "3rem", color: "var(--navy)", lineHeight: 1 }}>
                    {matchScore ?? firm.overallScore}
                  </div>
                  <div className="text-xs text-[#9A9AA0] mt-1">
                    {matchScore !== null ? "match score" : "LWYRD Score"}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 text-sm text-[#6B6B70] pt-5 mt-5" style={{ borderTop: "1px solid var(--line)" }}>
                <span className="flex items-center gap-1.5"><MapPin size={14} />{firm.location}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} />Founded {firm.founded}</span>
                <span className="flex items-center gap-1.5"><Users size={14} />{sizeLabels[firm.size]}</span>
              </div>
            </div>

            {/* About */}
            <div>
              <h2 style={{ fontSize: "clamp(1.35rem,2.4vw,1.8rem)", marginBottom: "1rem" }}>About the firm</h2>
              <p className="text-[#2A2A2E] text-sm leading-relaxed">{firm.description}</p>
            </div>

            {/* Strengths */}
            {firm.strengths.length > 0 && (
              <div>
                <h2 style={{ fontSize: "clamp(1.35rem,2.4vw,1.8rem)", marginBottom: "1rem" }}>Key strengths</h2>
                <div className="space-y-2">
                  {firm.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--line)" }}>
                      <Star size={14} style={{ color: "var(--navy)", marginTop: 2, flexShrink: 0 }} strokeWidth={2} />
                      <span className="text-[#2A2A2E] text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team */}
            {firm.team.length > 0 && (
              <div>
                <h2 style={{ fontSize: "clamp(1.35rem,2.4vw,1.8rem)", marginBottom: "1.25rem" }}>The team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {firm.team.map((attorney) => (
                    <div key={attorney.name} className="ds-card">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--navy-tint)", border: "1px solid var(--navy-tint-2)" }}>
                        <span style={{ ...serif, color: "var(--navy)", fontSize: "1.25rem" }}>{attorney.name[0]}</span>
                      </div>
                      <p style={{ ...serif, fontSize: "1.1rem", marginBottom: 2 }}>{attorney.name}</p>
                      <p className="text-[#6B6B70] text-xs font-medium mb-3">{attorney.title}</p>
                      <p className="text-[#2A2A2E] text-sm leading-relaxed mb-3 line-clamp-3">{attorney.bio}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {attorney.barAdmissions.map((b) => (
                          <span key={b} className="chip" style={{ fontSize: ".72rem" }}>{b}</span>
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
                <h2 style={{ fontSize: "clamp(1.35rem,2.4vw,1.8rem)" }}>LWYRD Assessment</h2>
                <span className="text-sm text-[#6B6B70]">{passedItems}/{totalItems} criteria met</span>
              </div>
              <div className="rounded-[18px] overflow-hidden" style={{ border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
                <div className="px-6 py-4 navy-panel" style={{ borderRadius: 0 }}>
                  <p className="text-white/85 text-sm leading-relaxed">
                    Every firm in the LWYRD network is evaluated against a standard set of criteria before being listed. These assessments are conducted as part of our onboarding process and updated periodically.
                  </p>
                </div>
                <div className="p-6 space-y-3" style={{ background: "#fff" }}>
                  {firm.assessment.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {item.passed ? (
                        <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className={`text-sm ${item.passed ? "text-[#2A2A2E]" : "text-[#9A9AA0]"}`}>{item.label}</span>
                        {item.note && <p className="text-xs text-[#9A9AA0] mt-0.5">{item.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.18 }}
            style={{ display: "grid", gap: "1.25rem", alignContent: "start" }}
          >
            {/* CTA card */}
            <div className="navy-panel">
              <h3 style={{ fontSize: "1.5rem", marginBottom: ".75rem" }}>Connect with {firm.name}</h3>
              <p style={{ color: "rgba(255,255,255,.72)", fontSize: ".9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Ready to reach out? Your intake summary will be shared with {firm.name} so they have context before your first conversation.
              </p>
              <button
                onClick={() => setContactModalOpen(true)}
                className="btn"
                style={{ width: "100%", justifyContent: "center", background: "#fff", color: "var(--navy)" }}
              >
                Contact this firm <ArrowRight size={14} />
              </button>
            </div>
            <SaveFirmButton firmId={firm.id} initialSaved={initialSaved} />

            {/* Firm details */}
            <div className="ds-card" style={{ display: "grid", gap: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem" }}>Firm details</h3>
              <DetailRow label="Billing model" value={billingLabels[firm.billingModel]} />
              {firm.hourlyRate && <DetailRow label="Hourly rate (approx.)" value={`$${firm.hourlyRate.toLocaleString()}/hr`} />}
              {firm.budgetRange.min > 0 && (
                <DetailRow label="Monthly range" value={`$${(firm.budgetRange.min / 1000).toFixed(0)}k – $${(firm.budgetRange.max / 1000).toFixed(0)}k`} />
              )}
              <DetailRow label="Response time" value={responseLabels[firm.responseTime]} />
              {firm.languages.length > 1 && <DetailRow label="Languages" value={firm.languages.join(", ")} />}
            </div>

            {/* Practice areas */}
            <div className="ds-card">
              <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Practice areas</h3>
              <div className="flex flex-wrap gap-2">
                {firm.practiceAreas.map((slug) => (
                  <Link key={slug} href={`/services/${slug}`} className="chip" style={{ textTransform: "capitalize" }}>
                    {slug.replace(/-/g, " ")}
                  </Link>
                ))}
              </div>
            </div>

            {/* Industries */}
            {firm.industries.length > 0 && (
              <div className="ds-card">
                <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Industries served</h3>
                <div className="flex flex-wrap gap-2">
                  {firm.industries.map((ind) => (
                    <span key={ind} className="chip" style={{ textTransform: "capitalize" }}>{ind.replace(/-/g, " ")}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      </div>

      <style>{`
        .fp-grid{display:grid;grid-template-columns:1fr;gap:2.5rem}
        @media(min-width:960px){.fp-grid{grid-template-columns:2fr 1fr}}
      `}</style>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#9A9AA0] font-medium mb-0.5">{label}</p>
      <p className="text-[#2A2A2E] text-sm">{value}</p>
    </div>
  );
}
