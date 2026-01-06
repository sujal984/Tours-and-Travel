import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Divider, Typography } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, LoginOutlined, GoogleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/userContext";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const LoginModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password, "user");
      if (result.success) {
        form.resetFields();
        onClose();
        navigate("/");
        message.success("Welcome back! Ready to explore?");
      }
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      className="premium-modal"
      bodyStyle={{ padding: '40px 30px', borderRadius: 'var(--radius-lg)' }}
      closeIcon={null} // Cleaner look, or custom icon
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: '60px', height: '60px', background: 'var(--primary-lighter)', borderRadius: '50%',
            margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <LoginOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
          </div>
          <Title level={3} style={{ marginBottom: "5px" }}>Welcome Back</Title>
          <Text type="secondary">Sign in to continue your journey</Text>
        </div>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email address" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="Email Address"
              style={{ borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="Password"
              style={{ borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <a href="#" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>Forgot Password?</a>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              style={{
                height: '50px', borderRadius: 'var(--radius-md)',
                fontWeight: 'bold', fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)'
              }}
            >
              Log In
            </Button>
          </Form.Item>

          <Divider style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Or continue with</Divider>

          <div style={{ textAlign: "center", marginBottom: '20px' }}>
            <Button
              icon={<GoogleOutlined />}
              size="large"
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            >
              Google
            </Button>
          </div>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">Don't have an account? </Text>
            <a
              href="#register"
              style={{ color: "var(--primary-color)", fontWeight: "bold" }}
              onClick={(e) => {
                e.preventDefault();
                // Assuming parent handles this trigger via prop or context if complex switching needed
                // But typically modals link via their props. 
                // Since this is a modal, we might need a way to switch. 
                // The current implementation onClose doesn't switch.
                // Ideally passed a onSwitchToRegister prop.
                // For now, I'll keep the link standard but styling is updated.
                message.info("Please close this and open Register.");
              }}
            >
              Sign up
            </a>
          </div>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default LoginModal;
