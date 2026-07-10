"use client";

import Link from "next/link";
import { Firm, PublicMatchResult } from "@/types";
import { Award, Building2, CheckCircle2, XCircle, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import SaveFirmButton from "@/components/firms/SaveFirmButton";

const serif = { fontFamily: '"Libre Baskerville", Georgia, serif' } as const;
const hiddenPricingCriteria = new Set(["budget", "billing"]);
const pricingLanguage = /\b(budget|billing|fee|fees|cost|costs|price|pricing|retainer|hourly|flat[- ]?fee|\$)\b/i;

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size",
  large: "Large",
};

const missedLabels: Record<string, string> = {
  "company-stage": "Stage: doesn't specialize in your company stage",
  industry: "Industry: doesn't serve your vertical",
  location: "Location: may not be licensed in your state",
  timeline: "Timeline: may not match your urgency",
  language: "Language: may not have attorneys who speak your language",
};

function formatPractice(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getMissedLabel(criterion: string, firm: Firm): string {
  if (criterion === "firm-size") {
    const size = sizeLabels[firm.size]?.toLowerCase() ?? firm.size;
    return `Firm size: ${size} firm`;
  }
  return missedLabels[criterion] ?? criterion;
}

function visibleReasons(reasons: string[]) {
  return reasons.filter((reason) => !pricingLanguage.test(reason));
}

function visibleCriteria(criteria: string[]) {
  return criteria.filter((criterion) => !hiddenPricingCriteria.has(criterion));
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
        <p>A real matched firm is here. Unlock to see its name and profile.</p>
      </div>
    </div>
  );
}

function LockedMatchCard({
  result,
  rank,
  intakeId,
}: {
  result: Extract<PublicMatchResult, { isLocked: true }>;
  rank: number;
  intakeId?: string | null;
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

        {isTop && (
          <div className="locked-card-cta">
            <p>
              Your matches are ready. Unlock this intake to see who each firm is, open full profiles,
              and get a prepared summary of your matter plus a ready-to-send message for reaching out.
            </p>
            <Link href={intakeId ? `/access?next=/results/${intakeId}` : "/access?next=/results"} className="btn btn-primary">
              Unlock with checkout <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchCard({ result, rank, initialSaved = false, intakeId }: MatchCardProps) {
  if (isLockedResult(result)) {
    return <LockedMatchCard result={result} rank={rank} intakeId={intakeId} />;
  }

  const { firm, score, reasons, firmHighlights, isBestMatch } = result;
  const profileHref = intakeId ? `/firms/${firm.id}?intake=${intakeId}` : `/firms/${firm.id}`;
  // firmHighlights (named attorneys, specific rankings) can identify the firm, so
  // they're only ever combined in here — after the isLockedResult check above —
  // never passed into the locked/pre-paywall card.
  const displayReasons = visibleReasons([...reasons, ...firmHighlights]);
  const displayMissedCriteria = visibleCriteria(result.missedCriteria);
  const roundedScore = Math.round(score);
  const hasCriteria = displayReasons.length > 0 || displayMissedCriteria.length > 0;
  const hasBoth = displayReasons.length > 0 && displayMissedCriteria.length > 0;

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
              </div>
              <h3>{firm.name}</h3>
              <p>{firm.tagline}</p>
            </div>
          </div>

          <ScoreRing score={roundedScore} />
        </div>

        <div className="match-meta-row">
          <span>
            <Building2 size={13} strokeWidth={1.75} className="shrink-0" />
            {sizeLabels[firm.size] ?? firm.size} firm
          </span>
          {firm.founded && (
            <span>Est. {firm.founded}</span>
          )}
          {firm.practiceAreas[0] && (
            <span>{formatPractice(firm.practiceAreas[0])}</span>
          )}
        </div>

        {hasCriteria && (
          <div className={`match-criteria ${hasBoth ? "has-both" : ""}`}>
            {hasBoth ? (
              <>
                <div className="match-list">
                  {displayReasons.map((r, i) => (
                    <div key={i}>
                      <CheckCircle2 size={15} />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
                <div className="match-list is-muted">
                  {displayMissedCriteria.map((c) => (
                    <div key={c}>
                      <XCircle size={15} />
                      <span>{getMissedLabel(c, firm)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {displayReasons.map((r, i) => (
                  <div key={i} className="match-list">
                    <div>
                      <CheckCircle2 size={15} />
                      <span>{r}</span>
                    </div>
                  </div>
                ))}
                {displayMissedCriteria.map((c) => (
                  <div key={c} className="match-list is-muted">
                    <div>
                      <XCircle size={15} />
                      <span>{getMissedLabel(c, firm)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

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
