import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Tabs,
  Card,
  Table,
  Tag,
  DatePicker,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Result,
  Button,
  Space,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { reportsApi } from '../../api/reports';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import type {
  DailySummary,
  MembershipExpiryRow,
  TrainerUtilisationRow,
  RevenueAnalysisRow,
} from '../../types/Report';

const { Title, Text } = Typography;

/* ═══════════════════════════════════════════
   Tab 1 — Daily Summary
   ═══════════════════════════════════════════ */
function DailySummaryTab() {
  const [date, setDate] = useState(dayjs());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-daily-summary', date.format('YYYY-MM-DD')],
    queryFn: () => reportsApi.getDailySummary(date.format('YYYY-MM-DD')),
  });

  // Backend returns an array with one row
  const raw = data?.data?.data;
  const summary: DailySummary | null = Array.isArray(raw) ? raw[0] ?? null : null;

  if (isError)
    return (
      <Result
        status="error"
        title="Failed"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <DatePicker
          value={date}
          onChange={(d) => d && setDate(d)}
          allowClear={false}
        />
      </Space>

      <Spin spinning={isLoading}>
        {summary ? (
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} lg={6}>
              <Card><Statistic title="Total Check-ins" value={summary.total_checkins} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Card><Statistic title="PT Sessions" value={summary.total_pt_sessions} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Card><Statistic title="New Memberships" value={summary.new_memberships} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Card><Statistic title="Renewals" value={summary.renewals} /></Card>
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Card>
                <Statistic
                  title="Membership Revenue"
                  value={summary.membership_revenue}
                  formatter={(val) => formatCurrency(Number(val))}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Card>
                <Statistic
                  title="PT Revenue"
                  value={summary.pt_revenue}
                  formatter={(val) => formatCurrency(Number(val))}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={summary.total_revenue}
                  valueStyle={{ color: '#3f8600' }}
                  formatter={(val) => formatCurrency(Number(val))}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Card>
                <Statistic
                  title="Peak Hour"
                  value={summary.peak_hour !== null ? `${summary.peak_hour}:00` : 'N/A'}
                />
              </Card>
            </Col>
          </Row>
        ) : (
          <Result status="info" title="No data for selected date" />
        )}
      </Spin>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Tab 2 — Membership Expiry
   ═══════════════════════════════════════════ */
function MembershipExpiryTab() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-membership-expiry'],
    queryFn: () => reportsApi.getMembershipExpiry(),
  });

  const rows: MembershipExpiryRow[] = data?.data?.data ?? [];

  const totalActive = rows.filter((r) => r.expiry_status === 'ACTIVE').length;
  const expiringSoon = rows.filter((r) => r.expiry_status === 'EXPIRING_SOON').length;
  const expired = rows.filter((r) => r.expiry_status === 'EXPIRED').length;

  const columns: ColumnsType<MembershipExpiryRow> = [
    { title: 'Code', dataIndex: 'member_code', key: 'member_code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Plan', dataIndex: 'plan_name', key: 'plan_name' },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Days Remaining',
      dataIndex: 'days_remaining',
      key: 'days_remaining',
      render: (v: number) => (
        <Text type={v < 0 ? 'danger' : v <= 7 ? 'warning' : undefined}>{v}</Text>
      ),
    },
    { title: 'PT Left', dataIndex: 'remaining_pt_sessions', key: 'remaining_pt_sessions' },
    {
      title: 'Status',
      dataIndex: 'expiry_status',
      key: 'expiry_status',
      render: (s: string) => {
        const color = s === 'EXPIRED' ? 'red' : s === 'EXPIRING_SOON' ? 'orange' : 'green';
        return <Tag color={color}>{s}</Tag>;
      },
    },
  ];

  if (isLoading) return <Spin />;
  if (isError)
    return (
      <Result
        status="error"
        title="Failed"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card><Statistic title="Active" value={totalActive} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Expiring Soon" value={expiringSoon} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Expired" value={expired} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="member_code"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   Tab 3 — Trainer Utilisation
   ═══════════════════════════════════════════ */
function TrainerUtilisationTab() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-trainer-utilisation'],
    queryFn: () => reportsApi.getTrainerUtilisation(),
  });

  const trainers: TrainerUtilisationRow[] = data?.data?.data ?? [];

  const columns: ColumnsType<TrainerUtilisationRow> = [
    { title: 'Trainer', dataIndex: 'trainer_name', key: 'trainer_name' },
    { title: 'Specialization', dataIndex: 'specialization', key: 'specialization' },
    { title: 'Sessions (Month)', dataIndex: 'total_sessions_this_month', key: 'total_sessions_this_month' },
    { title: 'Available', dataIndex: 'available_slots', key: 'available_slots' },
    { title: 'Booked', dataIndex: 'booked_slots', key: 'booked_slots' },
    {
      title: 'Utilisation',
      dataIndex: 'utilisation_rate',
      key: 'utilisation_rate',
      render: (v: number | null) => (v !== null ? `${Number(v).toFixed(1)}%` : '—'),
    },
    { title: 'No Shows', dataIndex: 'no_show_count', key: 'no_show_count' },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Commission',
      dataIndex: 'commission_earned',
      key: 'commission_earned',
      render: (v: number) => formatCurrency(v),
    },
  ];

  if (isError)
    return (
      <Result
        status="error"
        title="Failed"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );

  return (
    <Spin spinning={isLoading}>
      <Table columns={columns} dataSource={trainers} rowKey="id" size="small" />
    </Spin>
  );
}

