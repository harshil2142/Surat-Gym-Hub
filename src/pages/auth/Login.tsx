import { Navigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Alert, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import type { LoginRequest } from '../../types/User';

const { Title, Text } = Typography;

export default function Login() {
  const { handleLogin, loginMutation, isAuthenticated } = useAuth();
  const [form] = Form.useForm<LoginRequest>();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

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
      <Card style={{ width: 400 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 4 }}>
              SuratGymHub
            </Title>
            <Text type="secondary">Sign in to your account</Text>
          </div>

          {loginMutation.isError && (
            <Alert
              type="error"
              showIcon
              message={
                loginMutation.error?.response?.data?.message ??
                'Login failed. Please try again.'
              }
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="admin@suratgymhub.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
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
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loginMutation.isPending}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account? <Link to="/register">Register</Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
