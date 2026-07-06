import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body, js } from "@/components/marketing/pages/home.data";

export default function HomePage() {
  return <MarketingPageClient css={css} body={body} js={js} />;
}
