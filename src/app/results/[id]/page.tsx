"use client";

import "@/styles/lwyrd-ds.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import MatchCard from "@/components/results/MatchCard";
import FreeUntilBanner from "@/components/results/FreeUntilBanner";
import { runMatchingForSubmission } from "@/lib/actions/intake";
import { PublicMatchResult } from "@/types";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

function isLockedResult(result: PublicMatchResult): result is Extract<PublicMatchResult, { isLocked: true }> {
  return "isLocked" in result && result.isLocked;
}

function isUnlockedResult(result: PublicMatchResult): result is Exclude<PublicMatchResult, { isLocked: true }> {
  return !isLockedResult(result);
}

function PastResultsContent() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;

  const [results, setResults] = useState<PublicMatchResult[] | null>(null);
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
      sessionStorage.setItem("lwyrd_submission_id", submissionId);
      const unlockedResults = r.filter(isUnlockedResult);
      const scoreMap = Object.fromEntries(unlockedResults.map((res) => [res.firm.id, res.score]));
      if (unlockedResults.length) {
        sessionStorage.setItem("lwyrd_match_scores", JSON.stringify(scoreMap));
      } else {
        sessionStorage.removeItem("lwyrd_match_scores");
      }

      window.setTimeout(() => {
        setResults(r);
        setCategorySlug(slug);
        setCategoryName(name);
        setIntakeDate(date);
        setLoading(false);
      }, 0);
    }).catch(() => router.push("/dashboard"));
  }, [submissionId, router]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="lwyrd-ds ds-page">
        <MarketingNav />
        <main className="results-shell ds-main">
          <div className="app-skel" style={{ height: 132, marginBottom: 24 }} />
          <div style={{ display: "grid", gap: 18 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="app-skel" style={{ height: 220 }} />
            ))}
          </div>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  if (!results) return null;

  const total = results.length;

  return (
    <div className="lwyrd-ds ds-page">
      <MarketingNav />
      <main className="results-shell ds-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="results-hero"
        >
          <nav className="ds-breadcrumb mb-4">
            <Link href="/dashboard">My dashboard</Link>
            <span className="sep">/</span>
            <span style={{ color: "var(--ink-2)" }}>Your matches</span>
          </nav>

          <h1>
            {total > 0
              ? `${total} ${total === 1 ? "firm" : "firms"} matched to your situation`
              : "No firms matched your criteria."}
          </h1>
          <p>
            {total > 0
              ? `Ranked by fit${categoryName ? ` for ${categoryName}` : ""}.`
              : "Try adjusting your answers to surface more firms."}
            {intakeDate
              ? ` Intake from ${new Date(intakeDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}.`
              : ""}
          </p>
        </motion.div>

        <FreeUntilBanner />

        {total === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.1 }}
            className="ds-card results-empty"
          >
            <h3>No matches found.</h3>
            <p>
              Try a new intake with adjusted preferences, a different budget range, timeline, or firm
              size may surface more results.
            </p>
            <div className="results-empty-actions">
              <Link href="/intake/start" className="btn btn-primary">Start a new intake</Link>
            </div>
          </motion.div>
        ) : (
          <motion.div className="results-list" variants={container} initial="hidden" animate="visible">
            {results.map((result, i) => (
              <motion.div key={isLockedResult(result) ? `locked-${i}` : result.firm.id} variants={cardItem}>
                <MatchCard result={result} rank={i + 1} intakeId={submissionId} categoryLabel={categoryName} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {total > 0 && categorySlug && (
          <div className="results-footnote">
            <p>
              Looking for something different?{" "}
              <Link href="/intake/start" style={{ color: "var(--navy)", fontWeight: 600 }}>
                Start a new intake →
              </Link>
            </p>
          </div>
        )}
      </main>
      <MarketingFooter />
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
