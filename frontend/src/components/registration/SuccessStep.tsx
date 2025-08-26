import React from "react";
import type { RegistrationData } from "./BusinessRegistrationFlow";

interface SuccessStepProps {
  onComplete: () => void;
  registrationData: RegistrationData;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  onComplete,
  registrationData,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
      <div className="mb-8">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          Welcome to Isonga Platform!
        </h2>
        <p className="text-lg text-neutral-600 mb-8">
          Congratulations! Your business registration is complete and you're
          ready to start your sustainability journey.
        </p>
      </div>

      {/* Registration Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">
          Registration Complete
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-neutral-900 mb-2">
              Business Profile
            </h4>
            <p className="text-sm text-neutral-600 mb-1">
              <span className="font-medium">Name:</span>{" "}
              {registrationData.businessProfile?.business_name}
            </p>
            <p className="text-sm text-neutral-600 mb-1">
              <span className="font-medium">Sector:</span>{" "}
              {registrationData.businessProfile?.sector}
            </p>
            <p className="text-sm text-neutral-600">
              <span className="font-medium">TIN:</span>{" "}
              {registrationData.businessProfile?.tin_number}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-neutral-900 mb-2">Assessments</h4>
            <p className="text-sm text-neutral-600 mb-1">
              <span className="font-medium">Completed:</span>{" "}
              {registrationData.completedAssessments.length} assessments
            </p>
            <p className="text-sm text-neutral-600 mb-1">
              <span className="font-medium">Report:</span>{" "}
              {registrationData.pdfGenerated ? "Generated" : "Pending"}
            </p>
            <p className="text-sm text-neutral-600">
              <span className="font-medium">Payment:</span>{" "}
              {registrationData.paymentCompleted ? "Completed" : "Pending"}
            </p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="text-left mb-8">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4 text-center">
          What's Next?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-neutral-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Dashboard Access
            </h4>
            <p className="text-sm text-neutral-600">
              Access your personalized dashboard to monitor your sustainability
              metrics and progress.
            </p>
          </div>

          <div className="border border-neutral-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Continuous Monitoring
            </h4>
            <p className="text-sm text-neutral-600">
              Track your sustainability improvements and receive personalized
              recommendations.
            </p>
          </div>

          <div className="border border-neutral-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Expert Support
            </h4>
            <p className="text-sm text-neutral-600">
              Get guidance from sustainability experts and connect with other
              businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Platform Features Now Available
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-neutral-700">Sustainability Dashboard</span>
            </div>
            <div className="flex items-center text-sm">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-neutral-700">Assessment Reports</span>
            </div>
            <div className="flex items-center text-sm">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-neutral-700">Progress Tracking</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-neutral-700">Recommendations</span>
            </div>
            <div className="flex items-center text-sm">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-neutral-700">Document Management</span>
            </div>
            <div className="flex items-center text-sm">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-neutral-700">Expert Consultation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="space-y-4">
        <button
          onClick={onComplete}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-md hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
        >
          Enter Dashboard
        </button>

        <p className="text-sm text-neutral-500">
          You can always access your dashboard and update your business profile
          from the navigation menu.
        </p>
      </div>

      {/* Support Information */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <p className="text-sm text-neutral-600 mb-2">
          Need help getting started? Our support team is here to assist you.
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <a
            href="mailto:support@isonga.rw"
            className="text-primary-600 hover:text-primary-700"
          >
            Email Support
          </a>
          <span className="text-neutral-300">|</span>
          <a href="/help" className="text-primary-600 hover:text-primary-700">
            Help Center
          </a>
          <span className="text-neutral-300">|</span>
          <a
            href="/contact"
            className="text-primary-600 hover:text-primary-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuccessStep;
