"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, HelpCircle, MessageSquare, Building2, MoreHorizontal } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { submitForm } from "@/lib/formsubmit";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const reasons = [
  { icon: HelpCircle, label: "I have a question about how matching works" },
  { icon: MessageSquare, label: "I want to speak with the LWYRD team before starting intake" },
  { icon: Building2, label: "I represent a law firm and want to learn about joining the network" },
  { icon: MoreHorizontal, label: "Something else entirely" },
];

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] focus:ring-2 focus:ring-[#002452]/15 transition-all text-sm";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitForm({
        name,
        email,
        organization,
        topic: subject,
        message,
        formType: "Contact",
        subject: `LWYRD Contact: ${subject || "General Inquiry"}`,
        _replyto: email,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-12"
        >
          <span className="inline-block bg-[#002452] text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-wide mb-4">
            Contact Us
          </span>
          <h1
            className="text-4xl sm:text-5xl text-[#002452] mb-4"
            style={{ ...lora, fontWeight: 500 }}
          >
            Get in Touch
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-xl">
            Whether you have a question, want to learn more, or are ready to get started, the LWYRD team responds within one to two business days.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.08 }}
            className="lg:col-span-3"
          >
            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-8">
              {status === "success" ? (
                <div className="py-14 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 mb-5">
                    <CheckCircle2 size={26} className="text-emerald-500" strokeWidth={1.5} />
                  </div>
                  <h2
                    className="text-[#002452] text-2xl mb-3"
                    style={{ ...lora, fontWeight: 500 }}
                  >
                    Message received.
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                    Someone from the LWYRD team will be in touch within one to two business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                        Full name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                        Email address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="jane@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      Organization or company
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Corp (optional)"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`${inputClass} appearance-none cursor-pointer`}
                      required
                    >
                      <option value="" disabled>Select a topic</option>
                      <option value="How LWYRD Works">Question about how LWYRD works</option>
                      <option value="Get Matched">Get matched, I need help finding a firm</option>
                      <option value="Law Firm Inquiry">Law firm inquiry</option>
                      <option value="Media or Press">Media or press</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      placeholder="Tell us a bit about your situation or what you need help with..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className={`${inputClass} resize-none`}
                      required
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      Something went wrong. Please try again or email us directly at rahul@lwyrd.co
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.16 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-7">
              <p
                className="text-[#002452] text-lg mb-5"
                style={{ ...lora, fontWeight: 500 }}
              >
                Common reasons to reach out
              </p>
              <div className="space-y-4">
                {reasons.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#002452]/8 border border-[#ddd7cc] shrink-0 mt-0.5">
                      <Icon size={14} className="text-[#002452]" strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-500 text-sm leading-snug">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#002452] rounded-3xl p-7">
              <p
                className="text-white text-lg mb-2"
                style={{ ...lora, fontWeight: 500 }}
              >
                We respond within one to two business days
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                Every message goes directly to the LWYRD team. You will hear from a real person.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
