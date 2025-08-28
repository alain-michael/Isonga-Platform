import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Plus,
  Eye,
} from "lucide-react";

const Assessments: React.FC = () => {
  // Mock data for demonstration
  const assessments = [
    {
      id: 1,
      title: "Financial Assessment 2024",
      status: "completed",
      score: 85,
      date: "2024-08-20",
      type: "Financial",
    },
    {
      id: 2,
      title: "Operations Assessment 2024",
      status: "in_progress",
      score: null,
      date: "2024-08-25",
      type: "Operations",
    },
    {
      id: 3,
      title: "Market Analysis 2024",
      status: "pending",
      score: null,
      date: "2024-08-26",
      type: "Market",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "in_progress":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "pending":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-neutral-400";
    if (score >= 80) return "text-success-600";
    if (score >= 60) return "text-warning-600";
    return "text-error-600";
  };

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
        <div className="flex space-x-4">
          <Link
            to="/assessments/create"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Assessment</span>
          </Link>
          <Link
            to="/assessments/manage"
            className="btn-secondary flex items-center space-x-2"
          >
            <FileText className="h-5 w-5" />
            <span>Manage Created</span>
          </Link>
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
              <p className="text-2xl font-bold text-success-600">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments List */}
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">
          Your Assessments
        </h2>

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
                    {assessment.title}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        assessment.status
                      )}`}
                    >
                      {assessment.status.replace("_", " ")}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {assessment.type} • {assessment.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {assessment.score && (
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
                <button className="btn-primary flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
