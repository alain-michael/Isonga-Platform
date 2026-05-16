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
  MessageSquare,
  Banknote,
  CheckCircle,
} from "lucide-react";
import { investorAPI } from "../../services/investor";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { campaignInterestsAPI } from "../../services/campaignsService";
import CampaignMessageThread from "../campaigns/CampaignMessageThread";

const InvestorMatches: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pledgingCampaignId, setPledgingCampaignId] = useState<string | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledgeNotes, setPledgeNotes] = useState("");
  const [openMessageCampaignId, setOpenMessageCampaignId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch campaigns targeted to this partner (now uses backend filtering)
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["targetedCampaigns"],
    queryFn: async () => {
      const response = await api.get("/campaigns/api/campaigns/");
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

  // Fetch all interests for this investor (filtered by backend)
  const { data: myInterestsResponse } = useQuery({
    queryKey: ["myInvestorInterests"],
    queryFn: () => campaignInterestsAPI.getAll(),
    refetchInterval: 15000,
  });
  const myInterests: any[] = (() => {
    const d = myInterestsResponse?.data;
    if (!d) return [];
    return Array.isArray(d) ? d : (d as any).results || [];
  })();
  // Map: campaignId → interest record
  const interestMap = Object.fromEntries(
    myInterests.map((i: any) => [i.campaign, i])
  );

  // Pledge mutation
  const pledgeMutation = useMutation({
    mutationFn: ({ interestId, amount, notes }: { interestId: string; amount: number; notes?: string }) =>
      campaignInterestsAPI.pledge(interestId, amount, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInvestorInterests"] });
      setPledgingCampaignId(null);
      setPledgeAmount("");
      setPledgeNotes("");
    },
  });

  // Express interest (create CampaignInterest)
  const expressInterestMutation = useMutation({
    mutationFn: (campaignId: string) =>
      campaignInterestsAPI.create({ campaign: campaignId, status: "interested" } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInvestorInterests"] });
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
    ...new Set(campaigns.map((c: any) => c.enterprise_sector as string)),
  ].filter(Boolean) as string[];

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

      {/* Applications List */}
      <div className="space-y-3">
        {filteredCampaigns.map((campaign: any) => (
          <div
            key={campaign.id}
            onClick={() => navigate(`/investor/matches/${campaign.id}`)}
            className="glass-effect rounded-xl p-5 card-hover glass-effect cursor-pointer dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            {/* Row layout */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow flex-shrink-0">
                {campaign.enterprise_name?.charAt(0) || "E"}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {campaign.enterprise_name || "Unknown Enterprise"}
                  </span>
                  <span className="text-neutral-400 dark:text-neutral-500">·</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />{campaign.enterprise_sector || "N/A"}
                  </span>
                  {campaign.enterprise_location && (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{campaign.enterprise_location}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {campaign.title}
                </p>
                {campaign.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                    {campaign.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 text-right">
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {campaign.target_amount?.toLocaleString() || "0"} RWF
                </span>
                <span className="text-xs text-neutral-400">Min: {campaign.min_investment?.toLocaleString() || "0"} RWF</span>
                <div className="flex gap-1 mt-1">
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded font-medium capitalize">
                    {campaign.campaign_type}
                  </span>
                  {getStatusBadge(campaign.status)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                {(() => {
                  const interest = interestMap[campaign.id];
                  const statusLabel: Record<string, string> = {
                    interested: "Interested",
                    pledged: "Offer Submitted",
                    committed: "Offer Submitted",
                    accepted: "Accepted ✓",
                    declined: "Declined",
                    withdrawn: "Withdrawn",
                  };
                  if (!interest) {
                    return (
                      <button
                        onClick={() => expressInterestMutation.mutate(campaign.id)}
                        disabled={expressInterestMutation.isPending}
                        className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Star className="h-3.5 w-3.5" />
                        Express Interest
                      </button>
                    );
                  }
                  return (
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          interest.status === "accepted" ? "bg-green-100 text-green-800" :
                          interest.status === "declined" ? "bg-red-100 text-red-800" :
                          (interest.status === "pledged" || interest.status === "committed") ? "bg-amber-100 text-amber-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {statusLabel[interest.status] || interest.status}
                        </span>
                        {interest.committed_amount && (
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                            {Number(interest.committed_amount).toLocaleString()} RWF
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        {interest.status === "interested" && campaign.status === "active" && (
                          <button
                            onClick={() => setPledgingCampaignId(pledgingCampaignId === campaign.id ? null : campaign.id)}
                            className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center gap-1"
                          >
                            <Banknote className="h-3.5 w-3.5" />
                            Make Offer
                          </button>
                        )}
                        {campaign.status === "active" && campaign.enterprise_user_id && (
                          <button
                            onClick={() => setOpenMessageCampaignId(openMessageCampaignId === campaign.id ? null : campaign.id)}
                            className="px-3 py-1.5 text-xs btn-secondary flex items-center gap-1"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {openMessageCampaignId === campaign.id ? "Close" : "Message"}
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/investor/matches/${campaign.id}`)}
                          className="px-3 py-1.5 text-xs btn-secondary flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Expandable offer form */}
            {(() => {
              const interest = interestMap[campaign.id];
              if (!interest) return null;
              return (
                <>
                  {pledgingCampaignId === campaign.id && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-xl space-y-2" onClick={(e) => e.stopPropagation()}>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Submit a Funding Offer</p>
                      <input
                        type="number"
                        placeholder="Amount (RWF)"
                        value={pledgeAmount}
                        onChange={(e) => setPledgeAmount(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={pledgeNotes}
                        onChange={(e) => setPledgeNotes(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => pledgeMutation.mutate({ interestId: interest.id, amount: Number(pledgeAmount), notes: pledgeNotes })}
                          disabled={!pledgeAmount || pledgeMutation.isPending}
                          className="flex-1 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {pledgeMutation.isPending ? "Submitting..." : "Confirm Offer"}
                        </button>
                        <button onClick={() => setPledgingCampaignId(null)} className="px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {openMessageCampaignId === campaign.id && campaign.enterprise_user_id && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700" onClick={(e) => e.stopPropagation()}>
                      <CampaignMessageThread
                        campaignId={campaign.id}
                        interestId={interest.id}
                        receiverId={campaign.enterprise_user_id}
                        receiverName={campaign.enterprise_name || "Enterprise"}
                      />
                    </div>
                  )}
                </>
              );
            })()}
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
