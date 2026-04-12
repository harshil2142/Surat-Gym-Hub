import apiClient from './axios';
import type { ApiResponse } from '../types/ApiResponse';
import type {
  DailySummary,
  MembershipStatusReport,
  TrainerUtilisation,
  RevenueReport,
} from '../types/Report';

export const reportsApi = {
  getDailySummary(date?: string) {
    return apiClient.get<ApiResponse<DailySummary>>('/reports/daily-summary', {
      params: date ? { date } : undefined,
    });
  },

  getMembershipStatus() {
    return apiClient.get<ApiResponse<MembershipStatusReport>>('/reports/membership-status');
  },

  getTrainerUtilisation(startDate: string, endDate: string) {
    return apiClient.get<ApiResponse<TrainerUtilisation[]>>('/reports/trainer-utilisation', {
      params: { startDate, endDate },
    });
  },

  getRevenue(startDate: string, endDate: string) {
    return apiClient.get<ApiResponse<RevenueReport>>('/reports/revenue', {
      params: { startDate, endDate },
    });
  },
};
