import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI, preferencesAPI } from '../services/coreService';

// Notification hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsAPI.getAll();
      return response.data;
    },
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const response = await notificationsAPI.getUnread();
      return response.data;
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: async () => {
      const response = await notificationsAPI.getUnreadCount();
      return response.data.count;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationsAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// User preferences hooks
export const useUserPreferences = () => {
  return useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const response = await preferencesAPI.get();
      return response.data;
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: preferencesAPI.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });
};
