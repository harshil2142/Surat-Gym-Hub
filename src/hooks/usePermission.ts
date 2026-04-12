import { useAuthStore } from '../stores/useAuthStore';
import { UserRole } from '../types/enums';

/**
 * Custom hook to check if the current user has the required role.
 *
 * @param requiredRole - The role required to access a feature
 * @returns `true` if the user has the required role, `false` otherwise
 *
 * @example
 * ```tsx
 * const canManageMembers = usePermission(UserRole.ADMIN);
 * const canAccessReception = usePermission(UserRole.RECEPTIONIST);
 * ```
 */
export function usePermission(requiredRole: UserRole): boolean {
  const role = useAuthStore((state) => state.role);
  if (!role) return false;
  return role === requiredRole;
}

/**
 * Checks if the current user has any of the specified roles.
 *
 * @param roles - Array of allowed roles
 * @returns `true` if the user has any of the specified roles
 *
 * @example
 * ```tsx
 * const canRegister = useHasAnyRole([UserRole.ADMIN, UserRole.RECEPTIONIST]);
 * ```
 */
export function useHasAnyRole(roles: UserRole[]): boolean {
  const role = useAuthStore((state) => state.role);
  if (!role) return false;
  return roles.includes(role);
}
