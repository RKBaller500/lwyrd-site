"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import DeleteQuestionButton from "./DeleteQuestionButton";

export interface QuestionRow {
  id: string;
  question: string;
  category_slug: string;
  categoryName: string;
  type: string;
  display_order: number;
  required: boolean;
}

type SortCol = "display_order" | "question" | "categoryName" | "type";
type Dir = "asc" | "desc";

const QUESTION_TYPES = ["single-select", "multi-select", "text", "scale", "budget-range"];

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

export default function QuestionsTable({
  questions,
  categoryOptions,
}: {
  questions: QuestionRow[];
  categoryOptions: { slug: string; name: string }[];
}) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [requiredFilter, setRequiredFilter] = useState("");
  const [sort, setSort] = useState<SortCol>("display_order");
  const [dir, setDir] = useState<Dir>("asc");

  const handleSort = (col: SortCol) => {
    if (sort === col) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(col); setDir("asc"); }
  };

  const filtered = useMemo(() => {
    let rows = questions;
    if (categoryFilter) rows = rows.filter((q) => q.category_slug === categoryFilter);
    if (typeFilter) rows = rows.filter((q) => q.type === typeFilter);
    if (requiredFilter !== "") rows = rows.filter((q) => String(q.required) === requiredFilter);

    return [...rows].sort((a, b) => {
      let av: string | number = a[sort] ?? "";
      let bv: string | number = b[sort] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [questions, categoryFilter, typeFilter, requiredFilter, sort, dir]);

  const hasFilters = categoryFilter || typeFilter || requiredFilter;

  return (
    <div className="adm-panel">
      <div className="adm-toolbar">
        <select className="adm-select is-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          <option value="global">Global</option>
          {categoryOptions.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select className="adm-select is-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className="adm-select is-sm" value={requiredFilter} onChange={(e) => setRequiredFilter(e.target.value)}>
          <option value="">Required: all</option>
          <option value="true">Required only</option>
          <option value="false">Optional only</option>
        </select>
        <span className="adm-count">
          {filtered.length} of {questions.length} question{questions.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
      </div>

      <div className="adm-table-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <SortHeader col="display_order" label="#" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="question" label="Question" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="categoryName" label="Category" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="type" label="Type" sort={sort} dir={dir} onSort={handleSort} />
              <th>Req</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id}>
                <td className="adm-cell-muted">{q.display_order}</td>
                <td>
                  <Link href={`/admin/questions/${q.id}`} className="adm-cell-title" style={{ display: "block", maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {q.question}
                  </Link>
                  <span className="adm-cell-mono">{q.id}</span>
                </td>
                <td className="adm-cell-muted">
                  {q.category_slug === "global" ? <em style={{ color: "var(--faint)" }}>Global</em> : q.categoryName}
                </td>
                <td>
                  <span className="adm-badge is-navy">{q.type}</span>
                </td>
                <td className="adm-cell-muted">{q.required ? "Yes" : "No"}</td>
                <td>
                  <div className="adm-row-actions" style={{ gap: 12 }}>
                    <Link href={`/admin/questions/${q.id}`} className="adm-link">Edit</Link>
                    <DeleteQuestionButton id={q.id} question={q.question} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="adm-table-empty">
                  {hasFilters ? "No questions match the current filters." : "No questions yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
