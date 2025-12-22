import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enterpriseAPI } from "../../services/api";
import {
  campaignAPI,
  campaignDocumentsAPI,
  campaignUpdatesAPI,
  campaignInterestsAPI,
} from "../../services/campaignsService";
import { useAuth } from "../../contexts/AuthContext";
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
  Upload,
  X,
  Plus,
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
  const { user } = useAuth();
  const isInvestor = user?.user_type === "investor";
  const [activeTab, setActiveTab] = useState<
    "overview" | "investors" | "documents" | "updates"
  >("overview");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFormData, setDocFormData] = useState({
    title: "",
    document_type: "other",
    description: "",
    is_public: false,
    file: null as File | null,
  });
  const [updateFormData, setUpdateFormData] = useState({
    title: "",
    content: "",
    is_milestone: false,
  });
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [userInterest, setUserInterest] = useState<any>(null);

  const { data: campaign, isLoading, error } = useCampaign(id);
  const submitForReviewMutation = useSubmitCampaignForReview();

  // Fetch user's interest in this campaign (for investors)
  const { data: interestsResponse } = useQuery({
    queryKey: ["userCampaignInterest", id],
    queryFn: () => campaignInterestsAPI.getAll(id!),
    enabled: isInvestor && !!id,
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      return await campaignAPI.activate(id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });

  const expressInterestMutation = useMutation({
    mutationFn: async () => {
      return await campaignInterestsAPI.create({
        campaign: id!,
        status: "interested",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCampaignInterest", id] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });

  const withdrawInterestMutation = useMutation({
    mutationFn: async (interestId: string) => {
      return await campaignInterestsAPI.withdraw(interestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCampaignInterest", id] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });

  const pledgeMutation = useMutation({
    mutationFn: async (data: { interestId: string; amount: number }) => {
      return await campaignInterestsAPI.commit(data.interestId, data.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCampaignInterest", id] });
      setShowPledgeModal(false);
      setPledgeAmount("");
    },
  });

  // Fetch matches for this enterprise
  const { data: matchesResponse, isLoading: matchesLoading } = useQuery({
    queryKey: ["enterpriseMatches"],
    queryFn: enterpriseAPI.getMatches,
    enabled: activeTab === "investors",
  });

  // Fetch documents for this campaign
  const { data: documentsResponse, isLoading: documentsLoading } = useQuery({
    queryKey: ["campaignDocuments", id],
    queryFn: () => campaignDocumentsAPI.getAll(id!),
    enabled: activeTab === "documents" && !!id,
  });

  const documents = documentsResponse?.data?.results || [];

  // Fetch updates for this campaign
  const { data: updatesResponse, isLoading: updatesLoading } = useQuery({
    queryKey: ["campaignUpdates", id],
    queryFn: () => campaignUpdatesAPI.getAll(id!),
    enabled: activeTab === "updates" && !!id,
  });

  const updates = updatesResponse?.data || [];

  // Set user interest if exists
  React.useEffect(() => {
    if (interestsResponse?.data) {
      const interests = Array.isArray(interestsResponse.data)
        ? interestsResponse.data
        : (interestsResponse.data as any).results || [];
      const myInterest = interests.find((i: any) => i.campaign === id);
      setUserInterest(myInterest || null);
    }
  }, [interestsResponse, id]);

  // Get matches array from response
  const matches = matchesResponse?.data?.results || matchesResponse?.data || [];

  // Filter matches for this campaign if possible, or just show all enterprise matches
  // Assuming matches are linked to enterprise, we show all interested investors
  const interestedInvestors = Array.isArray(matches)
    ? matches.filter(
        (m: any) =>
          m.status === "approved" ||
          m.status === "engaged" ||
          m.status === "completed"
      )
    : [];

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

  const confirmPaymentMutation = useMutation({
    mutationFn: (matchId: string) => enterpriseAPI.confirmPayment(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterpriseMatches"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      alert("Payment confirmed! The amount has been added to your campaign.");
    },
  });

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (formData: FormData) => campaignDocumentsAPI.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaignDocuments", id] });
      setShowDocumentModal(false);
      setUploadingDoc(false);
      setDocFormData({
        title: "",
        document_type: "other",
        description: "",
        is_public: false,
        file: null,
      });
    },
    onError: () => {
      setUploadingDoc(false);
      alert("Failed to upload document. Please try again.");
    },
  });

  // Create update mutation
  const createUpdateMutation = useMutation({
    mutationFn: (data: any) => campaignUpdatesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaignUpdates", id] });
      setShowUpdateModal(false);
      setUpdateFormData({ title: "", content: "", is_milestone: false });
    },
    onError: () => {
      alert("Failed to post update. Please try again.");
    },
  });

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFormData.file || !id) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append("file", docFormData.file);
    formData.append("title", docFormData.title);
    formData.append("document_type", docFormData.document_type);
    formData.append("description", docFormData.description);
    formData.append("is_public", docFormData.is_public.toString());
    formData.append("campaign", id);

    uploadDocumentMutation.mutate(formData);
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    createUpdateMutation.mutate({
      ...updateFormData,
      campaign: id,
    });
  };

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
    ...(!isInvestor
      ? [{ id: "investors", label: "Investors", icon: Users }]
      : []),
    { id: "documents", label: "Documents", icon: FileText },
    { id: "updates", label: "Updates", icon: MessageSquare },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() =>
            navigate(isInvestor ? "/investor/matches" : "/campaigns")
          }
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {isInvestor ? "Matches" : "Campaigns"}
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
            {!isInvestor && campaign.status === "draft" && (
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
            {!isInvestor &&
              campaign.status === "vetted" &&
              campaign.is_vetted && (
                <button
                  onClick={() => activateMutation.mutate()}
                  disabled={activateMutation.isPending}
                  className="btn-primary"
                >
                  {activateMutation.isPending
                    ? "Activating..."
                    : "Activate Campaign"}
                </button>
              )}
            {isInvestor && campaign.status === "active" && !userInterest && (
              <>
                <button
                  onClick={() => expressInterestMutation.mutate()}
                  disabled={expressInterestMutation.isPending}
                  className="btn-primary"
                >
                  {expressInterestMutation.isPending
                    ? "Submitting..."
                    : "Express Interest"}
                </button>
                <button
                  onClick={() => navigate("/investor/matches")}
                  className="btn-secondary"
                >
                  Pass
                </button>
              </>
            )}
            {isInvestor &&
              userInterest &&
              userInterest.status === "interested" && (
                <>
                  <button
                    onClick={() => setShowPledgeModal(true)}
                    className="btn-primary"
                  >
                    Pledge Amount
                  </button>
                  <button
                    onClick={() =>
                      withdrawInterestMutation.mutate(userInterest.id)
                    }
                    disabled={withdrawInterestMutation.isPending}
                    className="btn-secondary"
                  >
                    {withdrawInterestMutation.isPending
                      ? "Withdrawing..."
                      : "Withdraw Interest"}
                  </button>
                </>
              )}
            {isInvestor &&
              userInterest &&
              userInterest.status === "committed" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Pledged {formatCurrency(userInterest.committed_amount || 0)}
                  </span>
                </div>
              )}
            {isInvestor && userInterest && (
              <button
                onClick={() =>
                  navigate("/messages", {
                    state: {
                      campaignId: id,
                      campaignTitle: campaign.title,
                      otherPartyId: campaign.enterprise_user_id,
                      otherPartyType: "enterprise",
                    },
                  })
                }
                className="btn-secondary flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </button>
            )}
            {!isInvestor && campaign.status === "draft" && (
              <Link
                to={`/campaigns/${id}/edit`}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: campaign.title,
                      text: campaign.description,
                      url: window.location.href,
                    })
                    .catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="p-2 hover:bg-neutral-100 rounded-lg"
              title="Share campaign"
            >
              <Share2 className="h-5 w-5 text-neutral-600" />
            </button>
            {!isInvestor && (
              <button className="p-2 hover:bg-neutral-100 rounded-lg">
                <MoreVertical className="h-5 w-5 text-neutral-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-effect rounded-xl p-5 border border-neutral-200 shadow-sm">
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

        <div className="glass-effect rounded-xl p-5 border border-neutral-200 shadow-sm">
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

        <div className="glass-effect rounded-xl p-5 border border-neutral-200 shadow-sm">
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

        <div className="glass-effect rounded-xl p-5 border border-neutral-200 shadow-sm">
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
      <div className="glass-effect rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
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
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 glass-effect border border-neutral-200 rounded-xl hover:border-primary-200 transition-colors"
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
                          {match.committed_amount && (
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              Pledged: $
                              {parseFloat(
                                match.committed_amount
                              ).toLocaleString()}
                            </p>
                          )}
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                match.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : match.status === "engaged"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {match.status === "completed"
                                ? "Payment Confirmed"
                                : match.status === "engaged"
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
                          <>
                            <button
                              onClick={() =>
                                navigate("/messages", {
                                  state: {
                                    campaignId: id,
                                    campaignTitle: campaign.title,
                                    otherPartyId: match.investor?.user_id,
                                    otherPartyType: "investor",
                                  },
                                })
                              }
                              className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Message
                            </button>
                            {match.committed_amount &&
                              !match.payment_received && (
                                <button
                                  onClick={() =>
                                    confirmPaymentMutation.mutate(match.id)
                                  }
                                  disabled={confirmPaymentMutation.isPending}
                                  className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2"
                                >
                                  <DollarSign className="h-4 w-4" />
                                  Confirm Payment
                                </button>
                              )}
                          </>
                        )}
                        {match.status === "completed" && (
                          <button
                            onClick={() =>
                              navigate("/messages", {
                                state: {
                                  campaignId: id,
                                  campaignTitle: campaign.title,
                                  otherPartyId: match.investor?.user_id,
                                  otherPartyType: "investor",
                                },
                              })
                            }
                            className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2"
                          >
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
              {documentsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 glass-effect border border-neutral-200 rounded-xl hover:border-neutral-300 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <FileText className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            {doc.title}
                          </h4>
                          <p className="text-sm text-neutral-500">
                            {doc.document_type} • Uploaded{" "}
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                          {doc.description && (
                            <p className="text-sm text-neutral-600 mt-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.is_public && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Public
                          </span>
                        )}
                        <a
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-neutral-100 rounded-lg transition"
                        >
                          <Eye className="h-4 w-4 text-neutral-600" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {!isInvestor && (
                    <button
                      onClick={() => setShowDocumentModal(true)}
                      className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-600 hover:border-primary-400 hover:text-primary-600 transition flex items-center justify-center gap-2"
                    >
                      <Upload className="h-5 w-5" />
                      Upload Another Document
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                    No Documents Yet
                  </h3>
                  <p className="text-neutral-500 mb-6">
                    {isInvestor
                      ? "No documents have been uploaded for this campaign yet."
                      : "Upload supporting documents for your campaign."}
                  </p>
                  {!isInvestor && (
                    <button
                      onClick={() => setShowDocumentModal(true)}
                      className="btn-primary"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "updates" && (
            <div>
              {updatesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update: any) => (
                    <div
                      key={update.id}
                      className={`p-6 rounded-xl border-2 ${
                        update.is_milestone
                          ? "border-primary-200 bg-primary-50"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      {update.is_milestone && (
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-primary-600" />
                          <span className="text-sm font-medium text-primary-700">
                            Milestone Update
                          </span>
                        </div>
                      )}
                      <h4 className="text-lg font-bold text-neutral-900 mb-2">
                        {update.title}
                      </h4>
                      <p className="text-neutral-700 whitespace-pre-wrap mb-3">
                        {update.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-neutral-500">
                        <span>
                          Posted by {update.posted_by_name || "Campaign Owner"}
                        </span>
                        <span>
                          {new Date(update.posted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                    No Updates Yet
                  </h3>
                  <p className="text-neutral-500">
                    {isInvestor
                      ? "No updates have been posted for this campaign yet."
                      : "Keep investors informed with regular updates about your campaign progress."}
                  </p>
                </div>
              )}
              {!isInvestor && (
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="btn-primary mb-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Update
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">
                Upload Document
              </h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDocumentUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={docFormData.title}
                  onChange={(e) =>
                    setDocFormData({ ...docFormData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={docFormData.document_type}
                  onChange={(e) =>
                    setDocFormData({
                      ...docFormData,
                      document_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 outline-none"
                  required
                >
                  <option value="pitch_deck">Pitch Deck</option>
                  <option value="business_plan">Business Plan</option>
                  <option value="financial_projection">
                    Financial Projection
                  </option>
                  <option value="term_sheet">Term Sheet</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  value={docFormData.description}
                  onChange={(e) =>
                    setDocFormData({
                      ...docFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  File *
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setDocFormData({
                      ...docFormData,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={docFormData.is_public}
                  onChange={(e) =>
                    setDocFormData({
                      ...docFormData,
                      is_public: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="is_public" className="text-sm text-neutral-700">
                  Make this document visible to all investors
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-xl font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {uploadingDoc ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">
                Post Campaign Update
              </h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Update Title *
                </label>
                <input
                  type="text"
                  value={updateFormData.title}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 outline-none"
                  placeholder="e.g., We've reached 50% of our goal!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={updateFormData.content}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      content: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 outline-none resize-none"
                  placeholder="Share progress, milestones, or important news with your investors..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_milestone"
                  checked={updateFormData.is_milestone}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      is_milestone: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label
                  htmlFor="is_milestone"
                  className="text-sm text-neutral-700"
                >
                  Mark as milestone update
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-xl font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUpdateMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {createUpdateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Post Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pledge Amount Modal */}
      {showPledgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Pledge Amount</h3>
              <button
                onClick={() => setShowPledgeModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userInterest && pledgeAmount) {
                  pledgeMutation.mutate({
                    interestId: userInterest.id,
                    amount: parseFloat(pledgeAmount),
                  });
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Amount to Pledge (RWF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <p className="text-sm text-primary-800">
                    <strong>Note:</strong> This is a commitment to invest. The
                    enterprise will be notified of your pledge amount.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPledgeModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-xl font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pledgeMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {pledgeMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      Commit Pledge
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;
