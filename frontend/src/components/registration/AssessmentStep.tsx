import React, { useState, useEffect } from "react";
import { assessmentAPI } from "../../services/api";
import type { BusinessProfile } from "./BusinessRegistrationFlow";
import {
  FileText,
  ChevronRight,
  Loader,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

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

interface CreatedAssessment {
  id: number;
  questionnaire: number;
  status: string;
}

interface AssessmentStepProps {
  onComplete: (completedAssessments: number[]) => void;
  businessProfile: BusinessProfile;
}

const AssessmentStep: React.FC<AssessmentStepProps> = ({ onComplete }) => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [createdAssessments, setCreatedAssessments] = useState<
    CreatedAssessment[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    setLoading(true);
    try {
      const response = await assessmentAPI.getQuestionnaires();
      const allQuestionnaires = response.data?.results || response.data || [];
      setQuestionnaires(allQuestionnaires);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
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
      // Store the created assessment
      setCreatedAssessments((prev) => [...prev, response.data]);
      // Navigate to take the assessment - using replace to avoid back button issues
      window.location.href = `/assessments/${assessmentId}/take`;
    } catch (err) {
      console.error("Error creating assessment:", err);
      alert("Failed to start assessment. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleContinue = () => {
    // Get all completed assessment IDs
    const completedIds = createdAssessments.map((a) => a.questionnaire);
    onComplete(completedIds);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-neutral-200 border-t-primary-600"></div>
          <span className="ml-2 text-neutral-600">Loading assessments...</span>
        </div>
      </div>
    );
  }

  const completedQuestionnaireIds = createdAssessments.map(
    (a) => a.questionnaire
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Complete Your Assessments
        </h2>
        <p className="text-neutral-600 mb-6">
          Choose an assessment to evaluate your business readiness. Complete at
          least one assessment to continue.
        </p>

        {/* Progress Indicator */}
        {createdAssessments.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  {createdAssessments.length} assessment
                  {createdAssessments.length !== 1 ? "s" : ""} started
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Complete your assessment(s) then return here to continue
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assessments List */}
      <div className="space-y-4 mb-8">
        {questionnaires.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              No Assessments Available
            </h3>
            <p className="text-neutral-500">
              There are no assessment questionnaires available at the moment.
            </p>
          </div>
        ) : (
          questionnaires.map((questionnaire) => {
            const isStarted = completedQuestionnaireIds.includes(
              questionnaire.id
            );
            return (
              <div
                key={questionnaire.id}
                className={`border rounded-2xl p-6 transition-all ${
                  isStarted
                    ? "border-green-300 bg-green-50"
                    : "border-neutral-200 hover:border-primary-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          isStarted ? "bg-green-100" : "bg-primary-100"
                        }`}
                      >
                        {isStarted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900">
                          {questionnaire.title}
                        </h3>
                        <span className="text-sm text-neutral-500">
                          {questionnaire.category?.name || "General"}
                        </span>
                      </div>
                    </div>

                    <p className="text-neutral-600 mb-4 ml-12">
                      {questionnaire.description ||
                        "Complete this assessment to evaluate your business readiness."}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-neutral-500 ml-12">
                      {questionnaire.questions_count && (
                        <span>{questionnaire.questions_count} questions</span>
                      )}
                      {questionnaire.estimated_time && (
                        <span>~{questionnaire.estimated_time} minutes</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {isStarted ? (
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <CheckCircle className="h-4 w-4" />
                          Started
                        </div>
                        <button
                          onClick={() =>
                            handleStartAssessment(questionnaire.id)
                          }
                          disabled={creating}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          Continue
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartAssessment(questionnaire.id)}
                        disabled={creating}
                        className="btn-primary flex items-center gap-2"
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
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h4 className="font-semibold text-blue-900 mb-3">What to expect</h4>
        <ul className="space-y-2 text-sm text-blue-800">
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
            <span>After completion, return here to finish registration</span>
          </li>
        </ul>
      </div>

      {/* Continue Button */}
      {createdAssessments.length > 0 && (
        <div className="flex justify-end pt-6 border-t border-neutral-200">
          <button
            onClick={handleContinue}
            className="btn-primary flex items-center gap-2"
          >
            Continue to Complete Registration
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentStep;
