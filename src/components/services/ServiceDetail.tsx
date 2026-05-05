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
    <div className="max-w-7xl mx-auto px-6 py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <Link href="/intake" className="hover:text-[#002452] transition-colors">
          Get Matched
        </Link>
        <span>/</span>
        <span className="text-slate-600">{category.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero */}
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-3">
              {category.heroTag}
            </span>
            <h1
              className="text-4xl sm:text-5xl text-[#002452] leading-snug mb-6"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              {category.name}
            </h1>
            <div className="space-y-4">
              {category.fullDescription.split("\n\n").map((para, i) => (
                <p key={i} className="text-slate-600 text-base leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* What firms do */}
          <div
            className="bg-[#002452] p-8"
            style={{ boxShadow: "0 25px 60px -5px rgba(0,0,0,0.45), 0 10px 25px -8px rgba(0,36,82,0.5)" }}
          >
            <h2
              className="text-white text-2xl mb-4"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              What firms in this area do
            </h2>
            <p className="text-white/75 text-sm leading-relaxed">{category.whatFirmsDo}</p>
          </div>

          {/* Service examples */}
          <div>
            <h2
              className="text-[#002452] text-2xl mb-6"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Specific services you might need
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category.serviceExamples.map((example, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-[#fbfaf6] border border-[#ddd7cc] rounded-2xl p-4"
                >
                  <CheckCircle2 size={16} className="text-[#002452] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <span className="text-slate-600 text-sm leading-snug">{example}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: CTAs */}
        <div className="space-y-5">
          {/* Start Intake CTA */}
          <div className="bg-[#002452] rounded-3xl p-8 text-white">
            <h3
              className="text-2xl mb-3"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Find your match
            </h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Answer a short set of questions about your needs and we will match you with the right firm.
            </p>
            <Link
              href="/intake"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white text-[#002452] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Intake
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Book Consultation CTA */}
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8">
            <h3
              className="text-[#002452] text-2xl mb-3"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Book a consultation
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Prefer to speak with the LWYRD team first? We will help you understand your needs and make a personal recommendation.
            </p>
            <button
              onClick={() => setConsultModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-[#002452] text-[#002452] text-sm font-medium hover:bg-[#002452] hover:text-white transition-colors"
            >
              Get in touch
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
