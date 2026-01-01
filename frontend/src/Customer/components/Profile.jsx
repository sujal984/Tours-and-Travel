import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Avatar,
  Divider,
  Typography,
} from "antd";
import { UserOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useUser } from "../../context/userContext";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import Navbar from "./Navbar";
import Footer from "./Footer";

const { Title, Text } = Typography;

const Profile = () => {
  const { user, updateUser } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
      });
    }
  }, [user, form]);

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      const response = await apiClient.put(endpoints.UPDATE_PROFILE, values);
      updateUser(response.data.data || response.data);
      message.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
        <Card>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Avatar size={100} icon={<UserOutlined />} src={user?.avatar} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
              {user?.first_name} {user?.last_name}
            </Title>
            <Text type="secondary">{user?.email}</Text>
          </div>

          <Divider />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Title level={3}>Profile Information</Title>
            <Button
              type={editing ? "default" : "primary"}
              icon={editing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => {
                if (editing) {
                  form.submit();
                } else {
                  setEditing(true);
                }
              }}
              loading={loading}
            >
              {editing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            disabled={!editing}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: "Please enter your first name" }]}
                >
                  <Input placeholder="Enter your first name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={[{ required: true, message: "Please enter your last name" }]}
                >
                  <Input placeholder="Enter your last name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" }
                  ]}
                >
                  <Input placeholder="Enter your email" disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[{ required: true, message: "Please enter your username" }]}
                >
                  <Input placeholder="Enter your username" />
                </Form.Item>
              </Col>
            </Row>

            {editing && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Button
                  style={{ marginRight: 8 }}
                  onClick={() => {
                    setEditing(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
              </div>
            )}
          </Form>

          <Divider />

          <div>
            <Title level={4}>Account Information</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text strong>Account Type:</Text>
                <br />
                <Text>{user?.role || "Customer"}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Member Since:</Text>
                <br />
                <Text>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}</Text>
              </Col>
            </Row>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;