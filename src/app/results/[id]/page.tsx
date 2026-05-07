"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import MatchCard from "@/components/results/MatchCard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { matchFirmsV2 } from "@/lib/matching";
import { mapDbFirmToFirm } from "@/lib/supabase/mappers";
import { MatchResult } from "@/types";
import type { DbFirm } from "@/lib/supabase/types";

const FIRM_SELECT = `
  *,
  attorneys ( * ),
  firm_assessment_items (
    id,
    criterion_id,
    passed,
    note,
    display_order,
    assessment_criteria ( id, label, description, display_order )
  )
`;

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
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;

  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [intakeDate, setIntakeDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !submissionId) return;

    const supabase = createClient();

    async function load() {
      // Fetch submission — user_id equality is the ownership/security gate
      const { data: submission, error: subError } = await supabase
        .from("intake_submissions")
        .select("track, category_slug, category_label, answers, created_at")
        .eq("id", submissionId)
        .eq("user_id", user!.id)
        .single();

      if (subError || !submission) {
        router.push("/dashboard");
        return;
      }

      // Fetch current firm data from DB
      const { data: firmData, error: firmError } = await supabase
        .from("firms")
        .select(FIRM_SELECT)
        .order("overall_score", { ascending: false });

      if (firmError || !firmData || firmData.length === 0) {
        router.push("/dashboard");
        return;
      }

      const allFirms = (firmData as DbFirm[]).map(mapDbFirmToFirm);

      // Re-run matching with the stored answers
      const answers = submission.answers as Record<string, string | string[] | number>;
      const matchResults = matchFirmsV2(
        submission.track,
        submission.category_slug,
        answers,
        allFirms
      );

      // Populate sessionStorage so /firms/[id] pages show the correct match score
      sessionStorage.setItem("lwyrd_results", JSON.stringify(matchResults));
      sessionStorage.setItem("lwyrd_category", submission.category_slug);
      sessionStorage.setItem("lwyrd_category_name", submission.category_label ?? submission.category_slug);
      const scoreMap = Object.fromEntries(matchResults.map((r) => [r.firm.id, r.score]));
      sessionStorage.setItem("lwyrd_match_scores", JSON.stringify(scoreMap));

      setResults(matchResults);
      setCategorySlug(submission.category_slug);
      setCategoryName(submission.category_label ?? submission.category_slug);
      setIntakeDate(submission.created_at);
      setLoading(false);
    }

    load().catch(() => router.push("/dashboard"));
  }, [user, submissionId, router]);

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
            {results.length > 0
              ? `${results.length} ${results.length === 1 ? "firm" : "firms"} matched${categoryName ? ` for ${categoryName}` : ""}`
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

        {results.length === 0 ? (
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
                <MatchCard result={result} rank={i + 1} blurred={false} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {results.length > 0 && categorySlug && (
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
