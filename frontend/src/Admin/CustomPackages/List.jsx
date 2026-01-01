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

const CustomPackagesList = () => {
  const [customPackages, setCustomPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

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
      // Set dummy data
      setCustomPackages([
        {
          id: 1,
          user: { username: 'john_doe', email: 'john@example.com' },
          destination: 'Darjeeling, Lachung',
          duration: '2 Days 3 Nights',
          start_date: '2024-10-12',
          no_of_people: 5,
          hotel_preference: 'Premier Inn, Hilton Yas',
          transportation_choice: 'Train/Flight',
          type: 'Adventure',
          status: 'pending',
          created_at: '2024-01-15',
        },
        {
          id: 2,
          user: { username: 'jane_smith', email: 'jane@example.com' },
          destination: 'Hoi an, Ha Long Bay, Phu Quoc Island',
          duration: '7 Days 8 Nights',
          start_date: '2024-09-26',
          no_of_people: 2,
          hotel_preference: 'Windsor Bay, Majestic Beach Resort',
          transportation_choice: 'Flight',
          type: 'Honeymoon',
          status: 'approved',
          created_at: '2024-01-10',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (packageId, newStatus) => {
    try {
      await apiClient.patch(endpoints.GET_CUSTOM_PACKAGE_DETAIL(packageId), {
        status: newStatus,
      });
      message.success(`Custom package ${newStatus} successfully`);
      fetchCustomPackages();
    } catch (error) {
      console.error('Error updating package status:', error);
      message.error('Failed to update package status');
    }
  };

  const showPackageDetails = (pkg) => {
    setSelectedPackage(pkg);
    setDetailModalVisible(true);
  };

  const filteredPackages = Array.isArray(customPackages) ? customPackages.filter((pkg) => {
    const matchesSearch =
      pkg.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      pkg.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      pkg.destination?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      completed: 'blue',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Request ID',
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
          <div style={{ fontWeight: 'bold' }}>{record.user?.username}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
    },
    {
      title: 'People',
      dataIndex: 'no_of_people',
      key: 'no_of_people',
      width: 80,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag color="blue">{type}</Tag>,
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
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
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
            onClick={() => showPackageDetails(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'approved')}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'rejected')}
              >
                Reject
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
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="completed">Completed</Option>
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
        title={`Custom Package Details - #${selectedPackage?.id}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedPackage && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Customer" span={2}>
              <div>
                <strong>{selectedPackage.user?.username}</strong>
                <br />
                <span style={{ color: '#666' }}>{selectedPackage.user?.email}</span>
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
            <Descriptions.Item label="Number of People">
              {selectedPackage.no_of_people}
            </Descriptions.Item>
            <Descriptions.Item label="Tour Type">
              <Tag color="blue">{selectedPackage.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Hotel Preference" span={2}>
              {selectedPackage.hotel_preference}
            </Descriptions.Item>
            <Descriptions.Item label="Transportation">
              {selectedPackage.transportation_choice}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedPackage.status)}>
                {selectedPackage.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created Date" span={2}>
              {new Date(selectedPackage.created_at).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CustomPackagesList;