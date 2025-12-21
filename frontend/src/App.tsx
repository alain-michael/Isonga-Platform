import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { queryClient } from "./lib/react-query";
import Welcome from "./components/Welcome";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import BusinessRegistrationFlow from "./components/registration/BusinessRegistrationFlow";
import Dashboard from "./components/dashboard/Dashboard";
import EnterpriseProfile from "./components/enterprise/EnterpriseProfile";
import Assessments from "./components/assessments/Assessments";
import AssessmentForm from "./components/assessments/AssessmentForm";
import AssessmentDetailView from "./components/assessments/AssessmentDetailView";
import ManageAssessments from "./components/assessments/ManageAssessments";
import CreateAssessment from "./components/assessments/CreateAssessment";
import StartAssessment from "./components/assessments/StartAssessment";
import QuestionnaireForm from "./components/admin/QuestionnaireForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminEnterprises from "./components/admin/AdminEnterprises";
import AdminEnterpriseDetail from "./components/admin/AdminEnterpriseDetail";
import AdminQuestionnaires from "./components/admin/AdminQuestionnaires";
import AdminInvestors from "./components/admin/AdminInvestors";
import InvestorDetailView from "./components/admin/InvestorDetailView";
import AdminUsers from "./components/admin/AdminUsers";
import AdminCampaigns from "./components/admin/AdminCampaigns";
import AdminCampaignDetail from "./components/admin/AdminCampaignDetail";
import NotFound from "./components/common/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import {
  CampaignList,
  CreateCampaign,
  CampaignDetail,
} from "./components/campaigns";
import EditCampaign from "./components/campaigns/EditCampaign";
import InvestorDashboard from "./components/investor/InvestorDashboard";
import InvestorMatches from "./components/investor/InvestorMatches";
import InvestorMatchDetail from "./components/investor/InvestorMatchDetail";
import InvestorProfile from "./components/investor/InvestorProfile";
import InvestorOpportunities from "./components/investor/InvestorOpportunities";
import Messages from "./components/messages/Messages";
import "./styles.css";
import AdminAssessments from "./components/admin/AdminAssessments";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-primary-600"></div>
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">
            Loading...
          </p>
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-secondary-600"></div>
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
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

      {/* Protected Routes with Sidebar Layout */}
      <Route element={<ProtectedLayout />}>
        <Route
          path="/business-registration"
          element={<BusinessRegistrationFlow />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<EnterpriseProfile />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/assessments/start" element={<StartAssessment />} />
        <Route path="/assessments/manage" element={<ManageAssessments />} />
        <Route path="/assessments/create" element={<CreateAssessment />} />
        <Route path="/assessments/:id" element={<AssessmentDetailView />} />
        <Route path="/assessments/:id/take" element={<AssessmentForm />} />

        {/* Campaign Routes */}
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/create" element={<CreateCampaign />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/campaigns/:id/edit" element={<EditCampaign />} />

        {/* Investor Routes */}
        <Route path="/investor/dashboard" element={<InvestorDashboard />} />
        <Route path="/investor/matches" element={<InvestorMatches />} />
        <Route path="/investor/matches/:id" element={<InvestorMatchDetail />} />
        <Route
          path="/investor/opportunities"
          element={<InvestorOpportunities />}
        />
        <Route path="/investor/profile" element={<InvestorProfile />} />

        {/* Messages Route */}
        <Route path="/messages" element={<Messages />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/manage" element={<ManageAssessments />} />
        <Route path="/admin/assessments" element={<AdminAssessments />} />
        <Route
          path="/admin/questionnaires/create"
          element={<QuestionnaireForm />}
        />
        <Route path="/admin/questionnaires" element={<AdminQuestionnaires />} />
        <Route path="/admin/investors" element={<AdminInvestors />} />
        <Route path="/admin/investors/:id" element={<InvestorDetailView />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/enterprises" element={<AdminEnterprises />} />
        <Route
          path="/admin/enterprises/:id"
          element={<AdminEnterpriseDetail />}
        />
        <Route path="/admin/campaigns" element={<AdminCampaigns />} />
        <Route path="/admin/campaigns/:id" element={<AdminCampaignDetail />} />
      </Route>

      {/* Welcome page - landing */}
      <Route path="/" element={<Welcome />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
