import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Building2, Home, User, FileText, LogOut, Shield } from "lucide-react";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
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
      path: "/assessments",
      icon: FileText,
      visible: user?.user_type === "admin" || user?.user_type === "superadmin" || user?.user_type === "enterprise",
    },
    {
      name: "Manage Assessments",
      path: "/admin/assessments",
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
    <nav className="glass-effect fixed top-0 left-0 right-0 z-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">Isonga</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-md"
                        : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

            <div className="flex items-center space-x-4 border-l border-neutral-200 pl-6">
              <div className="text-sm">
                <div className="font-semibold text-neutral-900">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-neutral-500 capitalize text-xs">
                  {user?.user_type?.replace("_", " ")}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
