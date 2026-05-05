"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Send, CheckCircle2, ArrowRight } from "lucide-react";
import { submitForm } from "@/lib/formsubmit";

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

const howDifferentCols = [
  {
    title: "Clients qualify themselves before they reach you.",
    body: "Every client who finds your firm through LWYRD has completed a structured intake covering their track (startup, small business, or individual), their legal category, matter specifics, timeline, budget, and firm type preference. By the time your firm appears in their results, you already know more about their situation than most first calls reveal.",
    label: "Intake before introduction",
  },
  {
    title: "You only appear when your practice area, jurisdiction, and parameters align.",
    body: "LWYRD's matching algorithm compares a client's intake answers against your firm's profile, practice areas, operating states, billing structure, firm size. If the match isn't strong, your firm doesn't appear. This means the clients who see you are the clients whose needs you can actually meet.",
    label: "Matched on fit, not proximity",
  },
  {
    title: "Getting listed on LWYRD costs nothing to start.",
    body: "There is no listing fee. There is no pay-to-appear model. Firms are evaluated through the LWYRD Assessment and, once listed, appear in results based entirely on match quality. The relationship between LWYRD and its firm partners is built around the quality of matches, not the size of a payment.",
    label: "No upfront cost",
  },
];

const objections = [
  {
    q: "\"We get matched with clients who can't afford us.\"",
    a: "LWYRD captures budget range and billing preference during intake, before a client ever sees your firm's name. If a client's budget doesn't align with your billing structure, your firm doesn't appear in their match. You set your billing parameters in your firm profile. The intake filters accordingly.",
  },
  {
    q: "\"We end up with matters outside our practice area or jurisdiction.\"",
    a: "Your firm profile specifies the practice areas you cover and the states you're licensed in. The matching algorithm only surfaces your firm when a client's practice area and state requirements align with your profile. If a client needs a California employment attorney and your firm doesn't cover California, they won't see you.",
  },
  {
    q: "\"We don't know what we're getting before the first call.\"",
    a: "When a client contacts your firm through LWYRD, you receive a summary of their intake, their track, legal category, matter specifics, timeline, budget, and what they told us they're looking for. The first call starts from a foundation of context, not from a blank intake that duplicates what the client already completed.",
  },
];

