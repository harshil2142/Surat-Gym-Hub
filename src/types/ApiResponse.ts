export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  members: T[];
  pagination: PaginationMeta;
}

export interface PaginatedSessionsResponse<T> {
  sessions: T[];
  pagination: PaginationMeta;
}
