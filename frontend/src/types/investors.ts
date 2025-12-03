// Investor Types
export interface Investor {
  id: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  organization_name: string;
  investor_type: 'individual' | 'angel' | 'vc' | 'pe' | 'corporate' | 'family_office' | 'development_finance' | 'impact' | 'other';
  description?: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  is_verified: boolean;
  total_investments?: number;
  investment_range_min?: number;
  investment_range_max?: number;
  preferred_sectors?: string[];
  created_at: string;
  updated_at: string;
}

export interface InvestorCriteria {
  id: string;
  investor: string; // UUID
  sectors: string[];
  preferred_sizes: string[];
  min_employees: number;
  max_employees?: number;
  min_revenue?: number;
  max_revenue?: number;
  min_years_operation: number;
  min_readiness_score: number;
  geographic_preference?: string[];
  funding_types: string[];
  min_funding_amount?: number;
  max_funding_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  enterprise: {
    id: number;
    business_name: string;
    sector: string;
    enterprise_size: string;
    district: string;
    number_of_employees?: number;
    annual_revenue?: string;
    verification_status: string;
  };
  investor: {
    id: string;
    organization_name: string;
    investor_type: string;
    contact_email: string;
  };
  match_score: number;
  match_reasons?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'engaged' | 'closed';
  investor_approved: boolean;
  investor_notes?: string;
  enterprise_accepted: boolean;
  enterprise_notes?: string;
  documents_requested?: string[];
  documents_shared?: string[];
  nda_signed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchInteraction {
  id: string;
  match: string;
  initiated_by: number;
  initiated_by_name?: string;
  interaction_type: 'message' | 'meeting_request' | 'document_request' | 'document_share' | 'status_change' | 'note';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  enterprise: number;
  enterprise_name: string;
  title: string;
  description: string;
  campaign_type: 'equity' | 'debt' | 'convertible' | 'grant' | 'mixed';
  status: 'draft' | 'pending' | 'approved' | 'active' | 'funded' | 'closed' | 'rejected';
  funding_goal: number;
  current_funding: number;
  min_investment?: number;
  max_investment?: number;
  start_date?: string;
  end_date?: string;
  terms_conditions?: string;
  equity_offered?: number;
  interest_rate?: number;
  repayment_period?: number;
  use_of_funds?: Record<string, any>;
  milestones?: any[];
  is_featured: boolean;
  documents_count: number;
  interests_count: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignDocument {
  id: string;
  campaign: string;
  document_type: 'pitch_deck' | 'financial_statement' | 'business_plan' | 'legal' | 'due_diligence' | 'other';
  title: string;
  description?: string;
  file: string;
  file_url?: string;
  is_public: boolean;
  uploaded_at: string;
}

export interface CampaignInterest {
  id: string;
  campaign: string;
  investor: string;
  investor_name?: string;
  investment_amount?: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'committed' | 'funded';
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user: number;
  notification_type: 'assessment_completed' | 'match_found' | 'document_requested' | 'payment_received' | 'status_update' | 'message' | 'reminder' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// User Preferences
export interface UserPreferences {
  id: string;
  user: number;
  language: 'en' | 'rw' | 'fr';
  timezone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_settings: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// Deletion Request (GDPR)
export interface DeletionRequest {
  id: string;
  user: number;
  user_name?: string;
  user_email?: string;
  deletion_type: 'full' | 'partial';
  specific_data?: string[];
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  processed_by?: number;
  processed_by_name?: string;
  processed_at?: string;
  created_at: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  user: number;
  user_name?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import';
  resource_type: string;
  resource_id?: string;
  description?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
