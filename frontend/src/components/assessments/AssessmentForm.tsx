import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, FileText, AlertCircle } from "lucide-react";

const AssessmentForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Mock assessment data
  const assessment = {
    id,
    title: "Financial Assessment 2024",
    description: "Comprehensive financial health evaluation for your business",
    questions: [
      {
        id: 1,
        text: "What is your annual revenue?",
        type: "number",
        required: true
      },
      {
        id: 2,
        text: "How many employees do you have?",
        type: "number",
        required: true
      },
      {
        id: 3,
        text: "Describe your main business activities",
        type: "textarea",
        required: true
      }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/assessments");
    }, 2000);
  };

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
          <span>33% Complete</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full w-1/3 transition-all duration-300"></div>
        </div>
      </div>

      {/* Assessment Form */}
      <div className="glass-effect rounded-2xl p-8 shadow-xl slide-up">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Assessment Questions</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {assessment.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <label className="block text-lg font-semibold text-neutral-900">
                {index + 1}. {question.text}
                {question.required && <span className="text-error-500 ml-1">*</span>}
              </label>
              
              {question.type === "textarea" ? (
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="Enter your response..."
                  required={question.required}
                />
              ) : (
                <input
                  type={question.type}
                  className="input-field"
                  placeholder="Enter your answer..."
                  required={question.required}
                />
              )}
            </div>
          ))}

          {/* Warning Note */}
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning-800">Important Note</h3>
                <p className="text-sm text-warning-700 mt-1">
                  Please ensure all information is accurate as it will be used for your business assessment.
                  You can save your progress and return later if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
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

export default AssessmentForm;