const firmFaqs = [
  {
    q: "What does the LWYRD Assessment evaluate?",
    a: "The Assessment covers bar standing and disciplinary history, years of experience in core practice areas, professional liability insurance, verified client references, written engagement agreements, conflicts of interest procedures, a dedicated client point of contact, a 48-hour response commitment, upfront fee disclosure, itemized billing, and secure document handling. Full assessment results are visible on your public firm profile.",
  },
  {
    q: "Is there a cost to be listed on LWYRD?",
    a: "No. There is no listing fee and no pay-to-appear model. Firms are listed based on their Assessment results and appear in match results based entirely on fit.",
  },
  {
    q: "What happens after a client matches with my firm?",
    a: "When a client unlocks their results and your firm appears, they see your full profile and assessment results. If they choose to contact you, LWYRD facilitates the introduction, sharing their intake summary so you have context before the first conversation. After that, the engagement is entirely between your firm and the client.",
  },
];

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] focus:ring-2 focus:ring-[#002452]/15 transition-all text-sm";

export default function ForLawFirmsPage() {
  const [form, setForm] = useState({
    firmName: "",
    contactName: "",
    email: "",
    practiceAreas: "",
    states: "",
    why: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitForm({
        ...form,
        formType: "Law Firm Application",
        subject: `New Firm Application: ${form.firmName}`,
        _replyto: form.email,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative bg-[#f5f4f0] py-28 md:py-40 px-6 overflow-hidden">
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
              For Law Firms
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl text-[#002452] leading-tight mb-7"
              style={{ ...lora, fontWeight: 500 }}
            >
              The clients who find you through LWYRD already know what they need.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.18 }}
              className="text-slate-500 text-lg leading-relaxed max-w-2xl mb-10"
            >
              Most legal referrals arrive with vague situations, unclear budgets, and no idea whether your practice area actually matches their matter. LWYRD clients arrive differently. Before they ever see your firm&apos;s name, they&apos;ve answered a structured intake covering their legal issue, matter specifics, timeline, budget, and the type of firm relationship they&apos;re looking for. The match happened before the introduction.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease, delay: 0.25 }}
            >
              <a
                href="#apply"
                className="inline-flex items-center justify-center gap-2 bg-[#002452] text-white px-8 py-4 rounded-2xl text-base font-medium hover:opacity-90 active:opacity-75 transition-opacity"
              >
                Join the Network
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── The Problem with Referrals ── */}
        <section className="bg-[#002452] py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
            >
              <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
                The Problem
              </p>
              <h2
                className="text-white text-3xl sm:text-4xl leading-tight mb-8"
                style={{ ...lora, fontWeight: 500 }}
              >
                Referrals are guesses. Most of them are bad ones.
              </h2>
              <div className="space-y-5 text-white/70 text-sm leading-relaxed">
                <p>
                  A referral from a friend or colleague is a name, not a match. It tells you nothing about whether the client&apos;s matter fits your practice area, whether their budget aligns with your billing structure, or whether they&apos;re in a jurisdiction you serve. You spend the first conversation figuring out whether there&apos;s even a fit, and often there isn&apos;t.
                </p>
                <p>
                  Directories are worse. Pay-to-appear models put your firm next to every other firm in your zip code, regardless of specialty. The clients who find you through a directory listing didn&apos;t find you because you were right for their matter. They found you because you were close, or because you paid more than the firm below you.
                </p>
                <p className="text-white/90">
                  LWYRD is built on the premise that a good referral only happens after a real intake. Not a name. Not a listing. A match.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── How LWYRD Is Different ── */}
        <section className="bg-[#f5f4f0] py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#ddd7cc] pt-14 mb-12"
            >
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-2">
                How It Works for Firms
              </p>
              <h2
                className="text-[#002452] text-3xl sm:text-4xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                Your firm appears when the match is real.
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {howDifferentCols.map((col) => (
                <motion.div
                  key={col.label}
                  variants={item}
                  className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-7"
                >
                  <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-3">
                    {col.label}
                  </p>
                  <h3
                    className="text-[#002452] text-lg mb-3"
                    style={{ ...lora, fontWeight: 500 }}
                  >
                    {col.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{col.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Objections Addressed ── */}
        <section className="bg-[#f5f4f0] py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#ddd7cc] pt-14 mb-12"
            >
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-2">
                Common Questions
              </p>
              <h2
                className="text-[#002452] text-3xl sm:text-4xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                We&apos;ve heard the concerns. Here&apos;s how LWYRD addresses them.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              className="space-y-5"
            >
              {objections.map((obj, i) => (
                <div
                  key={i}
                  className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-7"
                >
                  <h3
                    className="text-[#002452] text-lg mb-3"
                    style={{ ...lora, fontWeight: 500 }}
                  >
                    {obj.q}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{obj.a}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Application Form ── */}
        <section id="apply" className="bg-[#002452] py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="mb-10"
            >
              <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
                Join the Network
              </p>
              <h2
                className="text-white text-3xl sm:text-4xl leading-tight mb-4"
                style={{ ...lora, fontWeight: 500 }}
              >
                Start the conversation.
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                We evaluate each firm individually. If your firm is a fit for the LWYRD network, we&apos;ll walk you through the Assessment process and get your profile built. There&apos;s no cost to apply.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              className="bg-[#fbfaf6] border border-white/15 rounded-3xl p-8"
            >
              {status === "success" ? (
                <div className="py-10 text-center">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-4" strokeWidth={1.5} />
                  <h3
                    className="text-[#002452] text-2xl mb-2"
                    style={{ ...lora, fontWeight: 500 }}
                  >
                    Application received.
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Someone from the LWYRD team will be in touch within two business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                        Firm name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="firmName"
                        placeholder="Your firm's full name"
                        value={form.firmName}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                        Primary contact name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        placeholder="Your name"
                        value={form.contactName}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      Email address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@firm.com"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      Primary practice areas <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="practiceAreas"
                      placeholder="e.g., Corporate, IP, Employment"
                      value={form.practiceAreas}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      States where you&apos;re licensed <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="states"
                      placeholder="e.g., NY, CA, TX"
                      value={form.states}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      Why LWYRD? <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="why"
                      placeholder="Tell us briefly why your firm is a strong fit for the network"
                      value={form.why}
                      onChange={handleChange}
                      rows={4}
                      className={`${inputClass} resize-none`}
                      required
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      "Submitting…"
                    ) : (
                      <>
                        Submit
                        <Send size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Brief FAQ ── */}
        <section className="bg-[#f5f4f0] py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="border-t border-[#ddd7cc] pt-14 mb-10"
            >
              <h2
                className="text-[#002452] text-2xl sm:text-3xl"
                style={{ ...lora, fontWeight: 500 }}
              >
                A few quick answers
              </h2>
            </motion.div>

            <div className="space-y-5">
              {firmFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease, delay: i * 0.06 }}
                  className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left hover:bg-[#002452]/3 transition-colors"
                  >
                    <span
                      className="text-[#002452] text-base"
                      style={{ ...lora, fontWeight: 500 }}
                    >
                      {faq.q}
                    </span>
                    <span className="text-slate-400 shrink-0 text-lg">
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-7 pb-5">
                      <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <p className="text-slate-400 text-sm mt-8">
              More questions?{" "}
              <Link href="/faq" className="text-[#002452] font-medium hover:underline">
                See the full FAQ →
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
