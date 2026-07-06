"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const steps = [
  {
    number: "01",
    title: "The Guided Diagnosis",
    detail: "You don't need to know the legal jargon. Our interactive intake form asks plain-English questions about your situation to pinpoint exactly what legal specialization you require.",
  },
  {
    number: "02",
    title: "The Curated Search",
    detail: "Behind the scenes, our matching engine cross-references your needs against our vetted network of specialized attorneys, filtering for expertise, availability, and budget fit.",
  },
  {
    number: "03",
    title: "The Handshake",
    detail: "We present you with 2-3 perfectly matched options. You review their profiles, past successes, and pricing structures before deciding who you'd like to consult with.",
  },
  {
    number: "04",
    title: "The Ongoing Relationship",
    detail: "Once engaged, you work directly with your chosen firm. LWYRD remains available to ensure the relationship is productive and to assist if additional specializations are needed later.",
  },
];

const cards = [
  {
    title: "No cold calls",
    subtitle: "You control the introduction.",
    body: "LWYRD surfaces your options. You decide who to contact. No firm reaches out to you until you make the first move.",
  },
  {
    title: "No pay-to-play",
    subtitle: "Rankings are based on fit, not payment.",
    body: "A firm cannot buy its way into your results. Every ranking is determined by how well the firm matches your specific intake answers and how it performed on the LWYRD Assessment.",
  },
  {
    title: "Free to match",
    subtitle: "Getting matched costs nothing.",
    body: "The intake is free. The match is free. There is no cost to see your results. If and when you choose to work with a firm, that's between you and them.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1C]">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative bg-[#0A0F1C] py-28 md:py-40 px-6 text-center overflow-hidden">
          <div className="max-w-4xl mx-auto relative">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="text-[#C9962B] text-xs font-semibold tracking-widest uppercase mb-6 block"
            >
              Process
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.08 }}
              className="text-6xl sm:text-7xl lg:text-8xl text-[#E6EAF2] leading-[1.0] mb-7"
              style={{ ...lora, fontWeight: 700 }}
            >
              How <span style={{ color: "#C9962B" }}>LWYRD</span> Works
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.18 }}
              className="text-[#8A93A6] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
            >
              Finding a lawyer shouldn&apos;t feel like a shot in the dark. We&apos;ve replaced the anxiety of the search with a calm, methodical matching process.
            </motion.p>
          </div>
        </section>

        {/* ── Steps ── */}
        <section className="bg-[#0A0F1C] px-6 pb-24">
          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease, delay: index * 0.06 }}
                className="border-t border-[#1F2A3D] py-10 grid grid-cols-[80px_1fr_1fr] md:grid-cols-[100px_1fr_1fr] gap-6 md:gap-10 items-start"
              >
                <span
                  className="text-6xl md:text-7xl leading-none text-white/[0.07] select-none"
                  style={{ ...lora, fontWeight: 700 }}
                >
                  {step.number}
                </span>
                <h2
                  className="text-[#E6EAF2] text-xl sm:text-2xl md:text-3xl leading-snug"
                  style={{ ...lora, fontWeight: 700 }}
                >
                  {step.title}
                </h2>
                <p className="text-[#8A93A6] text-sm leading-relaxed">
                  {step.detail}
                </p>
              </motion.div>
            ))}
            <div className="border-t border-[#1F2A3D]" />
          </div>
        </section>

        {/* ── Why LWYRD? ── */}
        <section className="bg-[#0A0F1C] py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#1F2A3D] pt-14 mb-10"
            >
              <p className="text-[#8A93A6] text-xs font-medium tracking-widest uppercase mb-2">
                Why LWYRD?
              </p>
              <h2
                className="text-[#E6EAF2] text-3xl sm:text-4xl max-w-xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                Three things that make this different.
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {cards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={item}
                  className="bg-[#141C2E] border border-[#1F2A3D] rounded-3xl shadow-sm p-8"
                >
                  <h3
                    className="text-[#E6EAF2] text-xl mb-1"
                    style={{ ...lora, fontWeight: 500 }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-[#8A93A6] text-xs italic mb-3">{card.subtitle}</p>
                  <p className="text-[#8A93A6] text-sm leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#0A0F1C] pb-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="max-w-2xl mx-auto bg-[#141C2E] border border-[#1F2A3D] rounded-3xl shadow-sm p-10 text-center"
            >
              <h2
                className="text-[#E6EAF2] text-3xl mb-3"
                style={{ ...lora, fontWeight: 500 }}
              >
                Ready to get started?
              </h2>
              <p className="text-[#8A93A6] text-sm leading-relaxed mb-8">
                The intake takes about five minutes. There&apos;s no cost to get matched.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="/intake/start" variant="primary" size="lg">
                  Get Matched
                  <ArrowRight size={15} className="ml-1" />
                </Button>
                <Button href="/contact" variant="outline" size="lg">
                  Contact Us
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
