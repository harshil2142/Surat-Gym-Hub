import apiClient from './axios';
import type { ApiResponse } from '../types/ApiResponse';
import type {
  Trainer,
  CreateTrainerRequest,
  UpdateTrainerRequest,
  TrainerSlot,
  CreateSlotRequest,
  CreateBulkSlotRequest,
} from '../types/Trainer';

export const trainersApi = {
  getAll() {
    return apiClient.get<ApiResponse<Trainer[]>>('/trainers');
  },

  getById(id: number) {
    return apiClient.get<ApiResponse<Trainer>>(`/trainers/${id}`);
  },

  create(data: CreateTrainerRequest) {
    return apiClient.post<ApiResponse<Trainer>>('/trainers/create-with-user', data);
  },

  update(id: number, data: UpdateTrainerRequest) {
    return apiClient.patch<ApiResponse<Trainer>>(`/trainers/update/${id}`, data);
  },

  delete(id: number) {
    return apiClient.delete<ApiResponse<{ message: string }>>(`/trainers/${id}`);
  },

  getSlots(trainerId: number, date?: string) {
    return apiClient.get<ApiResponse<TrainerSlot[]>>(`/trainers/${trainerId}/slots`, {
      params: date ? { date } : undefined,
    });
  },

  createSlot(data: CreateSlotRequest) {
    return apiClient.post<ApiResponse<TrainerSlot>>('/trainers/slots', data);
  },

  createBulkSlots(trainerId: number, data: CreateBulkSlotRequest) {
    return apiClient.post<ApiResponse<TrainerSlot[]>>(`/trainers/${trainerId}/slots/bulk`, data);
  },
};
