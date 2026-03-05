import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  FileText,
  DollarSign,
  Check,
  AlertCircle,
  Upload,
  X,
  Info,
  Users,
} from "lucide-react";
import { useCreateCampaign } from "../../hooks/useCampaigns";
import api from "../../services/api";
import { campaignDocumentsAPI } from "../../services/campaignsService";
import { applicationDocumentAPI as appDocAPI } from "../../services/api";

// Form data interface
interface CampaignFormData {
  title: string;
  description: string;
  campaign_type: "equity" | "debt" | "grant" | "hybrid";
  target_amount: number;
  min_investment: number;
  max_investment?: number | null;
  use_of_funds: string;
  target_partners?: number[];
}

interface PartnerFormResponse {
  partnerId: number;
  formId: number;
  responses: Record<string, any>;
}

interface CriteriaCheck {
  partnerId: number;
  partnerName: string;
  passed: boolean;
  issues: string[];
}

// Validation schema
const campaignSchema = yup.object({
  title: yup
    .string()
    .required("Application title is required")
    .min(5, "Title must be at least 5 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters"),
  campaign_type: yup
    .string()
    .oneOf(["equity", "debt", "grant", "hybrid"] as const)
    .required("Funding type is required"),
  target_amount: yup
    .number()
    .required("Target amount is required")
    .min(100000, "Minimum target is 100,000 RWF"),
  min_investment: yup
    .number()
    .required("Minimum investment is required")
    .min(10000, "Minimum investment is 10,000 RWF"),
  max_investment: yup
    .number()
    .nullable()
    .optional()
    .transform((value, originalValue) =>
      originalValue === "" ||
      originalValue === null ||
      originalValue === undefined
        ? null
        : value,
    ),
  use_of_funds: yup.string().required("Use of funds is required"),
});

