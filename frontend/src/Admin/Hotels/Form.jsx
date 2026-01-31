import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Switch,
  Select,
  InputNumber,
  message,
  Spin,
  Upload,
  Image,
  Space,
  Typography
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HotelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchDestinations();
    if (isEdit) {
      fetchHotel();
    }
  }, [id, isEdit]);

  const fetchDestinations = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_DESTINATIONS);
      setDestinations(response.data?.data || response.data?.results || []);
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  };

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_HOTEL_DETAIL(id));
      const hotel = response.data?.data || response.data;
      
      form.setFieldsValue({
        name: hotel.name,
        destination: hotel.destination,
        address: hotel.address,
        hotel_type: hotel.hotel_type,
        star_rating: hotel.star_rating,
        is_active: hotel.is_active
      });

      if (hotel.image) {
        setImageUrl(hotel.image);
        setImagePreview({
          uid: 'existing',
          name: 'Hotel Image',
          status: 'done',
          url: hotel.image.startsWith('http') ? hotel.image : `http://127.0.0.1:8000${hotel.image}`
        });
      }
    } catch (error) {
      console.error("Error fetching hotel:", error);
      message.error("Failed to load hotel details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('destination', values.destination);
      formData.append('address', values.address || '');
      formData.append('hotel_type', values.hotel_type || '');
      formData.append('star_rating', values.star_rating || '');
      formData.append('is_active', values.is_active);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Debug log
      console.log('Submitting hotel data:', {
        name: values.name,
        destination: values.destination,
        hasImage: !!imageFile,
        imageFileName: imageFile?.name
      });

      let response;
      if (isEdit) {
        response = await apiClient.put(endpoints.UPDATE_HOTEL(id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await apiClient.post(endpoints.CREATE_HOTEL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      console.log('Hotel save response:', response.data);
      message.success(`Hotel ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/admin/hotels');
    } catch (error) {
      console.error("Error saving hotel:", error);
      console.error("Error response:", error.response?.data);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} hotel: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (info) => {
    const { file, fileList } = info;
    
    // Handle file removal
    if (fileList.length === 0) {
      setImageFile(null);
      setImageUrl(null);
      setImagePreview(null);
      return;
    }
    
    // Get the actual file object
    const actualFile = file.originFileObj || file;
    
    // Validate file type
    const isValidType = actualFile.type === 'image/jpeg' || actualFile.type === 'image/png' || actualFile.type === 'image/gif';
    if (!isValidType) {
      message.error('You can only upload JPG/PNG/GIF files!');
      return false;
    }

    // Validate file size (5MB)
    const isValidSize = actualFile.size / 1024 / 1024 < 5;
    if (!isValidSize) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    console.log('Image upload:', {
      fileName: actualFile.name,
      fileSize: actualFile.size,
      fileType: actualFile.type
    });

    setImageFile(actualFile);
    setImageUrl(URL.createObjectURL(actualFile));
    setImagePreview({
      uid: actualFile.uid || Date.now(),
      name: actualFile.name,
      status: 'done',
      url: URL.createObjectURL(actualFile),
      size: actualFile.size
    });
    
    return false; // Prevent auto upload
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload Image</div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              {isEdit ? 'Edit Hotel' : 'Create Hotel'}
            </Title>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/hotels')}
            >
              Back to List
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ is_active: true, star_rating: 3 }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="name"
                  label="Hotel Name"
                  rules={[{ required: true, message: 'Please enter hotel name' }]}
                >
                  <Input placeholder="e.g. Grand Palace Hotel" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="destination"
                  label="Destination"
                  rules={[{ required: true, message: 'Please select destination' }]}
                >
                  <Select placeholder="Select destination" size="large">
                    {destinations.map(dest => (
                      <Option key={dest.id} value={dest.id}>
                        {dest.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Address"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Hotel address..."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="hotel_type"
                  label="Hotel Type"
                >
                  <Select placeholder="Select hotel type" size="large">
                    <Option value="Budget">Budget</Option>
                    <Option value="Business">Business</Option>
                    <Option value="Luxury">Luxury</Option>
                    <Option value="Resort">Resort</Option>
                    <Option value="Boutique">Boutique</Option>
                    <Option value="Heritage">Heritage</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="star_rating"
                  label="Star Rating"
                >
                  <InputNumber 
                    min={1} 
                    max={5} 
                    style={{ width: '100%' }}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="is_active"
                  label="Active Status"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
              <Col xs={24}>
                <Title level={4}>Hotel Image</Title>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  Upload hotel image (JPG, PNG, GIF - Max 5MB)
                </p>
                <Upload
                  listType="picture-card"
                  fileList={imagePreview ? [imagePreview] : []}
                  onChange={handleImageUpload}
                  onRemove={() => {
                    setImageFile(null);
                    setImageUrl(null);
                    setImagePreview(null);
                  }}
                  accept="image/jpeg,image/png,image/gif"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  {!imagePreview && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Image</div>
                    </div>
                  )}
                </Upload>
                
                {imagePreview && (
                  <div style={{ marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <p strong>File: </p>
                    <p>{imagePreview.name}</p>
                    <br />
                    <b strong>Size: </b>
                   
                    <p>{imagePreview.size ? (imagePreview.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}</p>
                  </div>
                )}
              </Col>
            </Row>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Space>
                <Button 
                  size="large" 
                  onClick={() => navigate('/admin/hotels')}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={submitting}
                  icon={<SaveOutlined />}
                >
                  {isEdit ? 'Update Hotel' : 'Create Hotel'}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default HotelForm;