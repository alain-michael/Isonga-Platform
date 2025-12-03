import api from './api';

export interface InvestorProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  investor_type: string;
  organization_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  min_investment: number;
  max_investment: number;
  criteria: InvestorCriteria[];
}

export interface InvestorCriteria {
  id?: number;
  sectors: string[];
  min_funding_amount: number;
  max_funding_amount: number;
  preferred_sizes: string[];
  min_readiness_score?: number;
}

export interface MatchedCampaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  amount_raised: number;
  min_investment: number;
  campaign_type: string;
  enterprise_name: string;
  enterprise_sector: string;
  enterprise_location: string;
  match_score: number;
}

export const investorAPI = {
  getProfile: async () => {
    const response = await api.get<InvestorProfile[]>('/investors/profiles/');
    // Assuming the user has only one profile, return the first one
    return response.data[0];
  },
  
  updateProfile: async (id: number, data: Partial<InvestorProfile>) => {
    const response = await api.patch<InvestorProfile>(`/investors/profiles/${id}/`, data);
    return response.data;
  },

  updateCriteria: async (id: number, data: Partial<InvestorCriteria>) => {
    const response = await api.patch<InvestorCriteria>(`/investors/criteria/${id}/`, data);
    return response.data;
  },

  createCriteria: async (data: InvestorCriteria) => {
    const response = await api.post<InvestorCriteria>('/investors/criteria/', data);
    return response.data;
  },

  getMatches: async () => {
    const response = await api.get<MatchedCampaign[]>('/investors/opportunities/');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get<{
      activeMatches: number;
      pendingRequests: number;
      totalInvestments: number;
      portfolioValue: string;
    }>('/investors/profiles/stats/');
    return response.data;
  },

  interactWithMatch: async (campaignId: string, action: 'approve' | 'reject') => {
    const response = await api.post(`/investors/opportunities/${campaignId}/interact/`, { action });
    return response.data;
  }
};
