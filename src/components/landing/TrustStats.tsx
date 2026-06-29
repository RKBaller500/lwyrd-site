"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const stats = [
  { value: "$10M+", label: "in fees for partner firms" },
  { value: "$60M+", label: "in tax credits and settlements for SMBs" },
  { value: "200+", label: "clients matched" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function TrustStats() {
  return (
    <section className="bg-[#0A0F1C] py-24 px-6 border-t border-[#1F2A3D]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {stats.map((stat) => (
            <motion.div key={stat.value} variants={item} className="text-center sm:text-left">
              <p className="text-[#C9962B] text-5xl sm:text-6xl font-bold tracking-tight mb-3">
                {stat.value}
              </p>
              <p className="text-[#8A93A6] text-sm leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
