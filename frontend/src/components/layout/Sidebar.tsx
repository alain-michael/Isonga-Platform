import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import {
  Building2,
  User,
  FileText,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Users,
  Target,
  Globe,
  ChevronDown,
  TrendingUp,
  Heart,
  MessageSquare,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";
import ThemeToggle from "../ui/ThemeToggle";
import { supportedLanguages, changeLanguage } from "../../lib/i18n";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const currentLang =
    supportedLanguages.find((lang) => lang.code === i18n.language) ||
    supportedLanguages[0];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    setShowLangDropdown(false);
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const navItems = [
    // Dashboard - Always first
    {
      name: t("navigation.dashboard"),
      path: "/dashboard",
      icon: LayoutDashboard,
      visible: user?.user_type !== "investor",
    },
    {
      name: t("navigation.dashboard"),
      path: "/investor/dashboard",
      icon: LayoutDashboard,
      visible: user?.user_type === "investor",
    },
    {
      name: "Investment Criteria",
      path: "/investor/criteria",
      icon: Settings,
      visible: user?.user_type === "investor",
    },
    // Partner-specific navigation
    {
      name: "Opportunities",
      path: "/investor/matches",
      icon: Target,
      visible: user?.user_type === "investor",
    },
    {
      name: "Tracked",
      path: "/investor/opportunities",
      icon: Heart,
      visible: user?.user_type === "investor",
    },
    {
      name: t("admin.manageQuestionnaires"),
      path: "/admin/questionnaires",
      icon: FileText,
      visible: user?.user_type === "admin" || user?.user_type === "superadmin",
    },
    // SME & Admin shared features
    {
      name: t("navigation.assessments"),
      path:
        user?.user_type === "admin" || user?.user_type === "superadmin"
          ? "/admin/assessments"
          : "/assessments",
      icon: ClipboardList,
      visible:
        user?.user_type === "admin" ||
        user?.user_type === "superadmin" ||
        user?.user_type === "enterprise",
    },
    {
      name: t("navigation.campaigns"),
      path: "/campaigns",
      icon: Target,
      visible: user?.user_type === "enterprise",
    },
    {
      name: "Funding Applications",
      path: "/admin/campaigns",
      icon: Target,
      visible: user?.user_type === "admin" || user?.user_type === "superadmin",
    },
    // Messages
    {
      name: "Messages",
      path: "/messages",
      icon: MessageSquare,
      visible:
        user?.user_type === "investor" || user?.user_type === "enterprise",
    },
    // Admin-only navigation
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
      visible: user?.user_type === "admin" || user?.user_type === "superadmin",
    },
    {
      name: t("navigation.enterprises"),
      path: "/admin/enterprises",
      icon: Building2,
      visible: user?.user_type === "admin" || user?.user_type === "superadmin",
    },
    {
      name: "Funding Partners",
      path: "/admin/investors",
      icon: TrendingUp,
      visible: user?.user_type === "admin" || user?.user_type === "superadmin",
    },
    // Profile - Personal information
    {
      name: t("navigation.profile"),
      path: "/investor/profile",
      icon: User,
      visible: user?.user_type === "investor",
    },
    {
      name: t("navigation.profile"),
      path: "/profile",
      icon: User,
      visible: user?.user_type === "enterprise",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 glass-effect border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex-shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                Isonga
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-neutral-400 dark:text-neutral-500",
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
          </nav>

          {/* User Profile & Footer */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {currentLang.flag} {currentLang.nativeName}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-neutral-400 transition-transform duration-200",
                    showLangDropdown && "rotate-180",
                  )}
                />
              </button>

              {showLangDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-1 glass-effect dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors",
                        i18n.language === lang.code
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700",
                      )}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t("settings.theme")}
              </span>
              <ThemeToggle />
            </div>

            <div className="flex items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate capitalize">
                  {user?.user_type}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
