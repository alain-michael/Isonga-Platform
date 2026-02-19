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
      management_structure: "",
      sector: "",
      province: "",
      district: "",
      year_established: new Date().getFullYear(),
      description: "",
      website: "",
      email: "",
      phone_number: "",
      number_of_employees: 0,
    },
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const enterpriseTypes = [
    { value: "sole_proprietorship", label: "Sole Proprietorship" },
    { value: "partnership", label: "Partnership" },
    { value: "limited_company", label: "Limited Company" },
    { value: "cooperative", label: "Cooperative" },
    { value: "ngo", label: "NGO" },
  ];

  const managementStructures = [
    { value: "owner_managed", label: "Owner-managed" },
    { value: "professional_management", label: "Professional Management" },
  ];

  const provinces = [
    { value: "kigali_city", label: "Kigali City" },
    { value: "eastern", label: "Eastern Province" },
    { value: "western", label: "Western Province" },
    { value: "northern", label: "Northern Province" },
    { value: "southern", label: "Southern Province" },
  ];

  const sectors = [
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "number_of_employees" || name === "year_established"
          ? parseInt(value) || 0
          : value,
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

    if (!formData.management_structure) {
      newErrors.management_structure = "Management structure is required";
    }

    if (!formData.sector) {
      newErrors.sector = "Sector is required";
    }

    if (!formData.province) {
      newErrors.province = "Province is required";
    }

    if (!formData.district) {
      newErrors.district = "District is required";
    }

    const yearNum =
      typeof formData.year_established === "string"
        ? parseInt(formData.year_established)
        : formData.year_established;
    if (!yearNum || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      newErrors.year_established = "Please enter a valid year";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Business description is required";
    }

    // Email is optional but validate format if provided
    if (
      formData.email &&
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^(\+250|0)?7[0-9]{8}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Invalid Rwanda phone number format";
    }

    if (
      !formData.number_of_employees ||
      Number(formData.number_of_employees) <= 0
    ) {
      newErrors.number_of_employees =
        "Number of employees must be greater than 0";
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
      // Map frontend field names to backend field names
      const backendData = {
        ...formData,
        phone: formData.phone_number, // Map phone_number to phone
      };
      delete (backendData as any).phone_number; // Remove the frontend field

      const response = await enterpriseAPI.create(backendData);
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
    <div className="glass-effect rounded-lg shadow-sm border border-neutral-200 p-8">
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
        {/* Enterprise Type and Management Structure */}
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
                <option key={type.value} value={type.value}>
                  {type.label}
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
              htmlFor="management_structure"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Management Structure *
            </label>
            <select
              id="management_structure"
              name="management_structure"
              value={formData.management_structure}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.management_structure
                  ? "border-red-300"
                  : "border-neutral-300"
              }`}
            >
              <option value="">Select management structure</option>
              {managementStructures.map((structure) => (
                <option key={structure.value} value={structure.value}>
                  {structure.label}
                </option>
              ))}
            </select>
            {errors.management_structure && (
              <p className="text-red-600 text-sm mt-1">
                {errors.management_structure}
              </p>
            )}
          </div>
        </div>
        {/* Sector */}
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
              <option key={sector.value} value={sector.value}>
                {sector.label}
              </option>
            ))}
          </select>
          {errors.sector && (
            <p className="text-red-600 text-sm mt-1">{errors.sector}</p>
          )}
        </div>{" "}
        {/* Province and District */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Province *
            </label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.province ? "border-red-300" : "border-neutral-300"
              }`}
            >
              <option value="">Select province</option>
              {provinces.map((province) => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-red-600 text-sm mt-1">{errors.province}</p>
            )}
          </div>

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
        </div>
        {/* Number of Employees and Year Established */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="number_of_employees"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Number of Employees *
            </label>
            <input
              type="number"
              id="number_of_employees"
              name="number_of_employees"
              value={formData.number_of_employees}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.number_of_employees
                  ? "border-red-300"
                  : "border-neutral-300"
              }`}
              placeholder="Enter number of employees"
            />
            {errors.number_of_employees && (
              <p className="text-red-600 text-sm mt-1">
                {errors.number_of_employees}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="year_established"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Year Established *
            </label>
            <input
              type="number"
              id="year_established"
              name="year_established"
              value={formData.year_established}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear()}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.year_established
                  ? "border-red-300"
                  : "border-neutral-300"
              }`}
              placeholder="Enter year established"
            />
            {errors.year_established && (
              <p className="text-red-600 text-sm mt-1">
                {errors.year_established}
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
              Business Email (Optional)
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
            {loading ? "Creating Profile..." : "Complete Registration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfileStep;
