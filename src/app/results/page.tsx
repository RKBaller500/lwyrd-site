"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import MatchCard from "@/components/results/MatchCard";
import { MatchResult } from "@/types";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

function LockedCard({ rank }: { rank: number }) {
  return (
    <div className="rounded-3xl shadow-sm border border-[#ddd7cc] border-l-4 border-l-[#ddd7cc] overflow-hidden bg-[#fbfaf6]">
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-slate-400 block mb-3">#{rank}</span>
            <div className="h-6 w-48 bg-[#ddd7cc] rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-[#ddd7cc]/50 rounded animate-pulse" />
          </div>
          <div className="text-right shrink-0">
            <div className="h-10 w-12 bg-[#ddd7cc] rounded-lg animate-pulse mb-1" />
            <div className="h-3 w-16 bg-[#ddd7cc]/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 mb-5">
          <div className="h-3 w-full bg-[#ddd7cc]/50 rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-[#ddd7cc]/50 rounded animate-pulse" />
          <div className="h-3 w-4/6 bg-[#ddd7cc]/50 rounded animate-pulse" />
        </div>
      </div>
      <div className="border-t border-[#ddd7cc] bg-white/60 px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Lock size={14} className="text-slate-400 shrink-0" />
          Full profile and contact details are locked
        </div>
        <Link
          href="/access"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          Get Access
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

function ResultsContent() {
  const router = useRouter();
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [lockedCount, setLockedCount] = useState(0);
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("lwyrd_results");
    const slug = sessionStorage.getItem("lwyrd_category") ?? "";
    const name = sessionStorage.getItem("lwyrd_category_name") ?? "";
    const locked = parseInt(sessionStorage.getItem("lwyrd_locked_count") ?? "0", 10);
    if (!raw) {
      router.push("/intake/start");
      return;
    }
    try {
      const parsed: MatchResult[] = JSON.parse(raw);
      setResults(parsed);
      setLockedCount(isNaN(locked) ? 0 : locked);
      setCategorySlug(slug);
      setCategoryName(name);
      const scoreMap = Object.fromEntries(parsed.map((r) => [r.firm.id, r.score]));
      sessionStorage.setItem("lwyrd_match_scores", JSON.stringify(scoreMap));
      // Clear sensitive intake answers — scores are all the firm detail page needs
      sessionStorage.removeItem("lwyrd_answers_v2");
    } catch {
      router.push("/intake/start");
    }
  }, [router]);

  if (!results) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link href="/dashboard" className="hover:text-[#002452] transition-colors">My Dashboard</Link>
            <span>/</span>
            <span className="text-slate-600">Your Matches</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl text-[#002452] mb-3"
            style={{ ...lora, fontWeight: 500 }}
          >
            Your Matches
          </h1>
          <p className="text-slate-500 text-base">
            {results.length + lockedCount > 0
              ? `We found ${results.length + lockedCount} ${results.length + lockedCount === 1 ? "firm" : "firms"} that match your needs${categoryName ? ` in ${categoryName}` : ""}.`
              : "No firms matched your criteria, try adjusting your answers."}
          </p>
        </motion.div>

        {results.length + lockedCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.1 }}
            className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-12 text-center"
          >
            <h3
              className="text-[#002452] font-medium text-lg mb-3"
              style={lora}
            >
              No matches found.
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Try adjusting your preferences, a different budget range, timeline, or stage may surface more results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/intake/start"
                className="text-[#002452] text-sm font-medium px-5 py-2.5 rounded-2xl bg-[#002452]/8 hover:bg-[#002452]/15 transition-colors"
              >
                Refine my answers →
              </Link>
              <Link
                href="/intake/start"
                className="text-slate-500 text-sm hover:text-[#002452] transition-colors"
              >
                Start a new intake →
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-5"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {results.map((result, i) => (
              <motion.div key={result.firm.id} variants={item}>
                <MatchCard result={result} rank={i + 1} />
              </motion.div>
            ))}
            {Array.from({ length: lockedCount }, (_, i) => (
              <motion.div key={`locked-${i}`} variants={item}>
                <LockedCard rank={results.length + i + 1} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {results.length > 0 && categorySlug && (
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm">
              Didn&apos;t see what you needed?{" "}
              <Link href="/intake/start" className="text-[#002452] hover:underline">
                Refine your answers →
              </Link>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <AuthGuard>
      <ResultsContent />
    </AuthGuard>
  );
}
