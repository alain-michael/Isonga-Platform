import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: "radio" | "checkbox" | "text" | "textarea" | "number";
  options?: string[];
  weight: number;
  required: boolean;
  tooltip?: string;
  scoringTips?: {
    lowScore?: string;
    mediumScore?: string;
    highScore?: string;
  };
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

const CreateAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState({
    title: "",
    description: "",
    industry: "",
    selectedQuestionnaires: [] as string[],
    languages: [] as string[],
    questionnaires: [] as Questionnaire[]
  });

  useEffect(() => {
    if (editId) {
      // Load existing assessment data for editing
      // This would typically fetch from an API
      loadExistingAssessment(editId);
    }
  }, [editId]);

  const loadExistingAssessment = (_id: string) => {
    // Mock loading existing assessment
    const mockAssessment = {
      title: "SME Financial Health Assessment",
      description: "Comprehensive financial evaluation for small and medium enterprises",
      industry: "General",
      selectedQuestionnaires: ["business-info", "financial-health"],
      languages: ["English", "Kinyarwanda"],
      questionnaires: [] // Would be populated from the API
    };
    setAssessmentData(mockAssessment);
  };

  const industries = [
    "General",
    "Technology",
    "Manufacturing",
    "Agriculture",
    "Healthcare",
    "Education",
    "Finance",
    "Retail",
    "Food & Beverage",
    "Construction",
    "Energy",
    "Transportation"
  ];

  const availableQuestionnaires = [
    {
      id: "business-info",
      title: "Business Information",
      description: "Basic business structure and operations",
      estimatedQuestions: 8
    },
    {
      id: "financial-health",
      title: "Financial Health",
      description: "Financial position and record keeping",
      estimatedQuestions: 12
    },
    {
      id: "funding-request",
      title: "Funding Request",
      description: "Funding needs and preparations",
      estimatedQuestions: 8
    },
    {
      id: "operations",
      title: "Operations Assessment",
      description: "Operational efficiency and processes",
      estimatedQuestions: 10
    },
    {
      id: "market-analysis",
      title: "Market Analysis",
      description: "Market position and competitive analysis",
      estimatedQuestions: 6
    },
    {
      id: "technical-capabilities",
      title: "Technical Capabilities",
      description: "Technology and innovation assessment",
      estimatedQuestions: 7
    }
  ];

  const availableLanguages = [
    "English",
    "Kinyarwanda", 
    "French",
    "Swahili"
  ];

  const totalSteps = 2 + assessmentData.selectedQuestionnaires.length;

  const handleBasicInfoSubmit = () => {
    if (!assessmentData.title || !assessmentData.description || !assessmentData.industry) {
      alert("Please fill in all required fields");
      return;
    }
    setCurrentStep(2);
  };

  const handleQuestionnaireSelection = () => {
    if (assessmentData.selectedQuestionnaires.length === 0) {
      alert("Please select at least one questionnaire");
      return;
    }
    if (assessmentData.languages.length === 0) {
      alert("Please select at least one language");
      return;
    }

    // Initialize questionnaires with templates
    const initializedQuestionnaires = assessmentData.selectedQuestionnaires.map(qId => {
      const template = getQuestionnaireTemplate(qId);
      return {
        id: qId,
        title: template.title,
        description: template.description,
        questions: template.questions
      };
    });

    setAssessmentData(prev => ({
      ...prev,
      questionnaires: initializedQuestionnaires
    }));

    setCurrentStep(3);
  };

  const getQuestionnaireTemplate = (id: string) => {
    const templates: Record<string, any> = {
      "business-info": {
        title: "Business Information",
        description: "Tell us about your business structure and operations",
        questions: [
          {
            id: "business-type",
            question: "What type of business do you operate?",
            type: "radio",
            options: [
              "Sole Proprietorship",
              "Partnership", 
              "LLC",
              "Corporation",
              "Non-profit"
            ],
            weight: 1,
            required: true,
            tooltip: "Your business structure affects funding eligibility and financial requirements",
            scoringTips: {
              lowScore: "Consider formalizing your business structure for better funding opportunities",
              mediumScore: "Your business structure is adequate, consider growth implications",
              highScore: "Excellent business structure for funding and growth"
            }
          },
          {
            id: "business-age",
            question: "How long has your business been operating?",
            type: "radio",
            options: [
              "Less than 1 year",
              "1-3 years",
              "3-5 years", 
              "5+ years"
            ],
            weight: 1.5,
            required: true,
            tooltip: "Business longevity is a key factor in most funding applications",
            scoringTips: {
              lowScore: "Focus on building track record and establishing business history",
              mediumScore: "Good operational history, continue building your track record",
              highScore: "Excellent business maturity demonstrates stability to lenders"
            }
          }
        ]
      },
      "financial-health": {
        title: "Financial Health", 
        description: "Assessment of your current financial position",
        questions: [
          {
            id: "bookkeeping",
            question: "Do you maintain organized financial records?",
            type: "radio",
            options: [
              "Yes, professional accounting software",
              "Yes, basic spreadsheets",
              "Minimal record keeping",
              "No organized system"
            ],
            weight: 2,
            required: true,
            tooltip: "Organized records are essential for funding applications and financial planning",
            scoringTips: {
              lowScore: "Implement proper bookkeeping system immediately - use software like QuickBooks",
              mediumScore: "Consider upgrading to professional accounting software for better accuracy",
              highScore: "Excellent financial record keeping - this greatly improves funding chances"
            }
          },
          {
            id: "financial-statements",
            question: "Do you have up-to-date financial statements?",
            type: "radio",
            options: [
              "Yes, professionally prepared",
              "Yes, self-prepared", 
              "Partially complete",
              "No"
            ],
            weight: 2.5,
            required: true,
            tooltip: "Recent statements including P&L, balance sheet, and cash flow",
            scoringTips: {
              lowScore: "Prepare complete financial statements - consider hiring an accountant",
              mediumScore: "Good progress, ensure statements are current and complete",
              highScore: "Professional financial statements significantly strengthen your position"
            }
          }
        ]
      }
      // Add more templates as needed
    };

    return templates[id] || { title: "", description: "", questions: [] };
  };

  const addQuestion = (questionnaireIndex: number) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      question: "",
      type: "radio",
      options: ["Option 1", "Option 2"],
      weight: 1,
      required: true,
      tooltip: "",
      scoringTips: {
        lowScore: "",
        mediumScore: "",
        highScore: ""
      }
    };

    setAssessmentData(prev => ({
      ...prev,
      questionnaires: prev.questionnaires.map((q, index) => 
        index === questionnaireIndex 
          ? { ...q, questions: [...q.questions, newQuestion] }
          : q
      )
    }));
  };

  const updateQuestion = (questionnaireIndex: number, questionIndex: number, updates: Partial<Question>) => {
    setAssessmentData(prev => ({
      ...prev,
      questionnaires: prev.questionnaires.map((q, qIndex) =>
        qIndex === questionnaireIndex
          ? {
              ...q,
              questions: q.questions.map((question, index) =>
                index === questionIndex ? { ...question, ...updates } : question
              )
            }
          : q
      )
    }));
  };

  const removeQuestion = (questionnaireIndex: number, questionIndex: number) => {
    setAssessmentData(prev => ({
      ...prev,
      questionnaires: prev.questionnaires.map((q, qIndex) =>
        qIndex === questionnaireIndex
          ? {
              ...q,
              questions: q.questions.filter((_, index) => index !== questionIndex)
            }
          : q
      )
    }));
  };

  const handleSaveAssessment = () => {
    // Validate all questionnaires have questions
    const hasEmptyQuestionnaires = assessmentData.questionnaires.some(q => q.questions.length === 0);
    if (hasEmptyQuestionnaires) {
      alert("All questionnaires must have at least one question");
      return;
    }

    // Save assessment (would typically send to API)
    console.log("Saving assessment:", assessmentData);
    navigate("/assessments/manage");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Assessment Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    value={assessmentData.title}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., SME Financial Health Assessment"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={assessmentData.description}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this assessment evaluates and its purpose..."
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Target Industry *
                  </label>
                  <select
                    value={assessmentData.industry}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    required
                  >
                    <option value="">Select an industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Select Questionnaires & Languages</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-4">
                    Choose Questionnaires to Include *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableQuestionnaires.map(questionnaire => (
                      <div key={questionnaire.id} className="border-2 border-neutral-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={questionnaire.id}
                            checked={assessmentData.selectedQuestionnaires.includes(questionnaire.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  selectedQuestionnaires: [...prev.selectedQuestionnaires, questionnaire.id]
                                }));
                              } else {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  selectedQuestionnaires: prev.selectedQuestionnaires.filter(id => id !== questionnaire.id)
                                }));
                              }
                            }}
                            className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <label htmlFor={questionnaire.id} className="font-semibold text-neutral-900 cursor-pointer">
                              {questionnaire.title}
                            </label>
                            <p className="text-sm text-neutral-600 mt-1">{questionnaire.description}</p>
                            <p className="text-xs text-neutral-500 mt-2">~{questionnaire.estimatedQuestions} questions</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-4">
                    Available Languages *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableLanguages.map(language => (
                      <div key={language} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={language}
                          checked={assessmentData.languages.includes(language)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssessmentData(prev => ({
                                ...prev,
                                languages: [...prev.languages, language]
                              }));
                            } else {
                              setAssessmentData(prev => ({
                                ...prev,
                                languages: prev.languages.filter(lang => lang !== language)
                              }));
                            }
                          }}
                          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor={language} className="text-neutral-700 cursor-pointer">
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        // Questionnaire editing steps
        const questionnaireIndex = currentStep - 3;
        const questionnaire = assessmentData.questionnaires[questionnaireIndex];
        
        if (!questionnaire) return null;

        return (
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{questionnaire.title}</h3>
                  <p className="text-neutral-600">{questionnaire.description}</p>
                </div>
                <button
                  onClick={() => addQuestion(questionnaireIndex)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-6">
                {questionnaire.questions.map((question, qIndex) => (
                  <div key={question.id} className="border-2 border-neutral-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-neutral-900">Question {qIndex + 1}</h4>
                      <button
                        onClick={() => removeQuestion(questionnaireIndex, qIndex)}
                        className="p-2 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(questionnaireIndex, qIndex, { question: e.target.value })}
                          placeholder="Enter your question..."
                          rows={2}
                          className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Question Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(questionnaireIndex, qIndex, { type: e.target.value as any })}
                          className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        >
                          <option value="radio">Single Choice</option>
                          <option value="checkbox">Multiple Choice</option>
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="number">Number</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Weight
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={question.weight}
                          onChange={(e) => updateQuestion(questionnaireIndex, qIndex, { weight: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        />
                      </div>

                      {(question.type === "radio" || question.type === "checkbox") && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Options
                          </label>
                          <div className="space-y-2">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(question.options || [])];
                                    newOptions[optIndex] = e.target.value;
                                    updateQuestion(questionnaireIndex, qIndex, { options: newOptions });
                                  }}
                                  className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const newOptions = question.options?.filter((_, i) => i !== optIndex);
                                    updateQuestion(questionnaireIndex, qIndex, { options: newOptions });
                                  }}
                                  className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                                updateQuestion(questionnaireIndex, qIndex, { options: newOptions });
                              }}
                              className="btn-secondary text-sm"
                            >
                              Add Option
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Tooltip (Help Text)
                        </label>
                        <input
                          type="text"
                          value={question.tooltip || ""}
                          onChange={(e) => updateQuestion(questionnaireIndex, qIndex, { tooltip: e.target.value })}
                          placeholder="Additional information to help users understand this question..."
                          className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-3">
                          Scoring Tips (Feedback based on score ranges)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-error-700 mb-1">
                              Low Score (0-40%)
                            </label>
                            <textarea
                              value={question.scoringTips?.lowScore || ""}
                              onChange={(e) => updateQuestion(questionnaireIndex, qIndex, { 
                                scoringTips: { 
                                  ...question.scoringTips, 
                                  lowScore: e.target.value 
                                } 
                              })}
                              placeholder="Advice for improvement..."
                              rows={3}
                              className="w-full px-3 py-2 border border-error-200 rounded-lg focus:border-error-500 focus:outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-warning-700 mb-1">
                              Medium Score (41-70%)
                            </label>
                            <textarea
                              value={question.scoringTips?.mediumScore || ""}
                              onChange={(e) => updateQuestion(questionnaireIndex, qIndex, { 
                                scoringTips: { 
                                  ...question.scoringTips, 
                                  mediumScore: e.target.value 
                                } 
                              })}
                              placeholder="Guidance for optimization..."
                              rows={3}
                              className="w-full px-3 py-2 border border-warning-200 rounded-lg focus:border-warning-500 focus:outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-success-700 mb-1">
                              High Score (71-100%)
                            </label>
                            <textarea
                              value={question.scoringTips?.highScore || ""}
                              onChange={(e) => updateQuestion(questionnaireIndex, qIndex, { 
                                scoringTips: { 
                                  ...question.scoringTips, 
                                  highScore: e.target.value 
                                } 
                              })}
                              placeholder="Positive reinforcement..."
                              rows={3}
                              className="w-full px-3 py-2 border border-success-200 rounded-lg focus:border-success-500 focus:outline-none text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required-${question.id}`}
                          checked={question.required}
                          onChange={(e) => updateQuestion(questionnaireIndex, qIndex, { required: e.target.checked })}
                          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor={`required-${question.id}`} className="text-sm text-neutral-700">
                          Required question
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                {questionnaire.questions.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-xl">
                    <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Questions Yet</h3>
                    <p className="text-neutral-500 mb-4">Add your first question to this questionnaire.</p>
                    <button
                      onClick={() => addQuestion(questionnaireIndex)}
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/assessments/manage")}
              className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                {editId ? "Edit Assessment" : "Create New Assessment"}
              </h1>
              <p className="text-lg text-neutral-600">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveAssessment}
            className="btn-secondary flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-neutral-600">
          <span>Basic Info</span>
          <span>Questionnaires</span>
          {assessmentData.selectedQuestionnaires.map((_, index) => (
            <span key={index}>Q{index + 1}</span>
          ))}
          <span>Complete</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="slide-up">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-4">
          {currentStep < totalSteps ? (
            <button
              onClick={() => {
                if (currentStep === 1) {
                  handleBasicInfoSubmit();
                } else if (currentStep === 2) {
                  handleQuestionnaireSelection();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSaveAssessment}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Complete Assessment</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAssessment;
