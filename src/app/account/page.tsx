import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "@/styles/lwyrd-ds.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
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
    <div className="lwyrd-ds ds-page">
      <MarketingNav />
      <main className="app-shell" style={{ maxWidth: 760 }}>
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
      <MarketingFooter />
    </div>
  );
}
