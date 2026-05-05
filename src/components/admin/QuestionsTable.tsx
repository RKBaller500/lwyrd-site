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
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#ddd7cc] flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">All categories</option>
          <option value="global">Global</option>
          {categoryOptions.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">All types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={requiredFilter}
          onChange={(e) => setRequiredFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">Required: all</option>
          <option value="true">Required only</option>
          <option value="false">Optional only</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
          {filtered.length} of {questions.length} question{questions.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ddd7cc]">
            <SortHeader col="display_order" label="#" sort={sort} dir={dir} onSort={handleSort} className="w-8" />
            <SortHeader col="question" label="Question" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="categoryName" label="Category" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="type" label="Type" sort={sort} dir={dir} onSort={handleSort} />
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Req</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((q, i) => (
            <tr key={q.id} className={`border-b border-[#ddd7cc] last:border-0 ${i % 2 === 0 ? "" : "bg-white/40"}`}>
              <td className="px-5 py-3.5 text-slate-400 text-xs">{q.display_order}</td>
              <td className="px-5 py-3.5">
                <div className="font-medium text-slate-700 max-w-sm truncate">{q.question}</div>
                <div className="text-xs text-slate-400 font-mono">{q.id}</div>
              </td>
              <td className="px-5 py-3.5 text-slate-600">
                {q.category_slug === "global"
                  ? <span className="text-slate-400 italic">Global</span>
                  : q.categoryName}
              </td>
              <td className="px-5 py-3.5">
                <span className="px-2 py-0.5 bg-[#002452]/8 text-[#002452] rounded-full text-xs">{q.type}</span>
              </td>
              <td className="px-5 py-3.5 text-slate-500">{q.required ? "Yes" : "No"}</td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3 justify-end">
                  <Link href={`/admin/questions/${q.id}`} className="text-xs text-[#002452] hover:opacity-70 transition-opacity font-medium">Edit</Link>
                  <DeleteQuestionButton id={q.id} question={q.question} />
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                {hasFilters ? "No questions match the current filters." : "No questions yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
