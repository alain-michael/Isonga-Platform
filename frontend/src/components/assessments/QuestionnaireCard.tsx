import React from "react";
import { Link } from "react-router-dom";
import { Clock, FileText, Tag } from "lucide-react";

interface QuestionnaireCardProps {
  questionnaire: {
    id: number;
    title: string;
    description: string;
    category: {
      id?: number;
      name: string;
    };
    estimated_time?: number;
    question_count?: number;
    is_active: boolean;
    language?: string;
  };
  onSelect?: (id: number) => void;
  actionButton?: React.ReactNode;
}

const QuestionnaireCard: React.FC<QuestionnaireCardProps> = ({
  questionnaire,
  onSelect,
  actionButton,
}) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div
      className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onSelect && onSelect(questionnaire.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              {questionnaire.category?.name || "Uncategorized"}
            </span>
            {!questionnaire.is_active && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full">
                Draft
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {questionnaire.title}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {questionnaire.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {questionnaire.question_count !== undefined && (
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <FileText className="w-4 h-4 mr-1.5" />
            <span>{questionnaire.question_count} Questions</span>
          </div>
        )}
        {questionnaire.estimated_time !== undefined && (
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <Clock className="w-4 h-4 mr-1.5" />
            <span>~{formatTime(questionnaire.estimated_time)}</span>
          </div>
        )}
      </div>

      {actionButton ? (
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
          {actionButton}
        </div>
      ) : (
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Link
            to={`/assessments/create?questionnaire=${questionnaire.id}`}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Start Assessment →
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireCard;
