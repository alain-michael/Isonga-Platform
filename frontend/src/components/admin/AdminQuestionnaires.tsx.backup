import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { assessmentAPI } from "../../services/api";

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  category: {
    name: string;
  };
  questions: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminQuestionnaires: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getQuestionnaires();
      setQuestionnaires(response.data?.results || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching questionnaires:", err);
      setError("Failed to load questionnaires");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
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
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchQuestionnaires} className="btn-primary">
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
            Create and edit sector-specific assessment questions.
          </p>
        </div>
        <Link
          to="/admin/questionnaires/create"
          className="btn-primary flex items-center gap-2"
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
        <button onClick={fetchQuestionnaires} className="btn-secondary">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Questionnaires List */}
      <div className="space-y-4">
        {questionnaires.map((q) => (
          <div
            key={q.id}
            className="glass-effect rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            <div
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              onClick={() => toggleExpand(q.id)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                    {q.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-neutral-500">
                    <span>{q.category?.name || "General"}</span>
                    <span>•</span>
                    <span>{q.questions?.length || 0} Questions</span>
                    <span>•</span>
                    <span>
                      Updated {new Date(q.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    q.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
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
                <div className="mt-4 flex justify-end gap-2 mb-4">
                  <button
                    onClick={() => navigate(`/assessments/create?edit=${q.id}`)}
                    className="btn-secondary text-sm py-1.5"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button className="btn-secondary text-sm py-1.5 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
                <div className="space-y-3">
                  {q.questions?.map((question: any, idx: number) => (
                    <div
                      key={question.id}
                      className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-100 dark:border-neutral-700"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {idx + 1}. {question.text}
                        </span>
                        <span className="text-xs text-neutral-500 uppercase">
                          {question.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!q.questions || q.questions.length === 0) && (
                    <p className="text-neutral-500 text-sm italic">
                      No questions added yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {questionnaires.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              No questionnaires found
            </h3>
            <p className="text-neutral-500 mt-2">
              Create your first questionnaire to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionnaires;
