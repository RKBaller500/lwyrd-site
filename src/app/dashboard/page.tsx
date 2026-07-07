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
import { unsaveFirm } from "@/lib/actions/savedFirms";
import { getDashboardData, type DashboardIntake, type DashboardSavedFirm } from "@/lib/actions/dashboard";
import {
  LayoutDashboard,
  Scale,
  Bookmark,
  Briefcase,
  Plus,
  ArrowRight,
  MapPin,
  Shield,
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

function UnlockBadge({ unlocked }: { unlocked: boolean }) {
  return (
    <span className={`chip ${unlocked ? "is-unlocked" : ""}`} style={unlocked ? { color: "#047857", background: "#ecfdf5", borderColor: "#a7f3d0" } : undefined}>
      {unlocked ? "Unlocked" : "Locked"}
    </span>
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
  unlockCreditsAvailable,
  loading,
  error,
  setActiveTab,
}: {
  intakes: DashboardIntake[];
  savedFirms: DashboardSavedFirm[];
  unlockCreditsAvailable: number;
  loading: boolean;
  error: string | null;
  setActiveTab: (t: TabId) => void;
}) {
  const router = useRouter();
  const latestIntake = intakes[0] ?? null;

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="app-skel" style={{ height: 80 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Scale}
        title="We couldn't load your dashboard"
        body={error}
        cta={
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: 8 }}>
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div className="app-stats">
        <StatCard value={intakes.length} label="Intakes" />
        <StatCard value={savedFirms.length} label="Saved Firms" />
        <StatCard value={unlockCreditsAvailable} label="Unlock Credits" />
      </div>

      {latestIntake && (
        <div className="navy-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 600, fontFamily: "var(--display)" }}>{latestIntake.categoryLabel || "Latest intake"}</p>
            <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".85rem", marginTop: 2 }}>
              {latestIntake.matchCount} matched {latestIntake.matchCount === 1 ? "firm" : "firms"} ready to review
              {latestIntake.topScore !== null ? ` · Top score ${latestIntake.topScore}%` : ""}
              {latestIntake.unlocked ? " · Unlocked" : " · Locked until unlocked"}
            </p>
          </div>
          <Link href={`/results/${latestIntake.id}`} className="btn" style={{ background: "#fff", color: "var(--navy)" }}>
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
                      {intake.categoryLabel}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>
                      {intake.track ? <span style={{ textTransform: "capitalize" }}>{intake.track.replace(/_/g, " ")} · </span> : null}
                      {fmtDate(intake.createdAt)}
                      {intake.matchCount > 0 ? ` · ${intake.matchCount} ${intake.matchCount === 1 ? "match" : "matches"}` : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <UnlockBadge unlocked={intake.unlocked} />
                  <Link href={`/results/${intake.id}`} className="app-link">
                    Results <ChevronRight size={12} />
                  </Link>
                </div>
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
            {savedFirms.slice(0, 4).map((sf) => {
              const content = (
                <>
                  <span className="icon-box" style={{ width: 36, height: 36 }}>
                    <Bookmark size={15} strokeWidth={1.6} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--display)", fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {sf.firm?.name ?? "Unavailable firm"}
                    </p>
                    {sf.firm?.location ? (
                      <p style={{ color: "var(--muted)", fontSize: ".78rem", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <MapPin size={10} /> {sf.firm.location}
                      </p>
                    ) : null}
                  </div>
                </>
              );

              return sf.firm ? (
                <Link key={sf.firmId} href={`/firms/${sf.firmId}`} className="ds-card ds-card-hover" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  {content}
                </Link>
              ) : (
                <div key={sf.firmId} className="ds-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {intakes.length === 0 && savedFirms.length === 0 && (
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
  unlockCreditsAvailable,
  loading,
  error,
}: {
  intakes: DashboardIntake[];
  unlockCreditsAvailable: number;
  loading: boolean;
  error: string | null;
}) {
  const router = useRouter();
  const latestIntake = intakes[0] ?? null;

  if (loading) return <div className="app-skel" style={{ height: 160 }} />;
  if (error) {
    return (
      <EmptyState
        icon={Scale}
        title="We couldn't load your matches"
        body={error}
        cta={
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: 8 }}>
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {unlockCreditsAvailable > 0 && (
        <div className="ds-card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700 }}>You have {unlockCreditsAvailable} unused {unlockCreditsAvailable === 1 ? "unlock credit" : "unlock credits"}</p>
            <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 2 }}>Open any locked intake and apply a credit from the unlock page.</p>
          </div>
          <Link href="/intake/start" className="app-link">Start another intake <ArrowRight size={13} /></Link>
        </div>
      )}

      {latestIntake && (
        <div className="navy-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".72rem", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Latest Intake</p>
            <p style={{ fontWeight: 600, fontFamily: "var(--display)" }}>{latestIntake.categoryLabel || "Latest intake"}</p>
            <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".82rem", marginTop: 4 }}>
              {latestIntake.matchCount} matched {latestIntake.matchCount === 1 ? "firm" : "firms"}
              {latestIntake.topScore !== null ? ` · Top score ${latestIntake.topScore}%` : ""}
              {latestIntake.unlocked ? " · Unlocked" : " · Locked"}
            </p>
          </div>
          <Link href={`/results/${latestIntake.id}`} className="btn" style={{ background: "#fff", color: "var(--navy)" }}>
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
                    <p style={{ fontFamily: "var(--display)", fontSize: ".92rem" }}>{intake.categoryLabel}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>
                      {intake.track ? <span style={{ textTransform: "capitalize" }}>{intake.track.replace(/_/g, " ")} · </span> : null}
                      {fmtDate(intake.createdAt)}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                  {intake.matchCount > 0 && (
                    <span style={{ color: "var(--muted)", fontSize: ".78rem" }} className="hide-sm">
                      {intake.matchCount} {intake.matchCount === 1 ? "match" : "matches"}
                      {intake.topScore !== null ? ` · ${intake.topScore}% top score` : ""}
                    </span>
                  )}
                  <UnlockBadge unlocked={intake.unlocked} />
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
  error,
}: {
  savedFirms: DashboardSavedFirm[];
  setSavedFirms: React.Dispatch<React.SetStateAction<DashboardSavedFirm[]>>;
  loading: boolean;
  error: string | null;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleUnsave = (firmId: string) => {
    setSavedFirms((prev) => prev.filter((f) => f.firmId !== firmId));
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

  if (error) {
    return (
      <EmptyState
        icon={Bookmark}
        title="We couldn't load your saved firms"
        body={error}
        cta={
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: 8 }}>
            Try again
          </button>
        }
      />
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
        {savedFirms.map(({ firmId, firm }) => {
          return (
            <div key={firmId} className="ds-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {firm?.verified && (
                    <div className="chip" style={{ color: "var(--navy)", background: "var(--navy-tint)", borderColor: "var(--navy-tint-2)", marginBottom: 8 }}>
                      <Shield size={11} /> LWYRD Verified
                    </div>
                  )}
                  <h3 style={{ fontSize: "1.02rem", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {firm?.name ?? "Unavailable firm"}
                  </h3>
                  {firm?.tagline && <p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 4 }}>{firm.tagline}</p>}
                  {!firm && <p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 4 }}>This saved firm is no longer available.</p>}
                </div>
                {firm?.overallScore !== null && firm?.overallScore !== undefined && (
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--display)", fontSize: "1.5rem", color: "var(--navy)" }}>{firm.overallScore}</div>
                    <div style={{ color: "var(--faint)", fontSize: ".72rem" }}>score</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, color: "var(--muted)", fontSize: ".78rem" }}>
                {firm?.location && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {firm.location}</span>}
                {firm?.size && <span>{sizeLabels[firm.size] ?? firm.size} firm</span>}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <button
                  onClick={() => handleUnsave(firmId)}
                  title="Remove from saved"
                  className="btn btn-ghost"
                  style={{ padding: 0, width: 42, height: 42, justifyContent: "center", flexShrink: 0 }}
                >
                  <BookmarkX size={16} strokeWidth={1.6} />
                </button>
                {firm ? <Link href={`/firms/${firmId}`} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  View Profile <ArrowRight size={13} />
                </Link> : null}
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
  const router = useRouter();

  return (
    <EmptyState
      icon={Briefcase}
      title="Engagement tracking is coming later"
      body="For now, your dashboard focuses on the parts that are live: completed intakes, match results, and saved firms."
      cta={
        <button onClick={() => router.push("/intake/start")} className="btn btn-primary" style={{ marginTop: 8 }}>
          Start Intake <ArrowRight size={14} />
        </button>
      }
    />
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const HEADINGS: Record<TabId, { title: string; sub: string }> = {
  overview: { title: "", sub: "Here's an overview of your LWYRD activity." },
  matches: { title: "My Matches", sub: "Your intake submissions and matched law firms." },
  saved: { title: "Saved Firms", sub: "Firms you've bookmarked from your match results." },
  engagements: { title: "Engagements", sub: "Engagement tracking is not live yet, but your intakes and saved firms are ready here." },
};

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [intakes, setIntakes] = useState<DashboardIntake[]>([]);
  const [savedFirms, setSavedFirms] = useState<DashboardSavedFirm[]>([]);
  const [unlockCreditsAvailable, setUnlockCreditsAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      const result = await getDashboardData();
      if (cancelled) return;
      if (result.error || !result.data) {
        setLoadError(result.error ?? "Something went wrong while loading your dashboard.");
        setIntakes([]);
        setSavedFirms([]);
        setUnlockCreditsAvailable(0);
      } else {
        setIntakes(result.data.intakes);
        setSavedFirms(result.data.savedFirms);
        setUnlockCreditsAvailable(result.data.unlockCreditsAvailable);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

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
                  <OverviewTab
                    intakes={intakes}
                    savedFirms={savedFirms}
                    unlockCreditsAvailable={unlockCreditsAvailable}
                    loading={loading}
                    error={loadError}
                    setActiveTab={setActiveTab}
                  />
                )}
                {activeTab === "matches" && <MatchesTab intakes={intakes} unlockCreditsAvailable={unlockCreditsAvailable} loading={loading} error={loadError} />}
                {activeTab === "saved" && <SavedFirmsTab savedFirms={savedFirms} setSavedFirms={setSavedFirms} loading={loading} error={loadError} />}
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
