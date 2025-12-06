import { useQuery } from "@tanstack/react-query";
import type {UseQueryOptions} from "@tanstack/react-query";
import { assessmentAPI } from "../../services/api";

// Query keys for better organization and cache management
export const assessmentKeys = {
  all: ["assessments"] as const,
  lists: () => [...assessmentKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) => [...assessmentKeys.lists(), filters] as const,
  details: () => [...assessmentKeys.all, "detail"] as const,
  detail: (id: string | number) => [...assessmentKeys.details(), id] as const,
  questionnaires: () => [...assessmentKeys.all, "questionnaires"] as const,
  questionnaire: (id: string | number) => [...assessmentKeys.questionnaires(), id] as const,
  categories: () => [...assessmentKeys.all, "categories"] as const,
};

// Fetch all assessments
export const useAssessments = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: assessmentKeys.lists(),
    queryFn: async () => {
      const response = await assessmentAPI.getAssessments();
      return response.data.results || response.data;
    },
    ...options,
  });
};

// Fetch single assessment by ID
export const useAssessment = (
  id: string | number | undefined,
  options?: UseQueryOptions<any, Error>
) => {
  return useQuery({
    queryKey: assessmentKeys.detail(id as string | number),
    queryFn: async () => {
      const response = await assessmentAPI.getAssessment(id as number);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

// Fetch all questionnaires
export const useQuestionnaires = (options?: UseQueryOptions<any[], Error>) => {
  return useQuery({
    queryKey: assessmentKeys.questionnaires(),
    queryFn: async () => {
      const response = await assessmentAPI.getQuestionnaires();
      return response.data.results || response.data;
    },
    ...options,
  });
};

// Fetch single questionnaire by ID
export const useQuestionnaire = (
  id: string | number | undefined,
  options?: UseQueryOptions<any, Error>
) => {
  return useQuery({
    queryKey: assessmentKeys.questionnaire(id as string | number),
    queryFn: async () => {
      const response = await assessmentAPI.getQuestionnaire(id as number);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

// Fetch assessment categories
export const useAssessmentCategories = (options?: UseQueryOptions<any[], Error>) => {
  return useQuery({
    queryKey: assessmentKeys.categories(),
    queryFn: async () => {
      const response = await assessmentAPI.getCategories();
      return response.data.results || response.data;
    },
    ...options,
  });
};
