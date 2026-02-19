import api from './api';
import type { Campaign, CampaignDocument, CampaignDocumentListResponse, CampaignInterest, CampaignListResponse } from '../types/campaigns';

const BASE_URL = '/campaigns/api';

// Campaign APIs
export const campaignsAPI = {
  // Get all campaigns
  getAll: () => api.get<CampaignListResponse>(`${BASE_URL}/campaigns/`),
  
  // Get my campaigns (enterprise)
  getMyCampaigns: () => api.get<Campaign[]>(`${BASE_URL}/campaigns/my_campaigns/`),
  
  // Get active campaigns (for investors)
  getActive: (params?: { sector?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.sector) queryParams.append('sector', params.sector);
    if (params?.type) queryParams.append('type', params.type);
    return api.get<Campaign[]>(`${BASE_URL}/campaigns/active/?${queryParams.toString()}`);
  },
  
  // Get campaign by ID
  getById: (id: string) => api.get<Campaign>(`${BASE_URL}/campaigns/${id}/`),
  
  // Create campaign
  create: (data: Partial<Campaign>) => api.post<Campaign>(`${BASE_URL}/campaigns/`, data),
  
  // Update campaign
  update: (id: string, data: Partial<Campaign>) => api.patch<Campaign>(`${BASE_URL}/campaigns/${id}/`, data),
  
  // Delete campaign
  delete: (id: string) => api.delete(`${BASE_URL}/campaigns/${id}/`),
  
  // Submit for review
  submitForReview: (id: string) => api.post(`${BASE_URL}/campaigns/${id}/submit_for_review/`),
  
  // Approve (admin)
  approve: (id: string) => api.post(`${BASE_URL}/campaigns/${id}/approve/`),
  
  // Require Revision (admin)
  requireRevision: (id: string, notes: string) => api.post(`${BASE_URL}/campaigns/${id}/require_revision/`, { notes }),
  
  // Reject (admin)
  reject: (id: string, notes?: string) => api.post(`${BASE_URL}/campaigns/${id}/reject/`, { notes }),
  
  // Activate
  activate: (id: string) => api.post(`${BASE_URL}/campaigns/${id}/activate/`),
  
  // Check eligibility for partners
  checkEligibility: (id: string) => api.get(`${BASE_URL}/campaigns/${id}/check_eligibility/`),
  
  // Close
  close: (id: string, reason?: string) => api.post(`${BASE_URL}/campaigns/${id}/close/`, { reason }),
};

// Default export for backward compatibility
export const campaignAPI = campaignsAPI;

// Campaign Document APIs
export const campaignDocumentsAPI = {
  getAll: (campaignId: string) => 
    api.get<CampaignDocumentListResponse>(`${BASE_URL}/documents/?campaign_id=${campaignId}`),
  
  upload: (formData: FormData) => 
    api.post<CampaignDocument>(`${BASE_URL}/documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  delete: (id: string) => api.delete(`${BASE_URL}/documents/${id}/`),
};

// Campaign Update APIs
export const campaignUpdatesAPI = {
  getAll: (campaignId: string) =>
    api.get(`${BASE_URL}/updates/?campaign_id=${campaignId}`),
  
  create: (data: { campaign: string; title: string; content: string; is_milestone?: boolean }) =>
    api.post(`${BASE_URL}/updates/`, data),
  
  update: (id: string, data: { title?: string; content?: string; is_milestone?: boolean }) =>
    api.patch(`${BASE_URL}/updates/${id}/`, data),
  
  delete: (id: string) => api.delete(`${BASE_URL}/updates/${id}/`),
};

// Campaign Interest APIs
export const campaignInterestsAPI = {
  getAll: (campaignId?: string) => {
    const url = campaignId 
      ? `${BASE_URL}/interests/?campaign_id=${campaignId}` 
      : `${BASE_URL}/interests/`;
    return api.get<CampaignInterest[]>(url);
  },
  
  create: (data: Partial<CampaignInterest>) => 
    api.post<CampaignInterest>(`${BASE_URL}/interests/`, data),
  
  commit: (id: string, committed_amount: number) => 
    api.post(`${BASE_URL}/interests/${id}/commit/`, { committed_amount }),
  
  withdraw: (id: string) => 
    api.post(`${BASE_URL}/interests/${id}/withdraw/`),
};

// Campaign Message APIs
export const campaignMessagesAPI = {
  getAll: (params?: { campaign_id?: string; interest_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.campaign_id) queryParams.append('campaign_id', params.campaign_id);
    if (params?.interest_id) queryParams.append('interest_id', params.interest_id);
    return api.get(`${BASE_URL}/messages/?${queryParams.toString()}`);
  },
  
  create: (data: { campaign: string; receiver: number; content: string; interest?: string }) =>
    api.post(`${BASE_URL}/messages/`, data),
  
  markRead: (id: string) => 
    api.post(`${BASE_URL}/messages/${id}/mark_read/`),
};

export default {
  campaigns: campaignsAPI,
  documents: campaignDocumentsAPI,
  updates: campaignUpdatesAPI,
  interests: campaignInterestsAPI,
};
