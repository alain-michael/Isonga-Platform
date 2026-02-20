import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  MapPin,
  Settings as SettingsIcon,
  Save,
} from "lucide-react";
import { investorAPI, matchesAPI } from "../../services/api";
import StatsCard from "../common/StatsCard";

interface InvestorDetail {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  investor_type: string;
  organization_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  min_investment: number;
  max_investment: number;
  is_active: boolean;
  created_at: string;
  criteria: any[];
}

interface Match {
  id: string;
  enterprise: {
    id: number;
    business_name: string;
    sector: string;
    district: string;
  };
  status: string;
  match_score: number;
  created_at: string;
  investor_approved: boolean;
  enterprise_accepted: boolean;
}

const InvestorDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState<InvestorDetail | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "matches" | "criteria"
  >("overview");
  const [editingCriteria, setEditingCriteria] = useState(false);
  const [criteriaOverride, setCriteriaOverride] = useState<any>(null);

  useEffect(() => {
    fetchInvestorDetails();
  }, [id]);

  const fetchInvestorDetails = async () => {
    try {
      setLoading(true);
      const [investorResponse, matchesResponse] = await Promise.all([
        investorAPI.getById(id!),
        matchesAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setInvestor(investorResponse.data);
      // Filter matches for this investor
      const investorMatches = Array.isArray(matchesResponse.data)
        ? matchesResponse.data.filter(
            (m: any) => m.investor?.id === parseInt(id!),
          )
        : [];
      setMatches(investorMatches);
    } catch (err) {
      console.error("Error fetching investor details:", err);
      setError("Failed to load investor details");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "engaged":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "rejected":
      case "withdrawn":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "engaged":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
      case "withdrawn":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const investorTypeDisplay: Record<string, string> = {
    individual: "Individual Investor",
    institutional: "Institutional Investor",
    vc: "Venture Capital",
    pe: "Private Equity",
    angel: "Angel Investor",
    bank: "Bank/Financial Institution",
    dfi: "Development Finance Institution",
    other: "Other",
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Investor not found"}</p>
          <button
            onClick={() => navigate("/admin/investors")}
            className="mt-4 btn-primary"
          >
            Back to Investors
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    totalMatches: matches.length,
    activeMatches: matches.filter(
      (m) => m.status === "approved" || m.status === "engaged",
    ).length,
    pendingMatches: matches.filter((m) => m.status === "pending").length,
    completedMatches: matches.filter((m) => m.status === "completed").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/investors")}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {investor.organization_name}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {investorTypeDisplay[investor.investor_type]}
            </p>
          </div>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Edit className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          label="Total Matches"
          value={stats.totalMatches}
          gradient="bg-gradient-to-br from-primary-500/10 to-primary-600/5"
          iconBg="bg-gradient-to-br from-primary-500 to-primary-600"
        />
        <StatsCard
          icon={TrendingUp}
          label="Active Matches"
          value={stats.activeMatches}
          gradient="bg-gradient-to-br from-green-500/10 to-green-600/5"
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatsCard
          icon={Clock}
          label="Pending"
          value={stats.pendingMatches}
          gradient="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5"
          iconBg="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
        <StatsCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completedMatches}
          gradient="bg-gradient-to-br from-purple-500/10 to-purple-600/5"
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Tabs */}
      <div className="glass-effect rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "matches", label: "Matches" },
              { id: "criteria", label: "Investment Criteria" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Email
                      </p>
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {investor.contact_email}
                      </p>
                    </div>
                  </div>
                  {investor.contact_phone && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Phone
                        </p>
                        <p className="text-neutral-900 dark:text-neutral-100">
                          {investor.contact_phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {investor.website && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Website
                        </p>
                        <a
                          href={investor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                        >
                          {investor.website}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Member Since
                      </p>
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {new Date(investor.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Range */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Investment Range
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Minimum Investment
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(investor.min_investment)}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Maximum Investment
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(investor.max_investment)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {investor.description && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    About
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {investor.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "matches" && (
            <div>
              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No matches found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {match.enterprise.business_name}
                            </h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                                match.status,
                              )}`}
                            >
                              {getStatusIcon(match.status)}
                              <span>{match.status}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                            <span className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {match.enterprise.sector}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {match.enterprise.district}
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Score: {match.match_score}%
                            </span>
                          </div>
                        </div>
                        <button className="btn-secondary text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "criteria" && (
            <div>
              {/* Admin Actions */}
              <div className="mb-6 flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <SettingsIcon className="h-5 w-5 text-primary-600" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Admin Configuration Review
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Review and adjust partner criteria to ensure fairness
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (investor.criteria && investor.criteria.length > 0) {
                      setCriteriaOverride(investor.criteria[0]);
                      setEditingCriteria(true);
                    }
                  }}
                  className="btn-primary flex items-center gap-2"
                  disabled={
                    !investor.criteria || investor.criteria.length === 0
                  }
                >
                  <Edit className="h-4 w-4" />
                  Edit Criteria
                </button>
              </div>

              {investor.criteria && investor.criteria.length > 0 ? (
                <div className="space-y-6">
                  {investor.criteria.map((criterion: any, index: number) => (
                    <div key={index} className="space-y-6">
                      {/* Funding Range */}
                      <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary-600" />
                          Funding Range
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                              Minimum
                            </p>
                            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              {formatCurrency(criterion.min_funding_amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                              Maximum
                            </p>
                            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              {formatCurrency(criterion.max_funding_amount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Readiness Score Requirements */}
                      <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          Readiness Score Requirements
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {criterion.min_readiness_score && (
                            <div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                                Minimum Score
                              </p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                {criterion.min_readiness_score}%
                              </p>
                            </div>
                          )}
                          {criterion.auto_reject_below_score && (
                            <div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                                Auto-Reject Below
                              </p>
                              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                {criterion.auto_reject_below_score}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Revenue Preferences */}
                      {criterion.preferred_revenue_range &&
                        (criterion.preferred_revenue_range.min ||
                          criterion.preferred_revenue_range.max) && (
                          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              Revenue Preferences
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              {criterion.preferred_revenue_range.min && (
                                <div>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                                    Minimum Revenue
                                  </p>
                                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(
                                      criterion.preferred_revenue_range.min,
                                    )}
                                  </p>
                                </div>
                              )}
                              {criterion.preferred_revenue_range.max && (
                                <div>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                                    Maximum Revenue
                                  </p>
                                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(
                                      criterion.preferred_revenue_range.max,
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Sectors */}
                      {criterion.sectors && criterion.sectors.length > 0 && (
                        <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                            Sector Focus
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {criterion.sectors.map(
                              (sector: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-lg text-sm font-medium"
                                >
                                  {sector}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Enterprise Sizes */}
                      {criterion.preferred_sizes &&
                        criterion.preferred_sizes.length > 0 && (
                          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                              Preferred Enterprise Sizes
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {criterion.preferred_sizes.map(
                                (size: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-sm font-medium capitalize"
                                  >
                                    {size}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Geographic Focus */}
                      {criterion.geographic_focus &&
                        criterion.geographic_focus.length > 0 && (
                          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-teal-600" />
                              Geographic Focus
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {criterion.geographic_focus.map(
                                (district: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-lg text-sm"
                                  >
                                    {district}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Required Documents */}
                      {criterion.required_documents &&
                        criterion.required_documents.length > 0 && (
                          <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                              <FileText className="h-5 w-5 text-indigo-600" />
                              Required Documents
                            </h4>
                            <div className="space-y-3">
                              {criterion.required_documents.map(
                                (doc: any, i: number) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                                  >
                                    <FileText className="h-5 w-5 text-neutral-400 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                          {doc.name}
                                        </p>
                                        {doc.required && (
                                          <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                                            Required
                                          </span>
                                        )}
                                      </div>
                                      {doc.description && (
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                          {doc.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                        Type: {doc.type}
                                      </p>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No investment criteria set
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Edit Criteria Modal */}
      {editingCriteria && criteriaOverride && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Admin: Edit Partner Criteria
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Adjust partner criteria to ensure fairness and platform integrity.
              Changes will be logged for audit purposes.
            </p>

            <div className="space-y-6">
              {/* Auto-Reject Score */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Auto-Reject Below Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={criteriaOverride.auto_reject_below_score || ""}
                  onChange={(e) =>
                    setCriteriaOverride({
                      ...criteriaOverride,
                      auto_reject_below_score: parseInt(e.target.value) || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  placeholder="e.g. 50"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  SMEs with readiness scores below this threshold will be
                  automatically declined
                </p>
                {criteriaOverride.auto_reject_below_score && (
                  <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs text-orange-800 dark:text-orange-300">
                    ⚠️ Setting this too high (above 70%) may be unreasonable and
                    limit partner opportunities
                  </div>
                )}
              </div>

              {/* Min Readiness Score */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Minimum Readiness Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={criteriaOverride.min_readiness_score || ""}
                  onChange={(e) =>
                    setCriteriaOverride({
                      ...criteriaOverride,
                      min_readiness_score: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Soft minimum - campaigns below this will still be shown but
                  flagged
                </p>
              </div>

              {/* Funding Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Min Funding Amount (RWF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={criteriaOverride.min_funding_amount || ""}
                    onChange={(e) =>
                      setCriteriaOverride({
                        ...criteriaOverride,
                        min_funding_amount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Max Funding Amount (RWF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={criteriaOverride.max_funding_amount || ""}
                    onChange={(e) =>
                      setCriteriaOverride({
                        ...criteriaOverride,
                        max_funding_amount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Admin Adjustment Notes (Required)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why these adjustments were necessary..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  This note will be logged for audit purposes and shared with
                  the partner
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingCriteria(false);
                  setCriteriaOverride(null);
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement API call to update criteria with admin override
                  // This should include audit logging
                  alert(
                    "Admin criteria update functionality will be implemented with proper audit logging",
                  );
                  setEditingCriteria(false);
                  setCriteriaOverride(null);
                }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes (Admin Override)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDetailView;
