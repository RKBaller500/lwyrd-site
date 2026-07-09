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
    <div className="adm-panel">
      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="adm-count">
          {filtered.length} of {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          {search ? " (filtered)" : ""}
        </span>
      </div>

      <div className="adm-table-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <SortHeader col="name" label="Category" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="slug" label="Slug" sort={sort} dir={dir} onSort={handleSort} />
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cat) => (
              <tr key={cat.slug}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.15rem" }}>{cat.icon}</span>
                    <Link href={`/admin/categories/${cat.slug}`} className="adm-cell-title">
                      {cat.name}
                    </Link>
                  </div>
                </td>
                <td className="adm-cell-mono">{cat.slug}</td>
                <td className="adm-cell-muted" style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {cat.short_description}
                </td>
                <td>
                  <div className="adm-row-actions" style={{ gap: 12 }}>
                    <Link href={`/admin/categories/${cat.slug}`} className="adm-link">Edit</Link>
                    <DeleteCategoryButton slug={cat.slug} name={cat.name} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="adm-table-empty">
                  {search ? "No categories match the search." : "No categories yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
