import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import IntakeWizard from "@/components/intake/IntakeWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Matched, LWYRD",
  description: "Tell us about your legal needs and we'll match you with the right firm.",
};

export default function IntakePage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
        <Navbar />
        <main className="flex-1">
          <IntakeWizard />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
