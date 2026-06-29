"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Rocket, Briefcase, User, ArrowRight } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const tracks = [
  {
    icon: Rocket,
    label: "Startups",
    tagline: "Built for every stage of the founding journey.",
    description:
      "Early-stage companies face a specific kind of legal complexity: formation, IP, fundraising, employment, and contracts that generalist firms often underestimate and large firms often overcharge for. LWYRD connects founders with specialists who have done this before, at your stage, in your industry.",
    examples: ["Entity formation", "Fundraising & SAFEs", "IP assignment", "Equity & cap tables"],
  },
  {
    icon: Briefcase,
    label: "SMBs",
    tagline: "Attorneys that understand the complexity you face every day.",
    description:
      "Running a business means navigating contracts, compliance, employment, disputes, and more, often without a dedicated legal team. LWYRD matches small business owners with experienced attorneys who understand what's actually at stake.",
    examples: ["Contracts & vendors", "Employment compliance", "Business disputes", "Regulatory matters"],
  },
  {
    icon: User,
    label: "Individuals",
    tagline: "A specialist for your situation.",
    description:
      "Whether it's a divorce, an immigration matter, a wrongful termination, or a home purchase gone sideways, personal legal situations require someone who has handled yours before. LWYRD helps individuals find that person without the guesswork.",
    examples: ["Family & divorce", "Immigration", "Employment disputes", "Personal injury"],
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export default function CategoryPreview() {
  return (
    <section className="bg-[#0A0F1C] py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-14"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-[#8A93A6] mb-4">
            Who We Serve
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#E6EAF2] max-w-2xl">
            Legal help built around who you are and what you actually need.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {tracks.map(({ icon: Icon, label, tagline, description, examples }) => (
            <motion.div key={label} variants={item}>
              <div className="bg-[#141C2E] border border-[#1F2A3D] rounded-3xl p-7 h-full flex flex-col hover:border-[#2A3850] transition-colors">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 shrink-0 mb-5">
                  <Icon size={18} className="text-[#3B82F6]" strokeWidth={1.5} />
                </div>

                <h3 className="text-[#E6EAF2] text-lg font-semibold mb-1">{label}</h3>
                <p className="text-[#8A93A6] text-xs mb-4">{tagline}</p>

                <p className="text-[#8A93A6] text-sm leading-relaxed mb-6">{description}</p>

                <div className="flex flex-wrap gap-2 mt-auto mb-6">
                  {examples.map((ex) => (
                    <span
                      key={ex}
                      className="text-xs text-[#8A93A6] bg-[#1F2A3D] border border-[#1F2A3D] rounded-full px-3 py-1"
                    >
                      {ex}
                    </span>
                  ))}
                </div>

                <Link
                  href="/intake/start"
                  className="inline-flex items-center gap-1.5 text-sm text-[#3B82F6] font-medium hover:text-[#60A5FA] transition-colors"
                >
                  Get matched
                  <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
