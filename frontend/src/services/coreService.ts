import api from './api';
import type { Notification, UserPreferences, AuditLog, DeletionRequest } from '../types/core';

const BASE_URL = '/core/api';

// Notification APIs
export const notificationsAPI = {
  // Get all notifications
  getAll: () => api.get<Notification[]>(`${BASE_URL}/notifications/`),
  
  // Get unread notifications
  getUnread: () => api.get<Notification[]>(`${BASE_URL}/notifications/unread/`),
  
  // Get unread count
  getUnreadCount: () => api.get<{ count: number }>(`${BASE_URL}/notifications/unread_count/`),
  
  // Mark as read
  markRead: (id: string) => api.post(`${BASE_URL}/notifications/${id}/mark_read/`),
  
  // Mark all as read
  markAllRead: () => api.post(`${BASE_URL}/notifications/mark_all_read/`),
  
  // Clear read notifications
  clearRead: () => api.delete(`${BASE_URL}/notifications/clear_read/`),
};

// User Preferences APIs
export const preferencesAPI = {
  // Get preferences
  get: () => api.get<UserPreferences>(`${BASE_URL}/preferences/`),
  
  // Update preferences
  update: (data: Partial<UserPreferences>) => 
    api.post<UserPreferences>(`${BASE_URL}/preferences/`, data),
};

// Audit Log APIs (admin only)
export const auditLogsAPI = {
  // Get all logs
  getAll: (params?: { 
    action?: string; 
    resource_type?: string; 
    user_id?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.action) queryParams.append('action', params.action);
    if (params?.resource_type) queryParams.append('resource_type', params.resource_type);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    return api.get<AuditLog[]>(`${BASE_URL}/audit-logs/?${queryParams.toString()}`);
  },
  
  // Get summary
  getSummary: () => api.get(`${BASE_URL}/audit-logs/summary/`),
};

// Deletion Request APIs
export const deletionRequestsAPI = {
  // Get all requests
  getAll: () => api.get<DeletionRequest[]>(`${BASE_URL}/deletion-requests/`),
  
  // Create request
  create: (data: { reason?: string; deletion_type?: 'full' | 'partial'; specific_data?: string[] }) => 
    api.post<DeletionRequest>(`${BASE_URL}/deletion-requests/`, data),
  
  // Cancel request (user)
  cancel: (id: string) => api.post(`${BASE_URL}/deletion-requests/${id}/cancel/`),
  
  // Approve (admin)
  approve: (id: string, notes?: string) => 
    api.post(`${BASE_URL}/deletion-requests/${id}/approve/`, { notes }),
  
  // Reject (admin)
  reject: (id: string, notes?: string) => 
    api.post(`${BASE_URL}/deletion-requests/${id}/reject/`, { notes }),
};

export default {
  notifications: notificationsAPI,
  preferences: preferencesAPI,
  auditLogs: auditLogsAPI,
  deletionRequests: deletionRequestsAPI,
};
