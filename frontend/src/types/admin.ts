export interface AdminDashboardStats {
  totalEnterprises: number;
  activeAssessments: number;
  completedAssessments: number;
  pendingReviews: number;
  vettedEnterprises: number;
  pendingEnterprises: number;
  totalUsers: number;
  totalPayments: number;
}

export interface RecentAssessment {
  id: number;
  enterprise_name: string;
  questionnaire_title: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'reviewed';
  score: number | null;
  submitted_at: string;
  created_at: string;
  reviewed_by?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface RecentEnterprise {
  id: number;
  business_name: string;
  sector: string;
  district: string;
  is_vetted: boolean;
  created_at: string;
  employee_count: number;
  annual_revenue: string;
  owner: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface SystemMetrics {
  userGrowth: {
    label: string;
    value: number;
  }[];
  assessmentCompletion: {
    label: string;
    value: number;
  }[];
  sectorDistribution: {
    label: string;
    value: number;
  }[];
  monthlyRevenue: {
    label: string;
    value: number;
  }[];
}
