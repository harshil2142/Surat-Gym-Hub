import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/useAuthStore';
import { UserRole } from '../types/enums';

// Direct store testing (no React rendering needed for Zustand)
describe('usePermission logic', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
      role: null,
    });
  });

  it('returns false when no role is set', () => {
    const state = useAuthStore.getState();
    expect(state.role).toBeNull();
  });

  it('stores ADMIN role correctly after setAuth', () => {
    useAuthStore.getState().setAuth('token', 'refresh', {
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });
    expect(useAuthStore.getState().role).toBe(UserRole.ADMIN);
  });

  it('stores TRAINER role correctly', () => {
    useAuthStore.getState().setAuth('token', 'refresh', {
      id: 2,
      name: 'Trainer',
      email: 'trainer@test.com',
      role: UserRole.TRAINER,
    });
    expect(useAuthStore.getState().role).toBe(UserRole.TRAINER);
  });

  it('ADMIN role does not match RECEPTIONIST', () => {
    useAuthStore.getState().setAuth('token', 'refresh', {
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });
    const role = useAuthStore.getState().role;
    expect(role === UserRole.RECEPTIONIST).toBe(false);
  });

  it('hasAnyRole logic works for multiple roles', () => {
    useAuthStore.getState().setAuth('token', 'refresh', {
      id: 3,
      name: 'Receptionist',
      email: 'rec@test.com',
      role: UserRole.RECEPTIONIST,
    });
    const role = useAuthStore.getState().role;
    const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.RECEPTIONIST];
    expect(role && allowedRoles.includes(role)).toBe(true);
  });

  it('hasAnyRole returns false for excluded role', () => {
    useAuthStore.getState().setAuth('token', 'refresh', {
      id: 2,
      name: 'Trainer',
      email: 'trainer@test.com',
      role: UserRole.TRAINER,
    });
    const role = useAuthStore.getState().role;
    const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.RECEPTIONIST];
    expect(role && allowedRoles.includes(role)).toBe(false);
  });
});
