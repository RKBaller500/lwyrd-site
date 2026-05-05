"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import DeleteCategoryButton from "./DeleteCategoryButton";

export interface CategoryRow {
  slug: string;
  name: string;
  icon: string;
  short_description: string;
}

type SortCol = "name" | "slug";
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

export default function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortCol>("name");
  const [dir, setDir] = useState<Dir>("asc");

  const handleSort = (col: SortCol) => {
    if (sort === col) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(col); setDir("asc"); }
  };

  const filtered = useMemo(() => {
    let rows = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      const av = (a[sort] ?? "").toLowerCase();
      const bv = (b[sort] ?? "").toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [categories, search, sort, dir]);

  return (
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#ddd7cc] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#ddd7cc] rounded-xl bg-white focus:outline-none focus:border-[#002452] placeholder:text-slate-400 text-slate-700"
          />
        </div>
        <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
          {filtered.length} of {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          {search ? " (filtered)" : ""}
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ddd7cc]">
            <SortHeader col="name" label="Category" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="slug" label="Slug" sort={sort} dir={dir} onSort={handleSort} />
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((cat, i) => (
            <tr key={cat.slug} className={`border-b border-[#ddd7cc] last:border-0 ${i % 2 === 0 ? "" : "bg-white/40"}`}>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{cat.slug}</td>
              <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{cat.short_description}</td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3 justify-end">
                  <Link href={`/admin/categories/${cat.slug}`} className="text-xs text-[#002452] hover:opacity-70 transition-opacity font-medium">Edit</Link>
                  <DeleteCategoryButton slug={cat.slug} name={cat.name} />
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-10 text-center text-slate-400 text-sm">
                {search ? "No categories match the search." : "No categories yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
