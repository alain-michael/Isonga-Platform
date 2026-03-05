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
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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

const SECTORS_LIST = [
  { value: "agriculture", label: "Agriculture" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "technology", label: "Technology" },
  { value: "retail", label: "Retail" },
  { value: "construction", label: "Construction" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
];

const ENTERPRISE_SIZES_LIST = [
  { value: "micro", label: "Micro (1-9 employees)" },
  { value: "small", label: "Small (10-49 employees)" },
  { value: "medium", label: "Medium (50-249 employees)" },
  { value: "large", label: "Large (250+ employees)" },
];

const DISTRICTS_LIST = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Bugesera",
  "Gatsibo",
  "Kayonza",
  "Kirehe",
  "Ngoma",
  "Nyagatare",
  "Rwamagana",
  "Kamonyi",
  "Muhanga",
  "Nyanza",
  "Ruhango",
  "Gisagara",
  "Huye",
  "Karongi",
  "Ngororero",
  "Nyabihu",
  "Nyamasheke",
  "Rubavu",
  "Rusizi",
  "Rutsiro",
  "Gakenke",
  "Burera",
  "Gicumbi",
  "Musanze",
  "Rulindo",
];

const DOCUMENT_TYPES_LIST = [
  { value: "pdf", label: "PDF Document" },
  { value: "financial", label: "Financial Statement" },
  { value: "legal", label: "Legal Document" },
  { value: "business_plan", label: "Business Plan" },
  { value: "other", label: "Other" },
];

