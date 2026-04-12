import apiClient from './axios';
import type { ApiResponse } from '../types/ApiResponse';
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from '../types/Plan';

export const plansApi = {
  getAll() {
    return apiClient.get<ApiResponse<Plan[]>>('/membership-plans');
  },

  getById(id: number) {
    return apiClient.get<ApiResponse<Plan>>(`/membership-plans/${id}`);
  },

  create(data: CreatePlanRequest) {
    return apiClient.post<ApiResponse<Plan>>('/membership-plans', data);
  },

  update(id: number, data: UpdatePlanRequest) {
    return apiClient.patch<ApiResponse<Plan>>(`/membership-plans/${id}`, data);
  },

  delete(id: number) {
    return apiClient.delete<ApiResponse<{ message: string }>>(`/membership-plans/${id}`);
  },

  restore(id: number) {
    return apiClient.patch<ApiResponse<Plan>>(`/membership-plans/${id}/restore`);
  },
};
