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
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("lwyrd_results");
    const slug = sessionStorage.getItem("lwyrd_category") ?? "";
    const name = sessionStorage.getItem("lwyrd_category_name") ?? "";
    if (!raw) {
      router.push("/intake/start");
      return;
    }
    try {
      const parsed: MatchResult[] = JSON.parse(raw);
      setResults(parsed);
      setCategorySlug(slug);
      setCategoryName(name);
      const scoreMap = Object.fromEntries(parsed.map((r) => [r.firm.id, r.score]));
      sessionStorage.setItem("lwyrd_match_scores", JSON.stringify(scoreMap));
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
            {results.length > 0
              ? `We found ${results.length} ${results.length === 1 ? "firm" : "firms"} that match your needs${categoryName ? ` in ${categoryName}` : ""}.`
              : "No firms matched your criteria, try adjusting your answers."}
          </p>
        </motion.div>

        {results.length === 0 ? (
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
                <MatchCard
                  result={result}
                  rank={i + 1}
                  blurred={false}
                />
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
