import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DbIntakeSubmission } from "@/lib/supabase/types";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Submission Detail — LWYRD Admin" };

const TRACK_LABELS: Record<string, string> = {
  startup: "Startup",
  individual: "Individual",
  small_business: "Small Business",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function formatAnswerValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
  if (typeof val === "number") {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k/month`;
    return String(val);
  }
  return String(val);
}

function humanizeKey(key: string): string {
  return key.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();

  const { data: sub } = await db
    .from("intake_submissions")
    .select("*")
    .eq("id", id)
    .single<DbIntakeSubmission>();

  if (!sub) notFound();

  const { data: profile } = await db
    .from("profiles")
    .select("name")
    .eq("id", sub.user_id)
    .single<{ name: string }>();

  const {
    data: { user: authUser },
  } = await db.auth.admin.getUserById(sub.user_id);

  const userName = profile?.name ?? "Unknown";
  const userEmail = authUser?.email ?? "";

  const isV2 = !!sub.track;
  const answerEntries = Object.entries(sub.answers);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#002452] transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to Submissions
      </Link>

      <h1
        className="text-4xl text-[#002452] mb-2"
        style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
      >
        Submission Detail
      </h1>
      <p className="text-slate-500 text-sm mb-10">{formatDate(sub.created_at)}</p>

      {/* User + Track + Category */}
      <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 mb-6">
        <h2
          className="text-[#002452] text-xl mb-4"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          Submitted by
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Name</p>
            <p className="text-slate-700 text-sm">{userName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Email</p>
            <p className="text-slate-700 text-sm">{userEmail}</p>
          </div>
          {isV2 && (
            <>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Track</p>
                <p className="text-slate-700 text-sm">{TRACK_LABELS[sub.track!] ?? sub.track}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Legal Category</p>
                <p className="text-slate-700 text-sm">{sub.category_label ?? sub.legal_category ?? "—"}</p>
              </div>
            </>
          )}
          {!isV2 && (
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Category</p>
              <p className="text-slate-700 text-sm capitalize">{sub.category_slug.replace(/-/g, " ")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Answers */}
      <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 mb-6">
        <h2
          className="text-[#002452] text-xl mb-5"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          Questionnaire Answers
        </h2>
        <div className="space-y-3">
          {answerEntries.map(([key, val]) => (
            <div key={key} className="flex gap-4 border-b border-[#ddd7cc] pb-3 last:border-0 last:pb-0">
              <p className="text-xs text-slate-400 font-medium w-40 shrink-0 pt-0.5">
                {humanizeKey(key)}
              </p>
              <p className="text-slate-700 text-sm">{formatAnswerValue(val)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Matches */}
      {sub.top_matches?.length > 0 && (
        <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6">
          <h2
            className="text-[#002452] text-xl mb-5"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Top Matches
          </h2>
          <div className="space-y-2">
            {sub.top_matches.map((m, i) => (
              <div
                key={m.firmId}
                className="flex items-center justify-between bg-white border border-[#ddd7cc] rounded-2xl px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-5">{i + 1}.</span>
                  <span className="text-slate-700 text-sm font-medium">{m.firmName}</span>
                </div>
                <span className="text-[#002452] text-sm font-medium">{m.score} match</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
