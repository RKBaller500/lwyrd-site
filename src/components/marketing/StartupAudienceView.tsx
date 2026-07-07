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

const startupMatters = [
  { value: "formation", label: "Formation and structure" },
  { value: "ip", label: "Intellectual property" },
  { value: "fundraising", label: "Fundraising and securities" },
  { value: "employment", label: "Employment and equity" },
  { value: "contracts", label: "Commercial contracts" },
  { value: "regulatory", label: "Regulatory and compliance" },
  { value: "governance", label: "Corporate governance" },
  { value: "ma", label: "M&A and exit" },
  { value: "dispute", label: "Disputes" },
];

const statBlocks = [
  {
    kind: "range" as const,
    prefix: "$",
    from: 200,
    to: 1000,
    suffix: " / hour",
    caption: "the same work, priced by which lawyer you land with",
  },
  {
    kind: "percent" as const,
    value: 79,
    suffix: "%",
    caption: "of people contact more than one firm before hiring, and only 11% pick the first",
  },
  {
    kind: "text" as const,
    figure: "Preventable at founding",
    caption: "unassigned IP, undocumented equity, formation errors, cheap to do right, costly to fix later",
  },
];

function CountFigure({ block }: { block: (typeof statBlocks)[number] }) {
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
    return <div ref={ref} className="startup-stat-figure startup-stat-phrase">{block.figure}</div>;
  }

  if (block.kind === "range") {
    const from = Math.round(block.from * progress);
    const to = Math.round(block.to * progress);
    return (
      <div ref={ref} className="startup-stat-figure">
        {block.prefix}{from.toLocaleString()} to {block.prefix}{to.toLocaleString()}
        <span>{block.suffix}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="startup-stat-figure">
      {Math.round(block.value * progress)}
      <span>{block.suffix}</span>
    </div>
  );
}

