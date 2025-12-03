import api from './api';
import type { Investor, InvestorCriteria, Match, MatchInteraction } from '../types/investors';

const BASE_URL = '/investors/api';

// Investor APIs
export const investorsAPI = {
  // Get all investors (admin only)
  getAll: () => api.get<Investor[]>(`${BASE_URL}/investors/`),
  
  // Get investor by ID
  getById: (id: string) => api.get<Investor>(`${BASE_URL}/investors/${id}/`),
  
  // Create investor profile
  create: (data: Partial<Investor>) => api.post<Investor>(`${BASE_URL}/investors/`, data),
  
  // Update investor profile
  update: (id: string, data: Partial<Investor>) => api.patch<Investor>(`${BASE_URL}/investors/${id}/`, data),
  
  // Get investor criteria
  getCriteria: (investorId: string) => api.get<InvestorCriteria[]>(`${BASE_URL}/investors/${investorId}/criteria/`),
};

// Investor Criteria APIs
export const criteriaAPI = {
  getAll: () => api.get<InvestorCriteria[]>(`${BASE_URL}/criteria/`),
  getById: (id: string) => api.get<InvestorCriteria>(`${BASE_URL}/criteria/${id}/`),
  create: (data: Partial<InvestorCriteria>) => api.post<InvestorCriteria>(`${BASE_URL}/criteria/`, data),
  update: (id: string, data: Partial<InvestorCriteria>) => api.patch<InvestorCriteria>(`${BASE_URL}/criteria/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/criteria/${id}/`),
};

// Match APIs
export const matchesAPI = {
  // Get all matches for current user
  getAll: () => api.get<Match[]>(`${BASE_URL}/matches/`),
  
  // Get match by ID
  getById: (id: string) => api.get<Match>(`${BASE_URL}/matches/${id}/`),
  
  // Find potential matches (for investors)
  findMatches: () => api.get(`${BASE_URL}/matches/find_matches/`),
  
  // Create a match
  create: (data: { enterprise_id: number; investor_id: string }) => 
    api.post<Match>(`${BASE_URL}/matches/`, data),
  
  // Investor approves match
  approve: (id: string, notes?: string) => 
    api.post(`${BASE_URL}/matches/${id}/approve/`, { notes }),
  
  // Request documents from SME
  requestDocuments: (id: string, documents: string[]) => 
    api.post(`${BASE_URL}/matches/${id}/request_documents/`, { documents }),
  
  // Enterprise accepts match
  accept: (id: string, notes?: string) => 
    api.post(`${BASE_URL}/matches/${id}/accept/`, { notes }),
};

// Match Interaction APIs
export const interactionsAPI = {
  getByMatch: (matchId: string) => 
    api.get<MatchInteraction[]>(`${BASE_URL}/interactions/?match_id=${matchId}`),
  
  create: (data: Partial<MatchInteraction>) => 
    api.post<MatchInteraction>(`${BASE_URL}/interactions/`, data),
};

export default {
  investors: investorsAPI,
  criteria: criteriaAPI,
  matches: matchesAPI,
  interactions: interactionsAPI,
};
