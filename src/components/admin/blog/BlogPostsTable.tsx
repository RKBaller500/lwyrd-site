"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { setBlogPostStatus, deleteBlogPost } from "@/lib/actions/admin/blog";

export interface BlogPostRowLite {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: "draft" | "published";
  is_editors_pick: boolean;
  read_time_minutes: number;
  published_at: string | null;
  updated_at: string;
}

type SortCol = "title" | "status" | "updated_at";
type Dir = "asc" | "desc";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SortHead({
  col,
  label,
  sort,
  dir,
  onSort,
}: {
  col: SortCol;
  label: string;
  sort: SortCol;
  dir: Dir;
  onSort: (c: SortCol) => void;
}) {
  const active = sort === col;
  return (
    <th
      className={`sortable ${active ? "is-sorted" : ""}`}
      onClick={() => onSort(col)}
    >
      <span className="th-inner">
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )
        ) : (
          <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />
        )}
      </span>
    </th>
  );
}

export default function BlogPostsTable({ posts }: { posts: BlogPostRowLite[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortCol>("updated_at");
  const [dir, setDir] = useState<Dir>("desc");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSort = (col: SortCol) => {
    if (sort === col) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(col);
      setDir(col === "title" ? "asc" : "desc");
    }
  };

  const filtered = useMemo(() => {
    let rows = posts;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sort === "title") {
        av = a.title.toLowerCase();
        bv = b.title.toLowerCase();
      } else if (sort === "status") {
        av = a.status;
        bv = b.status;
      } else {
        av = a.updated_at;
        bv = b.updated_at;
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [posts, search, sort, dir]);

  const toggleStatus = (p: BlogPostRowLite) => {
    setBusyId(p.id);
    const next = p.status === "published" ? "draft" : "published";
    startTransition(async () => {
      await setBlogPostStatus(p.id, p.slug, next);
      setBusyId(null);
      router.refresh();
    });
  };

  const remove = (p: BlogPostRowLite) => {
    if (
      !window.confirm(
        `Delete “${p.title}”? This permanently removes the post and cannot be undone.`
      )
    )
      return;
    setBusyId(p.id);
    startTransition(async () => {
      await deleteBlogPost(p.id, p.slug);
      setBusyId(null);
      router.refresh();
    });
  };

  return (
    <div className="adm-panel">
      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search posts by title or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="adm-count">
          {filtered.length} of {posts.length} post
          {posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="adm-table-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <SortHead col="title" label="Title" sort={sort} dir={dir} onSort={handleSort} />
              <th>Category</th>
              <SortHead col="status" label="Status" sort={sort} dir={dir} onSort={handleSort} />
              <SortHead col="updated_at" label="Updated" sort={sort} dir={dir} onSort={handleSort} />
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const busy = busyId === p.id;
              return (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="adm-cell-title"
                      style={{ display: "block" }}
                    >
                      {p.title}
                    </Link>
                    <span className="adm-cell-mono">/{p.slug}</span>
                  </td>
                  <td>
                    <span className="adm-badge is-navy" style={{ textTransform: "capitalize" }}>
                      {p.category}
                    </span>
                    {p.is_editors_pick ? (
                      <span className="adm-badge" style={{ marginLeft: 6 }}>
                        Editor&apos;s pick
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span
                      className={`adm-badge ${
                        p.status === "published" ? "is-published" : "is-draft"
                      }`}
                    >
                      <span className="adm-badge-dot" />
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="adm-cell-muted">{formatDate(p.updated_at)}</td>
                  <td>
                    <div className="adm-row-actions">
                      {p.status === "published" ? (
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="adm-icon-btn"
                          title="View live"
                        >
                          <ExternalLink size={15} />
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className="adm-icon-btn"
                        disabled={busy}
                        onClick={() => toggleStatus(p)}
                        title={p.status === "published" ? "Unpublish" : "Publish"}
                      >
                        {p.status === "published" ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                      <Link
                        href={`/admin/blog/${p.id}`}
                        className="adm-icon-btn"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        className="adm-icon-btn is-danger"
                        disabled={busy}
                        onClick={() => remove(p)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="adm-table-empty">
                  No posts match “{search}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
