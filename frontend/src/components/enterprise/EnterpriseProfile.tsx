import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  FileText,
  Upload,
  Globe,
  Users,
  Briefcase,
  Scale,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import { useMyEnterprise } from "../../hooks/useEnterprises";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enterpriseAPI } from "../../services/api";

// Validation schemas
const businessInfoSchema = yup.object({
  business_name: yup.string().required("Business name is required"),
  description: yup
    .string()
    .max(1000, "Description must be less than 1000 characters"),
  sector: yup.string().required("Sector is required"),
  enterprise_type: yup.string().required("Enterprise type is required"),
  enterprise_size: yup.string().required("Enterprise size is required"),
  year_established: yup
    .number()
    .required("Year established is required")
    .min(1900)
    .max(new Date().getFullYear()),
  number_of_employees: yup
    .number()
    .required("Number of employees is required")
    .min(1),
  annual_revenue: yup.number().nullable(),
});

const contactInfoSchema = yup.object({
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  district: yup.string().required("District is required"),
  phone: yup.string().required("Phone number is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  website: yup.string().url("Invalid URL").nullable(),
});

const legalInfoSchema = yup.object({
  tin_number: yup.string().required("TIN number is required"),
  registration_number: yup.string().nullable(),
});

type TabId =
  | "business"
  | "contact"
  | "legal"
  // | "management"
  | "documents"
  | "assessments";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: "business", label: "Business Info", icon: Building2 },
  { id: "contact", label: "Contact", icon: MapPin },
  { id: "legal", label: "Legal", icon: Scale },
  // { id: "management", label: "Management", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "assessments", label: "Assessments", icon: Briefcase },
];

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

const ENTERPRISE_TYPES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "limited_company", label: "Limited Company" },
  { value: "cooperative", label: "Cooperative" },
  { value: "ngo", label: "NGO" },
];

const ENTERPRISE_SIZES = [
  { value: "micro", label: "Micro (1-4 employees)" },
  { value: "small", label: "Small (5-30 employees)" },
  { value: "medium", label: "Medium (31-100 employees)" },
];

const RWANDAN_DISTRICTS = [
  "Bugesera",
  "Burera",
  "Gakenke",
  "Gasabo",
  "Gatsibo",
  "Gicumbi",
  "Gisagara",
  "Huye",
  "Kamonyi",
  "Karongi",
  "Kayonza",
  "Kicukiro",
  "Kirehe",
  "Muhanga",
  "Musanze",
  "Ngoma",
  "Ngororero",
  "Nyabihu",
  "Nyagatare",
  "Nyamagabe",
  "Nyamasheke",
  "Nyanza",
  "Nyarugenge",
  "Nyaruguru",
  "Rubavu",
  "Ruhango",
  "Rulindo",
  "Rusizi",
  "Rutsiro",
  "Rwamagana",
];

const EnterpriseProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("business");
  const [isEditing, setIsEditing] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    title: "",
    document_type: "other",
    description: "",
    fiscal_year: new Date().getFullYear().toString(),
    file: null as File | null,
  });

  const queryClient = useQueryClient();
  const { data: enterprise, isLoading, error } = useMyEnterprise();

  // Update enterprise mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => enterpriseAPI.update(enterprise?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-enterprise"] });
      setIsEditing(false);
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (formData: FormData) =>
      enterpriseAPI.uploadDocument(enterprise?.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-enterprise"] });
      setShowDocumentModal(false);
      setDocumentForm({
        title: "",
        document_type: "other",
        description: "",
        fiscal_year: new Date().getFullYear().toString(),
        file: null,
      });
    },
  });

  // Form setup for each section
  const businessForm = useForm({
    resolver: yupResolver(businessInfoSchema),
    defaultValues: {
      business_name: enterprise?.business_name || "",
      description: enterprise?.description || "",
      sector: enterprise?.sector || "",
      enterprise_type: enterprise?.enterprise_type || "",
      enterprise_size: enterprise?.enterprise_size || "",
      year_established:
        enterprise?.year_established || new Date().getFullYear(),
      number_of_employees: enterprise?.number_of_employees || 1,
      annual_revenue: enterprise?.annual_revenue || null,
    },
  });

  const contactForm = useForm({
    resolver: yupResolver(contactInfoSchema),
    defaultValues: {
      address: enterprise?.address || "",
      city: enterprise?.city || "",
      district: enterprise?.district || "",
      phone: enterprise?.phone || "",
      email: enterprise?.email || "",
      website: enterprise?.website || "",
    },
  });

  const legalForm = useForm({
    resolver: yupResolver(legalInfoSchema),
    defaultValues: {
      tin_number: enterprise?.tin_number || "",
      registration_number: enterprise?.registration_number || "",
    },
  });

  // Reset forms when enterprise data loads
  React.useEffect(() => {
    if (enterprise) {
      businessForm.reset({
        business_name: enterprise.business_name,
        description: enterprise.description || "",
        sector: enterprise.sector,
        enterprise_type: enterprise.enterprise_type,
        enterprise_size: enterprise.enterprise_size,
        year_established: enterprise.year_established,
        number_of_employees: enterprise.number_of_employees,
        annual_revenue: enterprise.annual_revenue,
      });
      contactForm.reset({
        address: enterprise.address,
        city: enterprise.city,
        district: enterprise.district,
        phone: enterprise.phone,
        email: enterprise.email,
        website: enterprise.website || "",
      });
      legalForm.reset({
        tin_number: enterprise.tin_number,
        registration_number: enterprise.registration_number || "",
      });
    }
  }, [enterprise]);

  const handleSave = async (section: string) => {
    let data = {};

    switch (section) {
      case "business":
        const businessValid = await businessForm.trigger();
        if (!businessValid) return;
        data = businessForm.getValues();
        break;
      case "contact":
        const contactValid = await contactForm.trigger();
        if (!contactValid) return;
        data = contactForm.getValues();
        break;
      case "legal":
        const legalValid = await legalForm.trigger();
        if (!legalValid) return;
        data = legalForm.getValues();
        break;
    }

    updateMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ElementType; label: string }
    > = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending Review",
      },
      under_review: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Eye,
        label: "Under Review",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: X,
        label: "Rejected",
      },
      documents_requested: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertCircle,
        label: "Documents Requested",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        <Icon className="w-4 h-4 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const handleDocumentUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentForm.file || !documentForm.title) {
      return;
    }

    const formData = new FormData();
    formData.append("file", documentForm.file);
    formData.append("title", documentForm.title);
    formData.append("document_type", documentForm.document_type);
    formData.append("fiscal_year", documentForm.fiscal_year);
    if (documentForm.description) {
      formData.append("description", documentForm.description);
    }

    uploadDocumentMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Profile
        </h3>
        <p className="text-red-600">
          Unable to load your enterprise profile. Please try again later.
        </p>
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          No Enterprise Profile
        </h3>
        <p className="text-blue-600 mb-4">
          You haven't created an enterprise profile yet.
        </p>
        <button className="btn-primary">Create Enterprise Profile</button>
      </div>
    );
  }

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-900">
          Business Information
        </h3>
        <button
          onClick={() =>
            isEditing ? handleSave("business") : setIsEditing(true)
          }
          disabled={updateMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          {updateMutation.isPending ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
          {isEditing ? "Save Changes" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Business Name
          </label>
          {isEditing ? (
            <input
              {...businessForm.register("business_name")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            />
          ) : (
            <p className="text-lg font-semibold text-neutral-900">
              {enterprise.business_name}
            </p>
          )}
          {businessForm.formState.errors.business_name && (
            <p className="text-red-500 text-sm mt-1">
              {String(businessForm.formState.errors.business_name.message)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Sector
          </label>
          {isEditing ? (
            <select
              {...businessForm.register("sector")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            >
              <option value="">Select sector</option>
              {SECTORS.map((sector) => (
                <option key={sector.value} value={sector.value}>
                  {sector.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-neutral-900">
              {SECTORS.find((s) => s.value === enterprise.sector)?.label ||
                enterprise.sector}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Enterprise Type
          </label>
          {isEditing ? (
            <select
              {...businessForm.register("enterprise_type")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            >
              <option value="">Select type</option>
              {ENTERPRISE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-neutral-900">
              {ENTERPRISE_TYPES.find(
                (t) => t.value === enterprise.enterprise_type
              )?.label || enterprise.enterprise_type}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Enterprise Size
          </label>
          {isEditing ? (
            <select
              {...businessForm.register("enterprise_size")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            >
              <option value="">Select size</option>
              {ENTERPRISE_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-neutral-900">
              {ENTERPRISE_SIZES.find(
                (s) => s.value === enterprise.enterprise_size
              )?.label || enterprise.enterprise_size}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-2" />
            Year Established
          </label>
          {isEditing ? (
            <input
              type="number"
              {...businessForm.register("year_established")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            />
          ) : (
            <p className="text-neutral-900">{enterprise.year_established}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Users className="h-4 w-4 inline mr-2" />
            Number of Employees
          </label>
          {isEditing ? (
            <input
              type="number"
              {...businessForm.register("number_of_employees")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            />
          ) : (
            <p className="text-neutral-900">{enterprise.number_of_employees}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <DollarSign className="h-4 w-4 inline mr-2" />
            Annual Revenue (RWF)
          </label>
          {isEditing ? (
            <input
              type="number"
              {...businessForm.register("annual_revenue")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
              placeholder="e.g., 50000000"
            />
          ) : (
            <p className="text-neutral-900">
              {enterprise.annual_revenue
                ? new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                  }).format(enterprise.annual_revenue)
                : "Not specified"}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Business Description
          </label>
          {isEditing ? (
            <textarea
              {...businessForm.register("description")}
              rows={4}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
              placeholder="Describe your business..."
            />
          ) : (
            <p className="text-neutral-700">
              {enterprise.description || "No description provided"}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-900">
          Contact Information
        </h3>
        <button
          onClick={() =>
            isEditing ? handleSave("contact") : setIsEditing(true)
          }
          disabled={updateMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          {updateMutation.isPending ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
          {isEditing ? "Save Changes" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-2" />
            Address
          </label>
          {isEditing ? (
            <textarea
              {...contactForm.register("address")}
              rows={2}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
            />
          ) : (
            <p className="text-neutral-900">{enterprise.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            City
          </label>
          {isEditing ? (
            <input
              {...contactForm.register("city")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            />
          ) : (
            <p className="text-neutral-900">{enterprise.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            District
          </label>
          {isEditing ? (
            <select
              {...contactForm.register("district")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            >
              <option value="">Select district</option>
              {RWANDAN_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-neutral-900">{enterprise.district}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Phone className="h-4 w-4 inline mr-2" />
            Phone Number
          </label>
          {isEditing ? (
            <input
              {...contactForm.register("phone")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
              placeholder="+250 7XX XXX XXX"
            />
          ) : (
            <p className="text-neutral-900">{enterprise.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Mail className="h-4 w-4 inline mr-2" />
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              {...contactForm.register("email")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            />
          ) : (
            <p className="text-neutral-900">{enterprise.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Globe className="h-4 w-4 inline mr-2" />
            Website
          </label>
          {isEditing ? (
            <input
              {...contactForm.register("website")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
              placeholder="https://example.com"
            />
          ) : (
            <p className="text-neutral-900">
              {enterprise.website ? (
                <a
                  href={enterprise.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {enterprise.website}
                </a>
              ) : (
                "Not provided"
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderLegalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-900">
          Legal Information
        </h3>
        <button
          onClick={() => (isEditing ? handleSave("legal") : setIsEditing(true))}
          disabled={updateMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          {updateMutation.isPending ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
          {isEditing ? "Save Changes" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Shield className="h-4 w-4 inline mr-2" />
            TIN Number
          </label>
          {isEditing ? (
            <input
              {...legalForm.register("tin_number")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            />
          ) : (
            <p className="text-neutral-900 font-mono">
              {enterprise.tin_number}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Registration Number
          </label>
          {isEditing ? (
            <input
              {...legalForm.register("registration_number")}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
            />
          ) : (
            <p className="text-neutral-900 font-mono">
              {enterprise.registration_number || "Not provided"}
            </p>
          )}
        </div>
      </div>

      {/* Verification Status */}
      <div className="mt-8 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-neutral-900">
              Verification Status
            </h4>
            <p className="text-sm text-neutral-600 mt-1">
              Your enterprise verification status with Isonga
            </p>
          </div>
          {getStatusBadge(enterprise.verification_status)}
        </div>

        {enterprise.verification_notes && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-700">
              {enterprise.verification_notes}
            </p>
          </div>
        )}

        {enterprise.documents_requested && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <h5 className="text-sm font-medium text-orange-800 mb-2">
              Documents Requested:
            </h5>
            <p className="text-sm text-orange-700">
              {enterprise.documents_requested}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // const renderManagement = () => (
  //   <div className="space-y-6">
  //     <div className="flex items-center justify-between">
  //       <h3 className="text-xl font-bold text-neutral-900">Management Team</h3>
  //       <button className="btn-primary flex items-center gap-2">
  //         <Plus className="h-4 w-4" />
  //         Add Team Member
  //       </button>
  //     </div>

  //     <p className="text-neutral-600">
  //       Add key management team members to strengthen your enterprise profile
  //       and build investor confidence.
  //     </p>

  //     <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
  //       <User className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
  //       <h4 className="font-medium text-neutral-700 mb-2">
  //         No Team Members Added
  //       </h4>
  //       <p className="text-sm text-neutral-500 mb-4">
  //         Add your CEO, CFO, CTO, and other key team members to showcase your
  //         leadership.
  //       </p>
  //       <button className="btn-secondary">
  //         <Plus className="h-4 w-4 mr-2" />
  //         Add First Team Member
  //       </button>
  //     </div>
  //   </div>
  // );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-900">Documents</h3>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowDocumentModal(true)}
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      <div className="space-y-4">
        {enterprise.documents?.length > 0 ? (
          enterprise.documents.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">{doc.title}</h4>
                  <p className="text-sm text-neutral-500">
                    {doc.document_type} • Uploaded{" "}
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.is_verified ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </span>
                )}
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition">
                  <Download className="h-4 w-4 text-neutral-600" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h4 className="font-medium text-neutral-700 mb-2">
              No Documents Uploaded
            </h4>
            <p className="text-sm text-neutral-500">
              Upload business registration, tax clearance, financial statements,
              and other supporting documents.
            </p>
          </div>
        )}
      </div>

      {/* Document Types Guide */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <h4 className="font-medium text-blue-800 mb-2">
          Recommended Documents
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Business Registration Certificate</li>
          <li>• Tax Clearance Certificate (RRA)</li>
          <li>• Latest Audited Financial Statements</li>
          <li>• Bank Statements (Last 6 months)</li>
          <li>• Business License</li>
        </ul>
      </div>
    </div>
  );

  const renderAssessments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-900">
          Completed Assessments
        </h3>
      </div>

      {enterprise.assessments?.length > 0 ? (
        <div className="space-y-4">
          {enterprise.assessments.map((assessment: any) => (
            <div
              key={assessment.id}
              className="p-4 bg-white rounded-xl border border-neutral-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">
                    {assessment.questionnaire_title || "Assessment"}
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-neutral-500">
                      Fiscal Year: {assessment.fiscal_year}
                    </p>
                    <span className="text-sm text-neutral-400">•</span>
                    <p className="text-sm text-neutral-500">
                      {assessment.completed_at
                        ? `Completed ${new Date(
                            assessment.completed_at
                          ).toLocaleDateString()}`
                        : `Status: ${assessment.status}`}
                    </p>
                  </div>
                </div>
                {assessment.status === "completed" && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {parseFloat(assessment.percentage_score).toFixed(1)}%
                    </div>
                    <div className="text-sm text-neutral-500">Score</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
          <Briefcase className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h4 className="font-medium text-neutral-700 mb-2">
            No Assessments Completed
          </h4>
          <p className="text-sm text-neutral-500 mb-4">
            Complete assessments to evaluate your business readiness and unlock
            investor matching.
          </p>
          <button className="btn-primary">Start Assessment</button>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "business":
        return renderBusinessInfo();
      case "contact":
        return renderContactInfo();
      case "legal":
        return renderLegalInfo();
      // case "management":
      //   return renderManagement();
      case "documents":
        return renderDocuments();
      case "assessments":
        return renderAssessments();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Building2 className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{enterprise.business_name}</h1>
            <p className="text-primary-100">
              {SECTORS.find((s) => s.value === enterprise.sector)?.label} •{" "}
              {
                ENTERPRISE_SIZES.find(
                  (s) => s.value === enterprise.enterprise_size
                )?.label
              }
            </p>
          </div>
          <div>{getStatusBadge(enterprise.verification_status)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsEditing(false);
                  }}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600 bg-primary-50"
                      : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </div>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-900">
                  Upload Document
                </h3>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleDocumentUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={documentForm.document_type}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      document_type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="registration_certificate">
                    Registration Certificate
                  </option>
                  <option value="tax_clearance">Tax Clearance</option>
                  <option value="business_license">Business License</option>
                  <option value="financial_statement">
                    Financial Statement
                  </option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="audit_report">Audit Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={documentForm.title}
                  onChange={(e) =>
                    setDocumentForm({ ...documentForm, title: e.target.value })
                  }
                  placeholder="e.g., Business Registration Certificate 2024"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fiscal Year *
                </label>
                <input
                  type="number"
                  value={documentForm.fiscal_year}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      fiscal_year: e.target.value,
                    })
                  }
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  value={documentForm.description}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional: Add notes about this document"
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  File *
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Accepted: PDF, Word, Excel, Images (Max 10MB)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition"
                  disabled={uploadDocumentMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={
                    uploadDocumentMutation.isPending || !documentForm.file
                  }
                >
                  {uploadDocumentMutation.isPending ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseProfile;
