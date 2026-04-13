import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  Spin,
  Result,
  Popconfirm,
  Space,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import { plansApi } from '../../api/plans';
import { AccessHours, PlanStatus } from '../../types/enums';
import { formatCurrency } from '../../utils/formatCurrency';
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from '../../types/Plan';
import type { ApiErrorResponse } from '../../types/ApiResponse';

const { Title, Text } = Typography;

export default function Plans() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
  });

  const plans: Plan[] = data?.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CreatePlanRequest) => plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      message.success('Plan created');
      closeModal();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanRequest }) =>
      plansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      message.success('Plan updated');
      closeModal();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to update plan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      message.success('Plan deleted');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to delete plan');
    },
  });

  const openCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      name: plan.name,
      durationMonths: plan.duration_months,
      price: plan.price,
      ptSessions: plan.pt_sessions,
      accessHours: plan.access_hours,
      status: plan.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlan(null);
    form.resetFields();
  };

  const onFinish = (values: Record<string, unknown>) => {
    if (editingPlan) {
      updateMutation.mutate({
        id: editingPlan.id,
        data: {
          name: values.name as string,
          durationMonths: values.durationMonths as number,
          price: values.price as number,
          ptSessions: values.ptSessions as number | undefined,
          accessHours: values.accessHours as AccessHours | undefined,
          status: values.status as PlanStatus | undefined,
        },
      });
    } else {
      createMutation.mutate({
        name: values.name as string,
        durationMonths: values.durationMonths as number,
        price: values.price as number,
        ptSessions: values.ptSessions as number | undefined,
        accessHours: values.accessHours as AccessHours | undefined,
      });
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load plans"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Membership Plans</Title></Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Plan
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {plans.map((plan) => (
          <Col xs={24} sm={12} lg={8} key={plan.id}>
            <Card
              title={plan.name}
              extra={<Tag color={plan.status === PlanStatus.ACTIVE ? 'green' : 'default'}>{plan.status}</Tag>}
              actions={[
                <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(plan)} key="edit">
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete this plan?"
                  onConfirm={() => deleteMutation.mutate(plan.id)}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 24 }}>{formatCurrency(plan.price)}</Text>
                <Text>Duration: {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</Text>
                <Text>PT Sessions: {plan.pt_sessions}</Text>
                <Text>Access: {plan.access_hours}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingPlan ? 'Edit Plan' : 'Add New Plan'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Plan Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Premium Monthly" />
          </Form.Item>
          <Form.Item
            name="durationMonths"
            label="Duration (months)"
            rules={[{ required: true, message: 'Please select duration' }]}
          >
            <Select
              placeholder="Select duration"
              options={[
                { label: '1 Month', value: 1 },
                { label: '3 Months', value: 3 },
                { label: '6 Months', value: 6 },
                { label: '12 Months', value: 12 },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price (INR)"
            rules={[{ required: true }, { type: 'number', min: 0 }]}
          >
            <InputNumber min={0} step={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ptSessions" label="PT Sessions Included">
            <Select
              placeholder="Select PT sessions"
              options={[
                { label: '0', value: 0 },
                { label: '4', value: 4 },
                { label: '8', value: 8 },
                { label: '12', value: 12 },
              ]}
            />
          </Form.Item>
          <Form.Item name="accessHours" label="Access Hours">
            <Select
              allowClear
              options={Object.values(AccessHours).map((a) => ({ label: a, value: a }))}
            />
          </Form.Item>
          {editingPlan && (
            <Form.Item name="status" label="Status">
              <Select
                options={Object.values(PlanStatus).map((s) => ({ label: s, value: s }))}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
