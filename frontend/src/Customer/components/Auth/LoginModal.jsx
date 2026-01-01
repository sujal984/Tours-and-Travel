import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Divider } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/userContext";

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
        message.success("Welcome back!");
      }
    } catch (error) {
      message.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "1.3rem",
            fontWeight: "bold",
          }}
        >
          Welcome Back
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
    >
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
            prefix={<MailOutlined />}
            placeholder="Email Address"
            type="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
            Login
          </Button>
        </Form.Item>

        <Divider>Or</Divider>

        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: 0, fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <a
              href="#register"
              style={{ color: "#667eea", fontWeight: "bold" }}
            >
              Register here
            </a>
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default LoginModal;
