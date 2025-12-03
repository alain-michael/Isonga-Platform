import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investorAPI } from "../../services/investor";
import {
  Building2,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  ExternalLink,
} from "lucide-react";

const InvestorMatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch match details (using getMatches for now and filtering, ideally should have getMatchById)
  // Since we don't have a direct getMatchById endpoint yet that returns the full campaign details + match info easily without creating a match record first,
  // we might need to rely on the list or fetch campaign details.
  // However, the requirement implies we are viewing a "Match" or a "Campaign" that is a match.
  // Let's assume we are viewing a Campaign that is a potential match.

  // For now, let's fetch the list and find the item. In a real app, we'd have a specific endpoint.
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["investorMatches"],
    queryFn: investorAPI.getMatches,
  });

  const match = matches.find((m) => m.id === id);

  // We also need to handle "Approve" (Express Interest) / "Reject" actions.
  // These actions likely create a Match record in the backend if it doesn't exist, or update it.
  // Currently our backend `InvestorMatchesView` returns Campaigns.
  // We need an endpoint to "interact" with a campaign/match.
  // Let's assume we add `investorAPI.interactWithMatch`

  const interactMutation = useMutation({
    mutationFn: ({ action }: { action: "approve" | "reject" }) => {
      return investorAPI.interactWithMatch(id!, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investorMatches"] });
      queryClient.invalidateQueries({ queryKey: ["investorStats"] });
      navigate("/investor/matches");
      alert("Action submitted successfully!");
    },
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
          <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-bold rounded-full">
                    {match.campaign_type}
                  </span>
                  <span className="px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 text-sm font-bold rounded-full">
                    {match.match_score}% Match
                  </span>
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
          <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              About the Opportunity
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {match.description}
            </p>
          </div>

          {/* Documents (Placeholder) */}
          <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Documents
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary-500 mr-3" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      Pitch Deck
                    </p>
                    <p className="text-xs text-neutral-500">PDF • 2.4 MB</p>
                  </div>
                </div>
                <button className="p-2 text-neutral-400 hover:text-primary-600 transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary-500 mr-3" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      Financial Projections
                    </p>
                    <p className="text-xs text-neutral-500">Excel • 1.1 MB</p>
                  </div>
                </div>
                <button className="p-2 text-neutral-400 hover:text-primary-600 transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 sticky top-24">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Interested?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Expressing interest will notify the enterprise and allow them to
              share more sensitive details with you.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => interactMutation.mutate({ action: "approve" })}
                disabled={interactMutation.isPending}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                <CheckCircle className="h-5 w-5" />
                {interactMutation.isPending
                  ? "Processing..."
                  : "Express Interest"}
              </button>
              <button
                onClick={() => interactMutation.mutate({ action: "reject" })}
                disabled={interactMutation.isPending}
                className="w-full btn-secondary flex items-center justify-center gap-2 py-3 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800"
              >
                <XCircle className="h-5 w-5" />
                Pass
              </button>
            </div>

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
    </div>
  );
};

export default InvestorMatchDetail;
