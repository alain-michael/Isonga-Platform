import React, { useState } from "react";
import { X, User, Building2 } from "lucide-react";
import { investorAPI } from "../../services/api";

interface InvestorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InvestorOnboardingModal: React.FC<InvestorOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // User account fields
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    // Investor profile fields
    investor_type: "individual",
    organization_name: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    min_investment: "",
    max_investment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the investor profile (backend should handle user creation)
      await investorAPI.create({
        user_data: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          user_type: "investor",
        },
        investor_type: formData.investor_type,
        organization_name: formData.organization_name,
        description: formData.description,
        contact_email: formData.contact_email || formData.email,
        contact_phone: formData.contact_phone,
        website: formData.website,
        min_investment: parseFloat(formData.min_investment) || 0,
        max_investment: parseFloat(formData.max_investment) || 0,
      });

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        investor_type: "individual",
        organization_name: "",
        description: "",
        contact_email: "",
        contact_phone: "",
        website: "",
        min_investment: "",
        max_investment: "",
      });
      setStep(1);
    } catch (err: any) {
      console.error("Error creating investor:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to create investor profile"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-effect dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-effect dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Onboard New Investor
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Step {step} of 2
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600" />
                  Account Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                  Investor Profile
                </h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Investor Type *
                  </label>
                  <select
                    name="investor_type"
                    value={formData.investor_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="individual">Individual Investor</option>
                    <option value="institutional">
                      Institutional Investor
                    </option>
                    <option value="vc">Venture Capital</option>
                    <option value="pe">Private Equity</option>
                    <option value="angel">Angel Investor</option>
                    <option value="bank">Bank/Financial Institution</option>
                    <option value="dfi">Development Finance Institution</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Min Investment (RWF)
                    </label>
                    <input
                      type="number"
                      name="min_investment"
                      value={formData.min_investment}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Max Investment (RWF)
                    </label>
                    <input
                      type="number"
                      name="max_investment"
                      value={formData.max_investment}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  onClose();
                } else {
                  setStep(step - 1);
                }
              }}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Investor"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestorOnboardingModal;
