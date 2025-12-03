import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Building2, MapPin, Star } from "lucide-react";
import { investorAPI } from "../../services/investor";

const InvestorMatches: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["investorMatches"],
    queryFn: investorAPI.getMatches,
  });

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.enterprise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector =
      sectorFilter === "all" || match.enterprise_sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const sectors = [...new Set(matches.map((m) => m.enterprise_sector))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Investment Opportunities
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Discover enterprises that match your investment criteria.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-6 mb-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            />
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none appearance-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className="glass-effect rounded-2xl p-6 card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {match.enterprise_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {match.enterprise_name}
                  </h3>
                  <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    {match.enterprise_sector}
                    <span className="mx-2">•</span>
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {match.enterprise_location}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 px-3 py-1 rounded-full text-sm font-bold mb-2">
                  <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                  {match.match_score}% Match
                </div>
              </div>
            </div>

            <p className="text-neutral-600 dark:text-neutral-300 mb-6 flex-grow">
              {match.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">
                  Funding Needed
                </p>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ${match.target_amount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">
                  Raised So Far
                </p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  ${match.amount_raised.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-md font-medium">
                {match.campaign_type}
              </span>
            </div>

            <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
              <button
                onClick={() => navigate(`/investor/matches/${match.id}`)}
                className="flex-1 btn-primary"
              >
                View Details
              </button>
              <button className="flex-1 btn-secondary">Express Interest</button>
            </div>
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-neutral-100 dark:bg-neutral-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            No matches found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
};

export default InvestorMatches;
