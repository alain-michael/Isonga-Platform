import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investorAPI } from "../../services/investor";
import { campaignDocumentsAPI } from "../../services/campaignsService";
import api from "../../services/api";
import {
  Building2,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  ExternalLink,
  MessageSquare,
  DollarSign,
  X,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

const InvestorMatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [userMatch, setUserMatch] = useState<any>(null);

  // Fetch campaign details directly (not from opportunities scoring endpoint)
  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaignDetail", id],
    queryFn: async () => {
      const response = await api.get(`/campaigns/api/campaigns/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  // Build a match-like object from campaign data for compatibility
  const match = campaign
    ? {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        target_amount: parseFloat(campaign.target_amount) || 0,
        amount_raised: parseFloat(campaign.amount_raised) || 0,
        min_investment: parseFloat(campaign.min_investment) || 0,
        max_investment: campaign.max_investment
          ? parseFloat(campaign.max_investment)
          : null,
        campaign_type: campaign.campaign_type,
        enterprise_name: campaign.enterprise_name || "Enterprise",
        enterprise_sector: campaign.enterprise_sector || "",
        enterprise_location: campaign.enterprise_location || "",
        status: campaign.status,
      }
    : null;

  // Documents from the campaign detail (nested) + fallback direct query
  const { data: documentsResponse } = useQuery({
    queryKey: ["campaignDocuments", id],
    queryFn: () => campaignDocumentsAPI.getAll(id!),
    enabled: !!id,
  });

  const documents =
    campaign?.documents?.length > 0
      ? campaign.documents
      : documentsResponse?.data?.results || [];

  // Fetch user's match for this campaign
  const { data: matchResponse } = useQuery({
    queryKey: ["userMatch", id],
    queryFn: () => investorAPI.getUserMatch(id!),
    enabled: !!id,
  });

  // Set user match if exists
  React.useEffect(() => {
    if (matchResponse) {
      setUserMatch(matchResponse);
    }
  }, [matchResponse]);

  // Express interest mutation (creates/approves match)
  const expressInterestMutation = useMutation({
    mutationFn: async () => {
      return await investorAPI.interactWithMatch(id!, "approve");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMatch", id] });
      queryClient.invalidateQueries({ queryKey: ["investorMatches"] });
      queryClient.invalidateQueries({ queryKey: ["investorStats"] });
    },
  });

  // Withdraw interest mutation
  const withdrawInterestMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return await investorAPI.withdrawMatch(matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMatch", id] });
      queryClient.invalidateQueries({ queryKey: ["investorMatches"] });
      queryClient.invalidateQueries({ queryKey: ["investorStats"] });
    },
  });

  // Pledge mutation
  const pledgeMutation = useMutation({
    mutationFn: async (data: { matchId: string; amount: number }) => {
      return await investorAPI.commitToMatch(data.matchId, data.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMatch", id] });
      queryClient.invalidateQueries({ queryKey: ["investorMatches"] });
      setShowPledgeModal(false);
      setPledgeAmount("");
    },
  });

  // Reject/Pass mutation
  const rejectMutation = useMutation({
    mutationFn: () => investorAPI.interactWithMatch(id!, "reject"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investorMatches"] });
      queryClient.invalidateQueries({ queryKey: ["investorStats"] });
      navigate("/investor/matches");
    },
  });

  // Fetch partner application (SME's application to this investor for this campaign)
  const { data: partnerApplicationDetailData } = useQuery({
    queryKey: ["myPartnerApplicationDetail", id],
    queryFn: async () => {
      // First check if the campaign detail already has partner_applications
      if (campaign?.partner_applications?.length > 0) {
        const app = campaign.partner_applications[0];
        const detail = await api.get(
          `/campaigns/api/partner-applications/${app.id}/`,
        );
        return detail.data;
      }
      // Fallback: fetch all my applications and find the one for this campaign
      const res = await api.get("/campaigns/api/partner-applications/");
      const apps: any[] = res.data.results || res.data || [];
      const app = apps.find((a: any) => String(a.campaign) === String(id));
      if (!app) return null;
      const detail = await api.get(
        `/campaigns/api/partner-applications/${app.id}/`,
      );
      return detail.data;
    },
    enabled: !!id && !!campaign,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Match not found
          </h2>
          <button
            onClick={() => navigate("/investor/matches")}
            className="mt-4 btn-secondary"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="glass-effect rounded-2xl p-8 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-bold rounded-full">
                    {match.campaign_type}
                  </span>
                  {/* <span className="px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 text-sm font-bold rounded-full">
                    {match.match_score}% Match
                  </span> */}
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {match.title}
                </h1>
                <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="font-medium mr-4">
                    {match.enterprise_name}
                  </span>
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{match.enterprise_location}</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {match.enterprise_name.charAt(0)}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  Target Amount
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  ${match.target_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  Min Investment
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  ${match.min_investment.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  Raised So Far
                </p>
                <p className="text-xl font-bold text-success-600 dark:text-success-400">
                  ${match.amount_raised.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-effect rounded-2xl p-8 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              About the Opportunity
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {match.description}
            </p>
          </div>

          {/* Documents */}
          <div className="glass-effect rounded-2xl p-8 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Documents
            </h2>
            {documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-primary-500 mr-3" />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {doc.title}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {doc.document_type.replace("_", " ").toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.file_url || doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">
                No public documents available yet.
              </p>
            )}
          </div>

          {/* Partner Application (form responses + required docs submitted by SME) */}
          {partnerApplicationDetailData && (
            <div className="glass-effect rounded-2xl p-8 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Application Submission
                </h2>
                <span
                  className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold ${
                    partnerApplicationDetailData.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : partnerApplicationDetailData.status === "declined"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : partnerApplicationDetailData.status === "under_review"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                >
                  {partnerApplicationDetailData.status?.replace(/_/g, " ")}
                </span>
              </div>

              {/* Structured form responses */}
              {partnerApplicationDetailData.structured_responses &&
              partnerApplicationDetailData.structured_responses.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-3">
                    Form Responses
                  </h3>
                  <div className="space-y-4">
                    {partnerApplicationDetailData.structured_responses.map(
                      (section: any, si: number) => (
                        <div key={si}>
                          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2 pb-1 border-b border-neutral-200 dark:border-neutral-700">
                            {section.section_title}
                          </p>
                          <div className="space-y-2">
                            {section.fields.map((field: any) => (
                              <div
                                key={field.field_id}
                                className="flex flex-col"
                              >
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {field.label}
                                </span>
                                {field.field_type === "file" ? (
                                  field.value ? (
                                    <a
                                      href={field.value}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                                    >
                                      <Download className="h-3 w-3" /> View file
                                    </a>
                                  ) : (
                                    <span className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                                      Not provided
                                    </span>
                                  )
                                ) : Array.isArray(field.value) ? (
                                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                                    {field.value.join(", ") || "—"}
                                  </span>
                                ) : (
                                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                                    {field.value ?? "—"}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                partnerApplicationDetailData.form_responses &&
                Object.keys(partnerApplicationDetailData.form_responses)
                  .length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-3">
                      Form Responses
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(
                        partnerApplicationDetailData.form_responses,
                      ).map(([k, v]: [string, any]) => (
                        <div key={k}>
                          <span className="text-xs text-neutral-500">{k}</span>
                          <p className="text-sm text-neutral-900 dark:text-neutral-100">
                            {typeof v === "object"
                              ? JSON.stringify(v)
                              : String(v)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Auto-screen result */}
              {partnerApplicationDetailData.auto_screened && (
                <div
                  className={`flex items-start gap-3 p-3 rounded-xl mb-4 ${
                    partnerApplicationDetailData.auto_screen_passed
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {partnerApplicationDetailData.auto_screen_passed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        partnerApplicationDetailData.auto_screen_passed
                          ? "text-green-800 dark:text-green-300"
                          : "text-red-800 dark:text-red-300"
                      }`}
                    >
                      Auto-Screening:{" "}
                      {partnerApplicationDetailData.auto_screen_passed
                        ? "Passed"
                        : "Failed"}
                    </p>
                    {partnerApplicationDetailData.auto_screen_reason && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                        {partnerApplicationDetailData.auto_screen_reason}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded documents */}
              {partnerApplicationDetailData.uploaded_documents &&
                partnerApplicationDetailData.uploaded_documents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-3">
                      Submitted Documents
                    </h3>
                    <div className="space-y-2">
                      {partnerApplicationDetailData.uploaded_documents.map(
                        (doc: any) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-indigo-500" />
                              <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {doc.document_name}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  {new Date(
                                    doc.uploaded_at,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition"
                              >
                                <Download className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                              </a>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl p-6 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 sticky top-24">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {userMatch ? "Your Status" : "Interested?"}
            </h3>

            {!userMatch && (
              <>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Expressing interest will notify the enterprise and allow them
                  to share more sensitive details with you.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => expressInterestMutation.mutate()}
                    disabled={expressInterestMutation.isPending}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {expressInterestMutation.isPending
                      ? "Processing..."
                      : "Express Interest"}
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate()}
                    disabled={rejectMutation.isPending}
                    className="w-full btn-secondary flex items-center justify-center gap-2 py-3 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                </div>
              </>
            )}

            {userMatch &&
              userMatch.status === "approved" &&
              !userMatch.committed_amount && (
                <>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    You've expressed interest. You can now pledge an amount or
                    withdraw.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPledgeModal(true)}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                    >
                      <DollarSign className="h-5 w-5" />
                      Pledge Amount
                    </button>
                    <button
                      onClick={() =>
                        withdrawInterestMutation.mutate(userMatch.id)
                      }
                      disabled={withdrawInterestMutation.isPending}
                      className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
                    >
                      <XCircle className="h-5 w-5" />
                      {withdrawInterestMutation.isPending
                        ? "Withdrawing..."
                        : "Withdraw Interest"}
                    </button>
                  </div>
                </>
              )}

            {userMatch && userMatch.committed_amount && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">
                      Pledge Committed
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ${userMatch.committed_amount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {userMatch && (
              <button
                onClick={() => {
                  const enterpriseUserId = userMatch.enterprise?.user_id;
                  console.log("Message button clicked", {
                    userMatch,
                    enterpriseUserId,
                    id,
                    match,
                  });

                  navigate("/messages", {
                    state: {
                      campaignId: id,
                      campaignTitle: match.title,
                      otherPartyId: enterpriseUserId || 0,
                      otherPartyType: "enterprise",
                    },
                  });
                }}
                className="w-full mt-3 btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <MessageSquare className="h-5 w-5" />
                Message Enterprise
              </button>
            )}

            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Enterprise Details
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sector</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {match.enterprise_sector}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Location</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {match.enterprise_location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Website</span>
                  <a
                    href="#"
                    className="text-primary-600 hover:underline flex items-center"
                  >
                    Visit <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pledge Amount Modal */}
      {showPledgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Pledge Amount
              </h3>
              <button
                onClick={() => setShowPledgeModal(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userMatch && pledgeAmount) {
                  pledgeMutation.mutate({
                    matchId: userMatch.id,
                    amount: parseFloat(pledgeAmount),
                  });
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Amount to Pledge (RWF)
                  </label>
                  <input
                    type="number"
                    min={match.min_investment}
                    step="1000"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                    placeholder={`Min: $${match.min_investment.toLocaleString()}`}
                    className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:outline-none focus:border-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
                    required
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Minimum investment: ${match.min_investment.toLocaleString()}
                  </p>
                </div>

                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                  <p className="text-sm text-primary-800 dark:text-primary-300">
                    <strong>Note:</strong> This is a commitment to invest. The
                    enterprise will be notified of your pledge amount.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPledgeModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700"
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

export default InvestorMatchDetail;
