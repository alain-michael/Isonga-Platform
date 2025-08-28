import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
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
  TrendingUp,
} from "lucide-react";
import { enterpriseAPI } from "../../services/api";

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

  const getStatusColor = (isVetted: boolean) => {
    if (isVetted) {
      return "bg-success-100 text-success-800 border-success-200";
    } else {
      return "bg-warning-100 text-warning-800 border-warning-200";
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-700 border-t-primary-600"></div>
          <span className="ml-4 text-lg text-neutral-600 dark:text-neutral-400">
            Loading enterprises...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-xl mb-4">
            ⚠️ Error Loading Enterprises
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
          <button onClick={fetchEnterprises} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </Link>
            <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Enterprise Management
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Manage and oversee all registered enterprises
              </p>
            </div>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        <div className="glass-effect rounded-2xl p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Total Enterprises
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Verified
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.verified}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Pending
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-error-500 to-error-600 rounded-xl shadow-lg">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Rejected
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-effect rounded-2xl p-6 mb-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search enterprises, industries, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 min-w-[140px]"
              >
                <option className="bg-neutral-100" value="all">All Status</option>
                <option className="bg-neutral-100" value="verified">Verified</option>
                <option className="bg-neutral-100" value="pending">Pending</option>
                <option className="bg-neutral-100" value="rejected">Rejected</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 min-w-[140px]"
              >
                <option className="bg-neutral-100" value="all">All Industries</option>
                {industries.map((industry) => (
                  <option className="bg-neutral-100" key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprises Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEnterprises.map((enterprise) => (
          <div
            key={enterprise.id}
            className="glass-effect rounded-2xl p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {enterprise.business_name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {enterprise.sector}
                    </p>
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  enterprise.is_vetted
                )}`}
              >
                {enterprise.is_vetted ? "Verified" : "Pending"}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <MapPin className="h-4 w-4 mr-2" />
                {enterprise.district}
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <Users className="h-4 w-4 mr-2" />
                {enterprise.number_of_employees} employees
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <TrendingUp className="h-4 w-4 mr-2" />
                Sector: {enterprise.sector}
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <Calendar className="h-4 w-4 mr-2" />
                Registered:{" "}
                {new Date(enterprise.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <span>Status</span>
                <span>
                  {enterprise.is_vetted ? "Verified" : "Pending Verification"}
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                  style={{
                    width: enterprise.is_vetted ? "100%" : "50%",
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>Enterprise Type: {enterprise.enterprise_type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/admin/enterprises/${enterprise.id}`}
                    className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Eye className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </Link>
                  <button className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                    <MoreVertical className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEnterprises.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            No Enterprises Found
          </h3>
          <p className="text-neutral-500 dark:text-neutral-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminEnterprises;
