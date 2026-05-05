import {
  TrendingUp, TrendingDown, Minus,
  Users, MousePointerClick, CheckCircle2, Star, Repeat2,
  AlertCircle, Globe, Clock, Smartphone, CreditCard,
  BookOpen, Target, Zap, Map, BarChart2, Calendar,
} from "lucide-react";

export const metadata = { title: "Analytics — LWYRD Admin" };

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER DATA
// Each constant is marked with the PostHog event/property that will drive it.
// Replace with real API calls once your analytics provider is connected.
// PostHog is already instrumented in src/components/intake/IntakeWizard.tsx
// (events: intake_started, intake_completed).
// ─────────────────────────────────────────────────────────────────────────────

// ── Section 1: Traffic KPIs ──────────────────────────────────────────────────
// PostHog: $pageview, $session, person distinct_id
const TRAFFIC_KPIS = [
  { label: "Unique Visitors", value: "2,847", change: +12.4, icon: Users },
  { label: "Sessions", value: "4,312", change: +9.8, icon: Globe },
  { label: "Pageviews", value: "18,940", change: +14.1, icon: BookOpen },
  { label: "Avg Session Duration", value: "3m 42s", change: +8.3, icon: Clock },
  { label: "Bounce Rate", value: "41%", change: -3.1, icon: Zap },
  { label: "Mobile Traffic", value: "38%", change: +2.2, icon: Smartphone },
];

// ── Section 1: Engagement KPIs ───────────────────────────────────────────────
// PostHog: intake_started, intake_completed, contact_requested, $identify
const ENGAGEMENT_KPIS = [
  { label: "Intakes Started", value: "384", change: +8.1, icon: MousePointerClick },
  { label: "Completion Rate", value: "68%", change: -2.9, icon: CheckCircle2 },
  { label: "Avg Top Match Score", value: "82", change: +4.7, icon: Star },
  { label: "Contact Request Rate", value: "33%", change: +6.2, icon: Target },
  { label: "Returning Users", value: "23%", change: +1.8, icon: Repeat2 },
  { label: "DAU / MAU Ratio", value: "0.14", change: +0.02, icon: Calendar },
];

// ── Section 1: Business KPIs ─────────────────────────────────────────────────
// Source: Supabase profiles table (access_level, created_at)
const BUSINESS_KPIS = [
  { label: "Active Subscribers", value: "142", change: +18.3, icon: CreditCard },
  { label: "New This Month", value: "31", change: +24.0, icon: TrendingUp },
  { label: "Sub Conversion Rate", value: "5.0%", change: +0.8, icon: BarChart2 },
  { label: "Org Accounts", value: "9", change: +12.5, icon: Users },
];

// ── Section 2: Traffic Trend ─────────────────────────────────────────────────
// PostHog: $pageview grouped by day
const VISITOR_TREND_POINTS = [
  62, 78, 54, 91, 105, 88, 96, 110, 84, 99,
  118, 92, 107, 130, 122, 95, 141, 128, 153, 117,
  138, 162, 144, 155, 171, 148, 163, 182, 159, 177,
];

// PostHog: $pageview – top pages by view count
const TOP_LANDING_PAGES = [
  { path: "/", label: "Home", views: 2847, bounce: "44%" },
  { path: "/browse", label: "Browse", views: 1104, bounce: "31%" },
  { path: "/intake/corporate-law", label: "Corporate Intake", views: 612, bounce: "18%" },
  { path: "/intake/employment", label: "Employment Intake", views: 441, bounce: "22%" },
  { path: "/browse/corporate-law", label: "Corporate Category", views: 389, bounce: "38%" },
  { path: "/results", label: "Results", views: 312, bounce: "12%" },
];

// PostHog: $pageview, $current_url – last page before session end
const TOP_EXIT_PAGES = [
  { path: "/results", label: "Results Page", exits: 188, exitRate: "61%" },
  { path: "/", label: "Home", exits: 142, exitRate: "44%" },
  { path: "/browse", label: "Browse", exits: 87, exitRate: "31%" },
  { path: "/access", label: "Access Gate", exits: 74, exitRate: "82%" },
  { path: "/intake/*", label: "Mid-Intake", exits: 61, exitRate: "16%" },
];

// PostHog: $geoip_country_code / $geoip_subdivision_1_name
const TOP_STATES = [
  { state: "California", abbr: "CA", count: 841, pct: 29.5 },
  { state: "New York", abbr: "NY", count: 512, pct: 18.0 },
  { state: "Texas", abbr: "TX", count: 298, pct: 10.5 },
  { state: "Florida", abbr: "FL", count: 187, pct: 6.6 },
  { state: "Massachusetts", abbr: "MA", count: 164, pct: 5.8 },
  { state: "Illinois", abbr: "IL", count: 141, pct: 5.0 },
  { state: "Colorado", abbr: "CO", count: 98, pct: 3.4 },
  { state: "Other", abbr: "—", count: 606, pct: 21.3 },
];

