import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { UserRole } from '../types/enums';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
      role: null,
    });
  });

  it('starts with null state', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });

  it('setAuth stores token, refreshToken, user, and role', () => {
    const user = {
      id: 1,
      name: 'Admin User',
      email: 'admin@suratgymhub.com',
      role: UserRole.ADMIN,
    };

    useAuthStore.getState().setAuth('access-token', 'refresh-token', user);

    const state = useAuthStore.getState();
    expect(state.token).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user).toEqual(user);
    expect(state.role).toBe(UserRole.ADMIN);
  });

  it('setTokens updates only tokens', () => {
    const user = {
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    };
    useAuthStore.getState().setAuth('old-token', 'old-refresh', user);
    useAuthStore.getState().setTokens('new-token', 'new-refresh');

    const state = useAuthStore.getState();
    expect(state.token).toBe('new-token');
    expect(state.refreshToken).toBe('new-refresh');
    expect(state.user).toEqual(user);
    expect(state.role).toBe(UserRole.ADMIN);
  });

  it('logout clears all state', () => {
    useAuthStore.getState().setAuth('token', 'refresh', {
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });
});