/* ═══════════════════════════════════════════
   Tab 4 — Revenue Analysis
   ═══════════════════════════════════════════ */
function RevenueAnalysisTab() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-revenue-analysis'],
    queryFn: () => reportsApi.getRevenueAnalysis(),
  });

  const rows: RevenueAnalysisRow[] = data?.data?.data ?? [];

  // Grab totals from first row (same across all rows)
  const totalMembershipRevenue = rows.length > 0 ? rows[0].total_membership_revenue : 0;
  const totalPtRevenue = rows.length > 0 ? rows[0].total_pt_revenue : 0;
  const mostPopularSpec = rows.length > 0 ? rows[0].most_popular_specialization : '—';

  const columns: ColumnsType<RevenueAnalysisRow> = [
    { title: 'Plan', dataIndex: 'plan_name', key: 'plan_name' },
    { title: 'Sales', dataIndex: 'total_sales', key: 'total_sales' },
    {
      title: 'Plan Revenue',
      dataIndex: 'plan_revenue',
      key: 'plan_revenue',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Most Popular',
      dataIndex: 'is_most_popular_plan',
      key: 'is_most_popular_plan',
      render: (v: string) => (
        <Tag color={v === 'YES' ? 'gold' : 'default'}>{v === 'YES' ? '⭐ Yes' : 'No'}</Tag>
      ),
    },
  ];

  if (isError)
    return (
      <Result
        status="error"
        title="Failed"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );

  return (
    <Spin spinning={isLoading}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Membership Revenue"
              value={totalMembershipRevenue}
              valueStyle={{ color: '#3f8600' }}
              formatter={(val) => formatCurrency(Number(val))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total PT Revenue"
              value={totalPtRevenue}
              formatter={(val) => formatCurrency(Number(val))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Top Specialization" value={mostPopularSpec} />
          </Card>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </Spin>
  );
}

/* ═══════════════════════════════════════════
   Main Reports Page — All 4 Tabs
   ═══════════════════════════════════════════ */
export default function Reports() {
  return (
    <div>
      <Title level={4}>Reports</Title>
      <Tabs
        items={[
          {
            key: 'daily',
            label: 'Daily Summary',
            children: <DailySummaryTab />,
          },
          {
            key: 'membership',
            label: 'Membership Expiry',
            children: <MembershipExpiryTab />,
          },
          {
            key: 'trainer',
            label: 'Trainer Utilisation',
            children: <TrainerUtilisationTab />,
          },
          {
            key: 'revenue',
            label: 'Revenue Analysis',
            children: <RevenueAnalysisTab />,
          },
        ]}
      />
    </div>
  );
}
