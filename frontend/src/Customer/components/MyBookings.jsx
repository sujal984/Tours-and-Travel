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
} from "antd";
import { 
  DeleteOutlined, 
  FilePdfFilled, 
  StarOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { useUser } from "../../context/userContext";

import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

import "./MyBookings.css";

const { TextArea } = Input;
const { Title, Text } = Typography;
const MyBookings = () => {
  const { user } = useUser();
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
      console.log('Raw bookings API Response:', res.data); // Debug log
      console.log('Extracted bookings data:', data); // Debug log
      
      const mapped = data.map((b) => ({
        id: b.id,
        tourName: b.tour?.name || b.tour_name || "Tour Package", // Backend uses 'name' for tour
        startDate: b.travel_date || b.booking_date || b.created_at, // Use travel_date first
        endDate: b.travel_date || b.booking_date || b.created_at, // Use travel_date if available
        totalAmount: b.total_price || 0,
        status: b.status?.toUpperCase() || 'PENDING', // Ensure uppercase for consistency
        passengers: b.travelers_count || 1,
        bookingDate: b.created_at,
        tour_details: b.tour,
        can_review: b.can_review !== undefined ? b.can_review : (b.status?.toUpperCase() === 'COMPLETED'), // Force true for completed bookings
        can_cancel: b.can_cancel !== undefined ? b.can_cancel : ['PENDING', 'CONFIRMED'].includes(b.status?.toUpperCase()),
        tour: b.tour?.id, // Add tour ID for navigation
      }));
      
      console.log('Mapped bookings:', mapped); // Debug log
      setBookings(mapped);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      message.error("Failed to fetch bookings");
      // Set dummy data for development with proper review conditions
      setBookings([
        {
          id: "2ef7657a-70a4-46e4-9fb5-a3ff8c4ed6d8",
          tourName: "Sikkim Adventure Tour",
          startDate: "2024-02-15",
          endDate: "2024-02-22",
          totalAmount: 5000000,
          status: "COMPLETED", // Completed status
          passengers: 1,
          bookingDate: "2024-01-15",
          tour_details: { name: "Sikkim Adventure Tour" },
          can_review: true, // Force enable review for testing
          can_cancel: false,
          tour: "f2f100d1-f30e-408f-94db-0e9f0702cca6"
        },
        {
          id: "dd91ad27-b3a0-43a4-ba36-6f81b6ae8e15",
          tourName: "Vietnam Discovery",
          startDate: "2024-03-10",
          endDate: "2024-03-19",
          totalAmount: 5000000,
          status: "COMPLETED", // Also completed for testing
          passengers: 1,
          bookingDate: "2024-01-20",
          tour_details: { name: "Vietnam Discovery" },
          can_review: true, // Force enable review for testing
          can_cancel: false,
          tour: "f2f100d1-f30e-408f-94db-0e9f0702cca6"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelLoading(true);
    try {
      await apiClient.post(`${endpoints.GET_BOOKING_DETAIL(bookingId)}/cancel/`);
      message.success("Booking cancelled successfully!");
      setModalVisible(false);
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error("Cancellation failed", error);
      message.error("Failed to cancel booking. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleAddReview = async (values) => {
    try {
      await apiClient.post(`${endpoints.GET_BOOKING_DETAIL(selectedBooking.id)}/add_review/`, values);
      message.success("Review submitted successfully! It will be visible after verification.");
      setReviewModalVisible(false);
      reviewForm.resetFields();
      fetchBookings(); // Refresh to update review status
    } catch (error) {
      console.error("Review submission failed", error);
      message.error("Failed to submit review. Please try again.");
    }
  };

  const handleDownloadInvoice = (bookingId) => {
    // TODO: Implement invoice download
    message.info("Invoice download functionality coming soon!");
  };

  const getStatusColor = (status) => {
    const colors = {
      CONFIRMED: "green",
      PENDING: "orange",
      COMPLETED: "blue",
      CANCELLED: "red",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      CONFIRMED: "Confirmed",
      PENDING: "Pending",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#667eea" }}>{text}</span>
      ),
    },
    {
      title: "Tour Name",
      dataIndex: "tourName",
      key: "tourName",
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 150,
      render: (date, record) => (
        <span>
          {new Date(date).toLocaleDateString()} -{" "}
          {new Date(record.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Passengers",
      dataIndex: "passengers",
      key: "passengers",
      width: 100,
      render: (passengers) => <span>{passengers} Person(s)</span>,
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      render: (amount) => (
        <span style={{ fontWeight: 600 }}>₹{amount.toLocaleString()}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 300, // Increased width to accommodate all buttons
      fixed: 'right', // Fix to right side
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            icon={<FilePdfFilled />}
            onClick={() => handleDownloadInvoice(record.id)}
          >
            Invoice
          </Button>
          {record.can_cancel && (
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedBooking(record);
                setModalVisible(true);
              }}
            >
              Cancel
            </Button>
          )}
          {record.can_review && (
            <Button
              type="primary"
              size="small"
              icon={<StarOutlined />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => {
                console.log('Review button clicked for:', record);
                setSelectedBooking(record);
                setReviewModalVisible(true);
              }}
            >
              Review
            </Button>
          )}
          {/* Always show review button for COMPLETED bookings */}
          {!record.can_review && record.status === 'COMPLETED' && (
            <Button
              type="primary"
              size="small"
              icon={<StarOutlined />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => {
                console.log('Fallback review button clicked for:', record);
                setSelectedBooking(record);
                setReviewModalVisible(true);
              }}
            >
              Review
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/tours/${record.tour}`, '_blank')}
          >
            View Tour
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading bookings..." />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.startDate) > new Date() && b.status !== "cancelled"
  );

  const pastBookings = bookings.filter(
    (b) => new Date(b.startDate) <= new Date() || b.status === "cancelled"
  );

  return (


    <div className="mybookings-container">
      <div className="mybookings-header">
        <h1>My Bookings</h1>
        <p>View and manage all your tour bookings</p>
      </div>

      {bookings.length > 0 ? (
        <div>
          {/* Debug info */}
          <div style={{ marginBottom: 16, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
            <strong>Debug Info:</strong> Found {bookings.length} bookings
            {bookings.map(b => (
              <div key={b.id} style={{ fontSize: '12px', marginTop: 4 }}>
                Booking {b.id}: Status={b.status}, can_review={b.can_review?.toString()}, can_cancel={b.can_cancel?.toString()}
              </div>
            ))}
          </div>
          
          <Tabs
            defaultActiveKey="all"
            items={[
              {
                key: "all",
                label: `All (${bookings.length})`,
                children: (
                  <Card >
                    <Table
                      columns={columns}
                      dataSource={bookings}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                      scroll={{ x: 1200 }} // Increased scroll width
                    />
                  </Card>
                )
              },
              {
                key: "upcoming",
                label: "Upcoming",
                children: (
                  <Card >
                    <Table
                      columns={columns}
                      dataSource={upcomingBookings}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                      scroll={{ x: 1200 }} // Increased scroll width
                      locale={{ emptyText: <Empty description="No upcoming bookings" /> }}
                    />
                  </Card>
                )
              }
            ]}
          />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <Empty description="You haven't booked any tours yet" />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => window.location.href = "/tours"}>
            Browse Tours
          </Button>
        </div>
      )}

      {/* Cancel Booking Modal */}
      <Modal
        title="Cancel Booking"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Keep Booking
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={cancelLoading}
            onClick={() => handleCancelBooking(selectedBooking?.id)}
          >
            Confirm Cancellation
          </Button>,
        ]}
      >
        <div className="cancel-modal-content">
          <h3>Are you sure you want to cancel this booking?</h3>
          {selectedBooking && (
            <>
              <p>
                <strong>Booking ID:</strong> {selectedBooking.id}
              </p>
              <p>
                <strong>Tour:</strong> {selectedBooking.tourName}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedBooking.totalAmount}
              </p>
              <p className="warning">
                💡 Note: Refund will be processed according to our cancellation
                policy. Please check your email for refund details.
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Write a Review"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedBooking && (
          <div>
            <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                {selectedBooking.tourName}
              </Title>
              <Text type="secondary">
                Booking Date: {new Date(selectedBooking.startDate).toLocaleDateString()}
              </Text>
            </div>

            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleAddReview}
            >
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: 'Please provide a rating' }]}
              >
                <Rate allowHalf />
              </Form.Item>

              <Form.Item
                name="comment"
                label="Your Review"
                rules={[
                  { required: true, message: 'Please write your review' },
                  { min: 10, message: 'Review must be at least 10 characters long' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Share your experience with this tour..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={() => {
                    setReviewModalVisible(false);
                    reviewForm.resetFields();
                  }}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Submit Review
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default MyBookings
