import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Result,
  Card,
  Typography,
  Table,
  Modal,
  Form,
  Select,
  DatePicker,
  Popconfirm,
  message,
} from 'antd';
import {
  EditOutlined,
  StopOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { membersApi } from '../../api/members';
import { plansApi } from '../../api/plans';
import { ptSessionsApi } from '../../api/ptSessions';
import { useAuthStore } from '../../stores/useAuthStore';
import { useHasAnyRole, usePermission } from '../../hooks/usePermission';
import { MembershipStatus, UserRole, PaymentMethod, SessionStatus } from '../../types/enums';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { getDaysRemaining } from '../../utils/getDaysRemaining';
import type { PtSession } from '../../types/PtSession';
import type { ApiErrorResponse } from '../../types/ApiResponse';

const { Title } = Typography;

const STATUS_COLORS: Record<MembershipStatus, string> = {
  [MembershipStatus.ACTIVE]: 'green',
  [MembershipStatus.EXPIRED]: 'red',
  [MembershipStatus.FROZEN]: 'orange',
  [MembershipStatus.CANCELLED]: 'default',
};

const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  [SessionStatus.BOOKED]: 'blue',
  [SessionStatus.COMPLETED]: 'green',
  [SessionStatus.CANCELLED]: 'default',
  [SessionStatus.NO_SHOW]: 'red',
};

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const canEdit = useHasAnyRole([UserRole.ADMIN, UserRole.RECEPTIONIST]);
  const isAdmin = usePermission(UserRole.ADMIN);
  const isTrainer = role === UserRole.TRAINER;

  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [renewForm] = Form.useForm();
  const [changePlanForm] = Form.useForm();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['member-sessions', id],
    queryFn: () => ptSessionsApi.getByMember(Number(id)),
    enabled: !!id,
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
  });

  const member = data?.data?.data;
  const sessions: PtSession[] = sessionsData?.data?.data ?? [];
  const plans = plansData?.data?.data ?? [];

  const cancelMutation = useMutation({
    mutationFn: () => membersApi.cancel(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      message.success('Membership cancelled');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to cancel');
    },
  });

  const freezeMutation = useMutation({
    mutationFn: () => membersApi.freeze(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      message.success('Membership frozen');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to freeze');
    },
  });

  const unfreezeMutation = useMutation({
    mutationFn: () => membersApi.unfreeze(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      message.success('Membership unfrozen');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to unfreeze');
    },
  });

  const renewMutation = useMutation({
    mutationFn: (values: { planId: number; startDate: string; paymentMethod?: PaymentMethod }) =>
      membersApi.renew(Number(id), values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      message.success('Membership renewed');
      setRenewModalOpen(false);
      renewForm.resetFields();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to renew');
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: (values: { planId: number; startDate?: string; paymentMethod?: PaymentMethod }) =>
      membersApi.changePlan(Number(id), values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      message.success('Plan changed successfully');
      setChangePlanModalOpen(false);
      changePlanForm.resetFields();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to change plan');
    },
  });

  const sessionColumns: ColumnsType<PtSession> = [
    { title: 'Code', dataIndex: 'session_code', key: 'session_code', width: 120 },
    { title: 'Date', dataIndex: 'session_date', key: 'session_date', render: (d: string) => formatDate(d), width: 120 },
    { title: 'Trainer', dataIndex: 'trainer_name', key: 'trainer_name' },
    { title: 'Type', dataIndex: 'session_type', key: 'session_type' },
    { title: 'Source', dataIndex: 'session_source', key: 'session_source' },
    {
      title: 'Amount',
      dataIndex: 'amount_charged',
      key: 'amount_charged',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: SessionStatus) => <Tag color={SESSION_STATUS_COLORS[s]}>{s}</Tag>,
    },
  ];

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  if (isError || !member) {
    return (
      <Result
        status="error"
        title="Failed to load member"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );
  }

  const daysRemaining = getDaysRemaining(member.end_date);

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Title level={4} style={{ margin: 0 }}>
          {member.name} — {member.member_code}
        </Title>
        <Tag color={STATUS_COLORS[member.status]}>{member.status}</Tag>
        {member.status === MembershipStatus.ACTIVE && daysRemaining >= 0 && daysRemaining <= 7 && (
          <Tag color="orange">{daysRemaining} days remaining</Tag>
        )}
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Name">{member.name}</Descriptions.Item>
          <Descriptions.Item label="Phone">{member.phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{member.email ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Age">{member.age ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Gender">{member.gender ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Health Conditions">
            {member.health_conditions ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Emergency Contact">
            {member.emergency_contact_phone ?? '—'}
          </Descriptions.Item>

          {!isTrainer && (
            <>
              <Descriptions.Item label="Plan">{member.plan_name}</Descriptions.Item>
              <Descriptions.Item label="Start Date">{formatDate(member.start_date)}</Descriptions.Item>
              <Descriptions.Item label="End Date">{formatDate(member.end_date)}</Descriptions.Item>
              <Descriptions.Item label="Remaining PT Sessions">
                {member.remaining_pt_sessions}
              </Descriptions.Item>
              <Descriptions.Item label="Registered">{formatDateTime(member.created_at)}</Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      {canEdit && (
        <Space style={{ marginBottom: 16 }} wrap>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/members/${id}/edit`)}>
            Edit
          </Button>

          {member.status === MembershipStatus.ACTIVE && canEdit && (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={() => freezeMutation.mutate()}
              loading={freezeMutation.isPending}
            >
              Freeze
            </Button>
          )}

          {member.status === MembershipStatus.FROZEN && canEdit && (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => unfreezeMutation.mutate()}
              loading={unfreezeMutation.isPending}
            >
              Unfreeze
            </Button>
          )}

          {isAdmin && member.status !== MembershipStatus.CANCELLED && (
            <Popconfirm
              title="Cancel this membership?"
              description="This action cannot be undone."
              onConfirm={() => cancelMutation.mutate()}
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<StopOutlined />} loading={cancelMutation.isPending}>
                Cancel Membership
              </Button>
            </Popconfirm>
          )}

          {canEdit && member.status !== MembershipStatus.CANCELLED && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setRenewModalOpen(true)}
            >
              Renew
            </Button>
          )}

          {isAdmin && member.status !== MembershipStatus.CANCELLED && (
            <Button
              icon={<SwapOutlined />}
              onClick={() => setChangePlanModalOpen(true)}
            >
              Change Plan
            </Button>
          )}
        </Space>
      )}

      <Card title="PT Sessions" style={{ marginBottom: 16 }}>
        <Table
          columns={sessionColumns}
          dataSource={sessions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* Renew Modal */}
      <Modal
        title="Renew Membership"
        open={renewModalOpen}
        onCancel={() => setRenewModalOpen(false)}
        onOk={() => renewForm.submit()}
        confirmLoading={renewMutation.isPending}
      >
        <Form
          form={renewForm}
          layout="vertical"
          onFinish={(values) => {
            renewMutation.mutate({
              planId: values.planId as number,
              startDate: (values.startDate as dayjs.Dayjs).format('YYYY-MM-DD'),
              paymentMethod: values.paymentMethod as PaymentMethod | undefined,
            });
          }}
        >
          <Form.Item name="planId" label="Plan" rules={[{ required: true }]}>
            <Select
              options={plans.map((p) => ({
                label: `${p.name} (${p.duration_months}mo — ${formatCurrency(p.price)})`,
                value: p.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentMethod" label="Payment Method">
            <Select
              allowClear
              options={Object.values(PaymentMethod).map((p) => ({
                label: p,
                value: p,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Plan Modal */}
      <Modal
        title="Change Membership Plan"
        open={changePlanModalOpen}
        onCancel={() => setChangePlanModalOpen(false)}
        onOk={() => changePlanForm.submit()}
        confirmLoading={changePlanMutation.isPending}
      >
        <Form
          form={changePlanForm}
          layout="vertical"
          onFinish={(values) => {
            changePlanMutation.mutate({
              planId: values.planId as number,
              startDate: values.startDate
                ? (values.startDate as dayjs.Dayjs).format('YYYY-MM-DD')
                : undefined,
              paymentMethod: values.paymentMethod as PaymentMethod | undefined,
            });
          }}
        >
          <Form.Item name="planId" label="New Plan" rules={[{ required: true }]}>
            <Select
              options={plans.map((p) => ({
                label: `${p.name} (${p.duration_months}mo — ${formatCurrency(p.price)})`,
                value: p.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date (optional)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentMethod" label="Payment Method">
            <Select
              allowClear
              options={Object.values(PaymentMethod).map((p) => ({
                label: p,
                value: p,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
