import { TrainerSpecialisation, SlotStatus } from './enums';

export interface Trainer {
  id: number;
  user_id: number;
  specialization: TrainerSpecialisation;
  session_rate: number;
  commission_rate?: number;
  shift_start: string | null;
  shift_end: string | null;
  status: string;
  name: string;
  email: string;
}

export interface CreateTrainerRequest {
  name: string;
  email: string;
  password: string;
  specialization: TrainerSpecialisation;
  sessionRate: number;
  commissionRate: number;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface UpdateTrainerRequest {
  specialization?: TrainerSpecialisation;
  sessionRate?: number;
  commissionRate?: number;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface TrainerSlot {
  id: number;
  trainer_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
}

export interface CreateSlotRequest {
  trainerId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
}

export interface CreateBulkSlotRequest {
  slotDate: string;
  slots: { startTime: string; endTime: string }[];
}
