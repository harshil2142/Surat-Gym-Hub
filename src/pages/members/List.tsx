import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Badge,
  Row,
  Col,
  Spin,
  Result,
  Typography,
} from 'antd';
import { PlusOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { membersApi } from '../../api/members';
import { plansApi } from '../../api/plans';
import { useDebounce } from '../../hooks/useDebounce';
import { useHasAnyRole } from '../../hooks/usePermission';
import { useAuthStore } from '../../stores/useAuthStore';
import { MembershipStatus, UserRole } from '../../types/enums';
import { getDaysRemaining } from '../../utils/getDaysRemaining';
import { formatDate } from '../../utils/formatDate';
import type { Member } from '../../types/Member';
import type { Plan } from '../../types/Plan';
import { DeleteOutlined } from '@ant-design/icons';
import { Popconfirm, message } from 'antd';
const { Title } = Typography;
const { Search } = Input;

const STATUS_COLORS: Record<MembershipStatus, string> = {
  [MembershipStatus.ACTIVE]: 'green',
  [MembershipStatus.EXPIRED]: 'red',
  [MembershipStatus.FROZEN]: 'orange',
  [MembershipStatus.CANCELLED]: 'default',
};

export default function MemberList() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const canRegister = useHasAnyRole([UserRole.ADMIN, UserRole.RECEPTIONIST]);
  const isTrainer = role === UserRole.TRAINER;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | undefined>();
  const [planFilter, setPlanFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['members', debouncedSearch, statusFilter, planFilter, page, pageSize],
    queryFn: () =>
      membersApi.getAll({
        search: debouncedSearch || undefined,
        status: statusFilter,
        planId: planFilter,
        page,
        limit: pageSize,
      }),
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
  });

  const members = data?.data?.data?.members ?? [];
  const pagination = data?.data?.data?.pagination;
  const plans: Plan[] = plansData?.data?.data ?? [];

  const trainerColumns: ColumnsType<Member> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Health Conditions',
      dataIndex: 'health_conditions',
      key: 'health_conditions',
      render: (val: string | null) => val ?? '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Member) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/members/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];
  const handleDelete = async (id: number) => {
  try {
    await membersApi.delete(id);
    message.success('Member deleted successfully');
    refetch(); // refresh table
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    message.error('Failed to delete member');
  }
};
  const fullColumns: ColumnsType<Member> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Code',
      dataIndex: 'member_code',
      key: 'member_code',
      width: 130,
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: 'Plan', dataIndex: 'plan_name', key: 'plan_name' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: MembershipStatus) => (
        <Tag color={STATUS_COLORS[status]}>{status}</Tag>
      ),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 140,
      render: (date: string, record: Member) => {
        const days = getDaysRemaining(date);
        const expiringSoon =
          record.status === MembershipStatus.ACTIVE && days >= 0 && days <= 7;
        return expiringSoon ? (
          <Badge count={`${days}d left`} size="small" color="orange">
            <span>{formatDate(date)}</span>
          </Badge>
        ) : (
          formatDate(date)
        );
      },
    },
    {
      title: 'PT Sessions',
      dataIndex: 'remaining_pt_sessions',
      key: 'remaining_pt_sessions',
      width: 110,
      align: 'center',
    },
    {
  title: 'Actions',
  key: 'actions',
  width: 150,
  render: (_: unknown, record: Member) => (
    <>
      {/* View */}
      <Button
        type="link"
        icon={<EyeOutlined />}
        onClick={() => navigate(`/members/${record.id}`)}
      >
        View
      </Button>

      {/* Delete (ADMIN only) */}
      {role === UserRole.ADMIN && (
        <Popconfirm
          title="Are you sure to delete this member?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </Popconfirm>
      )}
    </>
  ),
}
  ];

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load members"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Members</Title>
        </Col>
        <Col>
          {canRegister && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/members/new')}
            >
              Register Member
            </Button>
          )}
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Search
            placeholder="Search name, phone, code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
          />
        </Col>
        {!isTrainer && (
          <>
            <Col xs={12} sm={4}>
              <Select
                placeholder="Status"
                allowClear
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                options={Object.values(MembershipStatus).map((s) => ({
                  label: s,
                  value: s,
                }))}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="Plan"
                allowClear
                style={{ width: '100%' }}
                value={planFilter}
                onChange={(val) => {
                  setPlanFilter(val);
                  setPage(1);
                }}
                options={plans.map((p) => ({ label: p.name, value: p.id }))}
              />
            </Col>
          </>
        )}
      </Row>

      <Spin spinning={isLoading}>
        <Table
          columns={isTrainer ? trainerColumns : fullColumns}
          dataSource={members}
          rowKey="id"
          pagination={{
            current: pagination?.page ?? 1,
            pageSize: pagination?.limit ?? 20,
            total: pagination?.total ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} members`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Spin>
    </div>
  );
}
