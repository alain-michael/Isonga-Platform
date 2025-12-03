import api from './api';
import type { Campaign, CampaignDocument, CampaignInterest } from '../types/campaigns';

const BASE_URL = '/campaigns/api';

// Campaign APIs
export const campaignsAPI = {
  // Get all campaigns
  getAll: () => api.get<Campaign[]>(`${BASE_URL}/campaigns/`),
  
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
  
  // Reject (admin)
  reject: (id: string) => api.post(`${BASE_URL}/campaigns/${id}/reject/`),
  
  // Activate
  activate: (id: string) => api.post(`${BASE_URL}/campaigns/${id}/activate/`),
  
  // Close
  close: (id: string, reason?: string) => api.post(`${BASE_URL}/campaigns/${id}/close/`, { reason }),
};

// Campaign Document APIs
export const campaignDocumentsAPI = {
  getAll: (campaignId: string) => 
    api.get<CampaignDocument[]>(`${BASE_URL}/documents/?campaign_id=${campaignId}`),
  
  upload: (_campaignId: string, formData: FormData) => 
    api.post<CampaignDocument>(`${BASE_URL}/documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  delete: (id: string) => api.delete(`${BASE_URL}/documents/${id}/`),
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
  
  approve: (id: string) => api.post(`${BASE_URL}/interests/${id}/approve/`),
  
  reject: (id: string) => api.post(`${BASE_URL}/interests/${id}/reject/`),
};

export default {
  campaigns: campaignsAPI,
  documents: campaignDocumentsAPI,
  interests: campaignInterestsAPI,
};
