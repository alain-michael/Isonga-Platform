import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Star,
  ArrowLeft,
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import ChevronPatternSVG from "../ui/ChevronPatternSVG";
import { authAPI } from "../../services/api";

const schema = yup.object({
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
});

type FormData = { email: string };

const ForgotPassword: React.FC = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add("light");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await authAPI.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 bg-white dark:bg-neutral-900 relative z-20">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Back to Login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
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
              Forgot password?
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800/50 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300 mb-1">
                    Check your email
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    If an account exists for{" "}
                    <span className="font-medium">{getValues("email")}</span>,
                    you'll receive a password reset link shortly. The link is
                    valid for 24 hours.
                  </p>
                </div>
              </div>

              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                Didn't receive an email? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  try again
                </button>
                .
              </p>

              <Link
                to="/login"
                className="w-full py-3.5 px-4 border-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold rounded-xl hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all flex items-center justify-center"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      {...register("email")}
                      type="email"
                      id="email"
                      autoComplete="email"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                        errors.email
                          ? "border-red-300 dark:border-red-600 focus:border-red-500"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 bg-primary-700 dark:bg-white hover:bg-primary-600 hover:cursor-pointer dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-neutral-200 dark:border-neutral-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white dark:bg-neutral-900 text-sm text-neutral-500">
                      Remember your password?
                    </span>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="w-full py-3.5 px-4 border-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold rounded-xl hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all flex items-center justify-center"
                >
                  Back to Login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex lg:flex-[1.5] bg-primary-900 dark:bg-primary-950 relative overflow-hidden z-0">
        <div className="absolute top-0 bottom-0 left-0 w-24 z-20 pointer-events-none text-white dark:text-neutral-900">
          <ChevronPatternSVG flipped />
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-secondary-600/20 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative flex flex-col items-center justify-center p-12 text-white w-full">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-xl rotate-12 animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/3 right-20 w-12 h-12 bg-white/10 rounded-lg rotate-45" />

          <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center mb-10 shadow-2xl">
            <Star className="w-16 h-16 text-neutral-900" />
          </div>

          <h2 className="text-4xl font-bold mb-4 text-center">
            Secure Account Recovery
          </h2>
          <p className="text-neutral-400 text-center max-w-md text-lg">
            We'll send a secure, time-limited link to your email so you can safely
            reset your password and get back to growing your business.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
