import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { AxiosError } from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { authApi } from '../api/auth';
import type { LoginRequest } from '../types/User';
import type { ApiErrorResponse } from '../types/ApiResponse';

/**
 * Custom hook for authentication operations.
 * Provides login and logout functionality with navigation.
 *
 * @returns Object containing:
 * - `loginMutation` — TanStack Query mutation for login
 * - `logoutMutation` — TanStack Query mutation for logout
 * - `handleLogin` — Function to trigger login with credentials
 * - `handleLogout` — Function to trigger logout
 * - `isAuthenticated` — Whether the user is currently logged in
 * - `user` — The currently logged-in user
 * - `role` — The user's role
 */
export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, logout: clearStore, token, user, role } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user: loggedInUser } = response.data.data;
      setAuth(accessToken, refreshToken, loggedInUser);
      message.success(`Welcome back, ${loggedInUser.name}!`);
      navigate('/dashboard');
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message ?? 'Login failed. Please try again.';
      message.error(msg);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearStore();
      navigate('/login');
    },
  });

  const handleLogin = useCallback(
    (values: LoginRequest) => {
      loginMutation.mutate(values);
    },
    [loginMutation],
  );

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    loginMutation,
    logoutMutation,
    handleLogin,
    handleLogout,
    isAuthenticated: !!token,
    user,
    role,
  };
}
