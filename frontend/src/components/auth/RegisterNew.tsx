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
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Loader2,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import ChevronPatternSVG from "../ui/ChevronPatternSVG";
import LanguageSelector from "../ui/LanguageSelector";

// Step 1: Personal Information
const step1Schema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email"),
  phone_number: yup.string().matches(/^(\+?250|0)?[7][2389]\d{7}$/, {
    message: "Please enter a valid Rwandan phone number",
    excludeEmptyString: true,
  }),
});

// Step 2: Password & Security
const step2Schema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], "You must agree to the terms and privacy policy"),
});

// Full validation schema for final submission
const fullSchema = step1Schema.concat(step2Schema);

type RegisterFormData = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number?: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

// Country codes for phone number
const countryCodes = [
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+257", country: "Burundi", flag: "🇧🇮" },
];

// Password strength checker component
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const checks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Contains uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains a number", valid: /[0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.valid).length;
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < strength
                ? strengthColors[strength - 1]
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Password strength:{" "}
        <span
          className={`font-medium ${
            strength >= 3 ? "text-green-600" : "text-orange-600"
          }`}
        >
          {strengthLabels[strength - 1] || "Very Weak"}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            {check.valid ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <X className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span
              className={
                check.valid
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500"
              }
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Stepper Component
const ProgressStepper: React.FC<{
  currentStep: number;
  totalSteps: number;
}> = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Security", icon: Lock },
    { number: 3, title: "Confirmation", icon: CheckCircle2 },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-primary-700 text-white ring-4 ring-primary-200 dark:ring-primary-900"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent
                      ? "text-primary-700 dark:text-primary-400"
                      : isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-neutral-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    currentStep > step.number
                      ? "bg-green-500"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                  style={{ maxWidth: "80px" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+250");

  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const password = watch("password", "");
  const allValues = watch();

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        "first_name",
        "last_name",
        "username",
        "email",
        "phone_number",
      ];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(currentStep + 1);
      setError("");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      const { confirmPassword, agreeToTerms, ...registrationData } = data;
      await authRegister({
        ...registrationData,
        user_type: "enterprise",
      });
      setCurrentStep(3); // Move to confirmation step
      setTimeout(() => {
        navigate("/business-registration");
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Panel - Dark/Illustration */}
      <div className="hidden lg:flex lg:flex-[1.4] bg-primary-900 dark:bg-primary-950 relative overflow-hidden z-0">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-32 left-20 w-72 h-72 bg-secondary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center p-12 text-white w-full">
          <div className="absolute top-16 right-16 w-16 h-16 border-2 border-white/20 rounded-xl -rotate-12 animate-pulse" />
          <div
            className="absolute bottom-32 left-16 w-12 h-12 border-2 border-white/20 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />

          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative">
            <Star className="w-14 h-14 text-neutral-900" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-secondary-500 rounded-full animate-ping" />
          </div>

          <h2 className="text-4xl font-bold mb-4 text-center">
            Join Isonga Platform
          </h2>
          <p className="text-neutral-400 text-center max-w-md mb-10 text-lg">
            Register your business and unlock access to assessments, investors,
            and growth opportunities.
          </p>

          {/* Benefits list */}
          <div className="space-y-4 text-left max-w-sm w-full">
            {[
              { text: "Free business assessment", icon: "📊" },
              { text: "Connect with verified investors", icon: "🤝" },
              { text: "Access to funding opportunities", icon: "💰" },
              { text: "Expert business guidance", icon: "🎯" },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"
              >
                <span className="text-xl">{benefit.icon}</span>
                <span className="text-neutral-300">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-neutral-800 w-full max-w-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Trusted by</span>
              <span className="font-bold text-white">500+ businesses</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 bottom-0 right-0 w-24 z-20 pointer-events-none text-white dark:text-neutral-900">
          <ChevronPatternSVG />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-20 py-8 bg-white dark:bg-neutral-900 relative z-20 overflow-auto">
        <div className="mx-auto w-full max-w-md">
          {/* Language Selector */}
          <div className="absolute top-6 right-6">
            <LanguageSelector variant="minimal" />
          </div>

          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4 lg:hidden">
              <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white dark:text-neutral-900" />
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                Isonga
              </span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {currentStep === 1 &&
                "Let's start with your personal information"}
              {currentStep === 2 &&
                "Secure your account with a strong password"}
              {currentStep === 3 && "Registration successful!"}
            </p>
          </div>

          {/* Progress Stepper */}
          <ProgressStepper currentStep={currentStep} totalSteps={3} />

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                    >
                      First Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-neutral-400" />
                      </div>
                      <input
                        {...register("first_name")}
                        type="text"
                        id="first_name"
                        className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                          errors.first_name
                            ? "border-red-300 dark:border-red-600"
                            : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                        }`}
                        placeholder="First name"
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                    >
                      Last Name
                    </label>
                    <input
                      {...register("last_name")}
                      type="text"
                      id="last_name"
                      className={`w-full px-3 py-3 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                        errors.last_name
                          ? "border-red-300 dark:border-red-600"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                      }`}
                      placeholder="Last name"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                      {...register("username")}
                      type="text"
                      id="username"
                      className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                        errors.username
                          ? "border-red-300 dark:border-red-600"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                      }`}
                      placeholder="Choose a username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                      {...register("email")}
                      type="email"
                      id="email"
                      className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                        errors.email
                          ? "border-red-300 dark:border-red-600"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone with Country Code */}
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    Phone Number{" "}
                    <span className="text-xs font-normal text-neutral-500">
                      (Optional)
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="w-32 px-3 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-all"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-4 h-4 text-neutral-400" />
                      </div>
                      <input
                        {...register("phone_number")}
                        type="tel"
                        id="phone_number"
                        className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                          errors.phone_number
                            ? "border-red-300 dark:border-red-600"
                            : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                        }`}
                        placeholder="78X XXX XXX"
                      />
                    </div>
                  </div>
                  {errors.phone_number && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.phone_number.message}
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 px-4 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Step 2: Password & Security */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                        errors.password
                          ? "border-red-300 dark:border-red-600"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
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
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-neutral-800 transition-all ${
                        errors.confirmPassword
                          ? "border-red-300 dark:border-red-600"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms & Privacy Policy Checkbox */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <input
                    {...register("agreeToTerms")}
                    type="checkbox"
                    id="agreeToTerms"
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white focus:ring-neutral-900 dark:focus:ring-white bg-white dark:bg-neutral-700"
                  />
                  <label
                    htmlFor="agreeToTerms"
                    className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      target="_blank"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    . I understand that my data will be processed in accordance
                    with GDPR regulations.
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.agreeToTerms.message}
                  </p>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-3.5 px-4 border-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold rounded-xl hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all flex items-center justify-center gap-2 group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 px-4 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="text-center py-8 animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                  Account Created Successfully!
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Welcome to Isonga Platform. You'll be redirected to complete
                  your business registration.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting...
                </div>
              </div>
            )}

            {/* Login Link */}
            {currentStep < 3 && (
              <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 pt-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-neutral-900 dark:text-white hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
