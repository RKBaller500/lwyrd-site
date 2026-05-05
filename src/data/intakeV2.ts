export type V2Track = 'startup' | 'individual' | 'small_business';

export interface V2Option {
  value: string;
  label: string;
  note?: string;
}

export interface V2Question {
  id: string;
  text: string;
  subtext?: string;
  type: 'single-select' | 'multi-select' | 'budget-range' | 'state-dropdown';
  required: boolean;
  options: V2Option[];
  min?: number;
  max?: number;
  step?: number;
}

export const US_STATES: V2Option[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'DC', label: 'Washington D.C.' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'outside_us', label: 'Outside the US' },
];

// ── Q1 & Q2 ──────────────────────────────────────────────────────────────────

export const Q1: V2Question = {
  id: 'q1',
  text: 'Who best describes you?',
  subtext: 'This routes you to the right set of questions. There are no wrong answers.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'startup', label: 'Startup or early-stage company', note: 'VC-backable or growth-oriented, at any funding stage' },
    { value: 'individual', label: 'Individual / Personal matter', note: 'Not a business, this is a personal legal need' },
    { value: 'small_business', label: 'Small business', note: 'Operating business, not seeking institutional funding' },
  ],
};

const Q2_OPTIONS_STARTUP: V2Option[] = [
  { value: 'formation', label: 'Corporate Formation & Structure', note: 'Entity type, founders\' agreement, cap table' },
  { value: 'ip', label: 'Intellectual Property', note: 'Patents, trademarks, trade secrets, IP assignment' },
  { value: 'fundraising', label: 'Fundraising & Securities', note: 'SAFE notes, term sheets, equity rounds' },
  { value: 'employment', label: 'Employment & Equity Compensation', note: 'Hiring, offer letters, stock options, contractors' },
  { value: 'contracts', label: 'Commercial Contracts', note: 'Customer agreements, vendor contracts, NDAs, SaaS' },
  { value: 'regulatory', label: 'Regulatory & Compliance', note: 'Fintech/healthtech licensing, GDPR/CCPA, T&Cs' },
  { value: 'governance', label: 'Corporate Governance', note: 'Board structure, shareholder agreements, amendments' },
  { value: 'ma', label: 'M&A / Exit', note: 'Acquisition, acqui-hire, due diligence prep' },
  { value: 'dispute', label: 'Dispute Resolution', note: 'Co-founder disputes, IP claims, investor conflicts' },
];

const Q2_OPTIONS_INDIVIDUAL: V2Option[] = [
  { value: 'family', label: 'Family Law', note: 'Divorce, custody, prenups, adoption' },
  { value: 'estate', label: 'Estate Planning & Wills', note: 'Wills, trusts, power of attorney, probate' },
  { value: 'real_estate', label: 'Real Estate', note: 'Home purchase/sale, landlord-tenant, lease review' },
  { value: 'personal_injury', label: 'Personal Injury & Civil Litigation', note: 'Accidents, malpractice, insurance disputes' },
  { value: 'immigration', label: 'Immigration', note: 'Work visas, green card, citizenship, deportation defense' },
  { value: 'employment', label: 'Employment (as an employee)', note: 'Wrongful termination, discrimination, wage claims' },
  { value: 'tax', label: 'Tax', note: 'IRS disputes, audit defense, back taxes' },
  { value: 'criminal', label: 'Criminal Defense', note: 'DUI, misdemeanor, felony, expungement' },
  { value: 'bankruptcy', label: 'Bankruptcy & Debt', note: 'Chapter 7/13, debt negotiation' },
  { value: 'consumer', label: 'Consumer Protection', note: 'Fraud, identity theft, contract disputes' },
];

const Q2_OPTIONS_SMALL_BUSINESS: V2Option[] = [
  { value: 'formation', label: 'Business Formation & Restructuring', note: 'Entity formation, operating agreements, succession' },
  { value: 'contracts', label: 'Commercial Contracts', note: 'Client agreements, vendor contracts, NDAs' },
  { value: 'employment', label: 'Employment Law', note: 'Hiring, handbooks, wage compliance, terminations' },
  { value: 'ip', label: 'Intellectual Property', note: 'Trademark, copyright, trade secrets, licensing' },
  { value: 'disputes', label: 'Business Disputes & Litigation', note: 'Contract breach, partner disputes, collections' },
  { value: 'real_estate', label: 'Real Estate & Commercial Leases', note: 'Lease negotiation, property acquisition, disputes' },
  { value: 'regulatory', label: 'Regulatory & Licensing', note: 'Industry permits, state/local compliance' },
  { value: 'tax', label: 'Tax & Financial', note: 'Business tax, IRS disputes, payroll tax' },
  { value: 'ma', label: 'M&A / Buying or Selling a Business', note: 'Purchase/sale, partner buyout, succession' },
  { value: 'data_privacy', label: 'Data Privacy & Cybersecurity', note: 'Privacy policy, data breach, CCPA/GDPR' },
];

export function getQ2ForTrack(track: V2Track): V2Question {
  const optionsMap: Record<V2Track, V2Option[]> = {
    startup: Q2_OPTIONS_STARTUP,
    individual: Q2_OPTIONS_INDIVIDUAL,
    small_business: Q2_OPTIONS_SMALL_BUSINESS,
  };
  return {
    id: 'q2',
    text: 'What area of law do you need help with?',
    subtext: 'Select the one that best fits your situation. You can always start multiple intake flows for different matters.',
    type: 'single-select',
    required: true,
    options: optionsMap[track],
  };
}

// ── STARTUP CONTEXT: S1–S4 ────────────────────────────────────────────────────

export const S1: V2Question = {
  id: 's1',
  text: 'What stage best describes your company right now?',
  subtext: 'This shapes which firms and attorneys are most relevant for your needs.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'pre_incorp', label: 'Pre-incorporation / Idea stage', note: 'Haven\'t formed the entity yet' },
    { value: 'pre_seed', label: 'Pre-Seed / Just incorporated', note: 'Entity formed, little or no outside capital raised' },
    { value: 'seed', label: 'Seed stage', note: 'Raised a seed or pre-seed round, building product' },
    { value: 'series_a', label: 'Series A', note: 'First priced institutional round closed or in process' },
    { value: 'series_b_plus', label: 'Series B or later', note: 'Growth stage, multiple institutional rounds' },
    { value: 'bootstrapped', label: 'Bootstrapped / Revenue-funded', note: 'No outside institutional capital, self-sustaining' },
  ],
};

