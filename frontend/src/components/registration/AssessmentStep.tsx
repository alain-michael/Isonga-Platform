import React, { useState, useEffect } from "react";
import { assessmentAPI } from "../../services/api";
import type { BusinessProfile } from "./BusinessRegistrationFlow";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Assessment {
  id: number;
  title: string;
  description: string;
  category: string;
  estimated_time: string;
  is_required: boolean;
  questions: Question[];
}

interface Question {
  id: number;
  text: string;
  question_type: string;
  is_required: boolean;
  options: Option[];
}

interface Option {
  id: number;
  text: string;
  score: number;
}

interface AssessmentStepProps {
  onComplete: (completedAssessments: number[]) => void;
  businessProfile: BusinessProfile;
}

const AssessmentStep: React.FC<AssessmentStepProps> = ({
  onComplete,
  businessProfile,
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    null
  );
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [completedAssessments, setCompletedAssessments] = useState<number[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const response = await assessmentAPI.getQuestionnaires();
      setAssessments(response.data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (assessment: Assessment) => {
    // Fetch detailed assessment with questions
    try {
      const response = await assessmentAPI.getAssessment(
        assessment.id.toString()
      );
      const detailedAssessment = response.data;
      setCurrentAssessment(detailedAssessment);
      setResponses({});
    } catch (error) {
      console.error("Error fetching assessment details:", error);
    }
  };

  const handleResponseChange = (questionId: number, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const submitAssessment = async () => {
    if (!currentAssessment) return;

    setSubmittingAssessment(true);

    try {
      const formattedResponses = Object.entries(responses).map(
        ([questionId, response]) => ({
          question: parseInt(questionId),
          response: response,
        })
      );

      const response = await assessmentAPI.createAssessment({
        questionnaire: currentAssessment.id,
        responses: formattedResponses,
      });

      if (response.data) {
        const newCompleted = [...completedAssessments, currentAssessment.id];
        setCompletedAssessments(newCompleted);
        setCurrentAssessment(null);
        setResponses({});

        // Check if all required assessments are completed
        const requiredAssessments = assessments.filter((a) => a.is_required);
        const allRequiredCompleted = requiredAssessments.every((a) =>
          newCompleted.includes(a.id)
        );

        if (allRequiredCompleted) {
          // Generate PDF and complete step
          await generatePDF(newCompleted);
        }
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const generatePDF = async (completedIds: number[]) => {
    try {
      console.log("Generating PDF for assessments:", completedIds);

      const doc = new jsPDF();

      // Add Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Isonga Platform - Readiness Report", 14, 22);

      // Add Business Info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Business Name: ${businessProfile.business_name}`, 14, 32);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);
      doc.text(`Sector: ${businessProfile.sector}`, 14, 44);

      // Add Assessment Summary
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Assessment Summary", 14, 55);

      const completedAssessmentsList = assessments.filter((a) =>
        completedIds.includes(a.id)
      );

      const tableData = completedAssessmentsList.map((a) => [
        a.title,
        a.category,
        "Completed",
        new Date().toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: 60,
        head: [["Assessment", "Category", "Status", "Date"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [66, 133, 244] },
      });

      // Add Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save PDF
      doc.save(`${businessProfile.business_name}_readiness_report.pdf`);

      onComplete(completedIds);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.question_type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option.id}
                  checked={responses[question.id] === option.id}
                  onChange={(e) =>
                    handleResponseChange(question.id, parseInt(e.target.value))
                  }
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case "text":
        return (
          <textarea
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            placeholder="Enter your response..."
          />
        );

      case "rating":
        return (
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label
                key={rating}
                className="flex flex-col items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={rating}
                  checked={responses[question.id] === rating}
                  onChange={(e) =>
                    handleResponseChange(question.id, parseInt(e.target.value))
                  }
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs text-neutral-600 mt-1">{rating}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
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

  if (currentAssessment) {
    const answeredQuestions = currentAssessment.questions.filter(
      (q) => responses[q.id] !== undefined && responses[q.id] !== ""
    ).length;
    const progress =
      (answeredQuestions / currentAssessment.questions.length) * 100;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-neutral-900">
              {currentAssessment.title}
            </h3>
            <button
              onClick={() => setCurrentAssessment(null)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              ✕
            </button>
          </div>
          <p className="text-neutral-600 mb-4">
            {currentAssessment.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-neutral-600 mb-2">
              <span>Progress</span>
              <span>
                {answeredQuestions} of {currentAssessment.questions.length}{" "}
                questions
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {currentAssessment.questions.map((question, index) => (
            <div
              key={question.id}
              className="border-b border-neutral-200 pb-6 last:border-b-0"
            >
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-900 mb-2">
                  {index + 1}. {question.text}
                  {question.is_required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h4>
                {renderQuestion(question)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={() => setCurrentAssessment(null)}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
          >
            Back to Assessments
          </button>
          <button
            onClick={submitAssessment}
            disabled={submittingAssessment || answeredQuestions === 0}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-md hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingAssessment ? "Submitting..." : "Submit Assessment"}
          </button>
        </div>
      </div>
    );
  }

  const requiredAssessments = assessments.filter((a) => a.is_required);
  const optionalAssessments = assessments.filter((a) => !a.is_required);
  const requiredCompleted = requiredAssessments.filter((a) =>
    completedAssessments.includes(a.id)
  ).length;
  const allRequiredCompleted = requiredCompleted === requiredAssessments.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Complete Assessments
        </h2>
        <p className="text-neutral-600 mb-4">
          Complete the required assessments to evaluate your business and
          generate your sustainability report.
        </p>

        {requiredAssessments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-blue-700">
                  Required Assessments: {requiredCompleted} of{" "}
                  {requiredAssessments.length} completed
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (requiredCompleted / requiredAssessments.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Required Assessments */}
      {requiredAssessments.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Required Assessments
          </h3>
          <div className="grid gap-4">
            {requiredAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className={`border rounded-lg p-6 ${
                  completedAssessments.includes(assessment.id)
                    ? "border-green-200 bg-green-50"
                    : "border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 mb-2">
                      {assessment.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mb-3">
                      {assessment.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-neutral-500">
                      <span>Category: {assessment.category}</span>
                      <span>Time: {assessment.estimated_time}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {completedAssessments.includes(assessment.id) ? (
                      <div className="flex items-center text-green-600">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => startAssessment(assessment)}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        Start Assessment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Assessments */}
      {optionalAssessments.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Optional Assessments
          </h3>
          <div className="grid gap-4">
            {optionalAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className={`border rounded-lg p-6 ${
                  completedAssessments.includes(assessment.id)
                    ? "border-green-200 bg-green-50"
                    : "border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 mb-2">
                      {assessment.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mb-3">
                      {assessment.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-neutral-500">
                      <span>Category: {assessment.category}</span>
                      <span>Time: {assessment.estimated_time}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {completedAssessments.includes(assessment.id) ? (
                      <div className="flex items-center text-green-600">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => startAssessment(assessment)}
                        className="px-4 py-2 border border-primary-600 text-primary-600 text-sm font-medium rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        Start Assessment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {allRequiredCompleted && (
        <div className="flex justify-end pt-6 border-t border-neutral-200">
          <button
            onClick={() => generatePDF(completedAssessments)}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-md hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Download Report & Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentStep;
