import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Protects routes from unauthenticated access.
 * Redirects to /login if no token is present.
 */
export default function PrivateRoute() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
