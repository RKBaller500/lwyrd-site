"use client";

import { useState } from "react";
import Link from "next/link";
import LwyrdLogo from "@/components/ui/LwyrdLogo";
import { submitForm } from "@/lib/formsubmit";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitForm({
        email,
        formType: "Newsletter",
        subject: "New LWYRD Newsletter Signup",
        _replyto: email,
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-[#002452]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          {/* Brand + tagline + newsletter */}
          <div className="sm:col-span-1">
            <LwyrdLogo variant="white" className="h-6 w-auto mb-4" />
            <p
              className="text-white/50 text-sm leading-relaxed mb-6"
              style={{ fontFamily: '"Lora", Georgia, serif' }}
            >
              Connecting people with the right legal help.
            </p>

            {/* Newsletter */}
            <p className="text-white/30 text-xs font-medium tracking-widest uppercase mb-3">
              Stay in the loop
            </p>
            {status === "success" ? (
              <p className="text-white/60 text-xs">You&apos;re on the list.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none focus:border-white/40 transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-3 py-2 rounded-xl bg-white text-[#002452] text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                >
                  {status === "loading" ? "…" : "Subscribe"}
                </button>
              </form>
            )}
          </div>

          {/* Platform */}
          <div>
            <p className="text-white/30 text-xs font-medium tracking-widest uppercase mb-4">
              Platform
            </p>
            <nav className="flex flex-col gap-3">
              <Link href="/intake/start" className="text-white/60 text-sm hover:text-white transition-colors">
                Get Matched
              </Link>
              <Link href="/how-it-works" className="text-white/60 text-sm hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="/for-law-firms" className="text-white/60 text-sm hover:text-white transition-colors">
                For Law Firms
              </Link>
              <Link href="/faq" className="text-white/60 text-sm hover:text-white transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <p className="text-white/30 text-xs font-medium tracking-widest uppercase mb-4">
              Company
            </p>
            <nav className="flex flex-col gap-3">
              <Link href="/about" className="text-white/60 text-sm hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-white/60 text-sm hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link href="/privacy" className="text-white/60 text-sm hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/60 text-sm hover:text-white transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p
            className="text-white/30 text-xs text-center"
            style={{ fontFamily: '"Lora", Georgia, serif' }}
          >
            © {new Date().getFullYear()} LWYRD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