interface RequiredDocument {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface CriteriaFormData {
  sectors: string[];
  min_funding_amount: number;
  max_funding_amount: number;
  min_readiness_score: number;
  auto_reject_below_score: number | null;
  preferred_revenue_range: { min: number | null; max: number | null };
  required_documents: RequiredDocument[];
  preferred_sizes: string[];
  geographic_focus: string[];
}

const InvestorDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [investor, setInvestor] = useState<InvestorDetail | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "matches" | "criteria"
  >("overview");
  const [editingCriteria, setEditingCriteria] = useState(false);
  const [criteriaFormData, setCriteriaFormData] = useState<CriteriaFormData>({
    sectors: [],
    min_funding_amount: 0,
    max_funding_amount: 0,
    min_readiness_score: 0,
    auto_reject_below_score: null,
    preferred_revenue_range: { min: null, max: null },
    required_documents: [],
    preferred_sizes: [],
    geographic_focus: [],
  });
  const [criteriaSaving, setCriteriaSaving] = useState(false);
  const [criteriaSuccess, setCriteriaSuccess] = useState(false);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);

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

  const openCriteriaEditor = () => {
    const existing =
      investor?.criteria && investor.criteria.length > 0
        ? investor.criteria[0]
        : null;
    setCriteriaFormData({
      sectors: existing?.sectors || [],
      min_funding_amount: existing?.min_funding_amount || 0,
      max_funding_amount: existing?.max_funding_amount || 0,
      min_readiness_score: existing?.min_readiness_score || 0,
      auto_reject_below_score: existing?.auto_reject_below_score || null,
      preferred_revenue_range: existing?.preferred_revenue_range || {
        min: null,
        max: null,
      },
      required_documents: existing?.required_documents || [],
      preferred_sizes: existing?.preferred_sizes || [],
      geographic_focus: existing?.geographic_focus || [],
    });
    setCriteriaError(null);
    setEditingCriteria(true);
  };

  const saveCriteria = async () => {
    if (!investor) return;
    setCriteriaSaving(true);
    setCriteriaError(null);
    try {
      const payload = {
        investor: investor.id,
        ...criteriaFormData,
        is_active: true,
      };
      const existing =
        investor.criteria && investor.criteria.length > 0
          ? investor.criteria[0]
          : null;
      if (existing) {
        await investorAPI.updateCriteria(existing.id, payload);
      } else {
        await investorAPI.createCriteria(payload);
      }
      // Refresh investor data
      const res = await investorAPI.getById(id!);
      setInvestor(res.data);
      setEditingCriteria(false);
      setCriteriaSuccess(true);
      setTimeout(() => setCriteriaSuccess(false), 3000);
    } catch (err: any) {
      setCriteriaError(
        err?.response?.data?.detail ||
          JSON.stringify(err?.response?.data) ||
          "Failed to save criteria",
      );
    } finally {
      setCriteriaSaving(false);
    }
  };

  const toggleSector = (s: string) =>
    setCriteriaFormData((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(s)
        ? prev.sectors.filter((x) => x !== s)
        : [...prev.sectors, s],
    }));

  const toggleSize = (s: string) =>
    setCriteriaFormData((prev) => ({
      ...prev,
      preferred_sizes: prev.preferred_sizes.includes(s)
        ? prev.preferred_sizes.filter((x) => x !== s)
        : [...prev.preferred_sizes, s],
    }));

  const toggleDistrict = (d: string) =>
    setCriteriaFormData((prev) => ({
      ...prev,
      geographic_focus: prev.geographic_focus.includes(d)
        ? prev.geographic_focus.filter((x) => x !== d)
        : [...prev.geographic_focus, d],
    }));

  const addReqDoc = () =>
    setCriteriaFormData((prev) => ({
      ...prev,
      required_documents: [
        ...prev.required_documents,
        { name: "", type: "pdf", required: true, description: "" },
      ],
    }));

  const removeReqDoc = (i: number) =>
    setCriteriaFormData((prev) => ({
      ...prev,
      required_documents: prev.required_documents.filter((_, idx) => idx !== i),
    }));

  const updateReqDoc = (i: number, field: keyof RequiredDocument, value: any) =>
    setCriteriaFormData((prev) => ({
      ...prev,
      required_documents: prev.required_documents.map((doc, idx) =>
        idx === i ? { ...doc, [field]: value } : doc,
      ),
    }));

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
              {/* Success banner */}
              {criteriaSuccess && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    Investment criteria updated successfully!
                  </span>
                </div>
              )}
              {/* Admin Actions */}
              <div className="mb-6 flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <SettingsIcon className="h-5 w-5 text-primary-600" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Admin Configuration
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Set or adjust partner criteria on behalf of this partner
                    </p>
                  </div>
                </div>
                <button
                  onClick={openCriteriaEditor}
                  className="btn-primary flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {investor.criteria && investor.criteria.length > 0
                    ? "Edit Criteria"
                    : "Set Criteria"}
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

      {/* Full Criteria Editor Modal */}
      {editingCriteria && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {investor?.criteria && investor.criteria.length > 0
                  ? "Edit"
                  : "Set"}{" "}
                Investment Criteria
              </h3>
              <span className="text-sm text-neutral-500">
                Admin action on behalf of partner
              </span>
            </div>

            <div className="p-6 space-y-8">
              {criteriaError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {criteriaError}
                </div>
              )}

              {/* Funding Range */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary-600" /> Funding
                  Range (RWF)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Minimum
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={criteriaFormData.min_funding_amount}
                      onChange={(e) =>
                        setCriteriaFormData((p) => ({
                          ...p,
                          min_funding_amount: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Maximum
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={criteriaFormData.max_funding_amount}
                      onChange={(e) =>
                        setCriteriaFormData((p) => ({
                          ...p,
                          max_funding_amount: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Readiness Scores */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" /> Readiness
                  Score Requirements
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Minimum Score (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={criteriaFormData.min_readiness_score}
                      onChange={(e) =>
                        setCriteriaFormData((p) => ({
                          ...p,
                          min_readiness_score: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Auto-Reject Below (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={criteriaFormData.auto_reject_below_score ?? ""}
                      onChange={(e) =>
                        setCriteriaFormData((p) => ({
                          ...p,
                          auto_reject_below_score: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                      placeholder="Leave blank to disable"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Revenue Range */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Revenue Range (RWF, optional)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Min Revenue
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={criteriaFormData.preferred_revenue_range.min ?? ""}
                      onChange={(e) =>
                        setCriteriaFormData((p) => ({
                          ...p,
                          preferred_revenue_range: {
                            ...p.preferred_revenue_range,
                            min: e.target.value ? Number(e.target.value) : null,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Max Revenue
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={criteriaFormData.preferred_revenue_range.max ?? ""}
                      onChange={(e) =>
                        setCriteriaFormData((p) => ({
                          ...p,
                          preferred_revenue_range: {
                            ...p.preferred_revenue_range,
                            max: e.target.value ? Number(e.target.value) : null,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* Sectors */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Sector Focus
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECTORS_LIST.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleSector(s.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        criteriaFormData.sectors.includes(s.value)
                          ? "bg-primary-100 dark:bg-primary-900/40 border-primary-400 text-primary-800 dark:text-primary-300"
                          : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enterprise Sizes */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Preferred Enterprise Sizes
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {ENTERPRISE_SIZES_LIST.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleSize(s.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        criteriaFormData.preferred_sizes.includes(s.value)
                          ? "bg-purple-100 dark:bg-purple-900/40 border-purple-400 text-purple-800 dark:text-purple-300"
                          : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Geographic Focus */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Geographic Focus (Districts)
                </h4>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                  {DISTRICTS_LIST.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDistrict(d)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        criteriaFormData.geographic_focus.includes(d)
                          ? "bg-teal-100 dark:bg-teal-900/40 border-teal-400 text-teal-800 dark:text-teal-300"
                          : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" /> Required
                    Documents
                  </h4>
                  <button
                    type="button"
                    onClick={addReqDoc}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Plus className="h-4 w-4" /> Add Document
                  </button>
                </div>
                <div className="space-y-3">
                  {criteriaFormData.required_documents.map((doc, i) => (
                    <div
                      key={i}
                      className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900/30 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            Document Name *
                          </label>
                          <input
                            type="text"
                            value={doc.name}
                            onChange={(e) =>
                              updateReqDoc(i, "name", e.target.value)
                            }
                            placeholder="e.g. Business Plan"
                            className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            Type
                          </label>
                          <select
                            value={doc.type}
                            onChange={(e) =>
                              updateReqDoc(i, "type", e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                          >
                            {DOCUMENT_TYPES_LIST.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={doc.description}
                        onChange={(e) =>
                          updateReqDoc(i, "description", e.target.value)
                        }
                        placeholder="Description (optional)"
                        className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.required}
                            onChange={(e) =>
                              updateReqDoc(i, "required", e.target.checked)
                            }
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          Required document
                        </label>
                        <button
                          type="button"
                          onClick={() => removeReqDoc(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {criteriaFormData.required_documents.length === 0 && (
                    <p className="text-sm text-neutral-400 italic text-center py-4">
                      No required documents set
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={() => setEditingCriteria(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCriteria}
                disabled={criteriaSaving}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {criteriaSaving ? "Saving..." : "Save Criteria"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDetailView;
