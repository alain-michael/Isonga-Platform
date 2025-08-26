import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="mb-8 fade-in">
          <div className="relative">
            <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text mb-4">
              404
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center shadow-2xl animate-bounce">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
            The page you're looking for seems to have wandered off into the
            digital wilderness. Don't worry though, we'll help you find your way
            back to where you need to be.
          </p>

          {/* Suggestions */}
          <div className="text-left space-y-3 mb-8">
            <div className="flex items-center space-x-3 text-neutral-700">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Double-check the URL for any typos</span>
            </div>
            <div className="flex items-center space-x-3 text-neutral-700">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>The page might have been moved or deleted</span>
            </div>
            <div className="flex items-center space-x-3 text-neutral-700">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Try navigating from the homepage</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center space-x-2 px-8 py-3"
            >
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center justify-center space-x-2 px-8 py-3"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        {/* Search Suggestion */}
        <div
          className="glass-effect rounded-2xl p-6 slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-center space-x-3 text-neutral-600">
            <Search className="h-5 w-5" />
            <span>
              Looking for something specific? Try our search or navigation menu.
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-10 w-12 h-12 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
};

export default NotFound;
