import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  message,
  Tag,
  Input,
  Select,
  DatePicker,
} from 'antd';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_PAYMENTS);
      const paymentsData = response.data?.data || response.data?.results || [];
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      message.error('Failed to load payments');
      // Set dummy data with better structure
      setPayments([
        {
          id: 1,
          booking: { 
            id: 1, 
            user: { username: 'john_doe', email: 'john@example.com' },
            tour: { name: 'Sikkim Adventure Tour' }
          },
          amount: 48999,
          payment_method: 'CREDIT_CARD',
          transaction_id: 'TXN-ABC123456',
          payment_date: '2024-01-15T10:30:00Z',
          status: 'SUCCESS',
        },
        {
          id: 2,
          booking: { 
            id: 2, 
            user: { username: 'jane_smith', email: 'jane@example.com' },
            tour: { name: 'Vietnam Discovery' }
          },
          amount: 104999,
          payment_method: 'UPI',
          transaction_id: 'TXN-XYZ789012',
          payment_date: '2024-01-20T14:20:00Z',
          status: 'SUCCESS',
        },
        {
          id: 3,
          booking: { 
            id: 3, 
            user: { username: 'mike_wilson', email: 'mike@example.com' },
            tour: { name: 'Goa Beach Holiday' }
          },
          amount: 25000,
          payment_method: 'NET_BANKING',
          transaction_id: 'TXN-DEF345678',
          payment_date: '2024-01-22T09:15:00Z',
          status: 'PENDING',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SUCCESS: 'green',
      PENDING: 'orange',
      FAILED: 'red',
      REFUNDED: 'purple',
    };
    return colors[status] || 'default';
  };

  const getMethodColor = (method) => {
    const colors = {
      CREDIT_CARD: 'blue',
      DEBIT_CARD: 'cyan',
      UPI: 'green',
      NET_BANKING: 'orange',
      CASH: 'purple',
    };
    return colors[method] || 'default';
  };

  const filteredPayments = Array.isArray(payments) ? payments.filter((payment) => {
    const matchesSearch =
      payment.booking_details?.user_email?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.booking_details?.tour_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.booking?.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.booking?.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.booking?.tour?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.booking_details?.id?.toString().includes(searchText) ||
      payment.booking?.id?.toString().includes(searchText);
    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    return matchesSearch && matchesMethod;
  }) : [];

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>#PAY-{id}</span>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.booking_details?.user_email?.split('@')[0] || 
             record.booking?.user?.username || 
             'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.booking_details?.user_email || 
             record.booking?.user?.email || 
             'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Tour',
      key: 'tour',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.booking_details?.tour_name || 
             record.booking?.tour?.name || 
             'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Booking #{record.booking_details?.id || 
                      record.booking?.id || 
                      'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ₹{parseFloat(amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.amount || 0) - parseFloat(b.amount || 0),
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 140,
      render: (method) => (
        <Tag color={getMethodColor(method)}>
          {method?.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      width: 140,
      render: (txnId) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {txnId || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Payment Date',
      key: 'payment_date',
      width: 140,
      render: (_, record) => {
        // Try multiple date fields
        const date = record.processed_at || record.payment_date || record.created_at;
        if (!date) return 'N/A';
        
        return new Date(date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      sorter: (a, b) => {
        const dateA = new Date(a.processed_at || a.payment_date || a.created_at);
        const dateB = new Date(b.processed_at || b.payment_date || b.created_at);
        return dateA - dateB;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Success', value: 'SUCCESS' },
        { text: 'Pending', value: 'PENDING' },
        { text: 'Failed', value: 'FAILED' },
        { text: 'Refunded', value: 'REFUNDED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Payments Management</h2>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search payments..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Filter by method"
            style={{ width: 150 }}
            value={filterMethod}
            onChange={setFilterMethod}
          >
            <Option value="all">All Methods</Option>
            <Option value="CREDIT_CARD">Credit Card</Option>
            <Option value="DEBIT_CARD">Debit Card</Option>
            <Option value="UPI">UPI</Option>
            <Option value="NET_BANKING">Net Banking</Option>
            <Option value="CASH">Cash</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} payments`,
          }}
        />
      </Card>
    </div>
  );
};

export default PaymentsList;