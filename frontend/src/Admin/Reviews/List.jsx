import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  message,
  Tag,
  Rate,
  Input,
  Select,
  Avatar,
  Button,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;

const ReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_REVIEWS);
      const reviewsData = response.data?.data || response.data?.results || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Failed to load reviews');
      // Set dummy data
      setReviews([
        {
          id: 1,
          user: { username: 'jay_patel', email: 'jay@example.com' },
          tour: { name: 'Vietnam Discovery Tour' },
          rating: 5,
          comment: 'Best tour package also best hotels overall nice experience and will like to book again soon',
          created_at: '2024-01-20',
          is_verified: true,
        },
        {
          id: 2,
          user: { username: 'priya_sharma', email: 'priya@example.com' },
          tour: { name: 'Sikkim Adventure' },
          rating: 4,
          comment: 'Amazing mountain views and great hospitality. Highly recommended for adventure lovers.',
          created_at: '2024-01-18',
          is_verified: true,
        },
        {
          id: 3,
          user: { username: 'rahul_kumar', email: 'rahul@example.com' },
          tour: { name: 'Goa Beach Holiday' },
          rating: 5,
          comment: 'Perfect beach holiday with family. Kids enjoyed a lot. Will definitely book again.',
          created_at: '2024-01-15',
          is_verified: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_REVIEW_DETAIL(id));
      message.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      message.error('Failed to delete review');
    }
  };

  const handleStatusUpdate = async (reviewId, newStatus) => {
    try {
      const updateData = {
        is_verified: newStatus === 'approved'
      };
      await apiClient.patch(endpoints.GET_REVIEW_DETAIL(reviewId), updateData);
      message.success(`Review ${newStatus} successfully`);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      message.error('Failed to update review status');
    }
  };

  const filteredReviews = Array.isArray(reviews) ? reviews.filter((review) => {
    const matchesSearch =
      review.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      review.tour?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchText.toLowerCase());
    const matchesRating = filterRating === 'all' || review.rating?.toString() === filterRating;
    return matchesSearch && matchesRating;
  }) : [];

  const getStatusColor = (isVerified) => {
    return isVerified ? 'green' : 'orange';
  };

  const getStatusLabel = (isVerified) => {
    return isVerified ? 'APPROVED' : 'PENDING';
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {record.user?.username}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.user?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tour',
      key: 'tour',
      width: 120,
      render: (_, record) => (
        <Tag color="blue">{record.tour?.name}</Tag>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating) => <Rate disabled defaultValue={rating} />,
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (comment) => (
        <div style={{ maxWidth: 300 }}>
          {comment}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_verified',
      key: 'is_verified',
      width: 100,
      render: (isVerified) => (
        <Tag color={getStatusColor(isVerified)}>
          {getStatusLabel(isVerified)}
        </Tag>
      ),
      filters: [
        { text: 'Approved', value: true },
        { text: 'Pending', value: false },
      ],
      onFilter: (value, record) => record.is_verified === value,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {!record.is_verified && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleStatusUpdate(record.id, 'approved')}
            >
              Approve
            </Button>
          )}
          {record.is_verified && (
            <Button
              danger
              size="small"
              onClick={() => handleStatusUpdate(record.id, 'rejected')}
            >
              Reject
            </Button>
          )}
          <Popconfirm
            title="Are you sure you want to delete this review?"
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
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Reviews Management</h2>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search reviews..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Filter by rating"
            style={{ width: 150 }}
            value={filterRating}
            onChange={setFilterRating}
          >
            <Option value="all">All Ratings</Option>
            <Option value="5">5 Stars</Option>
            <Option value="4">4 Stars</Option>
            <Option value="3">3 Stars</Option>
            <Option value="2">2 Stars</Option>
            <Option value="1">1 Star</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredReviews}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} reviews`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ReviewsList;