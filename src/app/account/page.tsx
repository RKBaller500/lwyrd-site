import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountContent from "@/components/account/AccountContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | LWYRD",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
        />
      </main>
      <Footer />
    </div>
  );
}
