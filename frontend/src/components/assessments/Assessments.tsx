import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Plus,
  Eye,
  AlertCircle,
} from "lucide-react";
import { assessmentAPI } from "../../services/api";

interface Assessment {
  id: number;
  title: string;
  status: string;
  score: number | null;
  created_at: string;
  updated_at: string;
  questionnaire: {
    title: string;
    category: {
      name: string;
    };
  };
}

const Assessments: React.FC = () => {
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
      setError(null);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Failed to load assessments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-100 text-success-800 border-success-200 dark:bg-success-900/30 dark:text-success-300 dark:border-success-700";
      case "in_progress":
        return "bg-warning-100 text-warning-800 border-warning-200 dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-700";
      case "pending":
        return "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-neutral-400 dark:text-neutral-500";
    if (score >= 80) return "text-success-600 dark:text-success-400";
    if (score >= 60) return "text-warning-600 dark:text-warning-400";
    return "text-error-600 dark:text-error-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {error}
          </h3>
          <button onClick={fetchAssessments} className="mt-4 btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 fade-in">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900">
            My Assessments
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            View your completed assessments and track your progress
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Total
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {assessments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Completed
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {assessments.filter((a) => a.status === "completed").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                In Progress
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {assessments.filter((a) => a.status === "in_progress").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Avg Score
              </p>
              <p className="text-2xl font-bold text-success-600">
                {assessments.length > 0
                  ? Math.round(
                      assessments.reduce(
                        (acc, curr) => acc + (curr.score || 0),
                        0
                      ) / assessments.filter((a) => a.score).length || 0
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments List */}
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">
          Your Assessments
        </h2>

        {assessments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900">
              No assessments found
            </h3>
            <p className="text-neutral-500 mt-2 mb-6">
              Get started by creating your first assessment.
            </p>
            <Link to="/assessments/start" className="btn-primary inline-flex">
              <Plus className="h-5 w-5 mr-2" />
              Start Assessment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-6 border-2 border-neutral-200 rounded-xl card-hover"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {assessment.title || assessment.questionnaire.title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          assessment.status
                        )}`}
                      >
                        {assessment.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {assessment.questionnaire.category.name} •{" "}
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {assessment.score !== null && (
                    <div className="text-right">
                      <p className="text-sm text-neutral-500">Score</p>
                      <p
                        className={`text-xl font-bold ${getScoreColor(
                          assessment.score
                        )}`}
                      >
                        {assessment.score}%
                      </p>
                    </div>
                  )}
                  {assessment.status === "completed" ? (
                    <Link
                      to={`/assessments/${assessment.id}`}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/assessments/${assessment.id}/take`}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>
                        {assessment.status === "in_progress"
                          ? "Continue"
                          : "Start"}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessments;
