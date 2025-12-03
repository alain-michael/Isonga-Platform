// Core Types - Notifications, Audit Logs, User Preferences

export interface Notification {
  id: string;
  user: number;
  notification_type: 
    | 'assessment_completed' 
    | 'payment_received' 
    | 'document_requested'
    | 'document_uploaded'
    | 'match_found'
    | 'investor_interest'
    | 'campaign_update'
    | 'verification_update'
    | 'system';
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  channel: 'in_app' | 'email' | 'whatsapp' | 'sms';
  is_read: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user: number;
  user_name?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'approve' | 'reject';
  model_name?: string;
  object_id?: string;
  object_repr?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface UserPreferences {
  id: number;
  user: number;
  language: 'en' | 'rw' | 'fr';
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  sms_notifications: boolean;
  in_app_notifications: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeletionRequest {
  id: string;
  user: number;
  user_name?: string;
  user_email?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reviewed_by?: number;
  reviewed_by_name?: string;
  reviewed_at?: string;
  admin_notes?: string;
  executed_at?: string;
  created_at: string;
}

// API response types
export interface NotificationCount {
  count: number;
}

export interface AuditLogSummary {
  total_actions: number;
  by_action: Array<{ action: string; count: number }>;
  by_model: Array<{ model_name: string; count: number }>;
  recent: AuditLog[];
}
