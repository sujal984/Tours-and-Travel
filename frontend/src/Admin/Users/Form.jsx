import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Option } = Select;

const UserForm = ({ visible, onClose, onSaved, initialValues = null }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (initialValues && initialValues.id) {
        await apiClient.put(endpoints.UPDATE_USER(initialValues.id), values);
      } else {
        await apiClient.post(endpoints.GET_ALL_USERS, values);
      }
      onSaved();
      onClose();
    } catch (err) {
      // validation errors handled by antd
      console.error(err);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit User" : "Create User"}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || { role: "customer" }}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select>
            <Option value="customer">Customer</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          help="Leave empty when editing to keep current password"
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;