export const S2: V2Question = {
  id: 's2',
  text: 'What industry is your startup in?',
  subtext: 'Helps match you with attorneys who specialize in your sector\'s regulatory landscape.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'tech_saas', label: 'Technology / SaaS / Software' },
    { value: 'ai_ml', label: 'AI / Machine Learning' },
    { value: 'fintech', label: 'Fintech / Financial Services' },
    { value: 'healthtech', label: 'Healthtech / Life Sciences / Biotech' },
    { value: 'consumer', label: 'Consumer / E-commerce / Marketplace' },
    { value: 'media', label: 'Media / Content / Creator Economy' },
    { value: 'hardware', label: 'Hardware / Deep Tech / Robotics' },
    { value: 'climate', label: 'Climate / Energy / Sustainability' },
    { value: 'enterprise_b2b', label: 'Enterprise SaaS / B2B' },
    { value: 'other', label: 'Other, You\'ll describe it briefly in the next step' },
  ],
};

export const S3: V2Question = {
  id: 's3',
  text: 'Are you currently fundraising or planning to raise capital in the next 6 months?',
  subtext: 'Some legal needs are urgent when a round is active or imminent.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'active_now', label: 'Yes, actively in a fundraising process right now' },
    { value: 'within_6mo', label: 'Yes, planning to raise within 6 months' },
    { value: 'not_raising', label: 'No, not raising capital at this time' },
    { value: 'bootstrapped', label: 'Bootstrapped, no plans to raise institutional capital' },
  ],
};

export const S4: V2Question = {
  id: 's4',
  text: 'How many co-founders does the company have?',
  subtext: 'Matters for governance, equity structure, and the complexity of formation or dispute work.',
  type: 'single-select',
  required: true,
  options: [
    { value: '1', label: 'Solo founder' },
    { value: '2', label: '2 founders' },
    { value: '3_4', label: '3–4 founders' },
    { value: '5_plus', label: '5 or more' },
  ],
};

// ── STARTUP SUB-QUESTIONS: S5a–S5p ────────────────────────────────────────────

// Formation (Q2 = formation)
export const S5a: V2Question = {
  id: 's5a',
  text: 'What is the current status of your entity?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'no_entity', label: 'No entity formed yet, starting from scratch' },
    { value: 'needs_restructuring', label: 'Entity formed but needs restructuring or amendments' },
    { value: 'add_remove_founder', label: 'Existing entity, need to add or remove a co-founder' },
    { value: 'convert_entity', label: 'Need to convert entity type (e.g., LLC to C-Corp)' },
    { value: 'other', label: 'Other situation' },
  ],
};

export const S5b: V2Question = {
  id: 's5b',
  text: 'Which entity type are you considering or currently using?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'delaware_c_corp', label: 'Delaware C-Corp', note: 'Standard for VC-backed companies' },
    { value: 'llc', label: 'LLC' },
    { value: 's_corp', label: 'S-Corp' },
    { value: 'unsure', label: 'Not sure, need guidance' },
  ],
};

export const S5c: V2Question = {
  id: 's5c',
  text: 'What is the most pressing issue you need help with?',
  subtext: 'Select the one that is most urgent.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'entity_and_state', label: 'Choosing the right entity and state of incorporation' },
    { value: 'founders_agreement', label: 'Drafting founders\' agreement and equity splits' },
    { value: 'vesting', label: 'Setting up vesting schedules' },
    { value: 'ip_assignment', label: 'IP assignment agreements from founders' },
    { value: 'cap_table', label: 'Cap table setup and management' },
    { value: 'bylaws_operating_agreement', label: 'Bylaws or operating agreement drafting' },
    { value: 'other', label: 'Other issue' },
  ],
};

// IP (Q2 = ip)
export const S5d: V2Question = {
  id: 's5d',
  text: 'What type of IP protection do you need?',
  subtext: 'Select all that apply.',
  type: 'multi-select',
  required: true,
  options: [
    { value: 'patent', label: 'Patent (utility or provisional filing)' },
    { value: 'trademark', label: 'Trademark registration' },
    { value: 'copyright', label: 'Copyright' },
    { value: 'trade_secret_nda', label: 'Trade secret and NDA strategy' },
    { value: 'ip_assignment', label: 'IP assignment from founders or contractors' },
    { value: 'freedom_to_operate', label: 'Freedom-to-operate opinion' },
    { value: 'infringement', label: 'IP infringement, we are being accused or want to enforce' },
    { value: 'other', label: 'Other IP matter' },
  ],
};

export const S5e: V2Question = {
  id: 's5e',
  text: 'Has your core IP been assigned from founders and contractors to the company?',
  subtext: 'Investors will require clean IP chain of title.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'yes', label: 'Yes, all IP is assigned to the company' },
    { value: 'partial', label: 'Partially, some but not all assignments are in place' },
    { value: 'no', label: 'No, this hasn\'t been done yet' },
    { value: 'unsure', label: 'Not sure' },
  ],
};

// Fundraising (Q2 = fundraising)
export const S5f: V2Question = {
  id: 's5f',
  text: 'What type of fundraising instrument are you working with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'safe', label: 'SAFE note (Simple Agreement for Future Equity)' },
    { value: 'convertible_note', label: 'Convertible note' },
    { value: 'priced_equity', label: 'Priced equity round (Series Seed, A, etc.)' },
    { value: 'friends_family', label: 'Friends and family / angel round' },
    { value: 'unsure', label: 'Not sure, need guidance on which instrument to use' },
  ],
};

export const S5g: V2Question = {
  id: 's5g',
  text: 'What is the most pressing issue in your fundraising process?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'review_term_sheet', label: 'Reviewing and negotiating a term sheet we received' },
    { value: 'draft_from_scratch', label: 'Drafting investor documents from scratch' },
    { value: 'cap_table_modeling', label: 'Cap table modeling and dilution analysis' },
    { value: 'securities_compliance', label: 'Securities law compliance (SEC/state filings)' },
    { value: 'investor_rights', label: 'Investor rights agreements, side letters, or pro-rata rights' },
    { value: 'closing_mechanics', label: 'Closing mechanics and wire logistics' },
    { value: 'other', label: 'Other concern' },
  ],
};

export const S5h: V2Question = {
  id: 's5h',
  text: 'Approximately how large is the round you are raising or have raised?',
  subtext: 'Approximate is fine, this helps match you with firms that handle deals of your size.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'under_500k', label: 'Under $500K' },
    { value: '500k_2m', label: '$500K – $2M' },
    { value: '2m_10m', label: '$2M – $10M' },
    { value: '10m_30m', label: '$10M – $30M' },
    { value: 'over_30m', label: 'Over $30M' },
    { value: 'tbd', label: 'Not yet determined' },
  ],
};

// Employment (Q2 = employment)
export const S5i: V2Question = {
  id: 's5i',
  text: 'What is the primary employment or equity issue you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'offer_letters', label: 'Offer letters and employment agreements for first hires' },
    { value: 'esop_409a', label: 'Stock option plan (ESOP) setup and 409A valuation' },
    { value: 'equity_grants', label: 'Equity grants and option agreements for employees' },
    { value: 'contractor_classification', label: 'Contractor agreements and worker classification (1099 vs W-2)' },
    { value: 'non_compete', label: 'Non-compete and non-solicitation agreements' },
    { value: 'severance_termination', label: 'Severance, termination, or employee dispute' },
    { value: 'equity_refresh', label: 'Equity refresh grants or secondary sales' },
    { value: 'other', label: 'Other employment matter' },
  ],
};

