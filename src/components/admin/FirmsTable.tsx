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
  col, label, sort, dir, onSort, className,
}: {
  col: SortCol; label: string; sort: SortCol; dir: Dir;
  onSort: (c: SortCol) => void; className?: string;
}) {
  const active = sort === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={`text-left px-5 py-3.5 text-xs font-medium uppercase tracking-wider cursor-pointer select-none group transition-colors ${active ? "text-[#002452]" : "text-slate-400 hover:text-slate-600"} ${className ?? ""}`}
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
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#ddd7cc] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#ddd7cc] rounded-xl bg-white focus:outline-none focus:border-[#002452] placeholder:text-slate-400 text-slate-700"
          />
        </div>
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">All sizes</option>
          <option value="boutique">Boutique</option>
          <option value="mid-size">Mid-size</option>
          <option value="large">Large</option>
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">All statuses</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
          {filtered.length} of {firms.length} firm{firms.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ddd7cc]">
            <SortHeader col="name" label="Name" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="location" label="Location" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="size" label="Size" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="overall_score" label="Score" sort={sort} dir={dir} onSort={handleSort} />
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Practice Areas</th>
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((firm, i) => (
            <tr key={firm.id} className={`border-b border-[#ddd7cc] last:border-0 ${i % 2 === 0 ? "" : "bg-white/40"}`}>
              <td className="px-5 py-3.5">
                <div className="font-medium text-slate-700">{firm.name}</div>
                <div className="text-xs text-slate-400">{firm.id}</div>
              </td>
              <td className="px-5 py-3.5 text-slate-600">{firm.location}</td>
              <td className="px-5 py-3.5 text-slate-600 capitalize">{firm.size}</td>
              <td className="px-5 py-3.5 text-slate-600">{firm.overall_score}</td>
              <td className="px-5 py-3.5">
                <div className="flex flex-wrap gap-1">
                  {(firm.practice_areas ?? []).slice(0, 3).map((area: string) => (
                    <span key={area} className="px-2 py-0.5 bg-[#002452]/8 text-[#002452] rounded-full text-xs">{area}</span>
                  ))}
                  {(firm.practice_areas ?? []).length > 3 && (
                    <span className="text-xs text-slate-400">+{firm.practice_areas.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="px-5 py-3.5">
                {firm.verified
                  ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Verified</span>
                  : <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">Unverified</span>}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3 justify-end">
                  <Link href={`/admin/firms/${firm.id}`} className="text-xs text-[#002452] hover:opacity-70 transition-opacity font-medium">Edit</Link>
                  <DeleteFirmButton id={firm.id} name={firm.name} />
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                {hasFilters ? "No firms match the current filters." : "No firms yet. Add your first firm."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
