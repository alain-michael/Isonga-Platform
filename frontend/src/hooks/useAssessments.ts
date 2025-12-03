import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentAPI } from "../services/api";

export const useAssessments = (params?: any) => {
  return useQuery({
    queryKey: ["assessments", params],
    queryFn: () => assessmentAPI.getAssessments(params).then((res) => res.data.results),
  });
};

export const useAssessment = (id: string) => {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: () => assessmentAPI.getAssessment(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => assessmentAPI.createAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
};

export const useQuestionnaires = () => {
  return useQuery({
    queryKey: ["questionnaires"],
    queryFn: () => assessmentAPI.getQuestionnaires().then((res) => res.data),
  });
};
