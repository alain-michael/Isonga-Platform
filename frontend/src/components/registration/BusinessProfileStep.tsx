import React, { useState } from "react";
import { enterpriseAPI } from "../../services/api";
import type { BusinessProfile } from "./BusinessRegistrationFlow";

interface BusinessProfileStepProps {
  onComplete: (data: BusinessProfile) => void;
  initialData: BusinessProfile | null;
}

const BusinessProfileStep: React.FC<BusinessProfileStepProps> = ({
  onComplete,
  initialData,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(
    initialData || {
      business_name: "",
      tin_number: "",
      enterprise_type: "",
      sector: "",
      district: "",
      description: "",
      website: "",
      email: "",
      phone_number: "",
      number_of_employees: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const enterpriseTypes = [
    "Private Limited Company",
    "Public Limited Company",
    "Sole Proprietorship",
    "Partnership",
    "Cooperative",
    "NGO",
    "Government",
  ];

  const sectors = [
    "Agriculture",
    "Manufacturing",
    "Services",
    "Technology",
    "Healthcare",
    "Education",
    "Finance",
    "Construction",
    "Tourism",
    "Mining",
    "Energy",
    "Transport",
    "Trade",
    "Other",
  ];

  const districts = [
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
    "Burera",
    "Gakenke",
    "Gicumbi",
    "Musanze",
    "Rulindo",
    "Gisagara",
    "Huye",
    "Kamonyi",
    "Muhanga",
    "Nyamagabe",
    "Nyanza",
    "Nyaruguru",
    "Ruhango",
    "Karongi",
    "Ngororero",
    "Nyabihu",
    "Rubavu",
    "Rusizi",
    "Rutsiro",
    "Nyamasheke",
  ];

  const employeeRanges = ["1-10", "11-50", "51-100", "101-500", "500+"];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = "Business name is required";
    }

    if (!formData.tin_number.trim()) {
      newErrors.tin_number = "TIN number is required";
    } else if (!/^\d{9}$/.test(formData.tin_number)) {
      newErrors.tin_number = "TIN number must be 9 digits";
    }

    if (!formData.enterprise_type) {
      newErrors.enterprise_type = "Enterprise type is required";
    }

    if (!formData.sector) {
      newErrors.sector = "Sector is required";
    }

    if (!formData.district) {
      newErrors.district = "District is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Business description is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^(\+250|0)?7[0-9]{8}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Invalid Rwanda phone number format";
    }

    if (!formData.number_of_employees) {
      newErrors.number_of_employees = "Number of employees is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await enterpriseAPI.create(formData);
      const enterprise = response.data;
      onComplete(enterprise);
    } catch (error: any) {
      console.error("Error creating enterprise:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({
          general: "Failed to create business profile. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Create Your Business Profile
        </h2>
        <p className="text-neutral-600">
          Provide information about your business to get started with the Isonga
          Platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Business Name */}
        <div>
          <label
            htmlFor="business_name"
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            Business Name *
          </label>
          <input
            type="text"
            id="business_name"
            name="business_name"
            value={formData.business_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.business_name ? "border-red-300" : "border-neutral-300"
            }`}
            placeholder="Enter your business name"
          />
          {errors.business_name && (
            <p className="text-red-600 text-sm mt-1">{errors.business_name}</p>
          )}
        </div>

        {/* TIN Number */}
        <div>
          <label
            htmlFor="tin_number"
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            TIN Number *
          </label>
          <input
            type="text"
            id="tin_number"
            name="tin_number"
            value={formData.tin_number}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.tin_number ? "border-red-300" : "border-neutral-300"
            }`}
            placeholder="9-digit TIN number"
            maxLength={9}
          />
          {errors.tin_number && (
            <p className="text-red-600 text-sm mt-1">{errors.tin_number}</p>
          )}
        </div>

        {/* Enterprise Type and Sector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="enterprise_type"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Enterprise Type *
            </label>
            <select
              id="enterprise_type"
              name="enterprise_type"
              value={formData.enterprise_type}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.enterprise_type ? "border-red-300" : "border-neutral-300"
              }`}
            >
              <option value="">Select enterprise type</option>
              {enterpriseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.enterprise_type && (
              <p className="text-red-600 text-sm mt-1">
                {errors.enterprise_type}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="sector"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Sector *
            </label>
            <select
              id="sector"
              name="sector"
              value={formData.sector}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.sector ? "border-red-300" : "border-neutral-300"
              }`}
            >
              <option value="">Select sector</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            {errors.sector && (
              <p className="text-red-600 text-sm mt-1">{errors.sector}</p>
            )}
          </div>
        </div>

        {/* District and Employees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="district"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              District *
            </label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.district ? "border-red-300" : "border-neutral-300"
              }`}
            >
              <option value="">Select district</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-600 text-sm mt-1">{errors.district}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="number_of_employees"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Number of Employees *
            </label>
            <select
              id="number_of_employees"
              name="number_of_employees"
              value={formData.number_of_employees}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.number_of_employees
                  ? "border-red-300"
                  : "border-neutral-300"
              }`}
            >
              <option value="">Select range</option>
              {employeeRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            {errors.number_of_employees && (
              <p className="text-red-600 text-sm mt-1">
                {errors.number_of_employees}
              </p>
            )}
          </div>
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Business Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email ? "border-red-300" : "border-neutral-300"
              }`}
              placeholder="business@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.phone_number ? "border-red-300" : "border-neutral-300"
              }`}
              placeholder="+250 7XX XXX XXX"
            />
            {errors.phone_number && (
              <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
            )}
          </div>
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            Website (Optional)
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://www.example.com"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            Business Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.description ? "border-red-300" : "border-neutral-300"
            }`}
            placeholder="Describe your business activities, products, or services..."
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-md hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Profile..." : "Continue to Assessments"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfileStep;
