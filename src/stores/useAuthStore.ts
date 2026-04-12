import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/User';
import type { UserRole } from '../types/enums';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  role: UserRole | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      role: null,

      setAuth: (token, refreshToken, user) =>
        set({
          token,
          refreshToken,
          user,
          role: user.role,
        }),

      setTokens: (token, refreshToken) =>
        set({ token, refreshToken }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          role: null,
        }),
    }),
    {
      name: 'surat-gym-hub-auth',
    },
  ),
);
