"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Layers,
  ClipboardList,
  Users,
  ListChecks,
  FileText,
  BarChart2,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart2, exact: false },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/firms", label: "Firms", icon: Building2, exact: false },
      { href: "/admin/categories", label: "Categories", icon: Layers, exact: false },
      { href: "/admin/questions", label: "Questions", icon: ClipboardList, exact: false },
      { href: "/admin/criteria", label: "Criteria", icon: ListChecks, exact: false },
    ],
  },
  {
    label: "Activity",
    items: [
      { href: "/admin/submissions", label: "Submissions", icon: FileText, exact: false },
      { href: "/admin/users", label: "Users", icon: Users, exact: false },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-52 shrink-0 border-r border-[#ddd7cc] bg-[#fbfaf6] min-h-full pt-6 pb-10">
      <div className="px-4 mb-6">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
          Admin Panel
        </span>
      </div>
      <nav className="px-2 space-y-5">
        {navSections.map(({ label, items }) => (
          <div key={label}>
            <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, label: itemLabel, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-colors ${
                      active
                        ? "bg-[#002452] text-white"
                        : "text-slate-600 hover:bg-[#002452]/8 hover:text-[#002452]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                    {itemLabel}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