export const S5j: V2Question = {
  id: 's5j',
  text: 'How many employees or contractors are you currently managing?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'none', label: 'None yet, making our first hire' },
    { value: '1_5', label: '1–5' },
    { value: '6_20', label: '6–20' },
    { value: '21_50', label: '21–50' },
    { value: '50_plus', label: 'More than 50' },
  ],
};

// Contracts (Q2 = contracts)
export const S5k: V2Question = {
  id: 's5k',
  text: 'What type of contract do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'customer_msa', label: 'Customer / client agreement or MSA' },
    { value: 'vendor', label: 'Vendor or supplier agreement' },
    { value: 'saas_license', label: 'SaaS or software license agreement' },
    { value: 'partnership_reseller', label: 'Partnership or reseller agreement' },
    { value: 'nda', label: 'NDA / confidentiality agreement' },
    { value: 'tos_privacy', label: 'Terms of Service and Privacy Policy' },
    { value: 'review', label: 'Contract review, the other side sent us a draft' },
    { value: 'dispute_breach', label: 'Contract dispute or breach' },
    { value: 'other', label: 'Other contract type' },
  ],
};

export const S5l: V2Question = {
  id: 's5l',
  text: 'Are you drafting this contract or reviewing one presented to you?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'drafting', label: 'Drafting from scratch' },
    { value: 'reviewing', label: 'Reviewing and negotiating a draft from the other side' },
    { value: 'mutual', label: 'Both, mutual negotiation of terms' },
    { value: 'breach_dispute', label: 'Dealing with a breach or dispute about an existing contract' },
  ],
};

// Regulatory (Q2 = regulatory)
export const S5m: V2Question = {
  id: 's5m',
  text: 'What type of regulatory or compliance issue do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'industry_licensing', label: 'Industry-specific licensing (e.g., fintech, healthtech, insurance)' },
    { value: 'data_privacy', label: 'Data privacy, GDPR, CCPA, or similar' },
    { value: 'tos_privacy_policy', label: 'Terms of Service and Privacy Policy drafting' },
    { value: 'aml_kyc', label: 'AML / KYC compliance (financial services)' },
    { value: 'fda_healthcare', label: 'FDA or healthcare-specific regulatory compliance' },
    { value: 'export_controls', label: 'Export controls or international trade compliance' },
    { value: 'general_audit', label: 'General regulatory audit or compliance review' },
    { value: 'other', label: 'Other regulatory matter' },
  ],
};

// Governance (Q2 = governance)
export const S5n: V2Question = {
  id: 's5n',
  text: 'What governance matter do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'board_setup', label: 'Setting up or restructuring the board of directors' },
    { value: 'board_consents', label: 'Board consents and written resolutions' },
    { value: 'investor_rights', label: 'Investor rights and information rights agreements' },
    { value: 'shareholder_amendments', label: 'Shareholder agreement amendments' },
    { value: 'protective_provisions', label: 'Protective provisions or voting agreements' },
    { value: 'corporate_housekeeping', label: 'General corporate housekeeping and records cleanup' },
    { value: 'other', label: 'Other governance matter' },
  ],
};

// M&A (Q2 = ma)
export const S5o: V2Question = {
  id: 's5o',
  text: 'What type of M&A or exit situation are you navigating?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'being_acquired', label: 'We are being acquired (asset or stock purchase)' },
    { value: 'acquiring', label: 'We are acquiring another company' },
    { value: 'acqui_hire', label: 'Acqui-hire, our team is being hired by an acquirer' },
    { value: 'exit_prep', label: 'Preparing for exit, due diligence cleanup' },
    { value: 'secondary_sale', label: 'Secondary sale, founders or early investors selling shares' },
    { value: 'merger_jv', label: 'Merger or joint venture' },
    { value: 'other', label: 'Other M&A or exit situation' },
  ],
};

// Dispute (Q2 = dispute)
export const S5p: V2Question = {
  id: 's5p',
  text: 'What type of dispute are you dealing with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'cofounder_conflict', label: 'Co-founder or partner conflict' },
    { value: 'investor_board', label: 'Investor or board dispute' },
    { value: 'ip_infringement_enforce', label: 'IP infringement, someone is using our IP' },
    { value: 'ip_infringement_accused', label: 'IP infringement, we\'ve been accused' },
    { value: 'employee_contractor', label: 'Employee or contractor dispute' },
    { value: 'commercial_breach', label: 'Commercial contract breach' },
    { value: 'other', label: 'Other business dispute' },
  ],
};

// ── STARTUP CLOSING: SF1–SF8 ──────────────────────────────────────────────────

export const SF1: V2Question = {
  id: 'sf1',
  text: 'What type of law firm are you looking for?',
  subtext: 'Think about the relationship you want, not just the deliverable.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'large', label: 'Large / full-service firm', note: 'Broad resources, multiple practice areas, typically higher cost, you may work primarily with associates' },
    { value: 'boutique', label: 'Boutique firm with direct partner access', note: 'Smaller team, senior attorney involvement, specialist focus' },
    { value: 'solo', label: 'Solo practitioner', note: 'One attorney handles everything, maximum relationship and often most cost-efficient for focused matters' },
    { value: 'no_preference', label: 'No preference, match me on fit' },
  ],
};

export const SF2: V2Question = {
  id: 'sf2',
  text: 'How do you prefer to pay for legal services?',
  subtext: 'Different matters suit different billing structures. Select what matters most to you.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'flat_fee', label: 'Flat fee, I want a fixed price for this specific project' },
    { value: 'hourly', label: 'Hourly, I expect ongoing work and am comfortable with hourly billing' },
    { value: 'retainer', label: 'Retainer / subscription, I want ongoing access to a firm for a monthly fee' },
    { value: 'equity', label: 'Equity / deferred, open to non-cash arrangements', note: 'Uncommon but exists for early-stage startups' },
    { value: 'unsure', label: 'Not sure, I\'d like guidance on what\'s appropriate for my situation' },
    { value: 'other', label: 'Other billing arrangement' },
  ],
};

export const SF3: V2Question = {
  id: 'sf3',
  text: 'What is your approximate budget for this matter?',
  subtext: 'For ongoing relationships, estimate your monthly ceiling. For one-time work, estimate your total project budget. Leave at $0 if unsure.',
  type: 'budget-range',
  required: false,
  options: [],
  min: 0,
  max: 100000,
  step: 2500,
};

