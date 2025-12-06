import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useQuestionnaires, useDeleteQuestionnaire } from "../../hooks";
import QuestionnaireCard from "../assessments/QuestionnaireCard";

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  category: {
    id?: number;
    name: string;
  };
  questions: any[];
  question_count?: number;
  estimated_time?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  language?: string;
}

const AdminQuestionnaires: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const {
    data: questionnaires = [],
    isLoading,
    error,
    refetch,
  } = useQuestionnaires();
  const deleteMutation = useDeleteQuestionnaire();

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        alert("Questionnaire deleted successfully");
      } catch (err) {
        alert("Failed to delete questionnaire");
      }
    }
  };

  const filteredQuestionnaires = questionnaires.filter(
    (q: Questionnaire) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading questionnaires...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">Failed to load questionnaires</p>
          <button onClick={() => refetch()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Questionnaire Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Create and manage sector-specific assessment questionnaires
          </p>
        </div>
        <Link
          to="/admin/questionnaires/create"
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus className="h-4 w-4" />
          Create New Questionnaire
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="glass-effect p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search questionnaires..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Questionnaires Grid - For Mobile/Tablet use QuestionnaireCard */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestionnaires.map((q: Questionnaire) => (
            <QuestionnaireCard
              key={q.id}
              questionnaire={q}
              actionButton={
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/questionnaires/create?edit=${q.id}`);
                    }}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    <Edit className="h-4 w-4 mr-2 inline" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(q.id, q.title);
                    }}
                    className="flex-1 btn-secondary text-sm py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2 inline" />
                    Delete
                  </button>
                </div>
              }
            />
          ))}
        </div>
      </div>

      {/* Questionnaires List - Desktop View with Expandable Details */}
      <div className="hidden lg:block space-y-4">
        {filteredQuestionnaires.map((q: Questionnaire) => (
          <div
            key={q.id}
            className="glass-effect rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            <div
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              onClick={() => toggleExpand(q.id)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                      {q.title}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {q.category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {q.question_count || q.questions?.length || 0} Questions
                    </span>
                    {q.estimated_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />~
                        {formatTime(q.estimated_time)}
                      </span>
                    )}
                    <span>•</span>
                    <span>Updated {formatDate(q.updated_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    q.is_active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                  }`}
                >
                  {q.is_active ? "Active" : "Draft"}
                </span>
                {expandedId === q.id ? (
                  <ChevronUp className="h-5 w-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                )}
              </div>
            </div>

            {expandedId === q.id && (
              <div className="px-6 pb-6 pt-0 border-t border-neutral-100 dark:border-neutral-700">
                <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                    {q.description}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/questionnaires/create?edit=${q.id}`)
                      }
                      className="btn-secondary text-sm py-2"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, q.title)}
                      className="btn-secondary text-sm py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {q.questions && q.questions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm mb-2">
                      Questions Preview:
                    </h4>
                    {q.questions
                      .slice(0, 3)
                      .map((question: any, idx: number) => (
                        <div
                          key={question.id || idx}
                          className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
                        >
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">
                            {idx + 1}. {question.text}
                          </p>
                        </div>
                      ))}
                    {q.questions.length > 3 && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-3">
                        +{q.questions.length - 3} more questions
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredQuestionnaires.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              No questionnaires found
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              {searchTerm
                ? "Try adjusting your search"
                : "Create your first questionnaire to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionnaires;
