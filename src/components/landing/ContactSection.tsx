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
        _subject: "New LWYRD Stay Updated Signup",
        _replyto: updateEmail,
      });
      setUpdateStatus("success");
      setUpdateEmail("");
    } catch {
      setUpdateStatus("error");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-[#1F2A3D] bg-[#141C2E] text-[#E6EAF2] placeholder-[#8A93A6] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 transition-all text-sm";

  return (
    <section
      id="contact"
      className="bg-[#0A0F1C] border-t border-[#1F2A3D] py-16 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl mx-auto bg-[#141C2E] border border-[#1F2A3D] rounded-3xl shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Mail size={18} className="text-[#E6EAF2]" strokeWidth={1.5} />
            <h3
              className="text-[#E6EAF2] text-2xl"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
            >
              Stay Updated
            </h3>
          </div>
          <p className="text-[#8A93A6] text-sm mb-6">
            Subscribe to receive product updates, new firm announcements, and legal insights.
          </p>

          {updateStatus === "success" ? (
            <div className="py-6 text-center">
              <p className="text-[#E6EAF2] font-medium text-sm">
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
