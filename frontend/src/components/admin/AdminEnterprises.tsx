import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  Download,
  MoreVertical,
  Building2,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { enterpriseAPI } from "../../services/api";
import ViewToggle from "../common/ViewToggle";

interface Enterprise {
  id: number;
  business_name: string;
  tin_number: string;
  enterprise_type: string;
  sector: string;
  district: string;
  description: string;
  website?: string;
  email: string;
  phone_number: string;
  number_of_employees: string;
  created_at: string;
  updated_at: string;
  is_vetted: boolean;
  vetted_at?: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

const AdminEnterprises: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    fetchEnterprises();
  }, []);

  const fetchEnterprises = async () => {
    try {
      setLoading(true);
      const response = await enterpriseAPI.getAll();
      setEnterprises(response.data.results);
    } catch (err) {
      console.error("Error fetching enterprises:", err);
      setError("Failed to load enterprises");
    } finally {
      setLoading(false);
    }
  };

  const filteredEnterprises = enterprises.filter((enterprise) => {
    const matchesSearch =
      enterprise.business_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enterprise.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.tin_number.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && enterprise.is_vetted) ||
      (statusFilter === "pending" && !enterprise.is_vetted);
    const matchesIndustry =
      industryFilter === "all" || enterprise.sector === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const stats = {
    total: enterprises.length,
    verified: enterprises.filter((e) => e.is_vetted).length,
    pending: enterprises.filter((e) => !e.is_vetted).length,
    rejected: 0, // Not implemented in backend
  };

  const industries = [...new Set(enterprises.map((e) => e.sector))];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl animate-pulse">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full glass-effect dark:bg-neutral-800 flex items-center justify-center shadow-lg">
              <RefreshCw className="h-4 w-4 text-primary-600 animate-spin" />
            </div>
          </div>
          <span className="mt-6 text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Loading enterprises...
          </span>
          <div className="mt-2 flex space-x-1">
            <div
              className="h-2 w-2 rounded-full bg-primary-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-2 w-2 rounded-full bg-primary-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-2 w-2 rounded-full bg-primary-500 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
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
            Failed to Load Enterprises
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
          <button
            onClick={fetchEnterprises}
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
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Enterprise Management
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Manage and oversee all registered enterprises
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchEnterprises}
              className="p-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <button className="btn-primary flex items-center space-x-2 shadow-lg shadow-primary-500/25">
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 slide-up">
        <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-xs lg:text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Total
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-success-500/10 to-success-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center">
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg shadow-success-500/25">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-xs lg:text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Verified
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-success-600 dark:text-success-400">
                {stats.verified}
              </p>
            </div>
          </div>
        </div>

        <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-warning-500/10 to-warning-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg shadow-warning-500/25">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-xs lg:text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Pending
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-warning-600 dark:text-warning-400">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-error-500/10 to-error-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center">
            <div className="p-3 bg-gradient-to-br from-error-500 to-error-600 rounded-xl shadow-lg shadow-error-500/25">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-xs lg:text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Rejected
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-error-600 dark:text-error-400">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-effect rounded-2xl p-6 mb-8 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search enterprises, industries, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none glass-effect dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none glass-effect dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none glass-effect dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 min-w-[140px]"
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="glass-effect rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Enterprise
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredEnterprises.map((enterprise) => (
                  <tr
                    key={enterprise.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div>
                          <Link
                            to={`/admin/enterprises/${enterprise.id}`}
                            className="text-primary-400 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 font-semibold"
                          >
                            <p className="font-semibold">
                              {enterprise.business_name}
                            </p>
                          </Link>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                            TIN: {enterprise.tin_number}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col space-y-1">
                        <span className="inline-flex px-2.5 py-0.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium w-fit">
                          {enterprise.sector}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {enterprise.enterprise_type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        <span>{enterprise.district}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <Mail className="h-3.5 w-3.5 text-neutral-400" />
                          <span className="truncate max-w-[150px]">
                            {enterprise.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <Phone className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{enterprise.phone_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {enterprise.is_vetted ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 text-xs font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 text-xs font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-neutral-600 dark:text-neutral-400">
                      {new Date(enterprise.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        {enterprise.website && (
                          <a
                            href={enterprise.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            title="Visit Website"
                          >
                            <Globe className="h-4 w-4 text-neutral-400 hover:text-primary-500" />
                          </a>
                        )}
                        <Link
                          to={`/admin/enterprises/${enterprise.id}`}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <MoreVertical className="h-4 w-4 text-neutral-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEnterprises.length === 0 && (
            <div className="p-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                No Enterprises Found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setIndustryFilter("all");
                }}
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEnterprises.map((enterprise) => (
              <div
                key={enterprise.id}
                className="group glass-effect rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300"
              >
                {/* Card Header with gradient accent */}
                <div
                  className={`h-2 ${
                    enterprise.is_vetted
                      ? "bg-gradient-to-r from-success-500 to-success-600"
                      : "bg-gradient-to-r from-warning-500 to-warning-600"
                  }`}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-xl font-bold text-white">
                          {enterprise.business_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {enterprise.business_name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            {enterprise.sector}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            {enterprise.enterprise_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {enterprise.is_vetted ? (
                        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 text-xs font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 text-xs font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mr-2">
                        <MapPin className="h-4 w-4 text-primary-500" />
                      </div>
                      <span className="truncate">{enterprise.district}</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mr-2">
                        <Users className="h-4 w-4 text-primary-500" />
                      </div>
                      <span>{enterprise.number_of_employees}</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mr-2">
                        <Mail className="h-4 w-4 text-primary-500" />
                      </div>
                      <span className="truncate">{enterprise.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mr-2">
                        <Calendar className="h-4 w-4 text-primary-500" />
                      </div>
                      <span>
                        {new Date(enterprise.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* TIN Number */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 mb-5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        TIN:
                      </span>
                      <span className="text-sm font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                        {enterprise.tin_number}
                      </span>
                    </div>
                    {enterprise.website && (
                      <a
                        href={enterprise.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span>Website</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {enterprise.phone_number}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/enterprises/${enterprise.id}`}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                        <MoreVertical className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEnterprises.length === 0 && (
            <div className="glass-effect rounded-3xl p-12 text-center glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                No Enterprises Found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
                We couldn't find any enterprises matching your search criteria.
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setIndustryFilter("all");
                }}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminEnterprises;
