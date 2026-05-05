"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { submitForm } from "@/lib/formsubmit";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function ContactSection() {
  const [updateEmail, setUpdateEmail] = useState("");
  const [updateStatus, setUpdateStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus("loading");
    try {
      await submitForm({
        email: updateEmail,
        formType: "Stay Updated",
        subject: "New LWYRD Stay Updated Signup",
        _replyto: updateEmail,
      });
      setUpdateStatus("success");
      setUpdateEmail("");
    } catch {
      setUpdateStatus("error");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] focus:ring-2 focus:ring-[#002452]/15 transition-all text-sm";

  return (
    <section
      id="contact"
      className="bg-[#f5f4f0] border-t border-[#ddd7cc] py-16 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl mx-auto bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Mail size={18} className="text-[#002452]" strokeWidth={1.5} />
            <h3
              className="text-[#002452] text-2xl"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Stay Updated
            </h3>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Subscribe to receive product updates, new firm announcements, and legal insights.
          </p>

          {updateStatus === "success" ? (
            <div className="py-6 text-center">
              <p className="text-[#002452] font-medium text-sm">
                You are on the list. We will keep you posted.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="email"
                placeholder="Your email"
                value={updateEmail}
                onChange={(e) => setUpdateEmail(e.target.value)}
                className={inputClass}
                required
              />
              {updateStatus === "error" && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  Something went wrong. Please try again.
                </p>
              )}
              <button
                type="submit"
                disabled={updateStatus === "loading"}
                className="w-full py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateStatus === "loading" ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe
                    <Mail size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
