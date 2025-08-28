import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import { assessmentAPI, enterpriseAPI } from "../../services/api";

interface DashboardStats {
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  averageScore: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
    averageScore: 0,
  });
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBusinessProfile, setHasBusinessProfile] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (user?.user_type === "enterprise") {
      checkBusinessProfile();
    } else {
      fetchDashboardData();
    }
  }, []);

  const checkBusinessProfile = async () => {
    try {
      await enterpriseAPI.getMyEnterprise();
      setHasBusinessProfile(true);
      fetchDashboardData();
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No business profile found - redirect to registration flow
        setHasBusinessProfile(false);
        navigate("/business-registration");
      } else {
        console.error("Error checking business profile:", error);
        setHasBusinessProfile(false);
        navigate("/business-registration");
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      if (user?.user_type === "enterprise") {
        // Fetch assessments for the enterprise
        const assessmentsResponse = await assessmentAPI.getAssessments();
        const assessments = assessmentsResponse.data;

        setStats({
          totalAssessments: assessments.length,
          completedAssessments: assessments.filter(
            (a: any) => a.status === "completed" || a.status === "reviewed"
          ).length,
          pendingAssessments: assessments.filter(
            (a: any) => a.status === "draft" || a.status === "in_progress"
          ).length,
          averageScore:
            assessments.length > 0
              ? assessments.reduce(
                  (sum: number, a: any) => sum + (a.percentage_score || 0),
                  0
                ) / assessments.length
              : 0,
        });

        setRecentAssessments(assessments.slice(0, 5));
      } else {
        // Admin dashboard - fetch assessment statistics
        const assessmentsResponse = await assessmentAPI.getAssessments();

        const assessments = assessmentsResponse.data;

        setStats({
          totalAssessments: assessments.length,
          completedAssessments: assessments.filter(
            (a: any) => a.status === "completed" || a.status === "reviewed"
          ).length,
          pendingAssessments: assessments.filter(
            (a: any) => a.status === "draft" || a.status === "in_progress"
          ).length,
          averageScore:
            assessments.length > 0
              ? assessments.reduce(
                  (sum: number, a: any) => sum + (a.percentage_score || 0),
                  0
                ) / assessments.length
              : 0,
        });

        setRecentAssessments(assessments.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-primary-600"></div>
          <p className="text-neutral-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold text-neutral-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="mt-3 text-lg text-neutral-600">
          {user?.user_type === "enterprise"
            ? "Track your assessment progress and business growth"
            : "Manage enterprises and assessments across the platform"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
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
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Completed
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.completedAssessments}
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
                {stats.pendingAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                Average Score
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  stats.averageScore
                )}`}
              >
                {stats.averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="glass-effect rounded-2xl shadow-xl">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {user?.user_type === "enterprise" ? (
                <>
                  <Link
                    to="/assessments"
                    className="flex items-center p-5 border-2 border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 card-hover"
                  >
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-neutral-900">
                        Start New Assessment
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        Begin a new business assessment
                      </p>
                    </div>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center p-5 border-2 border-neutral-200 rounded-xl hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 card-hover"
                  >
                    <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-neutral-900">
                        Update Profile
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        Manage your business information
                      </p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin/enterprises"
                    className="flex items-center p-5 border-2 border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 card-hover"
                  >
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-neutral-900">
                        Manage Enterprises
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        View and vet business registrations
                      </p>
                    </div>
                  </Link>
                  <Link
                    to="/admin"
                    className="flex items-center p-5 border-2 border-neutral-200 rounded-xl hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 card-hover"
                  >
                    <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-neutral-900">
                        Review Assessments
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        Review completed assessments
                      </p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="glass-effect rounded-2xl shadow-xl">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900">
              Recent Assessments
            </h2>
          </div>
          <div className="p-6">
            {recentAssessments.length > 0 ? (
              <div className="space-y-4">
                {recentAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-5 border-2 border-neutral-200 rounded-xl card-hover"
                  >
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-neutral-900">
                        {user?.user_type === "enterprise"
                          ? `${assessment.questionnaire_title} - ${assessment.fiscal_year}`
                          : `${assessment.enterprise_name} - ${assessment.fiscal_year}`}
                      </h3>
                      <div className="flex items-center mt-2 space-x-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            assessment.status
                          )}`}
                        >
                          {assessment.status.replace("_", " ")}
                        </span>
                        {assessment.percentage_score > 0 && (
                          <span
                            className={`text-sm font-bold ${getScoreColor(
                              assessment.percentage_score
                            )}`}
                          >
                            {assessment.percentage_score.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/assessments/${assessment.id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-neutral-100 rounded-full w-fit mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 font-medium">
                  No assessments found
                </p>
                <p className="text-neutral-400 text-sm mt-1">
                  Get started by creating your first assessment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
