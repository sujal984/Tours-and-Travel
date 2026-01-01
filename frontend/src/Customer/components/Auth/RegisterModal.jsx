import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useUser } from "../../../context/userContext";

const RegisterModal = ({ open, onClose, onLoginClick }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { register } = useUser();

  const onFinish = async (values) => {
    console.log(values);
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
        password_confirm: values.password,
      });

      if (result.success) {
        form.resetFields();
        message.success("Registration successful! Please login now.");
        onClose();
        onLoginClick();
      }
    } catch (error) {
      console.log(error);
      message.error("Registration failed. Please try again."); s
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
          Create New Account
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={450}
      centered
    >
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        size="large"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
        </div>

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
          name="phone"
          rules={[
            { required: true, message: "Please enter your phone number" },
            {
              pattern: /^[0-9]{10}$/,
              message: "Please enter a valid 10-digit phone number",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Mobile Number"
            maxLength={10}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter a password" },
            {
              min: 6,
              message: "Password must be at least 6 characters",
            },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          rules={[{ required: true, message: "Please confirm your password" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
            Register
          </Button>
        </Form.Item>

        <Divider>Or</Divider>

        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: 0, fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <a
              href="#login"
              onClick={() => {
                onClose();
                onLoginClick();
              }}
              style={{ color: "#667eea", fontWeight: "bold" }}
            >
              Login here
            </a>
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default RegisterModal;
