"use client";

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import AdminUserActions from "./AdminUserActions";
import type { AdminUserRow } from "@/lib/actions/admin/users";

type SortCol = "name" | "email" | "created_at" | "saved_firms_count";
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

export default function UsersTable({ users }: { users: AdminUserRow[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [sort, setSort] = useState<SortCol>("created_at");
  const [dir, setDir] = useState<Dir>("desc");

  const handleSort = (col: SortCol) => {
    if (sort === col) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(col); setDir(col === "created_at" || col === "saved_firms_count" ? "desc" : "asc"); }
  };

  const filtered = useMemo(() => {
    let rows = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((u) =>
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
      );
    }
    if (roleFilter === "admin") rows = rows.filter((u) => u.is_admin);
    else if (roleFilter === "user") rows = rows.filter((u) => !u.is_admin);
    if (accessFilter) rows = rows.filter((u) => u.access_level === accessFilter);

    return [...rows].sort((a, b) => {
      let av: string | number = a[sort] ?? "";
      let bv: string | number = b[sort] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, search, roleFilter, accessFilter, sort, dir]);

  const hasFilters = search || roleFilter || accessFilter;

  return (
    <div className="adm-panel">
      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="adm-select is-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select className="adm-select is-sm" value={accessFilter} onChange={(e) => setAccessFilter(e.target.value)}>
          <option value="">All access levels</option>
          <option value="subscription">Subscription</option>
          <option value="org">Organization</option>
          <option value="none">No access</option>
        </select>
        <span className="adm-count">
          {filtered.length} of {users.length} user{users.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
      </div>

      <div className="adm-table-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <SortHeader col="name" label="User" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="email" label="Email" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="created_at" label="Joined" sort={sort} dir={dir} onSort={handleSort} />
              <SortHeader col="saved_firms_count" label="Saved" sort={sort} dir={dir} onSort={handleSort} />
              <th>Role</th>
              <th>Access</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="adm-cell-title">{user.name || "—"}</div>
                  <span className="adm-cell-mono">{user.id.slice(0, 8)}…</span>
                </td>
                <td className="adm-cell-muted">{user.email || "—"}</td>
                <td className="adm-cell-muted">
                  {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="adm-cell-muted">{user.saved_firms_count}</td>
                <td>
                  {user.is_admin ? (
                    <span className="adm-badge is-navy">Admin</span>
                  ) : (
                    <span className="adm-badge">User</span>
                  )}
                </td>
                <td>
                  {user.access_level === "subscription" ? (
                    <span className="adm-badge is-published"><span className="adm-badge-dot" />Subscription</span>
                  ) : user.access_level === "org" ? (
                    <span className="adm-badge is-navy">Organization</span>
                  ) : (
                    <span className="adm-badge">No access</span>
                  )}
                </td>
                <td>
                  <AdminUserActions
                    userId={user.id}
                    isAdmin={user.is_admin}
                    accessLevel={user.access_level}
                    name={user.name || user.email}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="adm-table-empty">
                  {hasFilters ? "No users match the current filters." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
