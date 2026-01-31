import { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Image,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Empty
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Title, Text } = Typography;

const DestinationView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDestination();
    }
  }, [id]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_DESTINATION_DETAIL(id));
      const destinationData = response.data?.data || response.data;
      setDestination(destinationData);
    } catch (error) {
      console.error('Error fetching destination:', error);
      message.error('Failed to load destination details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Empty description="Destination not found" />
        <Button type="primary" onClick={() => navigate('/admin/destinations')}>
          Back to List
        </Button>
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
          <div style={{ 
            marginBottom: '24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Title level={2} style={{ margin: 0 }}>
              {destination.name}
            </Title>
            <Space>
              <Button 
                icon={<EditOutlined />}
                type="primary"
                onClick={() => navigate(`/admin/destinations/edit/${destination.id}`)}
              >
                Edit
              </Button>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/destinations')}
              >
                Back to List
              </Button>
            </Space>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Destination Information" size="small">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Name">
                    <strong>{destination.name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Country">
                    {destination.country || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={destination.is_active ? 'green' : 'red'}>
                      {destination.is_active ? 'Active' : 'Inactive'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {destination.description || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Places to Visit">
                    {destination.places || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {new Date(destination.created_at).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {new Date(destination.updated_at).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <PictureOutlined />
                    Images ({destination.images?.length || 0})
                  </Space>
                } 
                size="small"
              >
                {destination.images && destination.images.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {destination.images.map((image, index) => (
                      <Col xs={12} sm={8} key={image.id || index}>
                        <div style={{ textAlign: 'center' }}>
                          <Image
                            src={image.image.startsWith('http') 
                              ? image.image 
                              : `http://127.0.0.1:8000${image.image}`}
                            alt={image.caption || `Image ${index + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '120px', 
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                          />
                          {image.is_featured && (
                            <Tag color="gold" size="small" style={{ marginTop: '4px' }}>
                              Featured
                            </Tag>
                          )}
                          {image.caption && (
                            <Text 
                              style={{ 
                                display: 'block', 
                                fontSize: '0.8rem', 
                                color: '#666',
                                marginTop: '4px',
                                textAlign: 'center'
                              }}
                            >
                              {image.caption}
                            </Text>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No images uploaded"
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default DestinationView;