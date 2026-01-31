import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Modal,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import OfferForm from "./Form";

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_OFFERS);
      const offersData = response.data?.data || response.data?.results || [];
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      message.error("Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOffer(null);
    setModalVisible(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_OFFER_DETAIL(id));
      message.success("Offer deleted successfully");
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      message.error("Failed to delete offer");
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingOffer(null);
  };

  const handleOfferSaved = () => {
    fetchOffers();
  };

  const getStatusColor = (isActive, startDate, endDate) => {
    const now = dayjs();
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    if (!isActive) return "red";
    if (now.isBefore(start)) return "orange";
    if (now.isAfter(end)) return "red";
    return "green";
  };

  const getStatusText = (isActive, startDate, endDate) => {
    const now = dayjs();
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    if (!isActive) return "INACTIVE";
    if (now.isBefore(start)) return "UPCOMING";
    if (now.isAfter(end)) return "EXPIRED";
    return "ACTIVE";
  };

  const columns = [
    {
      title: "Offer Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Discount",
      dataIndex: "discount_display",
      key: "discount",
      render: (discount, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{discount}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
          </div>
        </div>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
      sorter: (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
      sorter: (a, b) => dayjs(a.end_date).unix() - dayjs(b.end_date).unix(),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const color = getStatusColor(record.is_active, record.start_date, record.end_date);
        const text = getStatusText(record.is_active, record.start_date, record.end_date);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Applicable Tours",
      dataIndex: "applicable_tours_count",
      key: "applicable_tours",
      render: (count) => count || "All Tours",
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
                title: "Are you sure you want to delete this offer?",
                content: "This action cannot be undone.",
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
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Offers Management</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Offer
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={offers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} offers`,
          }}
        />
      </Card>

      <OfferForm
        visible={modalVisible}
        onClose={handleModalClose}
        onSaved={handleOfferSaved}
        initialValues={editingOffer}
      />
    </div>
  );
};

export default OffersList;
