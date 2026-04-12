import apiClient from './axios';
import type { ApiResponse, PaginatedResponse } from '../types/ApiResponse';
import type {
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
  RenewMemberRequest,
  ChangePlanRequest,
  MemberListParams,
} from '../types/Member';

export const membersApi = {
  getAll(params?: MemberListParams) {
    return apiClient.get<ApiResponse<PaginatedResponse<Member>>>('/members', { params });
  },

  getById(id: number) {
    return apiClient.get<ApiResponse<Member>>(`/members/${id}`);
  },

  create(data: CreateMemberRequest) {
    return apiClient.post<ApiResponse<Member>>('/members', data);
  },

  update(id: number, data: UpdateMemberRequest) {
    return apiClient.patch<ApiResponse<Member>>(`/members/${id}`, data);
  },

  renew(id: number, data: RenewMemberRequest) {
    return apiClient.patch<ApiResponse<Member>>(`/members/${id}/renew`, data);
  },

  freeze(id: number) {
    return apiClient.patch<ApiResponse<Member>>(`/members/${id}/freeze`);
  },

  unfreeze(id: number) {
    return apiClient.patch<ApiResponse<Member>>(`/members/${id}/unfreeze`);
  },

  cancel(id: number) {
    return apiClient.patch<ApiResponse<Member>>(`/members/${id}/cancel`);
  },

  changePlan(id: number, data: ChangePlanRequest) {
    return apiClient.patch<ApiResponse<Member>>(`/members/${id}/change-plan`, data);
  },

  delete(id: number) {
    return apiClient.delete<ApiResponse<{ message: string }>>(`/members/${id}`);
  },
};
