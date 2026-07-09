"use client";

import "@/styles/lwyrd-ds.css";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Award, Building2, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MarketingFooter from "./MarketingFooter";
import MarketingNav from "./MarketingNav";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

type StatBlock =
  | {
      kind: "number";
      prefix?: string;
      value: number;
      suffix?: string;
      caption: string;
    }
  | {
      kind: "range";
      prefix?: string;
      from: number;
      to: number;
      join?: string;
      suffix?: string;
      caption: string;
    }
  | {
      kind: "ratio";
      numerator: number;
      denominator: number;
      caption: string;
    }
  | {
      kind: "text";
      figure: string;
      caption: string;
    };

export interface ClientAudienceLandingData {
  slug: "startups" | "smbs" | "individuals";
  track: "startup" | "small_business" | "individual";
  trackLabel: string;
  problemHeadline: string;
  approachHeadline: string;
  finalHeadline: string;
  finalSubline: string;
  primaryCta: string;
  secondaryCta: string;
  resultCaption: string;
  matters: { value: string; label: string }[];
  stats: StatBlock[];
  intakeDemo: {
    stepLabel: string;
    pct: number;
    question: string;
    options: string[];
  };
  result: {
    rankLabel: string;
    title: string;
    meta: string;
    score: number;
    reasons: string[];
    lockedText: string;
  };
}

function CountFigure({ block }: { block: StatBlock }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView || block.kind === "text") return;
    let frame = 0;
    const start = performance.now();
    const duration = 1100;

    const tick = (now: number) => {
      const pct = Math.min(1, (now - start) / duration);
      setProgress(1 - Math.pow(1 - pct, 3));
      if (pct < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [block.kind, inView]);

  if (block.kind === "text") {
    return <div ref={ref} className="audience-stat-figure audience-stat-phrase">{block.figure}</div>;
  }

  if (block.kind === "range") {
    const from = Math.max(0, Math.round(block.from * progress));
    const to = Math.max(0, Math.round(block.to * progress));
    return (
      <div ref={ref} className="audience-stat-figure">
        {block.prefix}{from.toLocaleString()}{block.join ?? " to "}{block.prefix}{to.toLocaleString()}
        {block.suffix ? <span>{block.suffix}</span> : null}
      </div>
    );
  }

  if (block.kind === "ratio") {
    const numerator = Math.max(0, Math.round(block.numerator * progress));
    const denominator = Math.max(0, Math.round(block.denominator * progress));
    return (
      <div ref={ref} className="audience-stat-figure">
        {numerator} in {denominator}
      </div>
    );
  }

  return (
    <div ref={ref} className="audience-stat-figure">
      {block.prefix}{Math.round(block.value * progress).toLocaleString()}
      {block.suffix ? <span>{block.suffix}</span> : null}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const size = 72;
  const radius = 29;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="mock-score-ring">
      <div className="mock-score-ring-graphic" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7E7E3" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#002B55"
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="mock-score-ring-value">
          <span>{score}</span>
          <small>%</small>
        </div>
      </div>
      <span className="mock-score-ring-label">Match score</span>
    </div>
  );
}

