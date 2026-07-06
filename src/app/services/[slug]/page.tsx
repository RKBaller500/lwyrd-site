import "@/styles/lwyrd-ds.css";
import { notFound } from "next/navigation";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
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
      <div className="lwyrd-ds ds-page">
        <MarketingNav />
        <main className="ds-main">
          <ServiceDetail category={category} />
        </main>
        <MarketingFooter />
      </div>
    </AuthGuard>
  );
}
