import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
      <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
        <Navbar />
        <main className="flex-1">
          <FirmProfile firm={firm} initialSaved={savedIds.includes(id)} />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
