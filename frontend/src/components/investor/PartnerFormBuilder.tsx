import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileText,
  Hash,
  Type,
  List,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { investorAPI } from "../../services/investor";

// Validation schema
const formSchema = yup.object({
  name: yup.string().required("Form name is required"),
  description: yup.string().required("Description is required"),
  funding_type: yup.string().required("Funding type is required"),
  min_readiness_score: yup
    .number()
    .min(0, "Score must be between 0-100")
    .max(100, "Score must be between 0-100")
    .nullable(),
  status: yup.string().required("Status is required"),
  sections: yup
    .array()
    .of(
      yup.object({
        title: yup.string().required("Section title is required"),
        description: yup.string(),
        order: yup.number().required(),
        fields: yup.array().of(
          yup.object({
            field_type: yup.string().required("Field type is required"),
            label: yup.string().required("Field label is required"),
            help_text: yup.string(),
            is_required: yup.boolean(),
            order: yup.number().required(),
          }),
        ),
      }),
    )
    .min(1, "At least one section is required")
    .required(),
});

const FUNDING_TYPES = [
  { value: "loan", label: "Loan" },
  { value: "equity", label: "Equity Investment" },
  { value: "grant", label: "Grant" },
  { value: "hybrid", label: "Hybrid (Multiple Types)" },
];

const FIELD_TYPES = [
  { value: "text", label: "Short Text", icon: Type },
  { value: "textarea", label: "Long Text", icon: FileText },
  { value: "number", label: "Number", icon: Hash },
  { value: "select", label: "Dropdown", icon: List },
];

interface FormData {
  name: string;
  description: string;
  funding_type: string;
  min_readiness_score?: number | null;
  status: string;
  sections: Section[];
}

interface Section {
  title: string;
  description?: string;
  order: number;
  fields?: Field[];
}

interface Field {
  field_type: string;
  label: string;
  help_text?: string;
  placeholder?: string;
  is_required?: boolean;
  order: number;
  options?: string[];
  choices?: string[];
}

