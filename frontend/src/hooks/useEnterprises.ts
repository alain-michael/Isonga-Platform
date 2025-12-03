import { useQuery } from "@tanstack/react-query";
import { enterpriseAPI } from "../services/api";

export const useMyEnterprise = () => {
  return useQuery({
    queryKey: ["my-enterprise"],
    queryFn: () => enterpriseAPI.getMyEnterprise().then((res) => res.data),
    retry: false,
  });
};

export const useEnterprises = (params?: any) => {
  return useQuery({
    queryKey: ["enterprises", params],
    queryFn: () => enterpriseAPI.getAll(params).then((res) => res.data),
  });
};

export const useEnterprise = (id: string) => {
  return useQuery({
    queryKey: ["enterprise", id],
    queryFn: () => enterpriseAPI.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};
