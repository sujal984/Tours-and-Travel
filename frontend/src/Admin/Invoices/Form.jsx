import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const InvoicesForm = ({ visible, onClose, onSaved, initialValues = null }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (initialValues && initialValues.id) {
        await apiClient.put(endpoints.GET_INVOICE_DETAIL(initialValues.id), values);
      } else {
        await apiClient.post(endpoints.GET_INVOICES, values);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Invoice" : "Create Invoice"}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || { status: "unpaid" }}
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
            <Select.Option value="unpaid">Unpaid</Select.Option>
            <Select.Option value="paid">Paid</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InvoicesForm;
