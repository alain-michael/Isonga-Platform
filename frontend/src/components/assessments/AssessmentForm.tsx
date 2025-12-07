import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, FileText, AlertCircle } from "lucide-react";
import { assessmentAPI } from "../../services/api";

interface QuestionOption {
  id: number;
  text: string;
  score: number;
  order: number;
}

interface Question {
  id: number;
  text: string;
  question_type: string;
  is_required: boolean;
  options?: QuestionOption[];
}

interface Assessment {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  status: string;
}

const AssessmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<
    Record<number, { value: any; id?: number }>
  >({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAssessment(id);
    }
  }, [id]);

  const fetchAssessment = async (assessmentId: string) => {
    try {
      setIsLoading(true);
      const response = await assessmentAPI.getAssessment(assessmentId);
      const data = response.data;

      // Use questionnaire_detail which now includes full questions and options
      const formattedAssessment = {
        id: data.id,
        title:
          data.questionnaire_detail?.title ||
          data.questionnaire_title ||
          data.title,
        description: data.questionnaire_detail?.description || "",
        questions: data.questionnaire_detail?.questions || [],
        status: data.status,
      };

      setAssessment(formattedAssessment);

      // Load existing responses if any
      if (data.responses && data.responses.length > 0) {
        const initialResponses: Record<number, { value: any; id?: number }> =
          {};
        data.responses.forEach((r: any) => {
          initialResponses[r.question] = { value: r.value, id: r.id };
        });
        setResponses(initialResponses);
      }
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError("Failed to load assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (questionId: number, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], value },
    }));
  };

  const prepareResponsesForSave = () => {
    // Convert responses object to array format for API
    return Object.entries(responses).map(([questionId, data]) => ({
      question: parseInt(questionId),
      value: data.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsLoading(true);
    try {
      const responsesData = prepareResponsesForSave();
      await assessmentAPI.submitAssessment(id, responsesData);
      // Navigate to results page after successful submission
      navigate(`/assessments/${id}`);
    } catch (err) {
      console.error("Error submitting assessment:", err);
      setError("Failed to submit assessment");
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const responsesData = prepareResponsesForSave();
      await assessmentAPI.saveResponses(id, responsesData);
      navigate("/assessments");
    } catch (err) {
      console.error("Error saving draft:", err);
      setError("Failed to save draft");
      setIsLoading(false);
    }
  };

  if (isLoading && !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Assessment not found"}</p>
          <button
            onClick={() => navigate("/assessments")}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8 fade-in">
        <button
          onClick={() => navigate("/assessments")}
          className="p-2 rounded-xl border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-neutral-900">
            {assessment.title}
          </h1>
          <p className="mt-2 text-lg text-neutral-600">
            {assessment.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progress</span>
          <span>
            {Math.round(
              (Object.keys(responses).length / assessment.questions.length) *
                100
            )}
            % Complete
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                (Object.keys(responses).length / assessment.questions.length) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Assessment Form */}
      <div className="glass-effect rounded-2xl p-8 shadow-xl slide-up">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Assessment Questions
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {assessment.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <label className="block text-lg font-semibold text-neutral-900">
                {index + 1}. {question.text}
                {question.is_required && (
                  <span className="text-error-500 ml-1">*</span>
                )}
              </label>

              {/* Multiple Choice or Single Choice with Options */}
              {(question.question_type === "multiple_choice" ||
                question.question_type === "single_choice") &&
              question.options ? (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all"
                    >
                      <input
                        type={
                          question.question_type === "multiple_choice"
                            ? "checkbox"
                            : "radio"
                        }
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={
                          question.question_type === "multiple_choice"
                            ? Array.isArray(responses[question.id]?.value) &&
                              responses[question.id]?.value.includes(option.id)
                            : responses[question.id]?.value === option.id
                        }
                        onChange={(e) => {
                          if (question.question_type === "multiple_choice") {
                            const currentValues = Array.isArray(
                              responses[question.id]?.value
                            )
                              ? responses[question.id].value
                              : [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.id]
                              : currentValues.filter(
                                  (id: number) => id !== option.id
                                );
                            handleInputChange(question.id, newValues);
                          } else {
                            handleInputChange(question.id, option.id);
                          }
                        }}
                        required={
                          question.is_required && !responses[question.id]?.value
                        }
                        className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-neutral-900">
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              ) : question.question_type === "scale" ? (
                /* Scale (1-10) */
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleInputChange(question.id, num)}
                        className={`w-12 h-12 rounded-xl font-semibold transition-all ${
                          responses[question.id]?.value === num
                            ? "bg-primary-600 text-white shadow-lg scale-110"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500 px-2">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              ) : question.question_type === "text" ? (
                /* Text Input */
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="Enter your response..."
                  required={question.is_required}
                  value={responses[question.id]?.value || ""}
                  onChange={(e) =>
                    handleInputChange(question.id, e.target.value)
                  }
                />
              ) : question.question_type === "number" ? (
                /* Number Input */
                <input
                  type="number"
                  className="input-field"
                  placeholder="Enter a number..."
                  required={question.is_required}
                  value={responses[question.id]?.value || ""}
                  onChange={(e) =>
                    handleInputChange(question.id, e.target.value)
                  }
                />
              ) : question.question_type === "file_upload" ? (
                /* File Upload */
                <input
                  type="file"
                  className="input-field"
                  required={question.is_required}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleInputChange(question.id, file);
                    }
                  }}
                />
              ) : (
                /* Default Text Input */
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your answer..."
                  required={question.is_required}
                  value={responses[question.id]?.value || ""}
                  onChange={(e) =>
                    handleInputChange(question.id, e.target.value)
                  }
                />
              )}
            </div>
          ))}

          {/* Warning Note */}
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning-800">
                  Important Note
                </h3>
                <p className="text-sm text-warning-700 mt-1">
                  Please ensure all information is accurate as it will be used
                  for your business assessment. You can save your progress and
                  return later if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
//                   required={question.required}
//                 />
//               ) : (
//                 <input
//                   type={question.type}
//                   className="input-field"
//                   placeholder="Enter your answer..."
//                   required={question.required}
//                 />
//               )}
//             </div>
//           ))}

//           {/* Warning Note */}
//           <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
//             <div className="flex items-start space-x-3">
//               <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
//               <div>
//                 <h3 className="font-semibold text-warning-800">Important Note</h3>
//                 <p className="text-sm text-warning-700 mt-1">
//                   Please ensure all information is accurate as it will be used for your business assessment.
//                   You can save your progress and return later if needed.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-between pt-6">
//             <button
//               type="button"
//               className="btn-secondary flex items-center space-x-2"
//               disabled={isLoading}
//             >
//               <Save className="h-4 w-4" />
//               <span>Save Draft</span>
//             </button>

//             <button
//               type="submit"
//               className="btn-primary flex items-center space-x-2"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                   <span>Submitting...</span>
//                 </>
//               ) : (
//                 <>
//                   <Send className="h-4 w-4" />
//                   <span>Submit Assessment</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

export default AssessmentForm;
