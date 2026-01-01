import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const PaymentsForm = ({ visible, onClose, onSaved, initialValues = null }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (initialValues && initialValues.id) {
        await apiClient.put(endpoints.GET_PAYMENT_DETAIL(initialValues.id), values);
      } else {
        await apiClient.post(endpoints.CREATE_PAYMENT, values);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Payment" : "Create Payment"}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || { status: "pending" }}
      >
        <Form.Item
          name="booking"
          label="Booking ID"
          rules={[{ required: true }]}
        >
          <Input placeholder="Booking ID (numeric)" />
        </Form.Item>
        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="failed">Failed</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentsForm;
