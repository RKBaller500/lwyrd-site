"use client";

import Link from "next/link";
import { Firm, PublicMatchResult } from "@/types";
import { Award, CheckCircle2, ArrowRight, LockKeyhole, ShieldCheck, AlertCircle } from "lucide-react";
import SaveFirmButton from "@/components/firms/SaveFirmButton";

const serif = { fontFamily: '"Libre Baskerville", Georgia, serif' } as const;
const pricingLanguage = /\b(budget|billing|fee|fees|cost|costs|price|pricing|retainer|hourly|flat[- ]?fee|\$)\b/i;

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size",
  large: "Large",
};

function formatPractice(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// Same "quality signals" logic as the old locked/pre-paywall card (qualitySignals
// in lib/actions/intake.ts) — duplicated here as a pure client-side function since
// that file is server-only. Unlocked cards have the real firm, so this reads real
// data instead of the generic version the locked card had to use.
function computeQualitySignals(firm: Firm, categoryLabel?: string): string[] {
  const signals: string[] = [];
  if (firm.verified) signals.push("Bar standing verified");
  if (firm.founded) {
    const years = Math.max(1, new Date().getFullYear() - firm.founded);
    if (years >= 5) signals.push(`${years}+ years in practice`);
  }
  if (categoryLabel) signals.push(`Specialist in ${categoryLabel}`);
  if (firm.assessment.some((item) => item.passed && /response|contact|conflict|insurance/i.test(`${item.label} ${item.note ?? ""}`))) {
    signals.push("Quality standards reviewed");
  }
  return signals.slice(0, 3);
}

function visibleReasons(reasons: string[]) {
  return reasons.filter((reason) => !pricingLanguage.test(reason));
}

function ScoreRing({ score }: { score: number }) {
  const size = 86;
  const radius = 34;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="match-score-ring">
      <div className="match-score-ring-graphic" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7E7E3" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#002B55" strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.85s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s" }}
          />
        </svg>
        <div className="match-score-ring-value">
          <div>
            <span style={serif}>
              {score}
            </span>
            <small>%</small>
          </div>
        </div>
      </div>
      <span>Match score</span>
    </div>
  );
}

interface MatchCardProps {
  result: PublicMatchResult;
  rank: number;
  initialSaved?: boolean;
  intakeId?: string | null;
  categoryLabel?: string;
}

function isLockedResult(result: PublicMatchResult): result is Extract<PublicMatchResult, { isLocked: true }> {
  return "isLocked" in result && result.isLocked;
}

function LockedIdentity({ rank, isBestMatch }: { rank: number; isBestMatch?: boolean }) {
  return (
    <div className="locked-identity">
      <div className="locked-logo" aria-hidden="true">
        <div />
        <span>
          {rank}
        </span>
      </div>
      <div>
        <div className="locked-badges">
          {isBestMatch && (
            <span className="match-badge is-primary">
              <Award size={9} strokeWidth={2.5} />
              Top match
            </span>
          )}
          <span className="match-badge">
            <LockKeyhole size={10} strokeWidth={2} />
            Identity hidden
          </span>
        </div>
        <div className="locked-name" />
        <p>A matched firm is here.</p>
      </div>
    </div>
  );
}

