import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enterpriseAPI } from "../../services/api";
import {
  ArrowLeft,
  Edit,
  Share2,
  MoreVertical,
  Target,
  DollarSign,
  Users,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  MessageSquare,
  Activity,
  XCircle,
} from "lucide-react";
import {
  useCampaign,
  useSubmitCampaignForReview,
} from "../../hooks/useCampaigns";

const statusConfig: Record<
  string,
  { color: string; bgColor: string; icon: React.ElementType; label: string }
> = {
  draft: {
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: Clock,
    label: "Draft",
  },
  submitted: {
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Clock,
    label: "Under Review",
  },
  vetted: {
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: CheckCircle,
    label: "Vetted",
  },
  active: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: TrendingUp,
    label: "Active",
  },
  completed: {
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    icon: CheckCircle,
    label: "Completed",
  },
  cancelled: {
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: AlertCircle,
    label: "Cancelled",
  },
};

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "overview" | "investors" | "documents" | "updates"
  >("overview");

  const { data: campaign, isLoading, error } = useCampaign(id);
  const submitForReviewMutation = useSubmitCampaignForReview();

  // Fetch matches for this enterprise
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["enterpriseMatches"],
    queryFn: enterpriseAPI.getMatches,
    enabled: activeTab === "investors",
  });

  // Filter matches for this campaign if possible, or just show all enterprise matches
  // Assuming matches are linked to enterprise, we show all interested investors
  const interestedInvestors = matches.filter(
    (m: any) =>
      m.status === "approved" ||
      m.status === "engaged" ||
      m.status === "completed"
  );

  const acceptMatchMutation = useMutation({
    mutationFn: (matchId: string) => enterpriseAPI.acceptMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterpriseMatches"] });
      alert("You have accepted the investor's interest!");
    },
  });

  const rejectMatchMutation = useMutation({
    mutationFn: (matchId: string) => enterpriseAPI.rejectMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterpriseMatches"] });
      alert("You have declined the investor's interest.");
    },
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

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  const handleSubmitForReview = async () => {
    if (id) {
      await submitForReviewMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Campaign Not Found
        </h3>
        <p className="text-red-600 mb-4">
          Unable to load this campaign. It may have been deleted or you don't
          have access.
        </p>
        <Link to="/campaigns" className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const StatusIcon = statusConfig[campaign.status]?.icon || Clock;
  const progressPercentage = getProgressPercentage(
    campaign.amount_raised || 0,
    campaign.target_amount
  );
  const daysRemaining = campaign.end_date
    ? getDaysRemaining(campaign.end_date)
    : null;

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "investors", label: "Investors", icon: Users },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "updates", label: "Updates", icon: MessageSquare },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/campaigns")}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-900">
                {campaign.title}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  statusConfig[campaign.status]?.bgColor
                } ${statusConfig[campaign.status]?.color}`}
              >
                <StatusIcon className="h-4 w-4" />
                {statusConfig[campaign.status]?.label}
              </span>
            </div>
            <p className="text-neutral-600">
              {campaign.enterprise_name} •{" "}
              {campaign.campaign_type?.charAt(0).toUpperCase() +
                campaign.campaign_type?.slice(1)}{" "}
              Campaign
            </p>
          </div>

          <div className="flex items-center gap-3">
            {campaign.status === "draft" && (
              <button
                onClick={handleSubmitForReview}
                disabled={submitForReviewMutation.isPending}
                className="btn-primary"
              >
                {submitForReviewMutation.isPending
                  ? "Submitting..."
                  : "Submit for Review"}
              </button>
            )}
            <Link
              to={`/campaigns/${id}/edit`}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button className="p-2 hover:bg-neutral-100 rounded-lg">
              <Share2 className="h-5 w-5 text-neutral-600" />
            </button>
            <button className="p-2 hover:bg-neutral-100 rounded-lg">
              <MoreVertical className="h-5 w-5 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Amount Raised</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {formatCurrency(campaign.amount_raised || 0)}
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            of {formatCurrency(campaign.target_amount)} goal
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Progress</span>
            <div className="p-2 bg-primary-100 rounded-lg">
              <Target className="h-4 w-4 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary-600">
            {progressPercentage.toFixed(0)}%
          </p>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">
              Interested Investors
            </span>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {campaign.investor_count || 0}
          </p>
          <p className="text-sm text-neutral-500 mt-1">investors interested</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Campaign Views</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {campaign.views_count || 0}
          </p>
          <p className="text-sm text-neutral-500 mt-1">total views</p>
        </div>
      </div>

      {/* Timeline Banner */}
      {campaign.status === "active" &&
        daysRemaining !== null &&
        campaign.end_date && (
          <div
            className={`rounded-xl p-4 mb-6 ${
              daysRemaining > 7
                ? "bg-green-50 border border-green-200"
                : "bg-orange-50 border border-orange-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar
                  className={`h-5 w-5 ${
                    daysRemaining > 7 ? "text-green-600" : "text-orange-600"
                  }`}
                />
                <span
                  className={`font-medium ${
                    daysRemaining > 7 ? "text-green-800" : "text-orange-800"
                  }`}
                >
                  {daysRemaining} days remaining
                </span>
              </div>
              <div className="text-sm text-neutral-600">
                Ends on {new Date(campaign.end_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="border-b border-neutral-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600 bg-primary-50"
                      : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    About This Campaign
                  </h3>
                  <p className="text-neutral-700 whitespace-pre-wrap">
                    {campaign.description}
                  </p>
                </div>

                {campaign.use_of_funds && (
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Use of Funds
                    </h3>
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <p className="text-neutral-700">
                        {typeof campaign.use_of_funds === "object"
                          ? campaign.use_of_funds.description ||
                            JSON.stringify(campaign.use_of_funds)
                          : campaign.use_of_funds}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-xl p-5">
                  <h4 className="font-medium text-neutral-900 mb-4">
                    Campaign Details
                  </h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Type:</dt>
                      <dd className="font-medium text-neutral-900">
                        {campaign.campaign_type?.charAt(0).toUpperCase() +
                          campaign.campaign_type?.slice(1)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Min Investment:</dt>
                      <dd className="font-medium text-neutral-900">
                        {formatCurrency(campaign.min_investment)}
                      </dd>
                    </div>
                    {campaign.max_investment && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Max Investment:</dt>
                        <dd className="font-medium text-neutral-900">
                          {formatCurrency(campaign.max_investment)}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Start Date:</dt>
                      <dd className="font-medium text-neutral-900">
                        {campaign.start_date
                          ? new Date(campaign.start_date).toLocaleDateString()
                          : "Not set"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">End Date:</dt>
                      <dd className="font-medium text-neutral-900">
                        {campaign.end_date
                          ? new Date(campaign.end_date).toLocaleDateString()
                          : "Not set"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {campaign.is_vetted && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Vetted by Isonga</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      This campaign has been reviewed and approved by our team.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "investors" && (
            <div>
              {matchesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : interestedInvestors.length > 0 ? (
                <div className="space-y-4">
                  {interestedInvestors.map((match: any) => (
                    <div
                      key={match.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white border border-neutral-200 rounded-xl hover:border-primary-200 transition-colors"
                    >
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                          {match.investor?.organization_name?.charAt(0) || "I"}
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900">
                            {match.investor?.organization_name || "Investor"}
                          </h4>
                          <p className="text-sm text-neutral-500">
                            {match.investor?.investor_type} • Interested in your
                            campaign
                          </p>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                match.status === "engaged"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {match.status === "engaged"
                                ? "Connected"
                                : "Interest Expressed"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        {match.status === "approved" && (
                          <>
                            <button
                              onClick={() =>
                                acceptMatchMutation.mutate(match.id)
                              }
                              disabled={acceptMatchMutation.isPending}
                              className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                rejectMatchMutation.mutate(match.id)
                              }
                              disabled={rejectMatchMutation.isPending}
                              className="flex-1 md:flex-none px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Decline
                            </button>
                          </>
                        )}
                        {match.status === "engaged" && (
                          <button className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Message
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                    No Investor Interest Yet
                  </h3>
                  <p className="text-neutral-500">
                    When investors express interest in your campaign, they'll
                    appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                  No Documents Yet
                </h3>
                <p className="text-neutral-500 mb-6">
                  Upload supporting documents for your campaign.
                </p>
                <button className="btn-primary">Upload Document</button>
              </div>
            </div>
          )}

          {activeTab === "updates" && (
            <div>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                  No Updates Yet
                </h3>
                <p className="text-neutral-500 mb-6">
                  Keep investors informed with regular updates about your
                  campaign progress.
                </p>
                <button className="btn-primary">Post Update</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
