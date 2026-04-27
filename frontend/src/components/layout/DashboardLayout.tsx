import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import NotificationBell from "../notifications/NotificationBell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-neutral-100 dark:bg-neutral-950 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar — notification bell (desktop + mobile) */}
        <div className="flex-shrink-0 h-12 flex items-center justify-end px-4 sm:px-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 lg:flex">
          {/* Mobile hamburger in same row */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 mr-auto rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Menu className="h-5 w-5" />
          </button>
          <NotificationBell />
        </div>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
