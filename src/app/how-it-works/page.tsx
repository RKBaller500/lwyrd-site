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
    title: "Tell us your situation",
    summary: "Start the guided intake, no legal background required.",
    detail:
      "LWYRD's intake begins by asking who you are, a startup, a small business, or an individual, and what area of law you need help with. From there, you answer a focused set of questions about your specific situation: your stage, matter type, budget, timeline, and the kind of firm relationship you're looking for. The whole intake takes about five minutes.",
    bullets: [
      "Three tracks: Startups, Small Businesses, Individuals",
      "Plain language, no legal training needed",
      "Your answers are private and never shared without your knowledge",
    ],
  },
  {
    number: "02",
    icon: Search,
    title: "We find your match",
    summary: "Your answers drive the match, not a generic algorithm.",
    detail:
      "Once you submit, LWYRD scores every vetted firm against your specific answers. Practice area alignment, matter specifics, your stage, budget range, firm size preference, and timeline all factor in. So does the firm's LWYRD Assessment score. The result isn't a ranked directory, it's a list of firms that are specifically suited to what you described.",
    bullets: [
      "Matched on your specific answers, not generic criteria",
      "Assessment performance factors into every result",
      "No firm can pay its way to the top",
    ],
  },
  {
    number: "03",
    icon: Award,
    title: "Connect when you're ready",
    summary: "You're in control of the introduction.",
    detail:
      "After matching, you receive a ranked list of firms, each with a fit score and the specific reasons it's a strong match for your situation. You review, save, and compare at your own pace. When you're ready, you reach out. No firm contacts you until you make the first move.",
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
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative bg-[#f5f4f0] py-28 md:py-40 px-6 text-center overflow-hidden">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
            className="absolute -top-10 -right-8 text-[28rem] leading-none text-[#002452] pointer-events-none select-none"
            style={{ ...lora, fontWeight: 600 }}
            aria-hidden="true"
          >
            L
          </motion.span>

          <div className="max-w-4xl mx-auto relative">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="inline-block bg-[#002452] text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-wide mb-6"
            >
              The Process
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl text-[#002452] leading-tight mb-7"
              style={{ ...lora, fontWeight: 500 }}
            >
              From your legal situation to the right specialist.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.18 }}
              className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
            >
              A clear, guided path, no cold calls, no pay-to-play rankings, no guesswork. Here&apos;s exactly how LWYRD works.
            </motion.p>
          </div>
        </section>

        {/* ── Steps ── */}
        <section className="bg-[#f5f4f0] py-8 px-6 pb-20">
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
                  className="border-t border-[#ddd7cc] pt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className="text-5xl leading-none text-[#002452]/15"
                        style={{ ...lora, fontWeight: 600 }}
                      >
                        {step.number}
                      </span>
                      <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#002452]/8 border border-[#ddd7cc]">
                        <Icon size={20} className="text-[#002452]" strokeWidth={1.5} />
                      </div>
                    </div>

                    <h2
                      className="text-[#002452] text-2xl sm:text-3xl mb-3"
                      style={{ ...lora, fontWeight: 500 }}
                    >
                      {step.title}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mb-4">{step.summary}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.detail}</p>
                  </div>

                  <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-7">
                    <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-4">
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
                          <span className="text-slate-600 text-sm leading-snug">{b}</span>
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
        <section className="bg-[#f5f4f0] py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#ddd7cc] pt-14 mb-10"
            >
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-2">
                Why LWYRD?
              </p>
              <h2
                className="text-[#002452] text-3xl sm:text-4xl max-w-xl"
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
                  className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-8"
                >
                  <h3
                    className="text-[#002452] text-xl mb-1"
                    style={{ ...lora, fontWeight: 500 }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-xs italic mb-3">{card.subtitle}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#f5f4f0] pb-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="max-w-2xl mx-auto bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-10 text-center"
            >
              <h2
                className="text-[#002452] text-3xl mb-3"
                style={{ ...lora, fontWeight: 500 }}
              >
                Ready to get started?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
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
