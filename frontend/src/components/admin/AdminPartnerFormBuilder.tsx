import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Upload,
  Hash,
  Type,
  List,
  Database,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

// Validation schema
const formSchema = yup.object({
  partner: yup.string().required("Partner is required"),
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
  { value: "long_text", label: "Long Text", icon: FileText },
  { value: "number", label: "Number", icon: Hash },
  { value: "choice", label: "Multiple Choice", icon: List },
  { value: "file", label: "File Upload", icon: Upload },
  { value: "auto_fill", label: "Auto-fill from Profile", icon: Database },
];

const AUTO_FILL_SOURCES = [
  { value: "profile.business_name", label: "Business Name" },
  {
    value: "profile.business_registration_number",
    label: "Registration Number",
  },
  { value: "profile.year_established", label: "Year Established" },
  { value: "profile.sector", label: "Business Sector" },
  { value: "profile.phone_number", label: "Phone Number" },
  { value: "profile.email", label: "Email Address" },
  { value: "assessment.readiness_score", label: "Readiness Score" },
  { value: "assessment.total_score", label: "Total Assessment Score" },
];

const FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "doc,docx", label: "Word Documents" },
  { value: "xls,xlsx", label: "Excel Spreadsheets" },
  { value: "jpg,jpeg,png", label: "Images" },
];

interface FormData {
  partner: string;
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
  is_required?: boolean;
  order: number;
  min_value?: number | null;
  max_value?: number | null;
  choices?: string[];
  accepted_file_types?: string;
  max_file_size_mb?: number | null;
  auto_fill_source?: string;
  conditional_rules?: any;
}

