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
            (m: any) => m.investor?.id === parseInt(id!)
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
      (m) => m.status === "approved" || m.status === "engaged"
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
      <div className="glass-effect rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
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
                                match.status
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
              {investor.criteria && investor.criteria.length > 0 ? (
                <div className="space-y-4">
                  {investor.criteria.map((criterion: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl"
                    >
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                        Investment Criteria #{index + 1}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {criterion.sectors && criterion.sectors.length > 0 && (
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-1">
                              Sectors
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {criterion.sectors.map(
                                (sector: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-lg text-xs"
                                  >
                                    {sector}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {criterion.min_funding_amount && (
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-1">
                              Funding Range
                            </p>
                            <p className="text-neutral-900 dark:text-neutral-100">
                              {formatCurrency(criterion.min_funding_amount)} -{" "}
                              {formatCurrency(criterion.max_funding_amount)}
                            </p>
                          </div>
                        )}
                      </div>
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
    </div>
  );
};

export default InvestorDetailView;
