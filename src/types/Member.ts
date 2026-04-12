import { Gender, MembershipStatus, PaymentMethod } from './enums';

export interface Member {
  id: number;
  member_code: string;
  name: string;
  phone: string;
  email: string | null;
  age: number | null;
  gender: Gender | null;
  health_conditions: string | null;
  emergency_contact_phone: string | null;
  membership_plan_id: number;
  start_date: string;
  end_date: string;
  status: MembershipStatus;
  remaining_pt_sessions: number;
  plan_name: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMemberRequest {
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: Gender;
  healthConditions?: string;
  emergencyContactPhone?: string;
  membershipPlanId: number;
  startDate: string;
  paymentMethod?: PaymentMethod;
}

export interface UpdateMemberRequest {
  name?: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: Gender;
  healthConditions?: string;
  emergencyContactPhone?: string;
  status?: MembershipStatus;
}

export interface RenewMemberRequest {
  planId: number;
  startDate: string;
  paymentMethod?: PaymentMethod;
}

export interface ChangePlanRequest {
  planId: number;
  startDate?: string;
  paymentMethod?: PaymentMethod;
}

export interface MemberListParams {
  search?: string;
  status?: MembershipStatus;
  planId?: number;
  page?: number;
  limit?: number;
}
