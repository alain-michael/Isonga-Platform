import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  FileText,
  TrendingUp,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Download,
  MoreVertical,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (user?.user_type !== "admin" && user?.user_type !== "superadmin") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-effect rounded-2xl p-8 border-2 border-error-200">
          <div className="flex items-center space-x-4">
            {/* <div className="p-3 bg-error-100 rounded-xl">
              <Shield className="h-8 w-8 text-error-600" />
            </div> */}
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

  // Mock admin data with more realistic assessment information
  const stats = {
    totalEnterprises: 156,
    activeAssessments: 43,
    completedAssessments: 289,
    pendingReviews: 12,
  };

  const recentAssessments = [
    {
      id: 1,
      enterpriseName: "TechCorp Ltd",
      assessmentType: "Financial Assessment",
      submittedDate: "2024-08-25",
      score: 87,
      status: "completed",
      reviewer: "John Smith",
      industry: "Technology",
      employeeCount: 45,
      revenue: "$2.5M",
    },
    {
      id: 2,
      enterpriseName: "GreenEnergy Solutions",
      assessmentType: "Operations Assessment",
      submittedDate: "2024-08-24",
      score: 92,
      status: "reviewed",
      reviewer: "Sarah Wilson",
      industry: "Energy",
      employeeCount: 78,
      revenue: "$4.2M",
    },
    {
      id: 3,
      enterpriseName: "LocalCafe Chain",
      assessmentType: "Market Analysis",
      submittedDate: "2024-08-23",
      score: null,
      status: "pending_review",
      reviewer: null,
      industry: "Food & Beverage",
      employeeCount: 23,
      revenue: "$850K",
    },
    {
      id: 4,
      enterpriseName: "AutoParts Manufacturing",
      assessmentType: "Financial Assessment",
      submittedDate: "2024-08-22",
      score: 74,
      status: "completed",
      reviewer: "Mike Johnson",
      industry: "Manufacturing",
      employeeCount: 156,
      revenue: "$8.7M",
    },
    {
      id: 5,
      enterpriseName: "Digital Marketing Hub",
      assessmentType: "Operations Assessment",
      submittedDate: "2024-08-21",
      score: null,
      status: "in_review",
      reviewer: "John Smith",
      industry: "Marketing",
      employeeCount: 12,
      revenue: "$650K",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "reviewed":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "pending_review":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "in_review":
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

  const filteredAssessments = recentAssessments.filter((assessment) => {
    const matchesSearch =
      assessment.enterpriseName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.assessmentType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div> */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-lg text-neutral-600">
                Manage assessments and monitor platform activity
              </p>
            </div>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
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
                {stats.totalEnterprises}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Active Assessments
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.activeAssessments}
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
                {stats.completedAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Pending Reviews
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.pendingReviews}
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
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="in_review">In Review</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Enterprise
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Assessment Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Industry
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Submitted
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Reviewer
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => (
                  <tr
                    key={assessment.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-neutral-900">
                          {assessment.enterpriseName}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {assessment.employeeCount} employees •{" "}
                          {assessment.revenue}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-neutral-800">
                        {assessment.assessmentType}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-neutral-600">
                        {assessment.industry}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-neutral-600">
                        {assessment.submittedDate}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          assessment.status
                        )}`}
                      >
                        {assessment.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {assessment.score ? (
                        <span
                          className={`text-lg font-bold ${getScoreColor(
                            assessment.score
                          )}`}
                        >
                          {assessment.score}%
                        </span>
                      ) : (
                        <span className="text-neutral-400">Pending</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-neutral-600">
                        {assessment.reviewer || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                          <Eye className="h-4 w-4 text-neutral-600" />
                        </button>
                        <button className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                          <MoreVertical className="h-4 w-4 text-neutral-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin/assessments"
              className="btn-primary inline-flex items-center justify-center space-x-2 px-6 py-3"
            >
              <Eye className="h-5 w-5" />
              <span>View All Assessments</span>
            </Link>
            <Link
              to="/admin/enterprises"
              className="btn-secondary inline-flex items-center justify-center space-x-2 px-6 py-3"
            >
              <Building2 className="h-5 w-5" />
              <span>Manage Enterprises</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
