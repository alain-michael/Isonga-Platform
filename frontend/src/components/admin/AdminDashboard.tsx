import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { campaignAPI } from "../../services/campaignsService";
import { enterpriseAPI } from "../../services/api";
import {
  Users,
  FileText,
  TrendingUp,
  Building2,
  ArrowRight,
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle,
  Eye,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  // Fetch funding applications
  const { data: campaigns = [] } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const response = await campaignAPI.getAll();
      return response.data.results || [];
    },
  });

  // Fetch enterprises
  const { data: enterprisesData } = useQuery({
    queryKey: ["admin-enterprises"],
    queryFn: async () => {
      const response = await enterpriseAPI.getAll();
      return response.data.results || response.data || [];
    },
  });
  const enterprises: any[] = enterprisesData || [];

  // Calculate stats from campaigns
  const pendingReview = campaigns.filter(
    (c: any) => c.status === "submitted",
  ).length;
  const activeApplications = campaigns.filter(
    (c: any) => c.status === "active",
  ).length;
  const totalRaised = campaigns.reduce(
    (sum: number, c: any) => sum + (parseFloat(c.amount_raised) || 0),
    0,
  );

  // Enterprise stats
  const pendingEnterprises = enterprises.filter(
    (e: any) => e.verification_status === "pending",
  ).length;
  const approvedEnterprises = enterprises.filter(
    (e: any) => e.verification_status === "approved",
  ).length;

  const stats = [
    {
      label: "Applications Pending Review",
      value: pendingReview.toString(),
      change: pendingReview > 0 ? "Action needed" : "All clear",
      icon: Clock,
      color: "bg-orange-500",
      urgent: pendingReview > 0,
      link: "/admin/campaigns",
    },
    {
      label: "Active Applications",
      value: activeApplications.toString(),
      change: "Visible to partners",
      icon: TrendingUp,
      color: "bg-green-500",
      urgent: false,
      link: "/admin/campaigns",
    },
    {
      label: "Enterprises Pending",
      value: pendingEnterprises.toString(),
      change: pendingEnterprises > 0 ? "Needs verification" : "All reviewed",
      icon: Building2,
      color: "bg-yellow-500",
      urgent: pendingEnterprises > 0,
      link: "/admin/enterprises",
    },
    {
      label: "Approved Enterprises",
      value: approvedEnterprises.toString(),
      change: "Verified & active",
      icon: CheckCircle,
      color: "bg-blue-500",
      urgent: false,
      link: "/admin/enterprises",
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
        <div />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className={`glass-effect p-6 rounded-2xl dark:bg-neutral-800 border transition hover:shadow-md ${
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
          </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enterprises Pending Verification */}
        <div className="glass-effect p-6 rounded-2xl dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-yellow-500" />
              Enterprises Awaiting Verification
            </h2>
            <Link to="/admin/enterprises" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          {enterprises.filter((e: any) => e.verification_status === "pending").length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400 text-sm py-4 text-center">All enterprises have been reviewed</p>
          ) : (
            <div className="space-y-3">
              {enterprises
                .filter((e: any) => e.verification_status === "pending")
                .slice(0, 5)
                .map((enterprise: any) => (
                  <Link
                    key={enterprise.id}
                    to={`/admin/enterprises/${enterprise.id}`}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{enterprise.business_name}</p>
                      <p className="text-xs text-neutral-500">{enterprise.sector} · {enterprise.district}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                      <ArrowRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>

        {/* Funding Applications Pending Review */}
        <div className="glass-effect p-6 rounded-2xl dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Funding Applications Pending Review
            </h2>
            <Link to="/admin/campaigns" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          {campaigns.filter((c: any) => c.status === "submitted").length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400 text-sm py-4 text-center">No applications pending review</p>
          ) : (
            <div className="space-y-3">
              {campaigns
                .filter((c: any) => c.status === "submitted")
                .slice(0, 5)
                .map((campaign: any) => (
                  <Link
                    key={campaign.id}
                    to={`/admin/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{campaign.title}</p>
                      <p className="text-xs text-neutral-500">
                        {campaign.enterprise_name} · {new Date(campaign.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">Submitted</span>
                      <ArrowRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  </Link>
                ))}
            </div>
          )}
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
