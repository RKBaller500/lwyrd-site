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

function SortHeader({
  col, label, sort, dir, onSort,
}: {
  col: SortCol; label: string; sort: SortCol; dir: Dir; onSort: (c: SortCol) => void;
}) {
  const active = sort === col;
  return (
    <th className={`sortable ${active ? "is-sorted" : ""}`} onClick={() => onSort(col)}>
      <span className="th-inner">
        {label}
        {active ? (dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />}
      </span>
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
    <div className="adm-panel">
      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search by user or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="adm-select is-sm" value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)}>
          <option value="">All tracks</option>
          {tracks.map((t) => (
            <option key={t} value={t}>{TRACK_LABELS[t] ?? t}</option>
          ))}
        </select>
        <span className="adm-count">
          {filtered.length} of {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
      </div>

      <div className="adm-table-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <SortHeader col="created_at" label="Date" sort={sort} dir={dir} onSort={handleSort} />
              <th>User</th>
              <SortHeader col="track" label="Track" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="category" label="Category" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="top_score" label="Top Match" sort={sort} dir={dir} onSort={handleSort} />
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => {
              const topMatch = sub.top_matches?.[0];
              const displayCategory = sub.category_label ?? sub.legal_category ?? sub.category_slug.replace(/-/g, " ");
              return (
                <tr key={sub.id}>
                  <td className="adm-cell-muted" style={{ whiteSpace: "nowrap" }}>{formatDate(sub.created_at)}</td>
                  <td>
                    <div className="adm-cell-title">{sub.userName || "—"}</div>
                    <span className="adm-cell-mono">{sub.userEmail}</span>
                  </td>
                  <td>
                    {sub.track ? <span className="adm-badge is-navy">{TRACK_LABELS[sub.track] ?? sub.track}</span> : null}
                  </td>
                  <td className="adm-cell-muted" style={{ textTransform: "capitalize" }}>{displayCategory}</td>
                  <td className="adm-cell-muted">
                    {topMatch ? (
                      <span>{topMatch.firmName} <span style={{ color: "var(--faint)" }}>({topMatch.score})</span></span>
                    ) : "—"}
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <Link href={`/admin/submissions/${sub.id}`} className="adm-link" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        View <ArrowRight size={12} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="adm-table-empty">
                  {hasFilters ? "No submissions match the current filters." : "No submissions yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
