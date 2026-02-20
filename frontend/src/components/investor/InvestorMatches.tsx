import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Star,
  Target,
  FileText,
} from "lucide-react";
import { investorAPI } from "../../services/investor";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const InvestorMatches: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch campaigns targeted to this partner (now uses backend filtering)
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["targetedCampaigns"],
    queryFn: async () => {
      const response = await api.get("/api/campaigns/");
      return response.data.results || response.data;
    },
  });

  const interactMutation = useMutation({
    mutationFn: ({
      campaignId,
      action,
    }: {
      campaignId: string;
      action: "approve" | "reject";
    }) => {
      return investorAPI.interactWithMatch(campaignId, action);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["targetedCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["interestedOpportunities"] });
      queryClient.invalidateQueries({ queryKey: ["investorStats"] });

      if (variables.action === "approve") {
        alert(
          "Interest expressed successfully! Check your Tracked opportunities.",
        );
      } else {
        alert(
          "Campaign passed. It will no longer appear in your opportunities.",
        );
      }
    },
    onError: (error: any) => {
      alert(error?.response?.data?.error || "Failed to process action");
    },
  });

  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch =
      campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.enterprise_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector =
      sectorFilter === "all" || campaign.enterprise_sector === sectorFilter;
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesSector && matchesStatus;
  });

  const sectors = [
    ...new Set(campaigns.map((c: any) => c.enterprise_sector)),
  ].filter(Boolean);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      active: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        label: "Active",
      },
      approved: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        label: "Approved",
      },
      submitted: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        label: "Under Review",
      },
      completed: {
        bg: "bg-neutral-100 dark:bg-neutral-800",
        text: "text-neutral-700 dark:text-neutral-400",
        label: "Completed",
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Target className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Targeted Applications
          </h1>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Review funding applications submitted directly to your organization.
          Only campaigns where you're a target partner appear here.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-6 mb-8 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            />
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[200px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="submitted">Under Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign: any) => (
          <div
            key={campaign.id}
            onClick={() => navigate(`/investor/applications/${campaign.id}`)}
            className="glass-effect rounded-2xl p-6 card-hover glass-effect cursor-pointer dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {campaign.enterprise_name?.charAt(0) || "E"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {campaign.enterprise_name || "Unknown Enterprise"}
                  </h3>
                  <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    {campaign.enterprise_sector || "N/A"}
                    {campaign.enterprise_location && (
                      <>
                        <span className="mx-2">•</span>
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {campaign.enterprise_location}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(campaign.status)}
                {campaign.readiness_score_at_submission && (
                  <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                    <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                    {campaign.readiness_score_at_submission}% Ready
                  </div>
                )}
              </div>
            </div>

            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {campaign.title}
            </h4>

            <p className="text-neutral-600 dark:text-neutral-300 mb-6 flex-grow line-clamp-2">
              {campaign.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">
                  Target Amount
                </p>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ${campaign.target_amount?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">
                  Min Investment
                </p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  ${campaign.min_investment?.toLocaleString() || "0"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-md font-medium">
                {campaign.campaign_type}
              </span>
              <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-md font-medium flex items-center gap-1">
                <Target className="h-3 w-3" />
                Targeted to You
              </span>
            </div>

            <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/investor/applications/${campaign.id}`);
                }}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Review Application
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-neutral-100 dark:bg-neutral-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-10 w-10 text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            No targeted applications found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {searchTerm || sectorFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "No SMEs have targeted your organization yet. Applications will appear here when enterprises select you as a funding partner."}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvestorMatches;
