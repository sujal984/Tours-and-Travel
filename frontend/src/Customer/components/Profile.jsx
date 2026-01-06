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
  Tag,
  Descriptions,
  Spin
} from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useUser } from "../../context/userContext";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

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
        // Add other fields if available in user object
        phone: user.phone || "",
        address: user.address || "",
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

  if (!user) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: 'var(--spacing-3xl) 0' }}>
      <div className="container-xl" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 var(--spacing-xl)' }}>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '30px', textAlign: 'center' }}
        >
          <Title level={2}>My Profile</Title>
          <Text type="secondary">Manage your personal information</Text>
        </motion.div>

        <Row gutter={[32, 32]}>
          {/* User Card */}
          <Col xs={24} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card" bodyStyle={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                  <Avatar size={120} icon={<UserOutlined />} src={user?.avatar} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }} />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<EditOutlined />}
                    size="small"
                    style={{ position: 'absolute', bottom: 0, right: 0 }}
                  />
                </div>
                <Title level={3} style={{ margin: '0 0 5px 0' }}>{user.first_name} {user.last_name}</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '15px' }}>@{user.username}</Text>
                <Tag color="var(--primary-color)">{user.role?.toUpperCase() || "TRAVELER"}</Tag>

                <Divider style={{ margin: '25px 0' }} />

                <div style={{ textAlign: 'left' }}>
                  <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MailOutlined style={{ color: 'var(--primary-color)' }} />
                    <Text>{user.email}</Text>
                  </div>
                  <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CalendarOutlined style={{ color: 'var(--primary-color)' }} />
                    <Text>Joined {new Date(user.date_joined || Date.now()).toLocaleDateString()}</Text>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Edit Form */}
          <Col xs={24} md={16}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card" title={<span style={{ fontSize: '1.2rem' }}><UserOutlined /> Personal Details</span>} extra={
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
              }>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  disabled={!editing}
                  size="large"
                >
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="first_name"
                        label="First Name"
                        rules={[{ required: true, message: "Please enter your first name" }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="First Name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="last_name"
                        label="Last Name"
                        rules={[{ required: true, message: "Please enter your last name" }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Last Name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: "Please enter your email" },
                          { type: "email", message: "Please enter a valid email" }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Email" disabled />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: "Please enter your username" }]}
                      >
                        <Input prefix={<SafetyCertificateOutlined />} placeholder="Username" disabled={!editing} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="+91 9876543210" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

                {editing && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '10px' }}
                  >
                    <SafetyCertificateOutlined style={{ color: 'var(--primary-color)', fontSize: '1.2rem', marginTop: '2px' }} />
                    <div>
                      <Text strong>Privacy Note</Text>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Your personal information is encrypted and secure. We only share booking details with our verified tour operators.
                      </p>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Profile;