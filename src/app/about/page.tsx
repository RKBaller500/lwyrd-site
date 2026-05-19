"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { Eye, Users, ShieldCheck } from "lucide-react";

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
    title: "We are clear about what we are, and what we are not.",
    body: "LWYRD is not a law firm. We do not provide legal advice. We surface options, explain fit, and let you make the call. Everything we do is designed to give you more information, not to steer you toward an outcome that benefits us.",
    label: "Transparency",
  },
  {
    icon: Users,
    title: "Finding the right lawyer shouldn't require knowing the right people.",
    body: "The intake is jargon-free. The process is transparent. The matches are based on your actual situation. Anyone who needs legal help should be able to start, regardless of whether they've ever hired a lawyer before.",
    label: "Accessibility",
  },
  {
    icon: ShieldCheck,
    title: "Every firm here earned its place.",
    body: "The LWYRD Assessment isn't a checkbox. It's a real evaluation, bar standing, disciplinary history, practice depth, responsiveness, fee transparency. A firm that doesn't pass doesn't appear. That's not a marketing claim. It's the only way matching means anything.",
    label: "Quality",
  },
];

const stats = [
  { value: "100%", label: "of firms assessed before listing" },
  { value: "Zero", label: "pay-to-play rankings" },
  { value: "No surprises", label: "written engagement agreements and upfront fee disclosure required" },
];

const team = [
  { name: "Jai Malhotra", role: "Co-Founder", image: "/Profile Pics/Jai_Profile.jpeg" },
  { name: "Aidan Berkeley", role: "Co-Founder", image: "/Profile Pics/Aidan_Profile.png" },
  { name: "Rahul Kochar", role: "Co-Founder", image: "/Profile Pics/Rahul_Profile.png" },
];

export default function AboutPage() {
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
              Our Story
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl text-[#002452] leading-tight mb-7"
              style={{ ...lora, fontWeight: 500 }}
            >
              Built by people who lived the problem.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.18 }}
              className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
            >
              LWYRD exists because the gap between people who need legal help and lawyers who can provide it isn&apos;t a shortage of either. It&apos;s a matching problem. And it took watching real people fall through that gap, and then falling through it ourselves, to decide to do something about it.
            </motion.p>
          </div>
        </section>

        {/* ── Founding Story ── */}
        <section className="bg-[#f5f4f0] py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#ddd7cc] pt-14 mb-10"
            >
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-2">
                How We Got Here
              </p>
              <h2
                className="text-[#002452] text-3xl sm:text-4xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                The problem kept showing up.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              className="space-y-6 text-slate-500 text-sm leading-relaxed"
            >
              <p>
                A few years ago, we started working closely with small businesses, the kind that anchor a block and employ a neighborhood. What we saw was a pattern that kept repeating: these businesses were owed things. Tax credits, settlement eligibility, legal remedies that existed specifically for businesses like theirs. The resources weren&apos;t the problem. The problem was access. Navigating the legal and financial systems that housed those resources required expertise that most small business owners simply didn&apos;t have and couldn&apos;t afford to acquire.
              </p>
              <p>
                When we got involved in helping connect some of those businesses to what was available to them, something became clear fast: the right access changed everything. A business that had been struggling under a tax burden it didn&apos;t know was disputable suddenly wasn&apos;t. The match between someone who needed legal help and someone qualified to provide it, when it actually happened, worked. What was broken wasn&apos;t the resources or the people. It was the path between them.
              </p>
              <p>
                Then we went to build LWYRD, and we lived it ourselves. Finding the right formation lawyer for our specific situation, the right structure, the right stage experience, the right fit, took an embarrassing amount of time for people who had just spent years helping others navigate this exact problem. We searched, hit dead ends, got referred to the wrong people, and eventually found our way through guesswork and luck. The experience made the problem undeniable. You can&apos;t watch other people struggle to find the right legal help, struggle yourself to find it, and then do anything other than fix it.
              </p>
              <p>
                LWYRD is what we built to fix it. A guided intake that surfaces what you actually need. A vetted network of specialists who have been evaluated, not just listed. And a matching process that connects the two based on fit, not payment, not proximity, not luck.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Our Values ── */}
        <section className="bg-[#f5f4f0] py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#ddd7cc] pt-14 mb-10"
            >
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-2">
                What We Stand For
              </p>
              <h2
                className="text-[#002452] text-3xl sm:text-4xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                Three things we won&apos;t compromise on.
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
                    className="group bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-[#ddd7cc] mb-5 group-hover:bg-[#002452] group-hover:border-[#002452] transition-colors">
                      <Icon
                        size={22}
                        className="text-[#002452] group-hover:text-white transition-colors"
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-2">
                      {card.label}
                    </p>
                    <h3
                      className="text-[#002452] text-lg mb-3"
                      style={{ ...lora, fontWeight: 500 }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{card.body}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── LWYRD Assessment (navy) ── */}
        <section className="bg-[#002452] py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="mb-10 max-w-3xl"
            >
              <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
                Our Standard
              </p>
              <h2
                className="text-white text-3xl sm:text-4xl leading-tight mb-6"
                style={{ ...lora, fontWeight: 500 }}
              >
                The LWYRD Assessment
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Before any firm appears on the platform, it goes through the LWYRD Assessment, a rigorous evaluation covering bar standing and disciplinary history, depth of experience in core practice areas, client responsiveness commitments, written engagement standards, and full fee transparency. A firm&apos;s assessment performance is factored into every match it appears in. This is how LWYRD ensures the firms you see have already been held to a standard, before you ever read a profile.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.value}
                  variants={item}
                  className="bg-white/8 border border-white/15 rounded-3xl p-6"
                >
                  <p
                    className="text-white text-3xl mb-2"
                    style={{ ...lora, fontWeight: 500 }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-sm leading-snug">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="bg-[#f5f4f0] py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#ddd7cc] pt-14 mb-10"
            >
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-2">
                The Team
              </p>
              <h2
                className="text-[#002452] text-3xl sm:text-4xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                The people behind LWYRD.
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-5"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {team.map((member) => (
                <motion.div
                  key={member.name}
                  variants={item}
                  className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8 text-center"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-[#ddd7cc] mx-auto mb-5">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p
                    className="text-[#002452] text-lg mb-1"
                    style={{ ...lora, fontWeight: 500 }}
                  >
                    {member.name}
                  </p>
                  <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">
                    {member.role}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#f5f4f0] py-20 px-6">
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
                Ready to find the right firm?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Start the intake, about five minutes, no legal jargon, no cost.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="/intake/start" variant="primary" size="lg">
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
