import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body, js } from "@/components/marketing/pages/blog.data";

export const metadata = { title: "Blog | LWYRD" };

export default function BlogPage() {
  return <MarketingPageClient css={css} body={body} js={js} current="blog" />;
}
