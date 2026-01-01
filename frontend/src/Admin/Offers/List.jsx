import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { RangePicker } = DatePicker;
const { Option } = Select;

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [form] = Form.useForm();

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
      // Set dummy data
      setOffers([
        {
          id: 1,
          name: "Monsoon Special",
          discount: "15% off",
          start_date: "2024-08-01",
          end_date: "2024-08-29",
          status: "expired",
        },
        {
          id: 2,
          name: "Diwali Dhamaka Sale",
          discount: "10% off",
          start_date: "2024-10-12",
          end_date: "2024-10-25",
          status: "active",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOffer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    form.setFieldsValue({
      name: offer.name,
      discount: offer.discount,
      status: offer.status,
      dateRange: [dayjs(offer.start_date), dayjs(offer.end_date)],
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        name: values.name,
        discount_percentage: values.discount,
        status: values.status,
        start_date: values.dateRange[0].format("YYYY-MM-DD"),
        end_date: values.dateRange[1].format("YYYY-MM-DD"),
      };

      if (editingOffer) {
        await apiClient.put(
          endpoints.GET_OFFER_DETAIL(editingOffer.id),
          submitData
        );
        message.success("Offer updated successfully");
      } else {
        await apiClient.post(endpoints.GET_OFFERS, submitData);
        message.success("Offer created successfully");
      }
      setModalVisible(false);
      fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      message.error("Failed to save offer");
    }
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

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      inactive: "orange",
      expired: "red",
    };
    return colors[status] || "default";
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
      dataIndex: "discount_percentage",
      key: "discount",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (is_active) => {
        const status = is_active ? "active" : "inactive";
        return <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>;
      },
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

      {/* Add/Edit Modal */}
      <Modal
        title={editingOffer ? "Edit Offer" : "Add Offer"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Offer Name"
            rules={[{ required: true, message: "Please enter offer name" }]}
          >
            <Input placeholder="Enter offer name" />
          </Form.Item>

          <Form.Item
            name="discount"
            label="Discount"
            rules={[{ required: true, message: "Please enter discount" }]}
          >
            <Input placeholder="e.g., 15% off, ₹5000 off" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Offer Period"
            rules={[{ required: true, message: "Please select offer period" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="expired">Expired</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingOffer ? "Update" : "Create"} Offer
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OffersList;
