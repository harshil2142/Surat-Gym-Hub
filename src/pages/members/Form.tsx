import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Card,
  Typography,
  Spin,
  message,
  Row,
  Col,
} from 'antd';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { membersApi } from '../../api/members';
import { plansApi } from '../../api/plans';
import { Gender, PaymentMethod } from '../../types/enums';
import type { CreateMemberRequest, UpdateMemberRequest } from '../../types/Member';
import type { ApiErrorResponse } from '../../types/ApiResponse';

const { Title } = Typography;

export default function MemberForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: memberData, isLoading: memberLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getById(Number(id)),
    enabled: isEdit,
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
  });

  const plans = plansData?.data?.data ?? [];

  useEffect(() => {
    if (isEdit && memberData?.data?.data) {
      const m = memberData.data.data;
      form.setFieldsValue({
        name: m.name,
        phone: m.phone,
        email: m.email,
        age: m.age,
        gender: m.gender,
        healthConditions: m.health_conditions,
        emergencyContactPhone: m.emergency_contact_phone,
        membershipPlanId: m.membership_plan_id,
        startDate: m.start_date ? dayjs(m.start_date) : undefined,
      });
    }
  }, [isEdit, memberData, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateMemberRequest) => membersApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      message.success('Member registered successfully');
      navigate(`/members/${res.data.data.id}`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      message.error(error.response?.data?.message ?? 'Failed to register member');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMemberRequest) => membersApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      message.success('Member updated successfully');
      navigate(`/members/${id}`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      message.error(error.response?.data?.message ?? 'Failed to update member');
    },
  });

  const onFinish = (values: Record<string, unknown>) => {
    if (isEdit) {
      const payload: UpdateMemberRequest = {
        name: values.name as string,
        phone: values.phone as string,
        email: (values.email as string) || undefined,
        age: values.age as number | undefined,
        gender: values.gender as Gender | undefined,
        healthConditions: (values.healthConditions as string) || undefined,
        emergencyContactPhone: (values.emergencyContactPhone as string) || undefined,
      };
      updateMutation.mutate(payload);
    } else {
      const payload: CreateMemberRequest = {
        name: values.name as string,
        phone: values.phone as string,
        email: (values.email as string) || undefined,
        age: values.age as number | undefined,
        gender: values.gender as Gender | undefined,
        healthConditions: (values.healthConditions as string) || undefined,
        emergencyContactPhone: (values.emergencyContactPhone as string) || undefined,
        membershipPlanId: values.membershipPlanId as number,
        startDate: (values.startDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        paymentMethod: values.paymentMethod as PaymentMethod | undefined,
      };
      createMutation.mutate(payload);
    }
  };

  if (isEdit && memberLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      <Title level={4}>{isEdit ? 'Edit Member' : 'Register New Member'}</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 800 }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="Full name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Phone is required' },
                { pattern: /^\d{10}$/, message: 'Phone must be exactly 10 digits' },
              ]}
            >
              <Input placeholder="10-digit phone number" maxLength={10} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input placeholder="Email (optional)" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="age"
              label="Age"
              rules={[{ type: 'number', min: 14, message: 'Minimum age is 14' }]}
            >
              <InputNumber placeholder="Age" min={14} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="gender" label="Gender">
              <Select
                placeholder="Select gender"
                allowClear
                options={Object.values(Gender).map((g) => ({ label: g, value: g }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="healthConditions" label="Health Conditions">
              <Input.TextArea rows={3} placeholder="Any health conditions..." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="emergencyContactPhone" label="Emergency Contact Phone">
              <Input placeholder="Emergency contact phone" />
            </Form.Item>
          </Col>
        </Row>

        {!isEdit && (
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="membershipPlanId"
                label="Membership Plan"
                rules={[{ required: true, message: 'Please select a plan' }]}
              >
                <Select
                  placeholder="Select plan"
                  options={plans.map((p) => ({
                    label: `${p.name} (${p.duration_months}mo)`,
                    value: p.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Start date is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="paymentMethod" label="Payment Method">
                <Select
                  placeholder="Payment method"
                  allowClear
                  options={Object.values(PaymentMethod).map((p) => ({
                    label: p,
                    value: p,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? 'Update Member' : 'Register Member'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
