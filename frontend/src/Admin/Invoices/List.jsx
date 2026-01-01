import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  message,
  Input,
  Select,
  Tag,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_INVOICES);
      const invoicesData = response.data?.data || response.data?.results || [];
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      message.error('Failed to load invoices');
      // Set dummy data with better structure
      setInvoices([
        {
          id: 1,
          booking: {
            id: 1,
            user: { username: 'john_doe', email: 'john@example.com' },
            tour: { name: 'Sikkim Adventure Tour' }
          },
          invoice_number: 'INV-2024-001',
          amount: 48999,
          status: 'PAID',
          due_date: '2024-02-15',
          created_date: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          booking: {
            id: 2,
            user: { username: 'jane_smith', email: 'jane@example.com' },
            tour: { name: 'Vietnam Discovery' }
          },
          invoice_number: 'INV-2024-002',
          amount: 104999,
          status: 'UNPAID',
          due_date: '2024-03-01',
          created_date: '2024-01-20T14:20:00Z',
        },
        {
          id: 3,
          booking: {
            id: 3,
            user: { username: 'mike_wilson', email: 'mike@example.com' },
            tour: { name: 'Goa Beach Holiday' }
          },
          invoice_number: 'INV-2024-003',
          amount: 25000,
          status: 'PAID',
          due_date: '2024-02-20',
          created_date: '2024-01-22T09:15:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoiceId) => {
    // TODO: Implement invoice download
    message.info('Invoice download feature will be implemented');
  };

  const handleView = (invoiceId) => {
    // TODO: Implement invoice view
    message.info('Invoice view feature will be implemented');
  };

  const getStatusColor = (status) => {
    const colors = {
      PAID: 'green',
      UNPAID: 'orange',
      CANCELLED: 'red',
    };
    return colors[status] || 'default';
  };

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter((invoice) => {
    const matchesSearch =
      invoice.booking?.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.booking?.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.booking?.tour?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.id?.toString().includes(searchText);
    return matchesSearch;
  }) : [];

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      width: 150,
      render: (number) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {number || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.booking?.user?.username || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.booking?.user?.email || 'N/A'}
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
            {record.booking?.tour?.name || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Booking #{record.booking?.id}
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
          ₹{amount?.toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
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
        { text: 'Paid', value: 'PAID' },
        { text: 'Unpaid', value: 'UNPAID' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      sorter: (a, b) => new Date(a.due_date) - new Date(b.due_date),
    },
    {
      title: 'Created Date',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      sorter: (a, b) => new Date(a.created_date) - new Date(b.created_date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id)}
          >
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Invoices Management</h2>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search invoices..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} invoices`,
          }}
        />
      </Card>
    </div>
  );
};

export default InvoicesList;