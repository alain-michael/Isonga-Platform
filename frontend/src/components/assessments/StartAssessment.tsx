import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ChevronRight, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { assessmentAPI } from "../../services/api";

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  language: string;
  category: {
    id: number;
    name: string;
  };
  questions_count?: number;
  estimated_time?: number;
}

const StartAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getQuestionnaires();
      const allQuestionnaires = response.data?.results || response.data || [];

      // Filter questionnaires to show only those matching current language
      const currentLang = i18n.language;
      const filtered = allQuestionnaires.filter(
        (q: Questionnaire) => q.language === currentLang
      );

      // If no questionnaires match current language, show all (fallback)
      setQuestionnaires(filtered.length > 0 ? filtered : allQuestionnaires);
    } catch (err) {
      console.error("Error fetching questionnaires:", err);
      setError("Failed to load questionnaires");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async (questionnaireId: number) => {
    try {
      setCreating(true);
      // Create a new assessment instance
      const response = await assessmentAPI.createAssessment({
        questionnaire: questionnaireId,
      });

      const assessmentId = response.data.id;
      // Navigate to take the assessment
      navigate(`/assessments/${assessmentId}/take`);
    } catch (err) {
      console.error("Error creating assessment:", err);
      alert("Failed to start assessment. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/assessments")}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assessments
        </button>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Start New Assessment
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Choose an assessment to evaluate your business readiness
        </p>
      </div>

      {/* Questionnaires List */}
      <div className="space-y-4">
        {questionnaires.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              No Assessments Available
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              There are no assessment questionnaires available at the moment.
            </p>
          </div>
        ) : (
          questionnaires.map((questionnaire) => (
            <div
              key={questionnaire.id}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 hover:border-primary-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {questionnaire.title}
                      </h3>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {questionnaire.category?.name || "General"}
                      </span>
                    </div>
                  </div>

                  <p className="text-neutral-600 dark:text-neutral-300 mb-4 ml-12">
                    {questionnaire.description ||
                      "Complete this assessment to evaluate your business readiness."}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 ml-12">
                    {questionnaire.questions_count && (
                      <span>{questionnaire.questions_count} questions</span>
                    )}
                    {questionnaire.estimated_time && (
                      <span>~{questionnaire.estimated_time} minutes</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleStartAssessment(questionnaire.id)}
                  disabled={creating}
                  className="btn-primary flex items-center gap-2 ml-4"
                >
                  {creating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Start Assessment
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          What to expect
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              Answer questions about your business operations and readiness
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>You can save your progress and continue later</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              After submission, you'll receive a detailed readiness score and
              recommendations
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StartAssessment;
