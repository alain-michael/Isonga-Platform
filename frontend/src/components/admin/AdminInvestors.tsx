import React, { useState, useEffect } from "react";
import { Search, Plus, Briefcase, Mail, MoreVertical } from "lucide-react";
import { investorAPI } from "../../services/api";

interface Investor {
  id: number;
  organization_name: string;
  investor_type: string;
  contact_person: string;
  email: string;
  status: "active" | "pending" | "inactive";
  sectors: string[];
  min_investment: number;
  max_investment: number;
}

const AdminInvestors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const response = await investorAPI.getAll();
      // Map API response to component state if necessary
      // Assuming API returns a list of investors directly or in a results property
      const data = response.data.results || response.data;
      setInvestors(data);
    } catch (err) {
      console.error("Error fetching investors:", err);
      setError("Failed to load investors");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchInvestors} className="mt-4 btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Investor Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Onboard and manage investor profiles and criteria.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Onboard Investor
        </button>
      </div>

      {/* Search and Filter */}
      <div className="glass-effect p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search investors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div className="flex gap-4">
          <select className="px-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
            <option value="all">All Types</option>
            <option value="vc">Venture Capital</option>
            <option value="angel">Angel Investor</option>
            <option value="bank">Bank</option>
          </select>
          <select className="px-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Investors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investors.map((investor) => (
          <div
            key={investor.id}
            className="glass-effect rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">
                  {investor.organization_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                    {investor.organization_name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {investor.investor_type}
                  </p>
                </div>
              </div>
              <button className="text-neutral-400 hover:text-neutral-600">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <Mail className="h-4 w-4 mr-2" />
                {investor.email}
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <Briefcase className="h-4 w-4 mr-2" />
                {investor.sectors?.join(", ") || "No sectors listed"}
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium mr-2">Range:</span>
                {formatCurrency(investor.min_investment)} -{" "}
                {formatCurrency(investor.max_investment)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-700">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  investor.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {investor.status
                  ? investor.status.charAt(0).toUpperCase() +
                    investor.status.slice(1)
                  : "Unknown"}
              </span>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInvestors;
