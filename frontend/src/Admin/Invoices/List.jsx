import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  message,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Descriptions,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';
import InvoicesForm from './Form';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Search } = Input;
const { Option } = Select;

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewVisible, setViewVisible] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoice) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(220, 20, 60);
    doc.text('INVOICE', 105, 20, { align: 'center' });

    // Company Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Rima Tours & Travels', 14, 35);
    doc.setFontSize(10);
    doc.text('MG Road, Kochi, Kerala, India', 14, 40);
    doc.text('Phone: +91 98765 43210', 14, 45);
    doc.text('Email: support@rimatours.com', 14, 50);

    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 140, 35);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 140, 40);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 140, 45);

    // Customer Info
    doc.setFontSize(12);
    doc.text('Bill To:', 14, 65);
    doc.setFontSize(10);
    doc.text(`${invoice.booking_details?.user_email || 'N/A'}`, 14, 70);
    doc.text(`Booking ID: #${invoice.booking}`, 14, 75);

    // Table Data
    const tableData = [
      ['Description', 'Amount'],
      [`Tour Package: ${invoice.booking_details?.tour_name || 'N/A'}`, `Rs. ${parseFloat(invoice.amount || 0).toFixed(2)}`],
    ];

    // Add GST if applicable
    if (invoice.tax_amount && parseFloat(invoice.tax_amount) > 0) {
      tableData.push(['GST (5%)', `Rs. ${parseFloat(invoice.tax_amount).toFixed(2)}`]);
    }

    // Add Grand Total
    tableData.push(['Grand Total', `Rs. ${parseFloat(invoice.total_amount || 0).toFixed(2)}`]);

    // Generate table
    autoTable(doc, {
      startY: 85,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { 
        fillColor: [220, 20, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 60, halign: 'right' }
      }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text('Thank you for choosing Rima Tours & Travels. We wish you a pleasant journey!', 105, finalY, { align: 'center' });
    
    // Signature line
    doc.line(140, finalY + 30, 190, finalY + 30);
    doc.setFontSize(10);
    doc.text('Authorized Signature', 165, finalY + 35, { align: 'center' });

    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
    message.success('Invoice downloaded successfully');
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setViewVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      PAID: 'green',
      UNPAID: 'orange',
      CANCELLED: 'red',
      DRAFT: 'blue',
      SENT: 'cyan',
      OVERDUE: 'volcano',
    };
    return colors[status?.toUpperCase()] || 'default';
  };

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter((invoice) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      invoice.booking_details?.user_email?.toLowerCase().includes(searchLower) ||
      invoice.booking_details?.tour_name?.toLowerCase().includes(searchLower) ||
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
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
            {record.booking_details?.user_email || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Booking #{record.booking}
          </div>
        </div>
      ),
    },
    {
      title: 'Tour',
      key: 'tour',
      width: 180,
      render: (_, record) => (
        <div style={{ fontWeight: 500 }}>
          {record.booking_details?.tour_name || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 120,
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ₹{parseFloat(amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.total_amount || 0) - parseFloat(b.total_amount || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Paid', value: 'PAID' },
        { text: 'Unpaid', value: 'UNPAID' },
        { text: 'Cancelled', value: 'CANCELLED' },
        { text: 'Draft', value: 'DRAFT' },
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
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Invoices Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFormVisible(true)}
          >
            Add Invoice
          </Button>
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

      <InvoicesForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSaved={fetchInvoices}
      />

      <Modal
        title={`Invoice Details - ${selectedInvoice?.invoice_number}`}
        open={viewVisible}
        onCancel={() => setViewVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => handleDownload(selectedInvoice)}>
            Download PDF
          </Button>,
          <Button key="close" onClick={() => setViewVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedInvoice && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Invoice Number">{selectedInvoice.invoice_number}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Customer" span={2}>
              {selectedInvoice.booking_details?.user_email} (Booking #{selectedInvoice.booking})
            </Descriptions.Item>
            <Descriptions.Item label="Tour" span={2}>
              {selectedInvoice.booking_details?.tour_name}
            </Descriptions.Item>
            <Descriptions.Item label="Base Amount">₹{parseFloat(selectedInvoice.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Tax Amount">₹{parseFloat(selectedInvoice.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Total Amount" span={2}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{parseFloat(selectedInvoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">{new Date(selectedInvoice.due_date).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Issued Date">{new Date(selectedInvoice.issued_date).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{selectedInvoice.notes || 'No notes'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesList;