/* ──────────────────────────────────────
   Report 1 — Daily Summary
   ────────────────────────────────────── */
export interface DailySummary {
  total_checkins: number;
  total_pt_sessions: number;
  new_memberships: number;
  renewals: number;
  membership_revenue: number;
  pt_revenue: number;
  total_revenue: number;
  peak_hour: number | null;
}

/* ──────────────────────────────────────
   Report 2 — Membership Expiry
   ────────────────────────────────────── */
export interface MembershipExpiryRow {
  member_code: string;
  name: string;
  phone: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  remaining_pt_sessions: number;
  expiry_status: 'EXPIRED' | 'EXPIRING_SOON' | 'ACTIVE';
}

/* ──────────────────────────────────────
   Report 3 — Trainer Utilisation
   ────────────────────────────────────── */
export interface TrainerUtilisationRow {
  id: number;
  trainer_name: string;
  specialization: string;
  total_sessions_this_month: number;
  available_slots: number;
  booked_slots: number;
  utilisation_rate: number | null;
  no_show_count: number;
  revenue: number;
  commission_earned: number;
}

/* ──────────────────────────────────────
   Report 4 — Revenue Analysis
   ────────────────────────────────────── */
export interface RevenueAnalysisRow {
  id: number;
  plan_name: string;
  total_sales: number;
  plan_revenue: number;
  total_membership_revenue: number;
  total_pt_revenue: number;
  is_most_popular_plan: 'YES' | 'NO';
  most_popular_specialization: string;
}
