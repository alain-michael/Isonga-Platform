import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Eye,
  Download,
  MoreVertical,
  Calendar,
  User,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  RefreshCw,
  FileBarChart,
  TrendingUp,
  MapPin,
  FileText,
  PlayCircle,
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
  const { t } = useTranslation();
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
      setAssessments(response.data?.results || []);
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
        return "bg-success-100 text-success-800 border-success-200 dark:bg-success-900/30 dark:text-success-300 dark:border-success-700";
      case "reviewed":
        return "bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700";
      case "in_review":
        return "bg-secondary-100 text-secondary-800 border-secondary-200 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-700";
      case "pending_review":
        return "bg-warning-100 text-warning-800 border-warning-200 dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-700";
      case "draft":
        return "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-neutral-400 dark:text-neutral-500";
    if (score >= 85) return "text-success-600 dark:text-success-400";
    if (score >= 70) return "text-warning-600 dark:text-warning-400";
    return "text-error-600 dark:text-error-400";
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.enterprise?.business_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.enterprise?.sector
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.enterprise?.district
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.questionnaire?.category?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assessment.status === statusFilter;
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-4 text-lg text-neutral-600 dark:text-neutral-400">
            {t("common.loading")}
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
                  {t("common.error")}
                </h3>
                <p className="text-error-700 dark:text-error-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
            <button onClick={fetchAssessments} className="btn-primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {t("admin.manageAssessments")}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Review and manage all enterprise assessments
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={fetchAssessments} className="btn-secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh")}
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>{t("common.export")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 slide-up">
        <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25">
              <FileBarChart className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-xs lg:text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Total
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.totalAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-neutral-400/10 to-neutral-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center">
            <div className="p-3 bg-gradient-to-br from-neutral-400 to-neutral-500 rounded-xl shadow-lg shadow-neutral-400/25">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-xs lg:text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Draft
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-neutral-500 dark:text-neutral-400">
                {stats.draft}
              </p>
            </div>
          </div>
        </div>

        <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-warning-500/10 to-warning-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg shadow-warning-500/25">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-xs lg:text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                In Progress
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-warning-600 dark:text-warning-400">
                {stats.inProgress}
              </p>
            </div>
          </div>
        </div>

        <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-success-500/10 to-success-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <div className="relative flex items-center">
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg shadow-success-500/25">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-xs lg:text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Completed
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-success-600 dark:text-success-400">
                {stats.completed}
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
              placeholder={t("common.search") + "..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 min-w-[160px]"
              >
                <option value="all">{t("common.all")} Status</option>
                <option value="draft">{t("assessment.draft")}</option>
                <option value="in_progress">
                  {t("assessment.inProgress")}
                </option>
                <option value="completed">{t("assessment.completed")}</option>
                <option value="reviewed">{t("assessment.reviewed")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="glass-effect rounded-2xl shadow-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Assessment Details
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {filteredAssessments.length} of {assessments.length} assessments
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-neutral-500">
            <TrendingUp className="h-4 w-4 text-success-500" />
            <span>
              Avg Score:{" "}
              {assessments.filter((a) => a.score).length > 0
                ? Math.round(
                    assessments
                      .filter((a) => a.score)
                      .reduce((acc, a) => acc + (a.score || 0), 0) /
                      assessments.filter((a) => a.score).length
                  )
                : 0}
              %
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-800">
                <th className="text-left py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300">
                  {t("enterprise.title")}
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300">
                  {t("assessment.title")}
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300">
                  {t("common.status")}
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300">
                  {t("assessment.score")}
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300">
                  {t("assessment.reviewer")}
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300">
                  {t("common.date")}
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {filteredAssessments.map((assessment, index) => (
                <tr
                  key={assessment.id}
                  className="group hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent dark:hover:from-primary-900/10 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-5 px-6">
                    <div className="flex items-start space-x-3">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {assessment.enterprise?.business_name}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            {assessment.enterprise?.sector}
                          </span>
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="inline-flex items-center text-xs text-neutral-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {assessment.enterprise?.district}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div>
                      <div className="font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                        {assessment.questionnaire?.title}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium">
                          {assessment.questionnaire?.category?.name ||
                            "General"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        assessment.status
                      )}`}
                    >
                      {assessment.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    {assessment.score ? (
                      <div className="flex items-center space-x-3">
                        <div className="relative h-12 w-12">
                          <svg className="h-12 w-12 transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              className="stroke-neutral-200 dark:stroke-neutral-700"
                              strokeWidth="4"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              className={`${
                                assessment.score >= 85
                                  ? "stroke-success-500"
                                  : assessment.score >= 70
                                  ? "stroke-warning-500"
                                  : "stroke-error-500"
                              }`}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={`${
                                (assessment.score / 100) * 125.6
                              } 125.6`}
                            />
                          </svg>
                          <span
                            className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getScoreColor(
                              assessment.score
                            )}`}
                          >
                            {assessment.score}
                          </span>
                        </div>
                        <div>
                          <div
                            className={`text-sm font-semibold ${getScoreColor(
                              assessment.score
                            )}`}
                          >
                            {assessment.score >= 85
                              ? "Excellent"
                              : assessment.score >= 70
                              ? "Good"
                              : "Needs Work"}
                          </div>
                          <div className="flex items-center text-xs text-neutral-400">
                            <Award className="h-3 w-3 mr-1" />
                            Scored
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-neutral-400" />
                        </div>
                        <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium">
                          Pending
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-6">
                    {assessment.reviewer ? (
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-secondary-400/20">
                          {assessment.reviewer.first_name?.charAt(0)}
                          {assessment.reviewer.last_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {assessment.reviewer.first_name}{" "}
                            {assessment.reviewer.last_name}
                          </div>
                          <div className="text-xs text-neutral-400">
                            Reviewer
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                          <User className="h-4 w-4 text-neutral-400" />
                        </div>
                        <span className="text-neutral-400 dark:text-neutral-500 text-sm italic">
                          Unassigned
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                        {new Date(assessment.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </div>
                      <div className="text-xs text-neutral-400">
                        Updated{" "}
                        {new Date(assessment.updated_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/admin/assessments/${assessment.id}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                      <button
                        className="p-2 rounded-lg hover:bg-warning-50 dark:hover:bg-warning-900/20 text-neutral-500 hover:text-warning-600 dark:hover:text-warning-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                        title="More"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssessments.length === 0 && (
          <div className="py-16 px-6 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileBarChart className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              {t("common.noResults")}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
              We couldn't find any assessments matching your criteria. Try
              adjusting your search or filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssessments;