function LockedMatchCard({
  result,
  rank,
}: {
  result: Extract<PublicMatchResult, { isLocked: true }>;
  rank: number;
}) {
  const roundedScore = Math.round(result.score);
  const size = sizeLabels[result.firmSize] ?? result.firmSize;
  const isTop = rank === 1;
  const reasons = visibleReasons(result.reasons).length > 0
    ? visibleReasons(result.reasons)
    : ["Matches the legal need described in your intake", "Aligned with your stated preferences"];

  return (
    <div className={`match-card locked-match-card ${isTop ? "is-top" : ""}`}>
      <div className="match-card-inner">
        <div className="match-card-head">
          <LockedIdentity rank={rank} isBestMatch={result.isBestMatch || isTop} />
          <div className="locked-score">
            <div>
              <span style={serif}>
                {roundedScore}
              </span>
              <small>%</small>
            </div>
            <em>Fit score</em>
          </div>
        </div>

        <div className="match-chip-row">
          <span className="chip">{size} firm</span>
          <span className="chip">{result.practiceAreaMatch}</span>
          <span className="chip">{result.jurisdiction}</span>
          {result.feeLevel && <span className="chip">{result.feeLevel}</span>}
        </div>

        <div className="locked-proof-grid">
          <div>
            <p className="match-section-label">Why this fits</p>
            <div className="match-list">
              {reasons.slice(0, isTop ? 3 : 2).map((reason, i) => (
                <div key={i}>
                  <CheckCircle2 size={15} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="match-section-label">Quality signals</p>
            <div className="match-list is-cred">
              {result.credibilitySignals.map((signal, i) => (
                <div key={i}>
                  <ShieldCheck size={15} />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MatchCard({ result, rank, initialSaved = false, intakeId, categoryLabel }: MatchCardProps) {
  if (isLockedResult(result)) {
    return <LockedMatchCard result={result} rank={rank} />;
  }

  const { firm, score, reasons, firmHighlights, isBestMatch, isPartialMatch, partialMatchReasons } = result;
  const profileHref = intakeId ? `/firms/${firm.id}?intake=${intakeId}` : `/firms/${firm.id}`;
  // firmHighlights (named attorneys, specific rankings) can identify the firm, so
  // they're only ever combined in here — after the isLockedResult check above —
  // never passed into the locked/pre-paywall card.
  // Not capped — the pre-merge unlocked card showed the full merged list (up to 3
  // generic reasons + up to 2 firm-specific highlights), not just the first 3.
  const rawDisplayReasons = visibleReasons([...reasons, ...firmHighlights]);
  // Partial matches (failed a hard filter, e.g. out-of-state) never have reasons/
  // highlights — they're not a genuine fit. Show the specific disqualification
  // reason instead of the generic fallback below, which would otherwise render
  // identically on every partial-match card and read as a bug.
  const displayReasons = rawDisplayReasons.length > 0
    ? rawDisplayReasons
    : isPartialMatch && partialMatchReasons && partialMatchReasons.length > 0
      ? partialMatchReasons
      : ["Matches the legal need described in your intake", "Aligned with your stated preferences"];
  const qualitySignals = computeQualitySignals(firm, categoryLabel ?? formatPractice(firm.practiceAreas[0] ?? ""));
  const roundedScore = Math.round(score);

  return (
    <div className={`match-card ${isBestMatch ? "is-top" : ""}`}>
      <div className="match-card-inner">
        <div className="match-card-head">
          <div className="match-firm-identity">
            <div
              className={`match-firm-logo ${firm.logoUrl ? "has-logo" : ""}`}
              aria-hidden="true"
              style={firm.logoUrl ? { backgroundImage: `url(${firm.logoUrl})` } : undefined}
            >
              {!firm.logoUrl && <span>{firm.name[0]}</span>}
            </div>
            <div>
              <div className="locked-badges">
                {isBestMatch && (
                  <span className="match-badge is-primary">
                    <Award size={9} strokeWidth={2.5} />
                    Best match
                  </span>
                )}
                {!isBestMatch && rank > 0 && (
                  <span className="match-rank">#{rank}</span>
                )}
                {isPartialMatch && (
                  <span className="match-badge">
                    <AlertCircle size={9} strokeWidth={2.5} />
                    Partial match
                  </span>
                )}
              </div>
              <h3>{firm.name}</h3>
              <p>{firm.tagline}</p>
            </div>
          </div>

          <ScoreRing score={roundedScore} />
        </div>

        <div className="match-chip-row">
          <span className="chip">{sizeLabels[firm.size] ?? firm.size} firm</span>
          {(categoryLabel || firm.practiceAreas[0]) && (
            <span className="chip">{categoryLabel ?? formatPractice(firm.practiceAreas[0])}</span>
          )}
          <span className="chip">{firm.location}</span>
          {firm.costTier && <span className="chip">{firm.costTier}</span>}
        </div>

        <div className="locked-proof-grid">
          <div>
            <p className="match-section-label">Why this fits</p>
            <div className="match-list">
              {displayReasons.map((r, i) => (
                <div key={i}>
                  <CheckCircle2 size={15} />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="match-section-label">Quality signals</p>
            <div className="match-list is-cred">
              {qualitySignals.map((signal, i) => (
                <div key={i}>
                  <ShieldCheck size={15} />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="match-actions">
          <SaveFirmButton firmId={firm.id} initialSaved={initialSaved} compact />
          <Link href={profileHref} className="btn btn-primary">
            View full profile
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
