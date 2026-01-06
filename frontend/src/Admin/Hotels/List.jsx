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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Option } = Select;

const HotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchHotels();
    fetchDestinations();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_HOTELS);
      const hotelsData = response.data?.data || response.data?.results || [];
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      message.error('Failed to load hotels');
      // Set dummy data
      setHotels([
        {
          id: 1,
          destination: { id: 1, name: 'Darjeeling' },
          name: 'OMEGA/SIMILAR',
          address: 'Hill Cart Road, Darjeeling',
          hotel_type: 'Luxury',
          star_rating: 5,
        },
        {
          id: 2,
          destination: { id: 2, name: 'Gangtok' },
          name: 'Biksthang Boutique',
          address: 'MG Marg, Gangtok',
          hotel_type: 'Boutique',
          star_rating: 4,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_DESTINATIONS);
      const destinationsData = response.data?.data || response.data?.results || [];
      setDestinations(Array.isArray(destinationsData) ? destinationsData : []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setDestinations([]);
    }
  };

  const handleAdd = () => {
    setEditingHotel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    form.setFieldsValue({
      destination: hotel.destination?.id,
      name: hotel.name,
      address: hotel.address,
      hotel_type: hotel.hotel_type,
      star_rating: hotel.star_rating,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingHotel) {
        await apiClient.put(endpoints.GET_HOTEL_DETAIL(editingHotel.id), values);
        message.success('Hotel updated successfully');
      } else {
        await apiClient.post(endpoints.GET_HOTELS, values);
        message.success('Hotel created successfully');
      }
      setModalVisible(false);
      fetchHotels();
    } catch (error) {
      console.error('Error saving hotel:', error);
      message.error('Failed to save hotel');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_HOTEL_DETAIL(id));
      message.success('Hotel deleted successfully');
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      message.error('Failed to delete hotel');
    }
  };

  const columns = [
    {
      title: 'Hotel Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Destination',
      key: 'destination_display',
      render: (_, record) => {
        if (record.destination_display) {
          return record.destination_display;
        }
        if (record.destination?.name) {
          return record.destination.name;
        }
        return 'N/A';
      },
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'hotel_type',
      key: 'hotel_type',
    },
    {
      title: 'Rating',
      dataIndex: 'star_rating',
      key: 'star_rating',
      render: (rating) => rating ? `${rating} Star` : 'N/A',
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
            title="Are you sure you want to delete this hotel?"
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
          <h2 style={{ margin: 0 }}>Hotels Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Hotel
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={hotels}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} hotels`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingHotel ? 'Edit Hotel' : 'Add Hotel'}
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
            label="Hotel Name"
            rules={[{ required: true, message: 'Please enter hotel name' }]}
          >
            <Input placeholder="Enter hotel name" />
          </Form.Item>

          <Form.Item
            name="destination"
            label="Destination"
            rules={[{ required: true, message: 'Please select destination' }]}
          >
            <Select placeholder="Select destination">
              {Array.isArray(destinations) && destinations.map(dest => (
                <Option key={dest.id} value={dest.id}>
                  {dest.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter hotel address"
            />
          </Form.Item>

          <Form.Item
            name="hotel_type"
            label="Hotel Type"
            rules={[{ required: true, message: 'Please select hotel type' }]}
          >
            <Select placeholder="Select hotel type">
              <Option value="Budget">Budget</Option>
              <Option value="Standard">Standard</Option>
              <Option value="Premium">Premium</Option>
              <Option value="Luxury">Luxury</Option>
              <Option value="Resort">Resort</Option>
              <Option value="Boutique">Boutique</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="star_rating"
            label="Star Rating"
            rules={[{ required: true, message: 'Please select star rating' }]}
          >
            <Select placeholder="Select star rating">
              <Option value={1}>1 Star</Option>
              <Option value={2}>2 Star</Option>
              <Option value={3}>3 Star</Option>
              <Option value={4}>4 Star</Option>
              <Option value={5}>5 Star</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingHotel ? 'Update' : 'Create'} Hotel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HotelsList;