// PostHog: $os, $browser, $device_type
const DEVICES = [
  { label: "Desktop", pct: 62, color: "#002452" },
  { label: "Mobile", pct: 32, color: "#3b5f8a" },
  { label: "Tablet", pct: 6, color: "#8fa8c8" },
];

// ── Section 3: Intake Funnel ─────────────────────────────────────────────────
// PostHog: intake_started, intake_completed
const MACRO_FUNNEL = [
  { label: "Visited Site", count: 2847, pct: 100, drop: null },
  { label: "Browsed Categories", count: 1204, pct: 42.3, drop: -57.7 },
  { label: "Started Intake", count: 384, pct: 13.5, drop: -68.1 },
  { label: "Completed Intake", count: 261, pct: 9.2, drop: -32.0 },
  { label: "Viewed Results", count: 244, pct: 8.6, drop: -6.5 },
  { label: "Requested Contact", count: 87, pct: 3.1, drop: -64.3 },
];

// PostHog: intake_started, intake_completed — grouped by category property
const COMPLETION_BY_CATEGORY = [
  { category: "Corporate & Business Law", started: 94, completed: 72, rate: 76.6 },
  { category: "Employment & Labor", started: 71, completed: 50, rate: 70.4 },
  { category: "Intellectual Property", started: 52, completed: 32, rate: 61.5 },
  { category: "Real Estate", started: 28, completed: 21, rate: 75.0 },
  { category: "Litigation & Disputes", started: 16, completed: 8, rate: 50.0 },
  { category: "Estate Planning", started: 11, completed: 9, rate: 81.8 },
];

// PostHog: custom event intake_step_abandoned — property: step_index, step_id
const QUESTION_DROPOFF = [
  { step: 1, label: "Company stage", completions: 384, dropPct: 4.2 },
  { step: 2, label: "Industry", completions: 368, dropPct: 6.8 },
  { step: 3, label: "Legal needs (multi)", completions: 343, dropPct: 11.7 },
  { step: 4, label: "Budget", completions: 303, dropPct: 16.8 },
  { step: 5, label: "Timeline", completions: 280, dropPct: 7.6 },
  { step: 6, label: "Location preference", completions: 277, dropPct: 1.1 },
  { step: 7, label: "Seniority preference", completions: 270, dropPct: 2.5 },
  { step: 8, label: "Language", completions: 268, dropPct: 0.7 },
];

// PostHog: intake_completed — property: duration_seconds
const COMPLETION_TIME_BUCKETS = [
  { label: "< 2 min", count: 18 },
  { label: "2–4 min", count: 64 },
  { label: "4–6 min", count: 82 },
  { label: "6–8 min", count: 51 },
  { label: "8–12 min", count: 31 },
  { label: "> 12 min", count: 15 },
];

// PostHog: intake_started — grouped by $hour_of_day
const INTAKE_BY_HOUR = [
  0, 0, 0, 1, 1, 2, 4, 9, 18, 26, 31, 28,
  22, 29, 32, 34, 28, 22, 18, 12, 9, 6, 3, 1,
];

// ── Section 4: Match Quality & Demand ────────────────────────────────────────
// PostHog: intake_completed — properties: top_score, result_count, category

const SCORE_HISTOGRAM = [4, 6, 9, 14, 22, 38, 61, 82, 57, 28];

const SCORE_BY_CATEGORY = [
  { category: "Corporate & Business Law", avg: 85, low: 61, high: 98 },
  { category: "Estate Planning", avg: 83, low: 68, high: 95 },
  { category: "Real Estate", avg: 81, low: 55, high: 97 },
  { category: "Employment & Labor", avg: 79, low: 52, high: 94 },
  { category: "Intellectual Property", avg: 76, low: 48, high: 92 },
  { category: "Litigation & Disputes", avg: 71, low: 40, high: 89 },
];

// PostHog: intake_completed — property: result_count === 0
const ZERO_RESULTS_RATE = "4.2%"; // 11 of 261 completed intakes returned no matches

// User profile breakdown from intake answers
const BUDGET_DIST = [
  { label: "< $2k/mo", count: 48, pct: 18 },
  { label: "$2–5k/mo", count: 74, pct: 28 },
  { label: "$5–10k/mo", count: 81, pct: 31 },
  { label: "$10–20k/mo", count: 41, pct: 16 },
  { label: "> $20k/mo", count: 17, pct: 7 },
];

const STAGE_DIST = [
  { label: "Individual", count: 31, pct: 12 },
  { label: "Pre-Seed", count: 22, pct: 8 },
  { label: "Seed", count: 68, pct: 26 },
  { label: "Series A", count: 71, pct: 27 },
  { label: "Growth", count: 42, pct: 16 },
  { label: "Enterprise", count: 27, pct: 10 },
];

