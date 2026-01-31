import jsPDF from "jspdf";
// Import autoTable plugin
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Rate,
  Alert,
  Typography,
  Tabs,
  Empty,
  Spin,
  Input,
  message
} from "antd";
import {
  CalendarOutlined,
  DeleteOutlined,
  StarOutlined,
  EyeOutlined,
  FilePdfFilled
} from "@ant-design/icons";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import { useUser } from "../../context/userContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [cancelForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  // State
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refundInfo, setRefundInfo] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const statusColors = {
    CONFIRMED: 'green',
    PENDING: 'orange',
    CANCELLED: 'red',
    COMPLETED: 'blue',
    REFUND_PENDING: 'purple',
    CANCELLED_REFUNDED: 'cyan',
    CANCELLED_NOT_REFUNDED: 'red'
  };
  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchInquiries();
    } else {
      // If user is not authenticated, set empty arrays
      setBookings([]);
      setInquiries([]);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(endpoints.GET_BOOKINGS);
      const bookingsData = res.data?.data || res.data?.results || res.data || [];
      
      // Ensure each booking has required fields with defaults
      const processedBookings = bookingsData.map(booking => ({
        ...booking,
        totalAmount: booking.totalAmount || booking.total_price || 0,
        tourName: booking.tourName || booking.tour_name || booking.tour?.name || 'Unknown Tour',
        startDate: booking.startDate || booking.travel_date || booking.created_at,
        status: booking.status || 'PENDING'
      }));
      
      setBookings(processedBookings);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      message.error("Failed to load bookings");
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await apiClient.get(endpoints.GET_INQUIRIES);
      setInquiries(res.data?.data || res.data?.results || res.data || []);
    } catch (error) {
      console.error("Failed to fetch inquiries", error);
      if (error.response?.status === 403) {
        console.log("User doesn't have permission to view inquiries");
        setInquiries([]); // Set empty array for 403 errors
      }
    }
  };

  const handleCancelBooking = async (values) => {
    try {
      setCancelLoading(true);
      const response = await apiClient.post(endpoints.CANCEL_BOOKING(selectedBooking.id), values);
      
      // Show detailed refund information
      const refundData = response.data?.data?.refund_info;
      if (refundData) {
        if (refundData.refund_amount > 0) {
          message.success(`Booking cancelled successfully. Refund of ₹${refundData.refund_amount.toFixed(2)} (${refundData.refund_percentage.toFixed(0)}%) will be processed.`);
        } else {
          message.info(`Booking cancelled. ${refundData.reason}`);
        }
      } else {
        message.success("Booking cancelled successfully");
      }
      
      setModalVisible(false);
      setRefundInfo(null);
      fetchBookings();
    } catch (error) {
      console.error("Failed to cancel booking", error);
      message.error("Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };

  const fetchRefundPolicy = async (bookingId) => {
    try {
      setRefundLoading(true);
      const response = await apiClient.get(`${endpoints.GET_BOOKINGS}${bookingId}/refund_policy/`);
      setRefundInfo(response.data?.data);
    } catch (error) {
      console.error("Failed to fetch refund policy", error);
      setRefundInfo(null);
    } finally {
      setRefundLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
    fetchRefundPolicy(booking.id);
  };

  const handleAddReview = async (values) => {
    try {
      await apiClient.post(endpoints.ADD_REVIEW, {
        ...values,
        tour: selectedBooking.tour,
        booking: selectedBooking.id
      });
      message.success("Review added successfully");
      setReviewModalVisible(false);
      fetchBookings();
    } catch (error) {
      console.error("Failed to add review", error);
      message.error("Failed to add review");
    }
  };


const handleDownloadInvoice = async (booking) => {
  try {
    // First, try to fetch the actual invoice from backend
    let invoiceData = null;
    try {
      const invoiceResponse = await apiClient.get(`${endpoints.GET_INVOICES}?booking=${booking.id}`);
      const invoices = invoiceResponse.data?.data || invoiceResponse.data?.results || [];
      invoiceData = invoices.find(inv => inv.booking === booking.id) || invoices[0];
    } catch (error) {
      console.warn("Could not fetch invoice from backend, generating client-side:", error);
    }

    const doc = new jsPDF();

    /* ------------------ CONFIG ------------------ */
    const primaryColor = [220, 20, 60]; // Brand color
    const companyName = "Rima Tours & Travels";
    const companyAddress = "MG Road, Kochi, Kerala, India";
    const companyPhone = "+91 98765 43210";
    const companyEmail = "support@rimatours.com";

    // Use backend invoice data if available, otherwise generate
    const invoiceNumber = invoiceData?.invoice_number || `INV-${new Date().getFullYear()}-${String(booking.id).padStart(4, "0")}`;
    const invoiceDate = invoiceData?.issued_date ? new Date(invoiceData.issued_date).toLocaleDateString() : new Date().toLocaleDateString();

    // Use backend amounts if available, otherwise calculate
    let totalAmount, taxAmount, finalAmount;
    
    if (invoiceData) {
      // Use backend invoice data (already properly calculated)
      totalAmount = parseFloat(invoiceData.amount || 0);
      taxAmount = parseFloat(invoiceData.tax_amount || 0);
      finalAmount = parseFloat(invoiceData.total_amount || 0);
    } else {
      // Fallback to client-side calculation with proper rounding
      totalAmount = parseFloat(booking.totalAmount || booking.total_price || 0);
      taxAmount = Math.round(totalAmount * 0.05 * 100) / 100;
      finalAmount = Math.round((totalAmount + taxAmount) * 100) / 100;
    }

    /* ------------------ HEADER ------------------ */

    // Invoice Title
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("INVOICE", 150, 20, { align: "right" });

    // Company Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(companyAddress, 20, 26);
    doc.text(`Phone: ${companyPhone}`, 20, 31);
    doc.text(`Email: ${companyEmail}`, 20, 36);

    // Invoice meta
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoiceNumber}`, 150, 30, { align: "right" });
    doc.text(`Date: ${invoiceDate}`, 150, 35, { align: "right" });

    /* ------------------ BILL TO ------------------ */
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(user?.username || "Customer", 20, 61);
    doc.text(user?.email || "", 20, 66);

    /* ------------------ TABLE ------------------ */

    autoTable(doc, {
      startY: 75,
      head: [["Description", "Amount"]],
      body: [
        [`Tour Package: ${booking?.tourName || booking?.tour_name || "N/A"}`, `Rs. ${totalAmount.toFixed(2)}`],
        ["GST (5%)", `Rs. ${taxAmount.toFixed(2)}`],
        ["Grand Total", `Rs. ${finalAmount.toFixed(2)}`]
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 60, halign: "right" }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    /* ------------------ FOOTER ------------------ */

    doc.setFontSize(10);
    doc.text(
      "Thank you for choosing Rima Tours & Travels. We wish you a pleasant journey!",
      105,
      finalY,
      { align: "center" }
    );

    // Signature line
    doc.line(140, finalY + 25, 190, finalY + 25);
    doc.text("Authorized Signature", 165, finalY + 30, { align: "center" });

    /* ------------------ SAVE ------------------ */
    doc.save(`Invoice_${booking.id}.pdf`);
    message.success("Invoice downloaded successfully!");
  } catch (error) {
    console.error("Error generating invoice:", error);
    message.error("Failed to generate invoice. Please try again.");
  }
};


  const columns = [
    // ... (keep previous columns)
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
      render: (amount, record) => {
        const displayAmount = amount || record.total_price || 0;
        return (
          <Text strong style={{ color: '#52c41a' }}>
            ₹{parseFloat(displayAmount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const labels = {
          REFUND_PENDING: "REFUND PENDING",
          CANCELLED_REFUNDED: "CANCELLED & REFUNDED",
          CANCELLED_NOT_REFUNDED: "CANCELLED & REFUND REJECTED",
        };
        return <Tag color={statusColors[status]}>{labels[status] || status}</Tag>;
      },
    },
    {
      title: "Invoice",
      key: "invoice",
      render: (_, record) => (
        <Button
          type="link"
          icon={<FilePdfFilled />}
          onClick={() => handleDownloadInvoice(record)}
          disabled={record.status === 'CANCELLED'}
        >
          Download
        </Button>
      )
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
              onClick={() => handleCancelClick(record)}
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

  const inquiryColumns = [
    { title: 'Subject', dataIndex: 'subject', key: 'subject', render: text => <Text strong>{text || 'General Inquiry'}</Text> },
    { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: 'Response', dataIndex: 'admin_response', key: 'admin_response', render: text => text ? <Text type="success">{text}</Text> : <Tag color="orange">Pending</Tag> },
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: date => new Date(date).toLocaleDateString() }
  ];

  if (loading) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;

  if (!user) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Title level={3}>Please log in to view your bookings</Title>
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
                {
                  key: "inquiries",
                  label: "My Inquiries",
                  children: (
                    <Table
                      columns={inquiryColumns}
                      dataSource={inquiries}
                      rowKey="id"
                      pagination={{ pageSize: 8 }}
                      locale={{ emptyText: <Empty description="No inquiries found" /> }}
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
        onCancel={() => {
          setModalVisible(false);
          setRefundInfo(null);
        }}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: '20px' }}>
          <p>Are you sure you want to cancel your booking for <strong>{selectedBooking?.tourName}</strong>?</p>
          
          {refundLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="small" />
              <span style={{ marginLeft: '10px' }}>Loading refund policy...</span>
            </div>
          ) : refundInfo ? (
            <Alert
              message="Refund Policy"
              description={
                <div>
                  <p><strong>Refund Amount:</strong> ₹{refundInfo.refund_amount?.toFixed(2)} ({refundInfo.refund_percentage?.toFixed(0)}% of total)</p>
                  <p><strong>Policy:</strong> {refundInfo.reason}</p>
                  {refundInfo.refund_amount > 0 ? (
                    <p style={{ color: '#52c41a', fontWeight: 'bold' }}>✓ You are eligible for a refund</p>
                  ) : (
                    <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>✗ No refund available</p>
                  )}
                </div>
              }
              type={refundInfo.can_get_refund ? "success" : "warning"}
              showIcon
            />
          ) : (
            <Alert 
              message="Refund Policy" 
              description="Unable to load refund policy information" 
              type="error" 
              showIcon 
            />
          )}
        </div>

        <Form form={cancelForm} layout="vertical" onFinish={handleCancelBooking}>
          <Form.Item
            name="cancellation_reason"
            label="Reason for Cancellation"
            rules={[{ required: true, message: 'Please provide a reason for cancellation' }]}
          >
            <TextArea rows={4} placeholder="Please tell us why you are cancelling..." />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setModalVisible(false);
              setRefundInfo(null);
            }}>Keep Booking</Button>
            <Button type="primary" danger htmlType="submit" loading={cancelLoading}>
              Confirm Cancellation
            </Button>
          </Space>
        </Form>
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
    </div >
  );
};

export default MyBookings;
