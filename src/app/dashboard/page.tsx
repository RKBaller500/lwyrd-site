"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, BookOpen, Bookmark, History, Plus } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

interface IntakeRecord {
  id: string;
  category_slug: string;
  category_label?: string;
  created_at: string;
  track?: string;
}

interface SavedFirmRecord {
  firm_id: string;
  saved_at: string;
  firms?: { name: string; tagline: string };
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [intakes, setIntakes] = useState<IntakeRecord[]>([]);
  const [savedFirms, setSavedFirms] = useState<SavedFirmRecord[]>([]);
  const [currentResults, setCurrentResults] = useState<{ count: number; categoryName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const raw = sessionStorage.getItem("lwyrd_results");
    const name = sessionStorage.getItem("lwyrd_category_name") ?? "";
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCurrentResults({ count: parsed.length, categoryName: name });
      } catch {
        // ignore
      }
    }

    async function load() {
      const [intakesRes, savedRes] = await Promise.all([
        supabase
          .from("intake_submissions")
          .select("id, category_slug, category_label, created_at, track")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_firms")
          .select("firm_id, saved_at, firms(name, tagline)")
          .eq("user_id", user!.id)
          .order("saved_at", { ascending: false })
          .limit(6),
      ]);

      const fetchedIntakes = (intakesRes.data ?? []) as IntakeRecord[];
      setIntakes(fetchedIntakes);

      // If the DB has no submissions, the sessionStorage results are stale — clear them.
      if (fetchedIntakes.length === 0) {
        sessionStorage.removeItem("lwyrd_results");
        sessionStorage.removeItem("lwyrd_category");
        sessionStorage.removeItem("lwyrd_category_name");
        sessionStorage.removeItem("lwyrd_match_scores");
        setCurrentResults(null);
      }

      if (savedRes.data) setSavedFirms(savedRes.data as unknown as SavedFirmRecord[]);
      setLoading(false);
    }

    load();
  }, [user, supabase]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-14">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-12"
        >
          <h1
            className="text-4xl sm:text-5xl text-[#002452] mb-2"
            style={{ ...lora, fontWeight: 500 }}
          >
            Welcome back, {firstName}.
          </h1>
          {currentResults ? (
            <p className="text-slate-500 text-base">
              You have {currentResults.count} active{" "}
              {currentResults.count === 1 ? "match" : "matches"}
              {currentResults.categoryName ? ` in ${currentResults.categoryName}` : ""}.
            </p>
          ) : intakes.length === 0 ? (
            <p className="text-slate-500 text-base">
              You haven&apos;t started an intake yet.{" "}
              <Link href="/intake/start" className="text-[#002452] font-medium hover:underline">
                Get Matched →
              </Link>
            </p>
          ) : null}
        </motion.div>

        <div className="space-y-10">
          {/* Active Matches */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <BookOpen size={18} className="text-[#002452]" strokeWidth={1.5} />
              <h2 className="text-[#002452] text-xl" style={{ ...lora, fontWeight: 500 }}>
                Your matches
              </h2>
            </div>

            {currentResults ? (
              <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[#002452] font-medium text-sm" style={lora}>
                    {currentResults.categoryName || "Most recent intake"}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {currentResults.count} matched {currentResults.count === 1 ? "firm" : "firms"}
                  </p>
                </div>
                <Link
                  href="/results"
                  className="inline-flex items-center gap-1.5 text-sm text-[#002452] font-medium hover:opacity-70 transition-opacity shrink-0"
                >
                  View all matches
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8 text-center">
                <p className="text-slate-500 text-sm mb-4">No active matches yet.</p>
                <Link
                  href="/intake/start"
                  className="inline-flex items-center gap-2 bg-[#002452] text-white text-sm font-medium px-5 py-2.5 rounded-2xl hover:opacity-90 transition-opacity"
                >
                  Start intake
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </motion.section>

          {/* Saved Firms */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <Bookmark size={18} className="text-[#002452]" strokeWidth={1.5} />
              <h2 className="text-[#002452] text-xl" style={{ ...lora, fontWeight: 500 }}>
                Saved firms
              </h2>
            </div>

            {loading ? (
              <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 animate-pulse h-20" />
            ) : savedFirms.length === 0 ? (
              <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-7">
                <p className="text-slate-500 text-sm">
                  You haven&apos;t saved any firms yet. Browse your matches to save the ones that interest you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedFirms.map((sf) => (
                  <Link
                    key={sf.firm_id}
                    href={`/firms/${sf.firm_id}`}
                    className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <p className="text-[#002452] text-sm font-medium mb-1" style={lora}>
                      {sf.firms?.name ?? "Saved Firm"}
                    </p>
                    {sf.firms?.tagline && (
                      <p className="text-slate-400 text-xs line-clamp-2">{sf.firms.tagline}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </motion.section>

          {/* Intake History */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <History size={18} className="text-[#002452]" strokeWidth={1.5} />
              <h2 className="text-[#002452] text-xl" style={{ ...lora, fontWeight: 500 }}>
                Your intakes
              </h2>
            </div>

            {loading ? (
              <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 animate-pulse h-20" />
            ) : intakes.length === 0 ? (
              <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-7">
                <p className="text-slate-500 text-sm">No completed intakes yet.</p>
              </div>
            ) : (
              <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl overflow-hidden">
                {intakes.map((intake, i) => (
                  <div
                    key={intake.id}
                    className={`flex items-center justify-between gap-4 px-6 py-4 ${
                      i < intakes.length - 1 ? "border-b border-[#ddd7cc]" : ""
                    }`}
                  >
                    <div>
                      <p className="text-[#002452] text-sm font-medium" style={lora}>
                        {intake.category_label ?? intake.category_slug}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {intake.track ? `${intake.track.replace("_", " ")} · ` : ""}
                        {new Date(intake.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Link
                      href="/results"
                      className="text-xs text-[#002452] font-medium hover:opacity-70 transition-opacity shrink-0"
                    >
                      View results →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Start a New Matter */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="bg-[#002452] rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <Plus size={18} className="text-white/70" strokeWidth={1.5} />
              <h2 className="text-white text-xl" style={{ ...lora, fontWeight: 500 }}>
                Need help with something else?
              </h2>
            </div>
            <p className="text-white/60 text-sm mb-6">
              Start a new intake for a different legal matter. Your previous matches are saved.
            </p>
            <button
              onClick={() => router.push("/intake/start")}
              className="inline-flex items-center gap-2 bg-white text-[#002452] text-sm font-medium px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              Start New Intake
              <ArrowRight size={14} />
            </button>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
