import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { campaignAPI } from "../../services/campaignsService";
import {
  Users,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
  Briefcase,
  Clock,
  Eye,
  DollarSign,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  // Fetch funding applications for approval queue
  const { data: campaigns = [] } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const response = await campaignAPI.getAll();
      return response.data.results || [];
    },
  });

  // Calculate real stats from campaigns
  const pendingReview = campaigns.filter(
    (c: any) => c.status === "submitted",
  ).length;
  const revisionRequired = campaigns.filter(
    (c: any) => c.status === "revision_required",
  ).length;
  const activeApplications = campaigns.filter(
    (c: any) => c.status === "active",
  ).length;
  const totalRaised = campaigns.reduce(
    (sum: number, c: any) => sum + (parseFloat(c.amount_raised) || 0),
    0,
  );

  // Mock data for dashboard - in real app, fetch from API
  const stats = [
    {
      label: "Pending Review",
      value: pendingReview.toString(),
      change: pendingReview > 0 ? "Action needed" : "All clear",
      icon: Clock,
      color: pendingReview > 0 ? "bg-orange-500" : "bg-green-500",
      urgent: pendingReview > 0,
    },
    {
      label: "Revision Required",
      value: revisionRequired.toString(),
      change: "Awaiting SME response",
      icon: FileText,
      color: "bg-yellow-500",
      urgent: false,
    },
    {
      label: "Active Applications",
      value: activeApplications.toString(),
      change: "Partner Visible",
      icon: TrendingUp,
      color: "bg-green-500",
      urgent: false,
    },
    {
      label: "Total Raised",
      value:
        new Intl.NumberFormat("en-RW", { notation: "compact" }).format(
          totalRaised,
        ) + " RWF",
      change: "All time",
      icon: DollarSign,
      color: "bg-blue-500",
      urgent: false,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "TechSolutions Ltd",
      action: "Completed assessment",
      time: "2 hours ago",
      type: "sme",
    },
    {
      id: 2,
      user: "Global Ventures",
      action: "Expressed interest in AgriCo",
      time: "4 hours ago",
      type: "investor",
    },
    {
      id: 3,
      user: "GreenEnergy Rwanda",
      action: "Registered new account",
      time: "5 hours ago",
      type: "sme",
    },
    {
      id: 4,
      user: "Kigali Capital",
      action: "Updated investment criteria",
      time: "1 day ago",
      type: "investor",
    },  
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Admin Overview
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor platform performance and manage ecosystem.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/investors/new"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Investor
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`glass-effect p-6 rounded-2xl glass-effect dark:bg-neutral-800 border ${
              stat.urgent
                ? "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10"
                : "border-neutral-200 dark:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon
                  className={`h-6 w-6 ${stat.color.replace("bg-", "text-")}`}
                />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.urgent
                    ? "text-orange-600 bg-orange-100"
                    : "text-green-600 bg-green-100"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stat.value}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Approval Queue Alert */}
      {pendingReview > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {pendingReview} Funding Application
                  {pendingReview > 1 ? "s" : ""} Awaiting Review
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  SMEs are waiting for your feedback on their funding
                  applications
                </p>
              </div>
            </div>
            <Link
              to="/admin/campaigns"
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl transition font-medium"
            >
              <Eye className="h-4 w-4" />
              Review Now
            </Link>
          </div>
          {/* Recent pending applications */}
          <div className="mt-4 grid gap-2">
            {campaigns
              .filter((c: any) => c.status === "submitted")
              .slice(0, 3)
              .map((campaign: any) => (
                <Link
                  key={campaign.id}
                  to={`/admin/campaigns/${campaign.id}`}
                  className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg hover:shadow-md transition"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {campaign.title}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {campaign.enterprise_name} • Submitted{" "}
                      {new Date(campaign.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-500" />
                </Link>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area (Placeholder) */}
        <div className="lg:col-span-2 glass-effect p-6 rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Platform Growth
            </h2>
            <select className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1 text-sm">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 95, 100].map((h, i) => (
              <div
                key={i}
                className="w-full bg-primary-100 rounded-t-lg relative group"
              >
                <div
                  className="absolute bottom-0 w-full bg-primary-500 rounded-t-lg transition-all duration-500 group-hover:bg-primary-600"
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-neutral-400">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-effect p-6 rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Recent Activity
            </h2>
            <Link
              to="/admin/activity"
              className="text-primary-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div
                  className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                    activity.type === "sme" ? "bg-blue-500" : "bg-purple-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {activity.user}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {activity.action}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to="/admin/campaigns"
          className="group glass-effect p-6 rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              <DollarSign className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-500" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Funding Applications
          </h3>
          <p className="text-sm text-neutral-500">
            Review, approve, and manage funding applications.
          </p>
        </Link>

        <Link
          to="/admin/questionnaires"
          className="group glass-effect p-6 rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-500" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Questionnaires
          </h3>
          <p className="text-sm text-neutral-500">
            Manage assessment questions and scoring logic.
          </p>
        </Link>

        <Link
          to="/admin/investors"
          className="group glass-effect p-6 rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Briefcase className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-500" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Funding Partners
          </h3>
          <p className="text-sm text-neutral-500">
            Onboard partners and configure matching profiles.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="group glass-effect p-6 rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-500" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            User Management
          </h3>
          <p className="text-sm text-neutral-500">
            Manage SMEs, system users, and permissions.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
