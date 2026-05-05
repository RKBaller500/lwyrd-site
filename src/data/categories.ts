import { LegalCategory } from "@/types";

export const categories: LegalCategory[] = [
  {
    slug: "startup-law",
    name: "Startup Law",
    icon: "Rocket",
    shortDescription: "Legal foundations for early-stage companies and founders.",
    heroTag: "For Founders & Early-Stage Companies",
    fullDescription:
      "Starting a company involves far more legal complexity than most founders anticipate. From choosing the right entity structure to navigating your first term sheet, the decisions you make early can define the trajectory of your company for years. Startup law encompasses everything a founding team needs to build a legally sound business—protecting your equity, your IP, and your relationships with co-founders, employees, and investors.\n\nLaw firms that specialize in startup law understand the pace and pressure of early-stage building. They have worked alongside founders across industries and know how to structure deals, draft agreements, and advise on risk without slowing you down. The best of them offer practical counsel, not just legal opinions.",
    whatFirmsDo:
      "Startup-focused law firms advise founders from the moment an idea becomes a company. They handle entity formation, equity structure, and co-founder agreements early on, then grow with you through fundraising, employment, and eventually exit. Many offer flexible billing arrangements designed for companies that are not yet generating significant revenue. They understand cap tables, safe notes, convertible instruments, and venture dynamics—and they bring that fluency to every engagement.",
    serviceExamples: [
      "Entity formation (Delaware C-Corp, LLC, benefit corporation)",
      "Co-founder agreements and equity vesting schedules",
      "Seed and Series A fundraising counsel",
      "SAFE and convertible note drafting and review",
      "Stock option plan design and 83(b) election guidance",
      "Employment agreements and offer letter templates",
      "Founder IP assignment and work-for-hire agreements",
      "NDAs and confidentiality agreements",
    ],
  },
  {
    slug: "fund-formation",
    name: "Fund Formation",
    icon: "TrendingUp",
    shortDescription: "Legal structuring for venture, private equity, and alternative investment funds.",
    heroTag: "For Fund Managers & General Partners",
    fullDescription:
      "Forming an investment fund is a technically demanding legal process with significant regulatory, tax, and structural implications. Whether you are raising a first-time venture fund, a private equity vehicle, or a family office structure, the legal work that underpins your fund will determine how smoothly you can operate, how you are perceived by institutional LPs, and how your carried interest and economics are structured.\n\nFund formation attorneys specialize in the formation documents, LP agreements, side letters, and regulatory filings that define your fund's legal architecture. They advise on fund structure, tax optimization, and compliance with securities laws, ensuring your offering is properly constructed before you begin accepting capital.",
    whatFirmsDo:
      "Fund formation firms guide GPs and managers from early structural decisions through close. They draft and negotiate limited partnership agreements, prepare private placement memoranda, advise on SEC registration exemptions, and handle the ongoing regulatory compliance that funds require. Many maintain deep relationships with institutional LPs and understand what market-standard terms look like across different fund strategies.",
    serviceExamples: [
      "Limited partnership agreement drafting and negotiation",
      "Private placement memorandum (PPM) preparation",
      "GP/management company structuring",
      "Carried interest and fee structuring",
      "Side letter negotiation with institutional LPs",
      "SEC and state blue sky exemption filings",
      "Fund tax structuring and blocker entities",
      "Offshore feeder fund formation (Cayman, Luxembourg)",
    ],
  },
  {
    slug: "intellectual-property",
    name: "Intellectual Property",
    icon: "Shield",
    shortDescription: "Protecting patents, trademarks, copyrights, and trade secrets.",
    heroTag: "For Innovators, Creators & Technology Companies",
    fullDescription:
      "Intellectual property is often the most valuable asset a company owns—and one of the most vulnerable. Whether you are a technology company protecting a software invention, a consumer brand defending its marks, or a creator asserting rights over original content, IP law governs how you establish, maintain, and enforce your ownership.\n\nIP attorneys help companies and individuals navigate a complex system of patents, trademarks, copyrights, and trade secrets. The right counsel will not only help you register and protect your IP but also advise on how to build a portfolio that deters competitors and supports your growth strategy.",
    whatFirmsDo:
      "IP firms offer both prosecution and litigation services. On the prosecution side, they help clients file and prosecute patent and trademark applications, conduct prior art searches, and develop IP portfolios. On the litigation side, they handle infringement disputes, licensing negotiations, and inter partes review proceedings. Many IP boutiques specialize by technology area—software, biotech, mechanical, chemical—allowing them to bring deep domain expertise to complex technical matters.",
    serviceExamples: [
      "Patent prosecution and portfolio strategy",
      "Trademark registration and maintenance",
      "Copyright registration and licensing",
      "Trade secret identification and protection programs",
      "IP due diligence for M&A transactions",
      "Patent infringement analysis and opinions",
      "Licensing and technology transfer agreements",
      "DMCA takedown notices and enforcement",
    ],
  },
  {
    slug: "personal-injury",
    name: "Personal Injury",
    icon: "HeartHandshake",
    shortDescription: "Legal representation for individuals injured by negligence or wrongdoing.",
    heroTag: "For Individuals Seeking Compensation & Justice",
    fullDescription:
      "A personal injury can upend your life in an instant—physically, financially, and emotionally. Navigating the legal system while recovering from an injury is an enormous burden. Personal injury attorneys exist to carry that burden on your behalf, pursuing the compensation you are owed so you can focus on healing.\n\nPersonal injury law covers a wide range of incidents, from automobile accidents and slip-and-falls to medical malpractice and product liability. The right attorney will investigate your case thoroughly, negotiate aggressively with insurance companies, and take your case to trial if necessary to achieve a fair outcome.",
    whatFirmsDo:
      "Personal injury firms typically work on contingency—meaning you pay nothing unless they win. They handle case investigation, evidence preservation, medical record collection, expert witness coordination, insurance negotiations, and litigation. Many specialize in specific incident types, giving them deep familiarity with the insurance strategies and defense tactics common in those cases. The best firms combine experienced trial lawyers with strong support staff to move cases efficiently.",
    serviceExamples: [
      "Motor vehicle accident claims (car, truck, motorcycle)",
      "Slip and fall / premises liability",
      "Medical malpractice and surgical errors",
      "Product liability and defective devices",
      "Workplace injury and third-party claims",
      "Dog bite and animal attack claims",
      "Wrongful death actions",
      "Insurance bad faith litigation",
    ],
  },
  {
    slug: "employment-law",
    name: "Employment Law",
    icon: "Users",
    shortDescription: "Workplace legal matters for both employees and employers.",
    heroTag: "For Individuals and Organizations Navigating Workplace Issues",
    fullDescription:
      "Employment law governs the full lifecycle of the employment relationship—from hiring and compensation to performance management, termination, and post-employment obligations. It is one of the most dynamic areas of law, with regulations varying significantly by state and evolving continuously through legislation and court decisions.\n\nWhether you are an individual who has experienced wrongful termination, discrimination, or wage theft, or a company building compliant HR practices and navigating a workforce dispute, employment law counsel is essential. The stakes on both sides are high, and having the right advisor makes a significant difference in outcomes.",
    whatFirmsDo:
      "Employment law firms advise both employees and employers, though most specialize in one side or the other. Employee-side firms pursue claims for wrongful termination, harassment, discrimination, and wage violations, often on contingency. Employer-side firms help companies build compliant policies, respond to government investigations, defend against claims, and manage reductions in force. Many employment firms offer employment practices audits as a proactive tool for organizations.",
    serviceExamples: [
      "Wrongful termination and retaliation claims",
      "Discrimination and harassment investigations",
      "Wage and hour compliance and audits",
      "Non-compete and non-solicitation agreements",
      "Employee handbook and policy drafting",
      "Severance agreement negotiation",
      "EEOC and NLRB response",
      "Executive employment agreement negotiation",
    ],
  },
  {
    slug: "corporate-formation",
    name: "Corporate Formation",
    icon: "Building2",
    shortDescription: "Structuring and incorporating businesses of all types and sizes.",
    heroTag: "For Business Owners Setting Up the Right Legal Foundation",
    fullDescription:
      "How you structure your business from day one has lasting consequences for taxes, liability, ownership, and governance. Whether you are a solo entrepreneur, a partnership, or a group of investors launching a new venture, the choice of entity and the quality of your formation documents will define your legal landscape for years.\n\nCorporate formation attorneys guide clients through the selection of the right entity type, the preparation of governing documents, and the establishment of internal operating procedures. They help you anticipate future needs—such as bringing in investors or adding partners—and structure the company in a way that accommodates growth without requiring expensive restructuring later.",
    whatFirmsDo:
      "Corporate formation counsel handles the legal mechanics of standing up a business. They advise on entity type selection (C-Corp, S-Corp, LLC, partnership), prepare articles of incorporation or organization, draft operating agreements and bylaws, establish capitalization structures, and handle state registration. Many also advise on tax elections, intellectual property assignments, and initial employment matters to give clients a complete legal foundation from which to operate.",
    serviceExamples: [
      "Entity type selection and structuring advice",
      "C-Corporation and LLC formation",
      "Operating agreement and bylaw drafting",
      "Initial stock or membership interest issuance",
      "Registered agent and state compliance setup",
      "Founder equity and vesting structures",
      "Buy-sell agreements for multi-owner businesses",
      "S-Corp elections and tax structuring",
    ],
  },
  {
    slug: "mergers-acquisitions",
    name: "Mergers & Acquisitions",
    icon: "ArrowLeftRight",
    shortDescription: "Legal counsel for buying, selling, and merging businesses.",
    heroTag: "For Companies and Investors Navigating Transactions",
    fullDescription:
      "Mergers and acquisitions are among the most consequential legal events in a company's lifecycle. Whether you are selling the business you built, acquiring a competitor, or merging with a strategic partner, the transaction will have profound implications for employees, investors, customers, and founders. M&A counsel is responsible for structuring the deal, managing due diligence, negotiating definitive agreements, and guiding the transaction to a successful close.\n\nM&A law is highly specialized and intensely deal-driven. The attorneys who do this work understand not just the legal mechanics of a transaction but the business and commercial dynamics that drive deal structure, valuation, and negotiation leverage.",
    whatFirmsDo:
      "M&A firms advise on both the buy-side and sell-side of transactions ranging from small private deals to large public company acquisitions. They conduct and manage due diligence, draft and negotiate letters of intent, purchase agreements, and disclosure schedules, and coordinate with investment bankers, accountants, and regulators. Post-close, they handle integration documentation and any transition services arrangements. The best M&A firms are known for their ability to manage complex multi-party processes under significant time pressure.",
    serviceExamples: [
      "Buy-side and sell-side M&A representation",
      "Letter of intent (LOI) drafting and negotiation",
      "Due diligence coordination and management",
      "Stock purchase and asset purchase agreement drafting",
      "Representations and warranties review",
      "Regulatory and antitrust filing coordination",
      "Management carve-outs and equity rollover structuring",
      "Post-close integration documentation",
    ],
  },
  {
    slug: "immigration",
    name: "Immigration Law",
    icon: "Globe",
    shortDescription: "Visas, work authorization, and pathways to permanent residency.",
    heroTag: "For Individuals, Families, and Employers",
    fullDescription:
      "Immigration law is one of the most complex and consequential areas of legal practice. The rules governing who may enter, work, and remain in the United States are dense, frequently changing, and unforgiving of procedural errors. For individuals and families, the stakes could not be higher—affecting where you live, where you can work, and whether your family stays together.\n\nFor employers, immigration compliance is an ongoing operational necessity. Sponsoring foreign national employees, maintaining compliance records, and navigating visa category limitations require specialized counsel with up-to-date knowledge of USCIS, State Department, and Department of Labor requirements.",
    whatFirmsDo:
      "Immigration firms advise individuals and employers on every aspect of US immigration law. For individuals, this includes family-based petitions, adjustment of status, naturalization, and asylum. For employers, it encompasses nonimmigrant work visa sponsorship (H-1B, L-1, O-1, TN), PERM labor certification, and EB-based green card petitions. Many immigration attorneys also handle removal defense, consular processing, and appeals before the Board of Immigration Appeals.",
    serviceExamples: [
      "H-1B, L-1, O-1, and TN visa petitions",
      "EB-1, EB-2, and EB-3 green card sponsorship",
      "PERM labor certification filings",
      "Family-based immigration petitions (I-130, I-485)",
      "Naturalization and citizenship applications",
      "Asylum and refugee status applications",
      "I-9 compliance audits for employers",
      "Removal defense and immigration court representation",
    ],
  },
  {
    slug: "tax-law",
    name: "Tax Law",
    icon: "Calculator",
    shortDescription: "Tax planning, structuring, and dispute resolution for individuals and businesses.",
    heroTag: "For Businesses and Individuals with Complex Tax Needs",
    fullDescription:
      "Tax law touches virtually every business decision and many personal financial decisions as well. From the structuring of a new business entity to the sale of assets, the management of international operations to the administration of an estate, tax consequences must be understood and planned for in advance. The cost of poor tax planning—both in dollars and in regulatory exposure—can be severe.\n\nTax attorneys provide counsel on federal, state, and international tax matters, helping clients structure transactions, comply with reporting requirements, and resolve disputes with taxing authorities. Unlike CPAs, tax attorneys can provide privileged legal advice and represent clients before the IRS and in tax court.",
    whatFirmsDo:
      "Tax law firms advise on transaction structuring, entity selection, international tax compliance, and estate and gift tax planning. They draft tax opinions, structure complex transactions to minimize tax liability, and represent clients in audits, appeals, and litigation before the Tax Court and federal courts. Many tax attorneys specialize by area—corporate tax, international tax, partnership tax, or estate and gift—allowing them to bring deep expertise to sophisticated matters.",
    serviceExamples: [
      "Business entity selection and tax structuring",
      "M&A transaction tax advice and structuring",
      "International tax planning and FBAR compliance",
      "IRS audit representation and appeals",
      "Partnership and pass-through tax planning",
      "Estate and gift tax planning",
      "Tax-exempt organization formation and compliance",
      "State and local tax (SALT) matters",
    ],
  },
  {
    slug: "family-law",
    name: "Family Law",
    icon: "Heart",
    shortDescription: "Legal representation for divorce, custody, adoption, and family matters.",
    heroTag: "For Individuals and Families in Transition",
    fullDescription:
      "Family law matters are among the most personal and emotionally charged legal proceedings a person can experience. Divorce, child custody, adoption, and prenuptial agreements involve not just legal rights and obligations but deeply human concerns about family, security, and the future. Having the right attorney makes a real difference—both in legal outcomes and in the quality of the experience.\n\nFamily law attorneys serve as both legal advocates and steady advisors during difficult transitions. The best ones combine rigorous legal skill with genuine empathy for their clients, helping them navigate complex proceedings while keeping their long-term wellbeing and that of their children in view.",
    whatFirmsDo:
      "Family law firms handle the full range of domestic relations matters. In contested proceedings, they litigate vigorously on behalf of their clients while also exploring opportunities for negotiated resolution. Many family law attorneys are trained mediators and collaborative law practitioners, offering alternative dispute resolution pathways that can reduce cost, time, and emotional toll. Firms that handle high-net-worth divorce often work alongside forensic accountants and financial advisors to address complex asset division.",
    serviceExamples: [
      "Divorce and legal separation proceedings",
      "Child custody and visitation arrangements",
      "Child support determination and modification",
      "Spousal support / alimony negotiation",
      "Prenuptial and postnuptial agreements",
      "Domestic violence protective orders",
      "Adoption (domestic and international)",
      "Guardianship and conservatorship proceedings",
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate Law",
    icon: "Home",
    shortDescription: "Transactions, development, leasing, and disputes in real property.",
    heroTag: "For Buyers, Sellers, Developers, and Investors",
    fullDescription:
      "Real estate is one of the most significant asset classes in any economy, and real estate transactions involve substantial legal complexity at every stage. Whether you are purchasing a home, acquiring commercial property, negotiating a commercial lease, or developing a mixed-use project, the legal work involved requires careful attention to title, contract terms, financing structures, and regulatory compliance.\n\nReal estate attorneys represent buyers, sellers, landlords, tenants, developers, and lenders across the full spectrum of property transactions and disputes. They ensure that transactions close cleanly, that rights are properly documented, and that clients understand their obligations and protections.",
    whatFirmsDo:
      "Real estate law firms handle both transactional and litigation matters. On the transactional side, they review and negotiate purchase agreements, conduct title due diligence, draft and negotiate commercial leases, and manage closings. On the litigation side, they handle boundary disputes, landlord-tenant conflicts, construction defect claims, and title insurance claims. Development-focused firms also advise on zoning, entitlements, and environmental compliance.",
    serviceExamples: [
      "Residential purchase and sale representation",
      "Commercial real estate acquisition and disposition",
      "Commercial lease drafting and negotiation",
      "Title examination and resolution of title defects",
      "Construction contracts and disputes",
      "Real estate joint venture structuring",
      "Zoning, land use, and entitlement counsel",
      "1031 exchange structuring",
    ],
  },
  {
    slug: "contract-law",
    name: "Contract Law",
    icon: "FileText",
    shortDescription: "Drafting, review, and negotiation of commercial contracts.",
    heroTag: "For Businesses Entering, Managing, or Exiting Agreements",
    fullDescription:
      "Contracts are the legal backbone of nearly every business relationship. From vendor agreements and SaaS terms to partnership contracts and licensing deals, the quality and precision of your contracts determines your rights, your risks, and your remedies when things go wrong. Poor contracts create liability, ambiguity, and disputes; well-drafted contracts protect your interests and enable partnerships to function smoothly.\n\nContract law attorneys advise clients on the negotiation, drafting, and review of commercial agreements across all industries. They identify unfavorable provisions, negotiate better terms, and ensure that agreements accurately reflect the deal that was made and the protections you need.",
    whatFirmsDo:
      "Contract law firms handle a wide range of commercial agreements, from simple NDAs to multi-party licensing arrangements. They draft and negotiate vendor and supplier contracts, SaaS and technology agreements, distribution arrangements, service contracts, and more. When contracts are breached, they pursue or defend claims for damages, specific performance, or injunctive relief. Many contract attorneys develop deep expertise in particular industries, allowing them to anticipate the issues most likely to arise in deals of a given type.",
    serviceExamples: [
      "Vendor and supplier agreement drafting",
      "SaaS subscription and terms of service drafting",
      "Software and technology licensing agreements",
      "Partnership and joint venture agreements",
      "Distribution and reseller agreements",
      "Contract review and risk analysis",
      "Breach of contract claims and disputes",
      "Non-disclosure and confidentiality agreements",
    ],
  },
];

export function getCategoryBySlug(slug: string): LegalCategory | undefined {
  return categories.find((c) => c.slug === slug);
}
