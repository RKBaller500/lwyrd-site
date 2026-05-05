"use client";

import { useState } from "react";
import Modal from "./Modal";
import { submitForm } from "@/lib/formsubmit";
import { Send, CheckCircle2 } from "lucide-react";

interface ContactFirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  firmName: string;
}

export default function ContactFirmModal({ isOpen, onClose, firmName }: ContactFirmModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setName(""); setEmail(""); setMessage(""); setStatus("idle");
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitForm({
        name,
        email,
        message,
        formType: `Contact Firm, ${firmName}`,
        subject: `New inquiry for ${firmName} via LWYRD`,
        _replyto: email,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] focus:ring-2 focus:ring-[#002452]/15 transition-colors text-sm";

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex items-center gap-2 mb-1">
        <Send size={15} className="text-[#002452]" strokeWidth={1.5} />
        <h2
          className="text-2xl text-[#002452]"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          Contact {firmName}
        </h2>
      </div>
      <p className="text-slate-500 text-sm mb-6">
        We&apos;ll share your intake summary with {firmName} so they have full context before you speak. Add anything you&apos;d like them to know.
      </p>

      {status === "success" ? (
        <div className="py-8 text-center">
          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[#002452] font-medium text-sm mb-1">Introduction sent.</p>
          <p className="text-slate-500 text-sm">{firmName} will be in touch with you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoComplete="name"
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
            required
          />
          <textarea
            placeholder={`Anything else you'd like ${firmName} to know (optional)`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className={`${inputClass} resize-none`}
          />
          {status === "error" && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              Something went wrong. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "loading" ? "Sending…" : `Send Introduction to ${firmName}`}
          </button>
        </form>
      )}
    </Modal>
  );
}
