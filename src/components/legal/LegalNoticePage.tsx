import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface LegalNoticePageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export default function LegalNoticePage({ title, updated, children }: LegalNoticePageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0F1C]">
      <Navbar />
      <main className="flex-1 px-6 py-20">
        <article className="mx-auto max-w-3xl rounded-3xl border border-[#1F2A3D] bg-[#141C2E] p-8 sm:p-10">
          <Link
            href="/"
            className="mb-8 inline-block text-sm font-medium text-[#8A93A6] transition-colors hover:text-[#E6EAF2]"
          >
            Back to home
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#C9962B]">
            Legal
          </p>
          <h1
            className="mb-3 text-3xl text-[#E6EAF2] sm:text-4xl"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            {title}
          </h1>
          <p className="mb-8 text-sm text-[#8A93A6]">Last updated {updated}</p>
          <div className="space-y-6 text-sm leading-7 text-[#C8CDD8]">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
