import React, { useEffect } from "react";
import { Modal, Form, Input, Switch } from "antd";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const OfferForm = ({ visible, onClose, onSaved, initialValues = null }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (initialValues && initialValues.id) {
        await apiClient.put(endpoints.GET_OFFER_DETAIL(initialValues.id), values);
      } else {
        await apiClient.post(endpoints.GET_OFFERS, values);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Offer" : "Create Offer"}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || { active: true }}
      >
        <Form.Item name="code" label="Code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="discount_percent"
          label="Discount Percent"
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item name="active" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OfferForm;