export default function AdminPartnerFormBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch partners
  const { data: partners = [] } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const response = await api.get("/investors/profiles/");
      return response.data.results || response.data;
    },
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
    defaultValues: {
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
      const response = await api.post("/api/investors/funding-forms/", data);
      return response.data;
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["funding-forms"] });
      setTimeout(() => navigate("/admin/partners"), 2000);
    },
  });

  const onSubmit = (data: FormData) => {
    createFormMutation.mutate(data);
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

  const getFieldTypeIcon = (type: string) => {
    const fieldType = FIELD_TYPES.find((ft) => ft.value === type);
    return fieldType ? fieldType.icon : Type;
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Funding Form Created!
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Redirecting to partner management...
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
            onClick={() => navigate("/admin/partners")}
            className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Create Partner Funding Form
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Build a customized application form for partner-specific
            requirements
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Form Details */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Partner Organization
                </label>
                <select
                  {...register("partner")}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a partner...</option>
                  {partners.map((partner: any) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.organization_name}
                    </option>
                  ))}
                </select>
                {errors.partner && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.partner.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Form Name
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
                  Description
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
                  Funding Type
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
                  placeholder="Override default readiness score requirement"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.min_readiness_score && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.min_readiness_score.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next: Sections & Fields
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
                    <div className="flex-1 space-y-4">
                      <input
                        {...register(`sections.${sectionIndex}.title`)}
                        type="text"
                        placeholder="Section Title"
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        {...register(`sections.${sectionIndex}.description`)}
                        type="text"
                        placeholder="Section description (optional)"
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    {(watch(`sections.${sectionIndex}.fields`) || []).map(
                      (_field: Field, fieldIndex: number) => {
                        const fieldType = watch(
                          `sections.${sectionIndex}.fields.${fieldIndex}.field_type`,
                        );
                        const Icon = getFieldTypeIcon(fieldType);

                        return (
                          <div
                            key={fieldIndex}
                            className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-3">
                                <Icon className="h-5 w-5 text-neutral-400" />
                              </div>

                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                      Field Type
                                    </label>
                                    <select
                                      {...register(
                                        `sections.${sectionIndex}.fields.${fieldIndex}.field_type`,
                                      )}
                                      className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
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
                                      Field Label
                                    </label>
                                    <input
                                      {...register(
                                        `sections.${sectionIndex}.fields.${fieldIndex}.label`,
                                      )}
                                      type="text"
                                      placeholder="e.g., Annual Revenue"
                                      className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                    Help Text (Optional)
                                  </label>
                                  <input
                                    {...register(
                                      `sections.${sectionIndex}.fields.${fieldIndex}.help_text`,
                                    )}
                                    type="text"
                                    placeholder="Additional guidance for this field"
                                    className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                  />
                                </div>

                                {/* Auto-fill source for auto_fill field type */}
                                {fieldType === "auto_fill" && (
                                  <div>
                                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                      Auto-fill Source
                                    </label>
                                    <select
                                      {...register(
                                        `sections.${sectionIndex}.fields.${fieldIndex}.auto_fill_source`,
                                      )}
                                      className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                    >
                                      <option value="">Select source...</option>
                                      {AUTO_FILL_SOURCES.map((source) => (
                                        <option
                                          key={source.value}
                                          value={source.value}
                                        >
                                          {source.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {/* Number field validation */}
                                {fieldType === "number" && (
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                        Min Value
                                      </label>
                                      <input
                                        {...register(
                                          `sections.${sectionIndex}.fields.${fieldIndex}.min_value`,
                                        )}
                                        type="number"
                                        className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                        Max Value
                                      </label>
                                      <input
                                        {...register(
                                          `sections.${sectionIndex}.fields.${fieldIndex}.max_value`,
                                        )}
                                        type="number"
                                        className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* File upload settings */}
                                {fieldType === "file" && (
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                        Accepted File Types
                                      </label>
                                      <select
                                        {...register(
                                          `sections.${sectionIndex}.fields.${fieldIndex}.accepted_file_types`,
                                        )}
                                        className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                      >
                                        {FILE_TYPES.map((type) => (
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
                                        Max File Size (MB)
                                      </label>
                                      <input
                                        {...register(
                                          `sections.${sectionIndex}.fields.${fieldIndex}.max_file_size_mb`,
                                        )}
                                        type="number"
                                        min="1"
                                        defaultValue="5"
                                        className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center">
                                  <input
                                    {...register(
                                      `sections.${sectionIndex}.fields.${fieldIndex}.is_required`,
                                    )}
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                  />
                                  <label className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                                    Required field
                                  </label>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeFieldFromSection(
                                    sectionIndex,
                                    fieldIndex,
                                  )
                                }
                                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      },
                    )}

                    <button
                      type="button"
                      onClick={() => addFieldToSection(sectionIndex)}
                      className="w-full px-4 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Add Field
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSection}
                className="w-full px-4 py-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-500 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="h-5 w-5" />
                Add Section
              </button>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 space-y-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Review Your Form
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Form Name:
                  </span>
                  <p className="text-neutral-900 dark:text-white text-lg">
                    {watch("name")}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Description:
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {watch("description")}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Funding Type:
                  </span>
                  <p className="text-neutral-900 dark:text-white capitalize">
                    {watch("funding_type")}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Sections:
                  </span>
                  <p className="text-neutral-900 dark:text-white">
                    {sections.length}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Total Fields:
                  </span>
                  <p className="text-neutral-900 dark:text-white">
                    {sections.reduce(
                      (sum, section) =>
                        sum +
                        (watch(`sections.${sections.indexOf(section)}.fields`)
                          ?.length || 0),
                      0,
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <h3 className="font-medium text-neutral-900 dark:text-white mb-4">
                  Form Preview
                </h3>
                {sections.map((section, idx) => (
                  <div key={section.id} className="mb-6">
                    <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                      {watch(`sections.${idx}.title`) || `Section ${idx + 1}`}
                    </h4>
                    <div className="pl-4 space-y-2">
                      {(watch(`sections.${idx}.fields`) || []).map(
                        (field: Field, fIdx: number) => (
                          <div
                            key={fIdx}
                            className="text-sm text-neutral-600 dark:text-neutral-400"
                          >
                            • {field.label} ({field.field_type})
                            {field.is_required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={createFormMutation.isPending}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  {createFormMutation.isPending ? "Creating..." : "Create Form"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