const CAMPAIGN_TYPES = [
  {
    value: "equity",
    label: "Equity",
    description: "Partners receive ownership shares in your company",
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
  { id: 1, title: "Application Details", icon: FileText },
  { id: 2, title: "Funding Goals", icon: Target },
  { id: 3, title: "Select Partners", icon: Users },
  { id: 4, title: "Partner Forms", icon: FileText },
  { id: 5, title: "Documents", icon: Upload },
  { id: 6, title: "Review", icon: Check },
];

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  // Required docs per unique key (from partner criteria)
  const [requiredDocFiles, setRequiredDocFiles] = useState<
    Record<string, File>
  >({});
  // Additional optional campaign documents
  const [additionalDocFiles, setAdditionalDocFiles] = useState<File[]>([]);
  const [partnerFormResponses, setPartnerFormResponses] = useState<
    PartnerFormResponse[]
  >([]);
  const [criteriaChecks, setCriteriaChecks] = useState<CriteriaCheck[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCampaignMutation = useCreateCampaign();

  // Fetch available partners
  const { data: partners = [] } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const response = await api.get("/investors/profiles/");
      return response.data.results || response.data;
    },
  });
  // Fetch partner forms for selected partners
  const partnerFormsQuery = useQuery({
    queryKey: ["partnerForms", selectedPartners],
    queryFn: async () => {
      if (selectedPartners.length === 0) return [];
      const response = await api.get("/investors/funding-forms/", {
        params: { partner__in: selectedPartners.join(",") },
      });
      return response.data.results || response.data;
    },
    enabled: selectedPartners.length > 0,
  });

  const partnerForms = partnerFormsQuery.data || [];
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

  // Check criteria against selected partners
  const checkCriteria = () => {
    const checks: CriteriaCheck[] = [];

    selectedPartners.forEach((partnerId) => {
      const partner = partners.find((p: any) => p.id === partnerId);
      if (!partner || !partner.criteria || partner.criteria.length === 0) {
        checks.push({
          partnerId,
          partnerName: partner?.organization_name || "Unknown Partner",
          passed: true,
          issues: [],
        });
        return;
      }

      const criteria = partner.criteria[0];
      const issues: string[] = [];

      // Check funding amount
      if (watchedValues.target_amount) {
        if (
          criteria.min_funding_amount &&
          watchedValues.target_amount < criteria.min_funding_amount
        ) {
          issues.push(
            `Your target amount (${formatCurrency(watchedValues.target_amount)}) is below their minimum (${formatCurrency(criteria.min_funding_amount)})`,
          );
        }
        if (
          criteria.max_funding_amount &&
          watchedValues.target_amount > criteria.max_funding_amount
        ) {
          issues.push(
            `Your target amount (${formatCurrency(watchedValues.target_amount)}) exceeds their maximum (${formatCurrency(criteria.max_funding_amount)})`,
          );
        }
      }

      checks.push({
        partnerId,
        partnerName: partner.organization_name,
        passed: issues.length === 0,
        issues,
      });
    });

    setCriteriaChecks(checks);
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof CampaignFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["title", "description", "campaign_type"];
        break;
      case 2:
        fieldsToValidate = ["target_amount", "min_investment", "use_of_funds"];
        // Check criteria after funding goals
        checkCriteria();
        break;
      case 3:
        // Partner selection - check if at least one partner selected
        if (selectedPartners.length === 0) {
          alert("Please select at least one funding partner");
          return;
        }
        setCurrentStep(currentStep + 1);
        return;
      case 4:
        // Partner forms - validate all forms are filled
        if (
          partnerForms.length > 0 &&
          partnerFormResponses.length < partnerForms.length
        ) {
          alert("Please complete all partner-specific forms");
          return;
        }
        setCurrentStep(currentStep + 1);
        return;
      case 5: {
        // Check required documents are uploaded
        const reqDocs = getRequiredDocList();
        const missingRequired = reqDocs.filter(
          (doc) => doc.required && !requiredDocFiles[doc.key],
        );
        if (missingRequired.length > 0) {
          alert(
            `Please upload the following required documents:\n${missingRequired
              .map(
                (d) => `• ${d.name} (required by ${d.partnerNames.join(", ")})`,
              )
              .join("\n")}`,
          );
          return;
        }
        setCurrentStep(currentStep + 1);
        return;
      }
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
    // Check if any selected partners have failing criteria
    const failingCriteria = criteriaChecks.filter((check) => !check.passed);

    if (failingCriteria.length > 0) {
      const failureMessages = failingCriteria
        .map(
          (check) =>
            `${check.partnerName}:\n${check.issues.map((issue) => `  • ${issue}`).join("\n")}`,
        )
        .join("\n\n");

      alert(
        `Cannot submit application. You do not meet the following partner criteria:\n\n${failureMessages}\n\nPlease adjust your funding goals or deselect these partners.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const campaignData = {
        ...data,
        use_of_funds: { description: data.use_of_funds },
        target_partners:
          selectedPartners.length > 0 ? selectedPartners : undefined,
      };

      const createdCampaign = await createCampaignMutation.mutateAsync(
        campaignData as any,
      );
      const campaignId = (createdCampaign as any).id;

      // Create partner applications and upload required docs
      const requiredDocList = getRequiredDocList();

      for (const partnerId of selectedPartners) {
        const partnerFormResponse = partnerFormResponses.find(
          (r) => r.partnerId === partnerId,
        );
        const partnerForm = partnerForms.find(
          (f: any) => f.partner === partnerId,
        );

        try {
          // Format form responses: { field_id: value }
          const formattedResponses: Record<string, any> = {};
          if (partnerFormResponse?.responses) {
            Object.entries(partnerFormResponse.responses).forEach(
              ([key, value]) => {
                const fieldId = key.replace("field_", "");
                formattedResponses[fieldId] = value;
              },
            );
          }

          // Create the partnerApplication
          const appResponse = await api.post(
            "/campaigns/api/partner-applications/",
            {
              campaign: campaignId,
              partner: partnerId,
              funding_form: partnerForm?.id || null,
              form_responses: formattedResponses,
            },
          );
          const applicationId = appResponse.data.id;

          // Submit the application to partner
          try {
            await api.post(
              `/campaigns/api/partner-applications/${applicationId}/submit/`,
            );
          } catch (submitErr) {
            console.warn("Could not auto-submit application:", submitErr);
          }

          // Upload required documents for this partner
          for (const doc of requiredDocList) {
            if (!doc.partnerIds.includes(partnerId)) continue;
            const file = requiredDocFiles[doc.key];
            if (!file) continue;
            const docFormData = new FormData();
            docFormData.append("application", applicationId);
            docFormData.append("document_key", doc.key);
            docFormData.append("document_name", doc.name);
            docFormData.append("file", file);
            try {
              await appDocAPI.upload(docFormData);
            } catch (docErr) {
              console.error(`Failed to upload doc ${doc.name}:`, docErr);
            }
          }
        } catch (appErr: any) {
          const errStr = JSON.stringify(appErr?.response?.data || "");
          if (errStr.includes("already exists")) {
            console.log(
              `Application for partner ${partnerId} already exists, skipping`,
            );
          } else {
            console.error(
              `Failed to create application for partner ${partnerId}:`,
              appErr,
            );
          }
        }
      }

      // Upload additional campaign documents
      for (const file of additionalDocFiles) {
        const docFormData = new FormData();
        docFormData.append("campaign", campaignId);
        docFormData.append("title", file.name);
        docFormData.append("document_type", "other");
        docFormData.append("file", file);
        try {
          await campaignDocumentsAPI.upload(docFormData);
        } catch (docErr) {
          console.error(`Failed to upload campaign doc ${file.name}:`, docErr);
        }
      }

      navigate("/campaigns");
    } catch (error: any) {
      console.error("Failed to create campaign:", error);
      console.error("Error response:", error?.response);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to create campaign. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add error handler for form validation failures
  const onError = (errors: any) => {
    console.log("=== FORM VALIDATION FAILED ===");
    console.log("Validation errors:", errors);
    alert(
      "Please check the form for validation errors:\n" +
        Object.keys(errors)
          .map((key) => `${key}: ${errors[key]?.message}`)
          .join("\n"),
    );
  };

  // Build unique required-doc list across all selected partners
  const getRequiredDocList = () => {
    const docMap = new Map<
      string,
      {
        key: string;
        name: string;
        description: string;
        required: boolean;
        partnerIds: number[];
        partnerNames: string[];
      }
    >();
    selectedPartners.forEach((pId) => {
      const partner = partners.find((p: any) => p.id === pId);
      const docs: any[] = partner?.criteria?.[0]?.required_documents || [];
      docs.forEach((doc: any) => {
        const key = (doc.type || doc.name || "")
          .toLowerCase()
          .replace(/\s+/g, "_");
        if (!key) return;
        if (docMap.has(key)) {
          const existing = docMap.get(key)!;
          if (!existing.partnerIds.includes(pId)) {
            existing.partnerIds.push(pId);
            existing.partnerNames.push(partner?.organization_name || "");
          }
        } else {
          docMap.set(key, {
            key,
            name: doc.name || doc.type || key,
            description: doc.description || "",
            required: doc.required !== false,
            partnerIds: [pId],
            partnerNames: [partner?.organization_name || ""],
          });
        }
      });
    });
    return Array.from(docMap.values());
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
                Application Title *
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
                Funding Type *
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
                Application Description *
              </label>
              <textarea
                {...register("description")}
                rows={6}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
                placeholder="Describe your funding application, what you're raising funds for, and why funding partners should be interested..."
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
                  <p className="font-medium mb-1">Funding Terms</p>
                  <p>
                    Be transparent about how funds will be used. This builds
                    trust with potential funding partners and increases your
                    chances of reaching your target.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                <Users className="h-4 w-4 inline mr-2" />
                Select Funding Partners *
              </label>
              <p className="text-sm text-neutral-500 mb-4">
                Select at least one funding partner to target with this
                application. Each partner may have their own requirements and
                application forms.
              </p>

              <div className="space-y-3">
                {partners.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No partners available</p>
                  </div>
                ) : (
                  partners.map((partner: any) => (
                    <label
                      key={partner.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                        selectedPartners.includes(partner.id)
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPartners.includes(partner.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPartners([
                              ...selectedPartners,
                              partner.id,
                            ]);
                          } else {
                            setSelectedPartners(
                              selectedPartners.filter(
                                (id) => id !== partner.id,
                              ),
                            );
                          }
                        }}
                        className="h-5 w-5 text-primary-600 border-neutral-300 rounded mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-neutral-900">
                            {partner.organization_name}
                          </span>
                          <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded capitalize">
                            {partner.investor_type}
                          </span>
                        </div>
                        {partner.description && (
                          <p className="text-sm text-neutral-600 line-clamp-2">
                            {partner.description}
                          </p>
                        )}
                        {partner.criteria && partner.criteria.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {partner.criteria[0].sectors
                              ?.slice(0, 3)
                              .map((sector: string) => (
                                <span
                                  key={sector}
                                  className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                                >
                                  {sector}
                                </span>
                              ))}
                            {partner.criteria[0].sectors?.length > 3 && (
                              <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                                +{partner.criteria[0].sectors.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedPartners.length > 0 && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <p className="text-sm text-primary-800">
                    <strong>{selectedPartners.length}</strong> partner
                    {selectedPartners.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
              )}
            </div>

            {criteriaChecks.length > 0 &&
              criteriaChecks.some((check) => !check.passed) && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-2">Criteria Warnings</p>
                      {criteriaChecks
                        .filter((check) => !check.passed)
                        .map((check) => (
                          <div key={check.partnerId} className="mb-2">
                            <p className="font-medium">{check.partnerName}:</p>
                            <ul className="list-disc list-inside ml-2">
                              {check.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      <p className="mt-2 text-xs">
                        You can still apply, but you may not meet all partner
                        requirements.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Partner Targeting</p>
                  <p>
                    Selecting partners helps focus your application on those
                    most aligned with your business. Each partner may have their
                    own requirements and application forms.
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
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                <FileText className="h-4 w-4 inline mr-2" />
                Partner Application Forms
              </label>
              <p className="text-sm text-neutral-500 mb-4">
                Complete the required forms from your selected partners.
              </p>

              {partnerFormsQuery.isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-sm text-neutral-500 mt-2">
                    Loading partner forms...
                  </p>
                </div>
              ) : partnerForms.length > 0 ? (
                <div className="space-y-6">
                  {partnerForms.map((form: any) => {
                    const partner = partners.find(
                      (p: any) => p.id === form.partner,
                    );
                    const existingResponse = partnerFormResponses.find(
                      (r) =>
                        r.partnerId === form.partner && r.formId === form.id,
                    );

                    return (
                      <div
                        key={form.id}
                        className="border-2 border-neutral-200 rounded-xl p-6"
                      >
                        <div className="mb-6">
                          <h3 className="font-medium text-neutral-900">
                            {partner?.organization_name || form.partner_name}
                          </h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            {form.name}
                          </p>
                          {form.description && (
                            <p className="text-sm text-neutral-500 mt-1">
                              {form.description}
                            </p>
                          )}
                        </div>

                        {/* Render sections with their fields */}
                        <div className="space-y-6">
                          {form.sections &&
                            form.sections.map((section: any) => (
                              <div key={section.id} className="space-y-4">
                                <div className="border-b border-neutral-200 pb-2">
                                  <h4 className="font-medium text-neutral-800">
                                    {section.title}
                                  </h4>
                                  {section.description && (
                                    <p className="text-xs text-neutral-500 mt-1">
                                      {section.description}
                                    </p>
                                  )}
                                </div>

                                {section.fields &&
                                  section.fields.map((field: any) => {
                                    const fieldKey = `field_${field.id}`;
                                    return (
                                      <div key={field.id}>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                          {field.label}
                                          {field.is_required && (
                                            <span className="text-red-500 ml-1">
                                              *
                                            </span>
                                          )}
                                        </label>

                                        {field.field_type === "text" && (
                                          <input
                                            type="text"
                                            value={
                                              existingResponse?.responses?.[
                                                fieldKey
                                              ] || ""
                                            }
                                            onChange={(e) => {
                                              const updatedResponses =
                                                partnerFormResponses.filter(
                                                  (r) =>
                                                    !(
                                                      r.partnerId ===
                                                        form.partner &&
                                                      r.formId === form.id
                                                    ),
                                                );
                                              setPartnerFormResponses([
                                                ...updatedResponses,
                                                {
                                                  partnerId: form.partner,
                                                  formId: form.id,
                                                  responses: {
                                                    ...(existingResponse?.responses ||
                                                      {}),
                                                    [fieldKey]: e.target.value,
                                                  },
                                                },
                                              ]);
                                            }}
                                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                                            placeholder={field.help_text || ""}
                                          />
                                        )}

                                        {field.field_type === "textarea" && (
                                          <textarea
                                            value={
                                              existingResponse?.responses?.[
                                                fieldKey
                                              ] || ""
                                            }
                                            onChange={(e) => {
                                              const updatedResponses =
                                                partnerFormResponses.filter(
                                                  (r) =>
                                                    !(
                                                      r.partnerId ===
                                                        form.partner &&
                                                      r.formId === form.id
                                                    ),
                                                );
                                              setPartnerFormResponses([
                                                ...updatedResponses,
                                                {
                                                  partnerId: form.partner,
                                                  formId: form.id,
                                                  responses: {
                                                    ...(existingResponse?.responses ||
                                                      {}),
                                                    [fieldKey]: e.target.value,
                                                  },
                                                },
                                              ]);
                                            }}
                                            rows={4}
                                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
                                            placeholder={field.help_text || ""}
                                          />
                                        )}

                                        {field.field_type === "number" && (
                                          <input
                                            type="number"
                                            value={
                                              existingResponse?.responses?.[
                                                fieldKey
                                              ] || ""
                                            }
                                            onChange={(e) => {
                                              const updatedResponses =
                                                partnerFormResponses.filter(
                                                  (r) =>
                                                    !(
                                                      r.partnerId ===
                                                        form.partner &&
                                                      r.formId === form.id
                                                    ),
                                                );
                                              setPartnerFormResponses([
                                                ...updatedResponses,
                                                {
                                                  partnerId: form.partner,
                                                  formId: form.id,
                                                  responses: {
                                                    ...(existingResponse?.responses ||
                                                      {}),
                                                    [fieldKey]: e.target.value,
                                                  },
                                                },
                                              ]);
                                            }}
                                            min={field.min_value || undefined}
                                            max={field.max_value || undefined}
                                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                                            placeholder={field.help_text || ""}
                                          />
                                        )}

                                        {field.field_type === "select" && (
                                          <select
                                            value={
                                              existingResponse?.responses?.[
                                                fieldKey
                                              ] || ""
                                            }
                                            onChange={(e) => {
                                              const updatedResponses =
                                                partnerFormResponses.filter(
                                                  (r) =>
                                                    !(
                                                      r.partnerId ===
                                                        form.partner &&
                                                      r.formId === form.id
                                                    ),
                                                );
                                              setPartnerFormResponses([
                                                ...updatedResponses,
                                                {
                                                  partnerId: form.partner,
                                                  formId: form.id,
                                                  responses: {
                                                    ...(existingResponse?.responses ||
                                                      {}),
                                                    [fieldKey]: e.target.value,
                                                  },
                                                },
                                              ]);
                                            }}
                                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                                          >
                                            <option value="">
                                              Select an option
                                            </option>
                                            {field.choices?.map(
                                              (choice: string) => (
                                                <option
                                                  key={choice}
                                                  value={choice}
                                                >
                                                  {choice}
                                                </option>
                                              ),
                                            )}
                                          </select>
                                        )}

                                        {field.help_text && (
                                          <p className="text-xs text-neutral-500 mt-1">
                                            {field.help_text}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No additional forms required from selected partners</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Partner Requirements</p>
                  <p>
                    Each partner may request specific information through these
                    forms. Complete all required fields to proceed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: {
        const requiredDocList = getRequiredDocList();
        return (
          <div className="space-y-6">
            {/* Required documents from partner criteria */}
            {requiredDocList.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Required Documents
                </label>
                <p className="text-sm text-neutral-500 mb-4">
                  The following documents are required by your selected funding
                  partners.
                </p>
                <div className="space-y-4">
                  {requiredDocList.map((doc) => (
                    <div
                      key={doc.key}
                      className={`p-4 border-2 rounded-xl transition ${
                        requiredDocFiles[doc.key]
                          ? "border-green-400 bg-green-50"
                          : doc.required
                            ? "border-neutral-300"
                            : "border-dashed border-neutral-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-neutral-900">
                              {doc.name}
                            </span>
                            {doc.required ? (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                Required
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                                Optional
                              </span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-sm text-neutral-500 mt-0.5">
                              {doc.description}
                            </p>
                          )}
                          <p className="text-xs text-primary-600 mt-1">
                            Required by: {doc.partnerNames.join(", ")}
                          </p>
                        </div>
                        {requiredDocFiles[doc.key] && (
                          <button
                            type="button"
                            onClick={() =>
                              setRequiredDocFiles((prev) => {
                                const updated = { ...prev };
                                delete updated[doc.key];
                                return updated;
                              })
                            }
                            className="ml-2 p-1 hover:bg-neutral-200 rounded-full transition"
                          >
                            <X className="h-4 w-4 text-neutral-500" />
                          </button>
                        )}
                      </div>
                      {requiredDocFiles[doc.key] ? (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <FileText className="h-4 w-4" />
                          <span>{requiredDocFiles[doc.key].name}</span>
                          <span className="text-xs text-neutral-500">
                            (
                            {(
                              requiredDocFiles[doc.key].size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB)
                          </span>
                        </div>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                          <Upload className="h-4 w-4" />
                          <span>Click to upload</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                setRequiredDocFiles((prev) => ({
                                  ...prev,
                                  [doc.key]: file,
                                }));
                            }}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedPartners.length > 0 ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  No specific documents required
                </p>
                <p className="text-sm text-blue-700">
                  None of your selected partners have specified required
                  documents. You can still upload optional supporting documents
                  below.
                </p>
              </div>
            ) : null}

            {/* Additional optional documents */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {requiredDocList.length > 0
                  ? "Additional Documents (Optional)"
                  : "Supporting Documents"}
              </label>
              <p className="text-sm text-neutral-500 mb-4">
                Upload any additional documents to support your funding
                application.
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
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files)
                        setAdditionalDocFiles((prev) => [
                          ...prev,
                          ...Array.from(files),
                        ]);
                    }}
                  />
                </label>
                <p className="text-sm text-neutral-500 mt-2">
                  PDF, DOC, XLS, PPT up to 10MB each
                </p>
              </div>
              {additionalDocFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {additionalDocFiles.map((file, index) => (
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
                        type="button"
                        onClick={() =>
                          setAdditionalDocFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="p-1 hover:bg-neutral-200 rounded-full transition"
                      >
                        <X className="h-4 w-4 text-neutral-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 6:
        return (
          <div className="space-y-6">
            {criteriaChecks.some((check) => !check.passed) && (
              <div className="bg-red-50 rounded-xl p-4 border-2 border-red-300 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-bold text-base mb-2">
                      Cannot Submit Application
                    </p>
                    <p className="mb-3">
                      Your application does not meet the criteria requirements
                      for the following partners:
                    </p>
                    {criteriaChecks
                      .filter((check) => !check.passed)
                      .map((check) => (
                        <div
                          key={check.partnerId}
                          className="mb-3 bg-white/50 p-3 rounded-lg"
                        >
                          <p className="font-semibold mb-1">
                            {check.partnerName}:
                          </p>
                          <ul className="list-disc list-inside ml-2 space-y-1">
                            {check.issues.map((issue, idx) => (
                              <li key={idx} className="text-xs">
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    <p className="font-medium mt-3">
                      Please go back to Step 2 and adjust your funding goals, or
                      go back to Step 3 and deselect these partners.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-2">
                      Please fix the following errors:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(errors).map(([field, error]: any) => (
                        <li key={field}>
                          {field}: {error?.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Ready to Submit!</p>
                  <p>
                    Review your funding application details below before
                    submitting for approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-neutral-200 rounded-xl p-4">
                <h4 className="font-medium text-neutral-900 mb-3">
                  Application Details
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
                        (t) => t.value === watchedValues.campaign_type,
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

              {criteriaChecks.length > 0 && (
                <div className="border border-neutral-200 rounded-xl p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">
                    Criteria Validation
                  </h4>
                  <div className="space-y-3">
                    {criteriaChecks.map((check) => (
                      <div
                        key={check.partnerId}
                        className={`p-3 rounded-lg ${
                          check.passed
                            ? "bg-green-50 border border-green-200"
                            : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {check.passed ? (
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p
                              className={`font-medium text-sm ${
                                check.passed
                                  ? "text-green-800"
                                  : "text-yellow-800"
                              }`}
                            >
                              {check.partnerName}
                            </p>
                            {check.passed ? (
                              <p className="text-xs text-green-700 mt-1">
                                Meets all criteria requirements
                              </p>
                            ) : (
                              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                {check.issues.map((issue, idx) => (
                                  <li key={idx}>• {issue}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {partnerFormResponses.length > 0 && (
                <div className="border border-neutral-200 rounded-xl p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">
                    Partner Forms
                  </h4>
                  <p className="text-sm text-neutral-600">
                    {partnerFormResponses.length} partner form(s) completed
                  </p>
                </div>
              )}

              <div className="border border-neutral-200 rounded-xl p-4">
                <h4 className="font-medium text-neutral-900 mb-3">
                  Target Partners
                </h4>
                <p className="text-sm text-neutral-600">
                  {selectedPartners.length > 0 ? (
                    <>
                      <strong>{selectedPartners.length}</strong> specific
                      partner
                      {selectedPartners.length !== 1 ? "s" : ""} selected
                    </>
                  ) : (
                    "Visible to all partners"
                  )}
                </p>
                {selectedPartners.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {partners
                      .filter((p: any) => selectedPartners.includes(p.id))
                      .map((partner: any) => (
                        <span
                          key={partner.id}
                          className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded"
                        >
                          {partner.organization_name}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="border border-neutral-200 rounded-xl p-4">
                <h4 className="font-medium text-neutral-900 mb-3">Documents</h4>
                {(() => {
                  const reqList = getRequiredDocList();
                  const uploadedReq = reqList.filter(
                    (d) => requiredDocFiles[d.key],
                  ).length;
                  const totalReq = reqList.filter((d) => d.required).length;
                  return (
                    <div className="text-sm text-neutral-600 space-y-1">
                      {reqList.length > 0 && (
                        <p>
                          Required docs:{" "}
                          <span
                            className={
                              uploadedReq < totalReq
                                ? "text-red-600 font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {uploadedReq}/{totalReq} uploaded
                          </span>
                        </p>
                      )}
                      {additionalDocFiles.length > 0 && (
                        <p>
                          {additionalDocFiles.length} additional document(s)
                        </p>
                      )}
                      {reqList.length === 0 &&
                        additionalDocFiles.length === 0 && (
                          <p>No documents attached</p>
                        )}
                    </div>
                  );
                })()}
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
          Back to Funding Applications
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">
          New Funding Application
        </h1>
        <p className="text-neutral-600 mt-1">
          Set up your funding application in a few simple steps
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
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="glass-effect rounded-2xl border border-neutral-200 shadow-sm p-6 mb-6">
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
              disabled={
                createCampaignMutation.isPending ||
                isSubmitting ||
                criteriaChecks.some((check) => !check.passed)
              }
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
                createCampaignMutation.isPending ||
                isSubmitting ||
                criteriaChecks.some((check) => !check.passed)
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "btn-primary"
              }`}
              onClick={() =>
                console.log("Create Funding Application button clicked!")
              }
            >
              {createCampaignMutation.isPending || isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Submitting...
                </>
              ) : criteriaChecks.some((check) => !check.passed) ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Cannot Submit - Criteria Not Met
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit Application
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