export const SF4: V2Question = {
  id: 'sf4',
  text: 'Is this a one-time project or the start of an ongoing relationship?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'one_time', label: 'One-time project, discrete deliverable with a defined end' },
    { value: 'ongoing', label: 'Ongoing, I expect to need legal counsel regularly' },
    { value: 'unsure', label: 'Not sure yet' },
  ],
};

export const SF5: V2Question = {
  id: 'sf5',
  text: 'How soon do you need to get started?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'this_week', label: 'Urgent, this week or within a few days' },
    { value: 'within_2_weeks', label: 'Soon, within the next 2 weeks' },
    { value: 'within_month', label: 'Within a month' },
    { value: 'exploring', label: 'No rush, exploring my options' },
  ],
};

export const SF6: V2Question = {
  id: 'sf6',
  text: 'Have you worked with a startup attorney before?',
  subtext: 'This helps us calibrate how much context-setting a firm may need to do.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'yes_ongoing', label: 'Yes, we have or had dedicated legal counsel' },
    { value: 'yes_prior', label: 'Partially, used a lawyer for a specific matter but no ongoing relationship' },
    { value: 'no', label: 'No, this is our first time hiring legal counsel' },
  ],
};

export const SF7: V2Question = {
  id: 'sf7',
  text: 'Does your firm need to be licensed in a specific state?',
  subtext: 'Required for matters involving state-specific filings or litigation. Many startup matters (e.g., Delaware formation) do not require local counsel.',
  type: 'state-dropdown',
  required: false,
  options: [
    { value: 'none', label: 'No preference, the work is not state-specific' },
    ...US_STATES,
  ],
};

export const SF8: V2Question = {
  id: 'sf8',
  text: 'Are non-English language capabilities important?',
  subtext: 'Select all that apply.',
  type: 'multi-select',
  required: false,
  options: [
    { value: 'english', label: 'No, English only is fine' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'mandarin', label: 'Mandarin' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'korean', label: 'Korean' },
    { value: 'other', label: 'Other' },
  ],
};

// ── INDIVIDUAL CONTEXT: I1–I2 ─────────────────────────────────────────────────

export const I1: V2Question = {
  id: 'i1',
  text: 'What best describes your current situation?',
  subtext: 'This gives attorneys useful context before the first conversation.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'active_issue', label: 'I have an active legal issue that needs immediate attention' },
    { value: 'upcoming_planned', label: 'I\'m planning ahead for something I know is coming', note: 'e.g., upcoming divorce, planned home purchase, estate planning' },
    { value: 'proactive', label: 'I want to protect myself or my family proactively', note: 'e.g., wills, prenups, asset protection' },
    { value: 'seeking_advice', label: 'I need advice before making a major decision' },
    { value: 'responding_to_action', label: 'I\'m responding to legal action taken against me' },
    { value: 'other', label: 'Other situation' },
  ],
};

export const I2: V2Question = {
  id: 'i2',
  text: 'Have you worked with an attorney on a personal legal matter before?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'yes', label: 'Yes, I have prior experience with personal legal counsel' },
    { value: 'no', label: 'No, this is my first time seeking legal representation' },
    { value: 'unsure', label: 'Not sure' },
  ],
};

// ── INDIVIDUAL SUB-QUESTIONS: I3a–I3q ────────────────────────────────────────

// Family Law (Q2 = family)
export const I3a: V2Question = {
  id: 'i3a',
  text: 'What is the primary family law matter you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'divorce', label: 'Divorce or separation' },
    { value: 'custody', label: 'Child custody and visitation' },
    { value: 'child_support', label: 'Child support' },
    { value: 'alimony', label: 'Spousal support / alimony' },
    { value: 'prenup', label: 'Prenuptial or postnuptial agreement' },
    { value: 'adoption', label: 'Adoption' },
    { value: 'guardianship', label: 'Guardianship' },
    { value: 'dv_protective_order', label: 'Domestic violence / protective order' },
    { value: 'other', label: 'Other family law matter' },
  ],
};

export const I3b: V2Question = {
  id: 'i3b',
  text: 'Is this matter contested or uncontested?',
  subtext: 'Contested means the other party disagrees; uncontested means both parties are largely aligned.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'uncontested', label: 'Uncontested, both parties are in general agreement' },
    { value: 'contested', label: 'Contested, there is significant disagreement' },
    { value: 'unclear', label: 'Not yet clear' },
  ],
};

export const I3c: V2Question = {
  id: 'i3c',
  text: 'Are children involved in this matter?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'yes_at_issue', label: 'Yes, custody and/or support arrangements are at issue' },
    { value: 'yes_not_at_issue', label: 'Yes, but custody and support are agreed upon' },
    { value: 'no', label: 'No children involved' },
  ],
};

// Estate Planning (Q2 = estate)
export const I3d: V2Question = {
  id: 'i3d',
  text: 'What estate planning documents do you need?',
  subtext: 'Select all that apply.',
  type: 'multi-select',
  required: true,
  options: [
    { value: 'will', label: 'Will / Last Testament' },
    { value: 'living_trust', label: 'Revocable living trust' },
    { value: 'financial_poa', label: 'Power of Attorney (financial)' },
    { value: 'healthcare_directive', label: 'Healthcare directive / living will' },
    { value: 'special_needs_trust', label: 'Trust for a minor or beneficiary with special needs' },
    { value: 'medicaid_elder_law', label: 'Medicaid planning or elder law advice' },
    { value: 'estate_administration', label: 'Estate administration or probate (someone has passed)' },
    { value: 'contested_will', label: 'Contested will or trust dispute' },
    { value: 'other', label: 'Other estate planning matter' },
  ],
};

export const I3e: V2Question = {
  id: 'i3e',
  text: 'Do you have an existing estate plan that needs updating?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'yes_needs_update', label: 'Yes, documents exist but need revision' },
    { value: 'no_starting_fresh', label: 'No, starting from scratch' },
    { value: 'unsure_validity', label: 'Not sure if existing documents are still valid' },
  ],
};

// Real Estate (Q2 = real_estate)
export const I3f: V2Question = {
  id: 'i3f',
  text: 'What real estate matter do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'buying_home', label: 'Buying a home' },
    { value: 'selling_home', label: 'Selling a home' },
    { value: 'landlord_tenant', label: 'Landlord-tenant dispute' },
    { value: 'lease_review', label: 'Lease review' },
    { value: 'eviction', label: 'Eviction (as landlord or tenant)' },
    { value: 'hoa_neighbor', label: 'HOA or neighbor dispute' },
    { value: 'foreclosure', label: 'Foreclosure defense' },
    { value: 'title_boundary', label: 'Title or boundary dispute' },
    { value: 'contractor_construction', label: 'Contractor or construction dispute' },
    { value: 'other', label: 'Other real estate matter' },
  ],
};

