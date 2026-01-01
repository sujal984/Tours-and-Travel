import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Typography,
  Space,
  Checkbox,
  Modal,
} from "antd";
import { UserOutlined, LockOutlined, SearchOutlined } from "@ant-design/icons";
import { useUser } from "../../context/userContext";

const { Title, Text } = Typography;

function AdminLogin() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [is404ModalOpen, setIs404ModalOpen] = useState(false);
  const { adminLogin, isAuthenticated, user } = useUser();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const render404Content = () => {
    return (
      <Modal
        width={400}
        centered
        okText="Go Back"
        cancelButtonProps={{ style: { display: "none" } }}
        open={is404ModalOpen}
        onOk={() => {
          setIs404ModalOpen(false);
        }}
        onCancel={() => setIs404ModalOpen(false)}
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <SearchOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
          <Title level={3} style={{ marginTop: "12px" }}>
            Admin Access Required
          </Title>
          <Text type="">
            Please use admin credentials to access the admin panel.
          </Text>
          <div style={{ marginTop: "16px" }}>
            <Text type="secondary">Contact your administrator if you need access.</Text>
          </div>
        </div>
      </Modal>
    );
  };

  const handleLogin = async (values) => {
    setLoading(true);
    const { email, password } = values;
    console.log("Admin login called with:", email, password);

    try {
      const result = await adminLogin(email, password);

      if (result.success) {
        message.success("Admin login successful!");
        // Use replace to prevent back button issues
        navigate('/admin', { replace: true });
        form.resetFields();
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);

      if (error.message?.includes('admin') || error.message?.includes('Access denied')) {
        setIs404ModalOpen(true);
      } else {
        message.error(error.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <Card className="w-full max-w-md shadow-xl p-6 rounded-lg">
        <div className="text-center mb-6">
          <Title level={2}>Admin Login</Title>
          <Text type="secondary">
            Use username: <strong>admin</strong> and password: <strong>admin123</strong>
          </Text>
        </div>

        <Form
          requiredMark={false}
          layout="vertical"
          form={form}
          name="adminLogin"
          onFinish={handleLogin}
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Enter your email!" }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="admin"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Enter your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700"
            >
              {loading ? "Logging in..." : "Login to Admin Panel"}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Button
              type="link"
              onClick={() => navigate('/')}
              className="text-gray-500"
            >
              Back to Customer Site
            </Button>
          </div>
        </Form>

        {render404Content()}
      </Card>
    </div>
  );
}

export default AdminLogin;
