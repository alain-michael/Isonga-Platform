import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {UseMutationOptions} from "@tanstack/react-query";
import { assessmentAPI } from "../../services/api";
import { assessmentKeys } from "../queries/useAssessmentQueries";

// Create assessment
export const useCreateAssessment = (
  options?: UseMutationOptions<any, Error, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => assessmentAPI.createAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
    ...options,
  });
};

// Update assessment
export const useUpdateAssessment = (
  options?: UseMutationOptions<any, Error, { id: number; data: any }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => assessmentAPI.updateAssessment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
    ...options,
  });
};

// Delete assessment
export const useDeleteAssessment = (
  options?: UseMutationOptions<any, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assessmentAPI.deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
    ...options,
  });
};

// Start assessment
export const useStartAssessment = (
  options?: UseMutationOptions<any, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assessmentAPI.startAssessment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
    ...options,
  });
};

// Submit assessment
export const useSubmitAssessment = (
  options?: UseMutationOptions<any, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assessmentAPI.submitAssessment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
    ...options,
  });
};

// Submit assessment responses
export const useSubmitAssessmentResponses = (
  options?: UseMutationOptions<any, Error, { assessmentId: number; responses: any[] }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assessmentId, responses }) =>
      assessmentAPI.submitResponses(assessmentId, responses),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.detail(variables.assessmentId),
      });
    },
    ...options,
  });
};

// Create questionnaire
export const useCreateQuestionnaire = (
  options?: UseMutationOptions<any, Error, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => assessmentAPI.createQuestionnaire(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.questionnaires() });
    },
    ...options,
  });
};

// Update questionnaire
export const useUpdateQuestionnaire = (
  options?: UseMutationOptions<any, Error, { id: number; data: any }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => assessmentAPI.updateQuestionnaire(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.questionnaire(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.questionnaires() });
    },
    ...options,
  });
};

// Delete questionnaire
export const useDeleteQuestionnaire = (
  options?: UseMutationOptions<any, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assessmentAPI.deleteQuestionnaire(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.questionnaires() });
    },
    ...options,
  });
};
