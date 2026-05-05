"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import { ArrowRight, Clock, Lock, FileText, Award } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const lines = [
  { icon: Clock, text: "This intake takes about five minutes." },
  { icon: FileText, text: "There's no legal jargon, just plain questions about your situation." },
  { icon: Lock, text: "Your answers are private and used only to find your matches." },
  { icon: Award, text: "At the end, you'll receive a ranked list of law firms matched to your specific needs." },
];

function OrientationContent() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="max-w-xl w-full bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-10"
        >
          <span className="inline-block bg-[#002452] text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-wide mb-6">
            Before you begin
          </span>

          <h2
            className="text-[#002452] text-3xl mb-8"
            style={{ ...lora, fontWeight: 500 }}
          >
            Here&apos;s what to expect.
          </h2>

          <div className="space-y-5 mb-10">
            {lines.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[#002452]/8 border border-[#ddd7cc] shrink-0 mt-0.5">
                  <Icon size={16} className="text-[#002452]" strokeWidth={1.5} />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed pt-1.5">{text}</p>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.5 }}
            onClick={() => router.push("/intake")}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#002452] text-white px-8 py-4 rounded-2xl text-base font-medium hover:opacity-90 active:opacity-75 transition-opacity"
          >
            Let&apos;s Get Started
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </main>
      <Footer />
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
