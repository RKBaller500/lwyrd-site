import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import TrustStats from "@/components/landing/TrustStats";
import CategoryPreview from "@/components/landing/CategoryPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import LwyrdStandard from "@/components/landing/LwyrdStandard";
import SocialProof from "@/components/landing/SocialProof";
import FinalCta from "@/components/landing/FinalCta";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustStats />
        <CategoryPreview />
        <HowItWorks />
        <LwyrdStandard />
        <SocialProof />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
