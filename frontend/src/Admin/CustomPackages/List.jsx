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
  Form,
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SwapOutlined,
  MessageOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const CustomPackagesList = () => {
  const [customPackages, setCustomPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [convertModalVisible, setConvertModalVisible] = useState(false);

  // Form states
  const [tours, setTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [cancelForm] = Form.useForm();
  const [convertForm] = Form.useForm();
  const [responseForm] = Form.useForm();

  useEffect(() => {
    fetchCustomPackages();
  }, []);

  const fetchCustomPackages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_CUSTOM_PACKAGES);
      const packagesData = response.data?.data || response.data?.results || [];
      setCustomPackages(Array.isArray(packagesData) ? packagesData : []);
    } catch (error) {
      console.error('Error fetching custom packages:', error);
      message.error('Failed to load custom packages');
      setCustomPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      setLoadingTours(true);
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      const toursData = response.data?.data || response.data?.results || [];
      setTours(Array.isArray(toursData) ? toursData : []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      message.error('Failed to load tours');
    } finally {
      setLoadingTours(false);
    }
  };

  const handleStatusUpdate = async (packageId, newStatus) => {
    if (newStatus === 'cancelled') {
      setSelectedPackage(customPackages.find(p => p.id === packageId));
      setCancelModalVisible(true);
      return;
    }

    try {
      await apiClient.patch(endpoints.GET_CUSTOM_PACKAGE_DETAIL(packageId), {
        status: newStatus.toUpperCase(),
      });
      message.success(`Custom package ${newStatus} successfully`);
      fetchCustomPackages();
    } catch (error) {
      console.error('Error updating package status:', error);
      message.error('Failed to update package status');
    }
  };

  const handleCancelSubmit = async () => {
    try {
      const values = await cancelForm.validateFields();
      setLoading(true);
      await apiClient.patch(endpoints.GET_CUSTOM_PACKAGE_DETAIL(selectedPackage.id), {
        status: 'CANCELLED',
        admin_notes: values.reason
      });
      message.success('Custom package cancelled successfully');
      setCancelModalVisible(false);
      cancelForm.resetFields();
      fetchCustomPackages();
    } catch (error) {
      console.error('Error cancelling package:', error);
      message.error('Failed to cancel package');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertClick = (pkg) => {
    setSelectedPackage(pkg);
    setConvertModalVisible(true);
    fetchTours();
  };

  const handleConvertSubmit = async () => {
    try {
      const values = await convertForm.validateFields();
      setLoading(true);

      const tourId = values.tour_id;

      await apiClient.post(endpoints.CONVERT_CUSTOM_PACKAGE_TO_BOOKING(selectedPackage.id), {
        tour_id: tourId
      });

      message.success('Custom package converted to booking successfully');
      setConvertModalVisible(false);
      convertForm.resetFields();
      fetchCustomPackages();
    } catch (error) {
      console.error('Error converting package to booking:', error);
      message.error(error.response?.data?.message || 'Failed to convert package to booking');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseClick = (pkg) => {
    setSelectedPackage(pkg);
    setResponseModalVisible(true);
    if (pkg.admin_response || pkg.quoted_price) {
      responseForm.setFieldsValue({
        admin_response: pkg.admin_response || '',
        quoted_price: pkg.quoted_price || '',
        status: pkg.status || 'PROCESSING'
      });
    }
  };

  const handleResponseSubmit = async () => {
    try {
      const values = await responseForm.validateFields();
      setLoading(true);
      
      await apiClient.patch(endpoints.GET_CUSTOM_PACKAGE_DETAIL(selectedPackage.id), {
        admin_response: values.admin_response,
        quoted_price: values.quoted_price ? parseFloat(values.quoted_price) : null,
        status: values.status.toUpperCase(),
        admin_notes: values.admin_notes || ''
      });
      
      message.success('Response sent successfully');
      setResponseModalVisible(false);
      responseForm.resetFields();
      fetchCustomPackages();
    } catch (error) {
      console.error('Error sending response:', error);
      message.error('Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  const parseDetailedItinerary = (detailedItinerary) => {
    try {
      return typeof detailedItinerary === 'string' 
        ? JSON.parse(detailedItinerary) 
        : detailedItinerary;
    } catch {
      return null;
    }
  };

  const showPackageDetails = (pkg) => {
    setSelectedPackage(pkg);
    setDetailModalVisible(true);
  };

  const filteredPackages = Array.isArray(customPackages) ? customPackages.filter((pkg) => {
    const matchesSearch =
      pkg.customer_display_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      pkg.customer_display_email?.toLowerCase().includes(searchText.toLowerCase()) ||
      pkg.destination?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pkg.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      PROCESSING: 'blue',
      QUOTED: 'purple',
      CONFIRMED: 'green',
      CANCELLED: 'red',
    };
    return colors[status?.toUpperCase()] || 'default';
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <span style={{ fontFamily: 'monospace' }}>#{id.substring(0, 8)}</span>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.customer_display_name || 'Anonymous'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.customer_display_email || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Details',
      key: 'details',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>{record.duration}</div>
          <div style={{ color: '#888' }}>{record.participants_count} People</div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'package_type',
      key: 'package_type',
      width: 100,
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={getStatusColor(status)}>
            {status?.toUpperCase()}
          </Tag>
          {status === 'CANCELLED' && record.admin_notes && (
            <span style={{ fontSize: '10px', color: '#999', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Reason: {record.admin_notes}
            </span>
          )}
        </Space>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Processing', value: 'processing' },
        { text: 'Quoted', value: 'quoted' },
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status?.toLowerCase() === value,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showPackageDetails(record)}
          >
            View
          </Button>
          {['PENDING', 'PROCESSING', 'QUOTED'].includes(record.status?.toUpperCase()) && (
            <Button
              type="default"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => handleResponseClick(record)}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
            >
              Respond
            </Button>
          )}
          {record.status?.toUpperCase() === 'CONFIRMED' && (
            <Button
              type="default"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => handleConvertClick(record)}
            >
              Convert
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Custom Packages Management</h2>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search packages..."
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
            <Option value="pending">Pending</Option>
            <Option value="processing">Processing</Option>
            <Option value="quoted">Quoted</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPackages}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} packages`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Package Details Modal */}
      <Modal
        title={`Custom Package Details - #${selectedPackage?.id?.substring(0, 8)}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedPackage && (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Customer" span={2}>
                <div>
                  <strong>{selectedPackage.customer_display_name || 'Anonymous'}</strong>
                  <br />
                  <span style={{ color: '#666' }}>{selectedPackage.customer_display_email || 'N/A'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Destination" span={2}>
                {selectedPackage.destination}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {selectedPackage.duration}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {new Date(selectedPackage.start_date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Number">
                {selectedPackage.contact_number}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedPackage.status)}>
                  {selectedPackage.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Admin Response */}
            {selectedPackage.admin_response && (
              <div style={{ marginTop: '20px' }}>
                <Card size="small" title="Admin Response" style={{ background: '#f6ffed' }}>
                  <p>{selectedPackage.admin_response}</p>
                  {selectedPackage.quoted_price && (
                    <p><strong>Quoted Price: ₹{selectedPackage.quoted_price}</strong></p>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Admin Response Modal */}
      <Modal
        title={`Respond to Custom Package Request - #${selectedPackage?.id?.substring(0, 8)}`}
        open={responseModalVisible}
        onCancel={() => setResponseModalVisible(false)}
        onOk={handleResponseSubmit}
        okText="Send Response"
        okButtonProps={{ loading: loading }}
        width={700}
      >
        <Form form={responseForm} layout="vertical">
          <Form.Item
            name="admin_response"
            label="Response Message"
            rules={[{ required: true, message: 'Please provide a response message' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Write your detailed response to the customer's request..."
            />
          </Form.Item>

          <Form.Item
            name="quoted_price"
            label="Quoted Price (₹)"
          >
            <Input 
              type="number" 
              placeholder="Enter quoted price"
              prefix="₹"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Update Status"
            rules={[{ required: true }]}
            initialValue="PROCESSING"
          >
            <Select>
              <Option value="PROCESSING">Processing</Option>
              <Option value="QUOTED">Quoted</Option>
              <Option value="CONFIRMED">Confirmed</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        title="Cancel Custom Package Request"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        onOk={handleCancelSubmit}
        okText="Confirm Cancellation"
        okButtonProps={{ danger: true, loading: loading }}
      >
        <Form form={cancelForm} layout="vertical">
          <p>Are you sure you want to cancel the request from <strong>{selectedPackage?.customer_display_name}</strong>?</p>
          <Form.Item
            name="reason"
            label="Cancellation Reason"
            rules={[{ required: true, message: 'Please provide a reason for cancellation' }]}
          >
            <TextArea rows={4} placeholder="Enter reason for customer..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Convert to Booking Modal */}
      <Modal
        title="Convert Custom Package to Booking"
        open={convertModalVisible}
        onCancel={() => setConvertModalVisible(false)}
        onOk={handleConvertSubmit}
        okText="Convert to Booking"
        okButtonProps={{ loading: loading }}
      >
        <Form form={convertForm} layout="vertical">
          <p>Select a matching tour to convert this custom request into a standard booking.</p>
          <Form.Item
            name="tour_id"
            label="Target Tour"
            rules={[{ required: true, message: 'Please select a tour' }]}
          >
            <Select
              showSearch
              placeholder="Select a tour"
              optionFilterProp="children"
              loading={loadingTours}
            >
              {tours.map(tour => (
                <Option key={tour.id} value={tour.id}>
                  {tour.name} ({tour.duration_days} Days) - ₹{tour.base_price}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomPackagesList;