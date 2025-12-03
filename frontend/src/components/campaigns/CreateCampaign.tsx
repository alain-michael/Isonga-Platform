import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  FileText,
  DollarSign,
  Calendar,
  Check,
  AlertCircle,
  Upload,
  X,
  Info,
} from "lucide-react";
import { useCreateCampaign } from "../../hooks/useCampaigns";

// Form data interface
interface CampaignFormData {
  title: string;
  description: string;
  campaign_type: "equity" | "debt" | "grant" | "hybrid";
  target_amount: number;
  min_investment: number;
  max_investment?: number | null;
  start_date: string;
  end_date: string;
  use_of_funds: string;
}

// Validation schema
const campaignSchema = yup.object({
  title: yup
    .string()
    .required("Campaign title is required")
    .min(5, "Title must be at least 5 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters"),
  campaign_type: yup
    .string()
    .oneOf(["equity", "debt", "grant", "hybrid"] as const)
    .required("Campaign type is required"),
  target_amount: yup
    .number()
    .required("Target amount is required")
    .min(100000, "Minimum target is 100,000 RWF"),
  min_investment: yup
    .number()
    .required("Minimum investment is required")
    .min(10000, "Minimum investment is 10,000 RWF"),
  max_investment: yup.number().nullable().optional(),
  start_date: yup.string().required("Start date is required"),
  end_date: yup.string().required("End date is required"),
  use_of_funds: yup.string().required("Use of funds is required"),
});

const CAMPAIGN_TYPES = [
  {
    value: "equity",
    label: "Equity",
    description: "Investors receive ownership shares in your company",
  },
  {
    value: "debt",
    label: "Debt/Loan",
    description: "Receive a loan with agreed interest rate and repayment terms",
  },
  {
    value: "grant",
    label: "Grant",
    description: "Non-repayable funds typically from foundations or government",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "Combination of equity and debt financing",
  },
];

