"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import DeleteAssessmentCriterionButton from "./DeleteAssessmentCriterionButton";

export interface CriterionRow {
  id: string;
  label: string;
  description: string;
  display_order: number;
  active: boolean;
}

type SortCol = "display_order" | "label";
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

export default function CriteriaTable({ criteria }: { criteria: CriterionRow[] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<SortCol>("display_order");
  const [dir, setDir] = useState<Dir>("asc");

  const handleSort = (col: SortCol) => {
    if (sort === col) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(col); setDir("asc"); }
  };

  const filtered = useMemo(() => {
    let rows = criteria;
    if (statusFilter === "active") rows = rows.filter((c) => c.active);
    else if (statusFilter === "inactive") rows = rows.filter((c) => !c.active);

    return [...rows].sort((a, b) => {
      let av: string | number = a[sort] ?? "";
      let bv: string | number = b[sort] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [criteria, statusFilter, sort, dir]);

  return (
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#ddd7cc] flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
          {filtered.length} of {criteria.length} criterion{criteria.length !== 1 ? "a" : ""}
          {statusFilter ? " (filtered)" : ""}
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ddd7cc]">
            <SortHeader col="display_order" label="#" sort={sort} dir={dir} onSort={handleSort} className="w-10" />
            <SortHeader col="label" label="Label" sort={sort} dir={dir} onSort={handleSort} />
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => (
            <tr key={c.id} className={`border-b border-[#ddd7cc] last:border-0 ${i % 2 === 0 ? "" : "bg-white/40"}`}>
              <td className="px-5 py-3.5 text-slate-400 text-xs">{c.display_order}</td>
              <td className="px-5 py-3.5 font-medium text-slate-700">{c.label}</td>
              <td className="px-5 py-3.5 text-slate-500 text-xs max-w-sm truncate">{c.description}</td>
              <td className="px-5 py-3.5">
                {c.active
                  ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Active</span>
                  : <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-xs">Inactive</span>}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3 justify-end">
                  <Link href={`/admin/criteria/${c.id}`} className="text-xs text-[#002452] hover:opacity-70 transition-opacity font-medium">Edit</Link>
                  <DeleteAssessmentCriterionButton id={c.id} label={c.label} />
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">
                {statusFilter ? "No criteria match the current filter." : "No criteria yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
