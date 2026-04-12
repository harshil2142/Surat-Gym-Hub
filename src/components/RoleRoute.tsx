import { Outlet } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import type { UserRole } from '../types/enums';

interface RoleRouteProps {
  roles: UserRole[];
}

/**
 * Restricts route access to users with specific roles.
 * Shows a 403 page if the user's role is not in the allowed list.
 */
export default function RoleRoute({ roles }: RoleRouteProps) {
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();

  if (!role || !roles.includes(role)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />
    );
  }

  return <Outlet />;
}
