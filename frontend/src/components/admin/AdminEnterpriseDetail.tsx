import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { enterpriseAPI } from "../../services/api";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Globe,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  MoreVertical,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface Enterprise {
  id: number;
  business_name: string;
  sector: string;
  district: string;
  is_vetted: boolean;
  created_at: string;
  number_of_employees: number;
  annual_revenue: string;
  description: string;
  registration_number?: string;
  tin_number?: string;
  website?: string;
  phone_number?: string;
  email?: string;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminEnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("profile");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "verified" | "rejected" | "request_documents" | null
  >(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(id);
    if (id) {
      fetchEnterprise();
    }
  }, [id]);

  const fetchEnterprise = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(id);
      const response = await enterpriseAPI.getById(id!);
      setEnterprise(response.data);
    } catch (err) {
      console.error("Error fetching enterprise:", err);
      setError("Failed to load enterprise data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !enterprise) return;

    try {
      if (selectedStatus === "verified") {
        await enterpriseAPI.vet(enterprise.id.toString());
        await fetchEnterprise(); // Refresh data
      }
      setShowStatusModal(false);
      setSelectedStatus(null);
      setStatusNotes("");
    } catch (err) {
      console.error("Error updating enterprise status:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (isVetted: boolean) => {
    if (isVetted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800 border border-success-200">
          <CheckCircle className="h-4 w-4 mr-1" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-800 border border-warning-200">
          <Clock className="h-4 w-4 mr-1" />
          Pending
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-lg font-medium text-neutral-600">
            Loading enterprise...
          </span>
        </div>
      </div>
    );
  }

  if (error || !enterprise) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-effect rounded-2xl p-8 border-2 border-error-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-error-100 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-error-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-error-800">Error</h3>
                <p className="text-error-700 mt-1">
                  {error || "Enterprise not found"}
                </p>
              </div>
            </div>
            <button onClick={fetchEnterprise} className="btn-primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/enterprises"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Enterprises
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {enterprise.business_name}
              </h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {enterprise.sector}
                </span>
                <span className="text-neutral-400 dark:text-neutral-600">
                  •
                </span>
                {getStatusBadge(enterprise.is_vetted)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!enterprise.is_vetted && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="btn-primary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Enterprise
              </button>
            )}
            <button className="btn-secondary">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="glass-effect rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Location
            </span>
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
            {enterprise.district}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-secondary-600 dark:text-secondary-400 mr-2" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Employees
            </span>
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
            {enterprise.number_of_employees}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-success-600 dark:text-success-400 mr-2" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Revenue
            </span>
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
            {enterprise.annual_revenue}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-warning-600 dark:text-warning-400 mr-2" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Registered
            </span>
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
            {formatDate(enterprise.created_at)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="-mb-px flex justify-between sm:space-x-8">
            {[
              { id: "profile", label: "Enterprise Profile", icon: Building2 },
              { id: "contact", label: "Contact Information", icon: Mail },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "activity", label: "Activity Log", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-6 w-6 sm:h-4 sm:w-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Enterprise Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Business Name
              </label>
              <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                {enterprise.business_name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Sector
              </label>
              <p className="text-neutral-900 dark:text-neutral-100">
                {enterprise.sector}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Registration Number
              </label>
              <p className="text-neutral-900 dark:text-neutral-100">
                {enterprise.registration_number || "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                TIN Number
              </label>
              <p className="text-neutral-900 dark:text-neutral-100">
                {enterprise.tin_number || "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Employee Count
              </label>
              <p className="text-neutral-900 dark:text-neutral-100">
                {enterprise.number_of_employees}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Annual Revenue
              </label>
              <p className="text-neutral-900 dark:text-neutral-100">
                {enterprise.annual_revenue}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Business Description
              </label>
              <p className="text-neutral-900 dark:text-neutral-100">
                {enterprise.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "contact" && (
        <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Contact Information
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Business Owner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Owner Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {enterprise.user.first_name} {enterprise.user.last_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Username
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {enterprise.user.username}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email Address
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {enterprise.user.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Phone Number
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {enterprise.phone_number || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {enterprise.website && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Website
                </label>
                <a
                  href={enterprise.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {enterprise.website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Documents
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            No documents found
          </p>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="glass-effect rounded-2xl p-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Activity Log
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            No activity found
          </p>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Update Enterprise Status
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus || ""}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full rounded-lg border-2 border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3"
                >
                  <option value="">Select status...</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="request_documents">Request Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border-2 border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                  placeholder="Add any notes about this status change..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus(null);
                  setStatusNotes("");
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnterpriseDetail;
