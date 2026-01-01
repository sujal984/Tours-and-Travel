import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  DatePicker,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Option } = Select;

const SeasonsList = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_SEASONS);
      const seasonsData = response.data?.data || response.data?.results || [];
      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      message.error('Failed to load seasons');
      // Set dummy data matching backend structure
      setSeasons([
        {
          id: 1,
          name: 'Peak Season',
          start_month: 10,
          end_month: 3,
          description: 'High demand season with best weather',
          is_active: true,
        },
        {
          id: 2,
          name: 'Off Season',
          start_month: 4,
          end_month: 6,
          description: 'Low demand season with moderate weather',
          is_active: true,
        },
        {
          id: 3,
          name: 'Shoulder Season',
          start_month: 7,
          end_month: 9,
          description: 'Medium demand season',
          is_active: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      const toursData = response.data?.data || response.data?.results || [];
      setTours(Array.isArray(toursData) ? toursData : []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([
        { id: 1, title: 'Sikkim Adventure' },
        { id: 2, title: 'Vietnam Discovery' },
      ]);
    }
  };

  const handleAdd = () => {
    setEditingSeason(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (season) => {
    setEditingSeason(season);
    form.setFieldsValue({
      name: season.name,
      start_month: season.start_month,
      end_month: season.end_month,
      description: season.description,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSeason) {
        await apiClient.put(endpoints.GET_SEASON_DETAIL(editingSeason.id), values);
        message.success('Season updated successfully');
      } else {
        await apiClient.post(endpoints.GET_SEASONS, values);
        message.success('Season created successfully');
      }
      setModalVisible(false);
      fetchSeasons();
    } catch (error) {
      console.error('Error saving season:', error);
      message.error('Failed to save season');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_SEASON_DETAIL(id));
      message.success('Season deleted successfully');
      fetchSeasons();
    } catch (error) {
      console.error('Error deleting season:', error);
      message.error('Failed to delete season');
    }
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  };

  const columns = [
    {
      title: 'Season Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => `${getMonthName(record.start_month)} - ${getMonthName(record.end_month)}`,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this season?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Seasons Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Season
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={seasons}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} seasons`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingSeason ? 'Edit Season' : 'Add Season'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Season Name"
            rules={[{ required: true, message: 'Please enter season name' }]}
          >
            <Input placeholder="Enter season name" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="start_month"
                label="Start Month"
                rules={[{ required: true, message: 'Please select start month' }]}
              >
                <Select placeholder="Select start month">
                  {[
                    { value: 1, label: 'January' },
                    { value: 2, label: 'February' },
                    { value: 3, label: 'March' },
                    { value: 4, label: 'April' },
                    { value: 5, label: 'May' },
                    { value: 6, label: 'June' },
                    { value: 7, label: 'July' },
                    { value: 8, label: 'August' },
                    { value: 9, label: 'September' },
                    { value: 10, label: 'October' },
                    { value: 11, label: 'November' },
                    { value: 12, label: 'December' },
                  ].map(month => (
                    <Option key={month.value} value={month.value}>
                      {month.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="end_month"
                label="End Month"
                rules={[{ required: true, message: 'Please select end month' }]}
              >
                <Select placeholder="Select end month">
                  {[
                    { value: 1, label: 'January' },
                    { value: 2, label: 'February' },
                    { value: 3, label: 'March' },
                    { value: 4, label: 'April' },
                    { value: 5, label: 'May' },
                    { value: 6, label: 'June' },
                    { value: 7, label: 'July' },
                    { value: 8, label: 'August' },
                    { value: 9, label: 'September' },
                    { value: 10, label: 'October' },
                    { value: 11, label: 'November' },
                    { value: 12, label: 'December' },
                  ].map(month => (
                    <Option key={month.value} value={month.value}>
                      {month.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter season description" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSeason ? 'Update' : 'Create'} Season
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SeasonsList;