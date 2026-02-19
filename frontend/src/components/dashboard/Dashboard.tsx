import React, { useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  ArrowRight,
  Plus,
  Target,
  DollarSign,
  User,
  ClipboardList,
  Rocket,
} from "lucide-react";
import { useAssessments } from "../../hooks/useAssessments";
import { useMyEnterprise } from "../../hooks/useEnterprises";
import { useMyCampaigns } from "../../hooks/useCampaigns";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect investors to their specific dashboard
  useEffect(() => {
    if (user?.user_type === "investor") {
      navigate("/investor/dashboard");
    }
  }, [user, navigate]);

  // Fetch enterprise profile if user is an enterprise
  const { error: enterpriseError, isLoading: enterpriseLoading } =
    useMyEnterprise();

  // Fetch assessments
  const { data: assessments = [], isLoading: assessmentsLoading } =
    useAssessments();

  // Fetch funding applications (campaigns)
  const { data: fundingApplications = [], isLoading: campaignsLoading } =
    useMyCampaigns();

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
      (a: any) => a.status === "completed" || a.status === "reviewed",
    ).length;

    const pending = assessments.filter(
      (a: any) => a.status === "draft" || a.status === "in_progress",
    ).length;

    const avgScore =
      assessments.length > 0
        ? assessments.reduce(
            (sum: number, a: any) => sum + (Number(a.percentage_score) || 0),
            0,
          ) / assessments.length
        : 0;

    return {
      totalAssessments: assessments.length,
      completedAssessments: completed,
      pendingAssessments: pending,
      averageScore: avgScore,
    };
  }, [assessments]);

  // Calculate funding application stats
  const fundingStats = useMemo(() => {
    if (!fundingApplications)
      return {
        totalApplications: 0,
        activeApplications: 0,
        approvedApplications: 0,
        totalRaised: 0,
      };

    const active = fundingApplications.filter(
      (c: any) => c.status === "active",
    ).length;

    const approved = fundingApplications.filter(
      (c: any) => c.status === "approved" || c.is_vetted,
    ).length;

    const totalRaised = fundingApplications.reduce(
      (sum: number, c: any) => sum + (Number(c.amount_raised) || 0),
      0,
    );

    return {
      totalApplications: fundingApplications.length,
      activeApplications: active,
      approvedApplications: approved,
      totalRaised: totalRaised,
    };
  }, [fundingApplications]);

  const recentFundingApplications = useMemo(() => {
    return fundingApplications ? fundingApplications.slice(0, 5) : [];
  }, [fundingApplications]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300";
      case "submitted":
      case "revision_required":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "approved":
      case "active":
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300";
    }
  };

  if (
    assessmentsLoading ||
    campaignsLoading ||
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
            Here's your business readiness and funding applications overview.
          </p>
        </div>
        {user?.user_type === "enterprise" && (
          <Link
            to="/assessments/start"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Assessment
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-effect dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Readiness Score
              </p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  stats.averageScore >= 70
                    ? "text-green-600 dark:text-green-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {Math.round(stats.averageScore)}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          {stats.averageScore > 0 && stats.averageScore < 70 && (
            <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
              Score 70% or higher to apply for funding
            </p>
          )}
        </div>

        <div className="glass-effect dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Assessments
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                {stats.completedAssessments}/{stats.totalAssessments}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {stats.pendingAssessments} in progress
          </p>
        </div>

        <div className="glass-effect dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Funding Applications
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                {fundingStats.totalApplications}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {fundingStats.activeApplications} active,{" "}
            {fundingStats.approvedApplications} approved
          </p>
        </div>

        <div className="glass-effect dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Total Raised
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                ${fundingStats.totalRaised.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.user_type === "enterprise" && (
        <div className="glass-effect dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/assessments/start"
              className="group glass-effect dark:bg-neutral-800/50 rounded-xl p-6 border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all hover:shadow-lg"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                Start New Assessment
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Initiate business readiness evaluations
              </p>
            </Link>

            <Link
              to="/profile"
              className="group glass-effect dark:bg-neutral-800/50 rounded-xl p-6 border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all hover:shadow-lg"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                Update Profile
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Refine business details and improve matching
              </p>
            </Link>

            <Link
              to="/campaigns/create"
              className="group glass-effect dark:bg-neutral-800/50 rounded-xl p-6 border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all hover:shadow-lg"
            >
              <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                Initiate Funding Application
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Launch investor outreach with guided wizard
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* Active Funding Applications */}
      <div className="glass-effect dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Active Funding Applications
          </h2>
          <Link
            to="/campaigns"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
          >
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {recentFundingApplications.length > 0 ? (
            recentFundingApplications.map((application: any) => (
              <div
                key={application.id}
                className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {application.title}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Started:{" "}
                        {new Date(
                          application.start_date || application.created_at,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        application.status,
                      )}`}
                    >
                      {application.status.replace("_", " ")}
                    </span>
                    <Link
                      to={`/campaigns/${application.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full glass-effect dark:bg-neutral-800 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-neutral-400" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                No funding applications yet
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Start by initiating your first funding application to connect
                with investors.
              </p>
              {user?.user_type === "enterprise" && (
                <Link
                  to="/campaigns/create"
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Initiate Funding Application
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
