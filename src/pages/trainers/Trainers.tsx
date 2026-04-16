import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  TimePicker,
  Typography,
  Tag,
  Space,
  Spin,
  Result,
  Popconfirm,
  message,
  Row,
  Col,
  Drawer,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { trainersApi } from '../../api/trainers';
import { TrainerSpecialisation } from '../../types/enums';
import { formatCurrency } from '../../utils/formatCurrency';
import type { Trainer, CreateTrainerRequest, UpdateTrainerRequest } from '../../types/Trainer';
import type { ApiErrorResponse } from '../../types/ApiResponse';

const { Title } = Typography;
import SlotManager from './components/SlotManager';

export default function Trainers() {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [slotsDrawerTrainer, setSlotsDrawerTrainer] = useState<Trainer | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => trainersApi.getAll(),
  });

  const trainers: Trainer[] = data?.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CreateTrainerRequest) => trainersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      message.success('Trainer created');
      setCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to create trainer');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTrainerRequest }) =>
      trainersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      message.success('Trainer updated');
      setEditingTrainer(null);
      editForm.resetFields();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to update trainer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trainersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      message.success('Trainer deleted');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to delete trainer');
    },
  });

  const openEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    editForm.setFieldsValue({
      specialization: trainer.specialization,
      sessionRate: trainer.session_rate,
      commissionRate: trainer.commission_rate,
      shiftStart: trainer.shift_start ? dayjs(trainer.shift_start, 'HH:mm:ss') : undefined,
      shiftEnd: trainer.shift_end ? dayjs(trainer.shift_end, 'HH:mm:ss') : undefined,
    });
  };

  const columns: ColumnsType<Trainer> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (s: string) => <Tag>{s}</Tag>,
    },
    {
      title: 'Session Rate',
      dataIndex: 'session_rate',
      key: 'session_rate',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Commission',
      dataIndex: 'commission_rate',
      key: 'commission_rate',
      render: (val: number | undefined) => (val !== undefined ? `${val}%` : '—'),
    },
    {
      title: 'Shift',
      key: 'shift',
      render: (_: unknown, record: Trainer) =>
        record.shift_start && record.shift_end
          ? `${record.shift_start} - ${record.shift_end}`
          : '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{s}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Trainer) => (
        <Space>
          <Button type="link" icon={<CalendarOutlined />} onClick={() => setSlotsDrawerTrainer(record)}>
            Slots
          </Button>
          <Button type="link" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this trainer?"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load trainers"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Trainers</Title></Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Add Trainer
          </Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={trainers} rowKey="id" />

      {/* Create Modal */}
      <Modal
        title="Add Trainer"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values) => {
            createMutation.mutate({
              name: values.name as string,
              email: values.email as string,
              password: values.password as string,
              specialization: values.specialization as TrainerSpecialisation,
              sessionRate: values.sessionRate as number,
              commissionRate: values.commissionRate as number,
              shiftStart: values.shiftStart
                ? (values.shiftStart as dayjs.Dayjs).format('HH:mm')
                : undefined,
              shiftEnd: values.shiftEnd
                ? (values.shiftEnd as dayjs.Dayjs).format('HH:mm')
                : undefined,
            });
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password must be at least 6 characters' },
              {
                validator: (_, value) => {
                  if (value && /\p{Extended_Pictographic}/u.test(value)) {
                    return Promise.reject(new Error('Password cannot contain emojis'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
                <Select
                  options={Object.values(TrainerSpecialisation).map((s) => ({
                    label: s.replace('_', ' '),
                    value: s,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sessionRate"
                label="Session Rate"
                rules={[{ required: true }, { type: 'number', min: 0 }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="commissionRate"
                label="Commission %"
                rules={[{ required: true }, { type: 'number', min: 0, max: 100 }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shiftStart" label="Shift Start">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shiftEnd" label="Shift End">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Trainer"
        open={!!editingTrainer}
        onCancel={() => { setEditingTrainer(null); editForm.resetFields(); }}
        onOk={() => editForm.submit()}
        confirmLoading={updateMutation.isPending}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(values) => {
            if (!editingTrainer) return;
            updateMutation.mutate({
              id: editingTrainer.id,
              data: {
                specialization: values.specialization as TrainerSpecialisation,
                sessionRate: values.sessionRate as number,
                commissionRate: values.commissionRate as number,
                shiftStart: values.shiftStart
                  ? (values.shiftStart as dayjs.Dayjs).format('HH:mm')
                  : undefined,
                shiftEnd: values.shiftEnd
                  ? (values.shiftEnd as dayjs.Dayjs).format('HH:mm')
                  : undefined,
              },
            });
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
                <Select
                  options={Object.values(TrainerSpecialisation).map((s) => ({
                    label: s.replace('_', ' '),
                    value: s,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sessionRate" label="Session Rate" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="commissionRate" label="Commission %">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shiftStart" label="Shift Start">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shiftEnd" label="Shift End">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Slots Drawer */}
      <Drawer
        title={`Manage Slots: ${slotsDrawerTrainer?.name}`}
        placement="right"
        width={600}
        onClose={() => setSlotsDrawerTrainer(null)}
        open={!!slotsDrawerTrainer}
        destroyOnClose
      >
        {slotsDrawerTrainer && (
          <SlotManager trainerId={slotsDrawerTrainer.id} />
        )}
      </Drawer>
    </div>
  );
}
