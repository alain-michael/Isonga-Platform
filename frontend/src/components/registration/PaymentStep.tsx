import React, { useState, useEffect } from "react";
import { paymentAPI } from "../../services/api";
import type { RegistrationData } from "./BusinessRegistrationFlow";

interface PaymentPlan {
  id: number;
  name: string;
  price: number;
  currency: string;
  duration_months: number;
  features: string[];
  is_active: boolean;
}

interface PaymentStepProps {
  onComplete: () => void;
  registrationData: RegistrationData;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  onComplete,
  registrationData,
}) => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile">("card");

  useEffect(() => {
    fetchPaymentPlans();
  }, []);

  const fetchPaymentPlans = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getPlans();
      const data = response.data;
      setPlans(data.filter((plan: PaymentPlan) => plan.is_active));
      // Auto-select first plan if available
      if (data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (error) {
      console.error("Error fetching payment plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setProcessing(true);

    try {
      // Create payment intent
      const response = await paymentAPI.createPayment({
        plan_id: selectedPlan.id,
        payment_method: paymentMethod,
      });

      const data = response.data;

      if (paymentMethod === "card") {
        // Handle Stripe payment
        handleStripePayment(data);
      } else {
        // Handle mobile money payment
        handleMobilePayment(data);
      }
    } catch (error: any) {
      console.error("Error creating payment:", error);
      if (error.response?.data) {
        console.error("Payment creation failed:", error.response.data);
      }
      alert("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePayment = async (_paymentData: any) => {
    // In a real implementation, you would integrate with Stripe Elements here
    // For now, we'll simulate a successful payment
    setTimeout(() => {
      alert("Payment successful! (This is a demo)");
      onComplete();
    }, 2000);
  };

  const handleMobilePayment = async (_paymentData: any) => {
    // In a real implementation, you would integrate with mobile money APIs here
    // For now, we'll simulate a successful payment
    setTimeout(() => {
      alert("Payment successful! (This is a demo)");
      onComplete();
    }, 2000);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-neutral-200 border-t-primary-600"></div>
          <span className="ml-2 text-neutral-600">
            Loading payment plans...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Choose Your Subscription Plan
        </h2>
        <p className="text-neutral-600">
          Select a subscription plan to access the full Isonga Platform features
          and continue monitoring your business sustainability.
        </p>
      </div>

      {/* Registration Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Registration Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-green-700">Business:</span>
            <span className="ml-2 text-green-600">
              {registrationData.businessProfile?.business_name}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Sector:</span>
            <span className="ml-2 text-green-600">
              {registrationData.businessProfile?.sector}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">
              Assessments Completed:
            </span>
            <span className="ml-2 text-green-600">
              {registrationData.completedAssessments.length}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">
              Report Generated:
            </span>
            <span className="ml-2 text-green-600">
              {registrationData.pdfGenerated ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Plans */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">
          Available Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan?.id === plan.id
                  ? "border-primary-500 bg-primary-50 shadow-md"
                  : "border-neutral-200 hover:border-primary-300 hover:shadow-sm"
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-neutral-900">
                  {plan.name}
                </h4>
                <input
                  type="radio"
                  checked={selectedPlan?.id === plan.id}
                  onChange={() => setSelectedPlan(plan)}
                  className="text-primary-600 focus:ring-primary-500"
                />
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold text-neutral-900">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="text-neutral-600 ml-1">
                  /{plan.duration_months} month
                  {plan.duration_months > 1 ? "s" : ""}
                </span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-neutral-600"
                  >
                    <svg
                      className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Selection */}
      {selectedPlan && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Payment Method
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                paymentMethod === "card"
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-primary-300"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">
                      Credit/Debit Card
                    </h4>
                    <p className="text-sm text-neutral-600">
                      Pay with Visa, Mastercard
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="text-primary-600 focus:ring-primary-500"
                />
              </div>
            </div>

            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                paymentMethod === "mobile"
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-primary-300"
              }`}
              onClick={() => setPaymentMethod("mobile")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">
                      Mobile Money
                    </h4>
                    <p className="text-sm text-neutral-600">
                      MTN Mobile Money, Airtel Money
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === "mobile"}
                  onChange={() => setPaymentMethod("mobile")}
                  className="text-primary-600 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      {selectedPlan && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Order Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">{selectedPlan.name}</span>
              <span className="font-medium">
                {formatPrice(selectedPlan.price, selectedPlan.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Duration</span>
              <span className="font-medium">
                {selectedPlan.duration_months} month
                {selectedPlan.duration_months > 1 ? "s" : ""}
              </span>
            </div>
            <div className="border-t border-neutral-200 pt-2 mt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>
                  {formatPrice(selectedPlan.price, selectedPlan.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
        >
          Back to Assessments
        </button>

        {selectedPlan && (
          <button
            onClick={handlePayment}
            disabled={processing}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-md hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ${formatPrice(selectedPlan.price, selectedPlan.currency)}`
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;
