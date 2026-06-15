import { createAdminClient } from "@/lib/supabase/admin";
import SubmissionsTable from "@/components/admin/SubmissionsTable";

export const metadata = { title: "Submissions — LWYRD Admin" };

export default async function SubmissionsPage() {
  const db = createAdminClient();

  const { data: submissions } = await db
    .from("intake_submissions")
    .select("id, user_id, category_slug, track, legal_category, category_label, answers, created_at, matches(match_score, match_rank, firm_id, firms(name))")
    .order("created_at", { ascending: false });

  const { data: profiles } = await db.from("profiles").select("id, full_name");

  const {
    data: { users: authUsers },
  } = await db.auth.admin.listUsers();

  const nameMap: Record<string, string> = {};
  const emailMap: Record<string, string> = {};
  (profiles ?? []).forEach((p: { id: string; full_name: string }) => { nameMap[p.id] = p.full_name; });
  authUsers.forEach((u) => { emailMap[u.id] = u.email ?? ""; });

  const rows = (submissions ?? []).map((sub) => {
    const matchList = ((sub as unknown as { matches?: { match_score: number; match_rank: number; firm_id: string; firms: { name: string } | null }[] }).matches ?? [])
      .sort((a, b) => a.match_rank - b.match_rank);
    return {
      ...sub,
      userName: nameMap[sub.user_id] ?? "",
      userEmail: emailMap[sub.user_id] ?? "",
      top_matches: matchList.map((m) => ({
        firmId: m.firm_id,
        firmName: m.firms?.name ?? "—",
        score: m.match_score,
      })),
    };
  });

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
