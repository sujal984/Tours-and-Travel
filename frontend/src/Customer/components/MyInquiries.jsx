import React, { useState, useEffect } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Modal, 
  Typography, 
  Row, 
  Col, 
  Divider, 
  Space,
  Empty,
  Spin,
  message,
  Timeline,
  Descriptions
} from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import { useUser } from "../../context/userContext";

const { Title, Text, Paragraph } = Typography;

const MyInquiries = () => {
  const { user } = useUser();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInquiries();
    }
  }, [user]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_INQUIRIES);
      setInquiries(response.data?.data || response.data?.results || response.data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      message.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'NEW': 'blue',
      'RESPONDED': 'green',
      'CLOSED': 'gray'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'NEW': <ClockCircleOutlined />,
      'RESPONDED': <CheckCircleOutlined />,
      'CLOSED': <ExclamationCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const columns = [
    {
      title: "Inquiry ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text copyable={{ text: text }} style={{ color: 'var(--primary-color)' }}>#{text}</Text>,
    },
    {
      title: "Date",
      dataIndex: "inquiry_date",
      key: "inquiry_date",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: 'var(--text-tertiary)' }} />
          {dayjs(date).format('DD MMM YYYY')}
        </Space>
      ),
    },
    {
      title: "Subject",
      dataIndex: "message",
      key: "message",
      render: (message) => {
        const lines = message.split('\n');
        const subject = lines[0];
        return <Text>{subject.length > 50 ? subject.substring(0, 50) + '...' : subject}</Text>;
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: "Admin Response",
      dataIndex: "admin_response",
      key: "admin_response",
      render: (response) => response ? 
        <Tag color="green" icon={<CheckCircleOutlined />}>Responded</Tag> : 
        <Tag color="orange" icon={<ClockCircleOutlined />}>Pending</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedInquiry(record);
            setModalVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const renderDetailModal = () => {
    if (!selectedInquiry) return null;

    return (
      <Modal
        title={`Inquiry #${selectedInquiry.id}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Status Timeline */}
          <Card size="small" style={{ marginBottom: '20px' }}>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: `Inquiry submitted on ${dayjs(selectedInquiry.inquiry_date).format('DD MMM YYYY')}`
                },
                {
                  color: selectedInquiry.admin_response ? 'green' : 'gray',
                  children: selectedInquiry.admin_response ? 
                    `Admin responded on ${dayjs(selectedInquiry.updated_at).format('DD MMM YYYY')}` : 
                    'Waiting for admin response'
                },
                {
                  color: selectedInquiry.status === 'CLOSED' ? 'green' : 'gray',
                  children: selectedInquiry.status === 'CLOSED' ? 'Inquiry closed' : 'Inquiry active'
                }
              ]}
            />
          </Card>

          {/* Basic Details */}
          <Descriptions title="Inquiry Details" bordered size="small" column={2}>
            <Descriptions.Item label="Name">{selectedInquiry.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedInquiry.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selectedInquiry.contact_number}</Descriptions.Item>
            <Descriptions.Item label="Date">{dayjs(selectedInquiry.inquiry_date).format('DD MMM YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>
              <Tag color={getStatusColor(selectedInquiry.status)} icon={getStatusIcon(selectedInquiry.status)}>
                {selectedInquiry.status.replace('_', ' ')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Original Message */}
          <Card size="small" title="Your Message" style={{ marginBottom: '15px' }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedInquiry.message}</Paragraph>
          </Card>

          {/* Admin Response */}
          {selectedInquiry.admin_response && (
            <Card 
              size="small" 
              title={<Space><MessageOutlined />Admin Response</Space>}
              style={{ background: 'var(--success-light)' }}
            >
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedInquiry.admin_response}</Paragraph>
            </Card>
          )}

          {!selectedInquiry.admin_response && (
            <Card 
              size="small" 
              title="Status"
              style={{ background: 'var(--warning-light)' }}
            >
              <Text type="secondary">
                Your inquiry is being reviewed by our team. We'll respond as soon as possible.
              </Text>
            </Card>
          )}
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Title level={3}>Please log in to view your inquiries</Title>
        <Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: 'var(--spacing-3xl) 0' }}>
      <div className="container-xl" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--spacing-xl)' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '30px' }}
        >
          <Title level={2} style={{ marginBottom: '10px' }}>My Inquiries</Title>
          <p style={{ color: 'var(--text-secondary)' }}>Track your inquiries and admin responses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card" bodyStyle={{ padding: '0' }}>
            <Table
              columns={columns}
              dataSource={inquiries}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="No inquiries found" /> }}
            />
          </Card>
        </motion.div>

        {renderDetailModal()}
      </div>
    </div>
  );
};

export default MyInquiries;