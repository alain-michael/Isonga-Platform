import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investorAPI } from "../../services/investor";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Save,
  Shield,
  Bell,
  DollarSign,
  Settings,
} from "lucide-react";

const InvestorProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["investorProfile"],
    queryFn: investorAPI.getProfile,
  });

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    role: "", // Not in backend model yet, maybe use description or add field?
    location: "", // Not in backend model, maybe add?
    website: "",
    bio: "",
  });

  const [preferences, setPreferences] = useState({
    sectors: [] as string[],
    minTicket: 0,
    maxTicket: 0,
    stages: [] as string[], // Not in backend model yet
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.user.first_name,
        lastName: profile.user.last_name,
        email: profile.contact_email || profile.user.email,
        phone: profile.contact_phone || "",
        organization: profile.organization_name || "",
        role: "", // Placeholder
        location: "", // Placeholder
        website: profile.website || "",
        bio: profile.description || "",
      });

      if (profile.criteria && profile.criteria.length > 0) {
        const criteria = profile.criteria[0];
        setPreferences({
          sectors: criteria.sectors || [],
          minTicket: criteria.min_funding_amount || 0,
          maxTicket: criteria.max_funding_amount || 0,
          stages: [], // Placeholder
        });
      }
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => {
      if (!profile) return Promise.reject("No profile");
      return investorAPI.updateProfile(profile.id, {
        organization_name: data.organization,
        description: data.bio,
        contact_email: data.email,
        contact_phone: data.phone,
        website: data.website,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investorProfile"] });
      alert("Profile updated successfully!");
    },
  });

  const updateCriteriaMutation = useMutation({
    mutationFn: (data: any) => {
      if (!profile) return Promise.reject("No profile");
      const criteriaData = {
        sectors: data.sectors,
        min_funding_amount: data.minTicket,
        max_funding_amount: data.maxTicket,
      };

      if (profile.criteria && profile.criteria.length > 0) {
        return investorAPI.updateCriteria(
          profile.criteria[0].id!,
          criteriaData
        );
      } else {
        // Create new criteria if none exists (need to implement create in backend/service if not exists)
        // For now assuming update works or we handle create elsewhere
        return investorAPI.createCriteria({
          ...criteriaData,
          preferred_sizes: [],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investorProfile"] });
      alert("Criteria updated successfully!");
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSavePreferences = () => {
    updateCriteriaMutation.mutate(preferences);
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Investor Profile
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Manage your personal information and investment preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="glass-effect rounded-2xl p-4 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 sticky top-24">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === "profile"
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === "preferences"
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
              >
                <Briefcase className="mr-3 h-5 w-5" />
                Investment Criteria
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === "notifications"
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
              >
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === "security"
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
              >
                <Shield className="mr-3 h-5 w-5" />
                Security
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="glass-effect rounded-2xl p-8 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            {activeTab === "profile" && (
              <div className="space-y-6 slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Personal Information
                  </h2>
                  <button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profileData.firstName.charAt(0)}
                    {profileData.lastName.charAt(0)}
                  </div>
                  <div>
                    <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      Change Avatar
                    </button>
                    <p className="text-xs text-neutral-500 mt-1">
                      JPG, GIF or PNG. Max size of 800K
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="w-full p-4 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 mt-6">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    Organization Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Organization Name
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="text"
                          name="organization"
                          value={profileData.organization}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={profileData.role}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="url"
                          name="website"
                          value={profileData.website}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6 slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Investment Criteria
                  </h2>
                  <button
                    onClick={handleSavePreferences}
                    disabled={updateCriteriaMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateCriteriaMutation.isPending
                      ? "Updating..."
                      : "Update Criteria"}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      Preferred Sectors
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "Technology",
                        "Agriculture",
                        "FinTech",
                        "Healthcare",
                        "Education",
                        "Energy",
                        "Manufacturing",
                      ].map((sector) => (
                        <button
                          key={sector}
                          onClick={() => {
                            setPreferences((prev) => ({
                              ...prev,
                              sectors: prev.sectors.includes(sector)
                                ? prev.sectors.filter((s) => s !== sector)
                                : [...prev.sectors, sector],
                            }));
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            preferences.sectors.includes(sector)
                              ? "bg-primary-600 text-white shadow-md"
                              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          }`}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Minimum Ticket Size (USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="number"
                          value={preferences.minTicket}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              minTicket: parseInt(e.target.value),
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Maximum Ticket Size (USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="number"
                          value={preferences.maxTicket}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              maxTicket: parseInt(e.target.value),
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      Investment Stages
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "Pre-Seed",
                        "Seed",
                        "Series A",
                        "Series B",
                        "Growth",
                      ].map((stage) => (
                        <button
                          key={stage}
                          onClick={() => {
                            setPreferences((prev) => ({
                              ...prev,
                              stages: prev.stages.includes(stage)
                                ? prev.stages.filter((s) => s !== stage)
                                : [...prev.stages, stage],
                            }));
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            preferences.stages.includes(stage)
                              ? "bg-primary-600 text-white shadow-md"
                              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          }`}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === "notifications" || activeTab === "security") && (
              <div className="text-center py-12 slide-up">
                <div className="bg-neutral-100 dark:bg-neutral-700 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-10 w-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Coming Soon
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  This section is currently under development.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorProfile;
