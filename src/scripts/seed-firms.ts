/**
 * Firm seed script — LWYRD FIRMS.xlsx (May 2026)
 *
 * Clears ALL existing firms, attorneys, and assessment items, then inserts
 * the 12 firms from the spreadsheet.
 *
 * Run with: npx tsx src/scripts/seed-firms.ts
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Firm data ─────────────────────────────────────────────────────────────────

const firms = [
  {
    id: "gunderson-dettmer",
    name: "Gunderson Dettmer",
    tagline: "The go-to firm for venture-backed startups, globally.",
    location: "Redwood City, CA",
    founded: 1995,
    size: "large",
    billing_model: "hourly",
    hourly_rate: 1150,
    budget_min: 10000,
    budget_max: 80000,
    response_time: "24h",
    overall_score: 98,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "contract-law"],
    industries: ["tech", "life-sciences", "ai", "saas"],
    company_stages: ["pre-seed", "seed", "series-a", "series-b", "series-c"],
    languages: ["English"],
    description:
      "Gunderson Dettmer is the #1-ranked VC law firm globally per PitchBook for 11 consecutive years, with a New York office of ~90 lawyers serving 600+ NYC-based clients. The firm built GDHQ, a proprietary platform with DIY contract generation tools for founders. Gunderson focuses exclusively on the venture ecosystem, which means every attorney on your matter has deep, current experience with startup formation, fundraising, and growth-stage transactions.",
    strengths: [
      "PitchBook #1 VC law firm globally for 11 consecutive years",
      "GDHQ platform with DIY contract generation for founders",
      "600+ active NYC clients",
      "Exclusively venture-focused — no dilution with other practice areas",
      "Deep relationships across the global VC community",
    ],
  },
  {
    id: "cooley-llp",
    name: "Cooley LLP",
    tagline: "Big Law depth for the venture-backed company.",
    location: "Palo Alto, CA",
    founded: 1920,
    size: "large",
    billing_model: "hourly",
    hourly_rate: 1650,
    budget_min: 15000,
    budget_max: 120000,
    response_time: "24h",
    overall_score: 97,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "governance"],
    industries: ["tech", "life-sciences", "fintech", "cybersecurity"],
    company_stages: ["pre-seed", "seed", "series-a", "series-b", "series-c"],
    languages: ["English"],
    description:
      "Cooley is ranked #1 by Vault for Emerging Companies and has incorporated thousands of VC-backed startups. The firm offers Cooley GO, a free platform of startup legal resources, and maintains a full New York office. With 1,300+ attorneys globally, Cooley provides the full-service depth of a top-10 Big Law firm while remaining deeply committed to the emerging company market.",
    strengths: [
      "Vault #1 ranking for Emerging Companies",
      "Cooley GO free platform for startup legal resources",
      "Full-service Big Law capabilities with startup-focused teams",
      "New York office with dedicated emerging company practice",
      "Thousands of VC-backed startups incorporated",
    ],
  },
  {
    id: "wilson-sonsini",
    name: "Wilson Sonsini",
    tagline: "Silicon Valley's original startup law firm.",
    location: "Palo Alto, CA",
    founded: 1961,
    size: "large",
    billing_model: "hourly",
    hourly_rate: 2100,
    budget_min: 15000,
    budget_max: 120000,
    response_time: "24h",
    overall_score: 96,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "ip-law", "contract-law"],
    industries: ["tech", "life-sciences", "fintech", "media"],
    company_stages: ["seed", "series-a", "series-b", "series-c"],
    languages: ["English"],
    description:
      "Wilson Sonsini has been at the center of the tech startup ecosystem since 1961 — the firm handled Apple's 1980 IPO and has been involved in more landmark tech transactions than any other firm. With 1,100+ attorneys and a NYC office since the early 2000s, WSGR provides Founders Workbench, a free suite of startup legal tools, and serves 3,000+ private company clients globally.",
    strengths: [
      "Decades of landmark tech transactions including Apple's 1980 IPO",
      "Founders Workbench free legal tools for startups",
      "3,000+ private company clients globally",
      "NYC office with deep venture community relationships",
      "Chambers USA ranked across multiple practice areas",
    ],
  },
  {
    id: "fenwick-west",
    name: "Fenwick & West",
    tagline: "Trusted counsel for technology companies since 1972.",
    location: "Mountain View, CA",
    founded: 1972,
    size: "large",
    billing_model: "hourly",
    hourly_rate: 1200,
    budget_min: 10000,
    budget_max: 90000,
    response_time: "24h",
    overall_score: 94,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "ip-law"],
    industries: ["tech", "saas", "life-sciences", "ai"],
    company_stages: ["seed", "series-a", "series-b", "series-c"],
    languages: ["English"],
    description:
      "Fenwick & West incorporated Apple Computer in 1974 and has been advising technology companies for over 50 years. The firm maintains a Startup Resource Center with online tools for founders, and its client roster includes Airbnb, Carta, and Sealed. With 500+ attorneys and a New York office, Fenwick is ranked AmLaw 69 and brings deep institutional knowledge of how technology companies are built, funded, and scaled.",
    strengths: [
      "50+ years advising technology companies, including Apple's incorporation",
      "Startup Resource Center with free online tools",
      "Strong track record across major tech names (Airbnb, Carta)",
      "AmLaw 69 ranking with full-service capabilities",
      "New York office serving East Coast founders",
    ],
  },
  {
    id: "goodwin-procter",
    name: "Goodwin Procter",
    tagline: "AmLaw top-20 with a dominant venture practice.",
    location: "Boston, MA",
    founded: 1912,
    size: "large",
    billing_model: "hourly",
    hourly_rate: 1500,
    budget_min: 12000,
    budget_max: 100000,
    response_time: "24h",
    overall_score: 91,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "mergers-acquisitions"],
    industries: ["tech", "life-sciences", "fintech", "pe"],
    company_stages: ["seed", "series-a", "series-b", "series-c"],
    languages: ["English"],
    description:
      "Goodwin Procter is ranked AmLaw #17 and consistently leads national VC deal count rankings. The firm co-created Founders Workbench, a popular free legal resource platform, and maintains a New York office as part of its 1,800+ attorney global network. Goodwin's emerging companies practice works across formation, fundraising, M&A, and late-stage growth, with clients including companies like Alltrna (which raised a $109M Series B).",
    strengths: [
      "AmLaw #17 with top national VC deal count",
      "Co-creator of Founders Workbench free platform",
      "New York office with dedicated emerging company team",
      "Full lifecycle coverage from formation through M&A",
      "Strong life sciences and fintech sector depth",
    ],
  },
  {
    id: "orrick",
    name: "Orrick",
    tagline: "Global innovation law firm with deep startup roots.",
    location: "San Francisco, CA",
    founded: 1863,
    size: "large",
    billing_model: "hourly",
    hourly_rate: 1500,
    budget_min: 12000,
    budget_max: 100000,
    response_time: "24h",
    overall_score: 90,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "ip-law", "governance"],
    industries: ["tech", "energy", "fintech", "life-sciences"],
    company_stages: ["pre-seed", "seed", "series-a", "series-b", "series-c"],
    languages: ["English"],
    description:
      "Orrick serves 4,500+ VC-backed companies and counts Stripe, Anthropic, Betterment, and FanDuel among its clients. The firm offers Orrick Tech Studio, a free tools platform for startups, and maintains a New York office as part of its 1,100+ attorney global network. Founded in 1863, Orrick brings institutional depth while maintaining a distinctly innovation-focused practice.",
    strengths: [
      "4,500+ VC-backed company clients including Stripe and Anthropic",
      "Orrick Tech Studio free platform for startups",
      "New York office with global network reach",
      "Energy and climate tech expertise alongside traditional startup work",
      "Chambers-ranked across technology, IP, and finance practices",
    ],
  },
  {
    id: "lowenstein-sandler",
    name: "Lowenstein Sandler",
    tagline: "500+ venture transactions a year from a top NJ/NY firm.",
    location: "Roseland, NJ",
    founded: 1961,
    size: "mid-size",
    billing_model: "hourly",
    hourly_rate: 850,
    budget_min: 6000,
    budget_max: 50000,
    response_time: "24h",
    overall_score: 90,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "fund-formation"],
    industries: ["tech", "life-sciences", "fintech", "consumer"],
    company_stages: ["pre-seed", "seed", "series-a", "series-b"],
    languages: ["English"],
    description:
      "Lowenstein Sandler handles 500+ venture transactions per year and has been named by the Wall Street Journal as one of the most active VC law firms nationally. The firm built VentureCrush, a community platform for entrepreneurs, and its NYC office serves 200+ lawyers. Clients include Harry's, Vimeo, Skillshare, and Oscar Health. Lowenstein offers more competitive rates than Big Law peers while providing comparable depth in the venture market.",
    strengths: [
      "500+ venture transactions per year",
      "WSJ-recognized as one of the most active VC law firms nationally",
      "VentureCrush community platform for founders",
      "NYC office with 200+ lawyers",
      "Competitive rates relative to Big Law peers",
    ],
  },
  {
    id: "reitler-kailas",
    name: "Reitler Kailas & Rosenblatt",
    tagline: "NYC-native boutique with a top-10 global VC track record.",
    location: "New York, NY",
    founded: 1995,
    size: "boutique",
    billing_model: "hourly",
    hourly_rate: 700,
    budget_min: 4000,
    budget_max: 35000,
    response_time: "24h",
    overall_score: 89,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "fund-formation"],
    industries: ["tech", "media", "fintech", "entertainment"],
    company_stages: ["pre-seed", "seed", "series-a", "series-b"],
    languages: ["English"],
    description:
      "Reitler Kailas & Rosenblatt is a New York-headquartered boutique ranked in PitchBook's top 10 VC law firms globally. Since founding in 1995, the firm has completed 3,500+ venture financings and $4B+ in M&A from 2021 to 2025. With ~74 attorneys focused entirely on transactions and corporate work, RKR provides Big Law quality with boutique responsiveness at meaningfully lower rates.",
    strengths: [
      "PitchBook top-10 global VC law firm",
      "3,500+ venture financings since 1995",
      "$4B+ in M&A from 2021 to 2025",
      "NYC-headquartered with deep local market relationships",
      "Boutique rates with Big Law-caliber transaction experience",
    ],
  },
  {
    id: "buhler-duggal-henry",
    name: "Buhler Duggal & Henry",
    tagline: "AmLaw-pedigree partners, boutique access and rates.",
    location: "New York, NY",
    founded: 2010,
    size: "boutique",
    billing_model: "hourly",
    hourly_rate: 500,
    budget_min: 3000,
    budget_max: 20000,
    response_time: "24h",
    overall_score: 78,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "ip-law", "governance"],
    industries: ["tech", "fintech", "healthcare", "life-sciences"],
    company_stages: ["pre-seed", "seed", "series-a"],
    languages: ["English"],
    description:
      "Buhler Duggal & Henry is a Chambers-listed NYC boutique whose founding partners trained at AmLaw 100 firms. With ~12 attorneys, the firm serves 1,000+ emerging company clients across tech, fintech, healthcare, and international matters. BDH's structure allows clients to receive partner-level attention on every matter at significantly lower billing rates than their Big Law counterparts.",
    strengths: [
      "Chambers USA NY Spotlight listing",
      "1,000+ emerging company clients",
      "Founding partners with AmLaw 100 training and pedigree",
      "Partner-level attention at boutique rates",
      "International matter experience across tech and life sciences",
    ],
  },
  {
    id: "bowery-legal",
    name: "Bowery Legal",
    tagline: "NYC startup counsel built for the early stage.",
    location: "New York, NY",
    founded: 2020,
    size: "boutique",
    billing_model: "hourly",
    hourly_rate: 475,
    budget_min: 2500,
    budget_max: 18000,
    response_time: "24h",
    overall_score: 74,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "cap-table", "contract-law"],
    industries: ["tech", "saas", "consumer", "media"],
    company_stages: ["pre-seed", "seed", "series-a"],
    languages: ["English"],
    description:
      "Bowery Legal is a Chambers-listed NYC-native boutique founded in 2020 with a focused practice in startup formation. With ~7 attorneys, the firm operates a lean, cost-efficient model specifically designed for early-stage founders who need experienced counsel without Big Law overhead. Bowery is embedded in the NYC startup community and brings deep operational familiarity with what early-stage companies actually need.",
    strengths: [
      "Chambers USA NY Spotlight listing",
      "NYC-native with deep early-stage startup focus",
      "Lean cost model with no Big Law overhead",
      "Purpose-built for pre-seed and seed stage founders",
      "Strong community presence in the NYC startup ecosystem",
    ],
  },
  {
    id: "triumph-law",
    name: "Triumph Law",
    tagline: "Startup counsel rooted in the NYC metro community.",
    location: "New York, NY",
    founded: 0,
    size: "boutique",
    billing_model: "hybrid",
    hourly_rate: 450,
    budget_min: 2000,
    budget_max: 15000,
    response_time: "48h",
    overall_score: 66,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "cap-table", "contract-law"],
    industries: ["tech", "saas"],
    company_stages: ["pre-seed", "seed"],
    languages: ["English"],
    description:
      "Triumph Law is a NYC-area boutique offering startup counsel with flexible hourly and flat-fee billing structures. The firm has community ties to Techstars NYC and handles Delaware and New York dual formation for early-stage companies. With ~10 attorneys and an approachable cost structure, Triumph is a practical option for pre-seed and seed-stage founders looking for pragmatic legal support.",
    strengths: [
      "Techstars NYC community counsel",
      "Delaware and NY dual formation experience",
      "Flexible hourly and flat-fee billing",
      "Approachable entry point for pre-seed founders",
      "NYC metro focus with strong local network",
    ],
  },
  {
    id: "fridman-law",
    name: "Fridman Law Firm",
    tagline: "Subscription-based startup and fund formation for NYC founders.",
    location: "New York, NY",
    founded: 0,
    size: "boutique",
    billing_model: "hybrid",
    hourly_rate: 425,
    budget_min: 2000,
    budget_max: 15000,
    response_time: "48h",
    overall_score: 64,
    verified: true,
    logo_url: null,
    practice_areas: ["corporate-formation", "startup-law", "venture-capital", "fund-formation", "cap-table"],
    industries: ["tech", "crypto", "fintech"],
    company_stages: ["pre-seed", "seed"],
    languages: ["English"],
    description:
      "Fridman Law Firm is a NYC boutique offering a monthly subscription billing model alongside traditional hourly work. The firm specializes in entity formation, fund formation, and VC transactions, with a notable focus on crypto and web3 startups. With ~10 attorneys and 5-star client reviews, Fridman offers startup kick-off packages designed to make formation fast and affordable.",
    strengths: [
      "Monthly subscription billing model option",
      "Startup kick-off packages for fast, affordable formation",
      "Crypto and web3 entity formation experience",
      "Fund formation alongside company formation",
      "5-star client reviews",
    ],
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log("Deleting existing firm assessment items...");
  const { error: e1 } = await db.from("firm_assessment_items").delete().neq("firm_id", "");
  if (e1) console.error("  Error:", e1.message);
  else console.log("  Done.");

  console.log("Deleting existing attorneys...");
  const { error: e2 } = await db.from("attorneys").delete().neq("firm_id", "");
  if (e2) console.error("  Error:", e2.message);
  else console.log("  Done.");

  console.log("Deleting existing firms...");
  const { error: e3 } = await db.from("firms").delete().neq("id", "");
  if (e3) console.error("  Error:", e3.message);
  else console.log("  Done.");

  console.log(`Inserting ${firms.length} firms...`);
  const { error: e4 } = await db.from("firms").insert(firms);
  if (e4) {
    console.error("  Insert error:", e4.message);
    process.exit(1);
  }
  console.log("  Done.");

  console.log("\nAll firms seeded successfully.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
