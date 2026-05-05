"use client";

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import AdminUserActions from "./AdminUserActions";
import type { AdminUserRow } from "@/lib/actions/admin/users";

type SortCol = "name" | "email" | "created_at" | "saved_firms_count";
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
    <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#ddd7cc] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#ddd7cc] rounded-xl bg-white focus:outline-none focus:border-[#002452] placeholder:text-slate-400 text-slate-700"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          className="text-sm border border-[#ddd7cc] rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#002452]"
        >
          <option value="">All access levels</option>
          <option value="subscription">Subscription</option>
          <option value="org">Organization</option>
          <option value="none">No access</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
          {filtered.length} of {users.length} user{users.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ddd7cc]">
            <SortHeader col="name" label="User" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="email" label="Email" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="created_at" label="Joined" sort={sort} dir={dir} onSort={handleSort} />
            <SortHeader col="saved_firms_count" label="Saved" sort={sort} dir={dir} onSort={handleSort} />
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Access</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((user, i) => (
            <tr key={user.id} className={`border-b border-[#ddd7cc] last:border-0 ${i % 2 === 0 ? "" : "bg-white/40"}`}>
              <td className="px-5 py-3.5">
                <div className="font-medium text-slate-700">{user.name || "—"}</div>
                <div className="text-xs text-slate-400 font-mono">{user.id.slice(0, 8)}…</div>
              </td>
              <td className="px-5 py-3.5 text-slate-600">{user.email || "—"}</td>
              <td className="px-5 py-3.5 text-slate-500 text-xs">
                {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="px-5 py-3.5 text-slate-600">{user.saved_firms_count}</td>
              <td className="px-5 py-3.5">
                {user.is_admin
                  ? <span className="px-2 py-0.5 bg-[#002452]/10 text-[#002452] rounded-full text-xs font-medium">Admin</span>
                  : <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">User</span>}
              </td>
              <td className="px-5 py-3.5">
                {user.access_level === "subscription"
                  ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">Subscription</span>
                  : user.access_level === "org"
                  ? <span className="px-2 py-0.5 bg-[#002452]/10 text-[#002452] rounded-full text-xs font-medium">Organization</span>
                  : <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-xs">No access</span>}
              </td>
              <td className="px-5 py-3.5">
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
              <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                {hasFilters ? "No users match the current filters." : "No users found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
