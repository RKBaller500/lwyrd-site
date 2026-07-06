import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body, js } from "@/components/marketing/pages/consultations.data";

export const metadata = { title: "Consultations | LWYRD" };

export default function ConsultationsPage() {
  return <MarketingPageClient css={css} body={body} js={js} current="product" />;
}
