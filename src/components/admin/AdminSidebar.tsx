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
  Newspaper,
  Shield,
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
      { href: "/admin/blog", label: "Blog", icon: Newspaper, exact: false },
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

const flatItems = navSections.flatMap((s) => s.items);

function useActive() {
  const pathname = usePathname();
  return (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);
}

export default function AdminSidebar() {
  const isActive = useActive();

  return (
    <>
      {/* Mobile tab strip */}
      <div className="adm-tabs">
        {flatItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`adm-tab ${isActive(href, exact) ? "is-active" : ""}`}
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </div>

      {/* Desktop sidebar */}
      <aside className="adm-side">
        <div className="adm-side-inner">
          <div className="adm-side-head">
            <span className="adm-side-badge">
              <Shield size={15} strokeWidth={2} />
            </span>
            <div>
              <div className="t">LWYRD</div>
              <div className="s">Admin</div>
            </div>
          </div>

          {navSections.map(({ label, items }) => (
            <div key={label} className="adm-nav-group">
              <p className="adm-nav-label">{label}</p>
              {items.map(({ href, label: itemLabel, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={`adm-nav-link ${isActive(href, exact) ? "is-active" : ""}`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {itemLabel}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
