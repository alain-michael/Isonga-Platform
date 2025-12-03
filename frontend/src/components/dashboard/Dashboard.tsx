import React, { useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useAssessments } from "../../hooks/useAssessments";
import { useMyEnterprise } from "../../hooks/useEnterprises";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch enterprise profile if user is an enterprise
  const { error: enterpriseError, isLoading: enterpriseLoading } =
    useMyEnterprise();

  // Fetch assessments
  const { data: assessments = [], isLoading: assessmentsLoading } =
    useAssessments();

  // Handle enterprise profile check
  useEffect(() => {
    if (user?.user_type === "enterprise" && enterpriseError) {
      // @ts-ignore
      if (enterpriseError.response?.status === 404) {
        navigate("/business-registration");
      }
    }
  }, [user, enterpriseError, navigate]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!assessments)
      return {
        totalAssessments: 0,
        completedAssessments: 0,
        pendingAssessments: 0,
        averageScore: 0,
      };

    const completed = assessments.filter(
      (a: any) => a.status === "completed" || a.status === "reviewed"
    ).length;

    const pending = assessments.filter(
      (a: any) => a.status === "draft" || a.status === "in_progress"
    ).length;

    const avgScore =
      assessments.length > 0
        ? assessments.reduce(
            (sum: number, a: any) => sum + (Number(a.score) || 0),
            0
          ) / assessments.length
        : 0;

    return {
      totalAssessments: assessments.length,
      completedAssessments: completed,
      pendingAssessments: pending,
      averageScore: avgScore,
    };
  }, [assessments]);

  const recentAssessments = useMemo(() => {
    return assessments ? assessments.slice(0, 5) : [];
  }, [assessments]);

  if (
    assessmentsLoading ||
    (user?.user_type === "enterprise" && enterpriseLoading)
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            Here's what's happening with your assessments today.
          </p>
        </div>
        {user?.user_type === "enterprise" && (
          <Link
            to="/assessments/create"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Assessment
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Total Assessments
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                {stats.totalAssessments}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                {stats.completedAssessments}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                In Progress
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                {stats.pendingAssessments}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Average Score
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                {Math.round(stats.averageScore)}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Recent Assessments
          </h2>
          <Link
            to="/assessments"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
          >
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {recentAssessments.length > 0 ? (
            recentAssessments.map((assessment: any) => (
              <div
                key={assessment.id}
                className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        assessment.status === "completed"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : assessment.status === "in_progress"
                          ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {user?.user_type === "enterprise"
                          ? assessment.title
                          : `${
                              assessment.enterprise?.business_name ||
                              "Enterprise"
                            } - ${assessment.title}`}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assessment.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : assessment.status === "in_progress"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {assessment.status.replace("_", " ")}
                    </span>
                    <Link
                      to={`/assessments/${assessment.id}`}
                      className="text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-neutral-400" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                No assessments yet
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Get started by creating your first assessment.
              </p>
              {user?.user_type === "enterprise" && (
                <Link
                  to="/assessments/create"
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Start Assessment
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
