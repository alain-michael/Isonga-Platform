import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Briefcase,
  Mail,
  Filter,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  RefreshCw,
  AlertCircle,
  Phone,
  Globe,
} from "lucide-react";
import { investorAPI } from "../../services/api";
import StatsCard from "../common/StatsCard";
import ViewToggle from "../common/ViewToggle";
import InvestorOnboardingModal from "./InvestorOnboardingModal";

interface Investor {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  organization_name: string;
  investor_type: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  min_investment: number;
  max_investment: number;
  is_active: boolean;
  created_at: string;
}

const AdminInvestors: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const response = await investorAPI.getAll();
      const data = response.data.results || response.data;
      setInvestors(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching investors:", err);
      setError("Failed to load investors");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch =
      investor.organization_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      investor.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.investor_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || investor.investor_type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && investor.is_active) ||
      (statusFilter === "inactive" && !investor.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: investors.length,
    active: investors.filter((i) => i.is_active).length,
    inactive: investors.filter((i) => !i.is_active).length,
    totalInvestment: investors.reduce(
      (sum, i) =>
        sum +
        (typeof i.max_investment === "number"
          ? i.max_investment
          : parseFloat(String(i.max_investment)) || 0),
      0
    ),
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const investorTypeDisplay: Record<string, string> = {
    individual: "Individual",
    institutional: "Institutional",
    vc: "Venture Capital",
    pe: "Private Equity",
    angel: "Angel",
    bank: "Bank",
    dfi: "DFI",
    other: "Other",
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-xl animate-pulse">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full glass-effect dark:bg-neutral-800 flex items-center justify-center shadow-lg">
              <RefreshCw className="h-4 w-4 text-purple-600 animate-spin" />
            </div>
          </div>
          <span className="mt-6 text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Loading investors...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-effect rounded-3xl p-8 max-w-lg mx-auto text-center glass-effect dark:bg-neutral-800 border border-error-200 dark:border-error-800">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-error-500 to-error-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Failed to Load Investors
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
          <button
            onClick={fetchInvestors}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Investor Management
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Onboard and manage investor profiles and criteria
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchInvestors}
              className="p-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="btn-primary flex items-center space-x-2 shadow-lg shadow-purple-500/25"
            >
              <Plus className="h-5 w-5" />
              <span>Onboard Investor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 slide-up">
        <StatsCard
          icon={Briefcase}
          label="Total Investors"
          value={stats.total}
          gradient="bg-gradient-to-br from-purple-500/10 to-purple-600/5"
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatsCard
          icon={TrendingUp}
          label="Active"
          value={stats.active}
          gradient="bg-gradient-to-br from-green-500/10 to-green-600/5"
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatsCard
          icon={Users}
          label="Inactive"
          value={stats.inactive}
          gradient="bg-gradient-to-br from-neutral-500/10 to-neutral-600/5"
          iconBg="bg-gradient-to-br from-neutral-500 to-neutral-600"
        />
        <StatsCard
          icon={DollarSign}
          label="Total Capacity"
          value={formatCurrency(stats.totalInvestment)}
          gradient="bg-gradient-to-br from-blue-500/10 to-blue-600/5"
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="glass-effect p-4 rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search investors by name, email, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-purple-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-purple-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Types</option>
              <option value="vc">Venture Capital</option>
              <option value="pe">Private Equity</option>
              <option value="angel">Angel Investor</option>
              <option value="bank">Bank</option>
              <option value="dfi">DFI</option>
              <option value="institutional">Institutional</option>
              <option value="individual">Individual</option>
              <option value="other">Other</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-purple-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
        {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
          <div className="mt-3 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <Filter className="h-4 w-4 mr-2" />
            Showing {filteredInvestors.length} of {investors.length} investors
            {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="ml-3 text-purple-600 dark:text-purple-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestors.map((investor) => (
            <div
              key={investor.id}
              className="group glass-effect rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/admin/investors/${investor.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                    {investor.organization_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {investor.organization_name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {investorTypeDisplay[investor.investor_type] ||
                        investor.investor_type}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    investor.is_active
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {investor.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{investor.contact_email}</span>
                </div>
                {investor.contact_phone && (
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{investor.contact_phone}</span>
                  </div>
                )}
                {investor.website && (
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{investor.website}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="font-medium">Investment Range:</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1 ml-6">
                    {formatCurrency(investor.min_investment)} -{" "}
                    {formatCurrency(investor.max_investment)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {new Date(investor.created_at).toLocaleDateString()}
                </span>
                <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center group-hover:translate-x-1 transition-transform">
                  View Details
                  <Eye className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="glass-effect rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-700/50 dark:to-neutral-700/30">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Investment Range
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredInvestors.map((investor) => (
                  <tr
                    key={investor.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/investors/${investor.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                          {investor.organization_name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {investor.organization_name}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {investor.user.first_name} {investor.user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        {investorTypeDisplay[investor.investor_type] ||
                          investor.investor_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-neutral-400" />
                        {investor.contact_email}
                      </div>
                      {investor.contact_phone && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-2 text-neutral-400" />
                          {investor.contact_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(investor.min_investment)}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        to {formatCurrency(investor.max_investment)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          investor.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {investor.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/investors/${investor.id}`);
                        }}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredInvestors.length === 0 && (
        <div className="text-center py-16">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-12 w-12 text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            No Investors Found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {searchTerm || typeFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by onboarding your first investor"}
          </p>
          {!searchTerm && typeFilter === "all" && statusFilter === "all" && (
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Onboard Investor</span>
            </button>
          )}
        </div>
      )}

      {/* Onboarding Modal */}
      <InvestorOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSuccess={fetchInvestors}
      />
    </div>
  );
};

export default AdminInvestors;
