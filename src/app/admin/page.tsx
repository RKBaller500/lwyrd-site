import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Building2,
  Layers,
  ClipboardList,
  Users,
  ArrowRight,
  ListChecks,
  FileText,
  Newspaper,
  Plus,
  BarChart2,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = { title: "Admin Dashboard, LWYRD" };

export default async function AdminDashboard() {
  const db = createAdminClient();

  const [
    { count: firmCount },
    { count: categoryCount },
    { count: questionCount },
    { count: userCount },
    { count: criteriaCount },
    { count: submissionCount },
    { count: postCount },
  ] = await Promise.all([
    db.from("firms").select("*", { count: "exact", head: true }),
    db.from("legal_categories").select("*", { count: "exact", head: true }),
    db.from("intake_questions").select("*", { count: "exact", head: true }),
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("assessment_criteria").select("*", { count: "exact", head: true }),
    db.from("intake_submissions").select("*", { count: "exact", head: true }),
    db.from("blog_posts").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Blog Posts", count: postCount ?? 0, href: "/admin/blog", icon: Newspaper },
    { label: "Firms", count: firmCount ?? 0, href: "/admin/firms", icon: Building2 },
    { label: "Categories", count: categoryCount ?? 0, href: "/admin/categories", icon: Layers },
    { label: "Questions", count: questionCount ?? 0, href: "/admin/questions", icon: ClipboardList },
    { label: "Criteria", count: criteriaCount ?? 0, href: "/admin/criteria", icon: ListChecks },
    { label: "Submissions", count: submissionCount ?? 0, href: "/admin/submissions", icon: FileText },
    { label: "Users", count: userCount ?? 0, href: "/admin/users", icon: Users },
  ];

  const quickActions = [
    { label: "Write a blog post", sub: "Draft and publish a new article", href: "/admin/blog/new", icon: Newspaper },
    { label: "Add a firm", sub: "List a new law firm", href: "/admin/firms/new", icon: Building2 },
    { label: "New category", sub: "Add a legal practice area", href: "/admin/categories/new", icon: Layers },
    { label: "View analytics", sub: "Platform activity and trends", href: "/admin/analytics", icon: BarChart2 },
  ];

  return (
    <div>
      <AdminHeader
        eyebrow="Admin"
        title="Dashboard"
        subtitle="An overview of everything running on the LWYRD platform."
      />

      <div className="adm-stat-grid cols-6" style={{ marginBottom: 32 }}>
        {stats.map(({ label, count, href, icon: Icon }) => (
          <Link key={label} href={href} className="adm-stat">
            <div className="adm-stat-top">
              <span className="adm-stat-ico">
                <Icon size={17} strokeWidth={1.75} />
              </span>
              <ArrowRight size={15} className="adm-stat-arrow" />
            </div>
            <div className="adm-stat-n">{count}</div>
            <div className="adm-stat-l">{label}</div>
          </Link>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-card-title">Quick actions</div>
        <div className="adm-card-sub">Jump straight into the most common tasks.</div>
        <div className="adm-quick-grid">
          {quickActions.map(({ label, sub, href, icon: Icon }) => (
            <Link key={href} href={href} className="adm-quick">
              <span className="adm-stat-ico">
                <Icon size={17} strokeWidth={1.75} />
              </span>
              <div>
                <div className="adm-quick-t">{label}</div>
                <div className="adm-quick-s">{sub}</div>
              </div>
              <Plus size={16} className="adm-quick-arrow" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
