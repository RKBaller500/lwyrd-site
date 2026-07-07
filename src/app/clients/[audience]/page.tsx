import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ClientAudienceView, { type ClientAudience } from "@/components/marketing/ClientAudienceView";

const AUDIENCES: Record<string, ClientAudience> = {
  startups: {
    slug: "startups",
    eyebrow: "For startups",
    title: "Legal built for the way startups move.",
    intro:
      "From incorporation to your next round, get matched with firms that understand venture-backed companies and move at your pace.",
    points: [
      { heading: "Formation & equity", body: "Incorporate cleanly, set up your cap table, and issue equity without the guesswork." },
      { heading: "Fundraising ready", body: "Firms experienced with SAFEs, priced rounds, and the diligence investors expect." },
      { heading: "Protect your IP", body: "Lock down trademarks, IP assignment, and the agreements that keep your edge yours." },
    ],
    bullets: [
      "Matched with firms that specialize in early-stage companies",
      "Transparent pricing suited to a startup budget",
      "No pressure — firms only reach out when you decide to connect",
    ],
  },
  smbs: {
    slug: "smbs",
    eyebrow: "For small & mid-sized businesses",
    title: "Legal support that scales with your business.",
    intro:
      "Contracts, employment, disputes, and everything in between — matched with firms that know the realities of running a business.",
    points: [
      { heading: "Contracts & vendors", body: "Get agreements drafted and reviewed so every deal protects your interests." },
      { heading: "Employment & HR", body: "Hiring, policies, and compliance handled by firms that do this every day." },
      { heading: "Disputes & risk", body: "Practical counsel when something goes wrong — and guardrails so it doesn't." },
    ],
    bullets: [
      "Matched to firms sized right for your business",
      "Clear scope and pricing before you commit",
      "One front door for whatever legal need comes up",
    ],
  },
  individuals: {
    slug: "individuals",
    eyebrow: "For individuals",
    title: "The right lawyer for life's important moments.",
    intro:
      "Whether it's a personal matter, a dispute, or planning ahead, LWYRD matches you with vetted attorneys built for your exact situation.",
    points: [
      { heading: "Understand your options", body: "A short intake turns a confusing situation into clear next steps." },
      { heading: "Vetted attorneys", body: "Every firm in our network is evaluated before it can be matched to you." },
      { heading: "On your terms", body: "Compare matches, see who fits, and reach out only when you're ready." },
    ],
    bullets: [
      "Matched to attorneys experienced with your specific need",
      "Private — your answers are only used to find your match",
      "No cost to get matched and review your options",
    ],
  },
};

interface Props {
  params: Promise<{ audience: string }>;
}

export function generateStaticParams() {
  return Object.keys(AUDIENCES).map((audience) => ({ audience }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { audience } = await params;
  const data = AUDIENCES[audience];
  if (!data) return {};
  return { title: `${data.eyebrow.replace(/^For /, "")} | LWYRD`, description: data.intro };
}

export default async function ClientAudiencePage({ params }: Props) {
  const { audience } = await params;
  const data = AUDIENCES[audience];
  if (!data) notFound();
  return <ClientAudienceView data={data} />;
}
