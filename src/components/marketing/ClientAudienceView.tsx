"use client";

import "@/styles/lwyrd-ds.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";

export interface ClientAudience {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  points: { heading: string; body: string }[];
  bullets: string[];
}

export default function ClientAudienceView({ data }: { data: ClientAudience }) {
  const { isAuthenticated, openModal } = useAuth();
  const router = useRouter();

  const getMatched = () => {
    if (isAuthenticated) router.push("/intake/start");
    else openModal("signup", "/intake/start");
  };

  return (
    <div className="lwyrd-ds ds-page">
      <MarketingNav current="clients" />
      <main className="ds-main">
        {/* Hero */}
        <section className="ds-shell" style={{ textAlign: "center", maxWidth: 820 }}>
          <span className="kicker">{data.eyebrow}</span>
          <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)", margin: ".6rem auto 1.1rem", maxWidth: "18ch" }}>
            {data.title}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: "52ch", margin: "0 auto 2rem" }}>
            {data.intro}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={getMatched}>
              Get matched <ArrowRight size={15} />
            </button>
            <Link href="/product/consultations" className="btn btn-ghost">Book a call</Link>
          </div>
        </section>

        {/* Value points */}
        <section className="ds-shell" style={{ paddingTop: 0 }}>
          <div className="ca-grid">
            {data.points.map((p) => (
              <div key={p.heading} className="ds-card ds-card-hover">
                <h3 style={{ fontSize: "1.15rem", marginBottom: ".6rem" }}>{p.heading}</h3>
                <p style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.6 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bullets + CTA */}
        <section className="ds-shell" style={{ paddingTop: 0 }}>
          <div className="navy-panel ca-cta">
            <div>
              <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", marginBottom: "1.1rem" }}>What you get with LWYRD</h2>
              <div style={{ display: "grid", gap: ".75rem" }}>
                {data.bullets.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: ".6rem" }}>
                    <CheckCircle2 size={16} style={{ color: "#fff", opacity: 0.85, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ color: "rgba(255,255,255,.85)", fontSize: ".95rem" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ca-cta-action">
              <button className="btn" style={{ background: "#fff", color: "var(--navy)", width: "100%", justifyContent: "center" }} onClick={getMatched}>
                Get matched <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .ca-grid{display:grid;grid-template-columns:1fr;gap:1.25rem}
        @media(min-width:760px){.ca-grid{grid-template-columns:repeat(3,1fr)}}
        .ca-cta{display:grid;grid-template-columns:1fr;gap:1.75rem;align-items:center}
        @media(min-width:760px){.ca-cta{grid-template-columns:2fr 1fr}}
      `}</style>
    </div>
  );
}
