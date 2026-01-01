import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, message } from "antd";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Option } = Select;
const { TextArea } = Input;

const PricingForm = ({ visible, onClose, onSaved, initialValues = null }) => {
  const [form] = Form.useForm();
  const [tours, setTours] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchTours();
      fetchSeasons();
    }
  }, [visible]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        tour: initialValues.tour,
        season: initialValues.season,
        price: initialValues.price,
        description: initialValues.description,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const fetchTours = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      const toursData = response.data?.data || response.data?.results || [];
      setTours(Array.isArray(toursData) ? toursData : []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_SEASONS);
      const seasonsData = response.data?.data || response.data?.results || [];
      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      // Set dummy seasons data
      setSeasons([
        { id: 1, name: 'Peak Season', description: 'High demand period' },
        { id: 2, name: 'Off Season', description: 'Low demand period' },
        { id: 3, name: 'Shoulder Season', description: 'Medium demand period' },
      ]);
    }
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (initialValues && initialValues.id) {
        await apiClient.put(endpoints.GET_PRICING_DETAIL(initialValues.id), values);
        message.success('Pricing updated successfully');
      } else {
        await apiClient.post(endpoints.GET_PRICINGS, values);
        message.success('Pricing created successfully');
      }
      
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving pricing:', err);
      message.error('Failed to save pricing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Pricing" : "Create Pricing"}
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
      >
        <Form.Item
          name="tour"
          label="Tour"
          rules={[{ required: true, message: 'Please select a tour' }]}
        >
          <Select placeholder="Select tour">
            {tours.map(tour => (
              <Option key={tour.id} value={tour.id}>
                {tour.name || tour.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="season"
          label="Season"
          rules={[{ required: true, message: 'Please select a season' }]}
        >
          <Select placeholder="Select season">
            {seasons.map(season => (
              <Option key={season.id} value={season.id}>
                {season.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="price"
          label="Price (₹)"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Enter price"
            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/₹\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            rows={3}
            placeholder="Enter pricing description (optional)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PricingForm;
