"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { LegalCategory } from "@/types";
import ContactLwyrdModal from "@/components/ui/ContactLwyrdModal";

interface ServiceDetailProps {
  category: LegalCategory;
}

export default function ServiceDetail({ category }: ServiceDetailProps) {
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  return (
    <>
      <ContactLwyrdModal
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
        categoryName={category.name}
      />
      <div className="ds-shell">
        {/* Breadcrumb */}
        <nav className="ds-breadcrumb" style={{ marginBottom: "2rem" }}>
          <Link href="/intake">Get matched</Link>
          <span className="sep">/</span>
          <span style={{ color: "var(--ink-2)" }}>{category.name}</span>
        </nav>

        <div className="sd-grid">
          {/* Main content */}
          <div style={{ display: "grid", gap: "2.5rem" }}>
            {/* Hero */}
            <div>
              <span className="ds-eyebrow" style={{ display: "block", marginBottom: ".8rem" }}>
                {category.heroTag}
              </span>
              <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", marginBottom: "1.2rem" }}>
                {category.name}
              </h1>
              <div style={{ display: "grid", gap: "1rem" }}>
                {category.fullDescription.split("\n\n").map((para, i) => (
                  <p key={i} style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7 }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* What firms do */}
            <div className="navy-panel">
              <h2 style={{ fontSize: "clamp(1.35rem,2.4vw,1.8rem)", marginBottom: "1rem" }}>
                What firms in this area do
              </h2>
              <p style={{ color: "rgba(255,255,255,.8)", fontSize: ".95rem", lineHeight: 1.7 }}>
                {category.whatFirmsDo}
              </p>
            </div>

            {/* Service examples */}
            <div>
              <h2 style={{ fontSize: "clamp(1.35rem,2.4vw,1.8rem)", marginBottom: "1.4rem" }}>
                Specific services you might need
              </h2>
              <div className="sd-examples">
                {category.serviceExamples.map((example, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: ".75rem",
                      background: "#fff",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      padding: "1rem",
                    }}
                  >
                    <CheckCircle2 size={16} style={{ color: "var(--navy)", marginTop: 2, flexShrink: 0 }} strokeWidth={2} />
                    <span style={{ color: "var(--ink-2)", fontSize: ".9rem", lineHeight: 1.4 }}>{example}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: CTAs */}
          <aside style={{ display: "grid", gap: "1.25rem", alignContent: "start" }}>
            <div className="navy-panel">
              <h3 style={{ fontSize: "1.5rem", marginBottom: ".75rem" }}>Find your match</h3>
              <p style={{ color: "rgba(255,255,255,.72)", fontSize: ".9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Answer a short set of questions about your needs and we&apos;ll match you with the right firm.
              </p>
              <Link
                href="/intake"
                className="btn"
                style={{ width: "100%", justifyContent: "center", background: "#fff", color: "var(--navy)" }}
              >
                Start intake <ArrowRight size={15} />
              </Link>
            </div>

            <div className="ds-card">
              <h3 style={{ fontSize: "1.5rem", marginBottom: ".75rem" }}>Book a consultation</h3>
              <p style={{ color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Prefer to speak with the LWYRD team first? We&apos;ll help you understand your needs and make a personal recommendation.
              </p>
              <button
                onClick={() => setConsultModalOpen(true)}
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Get in touch
              </button>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .sd-grid{display:grid;grid-template-columns:1fr;gap:2.5rem}
        @media(min-width:960px){.sd-grid{grid-template-columns:2fr 1fr;gap:2.5rem}}
        .sd-examples{display:grid;grid-template-columns:1fr;gap:.75rem}
        @media(min-width:560px){.sd-examples{grid-template-columns:1fr 1fr}}
      `}</style>
    </>
  );
}
