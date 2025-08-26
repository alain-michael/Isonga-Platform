import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  Star,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Award,
  Activity,
  MoreVertical,
  Edit,
  Download,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const AdminEnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("profile");
  const [showVettingModal, setShowVettingModal] = useState(false);
  const [vettingAction, setVettingAction] = useState<"approve" | "reject" | null>(null);
  const [vettingNotes, setVettingNotes] = useState("");

  // Mock enterprise data - in real app, this would be fetched based on the ID
  const enterprise = {
    id: parseInt(id || "1"),
    name: "TechCorp Solutions Ltd",
    industry: "Technology",
    status: "pending",
    location: "Kigali, Rwanda",
    registrationDate: "2024-03-15",
    employeeCount: 45,
    revenue: "$2.5M",
    email: "admin@techcorp.rw",
    phone: "+250 788 123 456",
    website: "www.techcorp.rw",
    rating: 4.8,
    assessmentsCompleted: 3,
    lastActivity: "2024-08-25",
    verifiedDate: null,
    description: "Leading technology solutions provider specializing in software development, digital transformation, and IT consulting services for SMEs across East Africa.",
    address: "KG 9 Ave, Nyarugenge District, Kigali, Rwanda",
    registrationNumber: "RW/2024/TECH/001",
    taxId: "TIN-123456789",
    foundedYear: 2020,
    documents: {
      submitted: 8,
      verified: 6,
      pending: 2
    },
    complianceScore: 85,
    riskLevel: "medium",
    contactPerson: {
      name: "John Uwimana",
      title: "Managing Director",
      email: "john@techcorp.rw",
      phone: "+250 788 123 456"
    }
  };

  const assessments = [
    {
      id: 1,
      type: "Financial Assessment",
      score: 87,
      completedDate: "2024-08-20",
      status: "completed"
    },
    {
      id: 2,
      type: "Operations Assessment",
      score: 92,
      completedDate: "2024-08-15",
      status: "completed"
    },
    {
      id: 3,
      type: "Market Analysis",
      score: null,
      completedDate: null,
      status: "in_progress"
    }
  ];

  const documents = [
    {
      id: 1,
      name: "Business Registration Certificate",
      type: "Legal",
      uploadDate: "2024-03-15",
      status: "verified",
      verifiedBy: "Admin User",
      verifiedDate: "2024-03-16"
    },
    {
      id: 2,
      name: "Tax Identification Certificate",
      type: "Financial",
      uploadDate: "2024-03-15",
      status: "verified",
      verifiedBy: "Admin User",
      verifiedDate: "2024-03-16"
    },
    {
      id: 3,
      name: "Financial Statements 2023",
      type: "Financial",
      uploadDate: "2024-03-16",
      status: "pending",
      verifiedBy: null,
      verifiedDate: null
    }
  ];

  const activities = [
    {
      id: 1,
      type: "assessment_completed",
      description: "Completed Operations Assessment",
      timestamp: "2024-08-20T10:30:00Z",
      score: 92
    },
    {
      id: 2,
      type: "document_uploaded",
      description: "Uploaded Financial Statements 2023",
      timestamp: "2024-08-16T14:20:00Z"
    },
    {
      id: 3,
      type: "profile_updated",
      description: "Updated company profile information",
      timestamp: "2024-08-10T09:15:00Z"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-success-100 text-success-800 border-success-200";
      case "pending":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "rejected":
        return "bg-error-100 text-error-800 border-error-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const handleVettingSubmit = () => {
    if (vettingAction && vettingNotes.trim()) {
      console.log(`${vettingAction} enterprise with notes: ${vettingNotes}`);
      setShowVettingModal(false);
      setVettingAction(null);
      setVettingNotes("");
      // In real app, this would make an API call to update the enterprise status
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            {/* Company Information */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Registration Number
                  </label>
                  <p className="text-neutral-900">{enterprise.registrationNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Tax ID
                  </label>
                  <p className="text-neutral-900">{enterprise.taxId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Founded Year
                  </label>
                  <p className="text-neutral-900">{enterprise.foundedYear}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Address
                  </label>
                  <p className="text-neutral-900">{enterprise.address}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <p className="text-neutral-900">{enterprise.description}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Primary Contact
                  </label>
                  <p className="text-neutral-900 font-medium">{enterprise.contactPerson.name}</p>
                  <p className="text-neutral-600">{enterprise.contactPerson.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Contact Email
                  </label>
                  <p className="text-neutral-900">{enterprise.contactPerson.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Contact Phone
                  </label>
                  <p className="text-neutral-900">{enterprise.contactPerson.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Website
                  </label>
                  <a href={`https://${enterprise.website}`} className="text-primary-600 hover:text-primary-700">
                    {enterprise.website}
                  </a>
                </div>
              </div>
            </div>

            {/* Compliance & Risk */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Compliance & Risk Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {enterprise.complianceScore}%
                  </div>
                  <p className="text-neutral-600">Compliance Score</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${
                    enterprise.riskLevel === "low" ? "text-success-600" :
                    enterprise.riskLevel === "medium" ? "text-warning-600" : "text-error-600"
                  }`}>
                    {enterprise.riskLevel.toUpperCase()}
                  </div>
                  <p className="text-neutral-600">Risk Level</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning-600 mb-1">
                    {enterprise.rating}
                  </div>
                  <p className="text-neutral-600">Overall Rating</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "assessments":
        return (
          <div className="space-y-6">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="glass-effect rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {assessment.type}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      {assessment.completedDate && (
                        <span>Completed: {assessment.completedDate}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.status === "completed" ? "bg-success-100 text-success-800" :
                        "bg-warning-100 text-warning-800"
                      }`}>
                        {assessment.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {assessment.score ? (
                      <div className="text-2xl font-bold text-primary-600">
                        {assessment.score}%
                      </div>
                    ) : (
                      <div className="text-neutral-400">In Progress</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            {documents.map((document) => (
              <div key={document.id} className="glass-effect rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-primary-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {document.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-neutral-600">
                        <span>{document.type}</span>
                        <span>Uploaded: {document.uploadDate}</span>
                        {document.verifiedBy && (
                          <span>Verified by: {document.verifiedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      document.status === "verified" ? "bg-success-100 text-success-800 border-success-200" :
                      "bg-warning-100 text-warning-800 border-warning-200"
                    }`}>
                      {document.status}
                    </span>
                    <button className="p-2 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                      <Download className="h-4 w-4 text-neutral-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "activity":
        return (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="glass-effect rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Activity className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-900 font-medium">{activity.description}</p>
                    <p className="text-sm text-neutral-600">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    {activity.score && (
                      <p className="text-sm text-primary-600 font-medium">
                        Score: {activity.score}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/enterprises"
              className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </Link>
            <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{enterprise.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-neutral-600">{enterprise.industry}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(enterprise.status)}`}>
                  {enterprise.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {enterprise.status === "pending" && (
              <>
                <button
                  onClick={() => {
                    setVettingAction("approve");
                    setShowVettingModal(true);
                  }}
                  className="btn-success flex items-center space-x-2"
                >
                  <ThumbsUp className="h-5 w-5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => {
                    setVettingAction("reject");
                    setShowVettingModal(true);
                  }}
                  className="btn-danger flex items-center space-x-2"
                >
                  <ThumbsDown className="h-5 w-5" />
                  <span>Reject</span>
                </button>
              </>
            )}
            <button className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
              <MoreVertical className="h-5 w-5 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <MapPin className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-neutral-600">Location</span>
          </div>
          <p className="text-lg font-semibold text-neutral-900">{enterprise.location}</p>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-neutral-600">Employees</span>
          </div>
          <p className="text-lg font-semibold text-neutral-900">{enterprise.employeeCount}</p>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-neutral-600">Revenue</span>
          </div>
          <p className="text-lg font-semibold text-neutral-900">{enterprise.revenue}</p>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-neutral-600">Registered</span>
          </div>
          <p className="text-lg font-semibold text-neutral-900">{enterprise.registrationDate}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-effect rounded-2xl mb-8">
        <div className="flex space-x-1 p-1">
          {[
            { id: "profile", label: "Company Profile", icon: Building2 },
            { id: "assessments", label: "Assessments", icon: Award },
            { id: "documents", label: "Documents", icon: FileText },
            { id: "activity", label: "Activity Log", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "gradient-bg text-white shadow-lg"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="slide-up">
        {renderTabContent()}
      </div>

      {/* Vetting Modal */}
      {showVettingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              {vettingAction === "approve" ? "Approve Enterprise" : "Reject Enterprise"}
            </h3>
            <p className="text-neutral-600 mb-4">
              {vettingAction === "approve"
                ? "Please provide a reason for approving this enterprise."
                : "Please provide a reason for rejecting this enterprise."}
            </p>
            <textarea
              value={vettingNotes}
              onChange={(e) => setVettingNotes(e.target.value)}
              placeholder="Enter your notes here..."
              className="w-full p-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none h-24"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowVettingModal(false);
                  setVettingAction(null);
                  setVettingNotes("");
                }}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVettingSubmit}
                disabled={!vettingNotes.trim()}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                  vettingAction === "approve"
                    ? "bg-success-600 hover:bg-success-700 disabled:bg-success-300"
                    : "bg-error-600 hover:bg-error-700 disabled:bg-error-300"
                }`}
              >
                {vettingAction === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnterpriseDetail;