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
  Calendar,
  User,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit
} from "lucide-react";

const AdminAssessments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Mock assessment data with more detailed information
  const assessments = [
    {
      id: 1,
      enterpriseName: "TechCorp Solutions Ltd",
      assessmentType: "Financial Assessment",
      industry: "Technology",
      submittedDate: "2024-08-25",
      reviewDeadline: "2024-08-30",
      score: 87,
      status: "completed",
      priority: "medium",
      reviewer: "John Smith",
      reviewedDate: "2024-08-26",
      employeeCount: 45,
      revenue: "$2.5M",
      location: "Kigali, Rwanda",
      notes: "Strong financial position with good growth potential",
      documentsSubmitted: 8,
      documentsVerified: 8
    },
    {
      id: 2,
      enterpriseName: "GreenEnergy Solutions",
      assessmentType: "Operations Assessment",
      industry: "Energy",
      submittedDate: "2024-08-24",
      reviewDeadline: "2024-08-29",
      score: 92,
      status: "reviewed",
      priority: "high",
      reviewer: "Sarah Wilson",
      reviewedDate: "2024-08-25",
      employeeCount: 78,
      revenue: "$4.2M",
      location: "Kigali, Rwanda",
      notes: "Excellent operational efficiency and sustainability practices",
      documentsSubmitted: 12,
      documentsVerified: 11
    },
    {
      id: 3,
      enterpriseName: "LocalCafe Chain",
      assessmentType: "Market Analysis",
      industry: "Food & Beverage",
      submittedDate: "2024-08-23",
      reviewDeadline: "2024-08-28",
      score: null,
      status: "pending_review",
      priority: "high",
      reviewer: null,
      reviewedDate: null,
      employeeCount: 23,
      revenue: "$850K",
      location: "Butare, Rwanda",
      notes: null,
      documentsSubmitted: 6,
      documentsVerified: 4
    },
    {
      id: 4,
      enterpriseName: "AutoParts Manufacturing",
      assessmentType: "Financial Assessment",
      industry: "Manufacturing",
      submittedDate: "2024-08-22",
      reviewDeadline: "2024-08-27",
      score: 74,
      status: "completed",
      priority: "low",
      reviewer: "Mike Johnson",
      reviewedDate: "2024-08-23",
      employeeCount: 156,
      revenue: "$8.7M",
      location: "Musanze, Rwanda",
      notes: "Good financial health with room for improvement in cash flow management",
      documentsSubmitted: 10,
      documentsVerified: 9
    },
    {
      id: 5,
      enterpriseName: "Digital Marketing Hub",
      assessmentType: "Operations Assessment",
      industry: "Marketing",
      submittedDate: "2024-08-21",
      reviewDeadline: "2024-08-26",
      score: null,
      status: "in_review",
      priority: "medium",
      reviewer: "John Smith",
      reviewedDate: null,
      employeeCount: 12,
      revenue: "$650K",
      location: "Kigali, Rwanda",
      notes: null,
      documentsSubmitted: 7,
      documentsVerified: 5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "reviewed":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "in_review":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      case "pending_review":
        return "bg-warning-100 text-warning-800 border-warning-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-error-100 text-error-800 border-error-200";
      case "medium":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "low":
        return "bg-success-100 text-success-800 border-success-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-neutral-400";
    if (score >= 85) return "text-success-600";
    if (score >= 70) return "text-warning-600";
    return "text-error-600";
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = 
      assessment.enterpriseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.assessmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || assessment.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    totalAssessments: assessments.length,
    pendingReview: assessments.filter(a => a.status === "pending_review").length,
    inReview: assessments.filter(a => a.status === "in_review").length,
    completed: assessments.filter(a => a.status === "completed" || a.status === "reviewed").length
  };

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
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Assessment Management</h1>
              <p className="text-lg text-neutral-600">Review and manage all enterprise assessments</p>
            </div>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Report</span>
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
                Total Assessments
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalAssessments}
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
                Pending Review
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.pendingReview}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                In Review
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.inReview}
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
                Completed
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.completed}
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
              placeholder="Search assessments, enterprises, or industries..."
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
                className="pl-10 pr-8 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none appearance-none bg-white min-w-[160px]"
              >
                <option value="all">All Status</option>
                <option value="pending_review">Pending Review</option>
                <option value="in_review">In Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none appearance-none bg-white min-w-[120px]"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="glass-effect rounded-2xl shadow-xl">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Assessment Details</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">Enterprise</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">Assessment</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">Priority</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">Score</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">Reviewer</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">Deadline</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment) => (
                <tr key={assessment.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold text-neutral-900 mb-1">
                        {assessment.enterpriseName}
                      </div>
                      <div className="text-sm text-neutral-500">
                        <Building2 className="h-3 w-3 inline mr-1" />
                        {assessment.industry} • {assessment.employeeCount} employees
                      </div>
                      <div className="text-sm text-neutral-500">
                        💰 {assessment.revenue} • 📍 {assessment.location}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-neutral-800 mb-1">
                        {assessment.assessmentType}
                      </div>
                      <div className="text-sm text-neutral-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Submitted: {assessment.submittedDate}
                      </div>
                      <div className="text-sm text-neutral-500">
                        📄 {assessment.documentsVerified}/{assessment.documentsSubmitted} docs verified
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assessment.status)}`}>
                      {assessment.status.replace("_", " ")}
                    </span>
                  </td>
                  {/* <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(assessment.priority)}`}>
                      {assessment.priority}
                    </span>
                  </td> */}
                  <td className="py-4 px-6">
                    {assessment.score ? (
                      <div>
                        <span className={`text-2xl font-bold ${getScoreColor(assessment.score)}`}>
                          {assessment.score}%
                        </span>
                        <div className="text-xs text-neutral-500">
                          <Award className="h-3 w-3 inline mr-1" />
                          {assessment.reviewedDate}
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {assessment.reviewer ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-neutral-500" />
                          <span className="text-neutral-700 font-medium">{assessment.reviewer}</span>
                        </div>
                        {assessment.reviewedDate && (
                          <div className="text-xs text-neutral-500 mt-1">
                            Reviewed: {assessment.reviewedDate}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-sm">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-neutral-700">
                      {assessment.reviewDeadline}
                    </div>
                    {new Date(assessment.reviewDeadline) < new Date() && !assessment.score && (
                      <div className="text-xs text-error-600 font-medium">
                        ⚠️ Overdue
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                        <Eye className="h-4 w-4 text-neutral-600" />
                      </button>
                      <button className="p-2 rounded-lg border border-neutral-200 hover:border-warning-300 hover:bg-warning-50 transition-colors">
                        <Edit className="h-4 w-4 text-neutral-600" />
                      </button>
                      <button className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                        <MoreVertical className="h-4 w-4 text-neutral-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            {/* <Shield className="h-12 w-12 text-neutral-400 mx-auto mb-4" /> */}
            <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Assessments Found</h3>
            <p className="text-neutral-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssessments;