export interface DbFirm {
  id: string;
  name: string;
  logo_url: string | null;
  tagline: string;
  location: string;
  founded: number | null;
  size: "boutique" | "mid-size" | "large";
  practice_areas: string[];
  industries: string[];
  company_stages: string[];
  budget_min: number;
  budget_max: number;
  billing_model: "hourly" | "retainer" | "flat-fee" | "hybrid";
  hourly_rate: number | null;
  response_time: "same-day" | "24h" | "48h" | "72h";
  languages: string[];
  description: string;
  strengths: string[];
  overall_score: number;
  verified: boolean;
  created_at: string;
  // Joined relations
  attorneys?: DbAttorney[];
  firm_assessment_items?: DbAssessmentItem[];
}

export interface DbAttorney {
  id: string;
  firm_id: string;
  name: string;
  title: string;
  bio: string;
  bar_admissions: string[];
  display_order: number;
}

export interface DbAssessmentCriterion {
  id: string;
  label: string;
  description: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
}

export interface DbAssessmentItem {
  id: string;
  firm_id: string;
  criterion_id: string;
  passed: boolean;
  note: string | null;
  display_order: number;
  // Joined relation
  assessment_criteria?: DbAssessmentCriterion;
}

export interface DbProfile {
  id: string;
  name: string;
  is_admin: boolean;
  access_level: "none" | "subscription" | "org";
  created_at: string;
  updated_at: string;
}

export interface DbSavedFirm {
  id: string;
  user_id: string;
  firm_id: string;
  saved_at: string;
}

export interface DbIntakeSubmission {
  id: string;
  user_id: string;
  category_slug: string;
  track?: string;
  legal_category?: string;
  category_label?: string;
  answers: Record<string, string | string[] | number>;
  top_matches: Array<{ firmId: string; firmName: string; score: number }>;
  created_at: string;
}

export interface DbStartupSubmission {
  id: string;
  general_submission_id: string | null;
  user_id: string;
  created_at: string;
  track: string;
  legal_category: string | null;
  company_stage: string | null;
  industry_vertical: string | null;
  is_fundraising_active: boolean | null;
  fundraising_timeline: string | null;
  founder_count: string | null;
  round_size_range: string | null;
  ip_assigned: string | null;
  fundraising_instrument: string | null;
  employee_count_range: string | null;
  firm_type_preference: string | null;
  billing_preference: string | null;
  budget_range: string | null;
  engagement_type: string | null;
  urgency: string | null;
  prior_counsel: string | null;
  state_requirement: string | null;
  language_requirement: string[] | null;
  sub_question_json: Record<string, string | string[]> | null;
}

export interface DbIndividualSubmission {
  id: string;
  general_submission_id: string | null;
  user_id: string;
  created_at: string;
  track: string;
  legal_category: string | null;
  situation_type: string | null;
  prior_personal_counsel: string | null;
  contested: string | null;
  children_involved: string | null;
  plaintiff_or_defendant: string | null;
  immigration_status: string | null;
  still_employed: string | null;
  firm_type_preference: string | null;
  billing_preference: string | null;
  budget_range: string | null;
  urgency: string | null;
  state_of_matter: string | null;
  language_requirement: string[] | null;
  sub_question_json: Record<string, string | string[]> | null;
}

export interface DbSmallBusinessSubmission {
  id: string;
  general_submission_id: string | null;
  user_id: string;
  created_at: string;
  track: string;
  legal_category: string | null;
  years_in_operation: string | null;
  employee_count_range: string | null;
  industry_vertical: string | null;
  entity_type: string | null;
  transaction_size_range: string | null;
  litigation_stage: string | null;
  has_current_counsel: string | null;
  firm_type_preference: string | null;
  billing_preference: string | null;
  budget_range: string | null;
  engagement_type: string | null;
  urgency: string | null;
  state_requirement: string | null;
  language_requirement: string[] | null;
  sub_question_json: Record<string, string | string[]> | null;
}
