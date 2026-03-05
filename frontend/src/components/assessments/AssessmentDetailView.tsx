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
import { useAuth } from "../../contexts/AuthContext";

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
  questionnaire_detail?: {
    id: number;
    title: string;
    questions: any[];
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
  ai_strengths: string[];
  ai_weaknesses: string[];
  ai_generated_at: string | null;
}

interface AssessmentResponse {
  id: number;
  question: number;
  selected_options: number[];
  text_response: string | null;
  number_response: number | null;
  file_response: string | null;
  score: number;
}

interface CategoryScore {
  id: number;
  category: number;
  category_name: string;
  score: number;
  max_score: number;
  percentage: number;
}

interface Recommendation {
  id: number;
  category: number;
  category_name: string;
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
  const { user } = useAuth();
  const isAdmin =
    user?.user_type === "admin" || user?.user_type === "superadmin";
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "responses" | "scores" | "results"
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
      const assessmentData = {
        ...response.data,
        percentage_score: parseFloat(response.data.percentage_score),
        total_score: parseFloat(response.data.total_score),
        max_possible_score: parseFloat(response.data.max_possible_score),
      };

      // If enterprise details are missing or incomplete, fetch them
      if (
        !assessmentData.enterprise?.business_name &&
        assessmentData.enterprise
      ) {
        try {
          // Import enterpriseAPI if needed
          const { default: api } = await import("../../services/api");
          const enterpriseResponse = await api.get(
            `/enterprises/api/enterprises/${assessmentData.enterprise}/`,
          );
          assessmentData.enterprise = enterpriseResponse.data;
        } catch (err) {
          console.error("Error fetching enterprise details:", err);
        }
      }

      setAssessment(assessmentData);
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
        "Are you sure you want to regrade this assessment? This will recalculate all scores.",
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
                  assessment.status,
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
          {isAdmin && assessment.status === "completed" && (
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
        </div>
      </div>

      {/* Enterprise Info Card */}
      <div className="glass-effect rounded-2xl p-6 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
        <div className="glass-effect rounded-2xl p-6 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
        <div className="glass-effect rounded-2xl p-6 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
      <div className="glass-effect rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex space-x-8 px-6">
            {[
              { id: "responses", label: "Responses & Answers", icon: FileText },
              { id: "scores", label: "Category Scores", icon: BarChart3 },
              {
                id: "results",
                label: "Results & Recommendations",
                icon: Award,
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
                assessment.responses.map((response) => {
                  // Find the corresponding question from questionnaire_detail
                  const question =
                    assessment.questionnaire_detail?.questions?.find(
                      (q: any) => q.id === response.question,
                    );
                  if (!question) return null;

                  // Find recommendations for this question based on score
                  const questionRecommendations =
                    question.conditional_recommendations?.filter(
                      (rec: any) =>
                        rec.min_score <= response.score &&
                        rec.max_score >= response.score,
                    ) || [];

                  return questionRecommendations.length > 0 && (
                    <div
                      key={response.id}
                      className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">

                          {/* Question-Specific Recommendations */}
                          {questionRecommendations.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                              <div className="flex items-start gap-2 mb-2">
                                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                    Recommendation:
                                  </p>
                                  {questionRecommendations.map(
                                    (rec: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="text-sm text-blue-800 dark:text-blue-300 mb-2 last:mb-0"
                                      >
                                        {rec.recommendation_text}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
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
                        {categoryScore.category_name}
                      </h4>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {parseFloat(categoryScore.percentage as any).toFixed(1)}
                        %
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {parseFloat(categoryScore.score as any).toFixed(1)} /{" "}
                          {parseFloat(categoryScore.max_score as any).toFixed(
                            1,
                          )}{" "}
                          points
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            parseFloat(categoryScore.percentage as any) >= 75
                              ? "bg-green-500"
                              : parseFloat(categoryScore.percentage as any) >=
                                  50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: `${parseFloat(
                              categoryScore.percentage as any,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {parseFloat(categoryScore.percentage as any) >= 75 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Strong performance in this category
                          </span>
                        </>
                      ) : parseFloat(categoryScore.percentage as any) >= 50 ? (
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

          {/* Results Tab */}
          {activeTab === "results" && (
            <div className="space-y-6">
              {assessment.status === "completed" ||
              assessment.status === "reviewed" ? (
                <>
                  {/* Overall Score Card */}
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          Readiness Score
                        </h2>
                        <p className="text-primary-100">
                          Your business investment readiness assessment
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-6xl font-bold mb-2">
                          {Math.round(assessment.percentage_score)}%
                        </div>
                        <div className="text-sm text-primary-100">
                          {assessment.total_score} /{" "}
                          {assessment.max_possible_score} points
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations Section */}
                  <div className="glass-effect dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                          Recommended Actions
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Download Report
                      </button>
                    </div>

                    <div className="space-y-4">
                      {assessment.recommendations &&
                      assessment.recommendations.length > 0 ? (
                        assessment.recommendations
                          .sort((a, b) => {
                            const priorityOrder = {
                              high: 0,
                              medium: 1,
                              low: 2,
                            };
                            return (
                              (priorityOrder[
                                a.priority as keyof typeof priorityOrder
                              ] || 3) -
                              (priorityOrder[
                                b.priority as keyof typeof priorityOrder
                              ] || 3)
                            );
                          })
                          .map((rec, index) => (
                            <div
                              key={rec.id}
                              className={`p-4 rounded-xl border-2 ${
                                rec.priority === "high"
                                  ? "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800"
                                  : rec.priority === "medium"
                                    ? "border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800"
                                    : "border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                      rec.priority === "high"
                                        ? "bg-red-500 text-white"
                                        : rec.priority === "medium"
                                          ? "bg-orange-500 text-white"
                                          : "bg-blue-500 text-white"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                                      {rec.title}
                                    </h4>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        rec.priority === "high"
                                          ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                                          : rec.priority === "medium"
                                            ? "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                                            : "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                                      }`}
                                    >
                                      {rec.priority.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                                    {rec.description}
                                  </p>
                                  <div className="glass-effect dark:bg-neutral-900 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                                      Suggested Actions:
                                    </p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                      {rec.suggested_actions}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-center text-neutral-500 py-8">
                          No recommendations available yet
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Results will be available after assessment is completed
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Reviewer Modal */}
      {showAssignReviewer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6">
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
