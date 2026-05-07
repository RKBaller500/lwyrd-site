"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

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
  top_matches?: { firmId: string; firmName: string; score: number }[];
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
    <div className="bg-white rounded-2xl border border-[#ddd7cc] p-5 flex flex-col gap-1">
      <span className="text-3xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
        {value}
      </span>
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</span>
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
    <div className="bg-white border border-[#ddd7cc] rounded-3xl p-12 flex flex-col items-center text-center gap-3">
      <Icon size={32} className="text-slate-200" strokeWidth={1.2} />
      <p className="text-slate-700 font-medium text-sm">{title}</p>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed">{body}</p>
      {cta}
    </div>
  );
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
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white border border-[#ddd7cc] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={intakes.length} label="Intakes" />
        <StatCard value={savedFirms.length} label="Saved Firms" />
        <StatCard value={0} label="Engagements" />
      </div>

      {/* Active results banner */}
      {currentResults && (
        <div className="bg-[#002452] rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white text-sm font-medium" style={lora}>
              {currentResults.categoryName || "Latest intake"}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {currentResults.count} matched {currentResults.count === 1 ? "firm" : "firms"} ready to review
            </p>
          </div>
          <Link
            href="/results"
            className="shrink-0 inline-flex items-center gap-1.5 bg-white text-[#002452] text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            View Results
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Recent intakes */}
      {intakes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Recent Intakes</h3>
            <button
              onClick={() => setActiveTab("matches")}
              className="text-xs text-[#002452] font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="bg-white border border-[#ddd7cc] rounded-2xl overflow-hidden">
            {intakes.slice(0, 3).map((intake, i) => (
              <div
                key={intake.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors ${
                  i < Math.min(intakes.length, 3) - 1 ? "border-b border-[#ddd7cc]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#002452]/8 flex items-center justify-center shrink-0">
                    <Scale size={14} className="text-[#002452]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[#002452] text-sm font-medium leading-snug" style={lora}>
                      {intake.category_label ?? intake.category_slug}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {intake.track ? `${intake.track.replace(/_/g, " ")} · ` : ""}
                      {new Date(intake.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/results/${intake.id}`}
                  className="text-xs text-[#002452] font-medium hover:opacity-70 transition-opacity shrink-0 flex items-center gap-1"
                >
                  Results <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent saved firms */}
      {savedFirms.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Saved Firms</h3>
            <button
              onClick={() => setActiveTab("saved")}
              className="text-xs text-[#002452] font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedFirms.slice(0, 4).map((sf) => (
              <Link
                key={sf.firm_id}
                href={`/firms/${sf.firm_id}`}
                className="bg-white border border-[#ddd7cc] rounded-2xl p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#002452]/8 flex items-center justify-center shrink-0">
                  <Bookmark size={14} className="text-[#002452]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[#002452] text-sm font-medium truncate" style={lora}>
                    {sf.firms?.name ?? "Law Firm"}
                  </p>
                  {sf.firms?.location && (
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {sf.firms.location}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state if nothing at all */}
      {intakes.length === 0 && savedFirms.length === 0 && !currentResults && (
        <EmptyState
          icon={Scale}
          title="Your dashboard is empty"
          body="Complete an intake to get matched with law firms that fit your needs."
          cta={
            <button
              onClick={() => router.push("/intake/start")}
              className="mt-2 inline-flex items-center gap-2 bg-[#002452] text-white text-sm font-medium px-5 py-2.5 rounded-2xl hover:opacity-90 transition-opacity"
            >
              Start Intake
              <ArrowRight size={14} />
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

  if (loading) {
    return <div className="h-40 rounded-2xl bg-white border border-[#ddd7cc] animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {currentResults && (
        <div className="bg-[#002452] rounded-2xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1">Active Session</p>
            <p className="text-white font-medium" style={lora}>
              {currentResults.categoryName || "Latest intake"}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {currentResults.count} matched {currentResults.count === 1 ? "firm" : "firms"}
            </p>
          </div>
          <Link
            href="/results"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-[#002452] text-sm font-semibold px-5 py-2.5 rounded-2xl hover:opacity-90 transition-opacity"
          >
            View Results
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {intakes.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No intakes yet"
          body="Complete an intake to get matched with law firms tailored to your situation."
          cta={
            <button
              onClick={() => router.push("/intake/start")}
              className="mt-2 inline-flex items-center gap-2 bg-[#002452] text-white text-sm font-medium px-5 py-2.5 rounded-2xl hover:opacity-90 transition-opacity"
            >
              Start Intake
              <ArrowRight size={14} />
            </button>
          }
        />
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Intake History
          </h3>
          <div className="bg-white border border-[#ddd7cc] rounded-2xl overflow-hidden">
            {intakes.map((intake, i) => (
              <div
                key={intake.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors ${
                  i < intakes.length - 1 ? "border-b border-[#ddd7cc]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#002452]/8 flex items-center justify-center shrink-0">
                    <Scale size={15} className="text-[#002452]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[#002452] text-sm font-medium" style={lora}>
                      {intake.category_label ?? intake.category_slug}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {intake.track ? (
                        <span className="capitalize">{intake.track.replace(/_/g, " ")} · </span>
                      ) : null}
                      {new Date(intake.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {intake.top_matches && intake.top_matches.length > 0 && (
                    <span className="hidden sm:inline text-xs text-slate-400">
                      {intake.top_matches.length} matches
                    </span>
                  )}
                  <Link
                    href={`/results/${intake.id}`}
                    className="text-xs text-[#002452] font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
                  >
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-white border border-[#ddd7cc] animate-pulse" />
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
          <button
            onClick={() => router.push("/intake/start")}
            className="mt-2 inline-flex items-center gap-2 text-sm text-[#002452] font-medium hover:opacity-70 transition-opacity"
          >
            Start a new intake <ArrowRight size={13} />
          </button>
        }
      />
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-4">{savedFirms.length} saved {savedFirms.length === 1 ? "firm" : "firms"}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savedFirms.map(({ firm_id, firms }) => {
          const firm = firms;
          if (!firm) return null;
          return (
            <div
              key={firm_id}
              className="bg-white border border-[#ddd7cc] rounded-2xl p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {firm.verified && (
                    <div className="inline-flex items-center gap-1 text-[#002452] text-xs font-medium mb-1.5">
                      <Shield size={10} />
                      LWYRD Verified
                    </div>
                  )}
                  <h3 className="text-[#002452] text-base font-medium leading-snug truncate" style={lora}>
                    {firm.name}
                  </h3>
                  {firm.tagline && (
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{firm.tagline}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl text-[#002452]" style={lora}>
                    {firm.overall_score}
                  </div>
                  <div className="text-xs text-slate-300">score</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                {firm.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {firm.location}
                  </span>
                )}
                {firm.size && (
                  <span>{sizeLabels[firm.size] ?? firm.size} firm</span>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleUnsave(firm_id)}
                  title="Remove from saved"
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#ddd7cc] text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <BookmarkX size={15} strokeWidth={1.5} />
                </button>
                <Link
                  href={`/firms/${firm_id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  View Profile
                  <ArrowRight size={13} />
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
    <div className="space-y-5">
      {/* Sub-tab toggle */}
      <div className="flex gap-1 bg-white border border-[#ddd7cc] rounded-xl p-1 w-fit">
        {(["active", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              subTab === t
                ? "bg-[#002452] text-white"
                : "text-slate-500 hover:text-[#002452]"
            }`}
          >
            {t === "active" ? "Active" : "Past"}
          </button>
        ))}
      </div>

      {subTab === "active" ? (
        <EmptyState
          icon={Briefcase}
          title="No active engagements"
          body="Once you connect with a firm and begin working together, your active engagement details — communications, key documents, and milestones — will appear here."
          cta={
            <button
              onClick={() => router.push("/intake/start")}
              className="mt-2 inline-flex items-center gap-2 text-sm text-[#002452] font-medium hover:opacity-70 transition-opacity"
            >
              Get matched with a firm <ArrowRight size={13} />
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
          .select("id, category_slug, category_label, created_at, track, top_matches")
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

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="lg:w-56 shrink-0">
            {/* Mobile: horizontal scroll tabs */}
            <div className="flex lg:hidden gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    activeTab === id
                      ? "bg-[#002452] text-white"
                      : "bg-white border border-[#ddd7cc] text-slate-500 hover:text-[#002452]"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop: vertical sidebar */}
            <div className="hidden lg:flex flex-col bg-white border border-[#ddd7cc] rounded-2xl p-3 sticky top-6">
              {/* User greeting */}
              <div className="px-3 py-3 mb-2 border-b border-[#f0ece5]">
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="text-sm text-[#002452] font-semibold mt-0.5 truncate" style={lora}>
                  {firstName}
                </p>
              </div>

              {/* Nav items */}
              <nav className="space-y-0.5">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                      activeTab === id
                        ? "bg-[#002452] text-white"
                        : "text-slate-500 hover:bg-[#f5f4f0] hover:text-[#002452]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                    {label}
                    {id === "saved" && savedFirms.length > 0 && (
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === id ? "bg-white/20 text-white" : "bg-[#002452]/10 text-[#002452]"
                      }`}>
                        {savedFirms.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-3 border-t border-[#f0ece5]" />

              {/* Start new intake CTA */}
              <button
                onClick={() => router.push("/intake/start")}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={14} strokeWidth={2} />
                New Intake
              </button>

              {/* Account settings link */}
              <Link
                href="/account"
                className="mt-1 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-[#002452] hover:bg-[#f5f4f0] transition-colors"
              >
                <Settings size={14} strokeWidth={1.5} />
                Account Settings
              </Link>
            </div>
          </aside>

          {/* ── Main Content ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Page header */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
              className="mb-6"
            >
              {activeTab === "overview" && (
                <>
                  <h1 className="text-3xl sm:text-4xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
                    Welcome back, {firstName}.
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Here&apos;s an overview of your LWYRD activity.
                  </p>
                </>
              )}
              {activeTab === "matches" && (
                <>
                  <h1 className="text-3xl sm:text-4xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
                    My Matches
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Your intake submissions and matched law firms.
                  </p>
                </>
              )}
              {activeTab === "saved" && (
                <>
                  <h1 className="text-3xl sm:text-4xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
                    Saved Firms
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Firms you&apos;ve bookmarked from your match results.
                  </p>
                </>
              )}
              {activeTab === "engagements" && (
                <>
                  <h1 className="text-3xl sm:text-4xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
                    Engagements
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Your active and past legal engagements.
                  </p>
                </>
              )}
            </motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease }}
              >
                {activeTab === "overview" && (
                  <OverviewTab
                    intakes={intakes}
                    savedFirms={savedFirms}
                    currentResults={currentResults}
                    loading={loading}
                    setActiveTab={setActiveTab}
                  />
                )}
                {activeTab === "matches" && (
                  <MatchesTab
                    intakes={intakes}
                    currentResults={currentResults}
                    loading={loading}
                  />
                )}
                {activeTab === "saved" && (
                  <SavedFirmsTab
                    savedFirms={savedFirms}
                    setSavedFirms={setSavedFirms}
                    loading={loading}
                  />
                )}
                {activeTab === "engagements" && <EngagementsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
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
