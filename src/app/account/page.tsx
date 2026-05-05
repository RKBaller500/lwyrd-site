import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountContent from "@/components/account/AccountContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | LWYRD",
};

interface SavedFirmRow {
  firm_id: string;
  saved_at: string;
  firms: {
    id: string;
    name: string;
    tagline: string;
    location: string;
    size: string;
    overall_score: number;
    verified: boolean;
  } | null;
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch saved firms with partial firm details
  const { data: savedRows } = await supabase
    .from("saved_firms")
    .select(
      "firm_id, saved_at, firms(id, name, tagline, location, size, overall_score, verified)"
    )
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  const savedFirms = ((savedRows ?? []) as unknown as SavedFirmRow[])
    .filter((row) => row.firms !== null)
    .map((row) => ({
      savedAt: row.saved_at,
      firm: row.firms!,
    }));

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14">
        <AccountContent
          profile={{
            id: user.id,
            name: profile?.name ?? "",
            email: user.email ?? "",
            createdAt: profile?.created_at ?? user.created_at,
            accessLevel: (profile?.access_level ?? "none") as "none" | "subscription" | "org",
          }}
          savedFirms={savedFirms}
        />
      </main>
      <Footer />
    </div>
  );
}