export const I3g: V2Question = {
  id: 'i3g',
  text: 'Are you the buyer/seller, landlord, or tenant in this matter?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'buyer', label: 'Buyer' },
    { value: 'seller', label: 'Seller' },
    { value: 'landlord', label: 'Landlord' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'na', label: 'Not applicable' },
  ],
};

// Personal Injury (Q2 = personal_injury)
export const I3h: V2Question = {
  id: 'i3h',
  text: 'What type of personal injury or civil matter is this?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'car_accident', label: 'Car accident or vehicle collision' },
    { value: 'slip_fall', label: 'Slip and fall / premises liability' },
    { value: 'medical_malpractice', label: 'Medical malpractice' },
    { value: 'wrongful_death', label: 'Wrongful death' },
    { value: 'insurance_dispute', label: 'Insurance dispute or bad faith claim' },
    { value: 'defamation', label: 'Defamation or invasion of privacy' },
    { value: 'civil_litigation', label: 'General civil litigation or lawsuit' },
    { value: 'other', label: 'Other civil or injury matter' },
  ],
};

export const I3i: V2Question = {
  id: 'i3i',
  text: 'Are you the plaintiff (bringing the claim) or defendant (defending a claim)?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'plaintiff', label: 'Plaintiff, I was harmed and want to bring a claim' },
    { value: 'defendant', label: 'Defendant, a claim has been filed against me' },
    { value: 'tbd', label: 'Not yet determined' },
  ],
};

// Immigration (Q2 = immigration)
export const I3j: V2Question = {
  id: 'i3j',
  text: 'What type of immigration matter do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'work_visa', label: 'Work visa (H-1B, O-1, L-1, TN, etc.)' },
    { value: 'green_card', label: 'Green card / permanent residency' },
    { value: 'citizenship', label: 'Citizenship and naturalization' },
    { value: 'family_immigration', label: 'Family-based immigration (sponsoring a relative)' },
    { value: 'investor_visa', label: 'Investor visa (EB-5)' },
    { value: 'asylum', label: 'Asylum or humanitarian protection' },
    { value: 'deportation_defense', label: 'Deportation defense / removal proceedings' },
    { value: 'daca_status', label: 'DACA or other status adjustment' },
    { value: 'other', label: 'Other immigration matter' },
  ],
};

export const I3k: V2Question = {
  id: 'i3k',
  text: 'What is your current immigration status in the US?',
  subtext: 'This helps match you with attorneys experienced with your specific situation.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'us_citizen', label: 'US citizen' },
    { value: 'permanent_resident', label: 'Permanent resident (green card holder)' },
    { value: 'visa_holder', label: 'Visa holder (work, student, or other)' },
    { value: 'no_status', label: 'No current valid status' },
    { value: 'prefer_not', label: 'Prefer not to say' },
  ],
};

// Employment - Individual (Q2 = employment)
export const I3l: V2Question = {
  id: 'i3l',
  text: 'What is the primary employment issue you are facing?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'wrongful_termination', label: 'Wrongful termination' },
    { value: 'discrimination', label: 'Workplace discrimination (race, gender, age, disability, etc.)' },
    { value: 'harassment', label: 'Sexual harassment or hostile work environment' },
    { value: 'wage_theft', label: 'Wage theft or unpaid overtime' },
    { value: 'non_compete', label: 'Non-compete agreement review or challenge' },
    { value: 'severance', label: 'Severance negotiation' },
    { value: 'whistleblower', label: 'Whistleblower retaliation' },
    { value: 'fmla', label: 'FMLA or leave-related dispute' },
    { value: 'other', label: 'Other employment issue' },
  ],
};

export const I3m: V2Question = {
  id: 'i3m',
  text: 'Are you still employed at the company where the issue occurred?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'yes', label: 'Yes, still employed and the issue is ongoing' },
    { value: 'no', label: 'No, I have already been terminated or resigned' },
    { value: 'complicated', label: 'It\'s complicated, on leave, under a PIP, or transitioning out' },
  ],
};

// Tax - Individual (Q2 = tax)
export const I3n: V2Question = {
  id: 'i3n',
  text: 'What tax issue do you need legal help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'irs_audit', label: 'IRS audit or examination' },
    { value: 'tax_debt', label: 'Tax debt and payment plans (OIC, installment agreement)' },
    { value: 'penalty_abatement', label: 'Penalty abatement or interest reduction' },
    { value: 'unfiled_returns', label: 'Unfiled returns or back taxes' },
    { value: 'international_fbar', label: 'International tax or FBAR compliance' },
    { value: 'tax_lien', label: 'Tax lien or levy on assets' },
    { value: 'tax_fraud', label: 'Tax fraud allegations' },
    { value: 'other', label: 'Other tax matter' },
  ],
};

// Criminal Defense

// Criminal Defense (Q2 = criminal)
export const I3o: V2Question = {
  id: 'i3o',
  text: 'What type of criminal matter are you facing?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'dui', label: 'DUI / DWI' },
    { value: 'drug_offense', label: 'Drug-related offense' },
    { value: 'misdemeanor', label: 'Misdemeanor (non-violent)' },
    { value: 'felony', label: 'Felony charge' },
    { value: 'white_collar', label: 'White-collar crime (fraud, embezzlement, etc.)' },
    { value: 'expungement', label: 'Expungement or record sealing' },
    { value: 'probation_parole', label: 'Probation or parole violation' },
    { value: 'criminal_appeal', label: 'Criminal appeal' },
    { value: 'other', label: 'Other criminal matter' },
  ],
};

export const I3p: V2Question = {
  id: 'i3p',
  text: 'What stage is this matter at?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'pre_arrest', label: 'Pre-arrest, I\'m under investigation or expect to be charged' },
    { value: 'arrested', label: 'Arrested, charges have been filed' },
    { value: 'pre_trial', label: 'Pre-trial, in the process of building a defense' },
    { value: 'post_conviction', label: 'Post-conviction, appeals or sentencing modification' },
    { value: 'expungement', label: 'Seeking expungement of a past conviction' },
  ],
};

// Bankruptcy (Q2 = bankruptcy)
export const I3q: V2Question = {
  id: 'i3q',
  text: 'What debt or bankruptcy situation are you navigating?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'chapter_7', label: 'Chapter 7 personal bankruptcy (discharge of debts)' },
    { value: 'chapter_13', label: 'Chapter 13 bankruptcy (repayment plan)' },
    { value: 'debt_negotiation', label: 'Debt negotiation or settlement without bankruptcy' },
    { value: 'creditor_harassment', label: 'Creditor harassment or collection defense' },
    { value: 'student_loans', label: 'Student loan issues' },
    { value: 'unsure', label: 'Not sure, need help evaluating options' },
    { value: 'other', label: 'Other debt situation' },
  ],
};

// Consumer Protection (Q2 = consumer), no sub-questions

// ── INDIVIDUAL CLOSING: IF1–IF6 ───────────────────────────────────────────────

export const IF1: V2Question = {
  id: 'if1',
  text: 'What type of attorney or firm are you looking for?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'large', label: 'Large firm with full resources and a team approach' },
    { value: 'boutique', label: 'Boutique firm, smaller, specialist, direct partner access' },
    { value: 'solo', label: 'Solo practitioner, one attorney who handles everything' },
    { value: 'no_preference', label: 'No preference, match me based on fit and expertise' },
  ],
};

export const IF2: V2Question = {
  id: 'if2',
  text: 'How do you prefer to pay for legal services?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'flat_fee', label: 'Flat fee, a fixed price for the work', note: 'Common for wills, immigration, simple closings' },
    { value: 'hourly', label: 'Hourly billing' },
    { value: 'contingency', label: 'Contingency, attorney is paid only if you win', note: 'Common for personal injury, employment discrimination' },
    { value: 'retainer', label: 'Retainer, upfront deposit drawn down over time', note: 'Common for divorce, ongoing matters' },
    { value: 'unsure', label: 'Not sure, I\'d like guidance' },
    { value: 'other', label: 'Other billing arrangement' },
  ],
};

export const IF3: V2Question = {
  id: 'if3',
  text: 'What is your approximate budget for this matter?',
  subtext: 'For ongoing matters, estimate a total range. For one-time matters, estimate the project cost. Leave at $0 if unsure.',
  type: 'budget-range',
  required: false,
  options: [],
  min: 0,
  max: 75000,
  step: 1500,
};

export const IF4: V2Question = {
  id: 'if4',
  text: 'How urgently do you need legal help?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'this_week', label: 'Urgent, this week or immediately' },
    { value: 'within_2_weeks', label: 'Soon, within the next 2 weeks' },
    { value: 'within_month', label: 'Within a month' },
    { value: 'planning_ahead', label: 'No immediate urgency, planning ahead' },
  ],
};

export const IF5: V2Question = {
  id: 'if5',
  text: 'In which state does this legal matter primarily take place?',
  subtext: 'Most personal legal matters require locally licensed counsel.',
  type: 'state-dropdown',
  required: true,
  options: [...US_STATES],
};

export const IF6: V2Question = {
  id: 'if6',
  text: 'Are non-English language capabilities important?',
  subtext: 'Select all that apply.',
  type: 'multi-select',
  required: false,
  options: [
    { value: 'english', label: 'No, English only' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'mandarin', label: 'Mandarin' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'korean', label: 'Korean' },
    { value: 'other', label: 'Other' },
  ],
};

// ── SMALL BUSINESS CONTEXT: B1–B3 ─────────────────────────────────────────────

export const B1: V2Question = {
  id: 'b1',
  text: 'How long has your business been operating?',
  subtext: 'This shapes which legal issues are most likely relevant and how complex they are.',
  type: 'single-select',
  required: true,
  options: [
    { value: 'pre_launch', label: 'We\'re in the process of starting, not yet open' },
    { value: 'under_1yr', label: 'Less than 1 year' },
    { value: '1_3yr', label: '1–3 years' },
    { value: '4_10yr', label: '4–10 years' },
    { value: 'over_10yr', label: 'More than 10 years' },
  ],
};

export const B2: V2Question = {
  id: 'b2',
  text: 'How many people work in your business (including yourself)?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'solo', label: 'Just me, solo operator' },
    { value: '2_5', label: '2–5 (including myself)' },
    { value: '6_20', label: '6–20' },
    { value: '21_50', label: '21–50' },
    { value: '51_100', label: '51–100' },
  ],
};

export const B3: V2Question = {
  id: 'b3',
  text: 'What industry is your business in?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'retail_ecomm', label: 'Retail / E-commerce' },
    { value: 'food_bev', label: 'Food & Beverage / Restaurant' },
    { value: 'professional_svcs', label: 'Professional Services (consulting, accounting, marketing, etc.)' },
    { value: 'healthcare', label: 'Healthcare / Medical' },
    { value: 'construction_re', label: 'Construction / Trades / Real Estate' },
    { value: 'technology', label: 'Technology' },
    { value: 'manufacturing', label: 'Manufacturing / Distribution' },
    { value: 'hospitality', label: 'Hospitality / Events' },
    { value: 'creative', label: 'Creative / Media / Agency' },
    { value: 'other', label: 'Other' },
  ],
};

// ── SMALL BUSINESS SUB-QUESTIONS: B4a–B4n ─────────────────────────────────────

// Formation (Q2 = formation)
export const B4a: V2Question = {
  id: 'b4a',
  text: 'What is the specific formation or restructuring matter?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'new_entity', label: 'Forming a new entity from scratch' },
    { value: 'convert_entity', label: 'Converting from one entity type to another (e.g., sole prop to LLC)' },
    { value: 'add_remove_partner', label: 'Adding or removing a partner/owner' },
    { value: 'operating_agreement', label: 'Drafting or updating an operating agreement' },
    { value: 'buy_sell', label: 'Buy-sell agreement between owners' },
    { value: 'succession_transition', label: 'Business succession or ownership transition planning' },
    { value: 'dissolve', label: 'Dissolving or closing the business' },
    { value: 'other', label: 'Other formation matter' },
  ],
};

export const B4b: V2Question = {
  id: 'b4b',
  text: 'How is the business currently structured?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'sole_prop', label: 'Sole proprietorship' },
    { value: 'llc', label: 'LLC' },
    { value: 's_corp', label: 'S-Corp' },
    { value: 'c_corp', label: 'C-Corp' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'not_formed', label: 'Not yet formed / no formal entity' },
  ],
};

// Contracts (Q2 = contracts)
export const B4c: V2Question = {
  id: 'b4c',
  text: 'What type of contract do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'client_service', label: 'Client or customer service agreement' },
    { value: 'vendor_supplier', label: 'Vendor or supplier contract' },
    { value: 'contractor', label: 'Independent contractor agreement' },
    { value: 'nda', label: 'Non-disclosure agreement (NDA)' },
    { value: 'non_compete', label: 'Non-compete or non-solicitation agreement' },
    { value: 'commercial_lease', label: 'Commercial lease' },
    { value: 'distribution_reseller', label: 'Distribution or reseller agreement' },
    { value: 'tos_privacy', label: 'Website terms of service and privacy policy' },
    { value: 'dispute_breach', label: 'Contract dispute or breach' },
    { value: 'other', label: 'Other contract type' },
  ],
};

export const B4d: V2Question = {
  id: 'b4d',
  text: 'Are you the drafting party or reviewing a contract presented to you?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'drafting', label: 'We are drafting the contract' },
    { value: 'reviewing', label: 'We are reviewing a contract the other side provided' },
    { value: 'mutual', label: 'Mutual negotiation' },
    { value: 'breach_dispute', label: 'Dealing with a breach or dispute' },
  ],
};

// Employment (Q2 = employment)
export const B4e: V2Question = {
  id: 'b4e',
  text: 'What employment law matter do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'hiring', label: 'Hiring, offer letters or employment agreements' },
    { value: 'classification', label: 'Employee vs. contractor classification' },
    { value: 'handbook', label: 'Employee handbook drafting or review' },
    { value: 'wage_hour', label: 'Wage and hour compliance (overtime, minimum wage)' },
    { value: 'termination', label: 'Termination, need to lay off or fire an employee' },
    { value: 'discrimination_claim', label: 'Discrimination or harassment claim against the business' },
    { value: 'non_compete', label: 'Non-compete enforcement or defense' },
    { value: 'investigation', label: 'Workplace investigation' },
    { value: 'severance', label: 'Severance agreements' },
    { value: 'other', label: 'Other employment matter' },
  ],
};

// IP (Q2 = ip)
export const B4f: V2Question = {
  id: 'b4f',
  text: 'What type of IP matter does your business need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'trademark', label: 'Trademark registration for our brand name or logo' },
    { value: 'copyright', label: 'Copyright for creative assets (website, content, products)' },
    { value: 'trade_secret_nda', label: 'Trade secret protection and NDAs' },
    { value: 'licensing', label: 'Licensing our IP to others' },
    { value: 'infringement_enforce', label: 'IP infringement, someone is copying us' },
    { value: 'infringement_accused', label: 'IP infringement, we\'ve been accused of infringement' },
    { value: 'other', label: 'Other IP matter' },
  ],
};

// Disputes (Q2 = disputes)
export const B4g: V2Question = {
  id: 'b4g',
  text: 'What type of business dispute are you navigating?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'contract_breach', label: 'Contract breach, a client, vendor, or partner didn\'t perform' },
    { value: 'partnership_dispute', label: 'Partnership or ownership dispute' },
    { value: 'customer_dispute', label: 'Customer dispute or complaint' },
    { value: 'debt_collection', label: 'Debt collection, collecting what we are owed' },
    { value: 'non_compete', label: 'Non-compete enforcement or defense' },
    { value: 'lawsuit_filed', label: 'Lawsuit filed against the business' },
    { value: 'regulatory_action', label: 'Regulatory or government action' },
    { value: 'other', label: 'Other business dispute' },
  ],
};

export const B4h: V2Question = {
  id: 'b4h',
  text: 'Is this matter in active litigation, or are you trying to resolve it before it gets there?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'filed', label: 'A lawsuit has already been filed' },
    { value: 'pre_litigation', label: 'Pre-litigation, trying to resolve before it escalates' },
    { value: 'demand_letter', label: 'Demand letter received or sent' },
    { value: 'unsure', label: 'Not sure of the stage' },
  ],
};

// Real Estate (Q2 = real_estate)
export const B4i: V2Question = {
  id: 'b4i',
  text: 'What commercial real estate matter do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'new_lease', label: 'Reviewing or negotiating a new commercial lease' },
    { value: 'renewal_amendment', label: 'Lease renewal or amendment' },
    { value: 'landlord_dispute', label: 'Landlord dispute or lease breach' },
    { value: 'purchase_property', label: 'Purchasing commercial property' },
    { value: 'zoning_permitting', label: 'Zoning or permitting issue' },
    { value: 'construction_dispute', label: 'Tenant build-out or construction dispute' },
    { value: 'other', label: 'Other real estate matter' },
  ],
};

// Regulatory (Q2 = regulatory)
export const B4j: V2Question = {
  id: 'b4j',
  text: 'What regulatory or licensing matter does your business face?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'initial_licenses', label: 'Obtaining initial business licenses or permits' },
    { value: 'industry_compliance', label: 'Industry-specific regulatory compliance (food, health, construction, etc.)' },
    { value: 'alcohol_licensing', label: 'Alcohol or liquor licensing' },
    { value: 'environmental', label: 'Environmental compliance' },
    { value: 'government_action', label: 'Government investigation or enforcement action' },
    { value: 'foreign_registration', label: 'Foreign registration in a new state' },
    { value: 'other', label: 'Other regulatory matter' },
  ],
};

// Tax (Q2 = tax)
export const B4k: V2Question = {
  id: 'b4k',
  text: 'What tax or financial legal issue do you need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'irs_audit', label: 'IRS audit or dispute' },
    { value: 'payroll_tax', label: 'Payroll tax issues' },
    { value: 'sales_tax', label: 'Sales tax compliance' },
    { value: 'tax_efficiency', label: 'Business structuring for tax efficiency' },
    { value: 'tax_debt', label: 'Tax debt resolution' },
    { value: 'estate_succession_tax', label: 'Estate or succession tax planning for business owners' },
    { value: 'other', label: 'Other tax matter' },
  ],
};

// M&A (Q2 = ma)
export const B4l: V2Question = {
  id: 'b4l',
  text: 'What type of transaction are you involved in?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'selling', label: 'Selling my business' },
    { value: 'buying', label: 'Buying another business' },
    { value: 'partner_buyout', label: 'Partner or co-owner buyout' },
    { value: 'merging', label: 'Merging with another business' },
    { value: 'succession_transfer', label: 'Business succession, transferring to family or employees' },
    { value: 'valuation', label: 'Valuation support before a sale' },
    { value: 'other', label: 'Other transaction type' },
  ],
};

export const B4m: V2Question = {
  id: 'b4m',
  text: 'What is the approximate value of the business being bought or sold?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'under_500k', label: 'Under $500K' },
    { value: '500k_2m', label: '$500K – $2M' },
    { value: '2m_10m', label: '$2M – $10M' },
    { value: 'over_10m', label: 'Over $10M' },
    { value: 'tbd', label: 'Not yet determined' },
  ],
};

// Data Privacy (Q2 = data_privacy)
export const B4n: V2Question = {
  id: 'b4n',
  text: 'What data privacy or cybersecurity matter does your business need help with?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'privacy_tos', label: 'Privacy policy and terms of service drafting' },
    { value: 'ccpa_gdpr', label: 'CCPA or GDPR compliance assessment' },
    { value: 'vendor_dpa', label: 'Vendor data processing agreements' },
    { value: 'data_breach', label: 'Data breach response and notification' },
    { value: 'hr_privacy', label: 'Employee data and HR privacy compliance' },
    { value: 'other', label: 'Other data privacy matter' },
  ],
};

// ── SMALL BUSINESS CLOSING: BF1–BF8 ──────────────────────────────────────────

export const BF1: V2Question = {
  id: 'bf1',
  text: 'What type of law firm are you looking for?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'large', label: 'Large full-service firm with broad resources' },
    { value: 'boutique', label: 'Boutique firm, smaller, specialist, direct partner access' },
    { value: 'solo', label: 'Solo practitioner, one attorney for everything', note: 'Most cost-efficient for defined matters' },
    { value: 'no_preference', label: 'No preference, match me on fit' },
  ],
};

