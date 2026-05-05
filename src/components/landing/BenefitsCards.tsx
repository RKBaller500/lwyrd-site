"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const benefits = [
  {
    number: "01",
    title: "Matched to the specialist your situation calls for",
    body: "Most legal directories rank by proximity or payment. LWYRD ranks by fit. Your intake answers surface the practice area, stage, budget, and matter type that define your match. The firms you see are the ones best positioned to handle exactly what you're dealing with, not the ones who paid to appear.",
  },
  {
    number: "02",
    title: "Clarity on your situation before the first conversation",
    body: "The intake process isn't just about matching you, it's about helping you understand what kind of help you actually need. Most people arrive at a law firm not knowing what to ask. LWYRD clients arrive knowing their legal category, their priorities, and what to look for in the attorney they choose.",
  },
  {
    number: "03",
    title: "Your specific situation, not a generic form",
    body: "The more precisely LWYRD understands your situation, the more precisely it can match you. Our intake is designed to surface the details that actually determine fit, matter type, urgency, budget structure, firm preference, stage, so the match you receive reflects your situation, not a category.",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
};

export default function BenefitsCards() {
  return (
    <section className="bg-[#f5f4f0] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="border-t border-[#ddd7cc] pt-14 mb-14"
        >
          <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-3">
            Our Approach
          </p>
          <h2
            className="text-[#002452] text-3xl sm:text-4xl leading-tight max-w-xl"
            style={{ ...lora, fontWeight: 500 }}
          >
            A match built around your matter. Not the other way around.
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {benefits.map((b, i) => (
            <motion.div
              key={b.number}
              variants={item}
              className={`flex gap-8 md:gap-16 py-8 ${i < benefits.length - 1 ? "border-b border-[#ddd7cc]" : ""}`}
            >
              <p
                className="text-[#002452]/20 text-4xl leading-none shrink-0 w-10 pt-1"
                style={lora}
              >
                {b.number}
              </p>
              <div className="flex-1 md:flex md:gap-16 md:items-start">
                <h3
                  className="text-[#002452] text-xl mb-3 md:mb-0 md:w-72 shrink-0"
                  style={{ ...lora, fontWeight: 500 }}
                >
                  {b.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{b.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
