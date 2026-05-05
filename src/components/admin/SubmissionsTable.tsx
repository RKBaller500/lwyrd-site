"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ArrowRight } from "lucide-react";

export interface SubmissionRow {
  id: string;
  user_id: string;
  userName: string;
  userEmail: string;
  category_slug: string;
  track?: string;
  legal_category?: string;
  category_label?: string;
  answers: Record<string, string | string[] | number>;
  top_matches: Array<{ firmId: string; firmName: string; score: number }>;
  created_at: string;
}

type SortCol = "created_at" | "track" | "category" | "top_score";
type Dir = "asc" | "desc";

const TRACK_LABELS: Record<string, string> = {
  startup: "Startup",
  individual: "Individual",
  small_business: "Small Business",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function trackBadge(track?: string) {
  if (!track) return null;
  const colors: Record<string, string> = {
    startup: "bg-blue-50 text-blue-700 border-blue-200",
    individual: "bg-purple-50 text-purple-700 border-purple-200",
    small_business: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${colors[track] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {TRACK_LABELS[track] ?? track}
    </span>
  );
}

function SortHeader({
  col, label, sort, dir, onSort, className,
}: {
  col: SortCol; label: string; sort: SortCol; dir: Dir;
  onSort: (c: SortCol) => void; className?: string;
}) {
  const active = sort === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={`text-left px-5 py-4 text-xs font-medium uppercase tracking-wide cursor-pointer select-none group transition-colors ${active ? "text-[#002452]" : "text-slate-400 hover:text-slate-600"} ${className ?? ""}`}
    >
      <div className="flex items-center gap-1">
        {label}
        {active
          ? dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
          : <ChevronsUpDown size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />}
      </div>
    </th>
  );
}

export default function SubmissionsTable({
  submissions,
  tracks,
}: {
  submissions: SubmissionRow[];
  tracks: string[];
}) {
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("");
  const [sort, setSort] = useState<SortCol>("created_at");
  const [dir, setDir] = useState<Dir>("desc");

  const handleSort = (col: SortCol) => {
    if (sort === col) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(col); setDir(col === "created_at" ? "desc" : "asc"); }
  };

  const getValue = (row: SubmissionRow, col: SortCol): number | string => {
    if (col === "created_at") return row.created_at;
    if (col === "track") return row.track ?? row.category_slug;
    if (col === "category") return row.category_label ?? row.legal_category ?? row.category_slug;
    if (col === "top_score") return row.top_matches?.[0]?.score ?? 0;
    return "";
  };

  const filtered = useMemo(() => {
    let rows = submissions;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        (r.category_label ?? r.category_slug).toLowerCase().includes(q) ||
        (r.track ?? "").includes(q)
      );
    }
    if (trackFilter) rows = rows.filter((r) => (r.track ?? "") === trackFilter);

    return [...rows].sort((a, b) => {
      const av = getValue(a, sort);
      const bv = getValue(b, sort);
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [submissions, search, trackFilter, sort, dir]);

  const hasFilters = search || trackFilter;

  return (
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#ddd7cc] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#ddd7cc] rounded-xl bg-white focus:outline-none focus:border-[#002452] placeholder:text-slate-400 text-slate-700"
          />
        </div>
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">All tracks</option>
          {tracks.map((t) => (
            <option key={t} value={t}>{TRACK_LABELS[t] ?? t}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
          {filtered.length} of {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ddd7cc] text-left">
            <SortHeader col="created_at" label="Date" sort={sort} dir={dir} onSort={handleSort} />
            <th className="px-5 py-4 text-xs font-medium text-slate-400 uppercase tracking-wide">User</th>
            <SortHeader col="track" label="Track" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="category" label="Category" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="top_score" label="Top Match" sort={sort} dir={dir} onSort={handleSort} />
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((sub, i) => {
            const topMatch = sub.top_matches?.[0];
            const displayCategory = sub.category_label ?? sub.legal_category ?? sub.category_slug.replace(/-/g, " ");
            return (
              <tr key={sub.id} className={i < filtered.length - 1 ? "border-b border-[#ddd7cc]" : ""}>
                <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDate(sub.created_at)}</td>
                <td className="px-5 py-4">
                  <p className="text-slate-700 font-medium">{sub.userName || "—"}</p>
                  <p className="text-slate-400 text-xs">{sub.userEmail}</p>
                </td>
                <td className="px-5 py-4">{trackBadge(sub.track)}</td>
                <td className="px-5 py-4 text-slate-600 capitalize">{displayCategory}</td>
                <td className="px-5 py-4 text-slate-600">
                  {topMatch
                    ? <span>{topMatch.firmName} <span className="text-slate-400">({topMatch.score})</span></span>
                    : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/admin/submissions/${sub.id}`} className="inline-flex items-center gap-1.5 text-xs text-[#002452] hover:underline">
                    View <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                {hasFilters ? "No submissions match the current filters." : "No submissions yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
