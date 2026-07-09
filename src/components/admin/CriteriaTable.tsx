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
    <div className="adm-panel">
      <div className="adm-toolbar">
        <select className="adm-select is-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <span className="adm-count">
          {filtered.length} of {criteria.length} criteri{criteria.length !== 1 ? "a" : "on"}
          {statusFilter ? " (filtered)" : ""}
        </span>
      </div>

      <div className="adm-table-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <SortHeader col="display_order" label="#" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="label" label="Label" sort={sort} dir={dir} onSort={handleSort} />
              <th>Description</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="adm-cell-muted">{c.display_order}</td>
                <td className="adm-cell-title">{c.label}</td>
                <td className="adm-cell-muted" style={{ maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.description}
                </td>
                <td>
                  {c.active ? (
                    <span className="adm-badge is-published"><span className="adm-badge-dot" />Active</span>
                  ) : (
                    <span className="adm-badge">Inactive</span>
                  )}
                </td>
                <td>
                  <div className="adm-row-actions" style={{ gap: 12 }}>
                    <Link href={`/admin/criteria/${c.id}`} className="adm-link">Edit</Link>
                    <DeleteAssessmentCriterionButton id={c.id} label={c.label} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="adm-table-empty">
                  {statusFilter ? "No criteria match the current filter." : "No criteria yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