const STEPS = [
  { id: 1, title: "Campaign Details", icon: FileText },
  { id: 2, title: "Funding Goals", icon: Target },
  { id: 3, title: "Timeline", icon: Calendar },
  { id: 4, title: "Documents", icon: Upload },
  { id: 5, title: "Review", icon: Check },
];

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<File[]>([]);

  const createCampaignMutation = useCreateCampaign();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<CampaignFormData>({
    resolver: yupResolver(campaignSchema) as any,
    mode: "onChange",
  });

  const watchedValues = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof CampaignFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["title", "description", "campaign_type"];
        break;
      case 2:
        fieldsToValidate = ["target_amount", "min_investment", "use_of_funds"];
        break;
      case 3:
        fieldsToValidate = ["start_date", "end_date"];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: CampaignFormData) => {
    try {
      const campaignData = {
        ...data,
        use_of_funds: { description: data.use_of_funds },
      };

      await createCampaignMutation.mutateAsync(campaignData as any);
      navigate("/campaigns");
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setDocuments([...documents, ...Array.from(files)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Campaign Title *
              </label>
              <input
                {...register("title")}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="e.g., Series A Funding Round"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Campaign Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CAMPAIGN_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition ${
                      watchedValues.campaign_type === type.value
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      {...register("campaign_type")}
                      value={type.value}
                      className="absolute opacity-0"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-neutral-900">
                          {type.label}
                        </span>
                        <p className="text-sm text-neutral-500 mt-1">
                          {type.description}
                        </p>
                      </div>
                      {watchedValues.campaign_type === type.value && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {errors.campaign_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.campaign_type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Campaign Description *
              </label>
              <textarea
                {...register("description")}
                rows={6}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
                placeholder="Describe your campaign, what you're raising funds for, and why investors should be interested..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
              <p className="text-sm text-neutral-500 mt-1">
                {watchedValues.description?.length || 0}/50 characters minimum
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Target Amount (RWF) *
              </label>
              <input
                type="number"
                {...register("target_amount")}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="e.g., 50000000"
              />
              {errors.target_amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.target_amount.message}
                </p>
              )}
              {watchedValues.target_amount && (
                <p className="text-sm text-neutral-500 mt-1">
                  = {formatCurrency(watchedValues.target_amount)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Minimum Investment (RWF) *
                </label>
                <input
                  type="number"
                  {...register("min_investment")}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                  placeholder="e.g., 1000000"
                />
                {errors.min_investment && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.min_investment.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Maximum Investment (RWF)
                </label>
                <input
                  type="number"
                  {...register("max_investment")}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Use of Funds *
              </label>
              <textarea
                {...register("use_of_funds")}
                rows={5}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
                placeholder="Describe how you plan to use the funds raised..."
              />
              {errors.use_of_funds && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.use_of_funds.message}
                </p>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Investment Terms</p>
                  <p>
                    Be transparent about how funds will be used. This builds
                    trust with potential investors and increases your chances of
                    reaching your target.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Start Date *
                </label>
                <input
                  type="date"
                  {...register("start_date")}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  End Date *
                </label>
                <input
                  type="date"
                  {...register("end_date")}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Campaign Duration</p>
                  <p>
                    Most successful campaigns run for 30-60 days. Longer
                    campaigns may lose momentum, while shorter ones may not give
                    enough time for investor due diligence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Supporting Documents
              </label>
              <p className="text-sm text-neutral-500 mb-4">
                Upload documents to support your campaign (pitch deck, financial
                statements, business plan, etc.)
              </p>

              <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center hover:border-primary-300 transition">
                <Upload className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-primary-600 font-medium hover:underline">
                    Click to upload
                  </span>
                  <span className="text-neutral-500"> or drag and drop</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="text-sm text-neutral-500 mt-2">
                  PDF, DOC, XLS, PPT up to 10MB each
                </p>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-neutral-400" />
                      <span className="text-sm text-neutral-700">
                        {file.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeDocument(index)}
                      className="p-1 hover:bg-neutral-200 rounded-full transition"
                    >
                      <X className="h-4 w-4 text-neutral-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">
                Recommended Documents
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Pitch Deck / Executive Summary</li>
                <li>• Business Plan</li>
                <li>• Financial Projections (3-5 years)</li>
                <li>• Latest Financial Statements</li>
                <li>• Term Sheet (if applicable)</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Ready to Submit!</p>
                  <p>
                    Review your campaign details below before submitting for
                    approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-neutral-200 rounded-xl p-4">
                <h4 className="font-medium text-neutral-900 mb-3">
                  Campaign Details
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Title:</dt>
                    <dd className="text-neutral-900 font-medium">
                      {watchedValues.title || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Type:</dt>
                    <dd className="text-neutral-900">
                      {CAMPAIGN_TYPES.find(
                        (t) => t.value === watchedValues.campaign_type
                      )?.label || "Not set"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border border-neutral-200 rounded-xl p-4">
                <h4 className="font-medium text-neutral-900 mb-3">
                  Funding Goals
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Target Amount:</dt>
                    <dd className="text-neutral-900 font-medium">
                      {watchedValues.target_amount
                        ? formatCurrency(watchedValues.target_amount)
                        : "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Min Investment:</dt>
                    <dd className="text-neutral-900">
                      {watchedValues.min_investment
                        ? formatCurrency(watchedValues.min_investment)
                        : "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Max Investment:</dt>
                    <dd className="text-neutral-900">
                      {watchedValues.max_investment
                        ? formatCurrency(watchedValues.max_investment)
                        : "No limit"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border border-neutral-200 rounded-xl p-4">
                <h4 className="font-medium text-neutral-900 mb-3">Timeline</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Start Date:</dt>
                    <dd className="text-neutral-900">
                      {watchedValues.start_date || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">End Date:</dt>
                    <dd className="text-neutral-900">
                      {watchedValues.end_date || "Not set"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border border-neutral-200 rounded-xl p-4">
                <h4 className="font-medium text-neutral-900 mb-3">Documents</h4>
                <p className="text-sm text-neutral-600">
                  {documents.length > 0
                    ? `${documents.length} document(s) attached`
                    : "No documents attached"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/campaigns")}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">
          Create New Campaign
        </h1>
        <p className="text-neutral-600 mt-1">
          Set up your fundraising campaign in a few simple steps
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-primary-600 text-white"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 hidden sm:block ${
                      isCurrent
                        ? "text-primary-600 font-medium"
                        : "text-neutral-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.id ? "bg-green-500" : "bg-neutral-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">
            {STEPS[currentStep - 1]?.title}
          </h2>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
              currentStep === 1
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={createCampaignMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {createCampaignMutation.isPending ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Campaign
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
