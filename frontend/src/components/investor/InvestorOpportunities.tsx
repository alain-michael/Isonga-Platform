import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Building2,
  MapPin,
  TrendingUp,
  Calendar,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { investorAPI } from "../../services/investor";

const InvestorOpportunities: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch interested/saved campaigns
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["interestedOpportunities"],
    queryFn: investorAPI.getInterestedCampaigns,
  });

  const filteredOpportunities = opportunities.filter((opp: any) => {
    const matchesSearch =
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.enterprise_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || opp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        label: "Pending",
      },
      closed: {
        bg: "bg-neutral-100 dark:bg-neutral-800",
        text: "text-neutral-700 dark:text-neutral-400",
        label: "Closed",
      },
      funded: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        label: "Fully Funded",
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
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
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Tracked Opportunities
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Monitor funding applications you've shown interest in.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-6 mb-8 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search tracked applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
            />
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="funded">Fully Funded</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="glass-effect rounded-2xl p-12 text-center glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="mx-auto h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No tracked opportunities yet
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Start exploring opportunities and mark applications you're
            interested in.
          </p>
          <button
            onClick={() => navigate("/investor/matches")}
            className="mt-6 btn-primary"
          >
            Explore Opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOpportunities.map((opportunity: any) => (
            <div
              key={opportunity.id}
              className="glass-effect rounded-2xl p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {opportunity.enterprise_name?.charAt(0) || "E"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                          {opportunity.title}
                        </h3>
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          <Building2 className="h-3.5 w-3.5 mr-1" />
                          {opportunity.enterprise_name}
                          {opportunity.enterprise_location && (
                            <>
                              <span className="mx-2">•</span>
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {opportunity.enterprise_location}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(opportunity.status || "active")}
                  </div>

                  <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                    {opportunity.description}
                  </p>

                  {/* Funding Type & Date */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                      <TrendingUp className="h-4 w-4 mr-1.5" />
                      <span className="capitalize">
                        {opportunity.campaign_type} Funding
                      </span>
                    </div>
                    {opportunity.end_date && (
                      <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>
                          Ends{" "}
                          {new Date(opportunity.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {opportunity.interested_at && (
                      <div className="flex items-center text-primary-600 dark:text-primary-400">
                        <Heart className="h-4 w-4 mr-1.5 fill-current" />
                        <span>
                          Saved{" "}
                          {new Date(
                            opportunity.interested_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Funding Progress */}
                <div className="lg:w-80 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Funding Progress
                      </span>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {calculateProgress(
                          opportunity.amount_raised || 0,
                          opportunity.target_amount,
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                        style={{
                          width: `${calculateProgress(
                            opportunity.amount_raised || 0,
                            opportunity.target_amount,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Raised
                      </p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(opportunity.amount_raised || 0)}
                      </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Target
                      </p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(opportunity.target_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-700 dark:text-blue-400">
                        Min Investment
                      </span>
                      <span className="text-sm font-bold text-blue-900 dark:text-blue-300">
                        {formatCurrency(opportunity.min_investment)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/investor/matches/${opportunity.id}`)
                    }
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorOpportunities;
