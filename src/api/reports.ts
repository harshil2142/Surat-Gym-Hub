import apiClient from "./axios";
import type { ApiResponse } from "../types/ApiResponse";
import type {
  DailySummary,
  MembershipExpiryRow,
  TrainerUtilisationRow,
  RevenueAnalysisRow,
} from "../types/Report";

export const reportsApi = {
  getDailySummary(date?: string) {
    const finalDate = date ?? new Date().toISOString().split("T")[0];
    return apiClient.get<ApiResponse<DailySummary[]>>("/reports/daily-summary", {
      params: { date: finalDate },
    });
  },

  getMembershipExpiry() {
    return apiClient.get<ApiResponse<MembershipExpiryRow[]>>(
      "/reports/membership-expiry",
    );
  },

  getTrainerUtilisation() {
    return apiClient.get<ApiResponse<TrainerUtilisationRow[]>>(
      "/reports/trainer-utilisation",
    );
  },

  getRevenueAnalysis() {
    return apiClient.get<ApiResponse<RevenueAnalysisRow[]>>(
      "/reports/revenue-analysis",
    );
  },
};
