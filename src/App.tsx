import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import MemberList from './pages/members/List';
import MemberForm from './pages/members/Form';
import MemberDetail from './pages/members/Detail';
import Plans from './pages/plans/Plans';
import Trainers from './pages/trainers/Trainers';
import MySlots from './pages/trainers/MySlots';
import PtSessions from './pages/pt-sessions/PtSessions';
import Attendance from './pages/attendance/Attendance';
import Reports from './pages/reports/Reports';
import { UserRole } from './types/enums';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 6,
          },
        }}
      >
        <AntApp>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected */}
              <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Members — all roles */}
                  <Route path="/members" element={<MemberList />} />
                  <Route path="/members/:id" element={<MemberDetail />} />

                  {/* Members — Admin + Receptionist */}
                  <Route element={<RoleRoute roles={[UserRole.ADMIN, UserRole.RECEPTIONIST]} />}>
                    <Route path="/members/new" element={<MemberForm />} />
                    <Route path="/members/:id/edit" element={<MemberForm />} />
                  </Route>

                  {/* Plans — Admin only */}
                  <Route element={<RoleRoute roles={[UserRole.ADMIN]} />}>
                    <Route path="/plans" element={<Plans />} />
                  </Route>

                  {/* Trainers — Admin only */}
                  <Route element={<RoleRoute roles={[UserRole.ADMIN]} />}>
                    <Route path="/trainers" element={<Trainers />} />
                  </Route>

                  {/* My Slots — Trainer only */}
                  <Route element={<RoleRoute roles={[UserRole.TRAINER]} />}>
                    <Route path="/my-slots" element={<MySlots />} />
                  </Route>

                  {/* PT Sessions — all roles */}
                  <Route path="/pt-sessions" element={<PtSessions />} />

                  {/* Attendance — Admin + Receptionist */}
                  <Route element={<RoleRoute roles={[UserRole.ADMIN, UserRole.RECEPTIONIST]} />}>
                    <Route path="/attendance" element={<Attendance />} />
                  </Route>

                  {/* Reports — Admin only */}
                  <Route element={<RoleRoute roles={[UserRole.ADMIN]} />}>
                    <Route path="/reports" element={<Reports />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
