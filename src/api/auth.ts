import apiClient from './axios';
import type { ApiResponse } from '../types/ApiResponse';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
} from '../types/User';

export const authApi = {
  login(data: LoginRequest) {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  },

  register(data: RegisterRequest) {
    return apiClient.post<ApiResponse<{ id: number; name: string; email: string; role: string }>>(
      '/auth/register',
      data,
    );
  },

  logout() {
    return apiClient.post<ApiResponse<{ message: string }>>('/auth/logout');
  },

  getProfile() {
    return apiClient.get<ApiResponse<UserProfile>>('/auth/profile');
  },
};
