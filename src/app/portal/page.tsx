"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

type TabId = "overview" | "profile" | "inquiries" | "engagements";

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Firm Profile", icon: Building2 },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
  { id: "engagements", label: "Engagements", icon: Briefcase },
];

function StatCard({ value, label, sublabel }: { value: number | string; label: string; sublabel?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ddd7cc] p-5 flex flex-col gap-1">
      <span className="text-3xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
        {value}
      </span>
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</span>
      {sublabel && <span className="text-xs text-slate-300">{sublabel}</span>}
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
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed">{body}</p>
      {cta}
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ firmName, setActiveTab }: { firmName: string; setActiveTab: (t: TabId) => void }) {
  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={0} label="Inquiries" sublabel="New this week" />
        <StatCard value={0} label="Active" sublabel="Engagements" />
        <StatCard value={0} label="Completed" sublabel="Engagements" />
      </div>

      {/* Status card */}
      <div className="bg-white border border-[#ddd7cc] rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[#002452] font-semibold text-sm" style={lora}>
            {firmName} is live on LWYRD
          </p>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            Your firm profile is active. Clients whose intake answers match your practice areas, size,
            and billing preferences will see your listing in their results.
          </p>
          <button
            onClick={() => setActiveTab("profile")}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#002452] font-medium hover:opacity-70 transition-opacity"
          >
            View firm profile <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: Inbox,
              label: "Client Inquiries",
              desc: "Review incoming client matches",
              onClick: () => setActiveTab("inquiries"),
            },
            {
              icon: Edit3,
              label: "Update Firm Profile",
              desc: "Request changes to your listing",
              onClick: () => setActiveTab("profile"),
            },
            {
              icon: Briefcase,
              label: "Active Engagements",
              desc: "Manage current client work",
              onClick: () => setActiveTab("engagements"),
            },
            {
              icon: MessageSquare,
              label: "Contact LWYRD",
              desc: "Questions? We're here to help",
              href: "/contact",
            },
          ].map(({ icon: Icon, label, desc, onClick, href }) => {
            const inner = (
              <>
                <div className="w-9 h-9 rounded-xl bg-[#002452]/8 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-[#002452]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#002452] text-sm font-medium">{label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </>
            );

            const cls =
              "bg-white border border-[#ddd7cc] rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm hover:-translate-y-0.5 transition-all text-left";

            if (href) {
              return (
                <Link key={label} href={href} className={cls}>
                  {inner}
                </Link>
              );
            }
            return (
              <button key={label} onClick={onClick} className={cls}>
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Firm Profile ────────────────────────────────────────────────────────

function FirmProfileTab({ firmName }: { firmName: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#ddd7cc] rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-3">
              <CheckCircle2 size={11} />
              Live on LWYRD
            </div>
            <h2 className="text-2xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
              {firmName}
            </h2>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 border border-[#002452] text-[#002452] text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#002452] hover:text-white transition-colors"
          >
            <Edit3 size={13} strokeWidth={1.5} />
            Request Update
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: "Practice Areas", value: "Managed by LWYRD" },
            { label: "Firm Size", value: "Managed by LWYRD" },
            { label: "Billing Model", value: "Managed by LWYRD" },
            { label: "Response Time", value: "Managed by LWYRD" },
            { label: "Languages", value: "Managed by LWYRD" },
            { label: "Location", value: "Managed by LWYRD" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
              <p className="text-sm text-slate-500 italic">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#f5f4f0] border border-[#ddd7cc] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#002452]/10 flex items-center justify-center shrink-0">
            <FileText size={15} className="text-[#002452]" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-[#002452] text-sm font-semibold mb-1" style={lora}>
              Need to update your firm profile?
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Your public profile drives which clients see your firm in match results. To update your
              practice areas, billing structure, team members, or any other details, reach out to the
              LWYRD team and we&apos;ll make the changes promptly.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#002452] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Contact the LWYRD Team
              <ArrowRight size={14} />
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Inbound Inquiries
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Clients whose intake results matched your firm profile
          </p>
        </div>
        <span className="text-xs text-slate-400 bg-white border border-[#ddd7cc] px-3 py-1.5 rounded-xl">
          0 new
        </span>
      </div>

      <EmptyState
        icon={Users}
        title="No inquiries yet"
        body="When a client's intake answers match your firm's profile, their inquiry will appear here for your review. Keep your profile current to maximize your visibility."
        cta={
          <Link
            href="/contact"
            className="mt-2 inline-flex items-center gap-2 text-sm text-[#002452] font-medium hover:opacity-70 transition-opacity"
          >
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
    <div className="space-y-5">
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
          body="Once you accept a client introduction and begin working together, the engagement details — communications, key documents, and status — will be tracked here."
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

function PortalContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const firmName = user?.name ?? "Your Firm";

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
              {/* Firm identity */}
              <div className="px-3 py-3 mb-2 border-b border-[#f0ece5]">
                <p className="text-xs text-slate-400 font-medium">Firm Portal</p>
                <p className="text-sm text-[#002452] font-semibold mt-0.5 truncate" style={lora}>
                  {firmName}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-emerald-600 font-medium">Live</span>
                </div>
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
                  </button>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-3 border-t border-[#f0ece5]" />

              {/* Account settings */}
              <Link
                href="/account"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-[#002452] hover:bg-[#f5f4f0] transition-colors"
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
                    {firmName}
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Your firm dashboard — manage your profile, inquiries, and client engagements.
                  </p>
                </>
              )}
              {activeTab === "profile" && (
                <>
                  <h1 className="text-3xl sm:text-4xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
                    Firm Profile
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Your public listing on LWYRD. Contact us to request updates.
                  </p>
                </>
              )}
              {activeTab === "inquiries" && (
                <>
                  <h1 className="text-3xl sm:text-4xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
                    Client Inquiries
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Potential clients whose intake results matched your firm.
                  </p>
                </>
              )}
              {activeTab === "engagements" && (
                <>
                  <h1 className="text-3xl sm:text-4xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
                    Engagements
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Active and past client engagements and their details.
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
                  <OverviewTab firmName={firmName} setActiveTab={setActiveTab} />
                )}
                {activeTab === "profile" && <FirmProfileTab firmName={firmName} />}
                {activeTab === "inquiries" && <InquiriesTab />}
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

export default function PortalPage() {
  return (
    <AuthGuard>
      <PortalContent />
    </AuthGuard>
  );
}
