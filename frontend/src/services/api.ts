import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/accounts/api/token/', credentials),
  
  register: (userData: any) =>
    api.post('/accounts/api/users/register/', userData),
  
  logout: () =>
    api.post('/accounts/api/logout/'),
  
  refreshToken: () =>
    api.post('/accounts/api/token/refresh/', {
      refresh: localStorage.getItem('refresh_token')
    }),
  
  getProfile: () =>
    api.get('/accounts/api/profile/'),
  
  updateProfile: (data: any) =>
    api.put('/accounts/api/profile/', data),
};

// Enterprise API
export const enterpriseAPI = {
  getAll: (params?: any) =>
    api.get('/enterprises/api/enterprises/', { params }),
  
  getById: (id: string) =>
    api.get(`/enterprises/api/enterprises/${id}/`),
  
  getMyEnterprise: () =>
    api.get('/enterprises/api/enterprises/my-enterprise/'),
  
  create: (data: any) =>
    api.post('/enterprises/api/enterprises/', data),
  
  update: (id: string, data: any) =>
    api.put(`/enterprises/api/enterprises/${id}/`, data),
  
  vet: (id: string) =>
    api.post(`/enterprises/api/enterprises/${id}/vet/`),
  
  uploadDocument: (id: string, data: FormData) =>
    api.post(`/enterprises/api/enterprises/${id}/upload_document/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getDocuments: (id: string) =>
    api.get(`/enterprises/api/enterprises/${id}/documents/`),

  // Enterprise's view of matches (investors interested in them)
  getMatches: () =>
    api.get('/investors/matches/'),

  acceptMatch: (id: string, notes?: string) =>
    api.post(`/investors/matches/${id}/accept/`, { notes }),

  rejectMatch: (id: string) =>
    api.post(`/investors/matches/${id}/reject/`),
};

// Assessment API
export const assessmentAPI = {
  getCategories: () =>
    api.get('/assessments/api/categories/'),
  
  getQuestionnaires: () =>
    api.get('/assessments/api/questionnaires/'),

  getQuestionnaire: (id: string) =>
    api.get(`/assessments/api/questionnaires/${id}/`),
  
  createQuestionnaire: (data: any) =>
    api.post('/assessments/api/questionnaires/', data),
  
  updateQuestionnaire: (id: string | number, data: any) =>
    api.patch(`/assessments/api/questionnaires/${id}/`, data),
  
  deleteQuestionnaire: (id: string | number) =>
    api.delete(`/assessments/api/questionnaires/${id}/`),
  
  getAssessments: (params?: any) =>
    api.get('/assessments/api/assessments/', { params }),
  
  getAssessment: (id: string) =>
    api.get(`/assessments/api/assessments/${id}/`),
  
  getAssessmentById: (id: string) =>
    api.get(`/assessments/api/assessments/${id}/`),
  
  createAssessment: (data: any) =>
    api.post('/assessments/api/assessments/', data),
  
  updateAssessment: (id: string | number, data: any) =>
    api.patch(`/assessments/api/assessments/${id}/`, data),
  
  deleteAssessment: (id: string | number) =>
    api.delete(`/assessments/api/assessments/${id}/`),
  
  startAssessment: (id: string | number) =>
    api.post(`/assessments/api/assessments/${id}/start/`),
  
  saveResponses: (id: string, responses: any[]) =>
    api.post(`/assessments/api/assessments/${id}/save_responses/`, { responses }),
  
  submitAssessment: (id: string | number, responses?: any[]) =>
    api.post(`/assessments/api/assessments/${id}/submit/`, { responses: responses || [] }),
  
  submitResponses: (assessmentId: string | number, responses: any[]) =>
    api.post(`/assessments/api/assessments/${assessmentId}/submit/`, { responses }),
  
  reviewAssessment: (id: string) =>
    api.post(`/assessments/api/assessments/${id}/review/`),
  
  regradeAssessment: (id: string) =>
    api.post(`/assessments/api/assessments/${id}/submit/`),
  
  assignReviewer: (id: string, reviewerId: number) =>
    api.patch(`/assessments/api/assessments/${id}/`, { reviewed_by: reviewerId }),
  
  generateInsights: (id: string) =>
    api.post(`/assessments/api/assessments/${id}/generate_insights/`),
  
  updateInsights: (id: string, data: { ai_strengths?: string[], ai_weaknesses?: string[] }) =>
    api.patch(`/assessments/api/assessments/${id}/update_insights/`, data),
  
  saveResponse: (data: any) =>
    api.post('/assessments/api/responses/', data),
  
  updateResponse: (id: string, data: any) =>
    api.put(`/assessments/api/responses/${id}/`, data),
};

// Payment API
export const paymentAPI = {
  getPlans: () =>
    api.get('/payments/api/plans/'),
  
  getSubscriptions: () =>
    api.get('/payments/api/subscriptions/'),
  
  subscribe: (data: any) =>
    api.post('/payments/api/subscriptions/subscribe/', data),
  
  getPayments: () =>
    api.get('/payments/api/payments/'),
  
  createPayment: (data: any) =>
    api.post('/payments/api/payments/create_payment/', data),
  
  confirmPayment: (id: string) =>
    api.post(`/payments/api/payments/${id}/confirm_payment/`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () =>
    api.get('/admin_dashboard/api/dashboard-stats/'),
  
  getRecentAssessments: (params?: any) =>
    api.get('/admin_dashboard/api/recent-assessments/', { params }),
  
  getRecentEnterprises: (params?: any) =>
    api.get('/admin_dashboard/api/recent-enterprises/', { params }),
  
  getSystemMetrics: () =>
    api.get('/admin_dashboard/api/system-metrics/'),

  getUsers: (params?: any) =>
    api.get('/accounts/api/users/', { params }),
  
  updateUser: (id: number, data: any) =>
    api.patch(`/accounts/api/users/${id}/`, data),
  
  deleteUser: (id: number) =>
    api.delete(`/accounts/api/users/${id}/`),
};

// Investor API
export const investorAPI = {
  getAll: (params?: any) =>
    api.get('/investors/profiles/', { params }),
  
  getById: (id: string) =>
    api.get(`/investors/profiles/${id}/`),
  
  create: (data: any) =>
    api.post('/investors/profiles/', data),
  
  update: (id: string, data: any) =>
    api.put(`/investors/profiles/${id}/`, data),
  
  getCriteria: (investorId: string) =>
    api.get(`/investors/profiles/${investorId}/criteria/`),
  

  
  // Opportunities (for investors to view enterprises)
  getOpportunities: () =>
    api.get('/investors/opportunities/'),
  
  interactWithOpportunity: (id: string, data: any) =>
    api.post(`/investors/opportunities/${id}/interact/`, data),
  
  // Match Interactions
  getInteractions: (matchId: string) =>
    api.get('/investors/interactions/', { params: { match_id: matchId } }),
  
  createInteraction: (data: any) =>
    api.post('/investors/interactions/', data),
  
  // Criteria
  createCriteria: (data: any) =>
    api.post('/investors/criteria/', data),
  
  updateCriteria: (id: string, data: any) =>
    api.put(`/investors/criteria/${id}/`, data),
};

// Match API
export const matchesAPI = {
  getAll: (params?: any) =>
    api.get('/investors/matches/', { params }),
  
  getById: (id: string) =>
    api.get(`/investors/matches/${id}/`),
  
  findMatches: () =>
    api.get('/investors/matches/find_matches/'),
  
  approve: (id: string, notes?: string) =>
    api.post(`/investors/matches/${id}/approve/`, { notes }),
  
  requestDocuments: (id: string, documents: string[]) =>
    api.post(`/investors/matches/${id}/request_documents/`, { documents }),
  
  accept: (id: string, notes?: string) =>
    api.post(`/investors/matches/${id}/accept/`, { notes }),

  reject: (id: string) =>
    api.post(`/investors/matches/${id}/reject/`),
};

// Campaign API
export const campaignAPI = {
  getAll: (params?: any) =>
    api.get('/campaigns/api/campaigns/', { params }),
  
  getById: (id: string) =>
    api.get(`/campaigns/api/campaigns/${id}/`),
  
  getMyCampaigns: () =>
    api.get('/campaigns/api/campaigns/my_campaigns/'),
  
  getActive: (params?: any) =>
    api.get('/campaigns/api/campaigns/active/', { params }),
  
  create: (data: any) =>
    api.post('/campaigns/api/campaigns/', data),
  
  update: (id: string, data: any) =>
    api.put(`/campaigns/api/campaigns/${id}/`, data),
  
  submitForReview: (id: string) =>
    api.post(`/campaigns/api/campaigns/${id}/submit_for_review/`),
  
  approve: (id: string) =>
    api.post(`/campaigns/api/campaigns/${id}/approve/`),
  
  reject: (id: string, notes?: string) =>
    api.post(`/campaigns/api/campaigns/${id}/reject/`, { notes }),
  
  activate: (id: string) =>
    api.post(`/campaigns/api/campaigns/${id}/activate/`),
  
  close: (id: string) =>
    api.post(`/campaigns/api/campaigns/${id}/close/`),
  
  // Documents
  getDocuments: (campaignId: string) =>
    api.get('/campaigns/api/documents/', { params: { campaign_id: campaignId } }),
  
  uploadDocument: (data: FormData) =>
    api.post('/campaigns/api/documents/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  // Interests
  getInterests: (campaignId: string) =>
    api.get('/campaigns/api/interests/', { params: { campaign_id: campaignId } }),
  
  expressInterest: (data: any) =>
    api.post('/campaigns/api/interests/', data),
  
  approveInterest: (id: string) =>
    api.post(`/campaigns/api/interests/${id}/approve/`),
  
  rejectInterest: (id: string) =>
    api.post(`/campaigns/api/interests/${id}/reject/`),
};

// Notification API
export const notificationAPI = {
  getAll: () =>
    api.get('/core/api/notifications/'),
  
  getUnread: () =>
    api.get('/core/api/notifications/unread/'),
  
  getUnreadCount: () =>
    api.get('/core/api/notifications/unread_count/'),
  
  markRead: (id: string) =>
    api.post(`/core/api/notifications/${id}/mark_read/`),
  
  markAllRead: () =>
    api.post('/core/api/notifications/mark_all_read/'),
  
  clearRead: () =>
    api.delete('/core/api/notifications/clear_read/'),
};

// User Preferences API
export const preferencesAPI = {
  get: () =>
    api.get('/core/api/preferences/'),
  
  update: (data: any) =>
    api.post('/core/api/preferences/', data),
};

// Audit Log API (Admin only)
export const auditLogAPI = {
  getAll: (params?: any) =>
    api.get('/core/api/audit-logs/', { params }),
  
  getSummary: () =>
    api.get('/core/api/audit-logs/summary/'),
};

// Deletion Request API
export const deletionRequestAPI = {
  getAll: () =>
    api.get('/core/api/deletion-requests/'),
  
  create: (reason: string) =>
    api.post('/core/api/deletion-requests/', { reason }),
  
  approve: (id: string, notes?: string) =>
    api.post(`/core/api/deletion-requests/${id}/approve/`, { notes }),
  
  reject: (id: string, notes?: string) =>
    api.post(`/core/api/deletion-requests/${id}/reject/`, { notes }),
  
  cancel: (id: string) =>
    api.post(`/core/api/deletion-requests/${id}/cancel/`),
};

export default api;
