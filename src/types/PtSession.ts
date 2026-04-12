import { SessionStatus, SessionSource } from './enums';

export interface PtSession {
  id: number;
  session_code: string;
  member_id: number;
  trainer_id: number;
  slot_id: number;
  session_type: string;
  session_source: SessionSource;
  amount_charged: number;
  session_date: string;
  status: SessionStatus;
  member_name: string;
  trainer_name: string;
}

export interface BookSessionRequest {
  memberId: number;
  slotId: number;
}

export interface PtSessionListParams {
  memberId?: number;
  trainerId?: number;
  status?: SessionStatus;
  date?: string;
  page?: number;
  limit?: number;
}
