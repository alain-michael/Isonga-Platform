import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Building2, Home, User, FileText, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
      visible: true,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
      visible: user?.user_type === "enterprise",
    },
    {
      name: "Assessments",
      path:
        user?.user_type === "admin" || user?.user_type === "superadmin"
          ? "/admin"
          : "/assessments",
      icon: FileText,
      visible:
        user?.user_type === "admin" ||
        user?.user_type === "superadmin" ||
        user?.user_type === "enterprise",
    },
    {
      name: "Manage Questionnaires",
      path: "/admin/manage",
      icon: FileText,
      visible: user?.user_type === "admin" || user?.user_type === "superadmin",
    },
    {
      name: "Manage Enterprises",
      path: "/admin/enterprises",
      icon: Building2,
      visible: user?.user_type === "admin" || user?.user_type === "superadmin",
    },
  ];

  return (
    <nav className="glass-effect fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 sm:space-x-3"
            >
              {/* <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                <Building2 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div> */}
              <span className="text-lg font-[cinzel] sm:text-3xl font-bold text-clip bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent dark:text-neutral-100">
                Isonga
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-md"
                        : "text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}

            {/* Desktop User Menu */}
            <div className="flex items-center space-x-3 lg:space-x-4 border-l border-neutral-200 dark:border-neutral-700 pl-3 lg:pl-6">
              <ThemeToggle size="sm" />

              <div className="text-sm hidden lg:block">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 capitalize text-xs">
                  {user?.user_type?.replace("_", " ")}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
            <div className="py-4 space-y-2">
              {/* Mobile User Info */}
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 capitalize text-sm">
                  {user?.user_type?.replace("_", " ")}
                </div>
              </div>

              {/* Mobile Navigation Items */}
              {navItems
                .filter((item) => item.visible)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 text-base font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-r-4 border-primary-600 dark:border-primary-400"
                          : "text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="flex items-center space-x-3 px-4 py-3 w-full text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
