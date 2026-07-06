import "@/styles/lwyrd-ds.css";
import { notFound } from "next/navigation";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import FirmProfile from "@/components/firms/FirmProfile";
import { getFirmById } from "@/lib/supabase/queries";
import { getAllFirmIdsForStaticParams } from "@/lib/supabase/build";
import { getSavedFirmIds } from "@/lib/actions/savedFirms";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const firm = await getFirmById(id);
  if (!firm) return {};
  return {
    title: `${firm.name} | LWYRD`,
    description: firm.tagline,
  };
}

export async function generateStaticParams() {
  return getAllFirmIdsForStaticParams();
}

export default async function FirmPage({ params }: Props) {
  const { id } = await params;
  const [firm, savedIds] = await Promise.all([
    getFirmById(id),
    getSavedFirmIds(),
  ]);
  if (!firm) notFound();

  return (
    <AuthGuard>
      <div className="lwyrd-ds ds-page">
        <MarketingNav />
        <main className="ds-main">
          <FirmProfile firm={firm} initialSaved={savedIds.includes(id)} />
        </main>
        <MarketingFooter />
      </div>
    </AuthGuard>
  );
}
