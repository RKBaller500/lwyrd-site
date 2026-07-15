"use client";

import "@/styles/lwyrd-ds.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import MatchCard from "@/components/results/MatchCard";
import FreeUntilBanner from "@/components/results/FreeUntilBanner";
import { PublicMatchResult } from "@/types";
import Link from "next/link";
import { Info } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

function isLockedResult(result: PublicMatchResult): result is Extract<PublicMatchResult, { isLocked: true }> {
  return "isLocked" in result && result.isLocked;
}

function isUnlockedResult(result: PublicMatchResult): result is Exclude<PublicMatchResult, { isLocked: true }> {
  return !isLockedResult(result);
}

function getSizeGapNotice(
  results: PublicMatchResult[],
  firmSizePref: string | null,
  categoryName: string,
): string | null {
  if (!firmSizePref || firmSizePref === "no_preference") return null;
  const availableSizes = new Set(results.map((r) => (isLockedResult(r) ? r.firmSize : r.firm.size)));
  const practice = categoryName || "this practice area";

  if (firmSizePref === "solo") {
    return `Our network doesn't currently include solo practitioners for ${practice}. Here are the best alternatives we found.`;
  }
  if (firmSizePref === "large" && !availableSizes.has("large")) {
    return `Our network doesn't currently have large firms for ${practice}. Here are our top matches instead.`;
  }
  // Mid-size counts as boutique since the intake has no mid-size option
  if (firmSizePref === "boutique" && !availableSizes.has("boutique") && !availableSizes.has("mid-size")) {
    return `Our network doesn't currently have boutique firms for ${practice}. Here are our top matches instead.`;
  }
  return null;
}

function ResultsContent() {
  const router = useRouter();
  const [results, setResults] = useState<PublicMatchResult[] | null>(null);
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");
  const [firmSizePref, setFirmSizePref] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("lwyrd_results");
    const slug = sessionStorage.getItem("lwyrd_category") ?? "";
    const name = sessionStorage.getItem("lwyrd_category_name") ?? "";
    const storedSubmissionId = sessionStorage.getItem("lwyrd_submission_id") ?? "";
    if (!raw) {
      router.push("/intake/start");
      return;
    }
    try {
      const parsed: PublicMatchResult[] = JSON.parse(raw);
      const unlockedResults = parsed.filter(isUnlockedResult);
      const scoreMap = Object.fromEntries(unlockedResults.map((r) => [r.firm.id, r.score]));
      if (unlockedResults.length) {
        sessionStorage.setItem("lwyrd_match_scores", JSON.stringify(scoreMap));
      } else {
        sessionStorage.removeItem("lwyrd_match_scores");
      }

      // Read firm size preference before clearing answers
      const rawAnswers = sessionStorage.getItem("lwyrd_answers_v2");
      if (rawAnswers) {
        const a = JSON.parse(rawAnswers) as Record<string, unknown>;
        const pref = (a.sf1 ?? a.if1 ?? a.bf1) as string | undefined;
        window.setTimeout(() => setFirmSizePref(pref ?? null), 0);
      }

      // Clear sensitive intake answers, scores are all the firm detail page needs
      sessionStorage.removeItem("lwyrd_answers_v2");
      window.setTimeout(() => {
        setResults(parsed);
        setCategorySlug(slug);
        setCategoryName(name);
        setSubmissionId(storedSubmissionId);
      }, 0);
    } catch {
      router.push("/intake/start");
    }
  }, [router]);

  if (!results) return null;

  const sizeGapNotice = getSizeGapNotice(results, firmSizePref, categoryName);

  // When the size gap banner is showing, suppress the per-card "firm-size" miss
  // so the banner does the communicating rather than every card showing an X.
  const displayResults = sizeGapNotice
    ? results.map((r) => ({
        ...r,
        missedCriteria: r.missedCriteria.filter((c) => c !== "firm-size"),
      }))
    : results;

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
            {results.length} {results.length === 1 ? "firm" : "firms"} matched to your situation
          </h1>
          <p>
            {results.length > 0
              ? `Ranked by fit${categoryName ? ` for ${categoryName}` : ""}.`
              : "No firms matched your criteria, try adjusting your answers."}
          </p>
        </motion.div>

        <FreeUntilBanner />

        {/* Size gap notice */}
        {sizeGapNotice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
            className="results-notice"
          >
            <Info size={16} strokeWidth={2} />
            <p>{sizeGapNotice}</p>
          </motion.div>
        )}

        {results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.1 }}
            className="ds-card results-empty"
          >
            <h3>No matches found.</h3>
            <p>
              Try adjusting your preferences, a different budget range, timeline, or stage may surface more results.
            </p>
            <div className="results-empty-actions">
              <Link href="/intake/start" className="btn btn-primary">Refine my answers</Link>
              <Link href="/intake/start" className="app-link">
                Start a new intake →
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div className="results-list" variants={container} initial="hidden" animate="visible">
            {displayResults.map((result, i) => (
              <motion.div key={isLockedResult(result) ? `locked-${i}` : result.firm.id} variants={item}>
                <MatchCard result={result} rank={i + 1} intakeId={submissionId || undefined} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {results.length > 0 && categorySlug && (
          <div className="results-footnote">
            <p>
              Didn&apos;t see what you needed?{" "}
              <Link href="/intake/start" style={{ color: "var(--navy)", fontWeight: 600 }}>
                Refine your answers →
              </Link>
            </p>
          </div>
        )}
      </main>
      <MarketingFooter />
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
