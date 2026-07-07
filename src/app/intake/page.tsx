import "@/styles/lwyrd-ds.css";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
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
      <div className="lwyrd-ds ds-page">
        <MarketingNav />
        <main className="ds-main">
          <IntakeWizard />
        </main>
        <MarketingFooter />
      </div>
    </AuthGuard>
  );
}
