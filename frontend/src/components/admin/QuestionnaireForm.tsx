import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  GripVertical,
  CheckCircle2,
} from "lucide-react";
import {
  useAssessmentCategories,
  useCreateQuestionnaire,
  useUpdateQuestionnaire,
  useQuestionnaire,
} from "../../hooks";

// Validation schema
const questionnaireSchema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  category: yup.number().required("Category is required"),
  language: yup.string().required("Language is required"),
  target_sectors: yup.array().of(yup.string()),
  target_enterprise_sizes: yup.array().of(yup.string()),
  target_districts: yup.array().of(yup.string()),
  min_employees: yup.number().nullable().min(0, "Must be positive"),
  max_employees: yup.number().nullable().min(0, "Must be positive"),
  questions: yup.array().of(
    yup.object({
      text: yup.string().required("Question text is required"),
      question_type: yup.string().required("Question type is required"),
      is_required: yup.boolean(),
      max_score: yup.number().min(1, "Score must be at least 1"),
      options: yup.array().of(
        yup.object({
          text: yup.string().required("Option text is required"),
          score: yup.number().min(0, "Score must be positive"),
        })
      ),
    })
  ),
});

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "single_choice", label: "Single Choice" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "scale", label: "Scale (1-10)" },
  { value: "file_upload", label: "File Upload" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "rw", label: "Kinyarwanda" },
  { value: "sw", label: "Swahili" },
];

const ENTERPRISE_SIZES = [
  { value: "micro", label: "Micro (1-9 employees)" },
  { value: "small", label: "Small (10-49 employees)" },
  { value: "medium", label: "Medium (50-249 employees)" },
  { value: "large", label: "Large (250+ employees)" },
];

const SECTORS = [
  "Agriculture",
  "Manufacturing",
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Retail",
  "Hospitality",
  "Construction",
  "Transportation",
  "Energy",
  "Other",
];

const QuestionnaireForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: categories = [] } = useAssessmentCategories();
  const { data: existingQuestionnaire } = useQuestionnaire(
    isEditMode ? parseInt(editId!) : undefined
  );

  const createMutation = useCreateQuestionnaire();
  const updateMutation = useUpdateQuestionnaire();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(questionnaireSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      language: "en",
      target_sectors: [],
      target_enterprise_sizes: [],
      target_districts: [],
      min_employees: null,
      max_employees: null,
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  // Load existing questionnaire data
  useEffect(() => {
    if (existingQuestionnaire && isEditMode) {
      setValue("title", existingQuestionnaire.title);
      setValue("description", existingQuestionnaire.description);
      setValue("category", existingQuestionnaire.category?.id);
      setValue("language", existingQuestionnaire.language);
      setValue("target_sectors", existingQuestionnaire.target_sectors || []);
      setValue(
        "target_enterprise_sizes",
        existingQuestionnaire.target_enterprise_sizes || []
      );
      setValue(
        "target_districts",
        existingQuestionnaire.target_districts || []
      );
      setValue("min_employees", existingQuestionnaire.min_employees);
      setValue("max_employees", existingQuestionnaire.max_employees);
      if (existingQuestionnaire.questions) {
        setValue("questions", existingQuestionnaire.questions);
      }
    }
  }, [existingQuestionnaire, isEditMode, setValue]);

  const watchQuestions = watch("questions");
  const estimatedTime = (watchQuestions?.length || 0) * 3;

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: parseInt(editId!),
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/admin/questionnaires");
      }, 2000);
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
          err.message ||
          "Failed to save questionnaire"
      );
    }
  };

  const addQuestion = () => {
    append({
      text: "",
      question_type: "single_choice",
      is_required: true,
      max_score: 10,
      options: [
        { text: "", score: 10 },
        { text: "", score: 0 },
      ],
    });
  };

  const toggleArrayValue = (fieldName: any, value: string) => {
    const currentValues = watch(fieldName) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    setValue(fieldName, newValues);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {isEditMode ? "Questionnaire Updated!" : "Questionnaire Created!"}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Redirecting to questionnaires list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/questionnaires")}
            className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questionnaires
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {isEditMode ? "Edit Questionnaire" : "Create New Questionnaire"}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {isEditMode
              ? "Update the questionnaire details and questions"
              : "Build a comprehensive assessment questionnaire"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: "Basic Info" },
              { num: 2, label: "Matching Criteria" },
              { num: 3, label: "Questions" },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep >= step.num
                        ? "bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900"
                        : "bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {step.num}
                  </div>
                  <span className="text-xs mt-2 text-neutral-600 dark:text-neutral-400">
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                      currentStep > step.num
                        ? "bg-primary-600"
                        : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Questionnaire Title *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  placeholder="e.g., Financial Health Assessment"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Provide a detailed description of this questionnaire..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Category *
                  </label>
                  <select
                    {...register("category")}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Language *
                  </label>
                  <select
                    {...register("language")}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full btn-primary py-3"
              >
                Continue to Matching Criteria
              </button>
            </div>
          )}

          {/* Step 2: Matching Criteria */}
          {currentStep === 2 && (
            <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  Enterprise Matching Criteria
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Select which enterprises should see this questionnaire. Leave
                  empty to show to all enterprises.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Target Sectors
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SECTORS.map((sector) => (
                    <label
                      key={sector}
                      className="flex items-center p-3 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(watch("target_sectors") || []).includes(
                          sector
                        )}
                        onChange={() =>
                          toggleArrayValue("target_sectors", sector)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {sector}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Target Enterprise Sizes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ENTERPRISE_SIZES.map((size) => (
                    <label
                      key={size.value}
                      className="flex items-center p-3 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(
                          watch("target_enterprise_sizes") || []
                        ).includes(size.value)}
                        onChange={() =>
                          toggleArrayValue(
                            "target_enterprise_sizes",
                            size.value
                          )
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {size.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Min Employees
                  </label>
                  <input
                    {...register("min_employees")}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Max Employees
                  </label>
                  <input
                    {...register("max_employees")}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 btn-secondary py-3"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 btn-primary py-3"
                >
                  Continue to Questions
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Questions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Questions ({fields.length})
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Estimated time: ~{estimatedTime} minutes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      >
                        <GripVertical className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-bold text-neutral-500">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          {...register(`questions.${index}.text`)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                          placeholder="Enter your question..."
                        />
                        {errors.questions?.[index]?.text && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.questions[index]?.text?.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                            Type *
                          </label>
                          <select
                            {...register(`questions.${index}.question_type`)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                          >
                            {QUESTION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                            Max Score
                          </label>
                          <input
                            {...register(`questions.${index}.max_score`)}
                            type="number"
                            min="1"
                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              {...register(`questions.${index}.is_required`)}
                              type="checkbox"
                              className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600"
                            />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                              Required
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Options for Multiple Choice and Single Choice */}
                      {(watch(`questions.${index}.question_type`) ===
                        "multiple_choice" ||
                        watch(`questions.${index}.question_type`) ===
                          "single_choice") && (
                        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                              Answer Options
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentOptions =
                                  watch(`questions.${index}.options`) || [];
                                setValue(`questions.${index}.options`, [
                                  ...currentOptions,
                                  { text: "", score: 0 },
                                ]);
                              }}
                              className="text-xs btn-secondary py-1 px-3"
                            >
                              <Plus className="w-3 h-3 mr-1 inline" />
                              Add Option
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(watch(`questions.${index}.options`) || []).map(
                              (_: any, optionIndex: number) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-xs font-medium text-neutral-500 w-6">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <input
                                    {...register(
                                      `questions.${index}.options.${optionIndex}.text`
                                    )}
                                    type="text"
                                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none text-sm"
                                    placeholder="Option text"
                                  />
                                  <input
                                    {...register(
                                      `questions.${index}.options.${optionIndex}.score`
                                    )}
                                    type="number"
                                    min="0"
                                    className="w-20 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none text-sm"
                                    placeholder="Points"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOptions =
                                        watch(`questions.${index}.options`) ||
                                        [];
                                      setValue(
                                        `questions.${index}.options`,
                                        currentOptions.filter(
                                          (_: any, i: number) =>
                                            i !== optionIndex
                                        )
                                      );
                                    }}
                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )
                            )}
                            {(!watch(`questions.${index}.options`) ||
                              watch(`questions.${index}.options`)?.length ===
                                0) && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                                No options added yet. Click "Add Option" to
                                create answer choices.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className="glass-effect rounded-2xl p-12 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center">
                  <FileText className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                    No questions yet
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Start building your questionnaire by adding questions
                  </p>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Add Your First Question
                  </button>
                </div>
              )}

              <div className="glass-effect rounded-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 btn-secondary py-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || fields.length === 0}
                    className="flex-1 btn-primary py-3 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    {isSubmitting
                      ? "Saving..."
                      : isEditMode
                      ? "Update Questionnaire"
                      : "Create Questionnaire"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuestionnaireForm;
