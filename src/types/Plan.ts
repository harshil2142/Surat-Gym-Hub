import { AccessHours, PlanStatus } from './enums';

export interface Plan {
  id: number;
  name: string;
  duration_months: number;
  price: number;
  pt_sessions: number;
  access_hours: AccessHours;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  name: string;
  durationMonths: number;
  price: number;
  ptSessions?: number;
  accessHours?: AccessHours;
}

export interface UpdatePlanRequest {
  name?: string;
  durationMonths?: number;
  price?: number;
  ptSessions?: number;
  accessHours?: AccessHours;
  status?: PlanStatus;
}
