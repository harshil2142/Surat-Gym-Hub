import apiClient from './axios';
import type { ApiResponse, PaginatedSessionsResponse } from '../types/ApiResponse';
import type { PtSession, BookSessionRequest, PtSessionListParams } from '../types/PtSession';

export const ptSessionsApi = {
  getAll(params?: PtSessionListParams) {
    return apiClient.get<ApiResponse<PaginatedSessionsResponse<PtSession>>>('/pt-sessions', {
      params,
    });
  },

  getById(id: number) {
    return apiClient.get<ApiResponse<PtSession>>(`/pt-sessions/${id}`);
  },

  getByMember(memberId: number) {
    return apiClient.get<ApiResponse<PtSession[]>>(`/pt-sessions/member/${memberId}`);
  },

  book(data: BookSessionRequest) {
    return apiClient.post<ApiResponse<PtSession>>('/pt-sessions/book', data);
  },

  complete(id: number) {
    return apiClient.patch<ApiResponse<PtSession>>(`/pt-sessions/${id}/complete`);
  },

  cancel(id: number) {
    return apiClient.patch<ApiResponse<{ message: string }>>(`/pt-sessions/${id}/cancel`);
  },

  noShow(id: number) {
    return apiClient.patch<ApiResponse<PtSession>>(`/pt-sessions/${id}/no-show`);
  },

  reschedule(id: number, slotId: number) {
    return apiClient.patch<ApiResponse<PtSession>>(`/pt-sessions/${id}/reschedule/${slotId}`);
  },
};
