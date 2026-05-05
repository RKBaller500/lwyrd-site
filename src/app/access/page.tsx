"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import ContactLwyrdModal from "@/components/ui/ContactLwyrdModal";
import { CheckCircle2, ArrowLeft, User, Building2 } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const individualBenefits = [
  "Full access to all matched firm profiles",
  "Direct contact details for each firm",
  "Personalized intake debrief with the LWYRD team",
  "Save and compare firms across multiple categories",
  "Priority response from our matching team",
];

const orgBenefits = [
  "Unlimited access for all members of your organization",
  "Dedicated LWYRD point of contact for your program",
  "Custom intake flows tailored to your community's needs",
  "Aggregated reporting on member legal needs",
  "Co-branding and white-label options available",
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
      />
      <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-14">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#002452] transition-colors mb-10"
            >
              <ArrowLeft size={14} />
              Back to your matches
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
            className="mb-12"
          >
            <span className="inline-block bg-[#002452] text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-wide mb-4">
              Get Access
            </span>
            <h1
              className="text-4xl sm:text-5xl text-[#002452] mb-4"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Unlock your matches
            </h1>
            <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
              You&apos;ve already completed your intake. LWYRD has your matches ready, get access to view the full results and connect directly with the right firm for your needs.
            </p>
          </motion.div>

          {/* Two option cards */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.14 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14"
          >
            {/* Individual */}
            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8 flex flex-col">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#002452]/8 border border-[#ddd7cc] mb-6">
                <User size={20} className="text-[#002452]" strokeWidth={1.5} />
              </div>
              <h2
                className="text-[#002452] text-2xl mb-2"
                style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
              >
                Individual Access
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                For founders, executives, and individuals who need legal representation. Get full access to your matched firms and a personal debrief from the LWYRD team.
              </p>
              <div className="space-y-2.5 mb-8 flex-1">
                {individualBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-slate-600 text-sm">{b}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => openModal("Individual Access")}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get in touch
              </button>
            </div>

            {/* Organization */}
            <div className="bg-[#002452] rounded-3xl p-8 flex flex-col">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 border border-white/20 mb-6">
                <Building2 size={20} className="text-white" strokeWidth={1.5} />
              </div>
              <h2
                className="text-white text-2xl mb-2"
                style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
              >
                Organization Access
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                For entrepreneurship institutes, university clubs, accelerators, and incubators. Give your entire community access to LWYRD&apos;s legal matching platform.
              </p>
              <div className="space-y-2.5 mb-8 flex-1">
                {orgBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-white/60 mt-0.5 shrink-0" />
                    <span className="text-white/80 text-sm">{b}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => openModal("Organization Access")}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white text-[#002452] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Partner with us
              </button>
            </div>
          </motion.div>

          {/* Reassurance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.24 }}
            className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8 text-center"
          >
            <p
              className="text-[#002452] text-xl mb-3"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Your intake is already complete
            </p>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xl mx-auto">
              You&apos;ve already told us everything we need to find your match. Once you get access, LWYRD will walk you through your results personally, no need to start over.
            </p>
          </motion.div>
        </main>
        <Footer />
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
