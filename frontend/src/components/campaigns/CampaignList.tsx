import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Target,
  Calendar,
} from "lucide-react";
import { useMyCampaigns } from "../../hooks/useCampaigns";

const statusConfig: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  draft: { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Draft" },
  submitted: {
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
    label: "Submitted",
  },
  vetted: {
    color: "bg-purple-100 text-purple-800",
    icon: CheckCircle,
    label: "Vetted",
  },
  active: {
    color: "bg-green-100 text-green-800",
    icon: TrendingUp,
    label: "Active",
  },
  completed: {
    color: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle,
    label: "Completed",
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
    label: "Cancelled",
  },
};

const CampaignList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: campaigns, isLoading, error } = useMyCampaigns();

  const filteredCampaigns = campaigns?.filter((campaign: any) => {
    const matchesSearch = campaign.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, target: number) => {
    if (!target) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  // Stats calculation
  const stats = {
    total: campaigns?.length || 0,
    active: campaigns?.filter((c: any) => c.status === "active").length || 0,
    totalRaised:
      campaigns?.reduce(
        (sum: number, c: any) => sum + (c.amount_raised || 0),
        0
      ) || 0,
    totalTarget:
      campaigns?.reduce(
        (sum: number, c: any) => sum + (c.target_amount || 0),
        0
      ) || 0,
    totalInvestors:
      campaigns?.reduce(
        (sum: number, c: any) => sum + (c.investor_count || 0),
        0
      ) || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Campaigns
        </h3>
        <p className="text-red-600">
          Unable to load your campaigns. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Campaigns</h1>
          <p className="text-neutral-600 mt-1">
            Manage your fundraising campaigns
          </p>
        </div>
        <Link
          to="/campaigns/create"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <Target className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Raised</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(stats.totalRaised)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Interested Investors</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.totalInvestors}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="vetted">Vetted</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-4 py-2.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns?.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Target className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              No Campaigns Found
            </h3>
            <p className="text-neutral-500 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "No campaigns match your search criteria."
                : "You haven't created any campaigns yet."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link
                to="/campaigns/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Your First Campaign
              </Link>
            )}
          </div>
        ) : (
          filteredCampaigns?.map((campaign: any) => {
            const StatusIcon = statusConfig[campaign.status]?.icon || Clock;
            const progressPercentage = getProgressPercentage(
              campaign.amount_raised,
              campaign.target_amount
            );

            return (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="block bg-white rounded-xl border border-neutral-200 p-6 hover:border-primary-300 hover:shadow-md transition group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition">
                        {campaign.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusConfig[campaign.status]?.color
                        }`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig[campaign.status]?.label}
                      </span>
                    </div>
                    <p className="text-neutral-600 text-sm line-clamp-2 mb-4">
                      {campaign.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {campaign.start_date
                          ? new Date(campaign.start_date).toLocaleDateString()
                          : "Not set"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {campaign.views_count || 0} views
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {campaign.investor_count || 0} interested
                      </span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="lg:w-64 lg:border-l lg:border-neutral-200 lg:pl-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-600">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {progressPercentage.toFixed(0)}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(campaign.amount_raised || 0)}
                        </span>
                        <span className="text-neutral-500"> raised</span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-500">of </span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(campaign.target_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="hidden lg:block h-5 w-5 text-neutral-400 group-hover:text-primary-600 transition" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CampaignList;
