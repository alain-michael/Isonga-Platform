import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import {
  Star,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import ChevronPatternSVG from "../ui/ChevronPatternSVG";
import LanguageSelector from "../ui/LanguageSelector";

// Validation schema
const loginSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = {
  username: string;
  password: string;
};

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      await login(data.username, data.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Panel - Form (White/Light) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 bg-white dark:bg-neutral-900 relative z-20">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Language Selector */}
          <div className="absolute top-6 right-6">
            <LanguageSelector variant="minimal" />
          </div>

          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-primary-700 dark:bg-white rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Star className="w-8 h-8 text-white dark:text-primary-700 relative z-10 group-hover:text-white transition-colors" />
              </div>
              <div>
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Isonga
                </span>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wider uppercase">
                  Business Platform
                </p>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
              Welcome back
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Sign in to continue your journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Username or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  {...register("username")}
                  type="text"
                  id="username"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                    errors.username
                      ? "border-red-300 dark:border-red-600 focus:border-red-500"
                      : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                  }`}
                  placeholder="Enter your username or email"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                    errors.password
                      ? "border-red-300 dark:border-red-600 focus:border-red-500"
                      : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 bg-primary-700 dark:bg-white hover:bg-primary-600 hover:cursor-pointer dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-neutral-200 dark:border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-neutral-900 text-sm text-neutral-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social/SSO Login Options */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className="py-3 px-4 border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white rounded-xl transition-all flex items-center justify-center group"
                title="Sign in with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="py-3 px-4 border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white rounded-xl transition-all flex items-center justify-center group"
                title="Sign in with LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button
                type="button"
                className="py-3 px-4 border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white rounded-xl transition-all flex items-center justify-center group"
                title="Sign in with Microsoft"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
              </button>
            </div>

            {/* Register Link */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-neutral-200 dark:border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-neutral-900 text-sm text-neutral-500">
                  New to Isonga?
                </span>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full py-3.5 px-4 border-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold rounded-xl hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all flex items-center justify-center"
            >
              Create an Account
            </Link>
          </form>
        </div>
      </div>

      {/* Right Panel - Dark/Illustration */}
      <div className="hidden lg:flex lg:flex-[1.5] bg-primary-900 dark:bg-primary-950 relative overflow-hidden z-0">
        <div className="absolute top-0 bottom-0 left-0 w-24 z-20 pointer-events-none text-white dark:text-neutral-900">
          {/* currentColor allows the SVG to take the text-color defined in the parent div above */}
          <ChevronPatternSVG flipped />
        </div>
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          {/* Gradient orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-secondary-600/20 rounded-full blur-3xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Diagonal lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern
              id="diagonal"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#diagonal)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center p-12 text-white w-full">
          {/* Floating shapes */}
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-xl rotate-12 animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/3 right-20 w-12 h-12 bg-white/10 rounded-lg rotate-45" />

          <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center mb-10 shadow-2xl relative">
            <Star className="w-16 h-16 text-neutral-900" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full animate-ping" />
          </div>

          <h2 className="text-4xl font-bold mb-4 text-center">
            Grow Your Business
          </h2>
          <p className="text-neutral-400 text-center max-w-md mb-10 text-lg">
            Access comprehensive assessments, connect with investors, and unlock
            your business potential.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 w-full max-w-md">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-neutral-500 mt-1">Businesses</p>
            </div>
            <div className="text-center border-x border-neutral-800">
              <p className="text-3xl font-bold text-white">$2M+</p>
              <p className="text-sm text-neutral-500 mt-1">Funded</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-sm text-neutral-500 mt-1">Investors</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-w-md">
            <p className="text-neutral-300 text-sm italic mb-4">
              "Isonga helped us secure funding and grow our business by 300% in
              just one year."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                JM
              </div>
              <div>
                <p className="text-white font-medium text-sm">Jean Marie</p>
                <p className="text-neutral-500 text-xs">CEO, TechRwanda</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
