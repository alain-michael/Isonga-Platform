import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignAPI } from "../../services/campaignsService";
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Users,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  FileEdit,
  Target,
} from "lucide-react";

const AdminCampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showVetModal, setShowVetModal] = useState(false);
  const [vetAction, setVetAction] = useState<
    "approve" | "revision" | "reject" | null
  >(null);
  const [vetNotes, setVetNotes] = useState("");

  const {
    data: campaign,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-campaign", id],
    queryFn: async () => {
      const response = await campaignAPI.getById(id!);
      return response.data as any;
    },
  });

  const vetMutation = useMutation({
    mutationFn: async (data: {
      action: "approve" | "revision" | "reject";
      notes: string;
    }) => {
      if (data.action === "approve") {
        return await campaignAPI.approve(id!);
      } else if (data.action === "revision") {
        return await campaignAPI.requireRevision(id!, data.notes);
      } else {
        return await campaignAPI.reject(id!, data.notes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setShowVetModal(false);
      setVetAction(null);
      setVetNotes("");
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      return await campaignAPI.activate(id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });

  const handleVet = () => {
    if (!vetAction) return;
    vetMutation.mutate({ action: vetAction, notes: vetNotes });
  };

  const getStatusBadge = (status: string) => {
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
        label: "Pending Review",
      },
      revision_required: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: FileEdit,
        label: "Revision Required",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Approved",
      },
      active: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: Target,
        label: "Active - Partner Visible",
      },
      completed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
        label: "Completed",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Rejected",
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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-lg font-medium text-neutral-600">
            Loading campaign...
          </span>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">
            {error ? "Unable to load campaign" : "Campaign not found"}
          </p>
          <button onClick={() => refetch()} className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = campaign.progress_percentage || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/campaigns"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {campaign.title}
            </h1>
            <div className="flex items-center gap-4 text-neutral-600">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {campaign.enterprise_name}
              </div>
              <span>•</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(campaign.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(campaign.status)}
            {campaign.status === "submitted" && (
              <button
                onClick={() => setShowVetModal(true)}
                className="btn-primary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Review Application
              </button>
            )}
            {campaign.status === "approved" && (
              <button
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
                className="btn-primary"
              >
                <Target className="h-4 w-4 mr-2" />
                {activateMutation.isPending
                  ? "Activating..."
                  : "Make Partner Visible"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Funding Goal</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {new Intl.NumberFormat("en-RW", {
                  style: "currency",
                  currency: "RWF",
                  notation: "compact",
                }).format(campaign.target_amount)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Amount Raised</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {new Intl.NumberFormat("en-RW", {
                  style: "currency",
                  currency: "RWF",
                  notation: "compact",
                }).format(campaign.amount_raised)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Interests</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {campaign.interests_count || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Days Left</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {campaign.end_date
                  ? Math.max(
                      0,
                      Math.ceil(
                        (new Date(campaign.end_date).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )
                  : "N/A"}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-effect rounded-xl p-6 border border-neutral-200 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">
            Campaign Progress
          </span>
          <span className="text-sm font-bold text-primary-600">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: Eye },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "updates", label: "Updates", icon: MessageSquare },
              { id: "interests", label: "Interests", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="glass-effect rounded-xl p-6 border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Campaign Description
            </h2>
            <p className="text-neutral-700 whitespace-pre-wrap">
              {campaign.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-effect rounded-xl p-6 border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Campaign Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Campaign Type</p>
                  <p className="font-medium text-neutral-900 capitalize">
                    {campaign.campaign_type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Minimum Investment</p>
                  <p className="font-medium text-neutral-900">
                    {new Intl.NumberFormat("en-RW", {
                      style: "currency",
                      currency: "RWF",
                    }).format(campaign.min_investment)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Deadline</p>
                  <p className="font-medium text-neutral-900">
                    {campaign.end_date
                      ? new Date(campaign.end_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6 border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Enterprise Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Business Name</p>
                  <p className="font-medium text-neutral-900">
                    {campaign.enterprise_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Enterprise ID</p>
                  <p className="font-medium text-neutral-900">
                    #{campaign.enterprise}
                  </p>
                </div>
                <div>
                  <Link
                    to={`/admin/enterprises/${campaign.enterprise}`}
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Enterprise Profile
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            Campaign Documents
          </h2>
          {(campaign as any).documents?.length > 0 ? (
            <div className="space-y-3">
              {(campaign as any).documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <FileText className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {doc.title}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {doc.document_type} •{" "}
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No documents uploaded</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "updates" && (
        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            Campaign Updates
          </h2>
          {(campaign as any).updates?.length > 0 ? (
            <div className="space-y-4">
              {(campaign as any).updates.map((update: any) => (
                <div
                  key={update.id}
                  className="p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900">
                      {update.title}
                      {update.is_milestone && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Milestone
                        </span>
                      )}
                    </h3>
                    <span className="text-sm text-neutral-500">
                      {new Date(update.posted_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-700 whitespace-pre-wrap">
                    {update.content}
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Posted by {update.posted_by_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No updates posted</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "interests" && (
        <div className="glass-effect rounded-xl p-6 border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            Investor Interests
          </h2>
          {(campaign as any).interests?.length > 0 ? (
            <div className="space-y-3">
              {(campaign as any).interests.map((interest: any) => (
                <div
                  key={interest.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      {interest.investor_name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Interested on{" "}
                      {new Date(interest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/admin/investors/${interest.investor}`}
                    className="btn-secondary text-sm"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No interests yet</p>
            </div>
          )}
        </div>
      )}

      {/* Vet Modal */}
      {showVetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Review Funding Application
            </h3>

            {/* Readiness Score Display */}
            {campaign.readiness_score_at_submission && (
              <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="text-sm text-neutral-600">SME Readiness Score</p>
                <p
                  className={`text-2xl font-bold ${
                    campaign.readiness_score_at_submission >= 70
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {Math.round(campaign.readiness_score_at_submission)}%
                </p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setVetAction("approve")}
                    className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg border-2 transition ${
                      vetAction === "approve"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-neutral-200 hover:border-green-300"
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Approve</span>
                  </button>
                  <button
                    onClick={() => setVetAction("revision")}
                    className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg border-2 transition ${
                      vetAction === "revision"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-neutral-200 hover:border-orange-300"
                    }`}
                  >
                    <FileEdit className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Revision</span>
                  </button>
                  <button
                    onClick={() => setVetAction("reject")}
                    className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg border-2 transition ${
                      vetAction === "reject"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-neutral-200 hover:border-red-300"
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {vetAction === "revision"
                    ? "Revision Notes (Required)"
                    : "Notes (Optional)"}
                </label>
                <textarea
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={
                    vetAction === "revision"
                      ? "Describe what changes the SME needs to make..."
                      : "Add notes about your decision..."
                  }
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowVetModal(false);
                  setVetAction(null);
                  setVetNotes("");
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition"
                disabled={vetMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleVet}
                className={`flex-1 ${
                  vetAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : vetAction === "revision"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-red-600 hover:bg-red-700"
                } text-white px-4 py-2 rounded-lg transition disabled:opacity-50`}
                disabled={
                  !vetAction ||
                  vetMutation.isPending ||
                  (vetAction === "revision" && !vetNotes)
                }
              >
                {vetMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin inline" />
                    Processing...
                  </>
                ) : vetAction === "approve" ? (
                  "Approve"
                ) : vetAction === "revision" ? (
                  "Request Revision"
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCampaignDetail;
