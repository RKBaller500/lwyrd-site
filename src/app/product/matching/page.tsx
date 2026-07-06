import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body, js } from "@/components/marketing/pages/matching.data";

export const metadata = { title: "Matching | LWYRD" };

export default function MatchingPage() {
  return <MarketingPageClient css={css} body={body} js={js} current="product" />;
}
