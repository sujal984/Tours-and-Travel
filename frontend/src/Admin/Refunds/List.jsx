import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const RefundsList = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const res = await apiClient.get(endpoints.GET_REFUNDS);
      const data = res.data?.data || res.data?.results || res.data || [];
      setRefunds(data);
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
      // Set dummy data for development
      setRefunds([
        {
          id: 1,
          amount: 25000,
          reason: "Tour cancelled due to weather conditions",
          status: "PENDING",
          booking_details: {
            id: "booking-1",
            tour_name: "Sikkim Adventure Tour",
            user_email: "customer@example.com",
            travel_date: "2024-02-15"
          },
          payment_details: {
            id: "payment-1",
            amount: 50000,
            transaction_id: "TXN123456789"
          },
          created_at: "2024-01-15T10:30:00Z",
          processed_by_name: null,
          processed_at: null,
          admin_notes: ""
        },
        {
          id: 2,
          amount: 45000,
          reason: "Medical emergency - unable to travel",
          status: "APPROVED",
          booking_details: {
            id: "booking-2",
            tour_name: "Vietnam Discovery",
            user_email: "user@example.com",
            travel_date: "2024-03-10"
          },
          payment_details: {
            id: "payment-2",
            amount: 90000,
            transaction_id: "TXN987654321"
          },
          created_at: "2024-01-20T14:15:00Z",
          processed_by_name: "admin@example.com",
          processed_at: "2024-01-21T09:00:00Z",
          admin_notes: "Valid medical certificate provided"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundAction = async (refund, action) => {
    setSelectedRefund(refund);
    setActionType(action);

    if (action === 'approve' || action === 'reject') {
      setModalVisible(true);
    } else if (action === 'process') {
      confirm({
        title: 'Process Refund',
        icon: <ExclamationCircleOutlined />,
        content: `Are you sure you want to process refund of ₹${refund.amount.toLocaleString()} for ${refund.booking_details.tour_name}?`,
        onOk: () => processRefund(refund.id),
      });
    }
  };

  const processRefund = async (refundId) => {
    setActionLoading(true);
    try {
      const baseUrl = endpoints.GET_REFUND_DETAIL(refundId);
      const actionUrl = baseUrl.endsWith('/') ? `${baseUrl}process/` : `${baseUrl}/process/`;
      await apiClient.post(actionUrl);
      message.success("Refund processed successfully!");
      fetchRefunds();
    } catch (error) {
      console.error("Failed to process refund:", error);
      message.error("Failed to process refund");
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalSubmit = async (values) => {
    setActionLoading(true);
    try {
      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      // Robust URL construction
      const detailUrl = endpoints.GET_REFUND_DETAIL(selectedRefund.id);
      const actionUrl = detailUrl.endsWith('/') ? `${detailUrl}${endpoint}/` : `${detailUrl}/${endpoint}/`;

      console.log("Submitting Refund Action to:", actionUrl);
      await apiClient.post(actionUrl, values);

      message.success(`Refund ${actionType}d successfully!`);
      setModalVisible(false);
      form.resetFields();
      fetchRefunds();
    } catch (error) {
      console.error(`Failed to ${actionType} refund:`, error);
      message.error(`Failed to ${actionType} refund`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      APPROVED: 'blue',
      PROCESSED: 'green',
      REJECTED: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pending Review',
      APPROVED: 'Approved',
      PROCESSED: 'Processed',
      REJECTED: 'Rejected',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: "Refund ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Tour",
      dataIndex: ["booking_details", "tour_name"],
      key: "tour_name",
      ellipsis: true,
    },
    {
      title: "Customer",
      dataIndex: ["booking_details", "user_email"],
      key: "customer_email",
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Request Date",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleRefundAction(record, 'approve')}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleRefundAction(record, 'reject')}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'APPROVED' && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleRefundAction(record, 'process')}
            >
              Process
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRefund(record);
              setModalVisible(true);
              setActionType('view');
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === 'PENDING').length,
    approved: refunds.filter(r => r.status === 'APPROVED').length,
    processed: refunds.filter(r => r.status === 'PROCESSED').length,
    totalAmount: refunds.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
  };

  return (
    <div className="refunds-list">
      <div className="page-header">
        <h1>Refund Management</h1>
        <p>Manage customer refund requests and process refunds</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={stats.totalAmount}
              formatter={(value) => `₹${value.toLocaleString()}`}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Refunds Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={refunds}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} refunds`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Action Modal */}
      <Modal
        title={
          actionType === 'approve' ? 'Approve Refund' :
            actionType === 'reject' ? 'Reject Refund' :
              'Refund Details'
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={actionType === 'view' ? [
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ] : [
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={actionLoading}
            onClick={() => form.submit()}
            danger={actionType === 'reject'}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'} Refund
          </Button>
        ]}
        width={600}
      >
        {selectedRefund && (
          <div>
            <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <strong>Tour:</strong> {selectedRefund.booking_details?.tour_name}
                </Col>
                <Col span={12}>
                  <strong>Customer:</strong> {selectedRefund.booking_details?.user_email}
                </Col>
                <Col span={12}>
                  <strong>Amount:</strong> ₹{selectedRefund.amount?.toLocaleString()}
                </Col>
                <Col span={12}>
                  <strong>Status:</strong> <Tag color={getStatusColor(selectedRefund.status)}>{getStatusText(selectedRefund.status)}</Tag>
                </Col>
                <Col span={24}>
                  <strong>Reason:</strong> {selectedRefund.reason}
                </Col>
              </Row>
            </div>

            {actionType !== 'view' && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleModalSubmit}
              >
                <Form.Item
                  name="admin_notes"
                  label="Admin Notes"
                  rules={[
                    { required: true, message: 'Please provide admin notes' },
                    { min: 10, message: 'Notes must be at least 10 characters' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder={
                      actionType === 'approve'
                        ? "Provide reason for approval and any additional notes..."
                        : "Provide reason for rejection..."
                    }
                  />
                </Form.Item>
              </Form>
            )}

            {actionType === 'view' && selectedRefund.admin_notes && (
              <div>
                <strong>Admin Notes:</strong>
                <div style={{ marginTop: 8, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
                  {selectedRefund.admin_notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RefundsList;