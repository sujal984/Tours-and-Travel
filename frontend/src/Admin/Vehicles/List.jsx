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
  Alert,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import { endpoints } from '../../constant/ENDPOINTS';
import { apiClient } from '../../services/api';

const { TextArea } = Input;

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_VEHICLES);
      const vehiclesData = response.data?.data || response.data?.results || response.data || [];
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      message.error('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setFormErrors({});
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormErrors({});
    form.setFieldsValue({
      vehicle_no: vehicle.vehicle_no,
      name: vehicle.name,
      description: vehicle.description,
      capacity: vehicle.capacity,
      vehicle_type: vehicle.vehicle_type,
    });
    setModalVisible(true);
  };

  const parseErrorResponse = (error) => {
    const errors = {};
    let generalMessage = 'Failed to save vehicle';

    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle different error response formats
      if (errorData.errors) {
        // Django REST Framework validation errors
        Object.keys(errorData.errors).forEach(field => {
          const fieldErrors = errorData.errors[field];
          if (Array.isArray(fieldErrors)) {
            errors[field] = fieldErrors.join(', ');
          } else {
            errors[field] = fieldErrors;
          }
        });
      } else if (errorData.message) {
        generalMessage = errorData.message;
      } else if (errorData.detail) {
        generalMessage = errorData.detail;
      } else if (typeof errorData === 'string') {
        generalMessage = errorData;
      }

      // Handle specific validation errors
      if (errorData.vehicle_no) {
        errors.vehicle_no = Array.isArray(errorData.vehicle_no) 
          ? errorData.vehicle_no.join(', ') 
          : errorData.vehicle_no;
      }
      if (errorData.name) {
        errors.name = Array.isArray(errorData.name) 
          ? errorData.name.join(', ') 
          : errorData.name;
      }
      if (errorData.capacity) {
        errors.capacity = Array.isArray(errorData.capacity) 
          ? errorData.capacity.join(', ') 
          : errorData.capacity;
      }
      if (errorData.vehicle_type) {
        errors.vehicle_type = Array.isArray(errorData.vehicle_type) 
          ? errorData.vehicle_type.join(', ') 
          : errorData.vehicle_type;
      }
      if (errorData.description) {
        errors.description = Array.isArray(errorData.description) 
          ? errorData.description.join(', ') 
          : errorData.description;
      }

      // Handle duplicate errors with user-friendly messages
      if (error.response.status === 400) {
        if (errorData.vehicle_no && errorData.vehicle_no.includes('already exists')) {
          errors.vehicle_no = 'This vehicle number is already registered';
        }
        if (errorData.name && (errorData.name.includes('already exists') || errorData.name.includes('unique'))) {
          errors.name = 'A vehicle with this name already exists';
        }
        if (JSON.stringify(errorData).toLowerCase().includes('unique') || 
            JSON.stringify(errorData).toLowerCase().includes('duplicate')) {
          generalMessage = 'A vehicle with these details already exists. Please check vehicle number and name.';
        }
      }
    }

    return { errors, generalMessage };
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      setFormErrors({});

      // Client-side validation
      const clientErrors = {};
      
      // Check for duplicate vehicle number in existing vehicles (excluding current vehicle if editing)
      const existingVehicleWithNumber = vehicles.find(v => 
        v.vehicle_no.toLowerCase() === values.vehicle_no.toLowerCase() && 
        (!editingVehicle || v.id !== editingVehicle.id)
      );
      if (existingVehicleWithNumber) {
        clientErrors.vehicle_no = 'This vehicle number is already registered';
      }

      // Check for duplicate vehicle name (excluding current vehicle if editing)
      const existingVehicleWithName = vehicles.find(v => 
        v.name.toLowerCase() === values.name.toLowerCase() && 
        (!editingVehicle || v.id !== editingVehicle.id)
      );
      if (existingVehicleWithName) {
        clientErrors.name = 'A vehicle with this name already exists';
      }

      // Validate capacity
      if (values.capacity && (values.capacity < 1 || values.capacity > 50)) {
        clientErrors.capacity = 'Capacity must be between 1 and 50 passengers';
      }

      // Validate vehicle number format (basic validation)
      if (values.vehicle_no && !/^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/.test(values.vehicle_no)) {
        clientErrors.vehicle_no = 'Vehicle number format should be: XX-00-XX-0000 (e.g., GJ-01-AB-1234)';
      }

      if (Object.keys(clientErrors).length > 0) {
        setFormErrors(clientErrors);
        message.error('Please fix the validation errors');
        return;
      }

      // Submit to server
      if (editingVehicle) {
        await apiClient.put(endpoints.GET_VEHICLE_DETAIL(editingVehicle.id), values);
        message.success('Vehicle updated successfully');
      } else {
        await apiClient.post(endpoints.GET_VEHICLES, values);
        message.success('Vehicle created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      
      const { errors, generalMessage } = parseErrorResponse(error);
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        message.error('Please fix the validation errors');
      } else {
        message.error(generalMessage);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_VEHICLE_DETAIL(id));
      message.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          'Failed to delete vehicle';
      message.error(errorMessage);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setFormErrors({});
    form.resetFields();
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
      render: (capacity) => `${capacity} passengers`,
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
            title="Delete Vehicle"
            description="Are you sure you want to delete this vehicle? This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
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
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Spin spinning={submitLoading}>
          {Object.keys(formErrors).length > 0 && (
            <Alert
              message="Validation Errors"
              description="Please fix the errors below and try again."
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="vehicle_no"
              label="Vehicle Number"
              rules={[
                { required: true, message: 'Please enter vehicle number' },
                { 
                  pattern: /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/, 
                  message: 'Format: XX-00-XX-0000 (e.g., GJ-01-AB-1234)' 
                }
              ]}
              validateStatus={formErrors.vehicle_no ? 'error' : ''}
              help={formErrors.vehicle_no}
            >
              <Input 
                placeholder="Enter vehicle number (e.g., GJ-01-AB-1234)" 
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  if (formErrors.vehicle_no) {
                    setFormErrors(prev => ({ ...prev, vehicle_no: undefined }));
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="Vehicle Name"
              rules={[
                { required: true, message: 'Please enter vehicle name' },
                { min: 2, message: 'Vehicle name must be at least 2 characters' },
                { max: 50, message: 'Vehicle name must not exceed 50 characters' }
              ]}
              validateStatus={formErrors.name ? 'error' : ''}
              help={formErrors.name}
            >
              <Input 
                placeholder="Enter vehicle name (e.g., INNOVA, BOLERO)" 
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  if (formErrors.name) {
                    setFormErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="vehicle_type"
              label="Vehicle Type"
              rules={[
                { required: true, message: 'Please enter vehicle type' },
                { min: 2, message: 'Vehicle type must be at least 2 characters' }
              ]}
              validateStatus={formErrors.vehicle_type ? 'error' : ''}
              help={formErrors.vehicle_type}
            >
              <Input 
                placeholder="Enter vehicle type (e.g., SUV, Sedan, Bus)" 
                onChange={() => {
                  if (formErrors.vehicle_type) {
                    setFormErrors(prev => ({ ...prev, vehicle_type: undefined }));
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Capacity (Passengers)"
              rules={[
                { required: true, message: 'Please enter capacity' },
                // { type: 'number', min: 1, max: 50, message: 'Capacity must be between 1 and 50' }
              ]}
              validateStatus={formErrors.capacity ? 'error' : ''}
              help={formErrors.capacity}
            >
              <Input 
                type="number" 
                min={1} 
                max={50}
                placeholder="Enter passenger capacity (1-50)" 
                onChange={() => {
                  if (formErrors.capacity) {
                    setFormErrors(prev => ({ ...prev, capacity: undefined }));
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter description' },
                { min: 10, message: 'Description must be at least 10 characters' },
                { max: 500, message: 'Description must not exceed 500 characters' }
              ]}
              validateStatus={formErrors.description ? 'error' : ''}
              help={formErrors.description}
            >
              <TextArea
                rows={3}
                placeholder="Enter vehicle description or special instructions (e.g., Comfortable for long distance travel, AC available)"
                showCount
                maxLength={500}
                onChange={() => {
                  if (formErrors.description) {
                    setFormErrors(prev => ({ ...prev, description: undefined }));
                  }
                }}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button onClick={handleModalCancel}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={submitLoading}
                >
                  {editingVehicle ? 'Update' : 'Create'} Vehicle
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default VehiclesList;