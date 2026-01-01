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

const { TextArea } = Input;
const { Option } = Select;

const ItinerariesList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchItineraries();
    fetchDestinations();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_ITINERARIES);
      const itinerariesData = response.data?.data || response.data?.results || [];
      setItineraries(Array.isArray(itinerariesData) ? itinerariesData : []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      message.error('Failed to load itineraries');
      // Set dummy data matching backend structure
      setItineraries([
        {
          id: 1,
          destination: 1,
          destination_name: 'Sikkim',
          tour: null,
          tour_name: null,
          day_number: 1,
          title: 'Arrival in Gangtok',
          description: 'Arrive at Bagdogra Airport, transfer to Gangtok. Check-in at hotel. Evening free for leisure.',
        },
        {
          id: 2,
          destination: 1,
          destination_name: 'Sikkim',
          tour: null,
          tour_name: null,
          day_number: 2,
          title: 'Gangtok Local Sightseeing',
          description: 'Visit Rumtek Monastery, Ganesh Tok, Hanuman Tok, and Tashi View Point.',
        },
        {
          id: 3,
          destination: 2,
          destination_name: 'Vietnam',
          tour: null,
          tour_name: null,
          day_number: 1,
          title: 'Arrival in Ho Chi Minh City',
          description: 'Arrive at Tan Son Nhat Airport. Transfer to hotel. Evening city tour.',
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
      setDestinations([
        { id: 1, name: 'Sikkim' },
        { id: 2, name: 'Vietnam' },
        { id: 3, name: 'Goa' },
        { id: 4, name: 'Rajasthan' },
      ]);
    }
  };

  const handleAdd = () => {
    setEditingItinerary(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (itinerary) => {
    setEditingItinerary(itinerary);
    form.setFieldsValue({
      destination: itinerary.destination,
      day_number: itinerary.day_number,
      title: itinerary.title,
      description: itinerary.description,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItinerary) {
        await apiClient.put(endpoints.GET_ITINERARY_DETAIL(editingItinerary.id), values);
        message.success('Itinerary updated successfully');
      } else {
        await apiClient.post(endpoints.GET_ITINERARIES, values);
        message.success('Itinerary created successfully');
      }
      setModalVisible(false);
      fetchItineraries();
    } catch (error) {
      console.error('Error saving itinerary:', error);
      message.error('Failed to save itinerary');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_ITINERARY_DETAIL(id));
      message.success('Itinerary deleted successfully');
      fetchItineraries();
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      message.error('Failed to delete itinerary');
    }
  };

  const columns = [
    {
      title: 'Destination',
      key: 'destination',
      render: (_, record) => record.destination_name || 'N/A',
      filters: Array.isArray(destinations) ? destinations.map(dest => ({ text: dest.name, value: dest.id })) : [],
      onFilter: (value, record) => record.destination === value,
    },
    {
      title: 'Day',
      dataIndex: 'day_number',
      key: 'day_number',
      width: 80,
      sorter: (a, b) => a.day_number - b.day_number,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
            title="Are you sure you want to delete this itinerary?"
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
          <h2 style={{ margin: 0 }}>Itineraries Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Itinerary
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={itineraries}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} itineraries`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingItinerary ? 'Edit Itinerary' : 'Add Itinerary'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="destination"
            label="Destination"
            rules={[{ required: true, message: 'Please select a destination' }]}
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
            name="day_number"
            label="Day Number"
            rules={[{ required: true, message: 'Please enter day number' }]}
          >
            <Input type="number" min={1} placeholder="Enter day number" />
          </Form.Item>

          <Form.Item
            name="title"
            label="Day Title"
            rules={[{ required: true, message: 'Please enter day title' }]}
          >
            <Input placeholder="Enter day title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Day Description"
            rules={[{ required: true, message: 'Please enter day description' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter detailed day description"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingItinerary ? 'Update' : 'Create'} Itinerary
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ItinerariesList;