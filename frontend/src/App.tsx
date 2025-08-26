import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import BusinessRegistrationFlow from "./components/registration/BusinessRegistrationFlow";
import Dashboard from "./components/dashboard/Dashboard";
import EnterpriseProfile from "./components/enterprise/EnterpriseProfile";
import Assessments from "./components/assessments/Assessments";
import AssessmentForm from "./components/assessments/AssessmentForm";
import ManageAssessments from "./components/assessments/ManageAssessments";
import CreateAssessment from "./components/assessments/CreateAssessment";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminAssessments from "./components/admin/AdminAssessment";
import AdminEnterprises from "./components/admin/AdminEnterprises";
import AdminEnterpriseDetail from "./components/admin/AdminEnterpriseDetail";
import NotFound from "./components/common/NotFound";
import Navbar from "./components/layout/Navbar";
import "./styles.css";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-primary-600"></div>
          <p className="text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-secondary-600"></div>
          <p className="text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {isAuthenticated && <Navbar />}
      <div className={isAuthenticated ? "pt-16" : ""}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/business-registration"
            element={
              <ProtectedRoute>
                <BusinessRegistrationFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <EnterpriseProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments"
            element={
              <ProtectedRoute>
                <Assessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/manage"
            element={
              <ProtectedRoute>
                <ManageAssessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/create"
            element={
              <ProtectedRoute>
                <CreateAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/:id"
            element={
              <ProtectedRoute>
                <AssessmentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assessments"
            element={
              <ProtectedRoute>
                <AdminAssessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enterprises"
            element={
              <ProtectedRoute>
                <AdminEnterprises />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enterprises/:enterpriseId"
            element={
              <ProtectedRoute>
                <AdminEnterpriseDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
