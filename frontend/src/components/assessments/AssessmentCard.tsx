import React from "react";
import { Link } from "react-router-dom";
import { Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface AssessmentCardProps {
  assessment: {
    id: number;
    title: string;
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
    enterprise?: {
      id: number;
      business_name: string;
    };
    status: "draft" | "in_progress" | "completed" | "reviewed";
    score?: number;
    created_at: string;
    updated_at: string;
  };
  showEnterprise?: boolean;
  onAction?: (action: string, id: number) => void;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  showEnterprise = false,
  onAction,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "draft":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            to={`/assessments/${assessment.id}`}
            className="text-lg font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {assessment.questionnaire.title}
          </Link>
          {showEnterprise && assessment.enterprise && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {assessment.enterprise.business_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(
              assessment.status
            )}`}
          >
            {getStatusIcon(assessment.status)}
            {assessment.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
          <FileText className="w-4 h-4 mr-2" />
          <span className="font-medium">
            Category: {assessment.questionnaire.category.name}
          </span>
        </div>
        {assessment.questionnaire.question_count && (
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <FileText className="w-4 h-4 mr-2" />
            <span>{assessment.questionnaire.question_count} Questions</span>
          </div>
        )}
        {assessment.questionnaire.estimated_time && (
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <Clock className="w-4 h-4 mr-2" />
            <span>~{assessment.questionnaire.estimated_time} minutes</span>
          </div>
        )}
      </div>

      {assessment.score !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-neutral-600 dark:text-neutral-400">
              Readiness Score
            </span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              {assessment.score.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                assessment.score >= 75
                  ? "bg-green-500"
                  : assessment.score >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${assessment.score}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {formatDate(assessment.updated_at)}
        </span>
        <Link
          to={`/assessments/${assessment.id}`}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default AssessmentCard;
