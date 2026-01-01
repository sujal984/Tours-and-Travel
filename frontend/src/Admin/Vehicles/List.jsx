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
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import { endpoints } from '../../constant/ENDPOINTS';
import { apiClient } from '../../services/api';

const { TextArea } = Input;

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_VEHICLES);
      const vehiclesData = response.data?.data || response.data?.results || [];
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      message.error('Failed to load vehicles');
      // Set dummy data
      setVehicles([
        {
          id: 1,
          vehicle_no: 'GJ-01-AB-1234',
          name: 'INNOVA',
          description: 'Comfortable for long distance travel',
          capacity: 7,
          vehicle_type: 'SUV',
        },
        {
          id: 2,
          vehicle_no: 'GJ-02-CD-5678',
          name: 'BOLERO',
          description: 'Suitable for mountain terrain',
          capacity: 8,
          vehicle_type: 'SUV',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue({
      vehicle_no: vehicle.vehicle_no,
      name: vehicle.name,
      description: vehicle.description,
      capacity: vehicle.capacity,
      vehicle_type: vehicle.vehicle_type,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingVehicle) {
        await apiClient.put(endpoints.GET_VEHICLE_DETAIL(editingVehicle.id), values);
        message.success('Vehicle updated successfully');
      } else {
        await apiClient.post(endpoints.GET_VEHICLES, values);
        message.success('Vehicle created successfully');
      }
      setModalVisible(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      message.error('Failed to save vehicle');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_VEHICLE_DETAIL(id));
      message.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      message.error('Failed to delete vehicle');
    }
  };

  const columns = [
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicle_no',
      key: 'vehicle_no',
      sorter: (a, b) => a.vehicle_no.localeCompare(b.vehicle_no),
    },
    {
      title: 'Vehicle Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a, b) => a.capacity - b.capacity,
    },
    {
      title: 'Type',
      dataIndex: 'vehicle_type',
      key: 'vehicle_type',
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
          <Popconfirm
            title="Are you sure you want to delete this vehicle?"
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
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Vehicles Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Vehicle
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} vehicles`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
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
            name="vehicle_no"
            label="Vehicle Number"
            rules={[{ required: true, message: 'Please enter vehicle number' }]}
          >
            <Input placeholder="Enter vehicle number (e.g., GJ-01-AB-1234)" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Vehicle Name"
            rules={[{ required: true, message: 'Please enter vehicle name' }]}
          >
            <Input placeholder="Enter vehicle name (e.g., INNOVA, BOLERO)" />
          </Form.Item>

          <Form.Item
            name="vehicle_type"
            label="Vehicle Type"
            rules={[{ required: true, message: 'Please enter vehicle type' }]}
          >
            <Input placeholder="Enter vehicle type (e.g., SUV, Sedan, Bus)" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <Input type="number" min={1} placeholder="Enter passenger capacity" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter vehicle description or special instructions"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingVehicle ? 'Update' : 'Create'} Vehicle
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehiclesList;