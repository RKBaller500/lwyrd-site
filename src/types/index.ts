// ── Legal Categories ─────────────────────────────────────
export interface LegalCategory {
  slug: string;
  name: string;
  icon: string; // Lucide icon component name
  shortDescription: string;
  fullDescription: string;
  whatFirmsDo: string;
  serviceExamples: string[];
  heroTag: string;
}

// ── Law Firms ────────────────────────────────────────────
export interface Attorney {
  name: string;
  title: string;
  bio: string;
  barAdmissions: string[];
}

export interface AssessmentCriterion {
  id: string;
  label: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

export interface AssessmentItem {
  criterionId: string;
  label: string;
  passed: boolean;
  note?: string;
}

export type FirmSize = "boutique" | "mid-size" | "large";
export type BillingModel = "hourly" | "retainer" | "flat-fee" | "hybrid";
export type ResponseTime = "same-day" | "24h" | "48h" | "72h";

export interface Firm {
  id: string;
  name: string;
  logoUrl?: string;
  tagline: string;
  location: string;
  founded: number;
  size: FirmSize;
  practiceAreas: string[]; // category slugs
  industries: string[];
  companyStages: string[];
  budgetRange: { min: number; max: number };
  billingModel: BillingModel;
  hourlyRate?: number;
  responseTime: ResponseTime;
  languages: string[];
  description: string;
  strengths: string[];
  team: Attorney[];
  assessment: AssessmentItem[];
  overallScore: number; // 0-100
  verified: boolean;
}

// ── Intake Questions ─────────────────────────────────────
export type QuestionType =
  | "single-select"
  | "multi-select"
  | "text"
  | "scale"
  | "budget-range";

export interface IntakeQuestion {
  id: string;
  categorySlug: string; // "global" = shown for all categories
  order: number;
  question: string;
  subtext?: string;
  type: QuestionType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

export type IntakeAnswers = Record<string, string | string[] | number>;

// ── V2 Intake (three-track flow) ─────────────────────────────────────────────
export type V2Answers = Record<string, string | string[] | number>;

export interface V2StartupSubmission {
  track: 'startup';
  legal_category: string;
  company_stage?: string;
  industry_vertical?: string;
  is_fundraising_active?: boolean;
  fundraising_timeline?: string;
  founder_count?: string;
  round_size_range?: string;
  ip_assigned?: string;
  fundraising_instrument?: string;
  employee_count_range?: string;
  firm_type_preference?: string;
  billing_preference?: string;
  budget_range?: string;
  engagement_type?: string;
  urgency?: string;
  prior_counsel?: string;
  state_requirement?: string;
  language_requirement?: string[];
  sub_question_json?: Record<string, string | string[]>;
}

export interface V2IndividualSubmission {
  track: 'individual';
  legal_category: string;
  situation_type?: string;
  prior_personal_counsel?: string;
  contested?: string;
  children_involved?: string;
  plaintiff_or_defendant?: string;
  immigration_status?: string;
  still_employed?: string;
  firm_type_preference?: string;
  billing_preference?: string;
  budget_range?: string;
  urgency?: string;
  state_of_matter?: string;
  language_requirement?: string[];
  sub_question_json?: Record<string, string | string[]>;
}

export interface V2SmallBusinessSubmission {
  track: 'small_business';
  legal_category: string;
  years_in_operation?: string;
  employee_count_range?: string;
  industry_vertical?: string;
  entity_type?: string;
  transaction_size_range?: string;
  litigation_stage?: string;
  has_current_counsel?: string;
  firm_type_preference?: string;
  billing_preference?: string;
  budget_range?: string;
  engagement_type?: string;
  urgency?: string;
  state_requirement?: string;
  language_requirement?: string[];
  sub_question_json?: Record<string, string | string[]>;
}

export type V2TrackSubmission = V2StartupSubmission | V2IndividualSubmission | V2SmallBusinessSubmission;

// ── Matching ─────────────────────────────────────────────
export interface MatchResult {
  firm: Firm;
  score: number; // 0-100
  reasons: string[];
  matchedCriteria: string[];
  missedCriteria: string[];
  isBestMatch?: boolean;
}

// ── Auth ─────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isAdmin: boolean;
  accessLevel: "none" | "subscription" | "org";
  role: "client" | "firm";
}
