import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investorsAPI, matchesAPI, criteriaAPI } from '../services/investorsService';
import type { InvestorCriteria } from '../types/investors';

// Investor hooks
export const useInvestors = () => {
  return useQuery({
    queryKey: ['investors'],
    queryFn: async () => {
      const response = await investorsAPI.getAll();
      return response.data;
    },
  });
};

export const useInvestor = (id?: string) => {
  return useQuery({
    queryKey: ['investors', id],
    queryFn: async () => {
      const response = await investorsAPI.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdateInvestor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => investorsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
};

// Investor Criteria hooks
export const useInvestorCriteria = (investorId?: string) => {
  return useQuery({
    queryKey: ['investorCriteria', investorId],
    queryFn: async () => {
      const response = await investorsAPI.getCriteria(investorId!);
      return response.data;
    },
    enabled: !!investorId,
  });
};

export const useCreateCriteria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<InvestorCriteria>) => criteriaAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investorCriteria'] });
    },
  });
};

export const useUpdateCriteria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvestorCriteria> }) => 
      criteriaAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investorCriteria'] });
    },
  });
};

// Match hooks
export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await matchesAPI.getAll();
      return response.data;
    },
  });
};

export const useMatch = (id?: string) => {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: async () => {
      const response = await matchesAPI.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useFindMatches = () => {
  return useQuery({
    queryKey: ['matches', 'potential'],
    queryFn: async () => {
      const response = await matchesAPI.findMatches();
      return response.data;
    },
    enabled: false, // Only fetch when explicitly called
  });
};

export const useApproveMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => matchesAPI.approve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useAcceptMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => matchesAPI.accept(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useRequestDocuments = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, documents }: { id: string; documents: string[] }) => 
      matchesAPI.requestDocuments(id, documents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};