export default function ClientAudienceLanding({ data }: { data: ClientAudienceLandingData }) {
  const router = useRouter();
  const { isAuthenticated, openModal } = useAuth();

  const startIntake = (category?: string) => {
    const target = `/intake?track=${data.track}${category ? `&category=${category}` : ""}`;
    if (isAuthenticated) router.push(target);
    else openModal("signup", target);
  };

  return (
    <div className="lwyrd-ds ds-page audience-page">
      <MarketingNav current="clients" />
      <main className="ds-main">
        <section className="audience-beat audience-problem">
          <div className="ds-shell audience-wrap">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="audience-head"
            >
              <span className="audience-eyebrow">The problem</span>
              <h1>{data.problemHeadline}</h1>
            </motion.div>

            <div className="audience-stat-grid">
              {data.stats.map((block, index) => (
                <motion.div
                  key={block.caption}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.58, ease, delay: 0.08 + index * 0.08 }}
                  className="audience-stat-card"
                >
                  <CountFigure block={block} />
                  <p>{block.caption}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="audience-beat audience-approach">
          <div className="ds-shell audience-wrap">
            <div className="audience-head audience-head-wide">
              <span className="audience-eyebrow">The approach</span>
              <h2>{data.approachHeadline}</h2>
            </div>

            <div className="audience-mockups">
              <div>
                <div className="audience-mockup">
                  <div className="mock-topbar">
                    <span />
                    <span />
                    <span />
                    <p>LWYRD intake</p>
                  </div>
                  <div className="mock-progress">
                    <div className="mock-progress-meta">
                      <span>{data.intakeDemo.stepLabel}</span>
                      <span>{data.intakeDemo.pct}% complete</span>
                    </div>
                    <div className="mock-progress-track">
                      <div className="mock-progress-fill" style={{ width: `${data.intakeDemo.pct}%` }} />
                    </div>
                  </div>
                  <div className="mock-intake-card">
                    <p className="mock-intake-meta">Required</p>
                    <h3>{data.intakeDemo.question}</h3>
                    <div className="mock-intake-options" aria-hidden="true">
                      {data.intakeDemo.options.map((opt, i) => (
                        <div
                          key={opt}
                          className={`mock-intake-option ${i === 0 ? "is-selected" : ""}`}
                        >
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="audience-caption">
                  {data.slug === "startups"
                    ? "Whatever your matter, intake starts by understanding it, not sorting you into a list."
                    : data.slug === "smbs"
                      ? "Whatever the issue, intake starts by understanding it, not handing you a list."
                      : "Whatever you're facing, intake starts by understanding your situation, not handing you a list."}
                </p>
              </div>

              <div>
                <div className="audience-mockup">
                  <div className="mock-topbar">
                    <span />
                    <span />
                    <span />
                    <p>LWYRD matches</p>
                  </div>
                  <div className="mock-match-card is-top">
                    <div className="mock-match-head">
                      <div className="mock-match-identity">
                        <div className="mock-match-logo" aria-hidden="true">
                          <div />
                          <span>1</span>
                        </div>
                        <div className="mock-match-idtext">
                          <div className="mock-badges">
                            <span className="mock-badge is-primary">
                              <Award size={9} strokeWidth={2.5} /> {data.result.rankLabel}
                            </span>
                            <span className="mock-badge">
                              <LockKeyhole size={10} strokeWidth={2} /> Identity hidden
                            </span>
                          </div>
                          <div className="mock-locked-name" />
                          <p>{data.result.title}</p>
                        </div>
                      </div>
                      <ScoreRing score={data.result.score} />
                    </div>

                    <div className="mock-chip-row">
                      {data.result.meta.split("·").map((chip, i) => (
                        <span key={i} className="mock-chip">
                          {i === 0 ? <Building2 size={12} strokeWidth={1.75} /> : null}
                          {chip.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="mock-match-why">
                      <p className="mock-section-label">Why this fits</p>
                      <div className="mock-match-list">
                        {data.result.reasons.map((reason) => (
                          <div key={reason}>
                            <CheckCircle2 size={15} /> <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mock-result-locked">
                      <LockKeyhole size={14} />
                      {data.result.lockedText}
                    </div>
                  </div>
                </div>
                <p className="audience-caption audience-result-caption">{data.resultCaption}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="audience-beat audience-final">
          <div className="ds-shell audience-final-inner">
            <span className="audience-eyebrow">Get started</span>
            <h2>{data.finalHeadline}</h2>
            <p>{data.finalSubline}</p>
            <div className="audience-actions">
              <button type="button" className="btn btn-primary" onClick={() => startIntake()}>
                {data.primaryCta} <ArrowRight size={15} />
              </button>
              <Link href="/product/consultations" className="btn btn-ghost">
                <Sparkles size={15} />
                {data.secondaryCta}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .audience-page{background:#fff}
        .audience-beat{padding:var(--sec) 0}
        .audience-problem{padding-top:clamp(76px,10vw,124px)}
        .audience-approach{background:var(--paper-alt);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
        .audience-wrap{max-width:var(--maxw);padding-top:0;padding-bottom:0}
        .audience-eyebrow{
          display:block;
          color:var(--navy);
          font-size:.72rem;
          font-weight:600;
          letter-spacing:.14em;
          line-height:1.2;
          margin-bottom:1rem;
          text-transform:uppercase;
        }
        .audience-head{max-width:860px}
        .audience-head h1,.audience-head h2{
          font-size:clamp(2.25rem,5vw,4rem);
          line-height:1.05;
          margin:.75rem 0 0;
          max-width:18ch;
        }
        .audience-head-wide{max-width:980px;margin-bottom:clamp(34px,5vw,60px)}
        .audience-head-wide h2{max-width:21ch}
        .audience-stat-grid{display:grid;grid-template-columns:1fr;gap:16px;margin-top:clamp(36px,5vw,62px)}
        .audience-stat-card{
          min-height:220px;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          gap:28px;
          border:1px solid var(--line);
          border-radius:var(--r);
          background:#fff;
          box-shadow:var(--shadow-sm);
          padding:clamp(22px,3vw,30px);
        }
        .audience-stat-figure{
          color:var(--navy);
          font-family:var(--display);
          font-size:clamp(2rem,4vw,3.15rem);
          font-weight:700;
          line-height:1.05;
          letter-spacing:0;
        }
        .audience-stat-figure span{font-family:var(--display);font-size:.56em;font-weight:700;color:var(--navy);letter-spacing:-.01em}
        .audience-stat-phrase{max-width:9ch}
        .audience-stat-card p{color:var(--muted);font-size:.94rem;line-height:1.58;max-width:34ch}
        .audience-mockups{display:grid;grid-template-columns:1fr;gap:clamp(24px,4vw,40px);align-items:start}
        .audience-mockup{
          border:1px solid var(--line);
          border-radius:var(--r);
          background:#fff;
          box-shadow:var(--shadow-sm);
          overflow:hidden;
          padding:clamp(20px,3vw,30px);
        }
        .mock-topbar{display:flex;align-items:center;gap:7px;margin:-4px 0 20px;color:var(--faint);font-size:.74rem}
        .mock-topbar span{width:8px;height:8px;border-radius:50%;background:#d9d9d5}
        .mock-topbar p{margin-left:6px}
        .audience-caption{color:var(--muted);font-size:.9rem;line-height:1.6;margin-top:14px;max-width:62ch}
        .audience-result-caption{font-weight:500;color:var(--ink-2)}

        /* intake mockup — mirrors the real intake screen */
        .mock-progress{margin-bottom:20px}
        .mock-progress-meta{display:flex;justify-content:space-between;color:var(--muted);font-size:.74rem;font-weight:600;margin-bottom:8px}
        .mock-progress-track{height:6px;border-radius:var(--r-pill);background:var(--paper-alt);border:1px solid var(--line);overflow:hidden}
        .mock-progress-fill{height:100%;border-radius:var(--r-pill);background:var(--navy-gradient)}
        .mock-intake-card{border:1px solid var(--line);border-radius:14px;background:var(--paper-alt);box-shadow:var(--shadow-sm);padding:clamp(16px,2.4vw,22px)}
        .mock-intake-meta{color:var(--faint);font-size:.6rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px}
        .mock-intake-card h3{font-family:var(--display);font-weight:500;font-size:clamp(1.15rem,2vw,1.5rem);line-height:1.18;color:var(--ink);margin-bottom:16px}
        .mock-intake-options{display:grid;gap:9px}
        .mock-intake-option{
          width:100%;
          text-align:left;
          border:1px solid var(--line);
          border-radius:11px;
          background:#fff;
          color:var(--ink-2);
          font-size:.9rem;
          font-weight:600;
          padding:13px 15px;
          pointer-events:none;
        }
        .mock-intake-option.is-selected{background:var(--navy-gradient);border-color:var(--navy);color:#fff;box-shadow:0 10px 24px rgba(0,43,85,.16)}

        /* result mockup — mirrors the real locked match card */
        .mock-match-card{position:relative;border:1px solid var(--line);border-radius:14px;background:#fff;box-shadow:var(--shadow-sm);padding:clamp(16px,2.4vw,22px);overflow:hidden}
        .mock-match-card.is-top{border-color:var(--navy);box-shadow:0 8px 24px rgba(0,43,85,.1)}
        .mock-match-card.is-top::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--navy)}
        .mock-match-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--line)}
        .mock-match-identity{display:flex;align-items:center;gap:12px;min-width:0}
        .mock-match-logo{position:relative;width:46px;height:46px;flex:0 0 46px;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .mock-match-logo div{position:absolute;inset:0;background:var(--navy-tint);border:1px solid var(--navy-tint-2);border-radius:12px;filter:blur(1px)}
        .mock-match-logo span{position:relative;font-family:var(--display);font-size:1.1rem;color:var(--navy)}
        .mock-match-idtext{min-width:0}
        .mock-badges{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px}
        .mock-badge{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line);border-radius:var(--r-pill);background:var(--paper-alt);color:var(--muted);font-size:.58rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 8px;line-height:1}
        .mock-badge.is-primary{border-color:var(--navy);background:var(--navy);color:#fff}
        .mock-locked-name{width:60%;max-width:150px;height:15px;border-radius:6px;background:linear-gradient(90deg,var(--navy-tint),#e9e6dd);margin-bottom:7px}
        .mock-match-idtext p{color:var(--muted);font-size:.8rem;line-height:1.35}
        .mock-score-ring{display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0}
        .mock-score-ring-graphic{position:relative}
        .mock-score-ring-value{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:1px}
        .mock-score-ring-value span{font-family:var(--display);color:var(--navy);font-size:1.15rem;line-height:1}
        .mock-score-ring-value small{color:var(--muted);font-size:.62rem;font-weight:600}
        .mock-score-ring-label{color:var(--faint);font-size:.56rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
        .mock-chip-row{display:flex;flex-wrap:wrap;gap:7px;padding:14px 0;border-bottom:1px solid var(--line)}
        .mock-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:var(--r-pill);background:var(--paper-alt);color:var(--ink-2);font-size:.74rem;padding:5px 10px}
        .mock-chip svg{color:var(--muted)}
        .mock-match-why{padding-top:14px}
        .mock-section-label{color:var(--faint);font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:11px}
        .mock-match-list{display:grid;gap:9px}
        .mock-match-list div{display:flex;align-items:flex-start;gap:9px;color:var(--ink-2);font-size:.84rem;line-height:1.45}
        .mock-match-list svg{color:#059669;flex-shrink:0;margin-top:2px}
        .mock-result-locked{display:flex;align-items:center;gap:9px;margin-top:16px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--paper-alt);padding:11px 13px;color:var(--muted);font-size:.8rem;font-weight:600}
        .mock-result-locked svg{flex-shrink:0}
        .audience-final{text-align:center}
        .audience-final-inner{max-width:840px;padding-top:0;padding-bottom:0}
        .audience-final h2{font-size:clamp(2rem,4vw,3rem);line-height:1.08;margin:.65rem auto 1rem;max-width:16ch}
        .audience-final p{color:var(--muted);font-size:1rem;line-height:1.6;margin:0 auto 1.8rem;max-width:64ch}
        .audience-actions{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
        @media(min-width:760px){
          .audience-stat-grid{grid-template-columns:repeat(3,1fr)}
          .audience-mockups{grid-template-columns:1fr 1fr}
        }
        @media(max-width:640px){
          .audience-beat{padding:64px 0}
          .audience-problem{padding-top:54px}
          .audience-head h1,.audience-head h2{font-size:clamp(2rem,12vw,2.8rem)}
          .mock-match-head{flex-direction:column-reverse;align-items:flex-start}
          .mock-score-ring{flex-direction:row;align-items:center;gap:9px}
          .audience-actions .btn{width:100%;justify-content:center}
        }
      `}</style>
    </div>
  );
}
