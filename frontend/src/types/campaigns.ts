// Campaign Types

export interface Campaign {
  id: string;
  enterprise: number;
  enterprise_name?: string;
  enterprise_sector?: string;
  title: string;
  description: string;
  campaign_type: 'equity' | 'debt' | 'grant' | 'hybrid';
  target_amount: number;
  min_investment: number;
  max_investment?: number;
  amount_raised: number;
  investor_count: number;
  start_date?: string;
  end_date?: string;
  status: 'draft' | 'submitted' | 'vetted' | 'active' | 'completed' | 'cancelled';
  is_vetted: boolean;
  vetted_by?: number;
  vetted_at?: string;
  vetting_notes?: string;
  use_of_funds?: Record<string, any>;
  views_count: number;
  documents_count?: number;
  interests_count?: number;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
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
  max_investment?: number;
  start_date?: string;
  end_date?: string;
  use_of_funds?: Record<string, any>;
}

// Create campaign data type (for forms)
export type CampaignFormData = Omit<CampaignCreateData, 'use_of_funds'> & {
  use_of_funds_description?: string;
};
