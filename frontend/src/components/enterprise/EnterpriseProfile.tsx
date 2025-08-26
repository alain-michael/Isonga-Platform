import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  User, 
  FileText, 
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Globe,
  Users,
  DollarSign,
  Briefcase
} from "lucide-react";

const EnterpriseProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: "TechCorp Solutions Ltd",
    industry: "Technology",
    establishedYear: "2018",
    employeeCount: "45",
    annualRevenue: "$2.5M",
    businessType: "Private Limited Company",
    registrationNumber: "TC123456789",
    vatNumber: "VAT123456",
    address: "123 Innovation Street, Tech District",
    city: "Kigali",
    country: "Rwanda",
    phone: "+250 788 123 456",
    email: "info@techcorp.rw",
    website: "www.techcorp.rw",
    description: "Leading technology solutions provider specializing in digital transformation and enterprise software development."
  });

  const [documents] = useState([
    {
      id: 1,
      name: "Business Registration Certificate",
      type: "PDF",
      uploadDate: "2024-08-20",
      status: "verified",
      size: "2.4 MB"
    },
    {
      id: 2,
      name: "Tax Compliance Certificate",
      type: "PDF", 
      uploadDate: "2024-08-18",
      status: "pending",
      size: "1.8 MB"
    },
    {
      id: 3,
      name: "Financial Statements 2023",
      type: "PDF",
      uploadDate: "2024-08-15",
      status: "verified",
      size: "5.2 MB"
    }
  ]);

  const [assessments] = useState([
    {
      id: 1,
      type: "Financial Assessment",
      completedDate: "2024-08-25",
      score: 87,
      status: "completed",
      reviewer: "John Smith"
    },
    {
      id: 2,
      type: "Operations Assessment", 
      completedDate: "2024-07-15",
      score: 92,
      status: "completed",
      reviewer: "Sarah Wilson"
    },
    {
      id: 3,
      type: "Market Analysis",
      completedDate: "2024-06-10",
      score: 78,
      status: "completed",
      reviewer: "Mike Johnson"
    }
  ]);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

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

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success-600";
    if (score >= 70) return "text-warning-600";
    return "text-error-600";
  };

  const tabs = [
    { id: "profile", label: "Company Profile", icon: Building2 },
    { id: "assessments", label: "Completed Assessments", icon: FileText },
    { id: "documents", label: "Documents", icon: Upload }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Basic Information</h3>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Company Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900 font-semibold">{profileData.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Industry
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.industry}
                      onChange={(e) => setProfileData({...profileData, industry: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Construction">Construction</option>
                    </select>
                  ) : (
                    <p className="text-neutral-900">{profileData.industry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Established Year
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.establishedYear}
                      onChange={(e) => setProfileData({...profileData, establishedYear: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900">{profileData.establishedYear}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Employee Count
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.employeeCount}
                      onChange={(e) => setProfileData({...profileData, employeeCount: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900">{profileData.employeeCount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Annual Revenue
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.annualRevenue}
                      onChange={(e) => setProfileData({...profileData, annualRevenue: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900">{profileData.annualRevenue}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Type
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.businessType}
                      onChange={(e) => setProfileData({...profileData, businessType: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    >
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Private Limited Company">Private Limited Company</option>
                      <option value="Public Limited Company">Public Limited Company</option>
                      <option value="Cooperative">Cooperative</option>
                    </select>
                  ) : (
                    <p className="text-neutral-900">{profileData.businessType}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Company Description
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.description}
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-neutral-900">{profileData.description}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900">{profileData.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900">{profileData.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900">{profileData.phone}</p>
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
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.website}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-900">{profileData.website}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Legal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Registration Number
                  </label>
                  <p className="text-neutral-900">{profileData.registrationNumber}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    VAT Number
                  </label>
                  <p className="text-neutral-900">{profileData.vatNumber}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "assessments":
        return (
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Completed Assessments</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Assessment Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Completed Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Reviewer</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-neutral-800">{assessment.type}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-neutral-600">{assessment.completedDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-lg font-bold ${getScoreColor(assessment.score)}`}>
                          {assessment.score}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-neutral-600">{assessment.reviewer}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-success-100 text-success-800 border-success-200">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {assessments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Assessments Yet</h3>
                <p className="text-neutral-500">Complete your first assessment to see results here.</p>
              </div>
            )}
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Documents</h3>
                <button className="btn-primary flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="grid gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <FileText className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">{doc.name}</h4>
                        <p className="text-sm text-neutral-500">
                          {doc.type} • {doc.size} • Uploaded {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(doc.status)}`}>
                        {doc.status === "verified" ? "Verified" : "Pending"}
                      </span>
                      <button className="text-primary-600 hover:text-primary-700">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {documents.length === 0 && (
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Documents Uploaded</h3>
                  <p className="text-neutral-500">Upload your business documents for verification.</p>
                </div>
              )}
            </div>
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
        <div className="flex items-center space-x-6">
          <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Enterprise Profile</h1>
            <p className="text-lg text-neutral-600">Manage your business information and settings</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="glass-effect rounded-2xl p-2">
          <nav className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary-500 text-white shadow-lg"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="slide-up">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EnterpriseProfile;
