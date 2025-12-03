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

            {/* Register Link */}
            <div className="relative my-8">
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
        <div className="absolute top-0 bottom-0 left-0 w-24 z-20 pointer-events-none text-white dark:text-neutral-900 rotate-180">
          {/* currentColor allows the SVG to take the text-color defined in the parent div above */}
          <ChevronPatternSVG />
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
