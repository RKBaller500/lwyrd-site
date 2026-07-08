"use client";

import "@/styles/lwyrd-ds.css";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
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
                <div className="audience-mockup audience-intake-mockup">
                  <div className="mock-topbar">
                    <span />
                    <span />
                    <span />
                    <p>LWYRD intake</p>
                  </div>
                  <div className="audience-track-pill">{data.trackLabel}</div>
                  <h3>What area of law do you need help with?</h3>
                  <div className="audience-matter-grid">
                    {data.matters.map((matter) => (
                      <button key={matter.value} type="button" onClick={() => startIntake(matter.value)}>
                        {matter.label}
                      </button>
                    ))}
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
                <div className="audience-mockup audience-result-mockup">
                  <div className="audience-result-head">
                    <div>
                      <span className="audience-rank">{data.result.rankLabel}</span>
                      <h3>{data.result.title}</h3>
                      <p>{data.result.meta}</p>
                    </div>
                    <div className="audience-score">
                      <strong>{data.result.score}</strong>
                      <span>% fit</span>
                    </div>
                  </div>
                  <div className="audience-result-reasons">
                    {data.result.reasons.map((reason) => (
                      <div key={reason}><CheckCircle2 size={16} /> {reason}</div>
                    ))}
                  </div>
                  <div className="audience-result-locked">
                    <LockKeyhole size={15} />
                    {data.result.lockedText}
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
        .mock-topbar{display:flex;align-items:center;gap:7px;margin:-4px 0 22px;color:var(--faint);font-size:.74rem}
        .mock-topbar span{width:8px;height:8px;border-radius:50%;background:#d9d9d5}
        .mock-topbar p{margin-left:6px}
        .audience-track-pill{display:inline-flex;border:1px solid var(--navy-tint-2);background:var(--navy-tint);color:var(--navy);border-radius:var(--r-pill);padding:.32em .78em;font-size:.74rem;font-weight:700;margin-bottom:16px}
        .audience-mockup h3{font-family:var(--display);font-size:clamp(1.25rem,2.2vw,1.72rem);line-height:1.16;margin-bottom:18px}
        .audience-matter-grid{display:grid;grid-template-columns:1fr;gap:8px}
        .audience-matter-grid button{
          min-height:44px;
          text-align:left;
          border:1px solid var(--line);
          border-radius:var(--r-sm);
          background:var(--paper-alt);
          color:var(--ink);
          font-size:.88rem;
          font-weight:600;
          padding:11px 13px;
          transition:background .16s ease,border-color .16s ease,transform .16s ease,box-shadow .16s ease;
        }
        .audience-matter-grid button:hover{background:#fff;border-color:var(--navy-tint-2);box-shadow:var(--shadow-sm);transform:translateY(-1px)}
        .audience-caption{color:var(--muted);font-size:.9rem;line-height:1.6;margin-top:14px;max-width:62ch}
        .audience-result-caption{font-weight:500;color:var(--ink-2)}
        .audience-result-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding-bottom:18px;border-bottom:1px solid var(--line)}
        .audience-rank{display:inline-flex;background:var(--navy);color:#fff;border-radius:var(--r-pill);padding:.3em .7em;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:13px}
        .audience-result-head h3{margin-bottom:5px}
        .audience-result-head p{color:var(--muted);font-size:.86rem;line-height:1.4}
        .audience-score{flex-shrink:0;text-align:center;border:1px solid var(--navy-tint-2);background:var(--navy-tint);border-radius:var(--r);padding:12px 14px;min-width:86px}
        .audience-score strong{display:block;color:var(--navy);font-family:var(--display);font-size:2rem;line-height:1}
        .audience-score span{display:block;color:var(--muted);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-top:3px}
        .audience-result-reasons{display:grid;gap:10px;margin-top:18px}
        .audience-result-reasons div{display:flex;align-items:flex-start;gap:10px;color:var(--ink-2);font-size:.9rem;line-height:1.45}
        .audience-result-reasons svg{color:#15803d;flex-shrink:0;margin-top:2px}
        .audience-result-locked{display:flex;align-items:center;gap:9px;margin-top:20px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--paper-alt);padding:12px 13px;color:var(--muted);font-size:.82rem;font-weight:600}
        .audience-final{text-align:center}
        .audience-final-inner{max-width:840px;padding-top:0;padding-bottom:0}
        .audience-final h2{font-size:clamp(2rem,4vw,3rem);line-height:1.08;margin:.65rem auto 1rem;max-width:16ch}
        .audience-final p{color:var(--muted);font-size:1rem;line-height:1.6;margin:0 auto 1.8rem;max-width:64ch}
        .audience-actions{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
        @media(min-width:760px){
          .audience-stat-grid{grid-template-columns:repeat(3,1fr)}
          .audience-mockups{grid-template-columns:1fr 1fr}
          .audience-matter-grid{grid-template-columns:1fr 1fr}
        }
        @media(max-width:640px){
          .audience-beat{padding:64px 0}
          .audience-problem{padding-top:54px}
          .audience-head h1,.audience-head h2{font-size:clamp(2rem,12vw,2.8rem)}
          .audience-result-head{flex-direction:column}
          .audience-score{width:100%;text-align:left}
          .audience-score strong,.audience-score span{display:inline-block}
          .audience-score span{margin-left:5px}
          .audience-actions .btn{width:100%;justify-content:center}
        }
      `}</style>
    </div>
  );
}
