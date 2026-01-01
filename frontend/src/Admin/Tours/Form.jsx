import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  InputNumber,
  Upload,
  Row,
  Col,
  Image,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';


const { TextArea } = Input;
const { Option } = Select;

const TourForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchDestinations();
    if (isEdit) {
      fetchTour();
    }
  }, [id]);

  const fetchDestinations = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_DESTINATIONS);
      const destinationsData = response.data?.data || response.data?.results || [];
      setDestinations(Array.isArray(destinationsData) ? destinationsData : []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      message.error('Failed to load destinations');
      setDestinations([]);
    }
  };
      

  const fetchTour = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_TOUR_DETAIL(id));
      const tour = response.data;
      form.setFieldsValue({
        name: tour.name,
        description: tour.description,
        duration_days: tour.duration_days,
        max_capacity: tour.max_capacity,
        base_price: tour.base_price,
        destination_id: tour.destination?.id,
        category: tour.category,
        difficulty_level: tour.difficulty_level,
      });
      
      // Set image preview if exists
      if (tour.featured_image) {
        setImageUrl(tour.featured_image);
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
      message.error('Failed to load tour details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Add all form fields to FormData
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null && key !== 'featured_image') {
          formData.append(key, values[key]);
        }
      });

      // Add image file if selected
      if (imageFile) {
        formData.append('featured_image', imageFile);
      }

      if (isEdit) {
        await apiClient.put(endpoints.GET_TOUR_DETAIL(id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Tour updated successfully');
      } else {
        await apiClient.post(endpoints.GET_ALL_TOURS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Tour created successfully');
      }

      navigate('/admin/tours');
    } catch (error) {
      console.error('Error saving tour:', error);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} tour`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (info) => {
    const file = info.file;
    if (file) {
      // Validate file type
      const isImage = file.type?.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return;
      }

      // Validate file size (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImageUrl('');
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload Image</div>
    </div>
  );

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/tours')}
          >
            Back to Tours
          </Button>
          <h2 style={{ margin: 0 }}>
            {isEdit ? 'Edit Tour' : 'Create New Tour'}
          </h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            duration_days: 5,
            max_capacity: 10,
            base_price: 10000,
            category: 'CULTURAL',
            difficulty_level: 'EASY',
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tour Name"
                rules={[
                  { required: true, message: 'Please enter tour name' },
                  { min: 3, message: 'Name must be at least 3 characters' },
                ]}
              >
                <Input placeholder="Enter tour name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Tour Category"
                rules={[{ required: true, message: 'Please select tour category' }]}
              >
                <Select placeholder="Select tour category">
                  <Option value="ADVENTURE">Adventure</Option>
                  <Option value="CULTURAL">Cultural</Option>
                  <Option value="RELAXATION">Relaxation</Option>
                  <Option value="BUSINESS">Business</Option>
                  <Option value="WILDLIFE">Wildlife</Option>
                  <Option value="SPIRITUAL">Spiritual</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter tour description' },
              { min: 10, message: 'Description must be at least 10 characters' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter detailed tour description"
            />
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item
                name="duration_days"
                label="Duration (Days)"
                rules={[
                  { required: true, message: 'Please enter duration' },
                  { type: 'number', min: 1, message: 'Duration must be at least 1 day' },
                ]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                  placeholder="Enter duration in days"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                name="max_capacity"
                label="Maximum Capacity"
                rules={[
                  { required: true, message: 'Please enter maximum capacity' },
                  { type: 'number', min: 1, message: 'Must be at least 1 person' },
                ]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="Enter max capacity"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                name="base_price"
                label="Base Price (₹)"
                rules={[
                  { required: true, message: 'Please enter base price' },
                  { type: 'number', min: 1, message: 'Price must be greater than 0' },
                ]}
              >
                <InputNumber
                  min={1}
                  max={1000000}
                  style={{ width: '100%' }}
                  placeholder="Enter base price"
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                name="difficulty_level"
                label="Difficulty Level"
                rules={[{ required: true, message: 'Please select difficulty level' }]}
              >
                <Select placeholder="Select difficulty">
                  <Option value="EASY">Easy</Option>
                  <Option value="MODERATE">Moderate</Option>
                  <Option value="CHALLENGING">Challenging</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="destination_id"
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
            label="Featured Image"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {imageUrl ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Image
                    width={200}
                    height={150}
                    src={imageUrl}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                    preview={true}
                  />
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleImageRemove}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Upload
                  name="featured_image"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  accept="image/*"
                >
                  {uploadButton}
                </Upload>
              )}
              <div style={{ fontSize: '12px', color: '#666' }}>
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {isEdit ? 'Update Tour' : 'Create Tour'}
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/admin/tours')}
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TourForm;