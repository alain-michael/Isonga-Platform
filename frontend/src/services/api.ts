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
};

// Assessment API
export const assessmentAPI = {
  getCategories: () =>
    api.get('/assessments/api/categories/'),
  
  getQuestionnaires: () =>
    api.get('/assessments/api/questionnaires/'),
  
  getAssessments: (params?: any) =>
    api.get('/assessments/api/assessments/', { params }),
  
  getAssessment: (id: string) =>
    api.get(`/assessments/api/assessments/${id}/`),
  
  createAssessment: (data: any) =>
    api.post('/assessments/api/assessments/', data),
  
  startAssessment: (id: string) =>
    api.post(`/assessments/api/assessments/${id}/start/`),
  
  submitAssessment: (id: string) =>
    api.post(`/assessments/api/assessments/${id}/submit/`),
  
  reviewAssessment: (id: string) =>
    api.post(`/assessments/api/assessments/${id}/review/`),
  
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
};

export default api;
