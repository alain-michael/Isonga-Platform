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
        <div className="glass-effect rounded-2xl p-8 border-2 border-error-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-error-100 rounded-xl">
              <Shield className="h-8 w-8 text-error-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-error-800">
                Access Denied
              </h3>
              <p className="text-error-700 mt-1">
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
          <span className="ml-2 text-lg font-medium text-neutral-600">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-effect rounded-2xl p-8 border-2 border-error-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-error-100 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-error-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-error-800">Error</h3>
                <p className="text-error-700 mt-1">{error}</p>
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
      assessment.enterprise.business_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.questionnaire.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.enterprise.sector
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
          <h1 className="text-3xl font-bold text-neutral-900">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600 mt-2">
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
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Total Enterprises
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {dashboardStats?.totalEnterprises || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Active Assessments
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {dashboardStats?.activeAssessments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Completed
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {dashboardStats?.completedAssessments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Pending Reviews
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {dashboardStats?.pendingReviews || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessments Section */}
      <div className="glass-effect rounded-2xl shadow-xl">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">
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
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-10 pr-8"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-600">
                No assessments found
              </p>
              <p className="text-neutral-500 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {assessment.enterprise.business_name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            assessment.status
                          )}`}
                        >
                          {formatStatus(assessment.status)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-3">
                        {assessment.enterprise.employee_count} employees •{" "}
                        {assessment.enterprise.sector}
                      </p>
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {assessment.questionnaire.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Category: {assessment.questionnaire.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            Submitted
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(
                              assessment.submitted_at || assessment.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {assessment.score && (
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              Score
                            </p>
                            <p
                              className={`text-lg font-bold ${getScoreColor(
                                assessment.score
                              )}`}
                            >
                              {assessment.score}%
                            </p>
                          </div>
                        )}
                        {assessment.reviewed_by && (
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              Reviewer
                            </p>
                            <p className="text-xs text-neutral-500">
                              {assessment.reviewed_by.first_name}{" "}
                              {assessment.reviewed_by.last_name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-6">
                      <Link
                        to={`/admin/assessments/${assessment.id}`}
                        className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-all duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
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
