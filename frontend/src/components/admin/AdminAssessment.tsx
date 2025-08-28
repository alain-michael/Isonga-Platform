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
  Calendar,
  User,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
} from "lucide-react";
import { assessmentAPI } from "../../services/api";

interface Assessment {
  id: number;
  title: string;
  enterprise: {
    id: number;
    business_name: string;
    sector: string;
    tin_number: string;
    district: string;
    number_of_employees: string;
    email: string;
    phone_number: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
  score?: number;
  reviewer?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  questionnaire: {
    id: number;
    title: string;
    category: {
      name: string;
    };
  };
}

const AdminAssessments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getAssessments();
      setAssessments(response.data?.results);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "reviewed":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "in_review":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      case "pending_review":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "draft":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
          <span className="ml-4 text-lg text-neutral-600">
            Loading assessments...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">
            ⚠️ Error Loading Assessments
          </div>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button onClick={fetchAssessments} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-neutral-400";
    if (score >= 85) return "text-success-600";
    if (score >= 70) return "text-warning-600";
    return "text-error-600";
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.enterprise.business_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.enterprise.sector
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.enterprise.district
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.questionnaire.category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assessment.status === statusFilter;
    // Note: priority filtering removed since it's not in the backend model
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalAssessments: assessments.length,
    draft: assessments.filter((a) => a.status === "draft").length,
    inProgress: assessments.filter((a) => a.status === "in_progress").length,
    completed: assessments.filter(
      (a) => a.status === "completed" || a.status === "reviewed"
    ).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Assessment Management
              </h1>
              <p className="text-lg text-neutral-600">
                Review and manage all enterprise assessments
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Total Assessments
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalAssessments}
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
                Draft
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.draft}
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
                In Progress
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.inProgress}
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
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-effect rounded-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search assessments, enterprises, or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none appearance-none bg-white min-w-[160px]"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="glass-effect rounded-2xl shadow-xl">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">
            Assessment Details
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                  Enterprise
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                  Assessment
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                  Score
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                  Reviewer
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                  Dates
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment) => (
                <tr
                  key={assessment.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold text-neutral-900 mb-1">
                        {assessment.enterprise.business_name}
                      </div>
                      <div className="text-sm text-neutral-500">
                        <Building2 className="h-3 w-3 inline mr-1" />
                        {assessment.enterprise.sector} •{" "}
                        {assessment.enterprise.number_of_employees} employees
                      </div>
                      <div className="text-sm text-neutral-500">
                        TIN: {assessment.enterprise.tin_number} • 📍{" "}
                        {assessment.enterprise.district}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-neutral-800 mb-1">
                        {assessment.questionnaire.title}
                      </div>
                      <div className="text-sm text-neutral-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Created:{" "}
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-neutral-500">
                        Category: {assessment.questionnaire.category.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        assessment.status
                      )}`}
                    >
                      {assessment.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {assessment.score ? (
                      <div>
                        <span
                          className={`text-2xl font-bold ${getScoreColor(
                            assessment.score
                          )}`}
                        >
                          {assessment.score}%
                        </span>
                        <div className="text-xs text-neutral-500">
                          <Award className="h-3 w-3 inline mr-1" />
                          {new Date(assessment.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {assessment.reviewer ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-neutral-500" />
                          <span className="text-neutral-700 font-medium">
                            {assessment.reviewer.first_name}{" "}
                            {assessment.reviewer.last_name}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          Updated:{" "}
                          {new Date(assessment.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-sm">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-neutral-700">
                      Created:{" "}
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-neutral-500">
                      Updated:{" "}
                      {new Date(assessment.updated_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                        <Eye className="h-4 w-4 text-neutral-600" />
                      </button>
                      <button className="p-2 rounded-lg border border-neutral-200 hover:border-warning-300 hover:bg-warning-50 transition-colors">
                        <Edit className="h-4 w-4 text-neutral-600" />
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

        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            {/* <Shield className="h-12 w-12 text-neutral-400 mx-auto mb-4" /> */}
            <h3 className="text-lg font-semibold text-neutral-600 mb-2">
              No Assessments Found
            </h3>
            <p className="text-neutral-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssessments;
