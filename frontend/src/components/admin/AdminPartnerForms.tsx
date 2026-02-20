import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  FileText,
  Edit,
  Archive,
  Copy,
  CheckCircle,
  Clock,
  Eye,
  Filter,
} from "lucide-react";
import api from "../../services/api";

interface FundingForm {
  id: string;
  partner: string;
  partner_name: string;
  name: string;
  description: string;
  funding_type: string;
  status: string;
  version: number;
  min_readiness_score: number | null;
  created_at: string;
  updated_at: string;
  sections_count?: number;
}

export default function AdminPartnerForms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fundingTypeFilter, setFundingTypeFilter] = useState<string>("all");

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["funding-forms", statusFilter, fundingTypeFilter],
    queryFn: async () => {
      let url = "/api/investors/funding-forms/";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (fundingTypeFilter !== "all")
        params.append("funding_type", fundingTypeFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      return response.data.results || response.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (formId: string) => {
      const response = await api.post(
        `/api/investors/funding-forms/${formId}/activate/`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funding-forms"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (formId: string) => {
      const response = await api.post(
        `/api/investors/funding-forms/${formId}/archive/`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funding-forms"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (formId: string) => {
      const response = await api.post(
        `/api/investors/funding-forms/${formId}/duplicate/`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funding-forms"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-300",
        icon: Clock,
        label: "Draft",
      },
      active: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-300",
        icon: CheckCircle,
        label: "Active",
      },
      archived: {
        bg: "bg-neutral-100 dark:bg-neutral-700",
        text: "text-neutral-800 dark:text-neutral-300",
        icon: Archive,
        label: "Archived",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  const getFundingTypeBadge = (type: string) => {
    const colors = {
      loan: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      equity:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
      grant:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      hybrid:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          colors[type as keyof typeof colors] || colors.loan
        }`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Partner Funding Forms
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage custom application forms for each funding partner
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/partners/forms/create")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Form
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <Filter className="h-5 w-5 text-neutral-400" />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={fundingTypeFilter}
          onChange={(e) => setFundingTypeFilter(e.target.value)}
          className="px-3 py-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
        >
          <option value="all">All Funding Types</option>
          <option value="loan">Loan</option>
          <option value="equity">Equity</option>
          <option value="grant">Grant</option>
          <option value="hybrid">Hybrid</option>
        </select>

        {(statusFilter !== "all" || fundingTypeFilter !== "all") && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setFundingTypeFilter("all");
            }}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            No funding forms found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {statusFilter !== "all" || fundingTypeFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first funding form to get started"}
          </p>
          {statusFilter === "all" && fundingTypeFilter === "all" && (
            <button
              onClick={() => navigate("/admin/partners/forms/create")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Form
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form: FundingForm) => (
            <div
              key={form.id}
              className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                    {form.name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {form.partner_name}
                  </p>
                </div>
                {getStatusBadge(form.status)}
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                {form.description}
              </p>

              <div className="flex items-center gap-2 mb-4">
                {getFundingTypeBadge(form.funding_type)}
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  v{form.version}
                </span>
              </div>

              {form.min_readiness_score && (
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                  Min. Readiness Score: {form.min_readiness_score}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/partners/forms/${form.id}`)}
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/admin/partners/forms/${form.id}/edit`)
                    }
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                    title="Edit form"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => duplicateMutation.mutate(form.id)}
                    disabled={duplicateMutation.isPending}
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors disabled:opacity-50"
                    title="Duplicate form"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  {form.status === "draft" && (
                    <button
                      onClick={() => activateMutation.mutate(form.id)}
                      disabled={activateMutation.isPending}
                      className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
                      title="Activate form"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}

                  {form.status === "active" && (
                    <button
                      onClick={() => archiveMutation.mutate(form.id)}
                      disabled={archiveMutation.isPending}
                      className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
                      title="Archive form"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
