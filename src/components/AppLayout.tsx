import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Tag,
  Space,
  Typography,
  theme,
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CrownOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ScheduleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/enums';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'red',
  [UserRole.RECEPTIONIST]: 'blue',
  [UserRole.TRAINER]: 'green',
};

type MenuItem = Required<MenuProps>['items'][number];

function getMenuItems(role: UserRole | null): MenuItem[] {
  if (!role) return [];

  const items: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/members',
      icon: <TeamOutlined />,
      label: 'Members',
    },
  ];

  if (role === UserRole.ADMIN) {
    items.push({
      key: '/plans',
      icon: <CrownOutlined />,
      label: 'Plans',
    });
  }

  if (role === UserRole.ADMIN) {
    items.push({
      key: '/trainers',
      icon: <UserOutlined />,
      label: 'Trainers',
    });
  }

  if (role === UserRole.TRAINER) {
    items.push({
      key: '/my-slots',
      icon: <ScheduleOutlined />,
      label: 'My Slots',
    });
  }

  items.push({
    key: '/pt-sessions',
    icon: <CalendarOutlined />,
    label: 'PT Sessions',
  });

  if (role !== UserRole.TRAINER) {
    items.push({
      key: '/attendance',
      icon: <CheckCircleOutlined />,
      label: 'Attendance',
    });
  }

  if (role === UserRole.ADMIN) {
    items.push({
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    });
  }

  return items;
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, role, handleLogout, logoutMutation } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: themeToken } = theme.useToken();

  const menuItems = getMenuItems(role);

  const selectedKey = menuItems
    .map((item) => (item as { key: string }).key)
    .filter((key) => location.pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0] ?? '/dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          <Text
            strong
            style={{
              color: themeToken.colorWhite,
              fontSize: collapsed ? 14 : 18,
            }}
          >
            {collapsed ? 'SGH' : 'SuratGymHub'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: themeToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Space>
            <Text strong>{user?.name}</Text>
            {role && <Tag color={ROLE_COLORS[role]}>{role}</Tag>}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              loading={logoutMutation.isPending}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: themeToken.colorBgContainer,
            borderRadius: themeToken.borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
