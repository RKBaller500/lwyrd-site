"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import "@/styles/lwyrd-ds.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import { ArrowRight, Clock, Lock, FileText, Award } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const lines = [
  { icon: Clock, text: "This intake takes about five minutes." },
  { icon: FileText, text: "There's no legal jargon, just plain questions about your situation." },
  { icon: Lock, text: "Your answers are private and used only to find your matches." },
  { icon: Award, text: "At the end, you'll receive a ranked list of law firms matched to your specific needs." },
];

function OrientationContent() {
  const router = useRouter();

  return (
    <div className="lwyrd-ds ds-page">
      <MarketingNav />
      <main className="ds-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(40px,8vh,80px) var(--pad)" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="ds-card"
          style={{ maxWidth: 560, width: "100%", padding: "clamp(28px,4vw,44px)" }}
        >
          <span className="kicker">Before you begin</span>

          <h2 style={{ fontSize: "clamp(1.6rem,3.4vw,2.1rem)", margin: ".4rem 0 1.8rem" }}>
            Here&apos;s what to expect.
          </h2>

          <div style={{ display: "grid", gap: 18, marginBottom: 32 }}>
            {lines.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.08 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
              >
                <span className="icon-box" style={{ flexShrink: 0, marginTop: 2 }}>
                  <Icon size={16} strokeWidth={1.6} />
                </span>
                <p style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.6, paddingTop: 6 }}>{text}</p>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.5 }}
            onClick={() => router.push("/intake")}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "1em 1.5em", fontSize: "1rem" }}
          >
            Let&apos;s Get Started <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </main>
      <MarketingFooter />
    </div>
  );
}

export default function IntakeStartPage() {
  return (
    <AuthGuard>
      <OrientationContent />
    </AuthGuard>
  );
}
