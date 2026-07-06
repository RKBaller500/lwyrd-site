"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import MatchCard from "@/components/results/MatchCard";
import { runMatchingForSubmission } from "@/lib/actions/intake";
import { MatchResult } from "@/types";

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
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [intakeDate, setIntakeDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) return;

    runMatchingForSubmission(submissionId).then(({ results: r, categorySlug: slug, categoryName: name, intakeDate: date, error }) => {
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
      setCategorySlug(slug);
      setCategoryName(name);
      setIntakeDate(date);
      setLoading(false);
    }).catch(() => router.push("/dashboard"));
  }, [submissionId, router]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0F1C]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14">
          <div className="h-28 rounded-2xl bg-white border border-[#1F2A3D] animate-pulse mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-white border border-[#1F2A3D] animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!results) return null;

  const total = results.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1C]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-sm text-[#8A93A6] mb-4">
            <Link href="/dashboard" className="hover:text-[#E6EAF2] transition-colors">
              My Dashboard
            </Link>
            <span>/</span>
            <Link href="/dashboard" className="hover:text-[#E6EAF2] transition-colors">
              My Matches
            </Link>
            <span>/</span>
            <span className="text-[#C8CDD8]">{categoryName || "Results"}</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl text-[#E6EAF2] mb-3"
            style={{ ...lora, fontWeight: 500 }}
          >
            Your Matches
          </h1>
          <p className="text-[#8A93A6] text-base">
            {total > 0
              ? `${total} ${total === 1 ? "firm" : "firms"} matched${categoryName ? ` for ${categoryName}` : ""}`
              : "No firms matched your criteria."}
            {intakeDate && (
              <span className="text-[#8A93A6]">
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
            className="bg-[#141C2E] border border-[#1F2A3D] rounded-3xl p-12 text-center"
          >
            <h3 className="text-[#E6EAF2] font-medium text-lg mb-3" style={lora}>
              No matches found.
            </h3>
            <p className="text-[#8A93A6] text-sm mb-6">
              Try a new intake with adjusted preferences, a different budget range, timeline, or firm
              size may surface more results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/intake/start"
                className="text-[#E6EAF2] text-sm font-medium px-5 py-2.5 rounded-2xl bg-white/8 hover:bg-[#002452]/15 transition-colors"
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
          </motion.div>
        )}

        {total > 0 && categorySlug && (
          <div className="mt-10 text-center">
            <p className="text-[#8A93A6] text-sm">
              Looking for something different?{" "}
              <Link href="/intake/start" className="text-[#E6EAF2] hover:underline">
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
