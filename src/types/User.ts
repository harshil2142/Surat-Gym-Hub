import { UserRole, UserStatus } from './enums';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  trainerId?: number;
}

export interface UserProfile extends User {
  status: UserStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
