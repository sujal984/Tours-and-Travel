import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Tag,
  Modal,
  Descriptions,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_BOOKINGS);
      console.log(response);
      const bookingsData = response.data?.data || response.data?.results || [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to load bookings");
      // Set dummy data
      setBookings([
        {
          id: 1,
          user: { username: "john_doe", email: "john@example.com" },
          tour: { title: "Sikkim Adventure", duration_days: 5 },
          booking_date: "2024-01-15",
          travel_date: "2024-02-15",
          no_people: 2,
          total_price: 97998,
          status: "confirmed",
          payment_status: "paid",
        },
        {
          id: 2,
          user: { username: "jane_smith", email: "jane@example.com" },
          tour: { title: "Vietnam Discovery", duration_days: 7 },
          booking_date: "2024-01-20",
          travel_date: "2024-03-10",
          no_people: 4,
          total_price: 209996,
          status: "pending",
          payment_status: "pending",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    Modal.confirm({
      title: `Confirm Status Change`,
      content: `Are you sure you want to change this booking status to ${newStatus}?`,
      okText: 'Yes, Change Status',
      cancelText: 'Cancel',
      onOk: async () => {
        setUpdatingBookingId(bookingId);
        try {
          await apiClient.patch(endpoints.GET_BOOKING_DETAIL(bookingId), {
            status: newStatus,
          });
          message.success(`Booking ${newStatus.toLowerCase()} successfully`);
          fetchBookings();
        } catch (error) {
          console.error("Error updating booking status:", error);
          message.error("Failed to update booking status");
        } finally {
          setUpdatingBookingId(null);
        }
      }
    });
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const filteredBookings = Array.isArray(bookings)
    ? bookings.filter((booking) => {
        const matchesSearch =
          booking.user_details?.username
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.user_details?.email
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.user_details?.full_name
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.user?.username
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.user?.email
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.tour_details?.name
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.tour_name
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.tour?.title
            ?.toLowerCase()
            .includes(searchText.toLowerCase());
        const matchesStatus =
          filterStatus === "all" ||
          booking.status?.toUpperCase() === filterStatus.toUpperCase();
        return matchesSearch && matchesStatus;
      })
    : [];

  const getStatusColor = (status) => {
    const colors = {
      CONFIRMED: "green",
      confirmed: "green",
      PENDING: "orange", 
      pending: "orange",
      CANCELLED: "red",
      cancelled: "red",
      COMPLETED: "blue",
      completed: "blue",
    };
    return colors[status] || "default";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      success: "green",
      paid: "green",
      pending: "orange",
      failed: "red",
      refunded: "purple",
    };
    return colors[status] || "default";
  };

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>
            {record.user_details?.full_name || 
             record.user_details?.username || 
             record.user?.username || 
             'N/A'}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.user_details?.email || 
             record.user?.email || 
             'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: "Tour",
      key: "tour",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>
            {record.tour_details?.name || 
             record.tour_name || 
             record.tour?.title || 
             'N/A'}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.tour_details?.duration_days || 
             record.tour?.duration_days || 
             0} Days
          </div>
        </div>
      ),
    },
    {
      title: "Travel Date",
      dataIndex: "travel_date",
      key: "travel_date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.travel_date) - new Date(b.travel_date),
    },
    {
      title: "People",
      key: "people",
      width: 80,
      render: (_, record) => record.travelers_count || record.no_people || 0,
      sorter: (a, b) => (a.travelers_count || a.no_people || 0) - (b.travelers_count || b.no_people || 0),
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => `₹${price?.toLocaleString()}`,
      sorter: (a, b) => a.total_price - b.total_price,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
      filters: [
        { text: "Confirmed", value: "CONFIRMED" },
        { text: "Pending", value: "PENDING" },
        { text: "Cancelled", value: "CANCELLED" },
        { text: "Completed", value: "COMPLETED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Payment",
      key: "payment",
      render: (_, record) => {
        const paymentStatus = record.payment_details?.status || 'PENDING';
        return (
          <Tag color={getPaymentStatusColor(paymentStatus.toLowerCase())}>
            {paymentStatus.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showBookingDetails(record)}
          >
            View
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                loading={updatingBookingId === record.id}
                onClick={() => handleStatusUpdate(record.id, "CONFIRMED")}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Confirm
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                loading={updatingBookingId === record.id}
                onClick={() => handleStatusUpdate(record.id, "CANCELLED")}
              >
                Cancel
              </Button>
            </>
          )}
          {record.status === "CONFIRMED" && (
            <Button
              type="primary"
              size="small"
              loading={updatingBookingId === record.id}
              onClick={() => handleStatusUpdate(record.id, "COMPLETED")}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Bookings Management</h2>
        </div>

        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Search
            placeholder="Search bookings..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            value={filterStatus}
            onChange={setFilterStatus}
          >
            <Option value="all">All Status</Option>
            <Option value="CONFIRMED">Confirmed</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="CANCELLED">Cancelled</Option>
            <Option value="COMPLETED">Completed</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} bookings`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Booking Details Modal */}
      <Modal
        title={`Booking Details - #${selectedBooking?.id}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedBooking && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Customer" span={2}>
              <div>
                <strong>
                  {selectedBooking.user_details?.full_name || 
                   selectedBooking.user_details?.username || 
                   selectedBooking.user?.username || 
                   'N/A'}
                </strong>
                <br />
                <span style={{ color: "#666" }}>
                  {selectedBooking.user_details?.email || 
                   selectedBooking.user?.email || 
                   'N/A'}
                </span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Tour" span={2}>
              <div>
                <strong>
                  {selectedBooking.tour_details?.name || 
                   selectedBooking.tour_name || 
                   selectedBooking.tour?.title || 
                   'N/A'}
                </strong>
                <br />
                <span style={{ color: "#666" }}>
                  Duration: {selectedBooking.tour_details?.duration_days || 
                            selectedBooking.tour?.duration_days || 
                            0} Days
                </span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Booking Date">
              {new Date(selectedBooking.booking_date).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Travel Date">
              {new Date(selectedBooking.travel_date).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Number of People">
              {selectedBooking.travelers_count || selectedBooking.no_people || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Total Price">
              ₹{selectedBooking.total_price?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Booking Status">
              <Tag color={getStatusColor(selectedBooking.status)}>
                {selectedBooking.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Status">
              <Tag
                color={getPaymentStatusColor(
                  selectedBooking.payment_details?.status?.toLowerCase() || 'pending'
                )}
              >
                {selectedBooking.payment_details?.status?.toUpperCase() || 'PENDING'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {selectedBooking.payment_details?.payment_method || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Transaction ID" span={2}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {selectedBooking.payment_details?.transaction_id || 'N/A'}
              </span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default BookingsList;
