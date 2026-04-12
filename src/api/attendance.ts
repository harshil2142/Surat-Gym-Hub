import apiClient from './axios';
import type { ApiResponse } from '../types/ApiResponse';
import type { AttendanceRecord, CheckInRequest } from '../types/Attendance';

export const attendanceApi = {
  checkIn(data: CheckInRequest) {
    return apiClient.post<ApiResponse<AttendanceRecord>>('/attendance/check-in', data);
  },

  checkOut(memberId: number) {
    return apiClient.patch<ApiResponse<{ message: string; checkOutTime: string }>>(
      `/attendance/check-out/${memberId}`,
    );
  },

  getByDate(date: string) {
    return apiClient.get<ApiResponse<AttendanceRecord[]>>(`/attendance/date/${date}`);
  },

  getByMember(memberId: number, month?: string) {
    return apiClient.get<ApiResponse<AttendanceRecord[]>>(`/attendance/member/${memberId}`, {
      params: month ? { month } : undefined,
    });
  },
};
