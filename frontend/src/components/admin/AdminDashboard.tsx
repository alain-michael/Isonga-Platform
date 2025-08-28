import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import type { AdminDashboardStats, RecentAssessment } from "../../types/admin";
import {
  Shield,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  FileText,
  MoreVertical,
  RefreshCw,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dashboardStats, setDashboardStats] =
    useState<AdminDashboardStats | null>(null);
  const [dashboardAssessments, setDashboardAssessments] = useState<
    RecentAssessment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, assessmentsResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentAssessments({ limit: 10 }),
      ]);

      setDashboardStats(statsResponse.data);
      setDashboardAssessments(
        assessmentsResponse.data.results || assessmentsResponse.data
      );
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user?.user_type !== "admin" && user?.user_type !== "superadmin") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-effect rounded-2xl p-8 border-2 border-error-200 dark:border-error-800 bg-white dark:bg-neutral-800">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-error-100 dark:bg-error-900 rounded-xl">
              <Shield className="h-8 w-8 text-error-600 dark:text-error-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-error-800 dark:text-error-200">
                Access Denied
              </h3>
              <p className="text-error-700 dark:text-error-300 mt-1">
                Admin privileges required to view this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-effect rounded-2xl p-8 border-2 border-error-200 dark:border-error-800 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-error-100 dark:bg-error-900 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-error-600 dark:text-error-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-error-800 dark:text-error-200">
                  Error
                </h3>
                <p className="text-error-700 dark:text-error-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
            <button onClick={fetchDashboardData} className="btn-primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-success-100 text-success-800 border-success-200";
      case "reviewed":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "pending":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "in_progress":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-neutral-400";
    if (score >= 85) return "text-success-600";
    if (score >= 70) return "text-warning-600";
    return "text-error-600";
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredAssessments = dashboardAssessments.filter((assessment) => {
    const matchesSearch =
      assessment.enterprise_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.questionnaire_title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Welcome back, {user?.first_name || user?.username}. Here's what's
            happening on the platform.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={fetchDashboardData} className="btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link to="/admin/enterprises" className="btn-primary">
            <Building2 className="h-4 w-4 mr-2" />
            Manage Enterprises
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {dashboardStats?.totalEnterprises || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Active Assessments
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {dashboardStats?.activeAssessments || 0}
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
                Completed
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {dashboardStats?.completedAssessments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Pending Reviews
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {dashboardStats?.pendingReviews || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessments Section */}
      <div className="glass-effect rounded-2xl shadow-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Recent Assessments
            </h2>
            <Link to="/admin/assessments" className="btn-secondary">
              <FileText className="h-4 w-4 mr-2" />
              View All
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 min-w-[140px]"
              >
                <option className="bg-neutral-100" value="all">
                  All Status
                </option>
                <option className="bg-neutral-100" value="pending">
                  Pending
                </option>
                <option className="bg-neutral-100" value="in_progress">
                  In Progress
                </option>
                <option className="bg-neutral-100" value="submitted">
                  Submitted
                </option>
                <option className="bg-neutral-100" value="reviewed">
                  Reviewed
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full blur-xl opacity-30"></div>
                <FileText className="relative h-16 w-16 text-neutral-400 dark:text-neutral-500 mx-auto mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                No assessments found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                Try adjusting your search criteria or filters to find the
                assessments you're looking for
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="group relative dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-700/60 hover:border-primary-300 dark:hover:border-primary-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 dark:hover:shadow-primary-400/5 overflow-hidden"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/20 dark:to-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Main content */}
                  <div className="relative p-4">
                    {/* Header with enterprise name and status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-sm">
                          <Building2 className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {assessment.enterprise_name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300 rounded font-medium">
                              Assessment #{assessment.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and score */}
                      <div className="flex items-center space-x-3">
                        {assessment.score && (
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${getScoreColor(
                                assessment.score
                              )}`}
                            >
                              {assessment.score}%
                            </div>
                          </div>
                        )}
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                            assessment.status
                          )}`}
                        >
                          {formatStatus(assessment.status)}
                        </span>
                      </div>
                    </div>

                    {/* Assessment details */}
                    <div className="flex items-center space-x-3 mb-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg">
                      <div className="p-1.5 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg">
                        <FileText className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                          {assessment.questionnaire_title}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Assessment Questionnaire
                        </p>
                      </div>
                    </div>

                    {/* Compact metadata */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800/40 dark:to-neutral-700/40 rounded-lg">
                        <Clock className="h-3 w-3 text-neutral-500 dark:text-neutral-400 mx-auto mb-1" />
                        <div className="text-xs font-medium text-neutral-900 dark:text-neutral-200">
                          {new Date(
                            assessment.submitted_at || assessment.created_at
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      {assessment.reviewed_by ? (
                        <div className="text-center p-2 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/30 dark:to-success-800/30 rounded-lg">
                          <CheckCircle className="h-3 w-3 text-success-600 dark:text-success-400 mx-auto mb-1" />
                          <div className="text-xs font-medium text-success-800 dark:text-success-200">
                            Reviewed
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-2 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg">
                          <Building2 className="h-3 w-3 dark:text-primary-400 mx-auto mb-1" />
                          <div className="text-xs font-medium  dark:text-primary-200">
                            Assessment
                          </div>
                        </div>
                      )}

                      <div className="text-center p-2 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-lg">
                        <AlertTriangle className="h-3 w-3 dark:text-secondary-400 mx-auto mb-1" />
                        <div className="text-xs font-medium dark:text-secondary-200">
                          {assessment.status === "pending" ? "High" : "Normal"}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700/60">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        ID: #{assessment.id}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-black dark:text-neutral-300 bg-white dark:bg-neutral-700/80 border border-neutral-300 dark:border-neutral-600/60 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-600/80 transition-all duration-200">
                          <Building2 className="h-3 w-3 mr-1" />
                          Enterprise
                        </button>
                        <Link
                          to={`/admin/assessments/${assessment.id}`}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Link>
                        <button className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 rounded-md transition-all duration-200">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
