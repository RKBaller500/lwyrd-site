import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Building2, Layers, ClipboardList, Users, ArrowRight, ListChecks, FileText } from "lucide-react";

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
  ] = await Promise.all([
    db.from("firms").select("*", { count: "exact", head: true }),
    db.from("legal_categories").select("*", { count: "exact", head: true }),
    db.from("intake_questions").select("*", { count: "exact", head: true }),
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("assessment_criteria").select("*", { count: "exact", head: true }),
    db.from("intake_submissions").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Firms", count: firmCount ?? 0, href: "/admin/firms", icon: Building2 },
    { label: "Categories", count: categoryCount ?? 0, href: "/admin/categories", icon: Layers },
    { label: "Questions", count: questionCount ?? 0, href: "/admin/questions", icon: ClipboardList },
    { label: "Criteria", count: criteriaCount ?? 0, href: "/admin/criteria", icon: ListChecks },
    { label: "Submissions", count: submissionCount ?? 0, href: "/admin/submissions", icon: FileText },
    { label: "Users", count: userCount ?? 0, href: "/admin/users", icon: Users },
  ];

  return (
    <div>
      <h1
        className="text-4xl text-[#002B55] mb-2"
        style={{ fontFamily: "var(--display)", fontWeight: 500 }}
      >
        Dashboard
      </h1>
      <p className="text-slate-500 text-sm mb-10">Overview of your LWYRD platform.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {stats.map(({ label, count, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="bg-[#FFFFFF] border border-[#E7E7E3] rounded-3xl p-6 hover:border-[#002B55]/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <Icon size={18} className="text-[#002B55]" strokeWidth={1.5} />
              <ArrowRight size={14} className="text-slate-300 group-hover:text-[#002B55] transition-colors" />
            </div>
            <div
              className="text-4xl text-[#002B55] mb-1"
              style={{ fontFamily: "var(--display)" }}
            >
              {count}
            </div>
            <div className="text-sm text-slate-500">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
