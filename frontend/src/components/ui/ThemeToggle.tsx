import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  size = "md",
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const buttonSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${buttonSizeClasses[size]}
        rounded-lg
        border border-neutral-200 dark:border-neutral-700
        bg-neutral-100 dark:bg-neutral-800
        text-neutral-700 dark:text-neutral-200
        hover:bg-neutral-50 dark:hover:bg-neutral-700
        hover:border-neutral-300 dark:hover:border-neutral-600
        transition-all duration-200
        shadow-sm hover:shadow-md
        ${className}
      `}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? (
        <Moon className={sizeClasses[size]} />
      ) : (
        <Sun className={sizeClasses[size]} />
      )}
    </button>
  );
};

export default ThemeToggle;
