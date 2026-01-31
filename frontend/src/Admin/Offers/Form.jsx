import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, DatePicker, Select, message, InputNumber, Radio } from "antd";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const OfferForm = ({ visible, onClose, onSaved, initialValues = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);
  const [discountType, setDiscountType] = useState('PERCENTAGE');

  useEffect(() => {
    if (visible) {
      fetchTours();
    }
  }, [visible]);

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        date_range: initialValues.start_date && initialValues.end_date 
          ? [dayjs(initialValues.start_date), dayjs(initialValues.end_date)]
          : null,
        applicable_tours: initialValues.applicable_tours || []
      };
      form.setFieldsValue(formValues);
      setDiscountType(initialValues.discount_type || 'PERCENTAGE');
    } else {
      form.resetFields();
      setDiscountType('PERCENTAGE');
    }
  }, [initialValues, form]);

  const fetchTours = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      const toursData = response.data?.data || response.data?.results || response.data || [];
      setTours(toursData);
    } catch (error) {
      console.error("Failed to fetch tours:", error);
      message.error("Failed to load tours");
    }
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Transform the data for API
      const payload = {
        name: values.name,
        description: values.description || "",
        discount_type: values.discount_type,
        discount_percentage: values.discount_type === 'PERCENTAGE' ? values.discount_percentage : null,
        discount_amount: values.discount_type === 'FIXED_AMOUNT' ? values.discount_amount : null,
        start_date: values.date_range[0].format('YYYY-MM-DD'),
        end_date: values.date_range[1].format('YYYY-MM-DD'),
        is_active: values.is_active !== false,
        applicable_tours: values.applicable_tours || []
      };

      if (initialValues && initialValues.id) {
        await apiClient.put(endpoints.GET_OFFER_DETAIL(initialValues.id), payload);
        message.success("Offer updated successfully!");
      } else {
        await apiClient.post(endpoints.GET_OFFERS, payload);
        message.success("Offer created successfully!");
      }
      
      onSaved();
      onClose();
      form.resetFields();
      setDiscountType('PERCENTAGE');
    } catch (err) {
      console.error("Error saving offer:", err);
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        Object.keys(errors).forEach(field => {
          form.setFields([{
            name: field,
            errors: Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          }]);
        });
      } else {
        message.error("Failed to save offer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateDiscountPercentage = (_, value) => {
    if (discountType === 'PERCENTAGE') {
      if (value === null || value === undefined) {
        return Promise.reject(new Error('Please enter discount percentage'));
      }
      if (value < 0 || value > 100) {
        return Promise.reject(new Error('Discount percentage must be between 0 and 100'));
      }
    }
    return Promise.resolve();
  };

  const validateDiscountAmount = (_, value) => {
    if (discountType === 'FIXED_AMOUNT') {
      if (value === null || value === undefined) {
        return Promise.reject(new Error('Please enter discount amount'));
      }
      if (value <= 0) {
        return Promise.reject(new Error('Discount amount must be greater than 0'));
      }
    }
    return Promise.resolve();
  };

  const handleDiscountTypeChange = (e) => {
    const newType = e.target.value;
    setDiscountType(newType);
    
    // Clear the other discount field when switching types
    if (newType === 'PERCENTAGE') {
      form.setFieldsValue({ discount_amount: undefined });
    } else {
      form.setFieldsValue({ discount_percentage: undefined });
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Offer" : "Create Offer"}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ is_active: true, discount_type: 'PERCENTAGE' }}
      >
        <Form.Item 
          name="name" 
          label="Offer Name" 
          rules={[
            { required: true, message: 'Please enter offer name' },
            { min: 3, message: 'Offer name must be at least 3 characters' }
          ]}
        >
          <Input placeholder="e.g., Summer Special Discount" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="Description"
        >
          <TextArea 
            rows={3} 
            placeholder="Describe the offer details..."
          />
        </Form.Item>

        <Form.Item
          name="discount_type"
          label="Discount Type"
          rules={[{ required: true, message: 'Please select discount type' }]}
        >
          <Radio.Group onChange={handleDiscountTypeChange} value={discountType}>
            <Radio value="PERCENTAGE">Percentage Discount</Radio>
            <Radio value="FIXED_AMOUNT">Fixed Amount Discount</Radio>
          </Radio.Group>
        </Form.Item>

        {discountType === 'PERCENTAGE' && (
          <Form.Item
            name="discount_percentage"
            label="Discount Percentage (%)"
            rules={[{ validator: validateDiscountPercentage }]}
            extra="Enter a number between 0 and 100 (e.g., 10 for 10% discount)"
          >
            <InputNumber
              min={0}
              max={100}
              precision={2}
              style={{ width: '100%' }}
              placeholder="10"
              addonAfter="%"
            />
          </Form.Item>
        )}

        {discountType === 'FIXED_AMOUNT' && (
          <Form.Item
            name="discount_amount"
            label="Discount Amount (₹)"
            rules={[{ validator: validateDiscountAmount }]}
            extra="Enter the fixed discount amount (e.g., 500 for ₹500 off)"
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="500"
              addonBefore="₹"
            />
          </Form.Item>
        )}

        <Form.Item
          name="date_range"
          label="Validity Period"
          rules={[{ required: true, message: 'Please select validity period' }]}
        >
          <RangePicker 
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder={['Start Date', 'End Date']}
          />
        </Form.Item>

        <Form.Item
          name="applicable_tours"
          label="Applicable Tours"
          extra="Select tours where this offer can be applied. Leave empty to apply to all tours."
        >
          <Select
            mode="multiple"
            placeholder="Select tours..."
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {tours.map(tour => (
              <Select.Option key={tour.id} value={tour.id}>
                {tour.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          name="is_active" 
          label="Active" 
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OfferForm;
