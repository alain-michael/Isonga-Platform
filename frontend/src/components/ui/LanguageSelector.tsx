import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { supportedLanguages, changeLanguage } from "../../lib/i18n";

interface LanguageSelectorProps {
  variant?: "default" | "minimal";
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = "default",
  className = "",
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    supportedLanguages.find((lang) => lang.code === i18n.language) ||
    supportedLanguages[0];

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "minimal") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Select language"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium">
            {currentLanguage.code.toUpperCase()}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 z-50">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                  i18n.language === lang.code
                    ? "bg-neutral-50 dark:bg-neutral-750 text-primary-600 dark:text-primary-400 font-medium"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {lang.name}
                  </div>
                </div>
                {i18n.language === lang.code && (
                  <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all w-full"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-neutral-500" />
        <div className="flex-1 text-left">
          <div className="font-medium text-neutral-900 dark:text-white">
            {currentLanguage.nativeName}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {currentLanguage.name}
          </div>
        </div>
        <span className="text-xl">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-full bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 z-50">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                i18n.language === lang.code
                  ? "bg-neutral-50 dark:bg-neutral-750 text-primary-600 dark:text-primary-400 font-medium"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {lang.name}
                </div>
              </div>
              {i18n.language === lang.code && (
                <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
