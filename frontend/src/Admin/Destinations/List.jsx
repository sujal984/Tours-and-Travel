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
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { TextArea } = Input;

const DestinationsList = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_DESTINATIONS);
      const destinationsData = response.data?.data || response.data?.results || [];
      setDestinations(Array.isArray(destinationsData) ? destinationsData : []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      message.error('Failed to load destinations');
      // Set dummy data
      setDestinations([
        {
          id: 1,
          name: 'Sikkim',
          description: 'Beautiful mountain state in Northeast India',
          places: 'Gangtok, Pelling, Lachung, Yumthang Valley',
        },
        {
          id: 2,
          name: 'Vietnam',
          description: 'Southeast Asian country known for beaches and rivers',
          places: 'Ho Chi Minh City, Hanoi, Ha Long Bay, Hoi An',
        },
        {
          id: 3,
          name: 'Goa',
          description: 'Coastal state known for beaches and Portuguese heritage',
          places: 'Panaji, Calangute, Baga, Old Goa',
        },
        {
          id: 4,
          name: 'Rajasthan',
          description: 'Land of kings with rich cultural heritage',
          places: 'Jaipur, Udaipur, Jodhpur, Jaisalmer',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDestination(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (destination) => {
    setEditingDestination(destination);
    form.setFieldsValue({
      name: destination.name,
      description: destination.description,
      places: destination.places,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingDestination) {
        await apiClient.put(endpoints.GET_DESTINATION_DETAIL(editingDestination.id), values);
        message.success('Destination updated successfully');
      } else {
        await apiClient.post(endpoints.GET_DESTINATIONS, values);
        message.success('Destination created successfully');
      }
      setModalVisible(false);
      fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      message.error('Failed to save destination');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_DESTINATION_DETAIL(id));
      message.success('Destination deleted successfully');
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      message.error('Failed to delete destination');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Places to Visit',
      dataIndex: 'places',
      key: 'places',
      ellipsis: true,
      width: 250,
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
            title="Are you sure you want to delete this destination?"
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
          <h2 style={{ margin: 0 }}>Destinations Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Destination
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={destinations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} destinations`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingDestination ? 'Edit Destination' : 'Add Destination'}
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
            label="Destination Name"
            rules={[{ required: true, message: 'Please enter destination name' }]}
          >
            <Input placeholder="Enter destination name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter destination description"
            />
          </Form.Item>

          <Form.Item
            name="places"
            label="Places to Visit"
            rules={[{ required: true, message: 'Please enter places to visit' }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter places to visit (comma separated)"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingDestination ? 'Update' : 'Create'} Destination
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DestinationsList;