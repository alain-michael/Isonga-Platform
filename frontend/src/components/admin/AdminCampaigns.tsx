import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { campaignAPI } from "../../services/campaignsService";
import {
  TrendingUp,
  Eye,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import type { Campaign } from "../../types/campaigns";

const AdminCampaigns: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vettedFilter, setVettedFilter] = useState<string>("all");

  const {
    data: campaigns,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const response = await campaignAPI.getAll();
      return response.data.results;
    },
  });

  const getStatusBadge = (status: string, isVetted: boolean) => {
    if (!isVetted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending Review
        </span>
      );
    }

    const statusConfig: Record<
      string,
      { color: string; icon: React.ElementType; label: string }
    > = {
      draft: {
        color: "bg-neutral-100 text-neutral-800 border-neutral-200",
        icon: Clock,
        label: "Draft",
      },
      submitted: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
        label: "Submitted",
      },
      active: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Active",
      },
      completed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
        label: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const filteredCampaigns = campaigns?.filter((campaign: Campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.enterprise_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;

    const matchesVetted =
      vettedFilter === "all" ||
      (vettedFilter === "vetted" && campaign.is_vetted) ||
      (vettedFilter === "pending" && !campaign.is_vetted);

    return matchesSearch && matchesStatus && matchesVetted;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-lg font-medium text-neutral-600">
            Loading campaigns...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Campaigns
          </h3>
          <p className="text-red-600 mb-4">
            Unable to load campaigns. Please try again.
          </p>
          <button onClick={() => refetch()} className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Campaign Management
            </h1>
            <p className="text-neutral-600 mt-2">
              Review and manage all fundraising campaigns
            </p>
          </div>
          <button onClick={() => refetch()} className="btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {campaigns?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {campaigns?.filter((c: any) => c.status === "active").length ||
                  0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {campaigns?.filter((c: any) => !c.is_vetted).length || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Raised</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {new Intl.NumberFormat("en-RW", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(
                  (campaigns as any[])?.reduce(
                    (sum: number, c: any) => sum + parseFloat(c.amount_raised),
                    0
                  ) || 0
                )}{" "}
                RWF
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl p-6 border border-neutral-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={vettedFilter}
              onChange={(e) => setVettedFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Campaigns</option>
              <option value="vetted">Vetted Only</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="glass-effect rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Enterprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Funding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Interests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {(filteredCampaigns as any)?.length > 0 ? (
                (filteredCampaigns as any).map((campaign: any) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-neutral-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {campaign.title}
                        </p>
                        <p className="text-sm text-neutral-500">
                          Deadline:{" "}
                          {campaign.end_date
                            ? new Date(campaign.end_date).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-neutral-900">
                        {campaign.enterprise_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {new Intl.NumberFormat("en-RW", {
                            style: "currency",
                            currency: "RWF",
                            notation: "compact",
                          }).format(campaign.amount_raised)}{" "}
                          /{" "}
                          {new Intl.NumberFormat("en-RW", {
                            style: "currency",
                            currency: "RWF",
                            notation: "compact",
                          }).format(campaign.target_amount)}
                        </p>
                        <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                campaign.progress_percentage || 0,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(campaign.status, campaign.is_vetted)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neutral-900 font-medium">
                        {campaign.interests_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/campaigns/${campaign.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">No campaigns found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaigns;