const TIMELINE_DIST = [
  { label: "ASAP / This week", count: 94, pct: 36 },
  { label: "1–2 weeks", count: 81, pct: 31 },
  { label: "Within a month", count: 57, pct: 22 },
  { label: "No timeline", count: 29, pct: 11 },
];

// ── Section 5: Post-Match Engagement ─────────────────────────────────────────
// PostHog: results_viewed, firm_profile_clicked, firm_saved, contact_requested

const RESULTS_KPIS = [
  { label: "Avg Firms Shown", value: "4.2", note: "per completed search" },
  { label: "Avg Time on Results", value: "2m 18s", note: "per results page visit" },
  { label: "Firm Profile Click Rate", value: "58%", note: "of results page visitors" },
  { label: "Save Rate", value: "28%", note: "of results page visitors" },
  { label: "Contact Conversion", value: "33%", note: "of results viewers" },
  { label: "Zero-Results Rate", value: ZERO_RESULTS_RATE, note: "of completed intakes" },
];

// PostHog: firm_profile_clicked — property: firm_id, firm_name
const TOP_CLICKED_FIRMS = [
  { name: "Wilson Sonsini", clicks: 94, ctr: "38%" },
  { name: "Cooley LLP", clicks: 81, ctr: "33%" },
  { name: "Orrick, Herrington & Sutcliffe", clicks: 76, ctr: "31%" },
  { name: "Fenwick & West", clicks: 62, ctr: "25%" },
  { name: "Gunderson Dettmer", clicks: 44, ctr: "18%" },
];

// PostHog: intake_completed — property: matched_criteria, missed_criteria
const CRITERIA_MISS_RATE = [
  { criterion: "budget", missRate: 22, label: "Budget out of range" },
  { criterion: "industry", missRate: 18, label: "Industry not covered" },
  { criterion: "location", missRate: 14, label: "Location mismatch" },
  { criterion: "company-stage", missRate: 9, label: "Stage not served" },
  { criterion: "timeline", missRate: 7, label: "Timeline can't be met" },
];

// ── Section 6: Retention & Lifecycle ─────────────────────────────────────────
// PostHog: $identify, intake_started — person properties

const COHORT_RETENTION = [
  { cohort: "Feb 2026", size: 214, w1: 34, w2: 22, w4: 14, w8: 9 },
  { cohort: "Mar 2026", size: 268, w1: 38, w2: 25, w4: 16, w8: null },
  { cohort: "Apr 2026", size: 311, w1: 41, w2: null, w4: null, w8: null },
];

// PostHog: intake_started per person — count grouped by distinct_id
const REPEAT_INTAKE = [
  { label: "1 intake", count: 194, pct: 74 },
  { label: "2 intakes", count: 48, pct: 18 },
  { label: "3 intakes", count: 14, pct: 5 },
  { label: "4+ intakes", count: 5, pct: 2 },
];

// PostHog: time delta between $identify and first intake_started
const TIME_TO_INTAKE = [
  { label: "Same session", count: 112, pct: 43 },
  { label: "Day 1–2", count: 68, pct: 26 },
  { label: "Day 3–7", count: 47, pct: 18 },
  { label: "Week 2–4", count: 26, pct: 10 },
  { label: "> 1 month", count: 8, pct: 3 },
];

// ── Section 7: Recent Events ─────────────────────────────────────────────────
const RECENT_EVENTS = [
  { event: "intake_completed", detail: "Corporate Law · score 91", time: "2 min ago" },
  { event: "contact_requested", detail: "Wilson Sonsini · Corporate Law", time: "3 min ago" },
  { event: "intake_started", detail: "Employment & Labor", time: "4 min ago" },
  { event: "firm_saved", detail: "Cooley LLP", time: "7 min ago" },
  { event: "intake_completed", detail: "Intellectual Property · score 78", time: "11 min ago" },
  { event: "intake_started", detail: "Corporate Law", time: "14 min ago" },
  { event: "firm_profile_clicked", detail: "Orrick · from results page", time: "18 min ago" },
  { event: "intake_completed", detail: "Real Estate · score 83", time: "22 min ago" },
  { event: "intake_started", detail: "Litigation & Disputes", time: "29 min ago" },
  { event: "contact_requested", detail: "Fenwick & West · Employment", time: "35 min ago" },
  { event: "intake_completed", detail: "Employment · score 74", time: "41 min ago" },
  { event: "firm_saved", detail: "Gunderson Dettmer", time: "58 min ago" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SampleBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-8 text-sm text-amber-800">
      <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-500" />
      <span>
        <strong className="font-semibold">Sample data shown.</strong>{" "}
        PostHog is already instrumented in the intake flow. Connect your PostHog project key to populate this dashboard with real data. Each metric is annotated with its source event/property.
      </span>
    </div>
  );
}

