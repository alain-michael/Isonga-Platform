import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Search,
  Filter,
  Eye,
  Download,
  MoreVertical,
  Building2,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Mail,
  Phone
} from "lucide-react";

const AdminEnterprises: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  // Mock enterprise data
  const enterprises = [
    {
      id: 1,
      name: "TechCorp Solutions Ltd",
      industry: "Technology",
      status: "verified",
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
      verifiedDate: "2024-03-20",
      documents: {
        submitted: 8,
        verified: 8,
        pending: 0
      },
      complianceScore: 95,
      riskLevel: "low"
    },
    {
      id: 2,
      name: "GreenEnergy Solutions",
      industry: "Energy",
      status: "verified",
      location: "Kigali, Rwanda",
      registrationDate: "2024-02-28",
      employeeCount: 78,
      revenue: "$4.2M",
      email: "info@greenenergy.rw",
      phone: "+250 788 654 321",
      website: "www.greenenergy.rw",
      rating: 4.9,
      assessmentsCompleted: 5,
      lastActivity: "2024-08-24",
      verifiedDate: "2024-03-05",
      documents: {
        submitted: 12,
        verified: 11,
        pending: 1
      },
      complianceScore: 98,
      riskLevel: "low"
    },
    {
      id: 3,
      name: "LocalCafe Chain",
      industry: "Food & Beverage",
      status: "pending",
      location: "Butare, Rwanda",
      registrationDate: "2024-08-20",
      employeeCount: 23,
      revenue: "$850K",
      email: "contact@localcafe.rw",
      phone: "+250 788 987 654",
      website: "www.localcafe.rw",
      rating: 4.2,
      assessmentsCompleted: 1,
      lastActivity: "2024-08-23",
      verifiedDate: null,
      documents: {
        submitted: 6,
        verified: 4,
        pending: 2
      },
      complianceScore: 78,
      riskLevel: "medium"
    },
    {
      id: 4,
      name: "AutoParts Manufacturing",
      industry: "Manufacturing",
      status: "verified",
      location: "Musanze, Rwanda",
      registrationDate: "2024-01-10",
      employeeCount: 156,
      revenue: "$8.7M",
      email: "operations@autoparts.rw",
      phone: "+250 788 456 789",
      website: "www.autoparts.rw",
      rating: 4.6,
      assessmentsCompleted: 7,
      lastActivity: "2024-08-22",
      verifiedDate: "2024-01-15",
      documents: {
        submitted: 15,
        verified: 14,
        pending: 1
      },
      complianceScore: 92,
      riskLevel: "low"
    },
    {
      id: 5,
      name: "Digital Marketing Hub",
      industry: "Marketing",
      status: "rejected",
      location: "Kigali, Rwanda",
      registrationDate: "2024-08-15",
      employeeCount: 12,
      revenue: "$650K",
      email: "hello@digitalmarketing.rw",
      phone: "+250 788 321 654",
      website: "www.digitalmarketing.rw",
      rating: 3.8,
      assessmentsCompleted: 0,
      lastActivity: "2024-08-21",
      verifiedDate: null,
      documents: {
        submitted: 5,
        verified: 2,
        pending: 3
      },
      complianceScore: 45,
      riskLevel: "high"
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "text-success-600";
      case "medium":
        return "text-warning-600";
      case "high":
        return "text-error-600";
      default:
        return "text-neutral-600";
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-success-600";
    if (score >= 70) return "text-warning-600";
    return "text-error-600";
  };

  const filteredEnterprises = enterprises.filter((enterprise) => {
    const matchesSearch = 
      enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || enterprise.status === statusFilter;
    const matchesIndustry = industryFilter === "all" || enterprise.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const stats = {
    totalEnterprises: enterprises.length,
    verified: enterprises.filter(e => e.status === "verified").length,
    pending: enterprises.filter(e => e.status === "pending").length,
    rejected: enterprises.filter(e => e.status === "rejected").length
  };

  const industries = [...new Set(enterprises.map(e => e.industry))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </Link>
            <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Enterprise Management</h1>
              <p className="text-lg text-neutral-600">Manage and oversee all registered enterprises</p>
            </div>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Total Enterprises
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalEnterprises}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Verified
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.verified}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Pending
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-error-500 to-error-600 rounded-xl shadow-lg">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Rejected
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-effect rounded-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search enterprises, industries, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none appearance-none bg-white min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none appearance-none bg-white min-w-[140px]"
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprises Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEnterprises.map((enterprise) => (
          <div key={enterprise.id} className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{enterprise.name}</h3>
                  <p className="text-sm text-neutral-600">{enterprise.industry}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(enterprise.status)}`}>
                {enterprise.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-neutral-600">
                <MapPin className="h-4 w-4 mr-2" />
                {enterprise.location}
              </div>
              <div className="flex items-center text-sm text-neutral-600">
                <Users className="h-4 w-4 mr-2" />
                {enterprise.employeeCount} employees
              </div>
              <div className="flex items-center text-sm text-neutral-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Revenue: {enterprise.revenue}
              </div>
              <div className="flex items-center text-sm text-neutral-600">
                <Calendar className="h-4 w-4 mr-2" />
                Registered: {enterprise.registrationDate}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4 text-warning-500" />
                  <span className="font-semibold text-neutral-900">{enterprise.rating}</span>
                </div>
                <p className="text-xs text-neutral-500">Rating</p>
              </div>
              <div className="text-center">
                <div className={`font-semibold ${getComplianceColor(enterprise.complianceScore)}`}>
                  {enterprise.complianceScore}%
                </div>
                <p className="text-xs text-neutral-500">Compliance</p>
              </div>
              <div className="text-center">
                <div className={`font-semibold ${getRiskColor(enterprise.riskLevel)}`}>
                  {enterprise.riskLevel.toUpperCase()}
                </div>
                <p className="text-xs text-neutral-500">Risk</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
                <span>Documents</span>
                <span>{enterprise.documents.verified}/{enterprise.documents.submitted} verified</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                  style={{
                    width: `${(enterprise.documents.verified / enterprise.documents.submitted) * 100}%`,
                  }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <span>{enterprise.assessmentsCompleted} assessments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/admin/enterprises/${enterprise.id}`}
                    className="p-2 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <Eye className="h-4 w-4 text-neutral-600" />
                  </Link>
                  <button className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                    <MoreVertical className="h-4 w-4 text-neutral-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEnterprises.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Enterprises Found</h3>
          <p className="text-neutral-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminEnterprises;