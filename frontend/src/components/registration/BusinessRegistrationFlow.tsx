import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enterpriseAPI } from "../../services/api";
import BusinessProfileStep from "./BusinessProfileStep";
import AssessmentStep from "./AssessmentStep";
import SuccessStep from "./SuccessStep";

export interface BusinessProfile {
  business_name: string;
  tin_number: string;
  enterprise_type: string;
  enterprise_size: string;
  sector: string;
  district: string;
  address: string;
  city: string;
  year_established: number;
  description: string;
  website?: string;
  email: string;
  phone_number: string;
  number_of_employees: number | string;
}

export interface RegistrationData {
  businessProfile: BusinessProfile | null;
  completedAssessments: number[];
  paymentCompleted: boolean;
  pdfGenerated: boolean;
}

const BusinessRegistrationFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    businessProfile: null,
    completedAssessments: [],
    paymentCompleted: false,
    pdfGenerated: false,
  });

  useEffect(() => {
    // Check if user already has a business profile
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
      setCurrentStep(2); // Skip to assessments
    } catch (error) {
      console.log("No existing profile found");
    }
  };

  const handleStepComplete = (
    step: number,
    data?: BusinessProfile | number[]
  ) => {
    switch (step) {
      case 1:
        setRegistrationData((prev) => ({
          ...prev,
          businessProfile: data as BusinessProfile,
        }));
        setCurrentStep(2);
        break;
      case 2:
        setRegistrationData((prev) => ({
          ...prev,
          completedAssessments: data as number[],
          pdfGenerated: true,
          paymentCompleted: true, // Skip payment for now
        }));
        setCurrentStep(3); // Go to success step
        break;
      case 3:
        navigate("/dashboard");
        break;
    }
  };

  const getStepProgress = () => {
    return ((currentStep - 1) / 2) * 100; // Only 3 steps now (Profile, Assessment, Success)
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessProfileStep
            onComplete={(data) => handleStepComplete(1, data)}
            initialData={registrationData.businessProfile}
          />
        );
      case 2:
        return (
          <AssessmentStep
            onComplete={(data) => handleStepComplete(2, data)}
            businessProfile={registrationData.businessProfile!}
          />
        );
      case 3:
        return (
          <SuccessStep
            onComplete={() => handleStepComplete(3)}
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
              Step {currentStep} of 3
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
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-200 text-neutral-500"
              }`}
            >
              1
            </div>
            <span className="text-xs text-neutral-600 mt-2">
              Business Profile
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-200 text-neutral-500"
              }`}
            >
              2
            </div>
            <span className="text-xs text-neutral-600 mt-2">Assessments</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-200 text-neutral-500"
              }`}
            >
              3
            </div>
            <span className="text-xs text-neutral-600 mt-2">Complete</span>
          </div>
        </div>

        {/* Current Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default BusinessRegistrationFlow;
