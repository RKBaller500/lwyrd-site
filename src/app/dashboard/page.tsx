"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/lwyrd-ds.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { unsaveFirm } from "@/lib/actions/savedFirms";
import {
  LayoutDashboard,
  Scale,
  Bookmark,
  Briefcase,
  Plus,
  ArrowRight,
  MapPin,
  Shield,
  Clock,
  BookmarkX,
  ChevronRight,
  Settings,
} from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

type TabId = "overview" | "matches" | "saved" | "engagements";

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "matches", label: "My Matches", icon: Scale },
  { id: "saved", label: "Saved Firms", icon: Bookmark },
  { id: "engagements", label: "Engagements", icon: Briefcase },
];

interface IntakeRecord {
  id: string;
  category_slug: string;
  category_label?: string;
  created_at: string;
  track?: string;
  matches?: { match_rank: number }[];
}

interface SavedFirmRecord {
  firm_id: string;
  saved_at: string;
  firms?: {
    id: string;
    name: string;
    tagline: string;
    location: string;
    size: string;
    overall_score: number;
    verified: boolean;
  };
}

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size",
  large: "Large",
};

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="app-stat">
      <span className="n">{value}</span>
      <span className="l">{label}</span>
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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({
  intakes,
  savedFirms,
  currentResults,
  loading,
  setActiveTab,
}: {
  intakes: IntakeRecord[];
  savedFirms: SavedFirmRecord[];
  currentResults: { count: number; categoryName: string } | null;
  loading: boolean;
  setActiveTab: (t: TabId) => void;
}) {
  const router = useRouter();

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="app-skel" style={{ height: 80 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div className="app-stats">
        <StatCard value={intakes.length} label="Intakes" />
        <StatCard value={savedFirms.length} label="Saved Firms" />
        <StatCard value={0} label="Engagements" />
      </div>

      {currentResults && (
        <div className="navy-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 600, fontFamily: "var(--display)" }}>{currentResults.categoryName || "Latest intake"}</p>
            <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".85rem", marginTop: 2 }}>
              {currentResults.count} matched {currentResults.count === 1 ? "firm" : "firms"} ready to review
            </p>
          </div>
          <Link href="/results" className="btn" style={{ background: "#fff", color: "var(--navy)" }}>
            View Results <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {intakes.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="app-section-label">Recent Intakes</span>
            <button onClick={() => setActiveTab("matches")} className="app-link">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="app-list">
            {intakes.slice(0, 3).map((intake) => (
              <div key={intake.id} className="app-row">
                <div className="app-row-lead">
                  <span className="icon-box" style={{ width: 34, height: 34 }}>
                    <Scale size={15} strokeWidth={1.6} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--display)", fontSize: ".92rem" }}>
                      {intake.category_label ?? intake.category_slug}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>
                      {intake.track ? <span style={{ textTransform: "capitalize" }}>{intake.track.replace(/_/g, " ")} · </span> : null}
                      {fmtDate(intake.created_at)}
                    </p>
                  </div>
                </div>
                <Link href={`/results/${intake.id}`} className="app-link">
                  Results <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedFirms.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="app-section-label">Saved Firms</span>
            <button onClick={() => setActiveTab("saved")} className="app-link">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {savedFirms.slice(0, 4).map((sf) => (
              <Link key={sf.firm_id} href={`/firms/${sf.firm_id}`} className="ds-card ds-card-hover" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span className="icon-box" style={{ width: 36, height: 36 }}>
                  <Bookmark size={15} strokeWidth={1.6} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--display)", fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {sf.firms?.name ?? "Law Firm"}
                  </p>
                  {sf.firms?.location && (
                    <p style={{ color: "var(--muted)", fontSize: ".78rem", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <MapPin size={10} /> {sf.firms.location}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {intakes.length === 0 && savedFirms.length === 0 && !currentResults && (
        <EmptyState
          icon={Scale}
          title="Your dashboard is empty"
          body="Complete an intake to get matched with law firms that fit your needs."
          cta={
            <button onClick={() => router.push("/intake/start")} className="btn btn-primary" style={{ marginTop: 8 }}>
              Start Intake <ArrowRight size={14} />
            </button>
          }
        />
      )}
    </div>
  );
}

// ─── Tab: Matches ─────────────────────────────────────────────────────────────

function MatchesTab({
  intakes,
  currentResults,
  loading,
}: {
  intakes: IntakeRecord[];
  currentResults: { count: number; categoryName: string } | null;
  loading: boolean;
}) {
  const router = useRouter();

  if (loading) return <div className="app-skel" style={{ height: 160 }} />;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {currentResults && (
        <div className="navy-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".72rem", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Active Session</p>
            <p style={{ fontWeight: 600, fontFamily: "var(--display)" }}>{currentResults.categoryName || "Latest intake"}</p>
            <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".82rem", marginTop: 4 }}>
              {currentResults.count} matched {currentResults.count === 1 ? "firm" : "firms"}
            </p>
          </div>
          <Link href="/results" className="btn" style={{ background: "#fff", color: "var(--navy)" }}>
            View Results <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {intakes.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No intakes yet"
          body="Complete an intake to get matched with law firms tailored to your situation."
          cta={
            <button onClick={() => router.push("/intake/start")} className="btn btn-primary" style={{ marginTop: 8 }}>
              Start Intake <ArrowRight size={14} />
            </button>
          }
        />
      ) : (
        <div>
          <span className="app-section-label" style={{ display: "block", marginBottom: 12 }}>Intake History</span>
          <div className="app-list">
            {intakes.map((intake) => (
              <div key={intake.id} className="app-row">
                <div className="app-row-lead">
                  <span className="icon-box" style={{ width: 36, height: 36 }}>
                    <Scale size={16} strokeWidth={1.6} />
                  </span>
                  <div>
                    <p style={{ fontFamily: "var(--display)", fontSize: ".92rem" }}>{intake.category_label ?? intake.category_slug}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>
                      {intake.track ? <span style={{ textTransform: "capitalize" }}>{intake.track.replace(/_/g, " ")} · </span> : null}
                      {fmtDate(intake.created_at)}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                  {intake.matches && intake.matches.length > 0 && (
                    <span style={{ color: "var(--muted)", fontSize: ".78rem" }} className="hide-sm">{intake.matches.length} matches</span>
                  )}
                  <Link href={`/results/${intake.id}`} className="app-link">
                    Results <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Saved Firms ─────────────────────────────────────────────────────────

function SavedFirmsTab({
  savedFirms,
  setSavedFirms,
  loading,
}: {
  savedFirms: SavedFirmRecord[];
  setSavedFirms: React.Dispatch<React.SetStateAction<SavedFirmRecord[]>>;
  loading: boolean;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleUnsave = (firmId: string) => {
    setSavedFirms((prev) => prev.filter((f) => f.firm_id !== firmId));
    startTransition(async () => {
      await unsaveFirm(firmId);
    });
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="app-skel" style={{ height: 150 }} />
        ))}
      </div>
    );
  }

  if (savedFirms.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="No saved firms yet"
        body="When you find a firm you like in your match results, save it here for easy reference."
        cta={
          <button onClick={() => router.push("/intake/start")} className="app-link" style={{ marginTop: 8 }}>
            Start a new intake <ArrowRight size={13} />
          </button>
        }
      />
    );
  }

  return (
    <div>
      <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 16 }}>
        {savedFirms.length} saved {savedFirms.length === 1 ? "firm" : "firms"}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {savedFirms.map(({ firm_id, firms }) => {
          const firm = firms;
          if (!firm) return null;
          return (
            <div key={firm_id} className="ds-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {firm.verified && (
                    <div className="chip" style={{ color: "var(--navy)", background: "var(--navy-tint)", borderColor: "var(--navy-tint-2)", marginBottom: 8 }}>
                      <Shield size={11} /> LWYRD Verified
                    </div>
                  )}
                  <h3 style={{ fontSize: "1.02rem", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firm.name}</h3>
                  {firm.tagline && <p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 4 }}>{firm.tagline}</p>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "1.5rem", color: "var(--navy)" }}>{firm.overall_score}</div>
                  <div style={{ color: "var(--faint)", fontSize: ".72rem" }}>score</div>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, color: "var(--muted)", fontSize: ".78rem" }}>
                {firm.location && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {firm.location}</span>}
                {firm.size && <span>{sizeLabels[firm.size] ?? firm.size} firm</span>}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <button
                  onClick={() => handleUnsave(firm_id)}
                  title="Remove from saved"
                  className="btn btn-ghost"
                  style={{ padding: 0, width: 42, height: 42, justifyContent: "center", flexShrink: 0 }}
                >
                  <BookmarkX size={16} strokeWidth={1.6} />
                </button>
                <Link href={`/firms/${firm_id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  View Profile <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Engagements ─────────────────────────────────────────────────────────

function EngagementsTab() {
  const [subTab, setSubTab] = useState<"active" | "past">("active");
  const router = useRouter();

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
          body="Once you connect with a firm and begin working together, your active engagement details, communications, key documents, and milestones, will appear here."
          cta={
            <button onClick={() => router.push("/intake/start")} className="app-link" style={{ marginTop: 8 }}>
              Start a new intake <ArrowRight size={13} />
            </button>
          }
        />
      ) : (
        <EmptyState
          icon={Clock}
          title="No past engagements"
          body="Completed engagements with their outcomes, key details, and correspondence will be archived here for your records."
        />
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const HEADINGS: Record<TabId, { title: string; sub: string }> = {
  overview: { title: "", sub: "Here's an overview of your LWYRD activity." },
  matches: { title: "My Matches", sub: "Your intake submissions and matched law firms." },
  saved: { title: "Saved Firms", sub: "Firms you've bookmarked from your match results." },
  engagements: { title: "Engagements", sub: "Your active and past legal engagements." },
};

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [intakes, setIntakes] = useState<IntakeRecord[]>([]);
  const [savedFirms, setSavedFirms] = useState<SavedFirmRecord[]>([]);
  const [currentResults, setCurrentResults] = useState<{ count: number; categoryName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!user) return;

    const raw = sessionStorage.getItem("lwyrd_results");
    const name = sessionStorage.getItem("lwyrd_category_name") ?? "";
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCurrentResults({ count: parsed.length, categoryName: name });
      } catch {
        // ignore
      }
    }

    async function load() {
      const [intakesRes, savedRes] = await Promise.all([
        supabase
          .from("intake_submissions")
          .select("id, category_slug, category_label, created_at, track, matches(match_rank)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_firms")
          .select("firm_id, saved_at, firms(id, name, tagline, location, size, overall_score, verified)")
          .eq("user_id", user!.id)
          .order("saved_at", { ascending: false }),
      ]);

      const fetchedIntakes = (intakesRes.data ?? []) as IntakeRecord[];
      setIntakes(fetchedIntakes);

      if (fetchedIntakes.length === 0) {
        sessionStorage.removeItem("lwyrd_results");
        sessionStorage.removeItem("lwyrd_category");
        sessionStorage.removeItem("lwyrd_category_name");
        sessionStorage.removeItem("lwyrd_match_scores");
        setCurrentResults(null);
      }

      if (savedRes.data) setSavedFirms(savedRes.data as unknown as SavedFirmRecord[]);
      setLoading(false);
    }

    load();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const heading = HEADINGS[activeTab];

  return (
    <div className="lwyrd-ds ds-page">
      <MarketingNav />

      <main className="app-shell">
        <div className="app-layout">
          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="app-side">
            {/* Mobile tab strip */}
            <div className="app-tabs">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`app-tab${activeTab === id ? " is-active" : ""}`}>
                  <Icon size={14} strokeWidth={1.6} />
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop sidebar */}
            <div className="app-side-card">
              <div className="app-side-id">
                <div className="lbl">Signed in as</div>
                <div className="val">{firstName}</div>
              </div>
              <nav className="app-side-nav">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)} className={`app-side-link${activeTab === id ? " is-active" : ""}`}>
                    <Icon size={16} strokeWidth={1.6} />
                    {label}
                    {id === "saved" && savedFirms.length > 0 && <span className="count">{savedFirms.length}</span>}
                  </button>
                ))}
              </nav>
              <div className="app-side-sep" />
              <button onClick={() => router.push("/intake/start")} className="app-side-cta">
                <Plus size={15} strokeWidth={2} /> New Intake
              </button>
              <Link href="/account" className="app-side-link" style={{ marginTop: 4 }}>
                <Settings size={15} strokeWidth={1.6} /> Account Settings
              </Link>
            </div>
          </aside>

          {/* ── Main Content ─────────────────────────────────── */}
          <div className="app-main">
            <motion.div key={`h-${activeTab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="app-head">
              <h1>{activeTab === "overview" ? `Welcome back, ${firstName}.` : heading.title}</h1>
              <p>{heading.sub}</p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease }}>
                {activeTab === "overview" && (
                  <OverviewTab intakes={intakes} savedFirms={savedFirms} currentResults={currentResults} loading={loading} setActiveTab={setActiveTab} />
                )}
                {activeTab === "matches" && <MatchesTab intakes={intakes} currentResults={currentResults} loading={loading} />}
                {activeTab === "saved" && <SavedFirmsTab savedFirms={savedFirms} setSavedFirms={setSavedFirms} loading={loading} />}
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

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
