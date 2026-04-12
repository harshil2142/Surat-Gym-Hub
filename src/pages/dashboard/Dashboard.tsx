import { useQuery } from '@tanstack/react-query';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Result,
  Table,
  Tag,
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserAddOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { reportsApi } from '../../api/reports';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '../../types/enums';
import { formatCurrency } from '../../utils/formatCurrency';
import type { DailySummary } from '../../types/Report';

const { Title } = Typography;

export default function Dashboard() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['daily-summary'],
    queryFn: () => reportsApi.getDailySummary(),
    enabled: role === UserRole.ADMIN,
  });

  if (role !== UserRole.ADMIN) {
    return (
      <div>
        <Title level={3}>Welcome, {user?.name}!</Title>
        <Card>
          <Result
            icon={<TeamOutlined />}
            title={`Logged in as ${role}`}
            subTitle="Use the sidebar to navigate to your assigned modules."
          />
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load dashboard"
        extra={
          <a onClick={() => refetch()}>
            <ReloadOutlined /> Retry
          </a>
        }
      />
    );
  }

  const summary: DailySummary | undefined = data?.data?.data;

  const sessionColumns: ColumnsType<{ status: string; count: number }> = [
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag>{s}</Tag> },
    { title: 'Count', dataIndex: 'count', key: 'count' },
  ];

  const peakColumns: ColumnsType<{ hour: number; count: number }> = [
    {
      title: 'Hour',
      dataIndex: 'hour',
      key: 'hour',
      render: (h: number) => `${h}:00 - ${h + 1}:00`,
    },
    { title: 'Check-ins', dataIndex: 'count', key: 'count' },
  ];

  return (
    <div>
      <Title level={3}>Dashboard — {summary?.date ?? 'Today'}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Check-ins Today"
              value={summary?.totalCheckIns ?? 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New Memberships"
              value={summary?.newMemberships ?? 0}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Renewals"
              value={summary?.renewals ?? 0}
              prefix={<ReloadOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={summary?.totalRevenue ?? 0}
              prefix={<DollarOutlined />}
              formatter={(val) => formatCurrency(Number(val))}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Revenue Breakdown">
            <Statistic
              title="Membership Revenue"
              value={summary?.breakdown?.membershipRevenue ?? 0}
              formatter={(val) => formatCurrency(Number(val))}
            />
            <Statistic
              title="PT Revenue"
              value={summary?.breakdown?.ptRevenue ?? 0}
              formatter={(val) => formatCurrency(Number(val))}
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Sessions Today">
            <Table
              columns={sessionColumns}
              dataSource={summary?.sessions ?? []}
              pagination={false}
              rowKey="status"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Peak Hours">
            <Table
              columns={peakColumns}
              dataSource={summary?.peakHours ?? []}
              pagination={false}
              rowKey="hour"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
