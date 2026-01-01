import React, { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { QuestionCircleOutlined, CloseOutlined } from "@ant-design/icons";
import "./InquiryButton.css";
import { endpoints } from "../../constant/ENDPOINTS";
import {apiClient} from "../../services/api"
const InquiryButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Transform form data to match backend API
      const inquiryData = {
        name: values.name,
        email: values.email,
        contact_number: values.phone,
        inquiry_date: new Date().toISOString().split('T')[0], // Today's date
        message: `Tour Type: ${values.tourType}\n\n${values.message}`,
      };
      
      await apiClient.post(endpoints.SUBMIT_INQUIRY, inquiryData);
      message.success(
        "Thank you for your inquiry. We'll get back to you soon!"
      );
      form.resetFields();
      setModalOpen(false);
    } catch (error) {
      console.error('Inquiry form error:', error);
      message.error("Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        className="inquiry-float-button"
        type="primary"
        shape="circle"
        size="large"
        icon={<QuestionCircleOutlined />}
        onClick={() => setModalOpen(true)}
        title="Send Inquiry"
      />

      <Modal
        title={
          <div
            style={{
              textAlign: "center",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            Send Your Inquiry
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={420}
        centered
        closeIcon={<CloseOutlined />}
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Your Name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="Your Email" type="email" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Please enter your phone" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Please enter a valid 10-digit phone number",
              },
            ]}
          >
            <Input placeholder="Phone Number" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="tourType"
            rules={[{ required: true, message: "Please select tour type" }]}
          >
            <Input placeholder="Tour Type (e.g., Domestic, International, Couple)" />
          </Form.Item>

          <Form.Item
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea placeholder="Your Inquiry/Message" rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
            >
              Submit Inquiry
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default InquiryButton;
