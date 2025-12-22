import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

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
        {/* Mobile Header */}
        <header className="lg:hidden glass-effect dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 h-16 flex items-center px-4 justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-lg text-neutral-900 dark:text-white">
            Isonga
          </span>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

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
