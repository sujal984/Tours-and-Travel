import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Popconfirm,
  Tag,
  Image,
  Input,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Search } = Input;
const { Option } = Select;

const ToursList = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      const toursData = response.data?.data || response.data?.results || [];
      setTours(Array.isArray(toursData) ? toursData : []);
    } catch (error) {
      console.error("Error fetching tours:", error);
      message.error("Failed to load tours");
      // Set dummy data with correct field names matching backend
      setTours([
        {
          id: 1,
          name: "Sikkim Adventure",
          description: "Explore the beautiful mountains of Sikkim",
          duration_days: 8,
          max_capacity: 15,
          base_price: 25000,
          category: "ADVENTURE",
          difficulty_level: "MODERATE",
          featured_image:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop",
          created_at: "2024-01-15",
        },
        {
          id: 2,
          name: "Vietnam Discovery",
          description: "Discover the beauty of Vietnam",
          duration_days: 9,
          max_capacity: 20,
          base_price: 35000,
          category: "CULTURAL",
          difficulty_level: "EASY",
          featured_image:
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=100&h=100&fit=crop",
          created_at: "2024-01-10",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_TOUR_DETAIL(id));
      message.success("Tour deleted successfully");
      fetchTours();
    } catch (error) {
      console.error("Error deleting tour:", error);
      message.error("Failed to delete tour");
    }
  };

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      (tour.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (tour.description || "").toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === "all" || tour.category === filterType;
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      title: "Image",
      dataIndex: "featured_image",
      key: "featured_image",
      width: 80,
      render: (featured_image, record) => {
        // Handle different image URL formats
        let imageUrl = featured_image;

        // If it's a relative path from backend, prepend the base URL
        if (
          imageUrl &&
          !imageUrl.startsWith("http") &&
          !imageUrl.startsWith("data:")
        ) {
          imageUrl = `http://127.0.0.1:8000${
            imageUrl.startsWith("/") ? "" : "/"
          }${imageUrl}`;
        }

        return (
          <Image
            width={60}
            height={60}
            src={
              imageUrl ||
              "https://via.placeholder.com/60x60/667eea/ffffff?text=T"
            }
            alt={record.name || "Tour"}
            style={{ borderRadius: 8, objectFit: "cover" }}
            fallback="https://via.placeholder.com/60x60/cccccc/ffffff?text=No+Image"
            preview={!!imageUrl}
          />
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },

    {
      title: "Duration",
      dataIndex: "duration_days",
      key: "duration_days",
      render: (days) => `${days} Days`,
      sorter: (a, b) => a.duration_days - b.duration_days,
    },
    {
      title: "Max Capacity",
      dataIndex: "max_capacity",
      key: "max_capacity",
      sorter: (a, b) => a.max_capacity - b.max_capacity,
    },
    {
      title: "Base Price",
      dataIndex: "base_price",
      key: "base_price",
      render: (price) => (price ? `₹${price.toLocaleString()}` : "N/A"),
      sorter: (a, b) => (a.base_price || 0) - (b.base_price || 0),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => {
        const colors = {
          ADVENTURE: "orange",
          RELAXATION: "blue",
          CULTURAL: "green",
          WILDLIFE: "cyan",
          SPIRITUAL: "purple",
          BUSINESS: "gold",
        };
        return <Tag color={colors[category] || "default"}>{category}</Tag>;
      },
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/tours/edit/${record.id}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this tour?"
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
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Tours Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/tours/create")}
          >
            Create New Tour
          </Button>
        </div>

        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Search
            placeholder="Search tours..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Filter by type"
            style={{ width: 150 }}
            value={filterType}
            onChange={setFilterType}
          >
            <Option value="all">All Categories</Option>
            <Option value="ADVENTURE">Adventure</Option>
            <Option value="CULTURAL">Cultural</Option>
            <Option value="RELAXATION">Relaxation</Option>
            <Option value="WILDLIFE">Wildlife</Option>
            <Option value="SPIRITUAL">Spiritual</Option>
            <Option value="BUSINESS">Business</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTours}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tours`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ToursList;
