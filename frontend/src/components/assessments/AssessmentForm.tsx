import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, FileText, AlertCircle } from "lucide-react";
import { assessmentAPI } from "../../services/api";

interface Question {
  id: number;
  text: string;
  type: string;
  required: boolean;
  options?: any[];
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
      // Transform API response to match component state structure if needed
      // Assuming response.data contains the assessment details including questionnaire questions
      const data = response.data;

      // If the API returns nested questionnaire object, flatten it for the form
      const formattedAssessment = {
        id: data.id,
        title: data.questionnaire?.title || data.title,
        description: data.questionnaire?.description || "",
        questions: data.questionnaire?.questions || [],
        status: data.status,
      };

      setAssessment(formattedAssessment);

      // Load existing responses if any
      if (data.responses) {
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

  const saveResponses = async () => {
    if (!id) return;
    const promises = Object.entries(responses).map(async ([qId, data]) => {
      try {
        if (data.id) {
          await assessmentAPI.updateResponse(data.id.toString(), {
            value: data.value,
          });
        } else {
          const res = await assessmentAPI.saveResponse({
            assessment: id,
            question: qId,
            value: data.value,
          });
          // Update state with new ID
          setResponses((prev) => ({
            ...prev,
            [parseInt(qId)]: { ...prev[parseInt(qId)], id: res.data.id },
          }));
        }
      } catch (err) {
        console.error(`Error saving response for question ${qId}:`, err);
      }
    });
    await Promise.all(promises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsLoading(true);
    try {
      await saveResponses();
      await assessmentAPI.submitAssessment(id);
      navigate("/assessments");
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
      await saveResponses();
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
                {question.required && (
                  <span className="text-error-500 ml-1">*</span>
                )}
              </label>

              {question.type === "textarea" ? (
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="Enter your response..."
                  required={question.required}
                  value={responses[question.id]?.value || ""}
                  onChange={(e) =>
                    handleInputChange(question.id, e.target.value)
                  }
                />
              ) : (
                <input
                  type={question.type === "number" ? "number" : "text"}
                  className="input-field"
                  placeholder="Enter your answer..."
                  required={question.required}
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
