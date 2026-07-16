"use client";

import "@/styles/lwyrd-ds.css";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ClipboardCheck, Target, Handshake, Send } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { submitForm } from "@/lib/formsubmit";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease } },
};

const values = [
  {
    icon: ClipboardCheck,
    title: "Qualified before the introduction.",
    body: "Our intake captures matter type, budget, timeline, and jurisdiction up front, so you never spend intake time on a client you were never going to take.",
  },
  {
    icon: Target,
    title: "Matched to your actual practice.",
    body: "You receive clients whose needs line up with what you specialize in, not whoever happened to search your practice area.",
  },
  {
    icon: Handshake,
    title: "You control the first move.",
    body: "No client is handed your details until the match is made and they choose to reach out. No cold outreach on your end.",
  },
];

const dimensions = [
  { label: "Practice-area depth", note: "Demonstrated experience in the areas you take on." },
  { label: "Bar standing", note: "Active licensure and a clean disciplinary record." },
  { label: "Responsiveness", note: "A commitment to reaching clients promptly." },
  { label: "Fee transparency", note: "Clear, upfront terms before any engagement." },
  { label: "Engagement standards", note: "Written agreements and defined client processes." },
];

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitForm({
        ...form,
        formType: "Law Firm Application",
        _subject: `New Firm Application: ${form.firmName}`,
        _replyto: form.email,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="lwyrd-ds ds-page firms-page">
      <MarketingNav current="law-firms" />
      <main className="ds-main">
        {/* ── Hero ── */}
        <section className="firms-beat firms-hero">
          <div className="ds-shell firms-wrap">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="firms-hero-inner"
            >
              <span className="marketing-eyebrow">For law firms</span>
              <h1>Clients matched to your practice, before they ever reach you.</h1>
              <p className="firms-lede">
                LWYRD routes people to firms through a structured intake that qualifies every
                match on practice area, matter, budget, and jurisdiction. By the time a client
                reaches you, the fit is already there.
              </p>
              <div className="firms-hero-cta">
                <a href="#apply" className="btn btn-primary">
                  Apply to join <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Value: matched clients, not cold leads ── */}
        <section className="firms-beat firms-value">
          <div className="ds-shell firms-wrap">
            <div className="firms-head">
              <span className="marketing-eyebrow">Why firms join</span>
              <h2>Every client who reaches you already fits.</h2>
            </div>

            <motion.div
              className="firms-value-grid"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-70px" }}
            >
              {values.map((v) => (
                <motion.div key={v.title} variants={item} className="firms-value-card">
                  <span className="icon-box">
                    <v.icon size={20} strokeWidth={1.7} />
                  </span>
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Earned placement: the LWYRD Assessment ── */}
        <section className="firms-beat firms-assessment">
          <div className="ds-shell firms-wrap">
            <div className="firms-assessment-grid">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.6, ease }}
                className="firms-assessment-copy"
              >
                <span className="marketing-eyebrow">How firms join</span>
                <h2>Firms earn their place in the network. They don&apos;t buy it.</h2>
                <p>
                  Before a firm joins, it goes through the LWYRD Assessment, a review of the
                  things that actually predict a good client experience. It is designed to be
                  completed in a single call plus independent verification.
                </p>
                <p className="firms-assessment-close">
                  Firms that pass carry the Assessment as a verified credential. Firms that
                  don&apos;t, don&apos;t appear.
                </p>
              </motion.div>

              <motion.ul
                className="firms-dimensions"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-70px" }}
              >
                {dimensions.map((d) => (
                  <motion.li key={d.label} variants={item} className="firms-dimension">
                    <CheckCircle2 size={17} strokeWidth={1.8} />
                    <div>
                      <span className="firms-dimension-label">{d.label}</span>
                      <span className="firms-dimension-note">{d.note}</span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </section>

        {/* ── Apply (the form) ── */}
        <section id="apply" className="firms-beat firms-apply">
          <div className="ds-shell firms-wrap firms-apply-wrap">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.6, ease }}
              className="firms-apply-head"
            >
              <span className="marketing-eyebrow">Join the network</span>
              <h2>Start the conversation.</h2>
              <p>
                We evaluate each firm individually. If your firm is a fit for the LWYRD
                network, we&apos;ll walk you through the Assessment and get your profile built.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              className="form-panel"
            >
              {status === "success" ? (
                <div className="firms-success">
                  <span className="icon-box">
                    <CheckCircle2 size={22} strokeWidth={1.7} />
                  </span>
                  <h3>Application received.</h3>
                  <p>Someone from the LWYRD team will be in touch within two business days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="firmName">Firm name *</label>
                      <input
                        id="firmName"
                        name="firmName"
                        type="text"
                        placeholder="Your firm's full name"
                        value={form.firmName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="contactName">Primary contact name *</label>
                      <input
                        id="contactName"
                        name="contactName"
                        type="text"
                        placeholder="Your name"
                        value={form.contactName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="email">Email address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@firm.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="practiceAreas">Primary practice areas *</label>
                    <input
                      id="practiceAreas"
                      name="practiceAreas"
                      type="text"
                      placeholder="e.g., Corporate, IP, Employment"
                      value={form.practiceAreas}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="states">States where you&apos;re licensed *</label>
                    <input
                      id="states"
                      name="states"
                      type="text"
                      placeholder="e.g., NY, CA, TX"
                      value={form.states}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="why">Why LWYRD? *</label>
                    <textarea
                      id="why"
                      name="why"
                      placeholder="Tell us briefly why your firm is a strong fit for the network"
                      value={form.why}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {status === "error" && (
                    <p className="firms-form-error">
                      Something went wrong. Please try again or email rahul@lwyrd.co.
                    </p>
                  )}

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? "Submitting…" : "Submit"}
                      {status !== "loading" && <Send size={14} />}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .firms-page{background:#fff}
        .firms-beat{padding:var(--sec) 0}
        .firms-hero{padding-top:clamp(76px,10vw,124px);padding-bottom:clamp(56px,7vw,88px)}
        .firms-wrap{max-width:var(--maxw);padding-top:0;padding-bottom:0}
        .firms-hero-inner{max-width:880px}
        .firms-hero-inner h1{font-size:clamp(2.25rem,5vw,4rem);line-height:1.05;margin:.75rem 0 0;max-width:20ch}
        .firms-lede{color:var(--muted);font-size:1.06rem;line-height:1.62;margin-top:1.35rem;max-width:60ch}
        .firms-hero-cta{margin-top:2rem}
        .firms-value{background:var(--paper-alt);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
        .firms-head{max-width:820px;margin-bottom:clamp(34px,5vw,56px)}
        .firms-head h2{margin-top:.55rem;max-width:20ch}
        .firms-value-grid{display:grid;grid-template-columns:1fr;gap:16px}
        .firms-value-card{
          border:1px solid var(--line);
          border-radius:var(--r);
          background:#fff;
          box-shadow:var(--shadow-sm);
          padding:clamp(22px,3vw,30px);
        }
        .firms-value-card .icon-box{margin-bottom:18px}
        .firms-value-card h3{font-size:1.18rem;line-height:1.25;margin-bottom:10px}
        .firms-value-card p{color:var(--muted);font-size:.95rem;line-height:1.6}
        .firms-assessment-grid{display:grid;grid-template-columns:1fr;gap:clamp(32px,5vw,64px);align-items:start}
        .firms-assessment-copy h2{margin-top:.55rem;max-width:16ch}
        .firms-assessment-copy p{color:var(--muted);font-size:1rem;line-height:1.62;margin-top:1.15rem;max-width:52ch}
        .firms-assessment-close{color:var(--ink-2)!important;font-weight:500}
        .firms-dimensions{list-style:none;display:grid;gap:10px}
        .firms-dimension{
          display:flex;
          align-items:flex-start;
          gap:13px;
          border:1px solid var(--line);
          border-radius:var(--r);
          background:#fff;
          box-shadow:var(--shadow-sm);
          padding:16px 18px;
        }
        .firms-dimension svg{color:var(--navy);flex-shrink:0;margin-top:2px}
        .firms-dimension-label{display:block;color:var(--ink);font-size:.98rem;font-weight:600;line-height:1.3}
        .firms-dimension-note{display:block;color:var(--muted);font-size:.86rem;line-height:1.45;margin-top:2px}
        .firms-apply{background:var(--paper-alt);border-top:1px solid var(--line)}
        .firms-apply-wrap{max-width:680px}
        .firms-apply-head{margin-bottom:clamp(24px,3vw,32px)}
        .firms-apply-head h2{margin-top:.55rem;font-size:clamp(1.9rem,3.6vw,2.75rem)}
        .firms-apply-head p{color:var(--muted);font-size:1rem;line-height:1.62;margin-top:1rem;max-width:56ch}
        .firms-form-error{color:#b42318;font-size:.85rem;line-height:1.45}
        .form-actions .btn{min-width:150px;justify-content:center}
        .firms-success{text-align:center;padding:clamp(20px,4vw,36px) 8px}
        .firms-success .icon-box{width:52px;height:52px;border-radius:14px;margin:0 auto 16px}
        .firms-success h3{font-size:1.45rem;margin-bottom:8px}
        .firms-success p{color:var(--muted);font-size:.95rem;line-height:1.6;max-width:44ch;margin:0 auto}
        @media(min-width:760px){
          .firms-value-grid{grid-template-columns:repeat(3,1fr)}
          .firms-assessment-grid{grid-template-columns:1fr 1fr;gap:clamp(40px,5vw,80px)}
        }
        @media(max-width:640px){
          .firms-beat{padding:64px 0}
          .firms-hero{padding-top:54px}
          .firms-hero-inner h1{font-size:clamp(1.9rem,8.5vw,2.6rem);line-height:1.1}
          .form-actions .btn{width:100%}
        }
      `}</style>
    </div>
  );
}
