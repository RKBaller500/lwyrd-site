import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ClientAudienceLanding, { type ClientAudienceLandingData } from "@/components/marketing/ClientAudienceLanding";

const AUDIENCES: Record<string, ClientAudienceLandingData> = {
  startups: {
    slug: "startups",
    track: "startup",
    trackLabel: "Startup track",
    problemHeadline: "Finding the right startup lawyer is harder, slower, and costlier than it should be.",
    approachHeadline: "We match you to firms built for your stage, your budget, and your exact matter.",
    finalHeadline: "Tell us what you're building. We'll find who fits.",
    finalSubline: "A few questions, about five minutes, and you'll see the firms matched to your situation.",
    primaryCta: "Get matched",
    secondaryCta: "Not sure what you need? Book a consultation",
    stats: [
      {
        kind: "number",
        value: 79,
        suffix: "%",
        caption: "contact more than one firm before hiring. Only 11% go with the first.",
      },
      {
        kind: "number",
        prefix: "$",
        value: 50,
        suffix: "K+",
        caption: "average Series A legal bill. $100K to $200K at top firms, often for work a specialist handles for far less.",
      },
      {
        kind: "ratio",
        numerator: 1,
        denominator: 3,
        caption: "startup deals stall late in diligence over preventable legal gaps, usually a missing IP assignment or unpapered equity.",
      },
    ],
    matters: [
      { value: "formation", label: "Formation and structure" },
      { value: "ip", label: "Intellectual property" },
      { value: "fundraising", label: "Fundraising and securities" },
      { value: "employment", label: "Employment and equity" },
      { value: "contracts", label: "Commercial contracts" },
      { value: "regulatory", label: "Regulatory and compliance" },
      { value: "governance", label: "Corporate governance" },
      { value: "ma", label: "M&A and exit" },
      { value: "dispute", label: "Disputes" },
    ],
    intakeDemo: {
      stepLabel: "Question 2 of 9",
      pct: 22,
      question: "What do you need help with?",
      options: [
        "Intellectual property",
        "Formation and structure",
        "Fundraising and securities",
        "Employment and equity",
      ],
    },
    result: {
      rankLabel: "Top match",
      title: "Seed-stage IP counsel",
      meta: "Boutique firm · Intellectual property · New York",
      score: 94,
      reasons: [
        "Works with seed-stage software founders",
        "Deep fit for IP assignment and trademark needs",
        "Boutique structure means direct senior-attorney attention",
      ],
      lockedText: "Firm identity hidden until you unlock this intake",
    },
    resultCaption:
      "You get firms scored to your situation, with the reasons each one fits. No firm reaches out until you decide to.",
  },
  smbs: {
    slug: "smbs",
    track: "small_business",
    trackLabel: "Small Business track",
    problemHeadline: "Most small businesses face legal issues alone, and it costs them.",
    approachHeadline: "We match you to firms that fit your business, your budget, and your exact issue.",
    finalHeadline: "Tell us what your business is dealing with. We'll find who fits.",
    finalSubline: "A few questions, about five minutes, and you'll see the firms matched to your situation.",
    primaryCta: "Get matched",
    secondaryCta: "Not sure what you need? Book a consultation",
    stats: [
      {
        kind: "ratio",
        numerator: 1,
        denominator: 5,
        caption: "small businesses lost more than $5,000 last year to preventable legal issues",
      },
      {
        kind: "number",
        value: 60,
        suffix: "%",
        caption: "do not hire a lawyer at all, and 65% say cost is why",
      },
      {
        kind: "range",
        from: 3,
        to: 5,
        suffix: " hrs / week",
        caption: "spent dealing with legal matters, roughly a full workday every two weeks",
      },
    ],
    matters: [
      { value: "business-formation-restructuring", label: "Business formation and restructuring" },
      { value: "commercial-contracts", label: "Commercial contracts" },
      { value: "employment-law", label: "Employment law" },
      { value: "intellectual-property", label: "Intellectual property" },
      { value: "business-disputes-litigation", label: "Business disputes and litigation" },
      { value: "real-estate-commercial-leases", label: "Real estate and commercial leases" },
      { value: "regulatory-licensing", label: "Regulatory and licensing" },
      { value: "tax-financial", label: "Tax and financial" },
      { value: "ma-buying-selling-business", label: "M&A and buying or selling a business" },
      { value: "data-privacy-cybersecurity", label: "Data privacy and cybersecurity" },
    ],
    intakeDemo: {
      stepLabel: "Question 3 of 8",
      pct: 34,
      question: "What's the issue you're facing?",
      options: [
        "Real estate and commercial leases",
        "Employment law",
        "Commercial contracts",
        "Business disputes and litigation",
      ],
    },
    result: {
      rankLabel: "Top match",
      title: "Commercial lease counsel",
      meta: "Boutique firm · Business and real estate · New York",
      score: 91,
      reasons: [
        "Handles commercial lease reviews for owner-operated businesses",
        "Fits a small-business matter with practical scope and clear next steps",
        "Experience with landlord negotiations and operating-risk terms",
      ],
      lockedText: "Firm identity hidden until you unlock this intake",
    },
    resultCaption:
      "You get firms scored to your situation, with the reasons each one fits. No firm reaches out until you decide to.",
  },
  individuals: {
    slug: "individuals",
    track: "individual",
    trackLabel: "Individuals track",
    problemHeadline: "When you need a lawyer for something personal, finding the right one is its own ordeal.",
    approachHeadline: "We match you to the right lawyer for your situation, and they do not reach out until you say so.",
    finalHeadline: "Tell us what you're dealing with. We'll find who fits.",
    finalSubline: "A few questions, about five minutes, and you'll see the lawyers matched to your situation.",
    primaryCta: "Get matched",
    secondaryCta: "Not sure where to start? Book a consultation",
    stats: [
      {
        kind: "number",
        value: 79,
        suffix: "%",
        caption: "contact more than one attorney before hiring, and only 11% go with the first",
      },
      {
        kind: "number",
        value: 50,
        suffix: "%",
        caption: "kept looking because they could not reach the first attorney, or never heard back",
      },
      {
        kind: "number",
        value: 41,
        suffix: "%",
        caption: "who get a personal referral actually hire the lawyer they were sent to",
      },
    ],
    matters: [
      { value: "family-law", label: "Family law" },
      { value: "estate-planning-wills", label: "Estate planning and wills" },
      { value: "real-estate", label: "Real estate" },
      { value: "personal-injury-civil-litigation", label: "Personal injury and civil litigation" },
      { value: "immigration", label: "Immigration" },
      { value: "employment", label: "Employment" },
      { value: "tax", label: "Tax" },
      { value: "criminal-defense", label: "Criminal defense" },
      { value: "bankruptcy-debt", label: "Bankruptcy and debt" },
      { value: "consumer-protection", label: "Consumer protection" },
    ],
    intakeDemo: {
      stepLabel: "Question 2 of 7",
      pct: 29,
      question: "What are you dealing with?",
      options: [
        "Family law",
        "Estate planning and wills",
        "Real estate",
        "Personal injury and civil litigation",
      ],
    },
    result: {
      rankLabel: "Top match",
      title: "Family-law counsel",
      meta: "Boutique firm · Family law · New York",
      score: 93,
      reasons: [
        "Focused on personal matters like yours, not broad general practice",
        "Strong fit for sensitive first-contact conversations",
        "Clear jurisdiction fit and practical guidance before you reach out",
      ],
      lockedText: "Attorney identity hidden until you unlock this intake",
    },
    resultCaption:
      "You get lawyers scored to your situation, with the reasons each one fits. No one reaches out until you decide to.",
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

  const titles = {
    startups: "Startups",
    smbs: "SMBs",
    individuals: "Individuals",
  } as const;

  return {
    title: `${titles[data.slug]} | LWYRD`,
    description: data.problemHeadline,
  };
}

export default async function ClientAudiencePage({ params }: Props) {
  const { audience } = await params;
  const data = AUDIENCES[audience];
  if (!data) notFound();

  return <ClientAudienceLanding data={data} />;
}
