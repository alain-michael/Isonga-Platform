import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Award,
  RefreshCw,
  UserCheck,
  Edit,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  Briefcase,
  Phone,
  Link as LinkIcon,
  DollarSign,
} from "lucide-react";
import { assessmentAPI, adminAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface AssessmentDetail {
  id: number;
  enterprise: {
    id: number;
    business_name: string;
    sector: string;
    district: string;
    email: string;
    phone_number: string;
  };
  questionnaire: {
    id: number;
    title: string;
    category: {
      id?: number;
      name: string;
    };
    category_name?: string;
    estimated_time?: number;
    question_count?: number;
  };
  questionnaire_detail?: {
    id: number;
    title: string;
    questions: any[];
  };
  status: string;
  total_score: number;
  max_possible_score: number;
  percentage_score: number;
  fiscal_year: number;
  started_at: string | null;
  completed_at: string | null;
  reviewed_at: string | null;
  reviewed_by: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
  updated_at: string;
  responses: AssessmentResponse[];
  category_scores: CategoryScore[];
  recommendations: Recommendation[];
  ai_strengths: string[];
  ai_weaknesses: string[];
  ai_generated_at: string | null;
}

interface AssessmentResponse {
  id: number;
  question: number;
  selected_options: number[];
  text_response: string | null;
  number_response: number | null;
  file_response: string | null;
  score: number;
}

interface CategoryScore {
  id: number;
  category: number;
  category_name: string;
  score: number;
  max_score: number;
  percentage: number;
}

interface RecommendedService {
  id: number;
  name: string;
  description: string;
  price: string;
  contact: string;
  link: string;
}

interface Recommendation {
  id: number;
  category: number;
  category_name: string;
  title: string;
  description: string;
  priority: string;
  suggested_actions: string;
  recommended_services: RecommendedService[];
}

interface AdminUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

const AssessmentDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin =
    user?.user_type === "admin" || user?.user_type === "superadmin";
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "responses" | "scores" | "results"
  >("responses");
  const [showAssignReviewer, setShowAssignReviewer] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAssessmentDetails();
    fetchAdminUsers();
  }, [id]);

  const fetchAssessmentDetails = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getAssessmentById(id!);
      const assessmentData = {
        ...response.data,
        percentage_score: parseFloat(response.data.percentage_score),
        total_score: parseFloat(response.data.total_score),
        max_possible_score: parseFloat(response.data.max_possible_score),
      };

      // If enterprise details are missing or incomplete, fetch them
      if (
        !assessmentData.enterprise?.business_name &&
        assessmentData.enterprise
      ) {
        try {
          // Import enterpriseAPI if needed
          const { default: api } = await import("../../services/api");
          const enterpriseResponse = await api.get(
            `/enterprises/api/enterprises/${assessmentData.enterprise}/`,
          );
          assessmentData.enterprise = enterpriseResponse.data;
        } catch (err) {
          console.error("Error fetching enterprise details:", err);
        }
      }

      setAssessment(assessmentData);
    } catch (err) {
      console.error("Error fetching assessment details:", err);
      setError("Failed to load assessment details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ user_type: "admin" });
      const users = response.data.results || response.data;
      setAdminUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("Error fetching admin users:", err);
    }
  };

  const handleRegrade = async () => {
    if (
      !window.confirm(
        "Are you sure you want to regrade this assessment? This will recalculate all scores.",
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      await assessmentAPI.regradeAssessment(id!);
      await fetchAssessmentDetails();
      alert("Assessment regraded successfully!");
    } catch (err) {
      console.error("Error regrading assessment:", err);
      alert("Failed to regrade assessment");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    if (!window.confirm("Mark this assessment as reviewed?")) {
      return;
    }

    try {
      setProcessing(true);
      await assessmentAPI.reviewAssessment(id!);
      await fetchAssessmentDetails();
      alert("Assessment marked as reviewed!");
    } catch (err) {
      console.error("Error marking assessment as reviewed:", err);
      alert("Failed to mark assessment as reviewed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadReport = () => {
    const doc = window.open("", "_blank");
    if (!doc) return;

    const pct = assessment!.percentage_score;
    const scoreColor = pct >= 75 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
    const performanceLabel = pct >= 75 ? "Excellent" : pct >= 50 ? "Good" : "Needs Improvement";

    const responsesHTML = assessment!.responses
      .map((response, index) => {
        const question = assessment!.questionnaire_detail?.questions?.find(
          (q: any) => q.id === response.question,
        );
        if (!question) return "";
        const recs =
          question.conditional_recommendations?.filter(
            (rec: any) =>
              rec.min_score <= response.score &&
              rec.max_score >= response.score,
          ) || [];
        const selectedLabels =
          response.selected_options
            ?.map((optId: number) => {
              const opt = question.options?.find((o: any) => o.id === optId);
              return opt?.text || opt?.label || String(optId);
            })
            .filter(Boolean) || [];
        let answerHTML = "";
        if (selectedLabels.length > 0) {
          answerHTML = `<ul style="margin:4px 0 0 16px;padding:0;">${selectedLabels.map((l: string) => `<li>${l}</li>`).join("")}</ul>`;
        } else if (response.text_response) {
          answerHTML = `<p style="margin:4px 0 0;font-style:italic;">${response.text_response}</p>`;
        } else if (response.number_response !== null && response.number_response !== undefined) {
          answerHTML = `<p style="margin:4px 0 0;font-weight:bold;">${response.number_response}</p>`;
        } else {
          answerHTML = `<p style="margin:4px 0 0;color:#9ca3af;">No answer provided</p>`;
        }
        const recHTML =
          recs.length > 0
            ? `<div style="margin-top:8px;padding:8px 12px;background:#eff6ff;border-left:3px solid #3b82f6;border-radius:4px;"><p style="font-size:11px;font-weight:600;color:#1d4ed8;margin:0 0 4px;">Recommendation</p>${recs.map((rec: any) => `<p style="font-size:12px;color:#1e40af;margin:0;">${rec.recommendation_text}</p>`).join("")}</div>`
            : "";
        const scoreBadgeBg = response.score > 0 ? "#dcfce7" : "#f3f4f6";
        const scoreBadgeColor = response.score > 0 ? "#166534" : "#6b7280";
        return `<div style="margin-bottom:14px;padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px;page-break-inside:avoid;"><div style="display:flex;align-items:flex-start;gap:10px;"><span style="flex-shrink:0;width:24px;height:24px;border-radius:50%;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">${index + 1}</span><div style="flex:1;"><p style="font-weight:600;margin:0 0 6px;font-size:13px;color:#111827;">${question.text}</p><div style="font-size:13px;color:#374151;">${answerHTML}</div><span style="display:inline-block;margin-top:6px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${scoreBadgeBg};color:${scoreBadgeColor};">Score: ${response.score} pts</span>${recHTML}</div></div></div>`;
      })
      .join("");

    const scoresHTML = assessment!.category_scores
      .map((cs) => {
        const p = parseFloat(cs.percentage as any).toFixed(1);
        const c = parseFloat(cs.percentage as any) >= 75 ? "#16a34a" : parseFloat(cs.percentage as any) >= 50 ? "#d97706" : "#dc2626";
        return `<div style="margin-bottom:12px;page-break-inside:avoid;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;font-weight:600;color:#111827;">${cs.category_name}</span><span style="font-size:13px;font-weight:700;color:${c};">${p}%</span></div><div style="background:#e5e7eb;border-radius:9999px;height:8px;"><div style="background:${c};width:${p}%;height:8px;border-radius:9999px;"></div></div><p style="font-size:11px;color:#6b7280;margin:4px 0 0;">${parseFloat(cs.score as any).toFixed(1)} / ${parseFloat(cs.max_score as any).toFixed(1)} points</p></div>`;
      })
      .join("");

    const recsHTML = (assessment!.recommendations || [])
      .sort((a, b) => {
        const o = { high: 0, medium: 1, low: 2 };
        return (o[a.priority as keyof typeof o] || 3) - (o[b.priority as keyof typeof o] || 3);
      })
      .map((rec, i) => {
        const borderColor = rec.priority === "high" ? "#fca5a5" : rec.priority === "medium" ? "#fdba74" : "#93c5fd";
        const badgeBg = rec.priority === "high" ? "#fef2f2" : rec.priority === "medium" ? "#fff7ed" : "#eff6ff";
        const badgeColor = rec.priority === "high" ? "#991b1b" : rec.priority === "medium" ? "#9a3412" : "#1e40af";
        const servicesHTML =
          rec.recommended_services?.length > 0
            ? `<div style="margin-top:10px;"><p style="font-size:11px;font-weight:600;color:#6b7280;margin:0 0 6px;">Recommended Services</p>${rec.recommended_services.map((s) => `<div style="padding:8px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:6px;"><p style="font-weight:600;font-size:12px;margin:0 0 2px;color:#111827;">${s.name}</p>${s.description ? `<p style="font-size:11px;color:#6b7280;margin:0 0 4px;">${s.description}</p>` : ""}${s.price ? `<p style="font-size:11px;color:#374151;margin:0;">Price: ${s.price}</p>` : ""}${s.contact ? `<p style="font-size:11px;color:#374151;margin:0;">Contact: ${s.contact}</p>` : ""}</div>`).join("")}</div>`
            : "";
        return `<div style="margin-bottom:12px;padding:14px;border:2px solid ${borderColor};border-radius:10px;page-break-inside:avoid;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="width:28px;height:28px;border-radius:50%;background:${badgeColor};color:white;font-size:13px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">${i + 1}</span><strong style="font-size:14px;color:#111827;flex:1;">${rec.title}</strong><span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${badgeBg};color:${badgeColor};">${rec.priority.toUpperCase()}</span></div><p style="font-size:13px;color:#374151;margin:0 0 8px;">${rec.description}</p><div style="background:#f9fafb;border-radius:6px;padding:10px;"><p style="font-size:11px;font-weight:600;color:#6b7280;margin:0 0 4px;">Suggested Actions</p><p style="font-size:13px;color:#374151;margin:0;">${rec.suggested_actions}</p></div>${servicesHTML}</div>`;
      })
      .join("");

    doc.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Assessment Report – ${assessment!.enterprise.business_name}</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#111827;background:#fff;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.no-print{display:none;}}</style></head><body style="padding:40px;max-width:900px;margin:0 auto;"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #e5e7eb;"><div><h1 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:4px;">Assessment Report</h1><p style="color:#6b7280;font-size:14px;">${assessment!.questionnaire.title}</p><p style="color:#6b7280;font-size:13px;margin-top:4px;">Fiscal Year ${assessment!.fiscal_year} • #${assessment!.id}</p></div><div style="text-align:right;"><div style="font-size:40px;font-weight:700;color:${scoreColor};">${Math.round(pct)}%</div><div style="font-size:12px;color:#6b7280;">${assessment!.total_score} / ${assessment!.max_possible_score} pts</div><div style="font-size:13px;font-weight:600;color:${scoreColor};margin-top:2px;">${performanceLabel}</div></div></div><div style="margin-bottom:28px;padding:16px;background:#f9fafb;border-radius:10px;"><h2 style="font-size:15px;font-weight:700;color:#374151;margin-bottom:12px;">Business Information</h2><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;"><div><p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">Business Name</p><p style="font-weight:600;font-size:13px;">${assessment!.enterprise.business_name}</p></div><div><p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">Sector</p><p style="font-weight:600;font-size:13px;">${assessment!.enterprise.sector}</p></div><div><p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">District</p><p style="font-weight:600;font-size:13px;">${assessment!.enterprise.district}</p></div><div><p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">Email</p><p style="font-weight:600;font-size:13px;">${assessment!.enterprise.email}</p></div><div><p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">Phone</p><p style="font-weight:600;font-size:13px;">${assessment!.enterprise.phone_number}</p></div><div><p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">Status</p><p style="font-weight:600;font-size:13px;text-transform:capitalize;">${assessment!.status.replace("_", " ")}</p></div></div></div>${assessment!.category_scores.length > 0 ? `<div style="margin-bottom:28px;"><h2 style="font-size:16px;font-weight:700;color:#374151;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Category Scores</h2>${scoresHTML}</div>` : ""}${assessment!.responses.length > 0 ? `<div style="margin-bottom:28px;"><h2 style="font-size:16px;font-weight:700;color:#374151;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Responses &amp; Answers</h2>${responsesHTML}</div>` : ""}${assessment!.recommendations?.length > 0 ? `<div style="margin-bottom:28px;"><h2 style="font-size:16px;font-weight:700;color:#374151;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Recommended Actions</h2>${recsHTML}</div>` : ""}<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;"><p style="font-size:11px;color:#9ca3af;">Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p><p style="font-size:11px;color:#9ca3af;">Isonga Platform • Confidential</p></div><div class="no-print" style="margin-top:24px;text-align:center;"><button onclick="window.print()" style="padding:10px 24px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Print / Save as PDF</button></div></body></html>`);
    doc.document.close();
    doc.focus();
  };

  const handleAssignReviewer = async () => {
    if (!selectedReviewer) {
      alert("Please select a reviewer");
      return;
    }

    try {
      setProcessing(true);
      await assessmentAPI.assignReviewer(id!, selectedReviewer);
      await fetchAssessmentDetails();
      setShowAssignReviewer(false);
      alert("Reviewer assigned successfully!");
    } catch (err) {
      console.error("Error assigning reviewer:", err);
      alert("Failed to assign reviewer");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return <CheckCircle2 className="h-5 w-5" />;
      case "in_progress":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Assessment not found"}</p>
          <button onClick={() => navigate(-1)} className="mt-4 btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {assessment.questionnaire.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(
                  assessment.status,
                )}`}
              >
                {getStatusIcon(assessment.status)}
                <span>{assessment.status.replace("_", " ").toUpperCase()}</span>
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Assessment ID: #{assessment.id} • Fiscal Year{" "}
              {assessment.fiscal_year}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {isAdmin && assessment.status === "completed" && (
            <>
              <button
                onClick={handleRegrade}
                disabled={processing}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${processing ? "animate-spin" : ""}`}
                />
                <span>Regrade</span>
              </button>
              <button
                onClick={() => setShowAssignReviewer(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <UserCheck className="h-4 w-4" />
                <span>Assign Reviewer</span>
              </button>
              <button
                onClick={handleMarkAsReviewed}
                disabled={processing}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark as Reviewed</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Enterprise Info Card */}
      <div className="glass-effect rounded-2xl p-6 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary-600" />
          Enterprise Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Business Name
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.business_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Sector
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.sector}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              District
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.district}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Email
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Phone
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.enterprise.phone_number}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Category
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {assessment.questionnaire.category?.name || assessment.questionnaire?.category_name || "Uncategorized"}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline & Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="glass-effect rounded-2xl p-6 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Created
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {formatDate(assessment.created_at)}
                </p>
              </div>
            </div>
            {assessment.started_at && (
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Started
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(assessment.started_at)}
                  </p>
                </div>
              </div>
            )}
            {assessment.completed_at && (
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Completed
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(assessment.completed_at)}
                  </p>
                </div>
              </div>
            )}
            {assessment.reviewed_at && assessment.reviewed_by && (
              <div className="flex items-start space-x-3">
                <UserCheck className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Reviewed
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(assessment.reviewed_at)} by{" "}
                    {assessment.reviewed_by.first_name}{" "}
                    {assessment.reviewed_by.last_name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overall Score */}
        <div className="glass-effect rounded-2xl p-6 glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary-600" />
            Overall Score
          </h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-neutral-200 dark:text-neutral-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={
                    2 * Math.PI * 56 * (1 - assessment.percentage_score / 100)
                  }
                  className={`${
                    assessment.percentage_score >= 75
                      ? "text-green-500"
                      : assessment.percentage_score >= 50
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {assessment.percentage_score.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {assessment.total_score.toFixed(1)} /{" "}
              {assessment.max_possible_score.toFixed(1)} points
            </p>
            <div className="flex items-center justify-center space-x-2">
              {assessment.percentage_score >= 75 ? (
                <>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Excellent Performance
                  </span>
                </>
              ) : assessment.percentage_score >= 50 ? (
                <>
                  <Target className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Good Performance
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Needs Improvement
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-effect rounded-2xl glass-effect dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex space-x-8 px-6">
            {[
              { id: "responses", label: "Responses & Answers", icon: FileText },
              { id: "scores", label: "Category Scores", icon: BarChart3 },
              {
                id: "results",
                label: "Results & Recommendations",
                icon: Award,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Responses Tab */}
          {activeTab === "responses" && (
            <div className="space-y-6">
              {assessment.responses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No responses yet
                  </p>
                </div>
              ) : (
                assessment.responses.map((response, index) => {
                  const question =
                    assessment.questionnaire_detail?.questions?.find(
                      (q: any) => q.id === response.question,
                    );
                  if (!question) return null;

                  const questionRecommendations =
                    question.conditional_recommendations?.filter(
                      (rec: any) =>
                        rec.min_score <= response.score &&
                        rec.max_score >= response.score,
                    ) || [];

                  const selectedOptionLabels =
                    response.selected_options
                      ?.map((optId: number) => {
                        const opt = question.options?.find(
                          (o: any) => o.id === optId,
                        );
                        return opt?.text || opt?.label || String(optId);
                      })
                      .filter(Boolean) || [];

                  return (
                    <div
                      key={response.id}
                      className="p-5 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600"
                    >
                      {/* Question */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 leading-snug">
                          {question.text}
                        </p>
                      </div>

                      {/* Answer */}
                      <div className="ml-10 mb-3">
                        {selectedOptionLabels.length > 0 ? (
                          <div className="space-y-1">
                            {selectedOptionLabels.map(
                              (label: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <span className="text-sm text-neutral-800 dark:text-neutral-200">
                                    {label}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        ) : response.text_response ? (
                          <p className="text-sm text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-600">
                            {response.text_response}
                          </p>
                        ) : response.number_response !== null &&
                          response.number_response !== undefined ? (
                          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            {response.number_response}
                          </p>
                        ) : response.file_response ? (
                          <a
                            href={response.file_response}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 dark:text-primary-400 underline"
                          >
                            View uploaded file
                          </a>
                        ) : (
                          <p className="text-sm text-neutral-400 italic">
                            No answer provided
                          </p>
                        )}
                      </div>

                      {/* Score */}
                      <div className="ml-10 mb-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            response.score > 0
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          Score: {response.score} pts
                        </span>
                      </div>

                      {/* Recommendation */}
                      {questionRecommendations.length > 0 && (
                        <div className="ml-10 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                Recommendation
                              </p>
                              {questionRecommendations.map(
                                (rec: any, idx: number) => (
                                  <p
                                    key={idx}
                                    className="text-xs text-blue-800 dark:text-blue-300"
                                  >
                                    {rec.recommendation_text}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Category Scores Tab */}
          {activeTab === "scores" && (
            <div className="space-y-4">
              {assessment.category_scores.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No scores calculated yet
                  </p>
                </div>
              ) : (
                assessment.category_scores.map((categoryScore) => (
                  <div
                    key={categoryScore.id}
                    className="p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {categoryScore.category_name}
                      </h4>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {parseFloat(categoryScore.percentage as any).toFixed(1)}
                        %
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {parseFloat(categoryScore.score as any).toFixed(1)} /{" "}
                          {parseFloat(categoryScore.max_score as any).toFixed(
                            1,
                          )}{" "}
                          points
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            parseFloat(categoryScore.percentage as any) >= 75
                              ? "bg-green-500"
                              : parseFloat(categoryScore.percentage as any) >=
                                  50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: `${parseFloat(
                              categoryScore.percentage as any,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {parseFloat(categoryScore.percentage as any) >= 75 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Strong performance in this category
                          </span>
                        </>
                      ) : parseFloat(categoryScore.percentage as any) >= 50 ? (
                        <>
                          <Target className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600 dark:text-yellow-400">
                            Room for improvement in this category
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600 dark:text-red-400">
                            Significant improvement needed
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && (
            <div className="space-y-6">
              {assessment.status === "completed" ||
              assessment.status === "reviewed" ? (
                <>
                  {/* Overall Score Card */}
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          Readiness Score
                        </h2>
                        <p className="text-primary-100">
                          Your business investment readiness assessment
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-6xl font-bold mb-2">
                          {Math.round(assessment.percentage_score)}%
                        </div>
                        <div className="text-sm text-primary-100">
                          {assessment.total_score} /{" "}
                          {assessment.max_possible_score} points
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations Section */}
                  <div className="glass-effect dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                          Recommended Actions
                        </h3>
                      </div>
                      <button
                        onClick={handleDownloadReport}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Download Report
                      </button>
                    </div>

                    <div className="space-y-4">
                      {assessment.recommendations &&
                      assessment.recommendations.length > 0 ? (
                        assessment.recommendations
                          .sort((a, b) => {
                            const priorityOrder = {
                              high: 0,
                              medium: 1,
                              low: 2,
                            };
                            return (
                              (priorityOrder[
                                a.priority as keyof typeof priorityOrder
                              ] || 3) -
                              (priorityOrder[
                                b.priority as keyof typeof priorityOrder
                              ] || 3)
                            );
                          })
                          .map((rec, index) => (
                            <div
                              key={rec.id}
                              className={`p-4 rounded-xl border-2 ${
                                rec.priority === "high"
                                  ? "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800"
                                  : rec.priority === "medium"
                                    ? "border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800"
                                    : "border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                      rec.priority === "high"
                                        ? "bg-red-500 text-white"
                                        : rec.priority === "medium"
                                          ? "bg-orange-500 text-white"
                                          : "bg-blue-500 text-white"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                                      {rec.title}
                                    </h4>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        rec.priority === "high"
                                          ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                                          : rec.priority === "medium"
                                            ? "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                                            : "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                                      }`}
                                    >
                                      {rec.priority.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                                    {rec.description}
                                  </p>
                                  <div className="glass-effect dark:bg-neutral-900 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                                      Suggested Actions:
                                    </p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                      {rec.suggested_actions}
                                    </p>
                                  </div>

                                  {/* Recommended Services */}
                                  {rec.recommended_services &&
                                    rec.recommended_services.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                                          <Briefcase className="w-3.5 h-3.5" />
                                          Recommended Services
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {rec.recommended_services.map(
                                            (service) => (
                                              <div
                                                key={service.id}
                                                className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800/60 p-3 flex flex-col gap-1"
                                              >
                                                <div className="flex items-center gap-1.5">
                                                  <Briefcase className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                                                  <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                                                    {service.name}
                                                  </span>
                                                </div>
                                                {service.description && (
                                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                                    {service.description}
                                                  </p>
                                                )}
                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                  {service.price && (
                                                    <span className="flex items-center gap-1">
                                                      <DollarSign className="w-3 h-3" />
                                                      {service.price}
                                                    </span>
                                                  )}
                                                  {service.contact && (
                                                    <span className="flex items-center gap-1">
                                                      <Phone className="w-3 h-3" />
                                                      {service.contact}
                                                    </span>
                                                  )}
                                                  {service.link && (
                                                    <a
                                                      href={service.link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                                                    >
                                                      <LinkIcon className="w-3 h-3" />
                                                      Learn more
                                                    </a>
                                                  )}
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-center text-neutral-500 py-8">
                          No recommendations available yet
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Results will be available after assessment is completed
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Reviewer Modal */}
      {showAssignReviewer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Assign Reviewer
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Select Reviewer
                </label>
                <select
                  value={selectedReviewer || ""}
                  onChange={(e) =>
                    setSelectedReviewer(parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="">Select a reviewer...</option>
                  {adminUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAssignReviewer(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignReviewer}
                  disabled={processing || !selectedReviewer}
                  className="btn-primary disabled:opacity-50"
                >
                  {processing ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentDetailView;
