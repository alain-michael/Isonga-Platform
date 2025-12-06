import React from "react";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-xl p-1">
      <button
        onClick={() => onViewModeChange("table")}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          viewMode === "table"
            ? "bg-white dark:bg-neutral-600 text-primary-600 dark:text-primary-400 shadow-sm"
            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
        }`}
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        onClick={() => onViewModeChange("grid")}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          viewMode === "grid"
            ? "bg-white dark:bg-neutral-600 text-primary-600 dark:text-primary-400 shadow-sm"
            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>
    </div>
  );
};

export default ViewToggle;
