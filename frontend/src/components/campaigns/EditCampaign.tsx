import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react";
import { useCampaign, useUpdateCampaign } from "../../hooks/useCampaigns";

// Form data interface
interface CampaignFormData {
  title: string;
  description: string;
  campaign_type: "equity" | "debt" | "grant" | "hybrid";
  target_amount: number;
  min_investment: number;
  max_investment?: number | null | undefined;
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
  max_investment: yup
    .number()
    .nullable()
    .optional()
    .transform((value, originalValue) =>
      originalValue === "" ||
      originalValue === null ||
      originalValue === undefined
        ? null
        : value
    ),
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

const EditCampaign: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: campaign,
    isLoading: loadingCampaign,
    error: campaignError,
  } = useCampaign(id);
  const updateCampaignMutation = useUpdateCampaign();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CampaignFormData>({
    resolver: yupResolver(campaignSchema) as any,
  });

  // Watch campaign type for UI changes
  const selectedType = watch("campaign_type");

  // Reset form when campaign data loads
  useEffect(() => {
    if (campaign) {
      reset({
        title: campaign.title,
        description: campaign.description,
        campaign_type: campaign.campaign_type,
        target_amount: campaign.target_amount,
        min_investment: campaign.min_investment,
        max_investment: campaign.max_investment,
        start_date: campaign.start_date || "",
        end_date: campaign.end_date || "",
        use_of_funds:
          typeof campaign.use_of_funds === "string"
            ? campaign.use_of_funds
            : campaign.use_of_funds?.description ||
              JSON.stringify(campaign.use_of_funds),
      });
    }
  }, [campaign, reset]);

  const onSubmit = async (data: CampaignFormData) => {
    if (!id) return;

    try {
      // If campaign was vetted or active, reset it to draft to require re-approval
      const updateData: any = {
        ...data,
        use_of_funds: { description: data.use_of_funds },
      };

      if (campaign && (campaign.is_vetted || campaign.status === "active")) {
        updateData.status = "draft";
        updateData.is_vetted = false;
        updateData.vetted_by = null;
        updateData.vetted_at = null;
      }

      await updateCampaignMutation.mutateAsync({
        id,
        data: updateData,
      });
      navigate(`/campaigns/${id}`);
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  if (loadingCampaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (campaignError || !campaign) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Campaign Not Found
        </h3>
        <p className="text-red-600 mb-4">
          Unable to load this campaign for editing.
        </p>
        <button onClick={() => navigate("/campaigns")} className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </button>
      </div>
    );
  }

  // Don't allow editing if campaign is completed or cancelled
  if (campaign.status === "completed" || campaign.status === "cancelled") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Cannot Edit Campaign
        </h3>
        <p className="text-yellow-600 mb-4">
          This campaign cannot be edited because it is {campaign.status}.
        </p>
        <button
          onClick={() => navigate(`/campaigns/${id}`)}
          className="btn-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaign
        </button>
      </div>
    );
  }

  // Warning for vetted/active campaigns
  const showEditWarning = campaign.is_vetted || campaign.status === "active";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/campaigns/${id}`)}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaign
        </button>
        <h1 className="text-3xl font-bold text-neutral-900">Edit Campaign</h1>
        <p className="text-neutral-600 mt-2">Update your campaign details</p>

        {showEditWarning && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900">
                  Re-approval Required
                </h4>
                <p className="text-sm text-orange-700 mt-1">
                  This campaign has been approved. Any changes you make will
                  reset it to draft status and require admin re-approval before
                  it can be activated again.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Basic Details */}
        <div className="glass-effect rounded-2xl p-6 border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            Campaign Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Campaign Title *
              </label>
              <input
                {...register("title")}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="e.g., Series A Funding for Agricultural Innovation"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
                placeholder="Describe your campaign, what you're raising funds for, and why investors should support you..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Campaign Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CAMPAIGN_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                      selectedType === type.value
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      {...register("campaign_type")}
                      value={type.value}
                      className="sr-only"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">
                        {type.label}
                      </div>
                      <div className="text-sm text-neutral-500 mt-1">
                        {type.description}
                      </div>
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
          </div>
        </div>

        {/* Funding Goals */}
        <div className="glass-effect rounded-2xl p-6 border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            Funding Goals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
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
            </div>

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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Maximum Investment (RWF) - Optional
              </label>
              <input
                type="number"
                {...register("max_investment")}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="e.g., 10000000 (leave empty for no limit)"
              />
              {errors.max_investment && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.max_investment.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-effect rounded-2xl p-6 border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            Campaign Timeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
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
        </div>

        {/* Use of Funds */}
        <div className="glass-effect rounded-2xl p-6 border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            Use of Funds
          </h2>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              How will you use the funds? *
            </label>
            <textarea
              {...register("use_of_funds")}
              rows={6}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
              placeholder="Provide a detailed breakdown of how you plan to use the funds..."
            />
            {errors.use_of_funds && (
              <p className="text-red-500 text-sm mt-1">
                {errors.use_of_funds.message}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/campaigns/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateCampaignMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {updateCampaignMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCampaign;
