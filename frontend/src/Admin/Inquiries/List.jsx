import React, { useEffect, useState } from 'react';
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
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;

const InquiriesList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_INQUIRIES);
      const inquiriesData = response.data?.data || response.data?.results || [];
      setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      message.error('Failed to load inquiries');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId, newStatus) => {
    try {
      await apiClient.patch(endpoints.GET_INQUIRY_DETAIL(inquiryId), {
        status: newStatus,
      });
      message.success(`Inquiry ${newStatus} successfully`);
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      message.error('Failed to update inquiry status');
    }
  };

  const showInquiryDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setDetailModalVisible(true);
  };

  const filteredInquiries = Array.isArray(inquiries) ? inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.tour?.title?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inquiry.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusColor = (status) => {
    const colors = {
      'NEW': 'orange',
      'new': 'orange',
      'RESPONDED': 'green',
      'responded': 'green',
      'CLOSED': 'gray',
      'closed': 'gray',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Inquiry ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.contact_number}</div>
        </div>
      ),
    },
    {
      title: 'Tour',
      key: 'tour',
      render: (_, record) => (
        record.tour ? (
          <Tag color="blue">{record.tour.title}</Tag>
        ) : (
          <Tag color="gray">General Inquiry</Tag>
        )
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      width: 300,
      render: (message) => (
        <div style={{ maxWidth: 280 }}>
          {message && message.length > 100 ? `${message.substring(0, 100)}...` : message || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'inquiry_date',
      key: 'inquiry_date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.inquiry_date) - new Date(b.inquiry_date),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'New', value: 'NEW' },
        { text: 'Responded', value: 'RESPONDED' },
        { text: 'Closed', value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showInquiryDetails(record)}
          >
            View
          </Button>
          {record.status?.toLowerCase() === 'new' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'RESPONDED')}
              >
                Mark Responded
              </Button>
              <Button
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'CLOSED')}
              >
                Close
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Inquiries Management</h2>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search inquiries..."
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
            <Option value="NEW">New</Option>
            <Option value="RESPONDED">Responded</Option>
            <Option value="CLOSED">Closed</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredInquiries}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} inquiries`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Inquiry Details Modal */}
      <Modal
        title={`Inquiry Details - #${selectedInquiry?.id}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedInquiry && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Customer Name" span={2}>
              {selectedInquiry.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedInquiry.email}
            </Descriptions.Item>
            <Descriptions.Item label="Contact">
              {selectedInquiry.contact_number}
            </Descriptions.Item>
            <Descriptions.Item label="Tour" span={2}>
              {selectedInquiry.tour ? (
                <Tag color="blue">{selectedInquiry.tour.title}</Tag>
              ) : (
                <Tag color="gray">General Inquiry</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Inquiry Date">
              {new Date(selectedInquiry.inquiry_date).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedInquiry.status)}>
                {selectedInquiry.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Message" span={2}>
              <div style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '6px',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedInquiry.message}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default InquiriesList;