import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  message,
} from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../services/api";
import { endpoints } from "../../../constant/ENDPOINTS";



const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPayments: 0,
    completedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings for stats
      const bookingsRes = await apiClient.get(endpoints.GET_BOOKINGS);
      // Handle both API response formats
      const bookingsData = bookingsRes.data?.data || bookingsRes.data?.results || [];
      console.log('Bookings data:', bookingsData);

      // Fetch users for stats
      const usersRes = await apiClient.get(endpoints.GET_ALL_USERS);
      const usersData = usersRes.data?.data || usersRes.data?.results || [];

      // Fetch payments
      const paymentsRes = await apiClient.get(endpoints.GET_PAYMENTS);
      const paymentsData = paymentsRes.data?.data || paymentsRes.data?.results || [];

      // Calculate stats safely
      const completedCount = Array.isArray(bookingsData) 
        ? bookingsData.filter(b => b.status === "CONFIRMED").length 
        : 0;
        
      const totalPaymentAmount = Array.isArray(paymentsData)
        ? paymentsData.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
        : 0;

      setStats({
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalBookings: Array.isArray(bookingsData) ? bookingsData.length : 0,
        totalPayments: totalPaymentAmount,
        completedBookings: completedCount,
      });

      // Set recent bookings (first 5)
      setRecentBookings(Array.isArray(bookingsData) ? bookingsData.slice(0, 5) : []);
    } catch (err) {
      message.error("Failed to load dashboard data");
      console.error(err);
      
      // Set default stats on error
      setStats({
        totalUsers: 0,
        totalBookings: 0,
        totalPayments: 0,
        completedBookings: 0,
      });
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const bookingColumns = [
    { title: "Booking ID", dataIndex: "id", key: "id", render: (id) => `#${id.slice(0, 8)}...` },
    { title: "Customer", dataIndex: "user", key: "user", render: (userId) => `User ${userId}` },
    { title: "Tour", dataIndex: ["tour_details", "name"], key: "tour" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          CONFIRMED: "green",
          PENDING: "orange",
          CANCELLED: "red",
        };
        return <Tag color={colors[status] || "blue"}>{status}</Tag>;
      },
    },
    { title: "Total", dataIndex: "total_price", key: "total_price", render: (price) => `₹${price}` },
  ];

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookings}
              prefix={<ShoppingCartOutlined />}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Revenue"
              value={stats.totalPayments}
              prefix={<DollarOutlined />}
              precision={2}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Completed"
              value={stats.completedBookings}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#13c2c2" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="Quick Actions">
            <Space wrap>
              <Button type="primary" onClick={() => navigate('/admin/bookings')}>
                View Bookings
              </Button>
              <Button onClick={() => navigate('/admin/users')}>Manage Users</Button>
              <Button onClick={() => navigate('/admin/tours')}>Manage Tours</Button>
              <Button onClick={() => navigate('/admin/payments')}>View Payments</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Recent Bookings" loading={loading}>
            <Table
              columns={bookingColumns}
              dataSource={recentBookings}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
