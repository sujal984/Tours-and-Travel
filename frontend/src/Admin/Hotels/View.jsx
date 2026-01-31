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
  Empty,
  Rate
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  HomeOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Title, Text } = Typography;

const HotelView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchHotel();
    }
  }, [id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_HOTEL_DETAIL(id));
      const hotelData = response.data?.data || response.data;
      setHotel(hotelData);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      message.error('Failed to load hotel details');
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

  if (!hotel) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Empty description="Hotel not found" />
        <Button type="primary" onClick={() => navigate('/admin/hotels')}>
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
              <HomeOutlined style={{ marginRight: '8px' }} />
              {hotel.name}
            </Title>
            <Space>
              <Button 
                icon={<EditOutlined />}
                type="primary"
                onClick={() => navigate(`/admin/hotels/edit/${hotel.id}`)}
              >
                Edit
              </Button>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/hotels')}
              >
                Back to List
              </Button>
            </Space>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Hotel Information" size="small">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Hotel Name">
                    <strong>{hotel.name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Destination">
                    {hotel.destination_display || hotel.destination?.name || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {hotel.address || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hotel Type">
                    {hotel.hotel_type ? (
                      <Tag color="blue">{hotel.hotel_type}</Tag>
                    ) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Star Rating">
                    {hotel.star_rating ? (
                      <Space>
                        <Rate disabled defaultValue={hotel.star_rating} />
                        <Text>({hotel.star_rating} stars)</Text>
                      </Space>
                    ) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={hotel.is_active ? 'green' : 'red'}>
                      {hotel.is_active ? 'Active' : 'Inactive'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {new Date(hotel.created_at).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {new Date(hotel.updated_at).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <StarOutlined />
                    Hotel Image
                  </Space>
                } 
                size="small"
              >
                {hotel.image ? (
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={hotel.image.startsWith('http') 
                        ? hotel.image 
                        : `http://127.0.0.1:8000${hotel.image}`}
                      alt={hotel.name}
                      style={{ 
                        width: '100%', 
                        maxHeight: '300px', 
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary">Hotel Image</Text>
                    </div>
                  </div>
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No image uploaded"
                    style={{ padding: '40px 0' }}
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* Additional Information Section */}
          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col xs={24}>
              <Card title="Additional Details" size="small">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <HomeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                      <div style={{ marginTop: '8px' }}>
                        <Text strong>Hotel Type</Text>
                        <div>{hotel.hotel_type || 'Not specified'}</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <StarOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                      <div style={{ marginTop: '8px' }}>
                        <Text strong>Rating</Text>
                        <div>
                          {hotel.star_rating ? `${hotel.star_rating} Star${hotel.star_rating > 1 ? 's' : ''}` : 'Not rated'}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        backgroundColor: hotel.is_active ? '#52c41a' : '#ff4d4f',
                        margin: '0 auto'
                      }} />
                      <div style={{ marginTop: '8px' }}>
                        <Text strong>Status</Text>
                        <div>{hotel.is_active ? 'Active' : 'Inactive'}</div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default HotelView;