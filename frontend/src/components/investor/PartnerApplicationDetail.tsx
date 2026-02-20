import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Star,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../../services/api";

type DecisionModalType = "approve" | "conditional" | "decline" | null;

const PartnerApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "overview" | "application" | "documents" | "profile" | "assessment"
  >("overview");
  const [decisionModal, setDecisionModal] = useState<DecisionModalType>(null);

  // Decision form states
  const [approveNotes, setApproveNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approveTerms, setApproveTerms] = useState("");

  const [conditionalNotes, setConditionalNotes] = useState("");
  const [conditionalAmount, setConditionalAmount] = useState("");
  const [conditionalTerms, setConditionalTerms] = useState("");
  const [conditions, setConditions] = useState<string[]>([""]);

  const [declineReason, setDeclineReason] = useState("");
  const [declineNotes, setDeclineNotes] = useState("");

  // Fetch campaign and partner-specific application data
  const { data, isLoading } = useQuery({
    queryKey: ["partnerApplication", id],
    queryFn: async () => {
      const response = await api.get(
        `/api/campaigns/${id}/partner-application/`,
      );
      return response.data;
    },
    enabled: !!id,
  });

  const campaign = data?.campaign || data;
  const application = data?.application;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (data: {
      notes?: string;
      proposed_amount?: number;
      proposed_terms?: any;
    }) => {
      if (!application?.id) throw new Error("No application ID");
      const response = await api.post(
        `/api/partner-applications/${application.id}/approve/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerApplication", id] });
      queryClient.invalidateQueries({ queryKey: ["targetedCampaigns"] });
      setDecisionModal(null);
      alert("Application approved successfully!");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.error || "Failed to approve application");
    },
  });

  // Conditional approve mutation
  const conditionalApproveMutation = useMutation({
    mutationFn: async (data: {
      notes?: string;
      approval_conditions: string[];
      proposed_amount?: number;
      proposed_terms?: any;
    }) => {
      if (!application?.id) throw new Error("No application ID");
      const response = await api.post(
        `/api/partner-applications/${application.id}/conditional_approve/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerApplication", id] });
      queryClient.invalidateQueries({ queryKey: ["targetedCampaigns"] });
      setDecisionModal(null);
      alert("Application conditionally approved!");
    },
    onError: (error: any) => {
      alert(
        error?.response?.data?.error ||
          "Failed to conditionally approve application",
      );
    },
  });

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: async (data: { reason: string }) => {
      if (!application?.id) throw new Error("No application ID");
      const response = await api.post(
        `/api/partner-applications/${application.id}/decline/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerApplication", id] });
      queryClient.invalidateQueries({ queryKey: ["targetedCampaigns"] });
      setDecisionModal(null);
      alert("Application declined");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.error || "Failed to decline application");
    },
  });

  const handleApprove = () => {
    const data: any = {};
    if (approveNotes) data.notes = approveNotes;
    if (approvedAmount) data.proposed_amount = parseFloat(approvedAmount);
    if (approveTerms) data.proposed_terms = { terms: approveTerms };

    approveMutation.mutate(data);
  };

  const handleConditionalApprove = () => {
    const filteredConditions = conditions.filter((c) => c.trim() !== "");
    if (filteredConditions.length === 0) {
      alert("Please add at least one condition");
      return;
    }

    const data: any = {
      approval_conditions: filteredConditions,
    };
    if (conditionalNotes) data.notes = conditionalNotes;
    if (conditionalAmount) data.proposed_amount = parseFloat(conditionalAmount);
    if (conditionalTerms) data.proposed_terms = { terms: conditionalTerms };

    conditionalApproveMutation.mutate(data);
  };

  const handleDecline = () => {
    if (!declineReason) {
      alert("Please select a decline reason");
      return;
    }

    const fullReason = declineNotes
      ? `${declineReason}: ${declineNotes}`
      : declineReason;
    declineMutation.mutate({ reason: fullReason });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-neutral-100 text-neutral-700",
      submitted: "bg-yellow-100 text-yellow-700",
      under_review: "bg-blue-100 text-blue-700 ",
      approved: "bg-green-100 text-green-700",
      conditional: "bg-orange-100 text-orange-700",
      declined: "bg-red-100 text-red-700",
      withdrawn: "bg-neutral-100 text-neutral-500",
    };
    return colors[status] || "bg-neutral-100 text-neutral-700";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Application Not Found
          </h2>
          <p className="text-neutral-600 mb-4">
            The application you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/investor/applications")}
            className="btn-primary"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/investor/applications")}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {campaign.title}
            </h1>
            <p className="text-neutral-600">{campaign.description}</p>
          </div>
          {application && (
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}
            >
              {application.status?.replace("_", " ").toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Three-Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel: SME Snapshot */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Enterprise Card */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                {campaign.enterprise_name?.charAt(0) || "E"}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">
                  {campaign.enterprise_name}
                </h3>
                <p className="text-sm text-neutral-500">
                  {campaign.enterprise_sector}
                </p>
              </div>
            </div>

            {campaign.enterprise_location && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                <MapPin className="h-4 w-4" />
                {campaign.enterprise_location}
              </div>
            )}
          </div>

          {/* Readiness Score */}
          {campaign.readiness_score_at_submission && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-neutral-900">
                  Readiness Score
                </h4>
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-primary-600">
                  {campaign.readiness_score_at_submission}%
                </span>
              </div>
              <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-green-500 transition-all"
                  style={{
                    width: `${campaign.readiness_score_at_submission}%`,
                  }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Based on assessment at submission
              </p>
            </div>
          )}

          {/* Financial Snapshot */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-4">
            <h4 className="font-semibold text-neutral-900 mb-3">
              Financial Overview
            </h4>

            <div>
              <p className="text-xs text-neutral-500 mb-1">Target Amount</p>
              <p className="text-lg font-bold text-primary-600">
                {formatCurrency(campaign.target_amount)}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500 mb-1">Min Investment</p>
              <p className="text-md font-semibold text-neutral-900">
                {formatCurrency(campaign.min_investment)}
              </p>
            </div>

            {campaign.max_investment && (
              <div>
                <p className="text-xs text-neutral-500 mb-1">Max Investment</p>
                <p className="text-md font-semibold text-neutral-900">
                  {formatCurrency(campaign.max_investment)}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">Campaign Type</p>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                {campaign.campaign_type}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-neutral-500">Start Date</p>
                <p className="font-medium text-neutral-900">
                  {formatDate(campaign.start_date)}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">End Date</p>
                <p className="font-medium text-neutral-900">
                  {formatDate(campaign.end_date)}
                </p>
              </div>
              {campaign.created_at && (
                <div>
                  <p className="text-neutral-500">Submitted</p>
                  <p className="font-medium text-neutral-900">
                    {formatDate(campaign.created_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel: Application Details */}
        <div className="col-span-12 lg:col-span-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-6">
            <div className="flex border-b border-neutral-200">
              {[
                { id: "overview", label: "Overview", icon: FileText },
                {
                  id: "application",
                  label: "Application Form",
                  icon: CheckCircle,
                },
                { id: "documents", label: "Documents", icon: Download },
                { id: "profile", label: "Enterprise Profile", icon: Building2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
                    activeTab === tab.id
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                      Campaign Overview
                    </h3>
                    <p className="text-neutral-700 whitespace-pre-wrap">
                      {campaign.description}
                    </p>
                  </div>

                  {campaign.use_of_funds && (
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">
                        Use of Funds
                      </h4>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-neutral-700">
                          {campaign.use_of_funds.description ||
                            campaign.use_of_funds}
                        </p>
                      </div>
                    </div>
                  )}

                  {application && (
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-3">
                        Application Status
                      </h4>
                      <div className="space-y-3">
                        {application.submitted_at && (
                          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                            <span className="text-sm text-neutral-600">
                              Submitted
                            </span>
                            <span className="text-sm font-medium">
                              {formatDate(application.submitted_at)}
                            </span>
                          </div>
                        )}

                        {application.auto_screened && (
                          <div
                            className={`p-3 rounded-lg ${application.auto_screen_passed ? "bg-green-50" : "bg-red-50"}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {application.auto_screen_passed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span
                                className={`text-sm font-medium ${application.auto_screen_passed ? "text-green-800" : "text-red-800"}`}
                              >
                                Auto-Screening:{" "}
                                {application.auto_screen_passed
                                  ? "Passed"
                                  : "Failed"}
                              </span>
                            </div>
                            {application.auto_screen_reason && (
                              <p className="text-xs text-neutral-600 ml-6">
                                {application.auto_screen_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Application Form Tab */}
              {activeTab === "application" && (
                <div className="space-y-4">
                  {application && application.form_responses ? (
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Form Responses
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(application.form_responses).map(
                          ([key, value]: [string, any]) => (
                            <div
                              key={key}
                              className="border-b border-neutral-200 pb-3"
                            >
                              <p className="text-sm font-medium text-neutral-700 mb-1">
                                {key}
                              </p>
                              <p className="text-neutral-900">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : value}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                      <h4 className="font-medium text-neutral-900 mb-1">
                        No Form Responses
                      </h4>
                      <p className="text-sm text-neutral-600">
                        The enterprise hasn't submitted form responses yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === "documents" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Supporting Documents
                  </h3>
                  {campaign.documents && campaign.documents.length > 0 ? (
                    <div className="space-y-2">
                      {campaign.documents.map((doc: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-neutral-400" />
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {doc.document_type ||
                                  doc.name ||
                                  `Document ${index + 1}`}
                              </p>
                              {doc.uploaded_at && (
                                <p className="text-xs text-neutral-500">
                                  Uploaded {formatDate(doc.uploaded_at)}
                                </p>
                              )}
                            </div>
                          </div>
                          <button className="p-2 hover:bg-neutral-200 rounded-lg transition">
                            <Download className="h-4 w-4 text-neutral-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                      <h4 className="font-medium text-neutral-900 mb-1">
                        No Documents
                      </h4>
                      <p className="text-sm text-neutral-600">
                        No documents have been uploaded yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enterprise Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Enterprise Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Name</p>
                      <p className="font-medium text-neutral-900">
                        {campaign.enterprise_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Sector</p>
                      <p className="font-medium text-neutral-900">
                        {campaign.enterprise_sector}
                      </p>
                    </div>
                    {campaign.enterprise_location && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-1">
                          Location
                        </p>
                        <p className="font-medium text-neutral-900">
                          {campaign.enterprise_location}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">
                      Full enterprise profile details would be displayed here
                      including business registration, team information, and
                      more.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Partner Actions */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">
              Partner Actions
            </h3>

            {application?.status === "submitted" ||
            application?.status === "under_review" ? (
              <div className="space-y-3">
                <button
                  onClick={() => setDecisionModal("approve")}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Application
                </button>

                <button
                  onClick={() => setDecisionModal("conditional")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                >
                  <AlertCircle className="h-4 w-4" />
                  Conditional Approval
                </button>

                <button
                  onClick={() => setDecisionModal("decline")}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                {application ? (
                  <div
                    className={`p-3 rounded-lg ${application.status === "approved" ? "bg-green-50" : application.status === "declined" ? "bg-red-50" : "bg-orange-50"}`}
                  >
                    <p className="text-sm font-medium">
                      {application.status === "approved" &&
                        "Application Approved"}
                      {application.status === "declined" &&
                        "Application Declined"}
                      {application.status === "conditional" &&
                        "Conditionally Approved"}
                      {application.status === "withdrawn" &&
                        "Application Withdrawn"}
                      {application.status === "draft" &&
                        "Application Not Yet Submitted"}
                    </p>
                    {application.reviewed_at && (
                      <p className="text-xs text-neutral-600 mt-1">
                        {formatDate(application.reviewed_at)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No application submitted yet
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h4 className="font-semibold text-neutral-900 mb-3">
              Internal Notes
            </h4>
            <textarea
              placeholder="Add internal notes visible only to your team..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={4}
            />
            <button className="mt-2 w-full btn-secondary">Save Notes</button>
          </div>
        </div>
      </div>

      {/* Decision Modals */}
      {/* Approve Modal */}
      {decisionModal === "approve" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Approve Application
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Proposed Funding Amount (Optional)
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Terms (Optional)
                </label>
                <textarea
                  value={approveTerms}
                  onChange={(e) => setApproveTerms(e.target.value)}
                  placeholder="Investment terms, conditions, timeline..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Internal notes about this approval..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDecisionModal(null)}
                className="flex-1 btn-secondary"
                disabled={approveMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 btn-primary"
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending
                  ? "Approving..."
                  : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Approval Modal */}
      {decisionModal === "conditional" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Conditional Approval
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Conditions to be Met <span className="text-red-500">*</span>
                </label>
                {conditions.map((condition, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => {
                        const newConditions = [...conditions];
                        newConditions[index] = e.target.value;
                        setConditions(newConditions);
                      }}
                      placeholder={`Condition ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {conditions.length > 1 && (
                      <button
                        onClick={() =>
                          setConditions(
                            conditions.filter((_, i) => i !== index),
                          )
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setConditions([...conditions, ""])}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Condition
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Proposed Funding Amount (Optional)
                </label>
                <input
                  type="number"
                  value={conditionalAmount}
                  onChange={(e) => setConditionalAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Terms (Optional)
                </label>
                <textarea
                  value={conditionalTerms}
                  onChange={(e) => setConditionalTerms(e.target.value)}
                  placeholder="Investment terms..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Notes to SME (Optional)
                </label>
                <textarea
                  value={conditionalNotes}
                  onChange={(e) => setConditionalNotes(e.target.value)}
                  placeholder="Additional notes or instructions..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDecisionModal(null)}
                className="flex-1 btn-secondary"
                disabled={conditionalApproveMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleConditionalApprove}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition"
                disabled={conditionalApproveMutation.isPending}
              >
                {conditionalApproveMutation.isPending
                  ? "Submitting..."
                  : "Approve with Conditions"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {decisionModal === "decline" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Decline Application
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Decline Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="Insufficient documentation">
                    Insufficient documentation
                  </option>
                  <option value="Does not meet criteria">
                    Does not meet criteria
                  </option>
                  <option value="Readiness score too low">
                    Readiness score too low
                  </option>
                  <option value="Sector mismatch">Sector mismatch</option>
                  <option value="Funding amount outside range">
                    Funding amount outside range
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Detailed Explanation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={declineNotes}
                  onChange={(e) => setDeclineNotes(e.target.value)}
                  placeholder="Provide specific feedback to help the SME improve..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Note:</strong> This action cannot be undone. The SME
                  will be notified of your decision and the reasons provided.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDecisionModal(null)}
                className="flex-1 btn-secondary"
                disabled={declineMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                disabled={declineMutation.isPending}
              >
                {declineMutation.isPending ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerApplicationDetail;