function SectionHeader({
  id, title, description, tag,
}: { id: string; title: string; description: string; tag?: string }) {
  return (
    <div id={id} className="flex items-start justify-between mb-5 pt-2">
      <div>
        <h2 className="text-base font-semibold text-[#002452] mb-0.5">{title}</h2>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      {tag && (
        <span className="text-xs text-slate-400 bg-[#f0ede8] px-2.5 py-1 rounded-full whitespace-nowrap ml-4 shrink-0">
          {tag}
        </span>
      )}
    </div>
  );
}

function TrendBadge({ change }: { change: number }) {
  if (change === 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-slate-400"><Minus size={11} /> —</span>
  );
  const up = change > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}{typeof change === "number" ? change.toFixed(1) + "%" : change}
    </span>
  );
}

function Sparkline({ up }: { up: boolean }) {
  const stroke = up ? "#10b981" : "#ef4444";
  const d = up
    ? "M0,30 C10,26 25,20 40,14 S65,6 80,4 S100,2 120,0"
    : "M0,0 C10,4 25,10 40,16 S65,24 80,26 S100,28 120,30";
  return (
    <svg width={60} height={20} viewBox="0 0 120 30" className="opacity-50">
      <path d={d} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function HBar({ pct, opacity = 0.5 }: { pct: number; opacity?: number }) {
  return (
    <div className="flex-1 h-1.5 bg-[#edeae4] rounded-full overflow-hidden">
      <div className="h-full rounded-full bg-[#002452]" style={{ width: `${pct}%`, opacity }} />
    </div>
  );
}

function KpiCard({
  label, value, change, icon: Icon, note,
}: { label: string; value: string; change?: number; icon: React.ElementType; note?: string }) {
  return (
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon size={15} className="text-[#002452]" strokeWidth={1.5} />
        {change !== undefined && <Sparkline up={change >= 0} />}
      </div>
      <div className="text-3xl text-[#002452] mb-0.5" style={{ fontFamily: '"Lora", Georgia, serif' }}>
        {value}
      </div>
      <div className="text-xs text-slate-500 mb-1.5">{label}</div>
      <div className="flex items-center gap-1.5">
        {change !== undefined && <TrendBadge change={change} />}
        {note && <span className="text-xs text-slate-400">{note}</span>}
        {change !== undefined && <span className="text-xs text-slate-400">vs last 30d</span>}
      </div>
    </div>
  );
}

// Line chart using SVG polyline from raw data points
function LineChart({ points, height = 160 }: { points: number[]; height?: number }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 400;
  const h = 140;
  const pad = 10;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * (w - 2 * pad) + pad;
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
    return `${x},${y}`;
  });
  const polyline = coords.join(" ");
  const area = `${pad},${h - pad} ${polyline} ${w - pad},${h - pad}`;
  return (
    <div className="rounded-2xl overflow-hidden bg-[#f5f4f0]" style={{ height }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#002452" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#002452" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={pad} y1={pad + (1 - r) * (h - 2 * pad)} x2={w - pad} y2={pad + (1 - r) * (h - 2 * pad)} stroke="#ddd7cc" strokeWidth="1" />
        ))}
        <polygon points={area} fill="url(#lineGrad)" />
        <polyline points={polyline} fill="none" stroke="#002452" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Histogram({ buckets }: { buckets: { label: string; count: number }[] }) {
  const max = Math.max(...buckets.map((b) => b.count));
  return (
    <div>
      <div className="flex items-end gap-1.5 h-28 mb-1.5">
        {buckets.map(({ label, count }, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-slate-400 tabular-nums">{count}</span>
            <div
              className="w-full rounded-t-sm bg-[#002452]"
              style={{ height: `${(count / max) * 80}%`, opacity: 0.15 + (count / max) * 0.55 }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {buckets.map(({ label }, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-slate-400 truncate">{label}</span>
        ))}
      </div>
    </div>
  );
}

const EVENT_COLORS: Record<string, string> = {
  intake_completed: "bg-emerald-50 text-emerald-700",
  intake_started: "bg-[#002452]/8 text-[#002452]",
  contact_requested: "bg-orange-50 text-orange-700",
  firm_saved: "bg-violet-50 text-violet-700",
  firm_profile_clicked: "bg-sky-50 text-sky-700",
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const navLinks = [
    { href: "#overview", label: "Overview" },
    { href: "#traffic", label: "Traffic" },
    { href: "#funnel", label: "Intake Funnel" },
    { href: "#quality", label: "Match Quality" },
    { href: "#post-match", label: "Post-Match" },
    { href: "#retention", label: "Retention" },
    { href: "#activity", label: "Activity" },
  ];

  return (
    <div>
      {/* Page header */}
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        Analytics
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Platform usage, intake funnel, match quality, and user behavior — last 30 days.
      </p>

      {/* Jump nav */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {navLinks.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="text-xs px-3 py-1.5 rounded-full border border-[#ddd7cc] text-slate-500 hover:border-[#002452] hover:text-[#002452] transition-colors bg-[#fbfaf6]"
          >
            {label}
          </a>
        ))}
      </div>

      <SampleBanner />

      {/* ── SECTION 1: OVERVIEW ────────────────────────────────────────────── */}
      <SectionHeader
        id="overview"
        title="Overview"
        description="Top-level KPIs across traffic, engagement, and business metrics"
      />

      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Traffic</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {TRAFFIC_KPIS.map(({ label, value, change, icon }) => (
          <KpiCard key={label} label={label} value={value} change={change} icon={icon} />
        ))}
      </div>

      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Engagement</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {ENGAGEMENT_KPIS.map(({ label, value, change, icon }) => (
          <KpiCard key={label} label={label} value={value} change={change} icon={icon} />
        ))}
      </div>

      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Business</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {BUSINESS_KPIS.map(({ label, value, change, icon }) => (
          <KpiCard key={label} label={label} value={value} change={change} icon={icon} />
        ))}
      </div>

      {/* ── SECTION 2: TRAFFIC ─────────────────────────────────────────────── */}
      <div className="border-t border-[#ddd7cc] pt-8 mb-6">
        <SectionHeader
          id="traffic"
          title="Traffic & Acquisition"
          description="Where users come from and how they move through the site"
          tag="PostHog: $pageview · $session · $geoip"
        />

        {/* Visitor trend + devices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Daily Unique Visitors</p>
            <p className="text-xs text-slate-400 mb-5">Last 30 days</p>
            <LineChart points={VISITOR_TREND_POINTS} height={160} />
            <div className="flex justify-between mt-2 px-1">
              {["Apr 1", "Apr 8", "Apr 15", "Apr 22", "Apr 30"].map((d) => (
                <span key={d} className="text-xs text-slate-400">{d}</span>
              ))}
            </div>
          </div>

          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 flex flex-col">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Device Split</p>
            <p className="text-xs text-slate-400 mb-5">By session device type</p>
            {/* Stacked visual */}
            <div className="flex h-6 rounded-full overflow-hidden mb-4">
              {DEVICES.map(({ pct, color }) => (
                <div key={color} style={{ width: `${pct}%`, backgroundColor: color }} />
              ))}
            </div>
            <div className="space-y-2.5 mt-1">
              {DEVICES.map(({ label, pct, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-600">{label}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 tabular-nums">{pct}%</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#ddd7cc] mt-auto pt-4">
              <p className="text-xs text-slate-400 mb-3">Traffic Sources</p>
              {[
                { label: "Organic Search", pct: 35 },
                { label: "Direct", pct: 29 },
                { label: "Social", pct: 21 },
                { label: "Referral", pct: 15 },
              ].map(({ label, pct }) => (
                <div key={label} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
                  <HBar pct={pct * 2.5} />
                  <span className="text-xs text-slate-400 tabular-nums w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top pages + Geography */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Top Landing Pages</p>
            <p className="text-xs text-slate-400 mb-4">First page of each session</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#ddd7cc]">
                  <th className="text-left pb-2 font-medium text-slate-400">Page</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Views</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Bounce</th>
                </tr>
              </thead>
              <tbody>
                {TOP_LANDING_PAGES.map(({ path, label, views, bounce }, i) => (
                  <tr key={path} className={i < TOP_LANDING_PAGES.length - 1 ? "border-b border-[#ddd7cc]" : ""}>
                    <td className="py-2">
                      <span className="text-slate-700">{label}</span>
                      <span className="text-slate-400 ml-1.5 font-mono text-[10px]">{path}</span>
                    </td>
                    <td className="py-2 text-right text-slate-500 tabular-nums">{views.toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={parseFloat(bounce) > 50 ? "text-red-500" : "text-slate-500"}>{bounce}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Geographic Demand</p>
            <p className="text-xs text-slate-400 mb-4">Intakes by user state · PostHog: $geoip_subdivision_1_name</p>
            <div className="space-y-2.5">
              {TOP_STATES.map(({ state, abbr, count, pct }) => (
                <div key={state} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-6 shrink-0">{abbr}</span>
                  <span className="text-xs text-slate-700 w-28 shrink-0 truncate">{state}</span>
                  <HBar pct={pct * 2.5} />
                  <span className="text-xs text-slate-400 tabular-nums w-14 text-right">{count.toLocaleString()} · {pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exit pages */}
        <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
          <p className="text-sm font-medium text-slate-700 mb-0.5">Top Exit Pages</p>
          <p className="text-xs text-slate-400 mb-4">Last page viewed before session ended — high exit rates on mid-intake pages indicate friction</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TOP_EXIT_PAGES.map(({ path, label, exits, exitRate }) => (
              <div key={path} className="bg-[#f5f4f0] rounded-2xl p-4 text-center">
                <div className="text-xl font-semibold text-[#002452] mb-0.5" style={{ fontFamily: '"Lora", Georgia, serif' }}>{exits}</div>
                <div className={`text-xs font-medium mb-1 ${parseFloat(exitRate) > 60 ? "text-red-500" : "text-slate-500"}`}>{exitRate} exit rate</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: INTAKE FUNNEL ────────────────────────────────────────── */}
      <div className="border-t border-[#ddd7cc] pt-8 mb-6">
        <SectionHeader
          id="funnel"
          title="Intake Funnel"
          description="End-to-end conversion from site visit to contact request, with question-level drop-off"
          tag="PostHog: intake_started · intake_completed"
        />

        {/* Macro funnel */}
        <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 mb-5">
          <p className="text-sm font-medium text-slate-700 mb-4">Macro Conversion Funnel</p>
          <div className="space-y-2">
            {MACRO_FUNNEL.map(({ label, count, pct, drop }, i) => (
              <div key={label}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-slate-400 w-4 tabular-nums">{i + 1}</span>
                  <span className="text-xs text-slate-700 w-40 shrink-0">{label}</span>
                  <div className="flex-1 h-7 bg-[#f0ede8] rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg flex items-center pl-3"
                      style={{ width: `${pct}%`, backgroundColor: "#002452", opacity: 0.12 + (pct / 100) * 0.4 }}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#002452]">
                      {count.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 tabular-nums w-12 text-right">{pct}%</span>
                  {drop !== null && drop !== undefined && (
                    <span className="text-xs text-red-400 tabular-nums w-14 text-right">{drop.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-right">Red values = drop from previous step</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Completion by category */}
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Completion Rate by Category</p>
            <p className="text-xs text-slate-400 mb-4">Identifies which categories have friction or strong fit</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#ddd7cc]">
                  <th className="text-left pb-2 font-medium text-slate-400">Category</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Started</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Completed</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Rate</th>
                </tr>
              </thead>
              <tbody>
                {COMPLETION_BY_CATEGORY.map(({ category, started, completed, rate }, i) => (
                  <tr key={category} className={i < COMPLETION_BY_CATEGORY.length - 1 ? "border-b border-[#ddd7cc]" : ""}>
                    <td className="py-2 text-slate-700 truncate max-w-[140px]">{category}</td>
                    <td className="py-2 text-right text-slate-500 tabular-nums">{started}</td>
                    <td className="py-2 text-right text-slate-500 tabular-nums">{completed}</td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={`font-semibold ${rate >= 75 ? "text-emerald-600" : rate >= 60 ? "text-amber-600" : "text-red-500"}`}>
                        {rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Time to complete + Volume by hour */}
          <div className="space-y-5">
            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
              <p className="text-sm font-medium text-slate-700 mb-0.5">Completion Time Distribution</p>
              <p className="text-xs text-slate-400 mb-4">How long users take to finish the intake · property: duration_seconds</p>
              <Histogram buckets={COMPLETION_TIME_BUCKETS} />
            </div>

            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
              <p className="text-sm font-medium text-slate-700 mb-0.5">Intake Volume by Hour</p>
              <p className="text-xs text-slate-400 mb-3">UTC — when users are most active (intake_started)</p>
              <div className="flex items-end gap-0.5 h-14">
                {INTAKE_BY_HOUR.map((v, i) => {
                  const max = Math.max(...INTAKE_BY_HOUR);
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-[#002452]"
                      title={`${i}:00 — ${v} intakes`}
                      style={{ height: `${(v / max) * 100}%`, opacity: 0.1 + (v / max) * 0.7 }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                {["12a", "6a", "12p", "6p", "11p"].map((t) => (
                  <span key={t} className="text-[10px] text-slate-400">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Question drop-off */}
        <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
          <p className="text-sm font-medium text-slate-700 mb-0.5">Question-Level Drop-off</p>
          <p className="text-xs text-slate-400 mb-4">
            Which intake step loses the most users — high drop-off on a question suggests it needs redesign or reordering.
            Requires a custom PostHog event: <code className="bg-[#f0ede8] px-1 rounded text-[10px]">intake_step_abandoned</code>
          </p>
          <div className="space-y-2.5">
            {QUESTION_DROPOFF.map(({ step, label, completions, dropPct }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 tabular-nums w-4">{step}</span>
                <span className="text-xs text-slate-700 w-44 shrink-0 truncate">{label}</span>
                <div className="flex-1 h-2 bg-[#edeae4] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#002452]"
                    style={{ width: `${(completions / QUESTION_DROPOFF[0].completions) * 100}%`, opacity: 0.45 }}
                  />
                </div>
                <span className="text-xs text-slate-500 tabular-nums w-10 text-right">{completions}</span>
                <span className={`text-xs tabular-nums w-14 text-right font-medium ${dropPct > 12 ? "text-red-500" : dropPct > 6 ? "text-amber-500" : "text-slate-400"}`}>
                  -{dropPct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 4: MATCH QUALITY & DEMAND ──────────────────────────────── */}
      <div className="border-t border-[#ddd7cc] pt-8 mb-6">
        <SectionHeader
          id="quality"
          title="Match Quality & Demand Intelligence"
          description="How well your firm supply meets user demand — critical for identifying gaps in coverage"
          tag="PostHog: intake_completed properties"
        />

        {/* Score dist + by category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Top Match Score Distribution</p>
            <p className="text-xs text-slate-400 mb-4">Histogram of best-match scores across all completed intakes</p>
            <div>
              <div className="flex items-end gap-1 h-28 mb-1.5">
                {SCORE_HISTOGRAM.map((h, i) => {
                  const max = Math.max(...SCORE_HISTOGRAM);
                  const rangeStart = 10 + i * 10;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-slate-400 tabular-nums">{h}</span>
                      <div
                        className="w-full rounded-t-sm bg-[#002452]"
                        style={{ height: `${(h / max) * 85}%`, opacity: 0.15 + (h / max) * 0.55 }}
                        title={`${rangeStart}–${rangeStart + 9}: ${h} searches`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between">
                {["10", "20", "30", "40", "50", "60", "70", "80", "90", "96"].map((v) => (
                  <span key={v} className="flex-1 text-center text-[10px] text-slate-400">{v}</span>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center mt-1">Score range (top match per search)</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-[#ddd7cc]">
              {[{ label: "Avg Score", value: "82" }, { label: "Median Score", value: "85" }, { label: "Zero Results", value: ZERO_RESULTS_RATE }].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-xl text-[#002452]" style={{ fontFamily: '"Lora", Georgia, serif' }}>{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Avg Score by Category</p>
            <p className="text-xs text-slate-400 mb-4">Low scores signal supply gaps — not enough qualified firms for that practice area</p>
            <div className="space-y-3">
              {SCORE_BY_CATEGORY.map(({ category, avg, low, high }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-700 truncate max-w-[180px]">{category}</span>
                    <span className={`text-xs font-semibold tabular-nums ${avg >= 82 ? "text-emerald-600" : avg >= 75 ? "text-[#002452]" : "text-amber-600"}`}>{avg}</span>
                  </div>
                  {/* Score range bar */}
                  <div className="relative h-2 bg-[#edeae4] rounded-full">
                    <div
                      className="absolute h-full rounded-full bg-[#002452] opacity-30"
                      style={{ left: `${low}%`, width: `${high - low}%` }}
                    />
                    <div
                      className="absolute w-2 h-2 rounded-full bg-[#002452] -translate-x-1/2 top-0"
                      style={{ left: `${avg}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] text-slate-400">{low} low</span>
                    <span className="text-[10px] text-slate-400">{high} high</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User profile distributions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { title: "Budget Ranges", sub: "What users can spend (budget-monthly answer)", data: BUDGET_DIST },
            { title: "Company Stages", sub: "Where users are in their company journey", data: STAGE_DIST },
            { title: "Timeline Urgency", sub: "How quickly users need legal help", data: TIMELINE_DIST },
          ].map(({ title, sub, data }) => (
            <div key={title} className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
              <p className="text-sm font-medium text-slate-700 mb-0.5">{title}</p>
              <p className="text-xs text-slate-400 mb-4">{sub}</p>
              <div className="space-y-2.5">
                {data.map(({ label, count, pct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600 truncate">{label}</span>
                      <span className="text-xs text-slate-400 tabular-nums ml-2">{count} · {pct}%</span>
                    </div>
                    <HBar pct={pct * 2} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 5: POST-MATCH ENGAGEMENT ───────────────────────────────── */}
      <div className="border-t border-[#ddd7cc] pt-8 mb-6">
        <SectionHeader
          id="post-match"
          title="Post-Match Engagement"
          description="What users do after seeing their results — measures the quality and relevance of matches"
          tag="PostHog: results_viewed · firm_profile_clicked · firm_saved · contact_requested"
        />

        {/* Results KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
          {RESULTS_KPIS.map(({ label, value, note }) => (
            <div key={label} className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-5">
              <div className="text-2xl text-[#002452] mb-1" style={{ fontFamily: '"Lora", Georgia, serif' }}>{value}</div>
              <div className="text-xs text-slate-600 font-medium mb-0.5">{label}</div>
              <div className="text-xs text-slate-400">{note}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top clicked firms */}
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Most-Clicked Firms from Results</p>
            <p className="text-xs text-slate-400 mb-4">Which firms earn the most profile visits — reflects perceived relevance</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#ddd7cc]">
                  <th className="text-left pb-2 font-medium text-slate-400">Firm</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Profile Clicks</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Click-Through</th>
                </tr>
              </thead>
              <tbody>
                {TOP_CLICKED_FIRMS.map(({ name, clicks, ctr }, i) => (
                  <tr key={name} className={i < TOP_CLICKED_FIRMS.length - 1 ? "border-b border-[#ddd7cc]" : ""}>
                    <td className="py-2.5 text-slate-700">{name}</td>
                    <td className="py-2.5 text-right text-slate-500 tabular-nums">{clicks}</td>
                    <td className="py-2.5 text-right font-medium text-[#002452] tabular-nums">{ctr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Criteria miss rate */}
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Most Common Unmatched Criteria</p>
            <p className="text-xs text-slate-400 mb-4">
              Criteria frequently missed by firms — high rates indicate gaps in your firm roster that depress match scores.
              <span className="block mt-1 text-[10px]">Source: intake_completed · property: missed_criteria[]</span>
            </p>
            <div className="space-y-3">
              {CRITERIA_MISS_RATE.map(({ label, missRate }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-700">{label}</span>
                    <span className={`text-xs font-semibold tabular-nums ${missRate > 18 ? "text-red-500" : missRate > 10 ? "text-amber-500" : "text-slate-500"}`}>
                      {missRate}% of searches
                    </span>
                  </div>
                  <HBar pct={missRate * 3} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 6: RETENTION & LIFECYCLE ───────────────────────────────── */}
      <div className="border-t border-[#ddd7cc] pt-8 mb-6">
        <SectionHeader
          id="retention"
          title="User Retention & Lifecycle"
          description="How users return over time and how quickly they move from sign-up to intake"
          tag="PostHog: $identify · intake_started per person"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Cohort retention */}
          <div className="lg:col-span-2 bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
            <p className="text-sm font-medium text-slate-700 mb-0.5">Cohort Retention</p>
            <p className="text-xs text-slate-400 mb-4">% of sign-up cohort returning in subsequent weeks</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#ddd7cc]">
                  <th className="text-left pb-2 font-medium text-slate-400">Cohort</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Size</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Week 1</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Week 2</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Week 4</th>
                  <th className="text-right pb-2 font-medium text-slate-400">Week 8</th>
                </tr>
              </thead>
              <tbody>
                {COHORT_RETENTION.map(({ cohort, size, w1, w2, w4, w8 }, i) => (
                  <tr key={cohort} className={i < COHORT_RETENTION.length - 1 ? "border-b border-[#ddd7cc]" : ""}>
                    <td className="py-2.5 text-slate-700 font-medium">{cohort}</td>
                    <td className="py-2.5 text-right text-slate-500 tabular-nums">{size}</td>
                    {[w1, w2, w4, w8].map((v, j) => (
                      <td key={j} className="py-2.5 text-right tabular-nums">
                        {v !== null ? (
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `rgba(0,36,82,${(v / 100) * 0.2})`,
                              color: v > 25 ? "#002452" : "#64748b",
                            }}
                          >
                            {v}%
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Repeat intakes */}
          <div className="space-y-5">
            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
              <p className="text-sm font-medium text-slate-700 mb-0.5">Repeat Intake Rate</p>
              <p className="text-xs text-slate-400 mb-4">Users who complete more than one intake</p>
              <div className="space-y-2.5">
                {REPEAT_INTAKE.map(({ label, count, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-600">{label}</span>
                      <span className="text-xs text-slate-400 tabular-nums">{count} · {pct}%</span>
                    </div>
                    <HBar pct={pct * 2} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
              <p className="text-sm font-medium text-slate-700 mb-0.5">Time to First Intake</p>
              <p className="text-xs text-slate-400 mb-4">From account creation to first intake_started</p>
              <div className="space-y-2.5">
                {TIME_TO_INTAKE.map(({ label, count, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-600">{label}</span>
                      <span className="text-xs text-slate-400 tabular-nums">{count} · {pct}%</span>
                    </div>
                    <HBar pct={pct * 2} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 7: RECENT ACTIVITY ──────────────────────────────────────── */}
      <div className="border-t border-[#ddd7cc] pt-8">
        <SectionHeader
          id="activity"
          title="Live Event Feed"
          description="Real-time stream of tracked user actions across the platform"
          tag="PostHog: all events"
        />

        <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
          <div className="space-y-0">
            {RECENT_EVENTS.map(({ event, detail, time }, i) => (
              <div
                key={i}
                className={`flex items-start justify-between py-2.5 ${i < RECENT_EVENTS.length - 1 ? "border-b border-[#ddd7cc]" : ""}`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`inline-block text-xs font-mono px-1.5 py-0.5 rounded shrink-0 ${EVENT_COLORS[event] ?? "bg-slate-100 text-slate-600"}`}>
                    {event}
                  </span>
                  <p className="text-xs text-slate-500 truncate">{detail}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap ml-4 shrink-0">{time}</span>
              </div>
            ))}
          </div>

          {/* Event legend */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[#ddd7cc]">
            {Object.entries(EVENT_COLORS).map(([event, cls]) => (
              <span key={event} className={`text-xs font-mono px-2 py-0.5 rounded ${cls}`}>{event}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
