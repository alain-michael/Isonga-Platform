// Campaign Types
export interface CampaignListResponse {
  results: Campaign[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface Campaign {
  id: string;
  enterprise: number;
  enterprise_name?: string;
  enterprise_sector?: string;
  enterprise_user_id?: number;
  title: string;
  description: string;
  campaign_type: 'equity' | 'debt' | 'grant' | 'hybrid';
  target_amount: number;
  min_investment: number;
  max_investment?: number | null;
  amount_raised: number;
  investor_count: number;
  start_date?: string;
  end_date?: string;
  status: 'draft' | 'submitted' | 'revision_required' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
  is_vetted: boolean;
  vetted_by?: number;
  vetted_at?: string;
  vetting_notes?: string;
  revision_notes?: string;
  revision_count?: number;
  readiness_score_at_submission?: number;
  use_of_funds?: Record<string, any>;
  views_count: number;
  documents_count?: number;
  interests_count?: number;
  progress_percentage?: number;
  target_partners_count?: number;
  targeted_partner_names?: string[];
  target_partners_data?: TargetPartner[];
  partner_applications?: PartnerApplication[];
  created_at: string;
  updated_at: string;
}

export interface TargetPartner {
  id: number;
  organization_name: string;
  investor_type: string;
}

export interface PartnerApplication {
  id: number;
  campaign: string;
  partner: number;
  partner_name: string;
  funding_form?: number;
  funding_form_name?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'conditional_approved' | 'declined' | 'withdrawn';
  form_responses?: Record<string, any>;
  auto_screened: boolean;
  auto_screen_passed?: boolean;
  auto_screen_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  approval_conditions?: Array<{condition: string; met: boolean}>;
  proposed_amount?: number;
  proposed_terms?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignDocumentListResponse {
  results: CampaignDocument[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface CampaignDocument {
  id: number;
  campaign: string;
  document_type: 'pitch_deck' | 'business_plan' | 'financial_projection' | 'term_sheet' | 'other';
  title: string;
  file: string;
  file_url?: string;
  description?: string;
  is_public: boolean;
  uploaded_at: string;
}

export interface CampaignInterest {
  id: number;
  campaign: string;
  investor: string;
  investor_name?: string;
  status: 'interested' | 'committed' | 'invested' | 'withdrawn';
  interest_amount?: number;
  committed_amount?: number;
  invested_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreateData {
  title: string;
  description: string;
  campaign_type: 'equity' | 'debt' | 'grant' | 'hybrid';
  target_amount: number;
  min_investment: number;
  max_investment?: number | null;
  start_date?: string;
  end_date?: string;
  use_of_funds?: Record<string, any>;
}

// Create campaign data type (for forms)
export type CampaignFormData = Omit<CampaignCreateData, 'use_of_funds'> & {
  use_of_funds_description?: string;
};
