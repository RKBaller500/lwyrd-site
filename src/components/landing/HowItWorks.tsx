"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ClipboardList, Award, ArrowRight } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Tell us your situation",
    description:
      "Answer a short guided intake, about five minutes. No legal jargon. You tell us who you are, what you need, and what matters most to you. We take it from there.",
  },
  {
    number: "02",
    icon: Search,
    title: "We find your match",
    description:
      "Your answers are matched against our vetted firm network based on practice area, matter specifics, your stage, timeline, and budget. Quality is built in, not bolted on.",
  },
  {
    number: "03",
    icon: Award,
    title: "Connect when you're ready",
    description:
      "You receive a ranked list of matched firms, each with a fit score and a clear explanation of why it's a strong match. You decide who to contact. No one calls you until you make the move.",
  },
];

const stepsContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const stepsItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export default function HowItWorks() {
  return (
    <section className="bg-[#141C2E] py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-16"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-[#8A93A6] mb-4">
            The Process
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#E6EAF2] leading-tight">
            From intake to matched counsel in three steps.
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-[18px] left-0 right-0 h-px bg-[#1F2A3D] z-0" />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8"
            variants={stepsContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.number} variants={stepsItem} className="relative z-10">
                  <div className="inline-block bg-[#141C2E] pr-4 mb-6">
                    <p className="text-[#3B82F6] text-4xl font-bold tracking-tight leading-none">
                      {step.number}
                    </p>
                  </div>

                  <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#1F2A3D] border border-[#2A3850] mb-5">
                    <Icon size={18} className="text-[#8A93A6]" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-[#E6EAF2] text-xl font-semibold mb-2">{step.title}</h3>

                  <p className="text-[#8A93A6] text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease, delay: 0.2 }}
          className="mt-12 flex justify-start"
        >
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-[#8A93A6] text-sm hover:text-[#E6EAF2] transition-colors"
          >
            Learn more about the process
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
