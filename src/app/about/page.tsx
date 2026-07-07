"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { Eye, Layers, Zap } from "lucide-react";

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

const values = [
  {
    icon: Eye,
    label: "Clarity over Complexity",
    body: "We speak in plain language. We translate legal nuance into actionable choices so you can make informed decisions.",
  },
  {
    icon: Layers,
    label: "Specialization over Generalization",
    body: "The era of the 'do-it-all' lawyer is over. We believe complex problems require deep expertise, and we only match you with specialists.",
  },
  {
    icon: Zap,
    label: "Frictionless Access",
    body: "Getting legal help shouldn't be as painful as the legal problem itself. We streamline the entire discovery and hiring process.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1C]">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="bg-[#0A0F1C] py-28 md:py-40 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="text-[#C9962B] text-xs font-semibold tracking-widest uppercase mb-6 block"
            >
              Our Mission
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl text-[#E6EAF2] leading-tight mb-7"
              style={{ ...lora, fontWeight: 500 }}
            >
              Access to elite legal{" "}
              <span style={{ color: "#C9962B" }}>shouldn&apos;t be a privilege.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.18 }}
              className="text-[#8A93A6] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
            >
              To democratize access to elite legal representation by removing the friction,
              mystery, and gatekeeping of the traditional legal search.
            </motion.p>
          </div>
        </section>

        {/* ── The Problem ── */}
        <section className="bg-[#0A0F1C] py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#1F2A3D] pt-14 mb-10"
            >
              <p className="text-[#8A93A6] text-xs font-medium tracking-widest uppercase mb-2">
                The Problem
              </p>
              <h2
                className="text-[#E6EAF2] text-3xl sm:text-4xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                The legal industry has a discovery problem.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              className="space-y-6 text-[#8A93A6] text-sm leading-relaxed"
            >
              <p>
                If you&apos;re a massive corporation, you have an entire legal operations department
                dedicated to finding and managing the right specialized counsel for every distinct
                issue.
              </p>
              <p>
                If you&apos;re a startup founder, a small business owner, or an individual, you&apos;re left
                to rely on Google searches, scattered word-of-mouth referrals, and pure luck to find
                a lawyer who actually knows how to handle your specific problem.
              </p>
              <p className="text-[#C8CDD8]">
                LWYRD was built to fix this.
              </p>
              <p>
                We believe that you shouldn&apos;t have to be a lawyer to know how to hire a great one.
                We act as your intelligent guide, diagnosing your needs, filtering out the noise,
                and curating introductions to attorneys who specialize deeply in what you&apos;re facing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="bg-[#0A0F1C] py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#1F2A3D] pt-14 mb-10"
            >
              <p className="text-[#8A93A6] text-xs font-medium tracking-widest uppercase mb-2">
                What We Stand For
              </p>
              <h2
                className="text-[#E6EAF2] text-3xl sm:text-4xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                Our Values
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {values.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.label}
                    variants={item}
                    className="bg-[#141C2E] border border-[#1F2A3D] rounded-3xl p-8"
                  >
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#1F2A3D] border border-[#1F2A3D] mb-5">
                      <Icon size={20} className="text-[#C9962B]" strokeWidth={1.5} />
                    </div>
                    <h3
                      className="text-[#E6EAF2] text-lg mb-3"
                      style={{ ...lora, fontWeight: 500 }}
                    >
                      {card.label}
                    </h3>
                    <p className="text-[#8A93A6] text-sm leading-relaxed">{card.body}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── LWYRD Standard ── */}
        <section className="bg-[#002452] py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="mb-10 max-w-3xl"
            >
              <p className="text-[#C9962B]/80 text-xs font-medium tracking-widest uppercase mb-3">
                Our Standard
              </p>
              <h2
                className="text-white text-3xl sm:text-4xl leading-tight mb-6"
                style={{ ...lora, fontWeight: 500 }}
              >
                The LWYRD Assessment
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Before any firm appears on the platform, it goes through the LWYRD Assessment, a
                rigorous evaluation covering bar standing and disciplinary history, depth of
                experience in core practice areas, client responsiveness commitments, written
                engagement standards, and full fee transparency. A firm&apos;s assessment performance is
                factored into every match it appears in.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {[
                { value: "100%", label: "of firms assessed before listing" },
                { value: "Zero", label: "pay-to-play rankings" },
                { value: "No surprises", label: "written engagement agreements and upfront fee disclosure required" },
              ].map((stat) => (
                <motion.div
                  key={stat.value}
                  variants={item}
                  className="bg-white/8 border border-white/15 rounded-3xl p-6"
                >
                  <p className="text-[#C9962B] text-3xl mb-2" style={{ ...lora, fontWeight: 500 }}>
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-sm leading-snug">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#0A0F1C] py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="max-w-2xl mx-auto bg-[#141C2E] border border-[#1F2A3D] rounded-3xl p-10 text-center"
            >
              <h2
                className="text-[#E6EAF2] text-3xl mb-3"
                style={{ ...lora, fontWeight: 500 }}
              >
                Ready to find the right firm?
              </h2>
              <p className="text-[#8A93A6] text-sm leading-relaxed mb-8">
                Start the intake, about five minutes, no legal jargon, no cost.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="/get-matched" variant="primary" size="lg">
                  Get Matched →
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
