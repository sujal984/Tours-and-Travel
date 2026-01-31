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
  Form,
  Input,
  Descriptions
} from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const InquiriesList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInquiries();
  }, []);

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

  const handleAdminResponse = async (values) => {
    try {
      setResponseLoading(true);
      await apiClient.post(endpoints.ADMIN_RESPOND_INQUIRY(selectedInquiry.id), {
        admin_response: values.admin_response
      });
      
      message.success("Response sent successfully!");
      form.resetFields();
      setModalVisible(false);
      fetchInquiries(); // Refresh the list
    } catch (error) {
      console.error("Error sending response:", error);
      message.error("Failed to send response. Please try again.");
    } finally {
      setResponseLoading(false);
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text copyable={{ text: text }} style={{ color: 'var(--primary-color)' }}>#{text}</Text>,
    },
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>{record.email}</Text>
        </div>
      )
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
        return <Text>{subject.length > 40 ? subject.substring(0, 40) + '...' : subject}</Text>;
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
      title: "Response",
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
            form.setFieldsValue({ admin_response: record.admin_response || '' });
          }}
        >
          {record.admin_response ? 'View/Edit' : 'Respond'}
        </Button>
      ),
    },
  ];

  const renderDetailModal = () => {
    if (!selectedInquiry) return null;

    return (
      <Modal
        title={`Inquiry #${selectedInquiry.id} - ${selectedInquiry.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Customer Details */}
          <Descriptions title="Customer Information" bordered size="small" column={2}>
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

          {/* Customer Message */}
          <Card size="small" title="Customer Message" style={{ marginBottom: '20px' }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedInquiry.message}</Paragraph>
          </Card>

          {/* Admin Response Form */}
          <Card size="small" title="Admin Response">
            <Form
              form={form}
              onFinish={handleAdminResponse}
              layout="vertical"
            >
              <Form.Item
                name="admin_response"
                label="Your Response"
                rules={[{ required: true, message: 'Please enter your response' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Enter your response to the customer..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={responseLoading}
                    icon={<SendOutlined />}
                  >
                    {selectedInquiry.admin_response ? 'Update Response' : 'Send Response'}
                  </Button>
                  <Button onClick={() => setModalVisible(false)}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* Previous Response (if exists) */}
          {selectedInquiry.admin_response && (
            <>
              <Divider />
              <Card 
                size="small" 
                title="Current Response"
                style={{ background: 'var(--success-light)' }}
              >
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedInquiry.admin_response}</Paragraph>
                <Text type="secondary">
                  Last updated: {dayjs(selectedInquiry.updated_at).format('DD MMM YYYY, HH:mm')}
                </Text>
              </Card>
            </>
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

  return (
    <div style={{ padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <Title level={2}>Customer Inquiries</Title>
        <Text type="secondary">Manage and respond to customer inquiries</Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
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
  );
};

export default InquiriesList;