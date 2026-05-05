import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import ServiceDetail from "@/components/services/ServiceDetail";
import { getCategoryBySlug } from "@/lib/supabase/queries";
import { getAllCategorySlugsForStaticParams } from "@/lib/supabase/build";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} | LWYRD`,
    description: category.shortDescription,
  };
}

export async function generateStaticParams() {
  return getAllCategorySlugsForStaticParams();
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
        <Navbar />
        <main className="flex-1">
          <ServiceDetail category={category} />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
