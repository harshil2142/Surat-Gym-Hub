import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, Form, Input, Button, Typography, Alert, Space, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../stores/useAuthStore';
import { authApi } from '../../api/auth';
import type { RegisterRequest } from '../../types/User';
import type { ApiErrorResponse } from '../../types/ApiResponse';

const { Title, Text } = Typography;

export default function Register() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterRequest>();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      message.success('Account created successfully! Please sign in.');
      navigate('/login');
    },
    onError: (_: AxiosError<ApiErrorResponse>) => {
      // error is shown via Alert below using registerMutation.error
    },
  });

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const onFinish = (values: RegisterRequest & { confirmPassword?: string }) => {
    const { confirmPassword: _, ...payload } = values;
    registerMutation.mutate(payload);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 420 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 4 }}>
              SuratGymHub
            </Title>
            <Text type="secondary">Create a new account</Text>
          </div>

          {registerMutation.isError && (
            <Alert
              type="error"
              showIcon
              message={
                registerMutation.error?.response?.data?.message ??
                'Registration failed. Please try again.'
              }
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Full name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please provide a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="you@example.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Min 6 characters"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Re-enter password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={registerMutation.isPending}
              >
                Register
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Already have an account? <Link to="/login">Sign in</Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
