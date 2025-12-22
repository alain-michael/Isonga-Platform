import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient: string;
  iconBg: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  gradient,
  iconBg,
}) => {
  return (
    <div className="group glass-effect rounded-2xl p-5 lg:p-6 card-hover glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${gradient} rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150`}
      />
      <div className="relative flex items-center">
        <div
          className={`p-3 ${iconBg} rounded-xl shadow-lg ${
            iconBg.includes("from")
              ? ""
              : "shadow-" + iconBg.split("-")[1] + "-500/25"
          }`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
