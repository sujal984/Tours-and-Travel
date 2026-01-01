import React, { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const RefundsForm = ({ visible, onClose, onSaved, cancellation = null }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && cancellation) {
      form.setFieldsValue({
        cancellation: cancellation.id,
        refunded_payment: 0,
        cancellation_charges: 0,
        refund_date: new Date().toISOString().split("T")[0],
      });
    } else {
      form.resetFields();
    }
  }, [visible, cancellation]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post(endpoints.GET_REFUNDS, values);
      message.success("Refund processed successfully");
      onSaved();
    } catch (err) {
      console.error(err);
      message.error("Failed to process refund");
    }
  };

  return (
    <Modal
      title={`Process Refund for Cancellation #${cancellation?.id}`}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="cancellation" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Booking Details"
        >
          <p><strong>Booking ID:</strong> {cancellation?.booking}</p>
          <p><strong>Reason:</strong> {cancellation?.reason_for_cancellation}</p>
        </Form.Item>

        <Form.Item
          name="refunded_payment"
          label="Refund Amount"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <Input type="number" prefix="₹" />
        </Form.Item>

        <Form.Item
          name="cancellation_charges"
          label="Cancellation Charges"
          rules={[{ required: true, message: "Please enter charges" }]}
        >
          <Input type="number" prefix="₹" />
        </Form.Item>

        <Form.Item
          name="refund_date"
          label="Refund Date"
          rules={[{ required: true }]}
        >
          <Input type="date" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RefundsForm;
