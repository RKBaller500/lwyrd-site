"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import DeleteFirmButton from "./DeleteFirmButton";

export interface FirmRow {
  id: string;
  name: string;
  location: string;
  size: string;
  overall_score: number;
  verified: boolean;
  practice_areas: string[];
}

type SortCol = "name" | "location" | "size" | "overall_score";
type Dir = "asc" | "desc";

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

export default function FirmsTable({ firms }: { firms: FirmRow[] }) {
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [sort, setSort] = useState<SortCol>("name");
  const [dir, setDir] = useState<Dir>("asc");

  const handleSort = (col: SortCol) => {
    if (sort === col) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(col); setDir("asc"); }
  };

  const filtered = useMemo(() => {
    let rows = firms;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q));
    }
    if (sizeFilter) rows = rows.filter((f) => f.size === sizeFilter);
    if (verifiedFilter !== "") rows = rows.filter((f) => String(f.verified) === verifiedFilter);

    return [...rows].sort((a, b) => {
      let av: string | number = a[sort] ?? "";
      let bv: string | number = b[sort] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [firms, search, sizeFilter, verifiedFilter, sort, dir]);

  const hasFilters = search || sizeFilter || verifiedFilter;

  return (
    <div className="adm-panel">
      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search by name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="adm-select is-sm" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
          <option value="">All sizes</option>
          <option value="boutique">Boutique</option>
          <option value="mid-size">Mid-size</option>
          <option value="large">Large</option>
        </select>
        <select className="adm-select is-sm" value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <span className="adm-count">
          {filtered.length} of {firms.length} firm{firms.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
      </div>

      <div className="adm-table-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <SortHeader col="name" label="Name" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="location" label="Location" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="size" label="Size" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="overall_score" label="Score" sort={sort} dir={dir} onSort={handleSort} />
              <th>Practice Areas</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((firm) => (
              <tr key={firm.id}>
                <td>
                  <Link href={`/admin/firms/${firm.id}`} className="adm-cell-title" style={{ display: "block" }}>
                    {firm.name}
                  </Link>
                  <span className="adm-cell-mono">{firm.id}</span>
                </td>
                <td className="adm-cell-muted">{firm.location}</td>
                <td className="adm-cell-muted" style={{ textTransform: "capitalize" }}>{firm.size}</td>
                <td className="adm-cell-muted">{firm.overall_score}</td>
                <td>
                  <div className="adm-tag-wrap">
                    {(firm.practice_areas ?? []).slice(0, 3).map((area) => (
                      <span key={area} className="adm-tag">{area}</span>
                    ))}
                    {(firm.practice_areas ?? []).length > 3 && (
                      <span className="adm-tag-more">+{firm.practice_areas.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>
                  {firm.verified ? (
                    <span className="adm-badge is-published"><span className="adm-badge-dot" />Verified</span>
                  ) : (
                    <span className="adm-badge">Unverified</span>
                  )}
                </td>
                <td>
                  <div className="adm-row-actions" style={{ gap: 12 }}>
                    <Link href={`/admin/firms/${firm.id}`} className="adm-link">Edit</Link>
                    <DeleteFirmButton id={firm.id} name={firm.name} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="adm-table-empty">
                  {hasFilters ? "No firms match the current filters." : "No firms yet. Add your first firm."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
