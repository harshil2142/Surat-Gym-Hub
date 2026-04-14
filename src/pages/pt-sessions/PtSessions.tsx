import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  Typography,
  Spin,
  Result,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import type { ColumnsType } from 'antd/es/table';
import { ptSessionsApi } from '../../api/ptSessions';
import { trainersApi } from '../../api/trainers';
import { membersApi } from '../../api/members';
import { useHasAnyRole } from '../../hooks/usePermission';
import { useAuthStore } from '../../stores/useAuthStore';
import { SessionStatus, UserRole } from '../../types/enums';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import type { PtSession } from '../../types/PtSession';
import type { Trainer, TrainerSlot } from '../../types/Trainer';
import type { Member } from '../../types/Member';
import type { ApiErrorResponse } from '../../types/ApiResponse';

const { Title } = Typography;

const STATUS_COLORS: Record<SessionStatus, string> = {
  [SessionStatus.BOOKED]: 'blue',
  [SessionStatus.COMPLETED]: 'green',
  [SessionStatus.CANCELLED]: 'default',
  [SessionStatus.NO_SHOW]: 'red',
};

export default function PtSessions() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const canBook = useHasAnyRole([UserRole.ADMIN, UserRole.RECEPTIONIST]);
  const canComplete = useHasAnyRole([UserRole.ADMIN, UserRole.TRAINER]);
  const canCancel = useHasAnyRole([UserRole.ADMIN, UserRole.RECEPTIONIST]);

  const [statusFilter, setStatusFilter] = useState<SessionStatus | undefined>();
  const [dateFilter, setDateFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | undefined>();
  const [slotDate, setSlotDate] = useState<string | undefined>();
  const [bookForm] = Form.useForm();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['pt-sessions', statusFilter, dateFilter, page],
    queryFn: () =>
      ptSessionsApi.getAll({
        status: statusFilter,
        date: dateFilter,
        page,
        limit: 20,
      }),
  });

  const { data: trainersData } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => trainersApi.getAll(),
    enabled: canBook,
  });

  const { data: membersData } = useQuery({
    queryKey: ['members-for-booking'],
    queryFn: () => membersApi.getAll({ limit: 200 }),
    enabled: bookModalOpen,
  });

  const { data: slotsData } = useQuery({
    queryKey: ['trainer-slots', selectedTrainerId, slotDate],
    queryFn: () => trainersApi.getSlots(selectedTrainerId!, slotDate),
    enabled: !!selectedTrainerId && !!slotDate,
  });

  const sessions = data?.data?.data?.sessions ?? [];
  const pagination = data?.data?.data?.pagination;
  const trainers: Trainer[] = trainersData?.data?.data ?? [];
  const members: Member[] = membersData?.data?.data?.members ?? [];
  const slots: TrainerSlot[] = slotsData?.data?.data ?? [];
  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE');

  const bookMutation = useMutation({
    mutationFn: (data: { memberId: number; slotId: number }) => ptSessionsApi.book(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-slots'] });
      message.success('Session booked');
      setBookModalOpen(false);
      bookForm.resetFields();
      setSelectedTrainerId(undefined);
      setSlotDate(undefined);
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to book session');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => ptSessionsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-sessions'] });
      message.success('Session completed');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to complete session');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => ptSessionsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-slots'] });
      message.success('Session cancelled');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to cancel session');
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: number) => ptSessionsApi.noShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-sessions'] });
      message.success('Marked as no-show');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed');
    },
  });

  const columns: ColumnsType<PtSession> = [
    { 
      title: '#', 
      key: 'index', 
      width: 60, 
      render: (_text: unknown, _record: PtSession, index: number) => 
        (pagination?.page ?? 1) > 0 ? ((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 20) + index + 1 : index + 1
    },
    { title: 'Code', dataIndex: 'session_code', key: 'session_code', width: 120 },
    { title: 'Member', dataIndex: 'member_name', key: 'member_name' },
    { title: 'Trainer', dataIndex: 'trainer_name', key: 'trainer_name' },
    { title: 'Date', dataIndex: 'session_date', key: 'session_date', render: (d: string) => formatDate(d) },
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
      render: (s: SessionStatus) => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: PtSession) => {
        if (record.status !== SessionStatus.BOOKED) return null;
        return (
          <Space size="small">
            {canComplete && (
              <Popconfirm title="Mark as completed?" onConfirm={() => completeMutation.mutate(record.id)}>
                <Button type="link" size="small">Complete</Button>
              </Popconfirm>
            )}
            {canCancel && (
              <Popconfirm title="Cancel this session?" onConfirm={() => cancelMutation.mutate(record.id)}>
                <Button type="link" size="small" danger>Cancel</Button>
              </Popconfirm>
            )}
            {canComplete && (
              <Popconfirm title="Mark as no-show?" onConfirm={() => noShowMutation.mutate(record.id)}>
                <Button type="link" size="small">No-Show</Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  // Filter out commission column for non-admin
  const visibleColumns = role === UserRole.TRAINER
    ? columns.filter((c) => c.key !== 'amount_charged')
    : columns;

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load sessions"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>PT Sessions</Title></Col>
        <Col>
          {canBook && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setBookModalOpen(true)}>
              Book Session
            </Button>
          )}
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={4}>
          <Select
            placeholder="Status"
            allowClear
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            options={Object.values(SessionStatus).map((s) => ({ label: s, value: s }))}
          />
        </Col>
        <Col xs={12} sm={4}>
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Date"
            onChange={(d) => { setDateFilter(d ? d.format('YYYY-MM-DD') : undefined); setPage(1); }}
            allowClear
          />
        </Col>
      </Row>

      <Spin spinning={isLoading}>
        <Table
          columns={visibleColumns}
          dataSource={sessions}
          rowKey="id"
          pagination={{
            current: pagination?.page ?? 1,
            pageSize: pagination?.limit ?? 20,
            total: pagination?.total ?? 0,
            onChange: (p) => setPage(p),
          }}
        />
      </Spin>

      {/* Book Session Modal */}
      <Modal
        title="Book PT Session"
        open={bookModalOpen}
        onCancel={() => {
          setBookModalOpen(false);
          bookForm.resetFields();
          setSelectedTrainerId(undefined);
          setSlotDate(undefined);
        }}
        onOk={() => bookForm.submit()}
        confirmLoading={bookMutation.isPending}
        width={500}
      >
        <Form
          form={bookForm}
          layout="vertical"
          onFinish={(values) => {
            bookMutation.mutate({
              memberId: values.memberId as number,
              slotId: values.slotId as number,
            });
          }}
        >
          <Form.Item name="memberId" label="Member" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select member"
              options={members.map((m) => ({
                label: `${m.name} (${m.member_code})`,
                value: m.id,
              }))}
            />
          </Form.Item>

          <Form.Item label="Trainer">
            <Select
              placeholder="Select trainer"
              value={selectedTrainerId}
              onChange={(val) => {
                setSelectedTrainerId(val as number);
                bookForm.setFieldValue('slotId', undefined);
              }}
              options={trainers.map((t) => ({
                label: `${t.name} (${t.specialization})`,
                value: t.id,
              }))}
            />
          </Form.Item>

          <Form.Item label="Slot Date">
            <DatePicker
              style={{ width: '100%' }}
              onChange={(d) => {
                setSlotDate(d ? d.format('YYYY-MM-DD') : undefined);
                bookForm.setFieldValue('slotId', undefined);
              }}
            />
          </Form.Item>

          <Form.Item name="slotId" label="Time Slot" rules={[{ required: true }]}>
            <Select
              placeholder={
                !selectedTrainerId
                  ? 'Select a trainer first'
                  : !slotDate
                    ? 'Select a date first'
                    : 'Select slot'
              }
              disabled={!selectedTrainerId || !slotDate}
              options={availableSlots.map((s) => ({
                label: `${s.start_time} - ${s.end_time}`,
                value: s.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
