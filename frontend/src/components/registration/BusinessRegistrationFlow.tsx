import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { enterpriseAPI, profileFormAPI } from "../../services/api";
import BusinessProfileStep from "./BusinessProfileStep";
import SuccessStep from "./SuccessStep";
import DynamicProfileFormRenderer from "../enterprise/DynamicProfileFormRenderer";

export interface BusinessProfile {
  business_name: string;
  tin_number: string;
  enterprise_type: string;
  management_structure: string;
  sector: string;
  province: string;
  district: string;
  year_established: number;
  description: string;
  website?: string;
  email?: string;
  phone_number: string;
  number_of_employees: number | string;
}

export interface RegistrationData {
  businessProfile: BusinessProfile | null;
  completedAssessments: number[];
  paymentCompleted: boolean;
  pdfGenerated: boolean;
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

const BusinessRegistrationFlow: React.FC = () => {
  const navigate = useNavigate();
  // step 1 = sector selection, step 2 = profile form (dynamic or legacy), step 3 = success
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState("");
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    businessProfile: null,
    completedAssessments: [],
    paymentCompleted: false,
    pdfGenerated: false,
  });
  const [dynamicFormSaving, setDynamicFormSaving] = useState(false);
  const [dynamicFormError, setDynamicFormError] = useState<string | null>(null);

  // Query the sector's profile form (only after sector chosen)
  const { data: sectorForm, isLoading: sectorFormLoading } = useQuery({
    queryKey: ["profileFormBySector", selectedSector],
    queryFn: async () => {
      try {
        const res = await profileFormAPI.getBySector(selectedSector);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!selectedSector && currentStep === 2,
  });

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const response = await enterpriseAPI.getMyEnterprise();
      const enterprise = response.data;
      setRegistrationData((prev) => ({
        ...prev,
        businessProfile: enterprise,
      }));
      navigate("/dashboard");
    } catch {
      console.log("No existing profile found");
    }
  };

  const handleSectorConfirm = () => {
    if (!selectedSector) return;
    setCurrentStep(2);
  };

  // Called when the standard BusinessProfileStep completes
  const handleProfileComplete = (data: BusinessProfile) => {
    setRegistrationData((prev) => ({ ...prev, businessProfile: data }));
    setCurrentStep(3);
  };

  // Called when the dynamic form is submitted
  const handleDynamicFormSubmit = async (
    responses: Record<string, any>,
    enterpriseFields: Record<string, any>,
  ) => {
    setDynamicFormSaving(true);
    setDynamicFormError(null);
    try {
      // Build enterprise creation payload from auto_fill values + sector
      const payload: Record<string, any> = {
        sector: selectedSector,
        ...enterpriseFields,
      };

      // Create the enterprise first
      const enterpriseRes = await enterpriseAPI.create(payload);
      const enterprise = enterpriseRes.data;

      // Then save the profile form response
      if (sectorForm) {
        await profileFormAPI.submitResponse({
          form: sectorForm.id,
          responses,
        });
      }

      setRegistrationData((prev) => ({ ...prev, businessProfile: enterprise }));
      setCurrentStep(3);
    } catch (err: any) {
      console.error("Error during registration:", err);
      const detail =
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data) ||
        "Failed to create profile. Please try again.";
      setDynamicFormError(detail);
    } finally {
      setDynamicFormSaving(false);
    }
  };

  const handleStepComplete = (step: number, data?: BusinessProfile) => {
    switch (step) {
      case 3:
        setRegistrationData((prev) => ({
          ...prev,
          businessProfile: data as BusinessProfile,
        }));
        setCurrentStep(4);
        break;
      case 4:
        navigate("/dashboard");
        break;
    }
  };

  const totalSteps = 3; // Sector → Profile → Success
  const getStepProgress = () => ((currentStep - 1) / (totalSteps - 1)) * 100;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="glass-effect rounded-lg shadow-sm border border-neutral-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Select Your Business Sector
              </h2>
              <p className="text-neutral-600">
                Choose the sector that best describes your business. This
                determines the profile form you'll complete.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {SECTORS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSelectedSector(s.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedSector === s.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-neutral-200 hover:border-primary-300 text-neutral-700"
                  }`}
                >
                  <span className="font-medium">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!selectedSector}
                onClick={handleSectorConfirm}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-md hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 2:
        // Show spinner while loading sector form
        if (sectorFormLoading) {
          return (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
            </div>
          );
        }
        // If a dynamic form exists for this sector, use it
        if (sectorForm) {
          return (
            <div>
              {dynamicFormError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600 text-sm">{dynamicFormError}</p>
                </div>
              )}
              <DynamicProfileFormRenderer
                form={sectorForm}
                existingResponses={{}}
                enterpriseData={{ sector: selectedSector } as any}
                onSubmit={handleDynamicFormSubmit}
                isSaving={dynamicFormSaving}
              />
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  ← Change sector
                </button>
              </div>
            </div>
          );
        }
        // Fallback to legacy profile form (sector already selected)
        return (
          <BusinessProfileStep
            onComplete={handleProfileComplete}
            initialData={
              registrationData.businessProfile ||
              ({ sector: selectedSector } as any)
            }
          />
        );

      case 3:
        return (
          <SuccessStep
            onComplete={() => navigate("/dashboard")}
            registrationData={registrationData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-neutral-700">
              {Math.round(getStepProgress())}% Complete
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-12">
          {[
            { num: 1, label: "Sector" },
            { num: 2, label: "Business Profile" },
            { num: 3, label: "Complete" },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.num
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-200 text-neutral-500"
                }`}
              >
                {step.num}
              </div>
              <span className="text-xs text-neutral-600 mt-2">
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default BusinessRegistrationFlow;
