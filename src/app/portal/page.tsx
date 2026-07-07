"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import "@/styles/lwyrd-ds.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Inbox,
  Briefcase,
  ArrowRight,
  ChevronRight,
  Clock,
  Settings,
  Users,
  MessageSquare,
  FileText,
  CheckCircle2,
  Edit3,
} from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

type TabId = "overview" | "profile" | "inquiries" | "engagements";

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Firm Profile", icon: Building2 },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
  { id: "engagements", label: "Engagements", icon: Briefcase },
];

function StatCard({ value, label, sublabel }: { value: number | string; label: string; sublabel?: string }) {
  return (
    <div className="app-stat">
      <span className="n">{value}</span>
      <span className="l">{label}</span>
      {sublabel && <span className="s">{sublabel}</span>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, cta }: {
  icon: React.ElementType;
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="app-empty">
      <Icon size={30} className="ico" strokeWidth={1.3} />
      <h3>{title}</h3>
      <p>{body}</p>
      {cta}
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ firmName, setActiveTab }: { firmName: string; setActiveTab: (t: TabId) => void }) {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div className="app-stats">
        <StatCard value={0} label="Inquiries" sublabel="New this week" />
        <StatCard value={0} label="Active" sublabel="Engagements" />
        <StatCard value={0} label="Completed" sublabel="Engagements" />
      </div>

      {/* Status card */}
      <div className="ds-card" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <span className="icon-box" style={{ background: "#e8f6ee", borderColor: "#c6ecd5", color: "#0f7a3d" }}>
          <CheckCircle2 size={18} strokeWidth={1.6} />
        </span>
        <div>
          <p style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: ".98rem" }}>{firmName} is live on LWYRD</p>
          <p style={{ color: "var(--muted)", fontSize: ".9rem", marginTop: 4, lineHeight: 1.6 }}>
            Your firm profile is active. Clients whose intake answers match your practice areas, size,
            and billing preferences will see your listing in their results.
          </p>
          <button onClick={() => setActiveTab("profile")} className="app-link" style={{ marginTop: 12 }}>
            View firm profile <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <span className="app-section-label" style={{ display: "block", marginBottom: 12 }}>Quick Actions</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {[
            { icon: Inbox, label: "Client Inquiries", desc: "Review incoming client matches", onClick: () => setActiveTab("inquiries") },
            { icon: Edit3, label: "Update Firm Profile", desc: "Request changes to your listing", onClick: () => setActiveTab("profile") },
            { icon: Briefcase, label: "Active Engagements", desc: "Manage current client work", onClick: () => setActiveTab("engagements") },
            { icon: MessageSquare, label: "Contact LWYRD", desc: "Questions? We're here to help", href: "/contact" },
          ].map(({ icon: Icon, label, desc, onClick, href }) => {
            const inner = (
              <>
                <span className="icon-box" style={{ width: 36, height: 36 }}>
                  <Icon size={15} strokeWidth={1.6} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: ".9rem", fontWeight: 500 }}>{label}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>{desc}</p>
                </div>
                <ChevronRight size={14} style={{ color: "var(--faint)", flexShrink: 0 }} />
              </>
            );
            const cls = "ds-card ds-card-hover";
            const style = { padding: 16, display: "flex", alignItems: "center", gap: 12, textAlign: "left" as const };
            if (href) return <Link key={label} href={href} className={cls} style={style}>{inner}</Link>;
            return <button key={label} onClick={onClick} className={cls} style={style}>{inner}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Firm Profile ────────────────────────────────────────────────────────

function FirmProfileTab({ firmName }: { firmName: string }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="ds-card">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <div className="chip" style={{ color: "#0f7a3d", background: "#e8f6ee", borderColor: "#c6ecd5", marginBottom: 12 }}>
              <CheckCircle2 size={11} /> Live on LWYRD
            </div>
            <h2 style={{ fontSize: "1.4rem" }}>{firmName}</h2>
          </div>
          <Link href="/contact" className="btn btn-outline">
            <Edit3 size={13} strokeWidth={1.6} /> Request Update
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20 }}>
          {["Practice Areas", "Firm Size", "Billing Model", "Response Time", "Languages", "Location"].map((label) => (
            <div key={label}>
              <p style={{ fontSize: ".78rem", color: "var(--faint)", fontWeight: 600, marginBottom: 4 }}>{label}</p>
              <Link href="/contact" className="app-link" style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                <Edit3 size={10} strokeWidth={1.6} /> Request update
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="navy-panel">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span className="icon-box" style={{ background: "rgba(255,255,255,.12)", borderColor: "rgba(255,255,255,.2)", color: "#fff" }}>
            <FileText size={15} strokeWidth={1.6} />
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: ".98rem", marginBottom: 4 }}>Need to update your firm profile?</p>
            <p style={{ color: "rgba(255,255,255,.78)", fontSize: ".9rem", lineHeight: 1.6, marginBottom: 16 }}>
              Your public profile drives which clients see your firm in match results. To update your
              practice areas, billing structure, team members, or any other details, reach out to the
              LWYRD team and we&apos;ll make the changes promptly.
            </p>
            <Link href="/contact" className="btn" style={{ background: "#fff", color: "var(--navy)" }}>
              Contact the LWYRD Team <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Inquiries ───────────────────────────────────────────────────────────

function InquiriesTab() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span className="app-section-label">Inbound Inquiries</span>
          <p style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: 2 }}>Clients whose intake results matched your firm profile</p>
        </div>
        <span className="chip">0 new</span>
      </div>

      <EmptyState
        icon={Users}
        title="No inquiries yet"
        body="When a client's intake answers match your firm's profile, their inquiry will appear here for your review. Keep your profile current to maximize your visibility."
        cta={
          <Link href="/contact" className="app-link" style={{ marginTop: 8 }}>
            Questions about matching? <ArrowRight size={13} />
          </Link>
        }
      />
    </div>
  );
}

