import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Award,
  RefreshCw,
  UserCheck,
  Edit,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
} from "lucide-react";
import { assessmentAPI, adminAPI } from "../../services/api";

interface AssessmentDetail {
  id: number;
  enterprise: {
    id: number;
    business_name: string;
    sector: string;
    district: string;
    email: string;
    phone_number: string;
  };
  questionnaire: {
    id: number;
    title: string;
    category: {
      id?: number;
      name: string;
    };
    estimated_time?: number;
    question_count?: number;
  };
  status: string;
  total_score: number;
  max_possible_score: number;
  percentage_score: number;
  fiscal_year: number;
  started_at: string | null;
  completed_at: string | null;
  reviewed_at: string | null;
  reviewed_by: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
  updated_at: string;
  responses: AssessmentResponse[];
  category_scores: CategoryScore[];
  recommendations: Recommendation[];
}

interface AssessmentResponse {
  id: number;
  question: {
    id: number;
    text: string;
    question_type: string;
    max_score: number;
    order: number;
    category: {
      id: number;
      name: string;
    };
  };
  selected_options: Array<{
    id: number;
    text: string;
    score: number;
  }>;
  text_response: string | null;
  number_response: number | null;
  score: number;
}

interface CategoryScore {
  id: number;
  category: {
    id: number;
    name: string;
  };
  score: number;
  max_score: number;
  percentage: number;
}

interface Recommendation {
  id: number;
  category: {
    id: number;
    name: string;
  };
  title: string;
  description: string;
  priority: string;
  suggested_actions: string;
}

interface AdminUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

const AssessmentDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "responses" | "scores" | "recommendations"
  >("responses");
  const [showAssignReviewer, setShowAssignReviewer] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAssessmentDetails();
    fetchAdminUsers();
  }, [id]);

  const fetchAssessmentDetails = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getAssessmentById(id!);
      setAssessment({...response.data, percentage_score: parseFloat(response.data.percentage_score), total_score: parseFloat(response.data.total_score), max_possible_score: parseFloat(response.data.max_possible_score)});
    } catch (err) {
      console.error("Error fetching assessment details:", err);
      setError("Failed to load assessment details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ user_type: "admin" });
      const users = response.data.results || response.data;
      setAdminUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("Error fetching admin users:", err);
    }
  };

  const handleRegrade = async () => {
    if (
      !window.confirm(
        "Are you sure you want to regrade this assessment? This will recalculate all scores."
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      await assessmentAPI.regradeAssessment(id!);
      await fetchAssessmentDetails();
      alert("Assessment regraded successfully!");
    } catch (err) {
      console.error("Error regrading assessment:", err);
      alert("Failed to regrade assessment");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    if (!window.confirm("Mark this assessment as reviewed?")) {
      return;
    }

    try {
      setProcessing(true);
      await assessmentAPI.reviewAssessment(id!);
      await fetchAssessmentDetails();
      alert("Assessment marked as reviewed!");
    } catch (err) {
      console.error("Error marking assessment as reviewed:", err);
      alert("Failed to mark assessment as reviewed");
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedReviewer) {
      alert("Please select a reviewer");
      return;
    }

    try {
      setProcessing(true);
      await assessmentAPI.assignReviewer(id!, selectedReviewer);
      await fetchAssessmentDetails();
      setShowAssignReviewer(false);
      alert("Reviewer assigned successfully!");
    } catch (err) {
      console.error("Error assigning reviewer:", err);
      alert("Failed to assign reviewer");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return <CheckCircle2 className="h-5 w-5" />;
      case "in_progress":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (error || !assessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Assessment not found"}</p>
          <button onClick={() => navigate(-1)} className="mt-4 btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {assessment.questionnaire.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(
                  assessment.status
                )}`}
              >
                {getStatusIcon(assessment.status)}
                <span>{assessment.status.replace("_", " ").toUpperCase()}</span>
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Assessment ID: #{assessment.id} • Fiscal Year{" "}
              {assessment.fiscal_year}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {assessment.status === "completed" && (
            <>
              <button
                onClick={handleRegrade}
                disabled={processing}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${processing ? "animate-spin" : ""}`}
                />
                <span>Regrade</span>
              </button>
              <button
                onClick={() => setShowAssignReviewer(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <UserCheck className="h-4 w-4" />
                <span>Assign Reviewer</span>
              </button>
              <button
                onClick={handleMarkAsReviewed}
                disabled={processing}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark as Reviewed</span>
              </button>
            </>
          )}
          {assessment.status === "draft" && (
            <button className="btn-primary flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Assessment</span>
            </button>
          )}
        </div>
      </div>

      {/* Enterprise Info Card */}
      <div className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary-600" />
          Enterprise Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Business Name
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.business_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Sector
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.sector}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              District
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.district}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Email
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Phone
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.phone_number}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Category
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.questionnaire.category?.name || "Uncategorized"}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline & Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Created
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {formatDate(assessment.created_at)}
                </p>
              </div>
            </div>
            {assessment.started_at && (
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Started
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(assessment.started_at)}
                  </p>
                </div>
              </div>
            )}
            {assessment.completed_at && (
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Completed
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(assessment.completed_at)}
                  </p>
                </div>
              </div>
            )}
            {assessment.reviewed_at && assessment.reviewed_by && (
              <div className="flex items-start space-x-3">
                <UserCheck className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Reviewed
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(assessment.reviewed_at)} by{" "}
                    {assessment.reviewed_by.first_name}{" "}
                    {assessment.reviewed_by.last_name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overall Score */}
        <div className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary-600" />
            Overall Score
          </h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-neutral-200 dark:text-neutral-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={
                    2 * Math.PI * 56 * (1 - assessment.percentage_score / 100)
                  }
                  className={`${
                    assessment.percentage_score >= 75
                      ? "text-green-500"
                      : assessment.percentage_score >= 50
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {assessment.percentage_score.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {assessment.total_score.toFixed(1)} /{" "}
              {assessment.max_possible_score.toFixed(1)} points
            </p>
            <div className="flex items-center justify-center space-x-2">
              {assessment.percentage_score >= 75 ? (
                <>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Excellent Performance
                  </span>
                </>
              ) : assessment.percentage_score >= 50 ? (
                <>
                  <Target className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Good Performance
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Needs Improvement
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-effect rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex space-x-8 px-6">
            {[
              { id: "responses", label: "Responses & Answers", icon: FileText },
              { id: "scores", label: "Category Scores", icon: BarChart3 },
              {
                id: "recommendations",
                label: "Recommendations",
                icon: Lightbulb,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Responses Tab */}
          {activeTab === "responses" && (
            <div className="space-y-6">
              {assessment.responses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No responses yet
                  </p>
                </div>
              ) : (
                assessment.responses.map((response, index) => (
                  <div
                    key={response.id}
                    className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs font-medium rounded">
                            Q{response.question.order}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded">
                            {response.question.category.name}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {response.question.question_type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                          {response.question.text}
                        </p>

                        {/* Answer Display */}
                        <div className="mb-3">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            Answer:
                          </p>
                          {response.selected_options.length > 0 && (
                            <div className="space-y-2">
                              {response.selected_options.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded-lg"
                                >
                                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                                    {option.text}
                                  </span>
                                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                    +{option.score} pts
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {response.text_response && (
                            <p className="text-sm text-neutral-900 dark:text-neutral-100 p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              {response.text_response}
                            </p>
                          )}
                          {response.number_response !== null && (
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {response.number_response}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="ml-4 text-right">
                        <div className="px-3 py-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white shadow-lg">
                          <p className="text-xs font-medium">Score</p>
                          <p className="text-2xl font-bold">
                            {response.score}/{response.question.max_score}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Category Scores Tab */}
          {activeTab === "scores" && (
            <div className="space-y-4">
              {assessment.category_scores.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No scores calculated yet
                  </p>
                </div>
              ) : (
                assessment.category_scores.map((categoryScore) => (
                  <div
                    key={categoryScore.id}
                    className="p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {categoryScore.category.name}
                      </h4>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {categoryScore.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {categoryScore.score.toFixed(1)} /{" "}
                          {categoryScore.max_score.toFixed(1)} points
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            categoryScore.percentage >= 75
                              ? "bg-green-500"
                              : categoryScore.percentage >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${categoryScore.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {categoryScore.percentage >= 75 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Strong performance in this category
                          </span>
                        </>
                      ) : categoryScore.percentage >= 50 ? (
                        <>
                          <Target className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600 dark:text-yellow-400">
                            Room for improvement in this category
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600 dark:text-red-400">
                            Significant improvement needed
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <div className="space-y-4">
              {assessment.recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No recommendations generated yet
                  </p>
                </div>
              ) : (
                assessment.recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            {recommendation.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              recommendation.priority
                            )}`}
                          >
                            {recommendation.priority.toUpperCase()}
                          </span>
                        </div>
                        <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded mb-3">
                          {recommendation.category.name}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      {recommendation.description}
                    </p>

                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase mb-2">
                        Suggested Actions
                      </p>
                      <p className="text-sm text-neutral-900 dark:text-neutral-100">
                        {recommendation.suggested_actions}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Reviewer Modal */}
      {showAssignReviewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Assign Reviewer
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Select Reviewer
                </label>
                <select
                  value={selectedReviewer || ""}
                  onChange={(e) =>
                    setSelectedReviewer(parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="">Select a reviewer...</option>
                  {adminUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAssignReviewer(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignReviewer}
                  disabled={processing || !selectedReviewer}
                  className="btn-primary disabled:opacity-50"
                >
                  {processing ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentDetailView;
