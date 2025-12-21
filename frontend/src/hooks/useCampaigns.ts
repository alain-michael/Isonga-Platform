import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsAPI, campaignInterestsAPI } from '../services/campaignsService';
import type { Campaign } from '../types/campaigns';

// Campaign hooks
export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignsAPI.getAll();
      return response.data;
    },
  });
};

export const useMyCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns', 'mine'],
    queryFn: async () => {
      const response = await campaignsAPI.getMyCampaigns();
      return response.data;
    },
  });
};

export const useActiveCampaigns = (params?: { sector?: string; type?: string }) => {
  return useQuery({
    queryKey: ['campaigns', 'active', params],
    queryFn: async () => {
      const response = await campaignsAPI.getActive(params);
      return response.data;
    },
  });
};

export const useCampaign = (id?: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const response = await campaignsAPI.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Campaign>) => {
      const response = await campaignsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) => 
      campaignsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campaignsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useSubmitCampaignForReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campaignsAPI.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useApproveCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campaignsAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useActivateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campaignsAPI.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

// Campaign Interest hooks
export const useCampaignInterests = (campaignId?: string) => {
  return useQuery({
    queryKey: ['campaignInterests', campaignId],
    queryFn: async () => {
      const response = await campaignInterestsAPI.getAll(campaignId);
      return response.data;
    },
  });
};

export const useCreateCampaignInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: campaignInterestsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaignInterests'] });
    },
  });
};

/*
export const useApproveInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campaignInterestsAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaignInterests'] });
    },
  });
};
*/
