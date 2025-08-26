import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Building2, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login with:", { username: formData.username }); // Debug log
      await login(formData.username, formData.password);
      console.log("Login successful, navigating to dashboard"); // Debug log
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err); // Debug log
      setError(
        err.response?.data?.error ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-effect rounded-2xl p-8 shadow-xl slide-up">
        {/* Header */}
        <div className="text-center fade-in">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl gradient-bg shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">
            Welcome to Isonga
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            SME Assessment Platform - Sign in to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-700 font-medium">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-field pr-12"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="text-center pt-4">
              <span className="text-sm text-neutral-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Register here
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