export const BF2: V2Question = {
  id: 'bf2',
  text: 'How do you prefer to pay for legal services?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'flat_fee', label: 'Flat fee, fixed price for a specific project' },
    { value: 'hourly', label: 'Hourly billing' },
    { value: 'retainer', label: 'Retainer, monthly fee for ongoing access', note: 'Good for businesses with regular legal needs' },
    { value: 'unsure', label: 'Not sure, I\'d like guidance on what\'s appropriate' },
    { value: 'other', label: 'Other billing arrangement' },
  ],
};

export const BF3: V2Question = {
  id: 'bf3',
  text: 'What is your approximate budget for this matter?',
  subtext: 'For retainer relationships, estimate your monthly ceiling. For project work, estimate total cost. Leave at $0 if unsure.',
  type: 'budget-range',
  required: false,
  options: [],
  min: 0,
  max: 100000,
  step: 2500,
};

export const BF4: V2Question = {
  id: 'bf4',
  text: 'Is this a one-time project or the start of an ongoing relationship?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'one_time', label: 'One-time, defined project with a clear end' },
    { value: 'ongoing', label: 'Ongoing, I expect to need regular legal counsel' },
    { value: 'unsure', label: 'Not sure yet' },
  ],
};

export const BF5: V2Question = {
  id: 'bf5',
  text: 'How soon do you need to get started?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'this_week', label: 'Urgent, this week' },
    { value: 'within_2_weeks', label: 'Soon, within 2 weeks' },
    { value: 'within_month', label: 'Within a month' },
    { value: 'planning_ahead', label: 'No rush, planning ahead' },
  ],
};

export const BF6: V2Question = {
  id: 'bf6',
  text: 'Does your business currently have or recently had legal counsel?',
  type: 'single-select',
  required: true,
  options: [
    { value: 'yes_ongoing', label: 'Yes, we have an ongoing relationship with a law firm' },
    { value: 'yes_prior', label: 'We have used lawyers in the past but have no current relationship' },
    { value: 'no', label: 'No, this is our first time seeking legal counsel for the business' },
  ],
};

export const BF7: V2Question = {
  id: 'bf7',
  text: 'In which state(s) does your business primarily operate?',
  subtext: 'Many business law matters require locally licensed counsel.',
  type: 'state-dropdown',
  required: true,
  options: [
    { value: 'multi_state', label: 'Multiple states' },
    ...US_STATES,
  ],
};

export const BF8: V2Question = {
  id: 'bf8',
  text: 'Are non-English language capabilities important?',
  subtext: 'Select all that apply.',
  type: 'multi-select',
  required: false,
  options: [
    { value: 'english', label: 'No, English only' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'mandarin', label: 'Mandarin' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'other', label: 'Other' },
  ],
};

// ── SEQUENCE BUILDER ──────────────────────────────────────────────────────────

export const TRACK_CONTEXT_QUESTIONS: Record<V2Track, V2Question[]> = {
  startup: [S1, S2, S3, S4],
  individual: [I1, I2],
  small_business: [B1, B2, B3],
};

export const CLOSING_QUESTIONS: Record<V2Track, V2Question[]> = {
  startup: [SF1, SF2, SF3, SF4, SF5, SF6, SF7, SF8],
  individual: [IF1, IF2, IF3, IF4, IF5, IF6],
  small_business: [BF1, BF2, BF3, BF4, BF5, BF6, BF7, BF8],
};

const STARTUP_SUB_QUESTIONS: Record<string, V2Question[]> = {
  formation: [S5a, S5b, S5c],
  ip: [S5d, S5e],
  fundraising: [S5f, S5g, S5h],
  employment: [S5i, S5j],
  contracts: [S5k, S5l],
  regulatory: [S5m],
  governance: [S5n],
  ma: [S5o],
  dispute: [S5p],
};

const INDIVIDUAL_SUB_QUESTIONS: Record<string, V2Question[]> = {
  family: [I3a, I3b, I3c],
  estate: [I3d, I3e],
  real_estate: [I3f, I3g],
  personal_injury: [I3h, I3i],
  immigration: [I3j, I3k],
  employment: [I3l, I3m],
  tax: [I3n],
  criminal: [I3o, I3p],
  bankruptcy: [I3q],
  consumer: [], // no sub-questions per spec
};

const SB_SUB_QUESTIONS: Record<string, V2Question[]> = {
  formation: [B4a, B4b],
  contracts: [B4c, B4d],
  employment: [B4e],
  ip: [B4f],
  disputes: [B4g, B4h],
  real_estate: [B4i],
  regulatory: [B4j],
  tax: [B4k],
  ma: [B4l, B4m],
  data_privacy: [B4n],
};

export function getSubQuestions(track: V2Track, category: string): V2Question[] {
  if (track === 'startup') return STARTUP_SUB_QUESTIONS[category] ?? [];
  if (track === 'individual') return INDIVIDUAL_SUB_QUESTIONS[category] ?? [];
  if (track === 'small_business') return SB_SUB_QUESTIONS[category] ?? [];
  return [];
}

export function getQuestionSequence(
  track: V2Track | null,
  category: string | null
): V2Question[] {
  const questions: V2Question[] = [Q1];
  if (!track) return questions;

  questions.push(getQ2ForTrack(track));
  if (!category) return questions;

  questions.push(...TRACK_CONTEXT_QUESTIONS[track]);
  questions.push(...getSubQuestions(track, category));
  questions.push(...CLOSING_QUESTIONS[track]);

  return questions;
}

// Maps (track, category) to the closest legacy practice area slug for firm matching
export const CATEGORY_SLUG_MAP: Record<string, Record<string, string>> = {
  startup: {
    formation: 'corporate-formation',
    ip: 'intellectual-property',
    fundraising: 'startup-law',
    employment: 'employment-law',
    contracts: 'contract-law',
    regulatory: 'startup-law',
    governance: 'corporate-formation',
    ma: 'fund-formation',
    dispute: 'startup-law',
  },
  individual: {
    family: 'family-law',
    estate: 'estate-planning',
    real_estate: 'real-estate',
    personal_injury: 'personal-injury',
    immigration: 'immigration',
    employment: 'employment-law',
    tax: 'tax-law',
    criminal: 'criminal-defense',
    bankruptcy: 'bankruptcy',
    consumer: 'consumer-protection',
  },
  small_business: {
    formation: 'corporate-formation',
    contracts: 'contract-law',
    employment: 'employment-law',
    ip: 'intellectual-property',
    disputes: 'dispute-resolution',
    real_estate: 'real-estate',
    regulatory: 'regulatory-compliance',
    tax: 'tax-law',
    ma: 'fund-formation',
    data_privacy: 'startup-law',
  },
};
