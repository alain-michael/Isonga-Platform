import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  BarChart3,
  CheckCircle2,
  FileQuestion,
  Activity,
  Languages,
} from "lucide-react";
import { useQuestionnaires, useDeleteQuestionnaire } from "../../hooks";
import QuestionnaireCard from "../assessments/QuestionnaireCard";
import { assessmentAPI } from "../../services/api";

const AdminQuestionnaires: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [duplicating, setDuplicating] = useState(false);

  const { data: questionnaires = [], isLoading, error } = useQuestionnaires();
  const deleteMutation = useDeleteQuestionnaire();

  const LANGUAGES = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
    { code: "sw", name: "Swahili", flag: "🇹🇿" },
  ];

  const filteredQuestionnaires = questionnaires.filter((q: any) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filterCategory || q.category?.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(questionnaires.map((q: any) => q.category?.name).filter(Boolean))
  );

  // Calculate stats
  const stats = useMemo(() => {
    const total = questionnaires.length;
    const active = questionnaires.filter((q: any) => q.is_active).length;
    const draft = total - active;
    const totalQuestions = questionnaires.reduce(
      (sum: number, q: any) => sum + (q.question_count || 0),
      0
    );
    const avgTime =
      total > 0
        ? Math.round(
            questionnaires.reduce(
              (sum: number, q: any) => sum + (q.estimated_time_minutes || 0),
              0
            ) / total
          )
        : 0;

    return { total, active, draft, totalQuestions, avgTime };
  }, [questionnaires]);

  const handleDelete = async (id: number, title: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err.response?.data?.error || "Failed to delete questionnaire");
      }
    }
  };

  const handleDuplicateAsTranslation = (questionnaire: any) => {
    setSelectedQuestionnaire(questionnaire);
    setTargetLanguage("");
    setShowTranslateModal(true);
  };

  const handleCreateTranslation = async () => {
    if (!targetLanguage || !selectedQuestionnaire) return;

    try {
      setDuplicating(true);
      // Fetch full questionnaire details with questions
      const response = await assessmentAPI.getQuestionnaire(
        selectedQuestionnaire.id.toString()
      );
      const fullQuestionnaire = response.data;

      // Create a new questionnaire with the same structure but different language
      const translatedData = {
        title: `${fullQuestionnaire.title} (${
          LANGUAGES.find((l) => l.code === targetLanguage)?.name
        })`,
        description: fullQuestionnaire.description,
        category: fullQuestionnaire.category?.id,
        language: targetLanguage,
        target_sectors: fullQuestionnaire.target_sectors || [],
        target_enterprise_sizes:
          fullQuestionnaire.target_enterprise_sizes || [],
        target_districts: fullQuestionnaire.target_districts || [],
        min_employees: fullQuestionnaire.min_employees,
        max_employees: fullQuestionnaire.max_employees,
        questions:
          fullQuestionnaire.questions?.map((q: any) => ({
            text: q.text, // Admin will translate this manually
            question_type: q.question_type,
            is_required: q.is_required,
            max_score: q.max_score,
            category: q.category,
            order: q.order,
            options:
              q.options?.map((opt: any) => ({
                text: opt.text, // Admin will translate this manually
                score: opt.score,
                order: opt.order,
              })) || [],
          })) || [],
      };

      const createResponse = await assessmentAPI.createQuestionnaire(
        translatedData
      );

      // Navigate to edit the new questionnaire for translation
      navigate(`/admin/questionnaires/create?edit=${createResponse.data.id}`);
      setShowTranslateModal(false);
    } catch (err: any) {
      console.error("Error creating translation:", err);
      alert(err.response?.data?.error || "Failed to create translation");
    } finally {
      setDuplicating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect rounded-2xl p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-red-800 dark:text-red-200">
          Error loading questionnaires: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Multi-language Info Banner */}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Manage Questionnaires
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Create and manage assessment questionnaires for enterprises
          </p>
        </div>
        <Link
          to="/admin/questionnaires/create"
          className="btn-primary inline-flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Questionnaire
        </Link>
      </div>
      <div className="glass-effect rounded-2xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Languages className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Multi-Language Support
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Create questionnaires in different languages for enterprises.
              Click the <Languages className="inline h-4 w-4" /> icon to
              duplicate a questionnaire for translation. Users will
              automatically see questionnaires matching their selected language.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass-effect rounded-2xl p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider">
              Total
            </span>
          </div>
          <div className="text-3xl font-bold text-primary-900 dark:text-primary-100">
            {stats.total}
          </div>
          <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
            Questionnaires
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
              Active
            </span>
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
            {stats.active}
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Published
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-700/50 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-500 flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Draft
            </span>
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats.draft}
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
            In Progress
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              Questions
            </span>
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {stats.totalQuestions}
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
            Total Questions
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider">
              Avg Time
            </span>
          </div>
          <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            {stats.avgTime}
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            Minutes
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search questionnaires by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="relative sm:w-64">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none appearance-none cursor-pointer transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(searchTerm || filterCategory) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {filteredQuestionnaires.length} of {questionnaires.length}{" "}
              questionnaires
            </p>
            {(searchTerm || filterCategory) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("");
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Questionnaires List */}
      {filteredQuestionnaires.length === 0 ? (
        <div className="glass-effect rounded-2xl p-16 text-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
            {searchTerm || filterCategory
              ? "No questionnaires found"
              : "No questionnaires yet"}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
            {searchTerm || filterCategory
              ? "Try adjusting your search or filter criteria to find what you're looking for"
              : "Get started by creating your first questionnaire to assess enterprises"}
          </p>
          {!searchTerm && !filterCategory && (
            <Link
              to="/admin/questionnaires/create"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Questionnaire
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: Card Layout */}
          <div className="sm:hidden space-y-4">
            {filteredQuestionnaires.map((questionnaire: any) => (
              <QuestionnaireCard
                key={questionnaire.id}
                questionnaire={questionnaire}
                actionButton={
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Language:
                      </span>
                      <span className="text-xl">
                        {LANGUAGES.find(
                          (l) => l.code === questionnaire.language
                        )?.flag || "🌐"}
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {
                          LANGUAGES.find(
                            (l) => l.code === questionnaire.language
                          )?.name
                        }
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleDuplicateAsTranslation(questionnaire)
                        }
                        className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Languages className="h-4 w-4" />
                        Translate
                      </button>
                      <Link
                        to={`/admin/questionnaires/create?edit=${questionnaire.id}`}
                        className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(questionnaire.id, questionnaire.title)
                        }
                        className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                }
              />
            ))}
          </div>

          {/* Desktop: Enhanced Table Layout */}
          <div className="hidden sm:block glass-effect rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-b-2 border-neutral-200 dark:border-neutral-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Questionnaire
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Est. Time
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {filteredQuestionnaires.map((questionnaire: any) => (
                    <React.Fragment key={questionnaire.id}>
                      <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-700/30 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="max-w-md">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {questionnaire.title}
                              </div>
                              <span
                                className="text-lg"
                                title={
                                  LANGUAGES.find(
                                    (l) => l.code === questionnaire.language
                                  )?.name
                                }
                              >
                                {LANGUAGES.find(
                                  (l) => l.code === questionnaire.language
                                )?.flag || "🌐"}
                              </span>
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {questionnaire.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {questionnaire.category?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold">
                            {questionnaire.question_count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium">
                            <Clock className="h-4 w-4 text-orange-500" />
                            {questionnaire.estimated_time_minutes || 0}m
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                              questionnaire.is_active
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                            }`}
                          >
                            {questionnaire.is_active ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <FileQuestion className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === questionnaire.id
                                    ? null
                                    : questionnaire.id
                                )
                              }
                              className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                              title="Toggle details"
                            >
                              {expandedId === questionnaire.id ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleDuplicateAsTranslation(questionnaire)
                              }
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Duplicate as translation"
                            >
                              <Languages className="h-5 w-5" />
                            </button>
                            <Link
                              to={`/admin/questionnaires/create?edit=${questionnaire.id}`}
                              className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                              title="Edit questionnaire"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() =>
                                handleDelete(
                                  questionnaire.id,
                                  questionnaire.title
                                )
                              }
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete questionnaire"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === questionnaire.id && (
                        <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-700/50">
                          <td colSpan={6} className="px-6 py-6">
                            <div className="max-w-3xl space-y-3">
                              <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Full Description
                              </h4>
                              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                {questionnaire.description}
                              </p>
                              {questionnaire.target_sectors?.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-400 mb-1">
                                    Target Sectors:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {questionnaire.target_sectors.map(
                                      (sector: string) => (
                                        <span
                                          key={sector}
                                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium"
                                        >
                                          {sector}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Translation Modal */}
      {showTranslateModal && selectedQuestionnaire && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Languages className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Create Translation
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Duplicate questionnaire for translation
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Original Questionnaire
                </label>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {selectedQuestionnaire.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Current Language:{" "}
                    {
                      LANGUAGES.find(
                        (l) => l.code === selectedQuestionnaire.language
                      )?.flag
                    }{" "}
                    {
                      LANGUAGES.find(
                        (l) => l.code === selectedQuestionnaire.language
                      )?.name
                    }
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Target Language *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.filter(
                    (lang) => lang.code !== selectedQuestionnaire.language
                  ).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setTargetLanguage(lang.code)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        targetLanguage === lang.code
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      <div className="text-2xl mb-1">{lang.flag}</div>
                      <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        {lang.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> This will create a duplicate with the
                  same structure. You'll be redirected to edit and translate all
                  questions and options.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => setShowTranslateModal(false)}
                  disabled={duplicating}
                  className="flex-1 px-4 py-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTranslation}
                  disabled={!targetLanguage || duplicating}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {duplicating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create & Translate"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionnaires;