export default function StartupAudienceView() {
  const router = useRouter();
  const { isAuthenticated, openModal } = useAuth();

  const startStartup = (category?: string) => {
    const target = `/intake?track=startup${category ? `&category=${category}` : ""}`;
    if (isAuthenticated) router.push(target);
    else openModal("signup", target);
  };

  return (
    <div className="lwyrd-ds ds-page startup-page">
      <MarketingNav current="clients" />
      <main className="ds-main">
        <section className="startup-beat startup-problem">
          <div className="ds-shell startup-wrap">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="startup-head"
            >
              <span className="startup-eyebrow">The problem</span>
              <h1>Finding the right startup lawyer is harder, slower, and costlier than it should be.</h1>
            </motion.div>

            <div className="startup-stat-grid">
              {statBlocks.map((block, index) => (
                <motion.div
                  key={block.caption}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.58, ease, delay: 0.08 + index * 0.08 }}
                  className="startup-stat-card"
                >
                  <CountFigure block={block} />
                  <p>{block.caption}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="startup-beat startup-approach">
          <div className="ds-shell startup-wrap">
            <div className="startup-head startup-head-wide">
              <span className="startup-eyebrow">The approach</span>
              <h2>We match you to firms built for your stage, your budget, and your exact matter.</h2>
            </div>

            <div className="startup-mockups">
              <div>
                <div className="startup-mockup startup-intake-mockup">
                  <div className="mock-topbar">
                    <span />
                    <span />
                    <span />
                    <p>LWYRD intake</p>
                  </div>
                  <div className="startup-track-pill">Startup track</div>
                  <h3>What area of law do you need help with?</h3>
                  <div className="startup-matter-grid">
                    {startupMatters.map((matter) => (
                      <button key={matter.value} type="button" onClick={() => startStartup(matter.value)}>
                        {matter.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="startup-caption">
                  Whatever your matter, intake starts by understanding it, not sorting you into a list.
                </p>
              </div>

              <div>
                <div className="startup-mockup startup-result-mockup">
                  <div className="startup-result-head">
                    <div>
                      <span className="startup-rank">Top match</span>
                      <h3>Seed-stage IP counsel</h3>
                      <p>Boutique firm · Intellectual property · New York</p>
                    </div>
                    <div className="startup-score">
                      <strong>94</strong>
                      <span>% fit</span>
                    </div>
                  </div>
                  <div className="startup-result-reasons">
                    <div><CheckCircle2 size={16} /> Works with seed-stage software founders</div>
                    <div><CheckCircle2 size={16} /> Fits your stated budget range</div>
                    <div><CheckCircle2 size={16} /> IP assignment and trademark depth</div>
                  </div>
                  <div className="startup-result-locked">
                    <LockKeyhole size={15} />
                    Firm identity hidden until you unlock this intake
                  </div>
                </div>
                <p className="startup-caption">
                  You get firms scored to your situation, with the reasons each one fits. No firm reaches out until you decide to.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="startup-beat startup-final">
          <div className="ds-shell startup-final-inner">
            <span className="startup-eyebrow">Get started</span>
            <h2>Tell us what you&apos;re building. We&apos;ll find who fits.</h2>
            <p>A few questions, about five minutes, and you&apos;ll see the firms matched to your situation.</p>
            <div className="startup-actions">
              <button type="button" className="btn btn-primary" onClick={() => startStartup()}>
                Get matched <ArrowRight size={15} />
              </button>
              <Link href="/product/consultations" className="btn btn-ghost">
                <Sparkles size={15} />
                Not sure what you need? Book a consultation
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .startup-page{background:#fff}
        .startup-beat{padding:var(--sec) 0}
        .startup-problem{padding-top:clamp(76px,10vw,124px)}
        .startup-approach{background:var(--paper-alt);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
        .startup-wrap{max-width:var(--maxw);padding-top:0;padding-bottom:0}
        .startup-eyebrow{
          display:block;
          color:var(--navy);
          font-size:.72rem;
          font-weight:600;
          letter-spacing:.14em;
          line-height:1.2;
          margin-bottom:1rem;
          text-transform:uppercase;
        }
        .startup-head{max-width:830px}
        .startup-head h1,.startup-head h2{
          font-size:clamp(2.25rem,5vw,4rem);
          line-height:1.05;
          margin:.75rem 0 0;
          max-width:17ch;
        }
        .startup-head-wide{max-width:960px;margin-bottom:clamp(34px,5vw,60px)}
        .startup-head-wide h2{max-width:19ch}
        .startup-stat-grid{display:grid;grid-template-columns:1fr;gap:16px;margin-top:clamp(36px,5vw,62px)}
        .startup-stat-card{
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
        .startup-stat-figure{
          color:var(--navy);
          font-family:var(--display);
          font-size:clamp(2rem,4vw,3.15rem);
          font-weight:700;
          line-height:1.05;
          letter-spacing:0;
        }
        .startup-stat-figure span{font-family:var(--body);font-size:.34em;font-weight:700;color:var(--muted)}
        .startup-stat-phrase{max-width:9ch}
        .startup-stat-card p{color:var(--muted);font-size:.94rem;line-height:1.58;max-width:34ch}
        .startup-mockups{display:grid;grid-template-columns:1fr;gap:clamp(24px,4vw,40px);align-items:start}
        .startup-mockup{
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
        .startup-track-pill{display:inline-flex;border:1px solid var(--navy-tint-2);background:var(--navy-tint);color:var(--navy);border-radius:var(--r-pill);padding:.32em .78em;font-size:.74rem;font-weight:700;margin-bottom:16px}
        .startup-mockup h3{font-family:var(--display);font-size:clamp(1.25rem,2.2vw,1.72rem);line-height:1.16;margin-bottom:18px}
        .startup-matter-grid{display:grid;grid-template-columns:1fr;gap:8px}
        .startup-matter-grid button{
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
        .startup-matter-grid button:hover{background:#fff;border-color:var(--navy-tint-2);box-shadow:var(--shadow-sm);transform:translateY(-1px)}
        .startup-caption{color:var(--muted);font-size:.9rem;line-height:1.6;margin-top:14px;max-width:62ch}
        .startup-result-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding-bottom:18px;border-bottom:1px solid var(--line)}
        .startup-rank{display:inline-flex;background:var(--navy);color:#fff;border-radius:var(--r-pill);padding:.3em .7em;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:13px}
        .startup-result-head h3{margin-bottom:5px}
        .startup-result-head p{color:var(--muted);font-size:.86rem;line-height:1.4}
        .startup-score{flex-shrink:0;text-align:center;border:1px solid var(--navy-tint-2);background:var(--navy-tint);border-radius:var(--r);padding:12px 14px;min-width:86px}
        .startup-score strong{display:block;color:var(--navy);font-family:var(--display);font-size:2rem;line-height:1}
        .startup-score span{display:block;color:var(--muted);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-top:3px}
        .startup-result-reasons{display:grid;gap:10px;margin-top:18px}
        .startup-result-reasons div{display:flex;align-items:flex-start;gap:10px;color:var(--ink-2);font-size:.9rem;line-height:1.45}
        .startup-result-reasons svg{color:#15803d;flex-shrink:0;margin-top:2px}
        .startup-result-locked{display:flex;align-items:center;gap:9px;margin-top:20px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--paper-alt);padding:12px 13px;color:var(--muted);font-size:.82rem;font-weight:600}
        .startup-final{text-align:center}
        .startup-final-inner{max-width:820px;padding-top:0;padding-bottom:0}
        .startup-final h2{font-size:clamp(2rem,4vw,3rem);line-height:1.08;margin:.65rem auto 1rem;max-width:15ch}
        .startup-final p{color:var(--muted);font-size:1rem;line-height:1.6;margin:0 auto 1.8rem;max-width:58ch}
        .startup-actions{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
        @media(min-width:760px){
          .startup-stat-grid{grid-template-columns:repeat(3,1fr)}
          .startup-mockups{grid-template-columns:1fr 1fr}
          .startup-matter-grid{grid-template-columns:1fr 1fr}
        }
        @media(max-width:640px){
          .startup-beat{padding:64px 0}
          .startup-problem{padding-top:54px}
          .startup-head h1,.startup-head h2{font-size:clamp(2rem,12vw,2.8rem)}
          .startup-result-head{flex-direction:column}
          .startup-score{width:100%;text-align:left}
          .startup-score strong,.startup-score span{display:inline-block}
          .startup-score span{margin-left:5px}
          .startup-actions .btn{width:100%;justify-content:center}
        }
      `}</style>
    </div>
  );
}
