import { createAdminClient } from "@/lib/supabase/admin";
import { DbIntakeSubmission } from "@/lib/supabase/types";
import SubmissionsTable from "@/components/admin/SubmissionsTable";

export const metadata = { title: "Submissions — LWYRD Admin" };

export default async function SubmissionsPage() {
  const db = createAdminClient();

  const { data: submissions } = await db
    .from("intake_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<DbIntakeSubmission[]>();

  const { data: profiles } = await db.from("profiles").select("id, name");

  const {
    data: { users: authUsers },
  } = await db.auth.admin.listUsers();

  const nameMap: Record<string, string> = {};
  const emailMap: Record<string, string> = {};
  (profiles ?? []).forEach((p: { id: string; name: string }) => { nameMap[p.id] = p.name; });
  authUsers.forEach((u) => { emailMap[u.id] = u.email ?? ""; });

  const rows = (submissions ?? []).map((sub) => ({
    ...sub,
    userName: nameMap[sub.user_id] ?? "",
    userEmail: emailMap[sub.user_id] ?? "",
  }));

  const tracks = [...new Set((submissions ?? []).map((s) => s.track).filter(Boolean) as string[])].sort();

  return (
    <div>
      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        Intake Submissions
      </h1>
      <p className="text-slate-500 text-sm mb-10">
        Every intake questionnaire submitted by a user — {rows.length} total.
      </p>

      <SubmissionsTable submissions={rows} tracks={tracks} />
    </div>
  );
}