// ─── Tab: Engagements ─────────────────────────────────────────────────────────

function EngagementsTab() {
  const [subTab, setSubTab] = useState<"active" | "past">("active");

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="app-seg">
        {(["active", "past"] as const).map((t) => (
          <button key={t} onClick={() => setSubTab(t)} className={subTab === t ? "is-active" : ""} style={{ textTransform: "capitalize" }}>
            {t === "active" ? "Active" : "Past"}
          </button>
        ))}
      </div>

      {subTab === "active" ? (
        <EmptyState
          icon={Briefcase}
          title="No active engagements"
          body="Once you accept a client introduction and begin working together, the engagement details, communications, key documents, and status, will be tracked here."
        />
      ) : (
        <EmptyState
          icon={Clock}
          title="No past engagements"
          body="Completed client engagements with their outcomes, key documents, and correspondence history will be archived here."
        />
      )}
    </div>
  );
}

// ─── Main Portal ──────────────────────────────────────────────────────────────

const HEADINGS: Record<TabId, { title: string; sub: string }> = {
  overview: { title: "", sub: "Your firm dashboard, manage your profile, inquiries, and client engagements." },
  profile: { title: "Firm Profile", sub: "Your public listing on LWYRD. Contact us to request updates." },
  inquiries: { title: "Client Inquiries", sub: "Potential clients whose intake results matched your firm." },
  engagements: { title: "Engagements", sub: "Active and past client engagements and their details." },
};

function PortalContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const firmName = user?.name ?? "Your Firm";
  const heading = HEADINGS[activeTab];

  return (
    <div className="lwyrd-ds ds-page">
      <MarketingNav />

      <main className="app-shell">
        <div className="app-layout">
          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="app-side">
            <div className="app-tabs">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`app-tab${activeTab === id ? " is-active" : ""}`}>
                  <Icon size={14} strokeWidth={1.6} />
                  {label}
                </button>
              ))}
            </div>

            <div className="app-side-card">
              <div className="app-side-id">
                <div className="lbl">Firm Portal</div>
                <div className="val">{firmName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22a558" }} />
                  <span style={{ fontSize: ".78rem", color: "#0f7a3d", fontWeight: 600 }}>Live</span>
                </div>
              </div>
              <nav className="app-side-nav">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)} className={`app-side-link${activeTab === id ? " is-active" : ""}`}>
                    <Icon size={16} strokeWidth={1.6} />
                    {label}
                  </button>
                ))}
              </nav>
              <div className="app-side-sep" />
              <Link href="/account" className="app-side-link">
                <Settings size={15} strokeWidth={1.6} /> Account Settings
              </Link>
            </div>
          </aside>

          {/* ── Main Content ─────────────────────────────────── */}
          <div className="app-main">
            <motion.div key={`h-${activeTab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="app-head">
              <h1>{activeTab === "overview" ? firmName : heading.title}</h1>
              <p>{heading.sub}</p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease }}>
                {activeTab === "overview" && <OverviewTab firmName={firmName} setActiveTab={setActiveTab} />}
                {activeTab === "profile" && <FirmProfileTab firmName={firmName} />}
                {activeTab === "inquiries" && <InquiriesTab />}
                {activeTab === "engagements" && <EngagementsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

export default function PortalPage() {
  return (
    <AuthGuard>
      <PortalContent />
    </AuthGuard>
  );
}
