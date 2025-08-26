import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Users,
  Calendar,
  MoreVertical,
  ArrowLeft
} from "lucide-react";

const ManageAssessments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for created assessments
  const createdAssessments = [
    {
      id: 1,
      title: "SME Financial Health Assessment",
      description: "Comprehensive financial evaluation for small and medium enterprises",
      industry: "General",
      questionnaires: ["Financial Health", "Business Information", "Funding Request"],
      languages: ["English", "Kinyarwanda"],
      status: "published",
      createdDate: "2024-08-20",
      totalQuestions: 15,
      participants: 45,
      averageScore: 78.5,
      lastModified: "2024-08-22"
    },
    {
      id: 2,
      title: "Tech Startup Readiness Assessment",
      description: "Evaluation for technology startups seeking funding",
      industry: "Technology",
      questionnaires: ["Business Information", "Market Analysis", "Technical Capabilities"],
      languages: ["English"],
      status: "draft",
      createdDate: "2024-08-18",
      totalQuestions: 22,
      participants: 0,
      averageScore: null,
      lastModified: "2024-08-25"
    },
    {
      id: 3,
      title: "Agriculture Business Assessment",
      description: "Specialized assessment for agricultural enterprises",
      industry: "Agriculture",
      questionnaires: ["Financial Health", "Operations", "Sustainability"],
      languages: ["English", "Kinyarwanda", "French"],
      status: "published",
      createdDate: "2024-08-15",
      totalQuestions: 18,
      participants: 23,
      averageScore: 82.1,
      lastModified: "2024-08-20"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-success-100 text-success-800 border-success-200";
      case "draft":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "archived":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const filteredAssessments = createdAssessments.filter((assessment) => {
    const matchesSearch = 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/assessments"
              className="p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Manage Created Assessments</h1>
              <p className="text-lg text-neutral-600">Create, edit, and manage your assessment templates</p>
            </div>
          </div>
          <Link
            to="/assessments/create"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Assessment</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Total Created
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {createdAssessments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Published
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {createdAssessments.filter(a => a.status === "published").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Drafts
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {createdAssessments.filter(a => a.status === "draft").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Total Participants
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {createdAssessments.reduce((sum, a) => sum + a.participants, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-effect rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssessments.map((assessment) => (
          <div key={assessment.id} className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-neutral-900">{assessment.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assessment.status)}`}>
                    {assessment.status}
                  </span>
                </div>
                <p className="text-neutral-600 mb-3">{assessment.description}</p>
                <div className="flex items-center space-x-4 text-sm text-neutral-500">
                  <span>📊 {assessment.industry}</span>
                  <span>❓ {assessment.totalQuestions} questions</span>
                  <span>👥 {assessment.participants} participants</span>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <MoreVertical className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-1">Questionnaires:</p>
                <div className="flex flex-wrap gap-2">
                  {assessment.questionnaires.map((q, index) => (
                    <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs">
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700 mb-1">Languages:</p>
                <div className="flex flex-wrap gap-2">
                  {assessment.languages.map((lang, index) => (
                    <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-lg text-xs">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {assessment.averageScore && (
                <div>
                  <p className="text-sm font-medium text-neutral-700">Average Score: 
                    <span className="ml-1 text-lg font-bold text-success-600">
                      {assessment.averageScore}%
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="text-sm text-neutral-500">
                <Calendar className="h-4 w-4 inline mr-1" />
                Modified {assessment.lastModified}
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <Eye className="h-4 w-4 text-neutral-600" />
                </button>
                <Link
                  to={`/assessments/create?edit=${assessment.id}`}
                  className="p-2 rounded-lg border border-neutral-200 hover:border-warning-300 hover:bg-warning-50 transition-colors"
                >
                  <Edit className="h-4 w-4 text-neutral-600" />
                </Link>
                <button className="p-2 rounded-lg border border-neutral-200 hover:border-success-300 hover:bg-success-50 transition-colors">
                  <Copy className="h-4 w-4 text-neutral-600" />
                </button>
                <button className="p-2 rounded-lg border border-neutral-200 hover:border-error-300 hover:bg-error-50 transition-colors">
                  <Trash2 className="h-4 w-4 text-neutral-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssessments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Assessments Found</h3>
          <p className="text-neutral-500 mb-6">Try adjusting your search or create your first assessment.</p>
          <Link
            to="/assessments/create"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Assessment</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ManageAssessments;