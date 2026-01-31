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
  message,
  Spin,
  Upload,
  Image,
  Space,
  Typography,
  Divider
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Title } = Typography;
const { TextArea } = Input;

const DestinationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetchDestination();
    }
  }, [id, isEdit]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_DESTINATION_DETAIL(id));
      const destination = response.data?.data || response.data;
      
      form.setFieldsValue({
        name: destination.name,
        description: destination.description,
        places: destination.places,
        country: destination.country,
        is_active: destination.is_active
      });

      // Set images
      if (destination.images) {
        setImages(destination.images.map(img => ({
          uid: img.id,
          name: img.caption || 'Image',
          status: 'done',
          url: img.image,
          caption: img.caption,
          is_featured: img.is_featured,
          id: img.id
        })));
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
      message.error("Failed to load destination details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('places', values.places || '');
      formData.append('country', values.country || '');
      formData.append('is_active', values.is_active);

      // Handle images
      images.forEach((image, index) => {
        if (image.originFileObj) {
          // New image
          formData.append(`images[${index}]`, image.originFileObj);
          formData.append(`image_captions[${index}]`, image.caption || '');
          formData.append(`image_featured[${index}]`, image.is_featured || false);
        } else if (image.id) {
          // Existing image
          formData.append(`existing_images[${index}]`, image.id);
          formData.append(`existing_captions[${index}]`, image.caption || '');
          formData.append(`existing_featured[${index}]`, image.is_featured || false);
        }
      });

      let response;
      if (isEdit) {
        response = await apiClient.put(endpoints.UPDATE_DESTINATION(id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await apiClient.post(endpoints.CREATE_DESTINATION, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      message.success(`Destination ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/admin/destinations');
    } catch (error) {
      console.error("Error saving destination:", error);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} destination`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = ({ fileList }) => {
    setImages(fileList);
  };

  const handleImageCaptionChange = (uid, caption) => {
    setImages(images.map(img => 
      img.uid === uid ? { ...img, caption } : img
    ));
  };

  const handleImageFeaturedChange = (uid, featured) => {
    setImages(images.map(img => 
      img.uid === uid ? { ...img, is_featured: featured } : img
    ));
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
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
              {isEdit ? 'Edit Destination' : 'Create Destination'}
            </Title>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/destinations')}
            >
              Back to List
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ is_active: true }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="name"
                  label="Destination Name"
                  rules={[{ required: true, message: 'Please enter destination name' }]}
                >
                  <Input placeholder="e.g. Goa, Paris, Tokyo" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="country"
                  label="Country"
                >
                  <Input placeholder="e.g. India, France, Japan" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Describe the destination..."
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="places"
                  label="Places to Visit"
                  help="Comma-separated list of places"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="e.g. Beach, Fort, Market, Temple"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="is_active"
                  label="Active Status"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={4}>Destination Images</Title>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Upload multiple images for this destination. These will be shown in tour carousels.
            </p>

            <Upload
              listType="picture-card"
              fileList={images}
              onChange={handleImageUpload}
              beforeUpload={() => false} // Prevent auto upload
              multiple
            >
              {images.length >= 8 ? null : uploadButton}
            </Upload>

            {images.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>Image Details</Title>
                {images.map((image) => (
                  <Card key={image.uid} size="small" style={{ marginBottom: '8px' }}>
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} sm={6}>
                        <Image
                          src={image.url || URL.createObjectURL(image.originFileObj)}
                          alt="Preview"
                          style={{ width: '100%', maxHeight: '80px', objectFit: 'cover' }}
                        />
                      </Col>
                      <Col xs={24} sm={10}>
                        <Input
                          placeholder="Image caption"
                          value={image.caption}
                          onChange={(e) => handleImageCaptionChange(image.uid, e.target.value)}
                        />
                      </Col>
                      <Col xs={24} sm={6}>
                        <Space>
                          <Switch
                            checked={image.is_featured}
                            onChange={(checked) => handleImageFeaturedChange(image.uid, checked)}
                          />
                          <span>Featured</span>
                        </Space>
                      </Col>
                      <Col xs={24} sm={2}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => setImages(images.filter(img => img.uid !== image.uid))}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            )}

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button 
                  size="large" 
                  onClick={() => navigate('/admin/destinations')}
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
                  {isEdit ? 'Update Destination' : 'Create Destination'}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default DestinationForm;