import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Button,
  Tag,
  Table,
  Modal,
  message,
  Empty,
  Spin,
  Space,
  Rate,
  Form,
  Input,
  Typography,
  Alert,
} from "antd";
import {
  DeleteOutlined,
  FilePdfFilled,
  StarOutlined,
  EyeOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useUser } from "../../context/userContext";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Title, Text } = Typography;

const MyBookings = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get(endpoints.GET_BOOKINGS);
      const data = res.data?.data || res.data?.results || res.data || [];

      const mapped = data.map((b) => ({
        id: b.id,
        tourName: b.tour?.name || b.tour_name || "Tour Package",
        startDate: b.travel_date || b.booking_date || b.created_at,
        totalAmount: b.total_price || 0,
        status: b.status?.toUpperCase() || "PENDING",
        passengers: b.travelers_count || 1,
        can_review: b.can_review ?? (b.status?.toUpperCase() === "COMPLETED"),
        can_cancel: b.can_cancel ?? ["PENDING", "CONFIRMED"].includes(b.status?.toUpperCase()),
        tour: b.tour?.id || b.tour,
      }));

      setBookings(mapped);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      message.error("Failed to fetch bookings");
      // Keep empty if failed
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelLoading(true);
    try {
      await apiClient.post(endpoints.CANCEL_BOOKING(bookingId));
      message.success("Booking cancelled successfully!");
      setModalVisible(false);
      fetchBookings();
    } catch (error) {
      message.error("Failed to cancel booking. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleAddReview = async (values) => {
    try {
      await apiClient.post(`${endpoints.GET_BOOKING_DETAIL(selectedBooking.id)}/add_review/`, values);
      message.success("Review submitted successfully!");
      setReviewModalVisible(false);
      reviewForm.resetFields();
      fetchBookings();
    } catch (error) {
      message.error("Failed to submit review.");
    }
  };

  const statusColors = {
    CONFIRMED: "success",
    PENDING: "warning",
    COMPLETED: "processing",
    CANCELLED: "error",
  };

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text copyable={{ text: text }} style={{ color: 'var(--primary-color)' }}>{text.substring(0, 8)}...</Text>,
    },
    {
      title: "Tour",
      dataIndex: "tourName",
      key: "tourName",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: 'var(--text-tertiary)' }} />
          {new Date(date).toLocaleDateString()}
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <Text>₹{amount.toLocaleString()}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          {record.can_cancel && (
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => { setSelectedBooking(record); setModalVisible(true); }}
            >
              Cancel
            </Button>
          )}
          {(record.can_review || record.status === 'COMPLETED') && (
            <Button
              type="primary"
              size="small"
              icon={<StarOutlined />}
              style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
              onClick={() => { setSelectedBooking(record); setReviewModalVisible(true); }}
            >
              Review
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/tours/${record.tour}`)}
          >
            View Tour
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: 'var(--spacing-3xl) 0' }}>
      <div className="container-xl" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--spacing-xl)' }}>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '30px' }}
        >
          <Title level={2} style={{ marginBottom: '10px' }}>My Bookings</Title>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your trips and transactions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card" bodyStyle={{ padding: '0' }}>
            <Tabs
              defaultActiveKey="all"
              tabBarStyle={{ padding: '0 20px', marginBottom: '0' }}
              items={[
                {
                  key: "all",
                  label: `All Bookings`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={bookings}
                      rowKey="id"
                      pagination={{ pageSize: 8 }}
                      locale={{ emptyText: <Empty description="No bookings found" /> }}
                    />
                  ),
                },
                {
                  key: "upcoming",
                  label: "Upcoming",
                  children: (
                    <Table
                      columns={columns}
                      dataSource={bookings.filter(b => new Date(b.startDate) > new Date() && b.status !== 'CANCELLED')}
                      rowKey="id"
                      pagination={{ pageSize: 8 }}
                      locale={{ emptyText: <Empty description="No upcoming trips" /> }}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </motion.div>

      </div>

      <Modal
        title="Cancel Booking"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>Keep Booking</Button>,
          <Button key="submit" type="primary" danger loading={cancelLoading} onClick={() => handleCancelBooking(selectedBooking?.id)}>
            Confirm Cancellation
          </Button>,
        ]}
      >
        <p>Are you sure you want to cancel your booking for <strong>{selectedBooking?.tourName}</strong>?</p>
        <Alert  message="Refund Policy: Cancellations made 24 hours prior are eligible for full refund." type="info" showIcon />
      </Modal>

      <Modal
        title="Write a Review"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleAddReview}>
          <Form.Item name="rating" label="Rating" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Review" rules={[{ required: true, min: 10 }]}>
            <TextArea rows={4} placeholder="How was your experience?" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Submit Review</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default MyBookings;
