export interface DailySummary {
  date: string;
  totalCheckIns: number;
  sessions: { status: string; count: number }[];
  newMemberships: number;
  renewals: number;
  totalRevenue: number;
  breakdown: {
    ptRevenue: number;
    membershipRevenue: number;
  };
  peakHours: { hour: number; count: number }[];
}

export interface MembershipStatusReport {
  totalActive: number;
  expiringSoonCount: number;
  members: MembershipStatusRow[];
}

export interface MembershipStatusRow {
  id: number;
  member_code: string;
  name: string;
  plan_name: string;
  status: string;
  end_date: string;
  days_remaining: number;
  urgency: 'EXPIRED' | 'EXPIRING_SOON' | 'OK';
}

export interface TrainerUtilisation {
  trainer_id: number;
  trainer_name: string;
  specialization: string;
  total_slots: number;
  booked_slots: number;
  completed_sessions: number;
  no_shows: number;
  utilisation_rate: number;
  total_revenue: number;
  commission: number;
}

export interface RevenueReport {
  monthlyRevenue: {
    month: string;
    revenue: number;
    prev_revenue: number | null;
    growth_pct: number | null;
  }[];
  ptRevenue: number;
  mostPopularPlan: {
    plan_name: string;
    total_subscriptions: number;
    total_revenue: number;
  } | null;
}
