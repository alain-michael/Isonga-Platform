import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
  Briefcase,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  // Mock data for dashboard - in real app, fetch from API
  const stats = [
    {
      label: "Total SMEs",
      value: "124",
      change: "+12%",
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      label: "Active Investors",
      value: "32",
      change: "+5%",
      icon: Briefcase,
      color: "bg-purple-500",
    },
    {
      label: "Assessments Completed",
      value: "89",
      change: "+24%",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      label: "Total Matches",
      value: "45",
      change: "+18%",
      icon: TrendingUp,
      color: "bg-orange-500",
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
            className="glass-effect p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon
                  className={`h-6 w-6 ${stat.color.replace("bg-", "text-")}`}
                />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area (Placeholder) */}
        <div className="lg:col-span-2 glass-effect p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
        <div className="glass-effect p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/questionnaires"
          className="group glass-effect p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
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
          className="group glass-effect p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Briefcase className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-500" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Investor Management
          </h3>
          <p className="text-sm text-neutral-500">
            Onboard investors and configure matching profiles.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="group glass-effect p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
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
