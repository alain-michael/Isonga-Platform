import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investorAPI } from "../../services/investor";
import {
  Save,
  Target,
  DollarSign,
  TrendingUp,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
} from "lucide-react";

interface CriteriaFormData {
  sectors: string[];
  min_funding_amount: number;
  max_funding_amount: number;
  min_readiness_score: number;
  auto_reject_below_score: number | null;
  preferred_revenue_range: {
    min: number | null;
    max: number | null;
  };
  required_documents: RequiredDocument[];
  preferred_sizes: string[];
  geographic_focus: string[];
}

interface RequiredDocument {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

const SECTORS = [
  { value: "agriculture", label: "Agriculture" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "technology", label: "Technology" },
  { value: "retail", label: "Retail" },
  { value: "construction", label: "Construction" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
];

const ENTERPRISE_SIZES = [
  { value: "micro", label: "Micro (1-9 employees)" },
  { value: "small", label: "Small (10-49 employees)" },
  { value: "medium", label: "Medium (50-249 employees)" },
  { value: "large", label: "Large (250+ employees)" },
];

const DISTRICTS = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Bugesera",
  "Gatsibo",
  "Kayonza",
  "Kirehe",
  "Ngoma",
  "Nyagatare",
  "Rwamagana",
  "Kamonyi",
  "Muhanga",
  "Nyanza",
  "Ruhango",
  "Gisagara",
  "Huye",
  "Karongi",
  "Ngororero",
  "Nyabihu",
  "Nyamasheke",
  "Rubavu",
  "Rusizi",
  "Rutsiro",
  "Gakenke",
  "Burera",
  "Gicumbi",
  "Musanze",
  "Rulindo",
];

const DOCUMENT_TYPES = [
  { value: "pdf", label: "PDF Document" },
  { value: "financial", label: "Financial Statement" },
  { value: "legal", label: "Legal Document" },
  { value: "business_plan", label: "Business Plan" },
  { value: "other", label: "Other" },
];

export default function PartnerCriteriaSettings() {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["investorProfile"],
    queryFn: investorAPI.getProfile,
  });

  const [formData, setFormData] = useState<CriteriaFormData>({
    sectors: [],
    min_funding_amount: 0,
    max_funding_amount: 0,
    min_readiness_score: 0,
    auto_reject_below_score: null,
    preferred_revenue_range: { min: null, max: null },
    required_documents: [],
    preferred_sizes: [],
    geographic_focus: [],
  });

  useEffect(() => {
    if (profile?.criteria && profile.criteria.length > 0) {
      const criteria = profile.criteria[0];
      setFormData({
        sectors: criteria.sectors || [],
        min_funding_amount: criteria.min_funding_amount || 0,
        max_funding_amount: criteria.max_funding_amount || 0,
        min_readiness_score: criteria.min_readiness_score || 0,
        auto_reject_below_score: criteria.auto_reject_below_score || null,
        preferred_revenue_range: criteria.preferred_revenue_range || {
          min: null,
          max: null,
        },
        required_documents: criteria.required_documents || [],
        preferred_sizes: criteria.preferred_sizes || [],
        geographic_focus: criteria.geographic_focus || [],
      });
    }
  }, [profile]);

  const updateCriteriaMutation = useMutation({
    mutationFn: async (data: CriteriaFormData) => {
      if (!profile) throw new Error("No profile");

      const payload = {
        investor: profile.id,
        sectors: data.sectors,
        min_funding_amount: data.min_funding_amount,
        max_funding_amount: data.max_funding_amount,
        min_readiness_score: data.min_readiness_score,
        auto_reject_below_score: data.auto_reject_below_score,
        preferred_revenue_range: data.preferred_revenue_range,
        required_documents: data.required_documents,
        preferred_sizes: data.preferred_sizes,
        geographic_focus: data.geographic_focus,
        is_active: true,
      };

      if (profile.criteria && profile.criteria.length > 0) {
        return investorAPI.updateCriteria(profile.criteria[0].id!, payload);
      } else {
        return investorAPI.createCriteria(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investorProfile"] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleSectorToggle = (sector: string) => {
    setFormData((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter((s) => s !== sector)
        : [...prev.sectors, sector],
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_sizes: prev.preferred_sizes.includes(size)
        ? prev.preferred_sizes.filter((s) => s !== size)
        : [...prev.preferred_sizes, size],
    }));
  };

  const handleDistrictToggle = (district: string) => {
    setFormData((prev) => ({
      ...prev,
      geographic_focus: prev.geographic_focus.includes(district)
        ? prev.geographic_focus.filter((d) => d !== district)
        : [...prev.geographic_focus, district],
    }));
  };

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      required_documents: [
        ...prev.required_documents,
        { name: "", type: "pdf", required: true, description: "" },
      ],
    }));
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      required_documents: prev.required_documents.filter((_, i) => i !== index),
    }));
  };

  const updateDocument = (
    index: number,
    field: keyof RequiredDocument,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      required_documents: prev.required_documents.map((doc, i) =>
        i === index ? { ...doc, [field]: value } : doc,
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCriteriaMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Banner */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-200 font-medium">
            Investment criteria updated successfully!
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Investment Criteria Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Configure your investment preferences and requirements for SME
          applications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Funding Range */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Funding Range
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Set your minimum and maximum investment amounts
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Minimum Funding Amount (RWF)
              </label>
              <input
                type="number"
                value={formData.min_funding_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_funding_amount: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 1000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Maximum Funding Amount (RWF)
              </label>
              <input
                type="number"
                value={formData.max_funding_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_funding_amount: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 50000000"
              />
            </div>
          </div>
        </div>

        {/* Readiness Score Requirements */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Readiness Score Requirements
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Define minimum scores for SME eligibility
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Minimum Readiness Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.min_readiness_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_readiness_score: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 60"
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                SMEs must meet this score to be considered
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Auto-Reject Below Score (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.auto_reject_below_score || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    auto_reject_below_score: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 40"
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Applications below this score are automatically declined
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Preferences */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Revenue Preferences
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Preferred annual revenue range for applicants
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Minimum Annual Revenue (RWF)
              </label>
              <input
                type="number"
                value={formData.preferred_revenue_range.min || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferred_revenue_range: {
                      ...formData.preferred_revenue_range,
                      min: e.target.value ? Number(e.target.value) : null,
                    },
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Maximum Annual Revenue (RWF)
              </label>
              <input
                type="number"
                value={formData.preferred_revenue_range.max || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferred_revenue_range: {
                      ...formData.preferred_revenue_range,
                      max: e.target.value ? Number(e.target.value) : null,
                    },
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Sector Preferences */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Sector Focus
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Select the sectors you're interested in
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SECTORS.map((sector) => (
              <button
                key={sector.value}
                type="button"
                onClick={() => handleSectorToggle(sector.value)}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.sectors.includes(sector.value)
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-500"
                }`}
              >
                {sector.label}
              </button>
            ))}
          </div>
          {formData.sectors.length === 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>Select at least one sector</span>
            </div>
          )}
        </div>

        {/* Enterprise Size Preferences */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Enterprise Size Preferences
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Select preferred enterprise sizes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ENTERPRISE_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => handleSizeToggle(size.value)}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.preferred_sizes.includes(size.value)
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-500"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Geographic Focus */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Geographic Focus
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Select districts you're interested in (leave empty for all)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2">
            {DISTRICTS.map((district) => (
              <button
                key={district}
                type="button"
                onClick={() => handleDistrictToggle(district)}
                className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                  formData.geographic_focus.includes(district)
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>

        {/* Required Documents */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Required Documents
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Specify documents applicants must provide
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addDocument}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Document
            </button>
          </div>

          <div className="space-y-4">
            {formData.required_documents.map((doc, index) => (
              <div
                key={index}
                className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700"
              >
                <div className="grid md:grid-cols-4 gap-4 mb-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) =>
                        updateDocument(index, "name", e.target.value)
                      }
                      placeholder="e.g., Business Registration Certificate"
                      className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Type
                    </label>
                    <select
                      value={doc.type}
                      onChange={(e) =>
                        updateDocument(index, "type", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={doc.required}
                        onChange={(e) =>
                          updateDocument(index, "required", e.target.checked)
                        }
                        className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        Required
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={doc.description}
                      onChange={(e) =>
                        updateDocument(index, "description", e.target.value)
                      }
                      placeholder="Additional details or requirements"
                      className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {formData.required_documents.length === 0 && (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No required documents added yet</p>
                <p className="text-xs mt-1">
                  Click "Add Document" to specify requirements
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            type="submit"
            disabled={
              updateCriteriaMutation.isPending || formData.sectors.length === 0
            }
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="h-5 w-5" />
            {updateCriteriaMutation.isPending ? "Saving..." : "Save Criteria"}
          </button>
        </div>
      </form>
    </div>
  );
}
