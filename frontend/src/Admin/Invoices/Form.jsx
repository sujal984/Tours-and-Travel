import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Space, message } from "antd";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import dayjs from "dayjs";

const { Option } = Select;

const InvoicesForm = ({ visible, onClose, onSaved, initialValues = null }) => {
  const [form] = Form.useForm();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const amount = Form.useWatch('amount', form);
  const taxAmount = Form.useWatch('tax_amount', form);

  useEffect(() => {
    if (visible) {
      fetchBookings();
    }
  }, [visible]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        due_date: initialValues.due_date ? dayjs(initialValues.due_date) : null,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, visible]);

  useEffect(() => {
    const total = (Number(amount) || 0) + (Number(taxAmount) || 0);
    form.setFieldsValue({ total_amount: total });
  }, [amount, taxAmount]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await apiClient.get(endpoints.GET_BOOKINGS);
      const data = response.data?.data || response.data?.results || [];
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        due_date: values.due_date.format("YYYY-MM-DD"),
        status: values.status.toUpperCase(),
      };

      if (initialValues && initialValues.id) {
        await apiClient.put(endpoints.GET_INVOICE_DETAIL(initialValues.id), payload);
        message.success("Invoice updated successfully");
      } else {
        // Correct endpoint for creation is CREATE_INVOICE or GET_INVOICES (POST)
        const createUrl = endpoints.CREATE_INVOICE || endpoints.GET_INVOICES;
        await apiClient.post(createUrl, payload);
        message.success("Invoice created successfully");
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("An error occurred while saving the invoice");
      }
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Invoice" : "Create Invoice"}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: "UNPAID", tax_amount: 0 }}
      >
        <Form.Item
          name="booking"
          label="Select Booking"
          rules={[{ required: true, message: "Please select a booking" }]}
        >
          <Select
            placeholder="Search booking by customer or tour"
            loading={loadingBookings}
            showSearch
            optionFilterProp="children"
          >
            {bookings.map((b) => (
              <Option key={b.id} value={b.id}>
                #{b.id} - {b.user?.username || b.user_details?.username} ({b.tour?.title || b.tour_details?.name})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Space style={{ display: 'flex' }} align="baseline">
          <Form.Item
            name="amount"
            label="Base Amount"
            rules={[{ required: true, message: "Amount is required" }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="tax_amount"
            label="Tax Amount"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="total_amount"
            label="Total Amount"
          >
            <InputNumber
              disabled
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Space>

        <Space style={{ display: 'flex' }} align="baseline">
          <Form.Item
            name="due_date"
            label="Due Date"
            rules={[{ required: true, message: "Due date is required" }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="status" label="Status" style={{ width: 200 }}>
            <Select>
              <Option value="DRAFT">Draft</Option>
              <Option value="SENT">Sent</Option>
              <Option value="PAID">Paid</Option>
              <Option value="UNPAID">Unpaid</Option>
              <Option value="OVERDUE">Overdue</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Form.Item>
        </Space>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Extra information..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InvoicesForm;
