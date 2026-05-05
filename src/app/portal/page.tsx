"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Building2 } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

function PortalContent() {
  const { user } = useAuth();
  const firmName = user?.name ?? "Your Firm";

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-14">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={20} className="text-[#002452]" strokeWidth={1.5} />
            <h1
              className="text-4xl sm:text-5xl text-[#002452]"
              style={{ ...lora, fontWeight: 500 }}
            >
              {firmName}
            </h1>
          </div>
          <p className="text-slate-500 text-base mt-2">
            You&apos;re in the LWYRD network. Clients whose intake answers match your firm&apos;s profile will see your listing in their results.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.07 }}
          className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8 mb-6"
        >
          <p className="text-[#002452] text-base mb-5" style={{ ...lora, fontWeight: 500 }}>
            Need to update your firm profile, practice areas, or billing structure?
          </p>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Reach out to the LWYRD team and we&apos;ll make the changes. Your public profile drives the clients who see your firm in match results, so keeping it current matters.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#002452] text-white text-sm font-medium px-5 py-2.5 rounded-2xl hover:opacity-90 transition-opacity"
          >
            Contact the LWYRD Team
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.12 }}
          className="bg-[#002452] rounded-3xl p-8 text-white"
        >
          <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
            Questions?
          </p>
          <p className="text-white/80 text-sm leading-relaxed">
            If you have questions about how matching works, how clients see your profile, or how to interpret incoming introductions, the LWYRD team is available to walk you through it.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default function PortalPage() {
  return (
    <AuthGuard>
      <PortalContent />
    </AuthGuard>
  );
}
