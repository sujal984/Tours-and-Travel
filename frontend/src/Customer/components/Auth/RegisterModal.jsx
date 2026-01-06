import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Divider, Typography, Row, Col } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  UserAddOutlined,
  GoogleOutlined
} from "@ant-design/icons";
import { useUser } from "../../../context/userContext";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const RegisterModal = ({ open, onClose, onLoginClick }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { register } = useUser();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        username: values.email,
        phone: values.phone,
        password: values.password,
        password_confirm: values.password, // Ensure backend expects this
        role: "user" // Explicitly setting role if needed
      });

      if (result.success) {
        form.resetFields();
        message.success("Registration successful! Please login now.");
        onClose();
        if (onLoginClick) onLoginClick();
      }
    } catch (error) {
      console.error(error);
      message.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      className="premium-modal"
      bodyStyle={{ padding: '40px 30px', borderRadius: 'var(--radius-lg)' }}
      closeIcon={null}
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
            <UserAddOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
          </div>
          <Title level={3} style={{ marginBottom: "5px" }}>Create Account</Title>
          <Text type="secondary">Join us and start your adventure</Text>
        </div>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          size="large"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="First Name" style={{ borderRadius: 'var(--radius-md)' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="Last Name" style={{ borderRadius: 'var(--radius-md)' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="Email Address"
              style={{ borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Please enter your phone" },
              { pattern: /^[0-9]{10}$/, message: "Valid 10-digit number required" },
            ]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="Mobile Number"
              maxLength={10}
              style={{ borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Required" },
                  { min: 6, message: "Min 6 chars" },
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="Password" style={{ borderRadius: 'var(--radius-md)' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                rules={[{ required: true, message: "Confirm password" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
                  placeholder="Confirm"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </Form.Item>
            </Col>
          </Row>

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
                marginTop: '10px',
                boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)'
              }}
            >
              Register
            </Button>
          </Form.Item>

          <Divider style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Or sign up with</Divider>

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
            <Text type="secondary">Already have an account? </Text>
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                if (onLoginClick) onLoginClick();
              }}
              style={{ color: "var(--primary-color)", fontWeight: "bold" }}
            >
              Log in
            </a>
          </div>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default RegisterModal;
