"use client";

import "@/styles/lwyrd-ds.css";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, MessageSquare, Sparkles, Send, CalendarClock } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { submitForm } from "@/lib/formsubmit";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Update to your real scheduling link when ready.
const BOOK_A_CALL_URL = "/contact";

const benefits = [
  {
    icon: ShieldCheck,
    title: "A vetted path.",
    body: "Members are matched to the right lawyer through a structured intake, not left to search on their own.",
  },
  {
    icon: MessageSquare,
    title: "A consultation first.",
    body: "A chance to talk the situation through before committing, so members move forward with confidence.",
  },
  {
    icon: Sparkles,
    title: "Special access.",
    body: "A real benefit of belonging to your community, with nothing for your team to build or run.",
  },
];

export default function ForOrganizationsPage() {
  const [form, setForm] = useState({
    orgName: "",
    contactName: "",
    email: "",
    communityType: "",
    about: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitForm({
        ...form,
        formType: "Organization Partnership Inquiry",
        _subject: `New Partnership Inquiry: ${form.orgName}`,
        _replyto: form.email,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="lwyrd-ds ds-page orgs-page">
      <MarketingNav />
      <main className="ds-main">
        {/* ── Hero ── */}
        <section className="orgs-beat orgs-hero">
          <div className="ds-shell orgs-wrap">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="orgs-hero-inner"
            >
              <span className="marketing-eyebrow">For partner organizations</span>
              <h1>Give your community a trusted way to find legal help.</h1>
              <p className="orgs-lede">
                Your members run into legal questions constantly, and most have nowhere good to
                turn. A LWYRD partnership gives them a vetted path to the right lawyer, and a
                consultation to talk it through first, with special access as a benefit of
                belonging to your community. A real resource for them, and nothing for your team
                to build or run.
              </p>
              <div className="orgs-hero-cta">
                <a href="#connect" className="btn btn-primary">
                  Explore a partnership <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>

            <motion.div
              className="orgs-benefits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.15 }}
            >
              {benefits.map((b) => (
                <div key={b.title} className="orgs-benefit">
                  <span className="icon-box">
                    <b.icon size={19} strokeWidth={1.7} />
                  </span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.body}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Start a conversation (form + call) ── */}
        <section id="connect" className="orgs-beat orgs-connect">
          <div className="ds-shell orgs-wrap orgs-connect-wrap">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.6, ease }}
              className="orgs-connect-head"
            >
              <span className="marketing-eyebrow">Get in touch</span>
              <h2>Let&apos;s talk about your community.</h2>
              <p>
                Tell us a little about your organization and we&apos;ll follow up to explore what a
                partnership could look like.
              </p>
            </motion.div>

            <div className="orgs-connect-grid">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.6, ease, delay: 0.05 }}
                className="form-panel"
              >
                {status === "success" ? (
                  <div className="orgs-success">
                    <span className="icon-box">
                      <CheckCircle2 size={22} strokeWidth={1.7} />
                    </span>
                    <h3>Thanks — we&apos;ve got it.</h3>
                    <p>Someone from the LWYRD team will follow up within two business days.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="field-grid">
                      <div className="field">
                        <label htmlFor="orgName">Organization name *</label>
                        <input
                          id="orgName"
                          name="orgName"
                          type="text"
                          placeholder="Your organization's name"
                          value={form.orgName}
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
                        placeholder="you@organization.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="communityType">Type of community *</label>
                      <select
                        id="communityType"
                        name="communityType"
                        value={form.communityType}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select one
                        </option>
                        <option value="University or student community">
                          University or student community
                        </option>
                        <option value="Founder or small-business network">
                          Founder or small-business network
                        </option>
                        <option value="Company or platform">Company or platform</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="about">Tell us about your community *</label>
                      <textarea
                        id="about"
                        name="about"
                        placeholder="Briefly, who your members are and the kinds of legal help they tend to need"
                        value={form.about}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {status === "error" && (
                      <p className="orgs-form-error">
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

              <motion.aside
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.6, ease, delay: 0.1 }}
                className="orgs-call"
              >
                <span className="icon-box">
                  <CalendarClock size={20} strokeWidth={1.7} />
                </span>
                <h3>Prefer to talk first?</h3>
                <p>Book a call and we&apos;ll walk through what a partnership could look like for your community.</p>
                <Link href={BOOK_A_CALL_URL} className="btn btn-outline">
                  Book a call <ArrowRight size={15} />
                </Link>
              </motion.aside>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .orgs-page{background:#fff}
        .orgs-beat{padding:var(--sec) 0}
        .orgs-hero{padding-top:clamp(76px,10vw,124px);padding-bottom:clamp(56px,7vw,88px)}
        .orgs-wrap{max-width:var(--maxw);padding-top:0;padding-bottom:0}
        .orgs-hero-inner{max-width:880px}
        .orgs-hero-inner h1{font-size:clamp(2.25rem,5vw,4rem);line-height:1.05;margin:.75rem 0 0;max-width:18ch}
        .orgs-lede{color:var(--muted);font-size:1.06rem;line-height:1.62;margin-top:1.35rem;max-width:64ch}
        .orgs-hero-cta{margin-top:2rem}
        .orgs-benefits{display:grid;grid-template-columns:1fr;gap:16px;margin-top:clamp(44px,6vw,68px)}
        .orgs-benefit{
          display:flex;
          align-items:flex-start;
          gap:15px;
          border:1px solid var(--line);
          border-radius:var(--r);
          background:#fff;
          box-shadow:var(--shadow-sm);
          padding:clamp(20px,2.6vw,26px);
        }
        .orgs-benefit .icon-box{flex-shrink:0}
        .orgs-benefit h3{font-size:1.05rem;line-height:1.25;margin-bottom:6px}
        .orgs-benefit p{color:var(--muted);font-size:.92rem;line-height:1.55}
        .orgs-connect{background:var(--paper-alt);border-top:1px solid var(--line)}
        .orgs-connect-head{max-width:640px;margin-bottom:clamp(28px,4vw,44px)}
        .orgs-connect-head h2{margin-top:.55rem;max-width:18ch}
        .orgs-connect-head p{color:var(--muted);font-size:1rem;line-height:1.62;margin-top:1rem;max-width:56ch}
        .orgs-connect-grid{display:grid;grid-template-columns:1fr;gap:clamp(20px,3vw,28px);align-items:start}
        .orgs-form-error{color:#b42318;font-size:.85rem;line-height:1.45}
        .form-actions .btn{min-width:150px;justify-content:center}
        .orgs-call{
          border:1px solid var(--line);
          border-radius:18px;
          background:#fff;
          box-shadow:var(--shadow-sm);
          padding:clamp(24px,3vw,32px);
        }
        .orgs-call .icon-box{margin-bottom:16px}
        .orgs-call h3{font-size:1.2rem;line-height:1.25;margin-bottom:8px}
        .orgs-call p{color:var(--muted);font-size:.92rem;line-height:1.58;margin-bottom:20px}
        .orgs-call .btn{justify-content:center}
        .orgs-success{text-align:center;padding:clamp(20px,4vw,36px) 8px}
        .orgs-success .icon-box{width:52px;height:52px;border-radius:14px;margin:0 auto 16px}
        .orgs-success h3{font-size:1.45rem;margin-bottom:8px}
        .orgs-success p{color:var(--muted);font-size:.95rem;line-height:1.6;max-width:44ch;margin:0 auto}
        @media(min-width:760px){
          .orgs-benefits{grid-template-columns:repeat(3,1fr)}
          .orgs-connect-grid{grid-template-columns:1.5fr 1fr;gap:clamp(28px,3.5vw,44px)}
        }
        @media(max-width:640px){
          .orgs-beat{padding:64px 0}
          .orgs-hero{padding-top:54px}
          .orgs-hero-inner h1{font-size:clamp(2rem,11vw,2.8rem)}
          .form-actions .btn{width:100%}
        }
      `}</style>
    </div>
  );
}
