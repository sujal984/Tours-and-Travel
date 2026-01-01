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
  InputNumber,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Option } = Select;

const PricingsList = () => {
  const [pricings, setPricings] = useState([]);
  const [tours, setTours] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPricings();
    fetchTours();
    fetchSeasons();
  }, []);

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_PRICINGS);
      const pricingsData = response.data?.data || response.data?.results || [];
      setPricings(Array.isArray(pricingsData) ? pricingsData : []);
    } catch (error) {
      console.error('Error fetching pricings:', error);
      message.error('Failed to load pricings');
      // Set dummy data matching backend structure
      setPricings([
        {
          id: 1,
          tour: 1,
          tour_name: 'Sikkim Adventure',
          season: 1,
          season_name: 'Peak Season',
          price: 25000,
          description: 'Peak season pricing for Sikkim Adventure tour',
        },
        {
          id: 2,
          tour: 2,
          tour_name: 'Vietnam Discovery',
          season: 2,
          season_name: 'Off Season',
          price: 35000,
          description: 'Off season pricing for Vietnam Discovery tour',
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
      setTours([]);
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_SEASONS);
      const seasonsData = response.data?.data || response.data?.results || [];
      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      // Set dummy seasons data
      setSeasons([
        { id: 1, name: 'Peak Season', description: 'High demand period' },
        { id: 2, name: 'Off Season', description: 'Low demand period' },
        { id: 3, name: 'Shoulder Season', description: 'Medium demand period' },
      ]);
    }
  };

  const handleAdd = () => {
    setEditingPricing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (pricing) => {
    setEditingPricing(pricing);
    form.setFieldsValue({
      tour: pricing.tour,
      season: pricing.season,
      price: pricing.price,
      description: pricing.description,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPricing) {
        await apiClient.put(endpoints.GET_PRICING_DETAIL(editingPricing.id), values);
        message.success('Pricing updated successfully');
      } else {
        await apiClient.post(endpoints.GET_PRICINGS, values);
        message.success('Pricing created successfully');
      }
      setModalVisible(false);
      fetchPricings();
    } catch (error) {
      console.error('Error saving pricing:', error);
      message.error('Failed to save pricing');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_PRICING_DETAIL(id));
      message.success('Pricing deleted successfully');
      fetchPricings();
    } catch (error) {
      console.error('Error deleting pricing:', error);
      message.error('Failed to delete pricing');
    }
  };

  const columns = [
    {
      title: 'Tour',
      key: 'tour',
      render: (_, record) => record.tour_name || 'N/A',
    },
    {
      title: 'Season',
      key: 'season',
      render: (_, record) => record.season_name || 'N/A',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price?.toLocaleString()}`,
      sorter: (a, b) => a.price - b.price,
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
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure you want to delete this pricing?',
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Pricing Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Pricing
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={pricings}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} pricings`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingPricing ? 'Edit Pricing' : 'Add Pricing'}
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
            name="tour"
            label="Tour"
            rules={[{ required: true, message: 'Please select a tour' }]}
          >
            <Select placeholder="Select tour">
              {Array.isArray(tours) && tours.map(tour => (
                <Option key={tour.id} value={tour.id}>
                  {tour.name || tour.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="season"
            label="Season"
            rules={[{ required: true, message: 'Please select a season' }]}
          >
            <Select placeholder="Select season">
              {Array.isArray(seasons) && seasons.map(season => (
                <Option key={season.id} value={season.id}>
                  {season.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (₹)"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter price"
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter pricing description (optional)"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPricing ? 'Update' : 'Create'} Pricing
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PricingsList;