export default function PartnerFormBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch partner profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["investorProfile"],
    queryFn: investorAPI.getProfile,
  });

  // Fetch existing form if editing
  const { data: existingForm, isLoading: isLoadingForm } = useQuery({
    queryKey: ["partnerForm", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/investors/funding-forms/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(formSchema) as any,
    defaultValues: existingForm || {
      status: "draft",
      sections: [
        {
          title: "Basic Information",
          description: "Essential business information",
          order: 1,
          fields: [],
        },
      ],
    },
  });

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const createFormMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Submitting form data:", data);
      console.log("Partner profile:", profile);

      if (!profile?.id) {
        throw new Error("Partner profile not loaded. Please refresh the page.");
      }

      const payload = {
        ...data,
        partner: profile.id,
      };

      console.log("Payload being sent:", payload);

      if (id) {
        const response = await api.patch(
          `/investors/funding-forms/${id}/`,
          payload,
        );
        return response.data;
      } else {
        const response = await api.post("/investors/funding-forms/", payload);
        return response.data;
      }
    },
    onSuccess: () => {
      console.log("Form saved successfully");
      setSubmitError(null);
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["partnerForms"] });
      setTimeout(() => navigate("/investor/forms"), 2000);
    },
    onError: (error: any) => {
      console.error("Form submission error:", error);
      console.error("Error response:", error?.response?.data);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to save form. Please try again.";
      setSubmitError(errorMessage);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    console.log("Form errors:", errors);
    setSubmitError(null);
    createFormMutation.mutate(data);
  };

  const handleFormError = (formErrors: any) => {
    console.log("Validation errors:", formErrors);
    setSubmitError("Please fix the validation errors before submitting.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addSection = () => {
    appendSection({
      title: "",
      description: "",
      order: sections.length + 1,
      fields: [],
    });
  };

  const addFieldToSection = (sectionIndex: number) => {
    const currentFields = watch(`sections.${sectionIndex}.fields`) || [];
    setValue(`sections.${sectionIndex}.fields`, [
      ...currentFields,
      {
        field_type: "text",
        label: "",
        help_text: "",
        is_required: false,
        order: currentFields.length + 1,
      },
    ]);
  };

  const removeFieldFromSection = (sectionIndex: number, fieldIndex: number) => {
    const currentFields = watch(`sections.${sectionIndex}.fields`) || [];
    const newFields = currentFields.filter((_, i) => i !== fieldIndex);
    setValue(`sections.${sectionIndex}.fields`, newFields);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (isLoadingForm || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="ml-4 text-neutral-600 dark:text-neutral-400">
          Loading...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Unable to load partner profile</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {id ? "Form Updated!" : "Form Created!"}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Redirecting to forms list...
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
            onClick={() => navigate("/investor/forms")}
            className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {id ? "Edit Application Form" : "Create Application Form"}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Build a customized application form for SMEs applying to your
            funding opportunities
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: "Form Details" },
              { num: 2, label: "Sections & Fields" },
              { num: 3, label: "Review" },
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

        {/* Error Banner */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium">
                  Error
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  {submitError}
                </p>
              </div>
              <button
                onClick={() => setSubmitError(null)}
                className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  Please fix the following errors:
                </p>
                <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 list-disc list-inside">
                  {errors.name && <li>Form name is required</li>}
                  {errors.description && <li>Description is required</li>}
                  {errors.funding_type && <li>Funding type is required</li>}
                  {errors.sections && (
                    <li>At least one section with fields is required</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit, handleFormError)}
          className="space-y-6"
        >
          {/* Step 1: Form Details */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Form Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g., Standard Loan Application Form"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Describe the purpose and requirements of this form"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Funding Type *
                </label>
                <select
                  {...register("funding_type")}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select funding type...</option>
                  {FUNDING_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.funding_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.funding_type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Minimum Readiness Score (Optional)
                </label>
                <input
                  {...register("min_readiness_score")}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 60"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Only SMEs with this readiness score or higher will see this
                  form
                </p>
                {errors.min_readiness_score && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.min_readiness_score.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Sections & Fields */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Section {sectionIndex + 1}
                    </h3>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Section Title *
                      </label>
                      <input
                        {...register(`sections.${sectionIndex}.title`)}
                        type="text"
                        placeholder="e.g., Financial Information"
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {errors.sections?.[sectionIndex]?.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.sections[sectionIndex]?.title?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Section Description
                      </label>
                      <textarea
                        {...register(`sections.${sectionIndex}.description`)}
                        rows={2}
                        placeholder="Optional description for this section"
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* Fields */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-neutral-900 dark:text-white">
                          Fields
                        </h4>
                        <button
                          type="button"
                          onClick={() => addFieldToSection(sectionIndex)}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Field
                        </button>
                      </div>

                      <div className="space-y-4">
                        {watch(`sections.${sectionIndex}.fields`)?.map(
                          (_field: any, fieldIndex: number) => (
                            <div
                              key={fieldIndex}
                              className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                  Field {fieldIndex + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFieldFromSection(
                                      sectionIndex,
                                      fieldIndex,
                                    )
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                    Field Type *
                                  </label>
                                  <select
                                    {...register(
                                      `sections.${sectionIndex}.fields.${fieldIndex}.field_type`,
                                    )}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                  >
                                    {FIELD_TYPES.map((type) => (
                                      <option
                                        key={type.value}
                                        value={type.value}
                                      >
                                        {type.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                    Label *
                                  </label>
                                  <input
                                    {...register(
                                      `sections.${sectionIndex}.fields.${fieldIndex}.label`,
                                    )}
                                    type="text"
                                    placeholder="Field label"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                    Help Text
                                  </label>
                                  <input
                                    {...register(
                                      `sections.${sectionIndex}.fields.${fieldIndex}.help_text`,
                                    )}
                                    type="text"
                                    placeholder="Additional guidance for this field"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                  />
                                </div>

                                {watch(`sections.${sectionIndex}.fields.${fieldIndex}.field_type`) === "select" && (
                                  <div className="col-span-2">
                                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                      Dropdown Options <span className="text-neutral-400">(one per line)</span>
                                    </label>
                                    <textarea
                                      rows={4}
                                      placeholder={"Option 1\nOption 2\nOption 3"}
                                      value={(watch(`sections.${sectionIndex}.fields.${fieldIndex}.choices`) || []).join("\n")}
                                      onChange={(e) => {
                                        const choices = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                                        setValue(`sections.${sectionIndex}.fields.${fieldIndex}.choices`, choices);
                                      }}
                                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                    />
                                  </div>
                                )}

                                <div className="col-span-2">
                                  <label className="flex items-center gap-2">
                                    <input
                                      {...register(
                                        `sections.${sectionIndex}.fields.${fieldIndex}.is_required`,
                                      )}
                                      type="checkbox"
                                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded"
                                    />
                                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                      Required field
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          ),
                        )}

                        {(!watch(`sections.${sectionIndex}.fields`) ||
                          watch(`sections.${sectionIndex}.fields`)?.length ===
                            0) && (
                          <div className="text-center py-8 text-neutral-500 text-sm">
                            No fields added yet. Click "Add Field" to start.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSection}
                className="w-full py-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Section</span>
              </button>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 space-y-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                Review Your Form
              </h3>

              <div className="space-y-4">
                <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    Form Details
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs text-neutral-600 dark:text-neutral-400">
                        Name:
                      </dt>
                      <dd className="text-sm font-medium text-neutral-900 dark:text-white">
                        {watch("name") || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-neutral-600 dark:text-neutral-400">
                        Funding Type:
                      </dt>
                      <dd className="text-sm font-medium text-neutral-900 dark:text-white">
                        {FUNDING_TYPES.find(
                          (t) => t.value === watch("funding_type"),
                        )?.label || "-"}
                      </dd>
                    </div>
                    {watch("min_readiness_score") && (
                      <div>
                        <dt className="text-xs text-neutral-600 dark:text-neutral-400">
                          Min Readiness Score:
                        </dt>
                        <dd className="text-sm font-medium text-neutral-900 dark:text-white">
                          {watch("min_readiness_score")}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4">
                    Sections ({sections.length})
                  </h4>
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <div
                        key={section.id}
                        className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
                      >
                        <h5 className="font-medium text-neutral-900 dark:text-white mb-1">
                          {watch(`sections.${index}.title`) ||
                            `Section ${index + 1}`}
                        </h5>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                          {watch(`sections.${index}.description`) ||
                            "No description"}
                        </p>
                        <div className="text-xs text-neutral-500">
                          {watch(`sections.${index}.fields`)?.length || 0}{" "}
                          field(s)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Form Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="draft">Draft (Not visible to SMEs)</option>
                  <option value="active">
                    Active (SMEs can fill this form)
                  </option>
                </select>
              </div>

              <div className="flex justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={createFormMutation.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {createFormMutation.isPending
                      ? "Saving..."
                      : id
                        ? "Update Form"
                        : "Create Form"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
