import "@/styles/lwyrd-ds.css";
import { notFound } from "next/navigation";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import FirmProfile from "@/components/firms/FirmProfile";
import { getFirmById } from "@/lib/supabase/queries";
import { getAllFirmIdsForStaticParams } from "@/lib/supabase/build";
import { getSavedFirmIds } from "@/lib/actions/savedFirms";
import { getFirmProfileMatchContext } from "@/lib/actions/intake";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ intake?: string }>;
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

export default async function FirmPage({ params, searchParams }: Props) {
  const { id } = await params;
  const intakeId = (await searchParams)?.intake;
  const [firm, savedIds, matchContext] = await Promise.all([
    getFirmById(id),
    getSavedFirmIds(),
    getFirmProfileMatchContext(id, intakeId),
  ]);
  if (!firm) notFound();

  return (
    <AuthGuard>
      <div className="lwyrd-ds ds-page">
        <MarketingNav />
        <main className="ds-main">
          <FirmProfile firm={firm} initialSaved={savedIds.includes(id)} matchContext={matchContext} />
        </main>
        <MarketingFooter />
      </div>
    </AuthGuard>
  );
}
