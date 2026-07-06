"use client";

import "@/styles/lwyrd-ds.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import MatchCard from "@/components/results/MatchCard";
import { MatchResult } from "@/types";
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

function getSizeGapNotice(
  results: MatchResult[],
  firmSizePref: string | null,
  categoryName: string,
): string | null {
  if (!firmSizePref || firmSizePref === "no_preference") return null;
  const availableSizes = new Set(results.map((r) => r.firm.size));
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
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");
  const [firmSizePref, setFirmSizePref] = useState<string | null>(null);

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

      // Read firm size preference before clearing answers
      const rawAnswers = sessionStorage.getItem("lwyrd_answers_v2");
      if (rawAnswers) {
        const a = JSON.parse(rawAnswers) as Record<string, unknown>;
        const pref = (a.sf1 ?? a.if1 ?? a.bf1) as string | undefined;
        setFirmSizePref(pref ?? null);
      }

      // Clear sensitive intake answers, scores are all the firm detail page needs
      sessionStorage.removeItem("lwyrd_answers_v2");
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
      <main className="ds-main mx-auto w-full" style={{ maxWidth: 880, padding: "clamp(28px,5vw,56px) var(--pad)" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-10"
        >
          <nav className="ds-breadcrumb mb-4">
            <Link href="/dashboard">My dashboard</Link>
            <span className="sep">/</span>
            <span style={{ color: "var(--ink-2)" }}>Your matches</span>
          </nav>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", marginBottom: ".75rem" }}>Your matches</h1>
          <p className="text-[#6B6B70] text-base">
            {results.length > 0
              ? `We found ${results.length} ${results.length === 1 ? "firm" : "firms"} that match your needs${categoryName ? ` in ${categoryName}` : ""}.`
              : "No firms matched your criteria, try adjusting your answers."}
          </p>
        </motion.div>

        {/* Size gap notice */}
        {sizeGapNotice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
            className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-6"
            style={{ background: "var(--navy-tint)", border: "1px solid var(--navy-tint-2)" }}
          >
            <Info size={16} style={{ color: "var(--navy)", marginTop: 2, flexShrink: 0 }} strokeWidth={2} />
            <p className="text-sm text-[#2A2A2E] leading-relaxed">{sizeGapNotice}</p>
          </motion.div>
        )}

        {results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.1 }}
            className="ds-card text-center"
            style={{ padding: "3rem" }}
          >
            <h3 style={{ fontSize: "1.25rem", marginBottom: ".75rem" }}>No matches found.</h3>
            <p className="text-[#6B6B70] text-sm mb-6">
              Try adjusting your preferences, a different budget range, timeline, or stage may surface more results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/intake/start" className="btn btn-primary">Refine my answers</Link>
              <Link href="/intake/start" className="text-[#6B6B70] text-sm hover:text-[#0B0B0C] transition-colors">
                Start a new intake →
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div className="space-y-5" variants={container} initial="hidden" animate="visible">
            {displayResults.map((result, i) => (
              <motion.div key={result.firm.id} variants={item}>
                <MatchCard result={result} rank={i + 1} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {results.length > 0 && categorySlug && (
          <div className="mt-10 text-center">
            <p className="text-[#6B6B70] text-sm">
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
