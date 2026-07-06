import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body, js } from "@/components/marketing/pages/faq.data";

export const metadata = { title: "FAQ | LWYRD" };

export default function FaqPage() {
  return <MarketingPageClient css={css} body={body} js={js} current="help" />;
}
