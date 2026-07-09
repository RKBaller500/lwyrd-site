import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "@/styles/lwyrd-ds.css";
import "@/styles/admin.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && !profile?.is_admin) redirect("/");

  return (
    <div className="lwyrd-ds ds-page adm-body">
      <MarketingNav />
      <div className="adm-wrap">
        <AdminSidebar />
        <main className="adm-main">{children}</main>
      </div>
    </div>
  );
}
