"use client";

import "@/styles/lwyrd-ds.css";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import ContactLwyrdModal from "@/components/ui/ContactLwyrdModal";
import { CheckCircle2, ArrowLeft, FileText, Layers3, ShieldCheck } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const included = [
  "Full firm identities and profiles for your matched firms",
  "A prepared summary of your matter, written from your answers",
  "A ready-to-send outreach message for each firm, yours to copy and send",
  "Guidance on what to ask and what to expect",
];

const tiers = [
  {
    name: "1 intake",
    label: "Single matter",
    description: "Best when you have one legal need and want to unlock the firms matched to that intake.",
    icon: FileText,
  },
  {
    name: "3-intake bundle",
    label: "Multiple needs",
    description: "For founders, operators, or families comparing counsel across a few separate legal issues.",
    icon: Layers3,
    featured: true,
  },
  {
    name: "5-intake bundle",
    label: "Ongoing matching",
    description: "For people or teams who expect recurring legal needs and want room to run several searches.",
    icon: ShieldCheck,
  },
];

function AccessContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("");

  const openModal = (category: string) => {
    setModalCategory(category);
    setModalOpen(true);
  };

  return (
    <>
      <ContactLwyrdModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoryName={modalCategory}
        title="Request unlock"
        formType="Unlock Request"
        subjectPrefix="Unlock Request"
        intro="Tell us which unlock option you want. You reach out to firms on your own terms; LWYRD gives you the identities, profiles, summary, and outreach draft so you are prepared."
        messagePlaceholder="Anything else you want us to know about this unlock?"
        submitLabel="Request unlock"
      />
      <div className="lwyrd-ds ds-page">
        <MarketingNav />
        <main className="ds-main mx-auto w-full" style={{ maxWidth: 1040, padding: "clamp(28px,5vw,56px) var(--pad)" }}>
          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease }}>
            <Link href="/results" className="ds-breadcrumb" style={{ marginBottom: "2.5rem" }}>
              <ArrowLeft size={14} /> Back to your matches
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
            className="mb-12"
          >
            <span className="kicker">Unlock</span>
            <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", margin: ".4rem 0 1rem" }}>Unlock your matches</h1>
            <p className="text-[#6B6B70] text-base max-w-2xl leading-relaxed">
              See who each firm is, open their full profiles, and get a prepared summary of
              your matter plus a ready-to-send message for each firm. You reach out on your
              own terms, we just make sure you walk in prepared. One-time, no subscription.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease, delay: 0.1 }}
            className="ds-card mb-6"
          >
            <p className="app-section-label mb-4">Every unlock includes</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {included.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span className="text-sm leading-relaxed text-[#2A2A2E]">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pricing tiers */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.14 }}
            className="grid grid-cols-1 gap-5 mb-10 md:grid-cols-3"
          >
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={tier.featured ? "navy-panel flex flex-col" : "ds-card flex flex-col"}
                  style={tier.featured ? { boxShadow: "var(--shadow-md)" } : undefined}
                >
                  <div
                    className={tier.featured ? "mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20" : "icon-box mb-5"}
                    style={tier.featured ? { background: "rgba(255,255,255,.12)" } : undefined}
                  >
                    <Icon size={20} className={tier.featured ? "text-white" : undefined} strokeWidth={1.5} />
                  </div>
                  <p className={tier.featured ? "mb-2 text-xs font-semibold uppercase tracking-widest text-white/55" : "mb-2 text-xs font-semibold uppercase tracking-widest text-[#9A9AA0]"}>
                    {tier.label}
                  </p>
                  <h2 style={{ fontSize: "1.42rem", marginBottom: ".7rem" }}>{tier.name}</h2>
                  <p className={tier.featured ? "mb-7 flex-1 text-sm leading-relaxed text-white/72" : "mb-7 flex-1 text-sm leading-relaxed text-[#6B6B70]"}>
                    {tier.description}
                  </p>
                  <button
                    onClick={() => openModal(tier.name)}
                    className={tier.featured ? "btn" : "btn btn-primary"}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      ...(tier.featured ? { background: "#fff", color: "var(--navy)" } : {}),
                    }}
                  >
                    Request {tier.name}
                  </button>
                </div>
              );
            })}
          </motion.div>

          {/* Reassurance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.24 }}
            className="ds-card text-center"
          >
            <p style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: "1.25rem", marginBottom: ".75rem" }}>
              Your intake is already complete
            </p>
            <p className="text-[#6B6B70] text-sm leading-relaxed max-w-xl mx-auto">
              You&apos;ve already told us what we need to rank your matches. Unlocking reveals
              the identities and profiles behind those results, plus the prepared materials you
              can use when you decide to reach out.
            </p>
          </motion.div>
        </main>
        <MarketingFooter />
      </div>
    </>
  );
}

export default function AccessPage() {
  return (
    <AuthGuard>
      <AccessContent />
    </AuthGuard>
  );
}
