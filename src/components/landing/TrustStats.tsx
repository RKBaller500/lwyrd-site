"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const stats = [
  { value: "$10M+", label: "in fees connected to law firms" },
  { value: "$60M+", label: "in tax credits and settlements unlocked" },
  { value: "200+", label: "clients matched" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function TrustStats() {
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
          <h2
            className="text-[#002452] text-3xl sm:text-4xl"
            style={{ ...lora, fontWeight: 500 }}
          >
            Trust through Social Proof
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-10"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {stats.map((stat) => (
            <motion.div key={stat.value} variants={item}>
              <p
                className="text-[#002452] text-5xl sm:text-6xl mb-3"
                style={{ ...lora, fontWeight: 500 }}
              >
                {stat.value}
              </p>
              <p className="text-slate-400 text-sm leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
