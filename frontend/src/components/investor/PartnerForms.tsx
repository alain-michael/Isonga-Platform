import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  FileText,
  Edit,
  Archive,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import { investorAPI } from "../../services/investor";

interface PartnerForm {
  id: number;
  partner: number;
  name: string;
  description: string;
  funding_type: string;
  status: "draft" | "active" | "archived";
  min_readiness_score: number | null;
  created_at: string;
  updated_at: string;
  sections_count?: number;
}

const PartnerForms: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "draft" | "active" | "archived">(
    "all",
  );

  const { data: investorProfile } = useQuery({
    queryKey: ["investorProfile"],
    queryFn: investorAPI.getProfile,
  });

  // Fetch partner forms
  const { data: forms = [], isLoading } = useQuery<PartnerForm[]>({
    queryKey: ["partnerForms", filter],
    queryFn: async () => {
      const params: any = {};
      if (filter !== "all") {
        params.status = filter;
      }
      const response = await api.get("/investors/funding-forms/", { params });
      return response.data.results || response.data;
    },
  });

  // Duplicate form mutation
  const duplicateMutation = useMutation({
    mutationFn: async (formId: number) => {
      const response = await api.post(
        `/investors/funding-forms/${formId}/duplicate/`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerForms"] });
      alert("Form duplicated successfully!");
    },
    onError: () => {
      alert("Failed to duplicate form. Please try again.");
    },
  });

  // Archive form mutation
  const archiveMutation = useMutation({
    mutationFn: async (formId: number) => {
      const response = await api.post(
        `/investors/funding-forms/${formId}/archive/`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerForms"] });
      alert("Form archived successfully!");
    },
    onError: () => {
      alert("Failed to archive form. Please try again.");
    },
  });

  // Activate form mutation
  const activateMutation = useMutation({
    mutationFn: async (formId: number) => {
      const response = await api.post(
        `/investors/funding-forms/${formId}/activate/`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerForms"] });
      alert("Form activated successfully!");
    },
    onError: () => {
      alert("Failed to activate form. Please try again.");
    },
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: {
        bg: "bg-neutral-100 text-neutral-700",
        icon: <Clock className="h-3 w-3" />,
      },
      active: {
        bg: "bg-green-100 text-green-700",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      archived: {
        bg: "bg-red-100 text-red-700",
        icon: <Archive className="h-3 w-3" />,
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg}`}
      >
        {badge.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFundingTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      loan: "Loan",
      equity: "Equity Investment",
      grant: "Grant",
      hybrid: "Hybrid",
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredForms = forms
    .filter((f) => !investorProfile || f.partner === investorProfile.id)
    .filter((f) => filter === "all" || f.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Application Forms
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Create and manage custom application forms for SMEs
          </p>
        </div>
        <Link
          to="/investor/forms/create"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Form</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "draft", "archived"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? "bg-primary-600 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
          <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No forms found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Create your first application form to get started
          </p>
          <Link
            to="/investor/forms/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Form</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    {form.name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {form.description}
                  </p>
                </div>
                {getStatusBadge(form.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Type:
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {getFundingTypeLabel(form.funding_type)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Sections:
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {form.sections_count || 0}
                  </span>
                </div>
                {form.min_readiness_score && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Min Score:
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {form.min_readiness_score}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/investor/forms/${form.id}/edit`}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => duplicateMutation.mutate(form.id)}
                  className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {form.status === "draft" ? (
                  <button
                    onClick={() => activateMutation.mutate(form.id)}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    title="Activate"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                ) : form.status === "active" ? (
                  <button
                    onClick={() => archiveMutation.mutate(form.id)}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">About Application Forms</p>
            <p>
              Create custom forms to collect specific information from SMEs when
              they apply for your funding opportunities. Forms can include text
              fields, file uploads, and auto-filled data from their profiles.
            </p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>
                <strong>Draft:</strong> Forms being created or edited (not
                visible to SMEs)
              </li>
              <li>
                <strong>Active:</strong> Published forms that SMEs can fill when
                applying
              </li>
              <li>
                <strong>Archived:</strong> No longer accepting new submissions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerForms;
