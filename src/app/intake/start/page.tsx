"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import "@/styles/lwyrd-ds.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import { ArrowRight, Clock, FileText, Lock, Sparkles } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const lines = [
  {
    icon: Clock,
    title: "About five minutes",
    text: "No legal jargon, just plain questions about your situation.",
  },
  {
    icon: Sparkles,
    title: "Your answers do double duty",
    text: "We use them to build your matches, then draft a clear matter summary and ready-to-send outreach message for the firms you choose.",
  },
  {
    icon: Lock,
    title: "Private by default",
    text: "Your answers are private and used only for your matches.",
  },
  {
    icon: FileText,
    title: "A sharper result",
    text: "The more precisely you answer, the better your matches and summary will be. There are no wrong answers, and you can move at your own pace.",
  },
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
          className="intake-orientation ds-card"
        >
          <span className="kicker">Before you begin</span>

          <h1>A few things to know.</h1>

          <div className="intake-orientation-list">
            {lines.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.08 }}
                className="intake-orientation-item"
              >
                <span className="icon-box">
                  <Icon size={16} strokeWidth={1.6} />
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="intake-orientation-result">
            When you&apos;re done, we&apos;ll show you the firms matched to your situation,
            ranked, with the reasons each one fits.
          </p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.5 }}
            onClick={() => router.push("/intake")}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Begin intake <ArrowRight size={16} />
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
