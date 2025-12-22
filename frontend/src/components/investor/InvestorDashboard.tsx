import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { investorAPI } from "../../services/investor";
import {
  TrendingUp,
  Users,
  PieChart,
  ArrowRight,
  Briefcase,
  DollarSign,
  Target,
} from "lucide-react";

const InvestorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const {
    data: stats = {
      totalInvestments: 0,
      activeMatches: 0,
      portfolioValue: "$0",
      pendingRequests: 0,
    },
  } = useQuery({
    queryKey: ["investorStats"],
    queryFn: investorAPI.getDashboardStats,
  });

  const { data: recentMatches = [] } = useQuery({
    queryKey: ["investorMatches"],
    queryFn: investorAPI.getMatches,
  });

  // Take only top 3 matches for dashboard
  const topMatches = recentMatches.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {t("dashboard.welcome")}, {user?.first_name || user?.username}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Here's an overview of your investment portfolio and matches.
          </p>
        </div>
        <Link
          to="/investor/matches"
          className="btn-primary flex items-center space-x-2"
        >
          <Target className="h-5 w-5" />
          <span>Find Opportunities</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
        <div className="glass-effect rounded-2xl p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Active Matches
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.activeMatches}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Portfolio Value
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.portfolioValue}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Total Investments
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.totalInvestments}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Pending Requests
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.pendingRequests}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Matches Section */}
      <div className="glass-effect rounded-2xl shadow-xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Top Matches for You
          </h2>
          <Link
            to="/investor/matches"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center text-sm"
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            {topMatches.map((match) => (
              <div
                key={match.id}
                className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors bg-neutral-50 dark:bg-neutral-900/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                    {match.enterprise_name.charAt(0)}
                  </div>
                  <span className="px-2 py-1 bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 text-xs font-bold rounded-full">
                    {match.match_score}% Match
                  </span>
                </div>
                <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-1">
                  {match.enterprise_name}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  {match.enterprise_sector}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Seeking:
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    ${match.target_amount.toLocaleString()}
                  </span>
                </div>
                <button className="w-full mt-4 btn-secondary py-2 text-sm">
                  View Details
                </button>
              </div>
            ))}
            {topMatches.length === 0 && (
              <div className="col-span-3 text-center py-8 text-neutral-500">
                No matches found yet. Update your profile criteria to see
                opportunities.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-6 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
          <h3 className="text-xl font-bold mb-2">Complete Your Profile</h3>
          <p className="text-primary-100 mb-6">
            Enhance your matching accuracy by updating your investment
            preferences and criteria.
          </p>
          <Link
            to="/investor/profile"
            className="inline-flex items-center px-4 py-2 glass-effect text-primary-900 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Update Profile <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>

        <div className="glass-effect rounded-2xl p-6 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Market Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
              <PieChart className="h-5 w-5 text-secondary-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Agriculture Sector Growth
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  +15% increase in Q3 2025
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
              <TrendingUp className="h-5 w-5 text-success-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Tech Startups Funding
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  $2.5M raised this month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
