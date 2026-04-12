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
import type { MembershipStatusRow, TrainerUtilisation } from '../../types/Report';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function MembershipStatusTab() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-membership-status'],
    queryFn: () => reportsApi.getMembershipStatus(),
  });

  const report = data?.data?.data;

  const columns: ColumnsType<MembershipStatusRow> = [
    { title: 'Code', dataIndex: 'member_code', key: 'member_code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Plan', dataIndex: 'plan_name', key: 'plan_name' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'ACTIVE' ? 'green' : s === 'EXPIRED' ? 'red' : 'orange'}>{s}</Tag>
      ),
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
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (u: string) => {
        const color = u === 'EXPIRED' ? 'red' : u === 'EXPIRING_SOON' ? 'orange' : 'green';
        return <Tag color={color}>{u}</Tag>;
      },
    },
  ];

  if (isLoading) return <Spin />;
  if (isError) return <Result status="error" title="Failed" extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>} />;

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card><Statistic title="Total Active" value={report?.totalActive ?? 0} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Expiring Soon" value={report?.expiringSoonCount ?? 0} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
      </Row>
      <Table columns={columns} dataSource={report?.members ?? []} rowKey="id" size="small" />
    </div>
  );
}

function TrainerUtilisationTab() {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs(),
  ]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-trainer-utilisation', range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD')],
    queryFn: () =>
      reportsApi.getTrainerUtilisation(
        range[0].format('YYYY-MM-DD'),
        range[1].format('YYYY-MM-DD'),
      ),
  });

  const trainers: TrainerUtilisation[] = data?.data?.data ?? [];

  const columns: ColumnsType<TrainerUtilisation> = [
    { title: 'Trainer', dataIndex: 'trainer_name', key: 'trainer_name' },
    { title: 'Specialization', dataIndex: 'specialization', key: 'specialization' },
    { title: 'Total Slots', dataIndex: 'total_slots', key: 'total_slots' },
    { title: 'Booked', dataIndex: 'booked_slots', key: 'booked_slots' },
    { title: 'Completed', dataIndex: 'completed_sessions', key: 'completed_sessions' },
    { title: 'No Shows', dataIndex: 'no_shows', key: 'no_shows' },
    {
      title: 'Utilisation',
      dataIndex: 'utilisation_rate',
      key: 'utilisation_rate',
      render: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Commission',
      dataIndex: 'commission',
      key: 'commission',
      render: (v: number) => formatCurrency(v),
    },
  ];

  if (isError) return <Result status="error" title="Failed" extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>} />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          value={range}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setRange([dates[0], dates[1]]);
            }
          }}
        />
      </Space>
      <Spin spinning={isLoading}>
        <Table columns={columns} dataSource={trainers} rowKey="trainer_id" size="small" />
      </Spin>
    </div>
  );
}

function RevenueTab() {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month').startOf('month'),
    dayjs(),
  ]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-revenue', range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD')],
    queryFn: () =>
      reportsApi.getRevenue(
        range[0].format('YYYY-MM-DD'),
        range[1].format('YYYY-MM-DD'),
      ),
  });

  const report = data?.data?.data;

  const monthlyColumns: ColumnsType<{ month: string; revenue: number; prev_revenue: number | null; growth_pct: number | null }> = [
    { title: 'Month', dataIndex: 'month', key: 'month' },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Previous',
      dataIndex: 'prev_revenue',
      key: 'prev_revenue',
      render: (v: number | null) => (v !== null ? formatCurrency(v) : '—'),
    },
    {
      title: 'Growth',
      dataIndex: 'growth_pct',
      key: 'growth_pct',
      render: (v: number | null) =>
        v !== null ? (
          <Text type={v >= 0 ? 'success' : 'danger'}>{v.toFixed(1)}%</Text>
        ) : (
          '—'
        ),
    },
  ];

  if (isError) return <Result status="error" title="Failed" extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>} />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          value={range}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setRange([dates[0], dates[1]]);
            }
          }}
        />
      </Space>
      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="PT Revenue"
                value={report?.ptRevenue ?? 0}
                formatter={(val) => formatCurrency(Number(val))}
              />
            </Card>
          </Col>
          {report?.mostPopularPlan && (
            <Col span={16}>
              <Card title="Most Popular Plan">
                <Space direction="vertical">
                  <Text strong>{report.mostPopularPlan.plan_name}</Text>
                  <Text>Subscriptions: {report.mostPopularPlan.total_subscriptions}</Text>
                  <Text>Revenue: {formatCurrency(report.mostPopularPlan.total_revenue)}</Text>
                </Space>
              </Card>
            </Col>
          )}
        </Row>
        <Table
          columns={monthlyColumns}
          dataSource={report?.monthlyRevenue ?? []}
          rowKey="month"
          pagination={false}
          size="small"
        />
      </Spin>
    </div>
  );
}

export default function Reports() {
  return (
    <div>
      <Title level={4}>Reports</Title>
      <Tabs
        items={[
          {
            key: 'membership',
            label: 'Membership Status',
            children: <MembershipStatusTab />,
          },
          {
            key: 'trainer',
            label: 'Trainer Utilisation',
            children: <TrainerUtilisationTab />,
          },
          {
            key: 'revenue',
            label: 'Revenue',
            children: <RevenueTab />,
          },
        ]}
      />
    </div>
  );
}
