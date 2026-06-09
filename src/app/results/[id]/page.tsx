"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import MatchCard from "@/components/results/MatchCard";
import { runMatchingForSubmission } from "@/lib/actions/intake";
import { MatchResult } from "@/types";

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

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

function PastResultsContent() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;

  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [lockedCount, setLockedCount] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [intakeDate, setIntakeDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) return;

    runMatchingForSubmission(submissionId).then(({ results: r, lockedCount: lc, categorySlug: slug, categoryName: name, intakeDate: date, error }) => {
      if (error || !r) {
        router.push("/dashboard");
        return;
      }

      // Populate sessionStorage so /firms/[id] pages show the correct match score
      sessionStorage.setItem("lwyrd_results", JSON.stringify(r));
      sessionStorage.setItem("lwyrd_category", slug);
      sessionStorage.setItem("lwyrd_category_name", name);
      const scoreMap = Object.fromEntries(r.map((res) => [res.firm.id, res.score]));
      sessionStorage.setItem("lwyrd_match_scores", JSON.stringify(scoreMap));

      setResults(r);
      setLockedCount(lc);
      setCategorySlug(slug);
      setCategoryName(name);
      setIntakeDate(date);
      setLoading(false);
    }).catch(() => router.push("/dashboard"));
  }, [submissionId, router]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14">
          <div className="h-28 rounded-2xl bg-white border border-[#ddd7cc] animate-pulse mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-white border border-[#ddd7cc] animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!results) return null;

  const total = results.length + lockedCount;

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
            <Link href="/dashboard" className="hover:text-[#002452] transition-colors">
              My Dashboard
            </Link>
            <span>/</span>
            <Link href="/dashboard" className="hover:text-[#002452] transition-colors">
              My Matches
            </Link>
            <span>/</span>
            <span className="text-slate-600">{categoryName || "Results"}</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl text-[#002452] mb-3"
            style={{ ...lora, fontWeight: 500 }}
          >
            Your Matches
          </h1>
          <p className="text-slate-500 text-base">
            {total > 0
              ? `${total} ${total === 1 ? "firm" : "firms"} matched${categoryName ? ` for ${categoryName}` : ""}`
              : "No firms matched your criteria."}
            {intakeDate && (
              <span className="text-slate-400">
                {" · "}Intake from{" "}
                {new Date(intakeDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </p>
        </motion.div>

        {total === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.1 }}
            className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-12 text-center"
          >
            <h3 className="text-[#002452] font-medium text-lg mb-3" style={lora}>
              No matches found.
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Try a new intake with adjusted preferences — a different budget range, timeline, or firm
              size may surface more results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/intake/start"
                className="text-[#002452] text-sm font-medium px-5 py-2.5 rounded-2xl bg-[#002452]/8 hover:bg-[#002452]/15 transition-colors"
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
              <motion.div key={result.firm.id} variants={cardItem}>
                <MatchCard result={result} rank={i + 1} />
              </motion.div>
            ))}
            {Array.from({ length: lockedCount }, (_, i) => (
              <motion.div key={`locked-${i}`} variants={cardItem}>
                <LockedCard rank={results.length + i + 1} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {total > 0 && categorySlug && (
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm">
              Looking for something different?{" "}
              <Link href="/intake/start" className="text-[#002452] hover:underline">
                Start a new intake →
              </Link>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function PastResultsPage() {
  return (
    <AuthGuard>
      <PastResultsContent />
    </AuthGuard>
  );
}
