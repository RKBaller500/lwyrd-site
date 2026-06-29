"use client";

import { motion } from "framer-motion";
import { ClipboardList, Search, Award, CheckCircle2, ArrowRight } from "lucide-react";
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
    icon: ClipboardList,
    title: "The Guided Diagnosis",
    summary: "You don't need to know the legal jargon.",
    detail:
      "Our interactive intake asks plain-English questions about your situation to pinpoint exactly what legal specialization you require. You tell us who you are, what you're facing, your timeline, and your budget. The whole thing takes about five minutes.",
    bullets: [
      "Three tracks: Startups, Small Businesses, Individuals",
      "Plain language, no legal training needed",
      "Your answers are private and never shared without your knowledge",
    ],
  },
  {
    number: "02",
    icon: Search,
    title: "The Precision Match",
    summary: "Your answers drive the match, not a generic algorithm.",
    detail:
      "LWYRD scores every vetted firm against your specific answers. Practice area alignment, matter type, your stage, budget range, firm size preference, and timeline all factor in. So does each firm's LWYRD Assessment score. The result is a curated shortlist of firms that are genuinely suited to what you described.",
    bullets: [
      "Matched on your specific answers, not generic criteria",
      "Assessment performance factors into every result",
      "No firm can pay its way to the top",
    ],
  },
  {
    number: "03",
    icon: Award,
    title: "The Introduction",
    summary: "You're in control of every next step.",
    detail:
      "You receive a ranked list of firms, each with a fit score and the specific reasons it's a strong match for your situation. Review, save, and compare at your own pace. When you're ready, you reach out. No firm contacts you until you make the first move.",
    bullets: [
      "Ranked matches with fit scores and match reasons",
      "Full firm profiles with Assessment results visible",
      "Save and compare before deciding",
    ],
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
        <section className="bg-[#0A0F1C] py-8 px-6 pb-20">
          <div className="max-w-5xl mx-auto space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.65, ease, delay: index * 0.07 }}
                  className="border-t border-[#1F2A3D] pt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className="text-5xl leading-none text-white/5"
                        style={{ ...lora, fontWeight: 600 }}
                      >
                        {step.number}
                      </span>
                      <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/8 border border-[#1F2A3D]">
                        <Icon size={20} className="text-[#E6EAF2]" strokeWidth={1.5} />
                      </div>
                    </div>

                    <h2
                      className="text-[#E6EAF2] text-3xl sm:text-4xl mb-3"
                      style={{ ...lora, fontWeight: 700 }}
                    >
                      {step.title}
                    </h2>
                    <p className="text-[#8A93A6] text-sm font-medium mb-4">{step.summary}</p>
                    <p className="text-[#8A93A6] text-sm leading-relaxed">{step.detail}</p>
                  </div>

                  <div className="bg-[#141C2E] border border-[#1F2A3D] rounded-3xl shadow-sm p-7">
                    <p className="text-[#8A93A6] text-xs font-medium tracking-widest uppercase mb-4">
                      What to expect
                    </p>
                    <ul className="space-y-3">
                      {step.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <CheckCircle2
                            size={15}
                            className="text-emerald-500 shrink-0 mt-0.5"
                            strokeWidth={2}
                          />
                          <span className="text-[#C8CDD8] text-sm leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
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
