import React, { useState } from "react";
import { Button, Modal, Form, Input, message, Typography } from "antd";
import { QuestionCircleOutlined, CloseOutlined, SendOutlined, UserOutlined, MailOutlined, PhoneOutlined, LoginOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

import { endpoints } from "../../constant/ENDPOINTS";
import { apiClient } from "../../services/api";
import { useUser } from "../../context/userContext";
import { storeAnonymousInquiryToken, generateAnonymousToken } from "../../utils/inquiryUtils";
import LoginModal from "./Auth/LoginModal";
import RegisterModal from "./Auth/RegisterModal";

const { Title, Text } = Typography;

const InquiryButton = () => {
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [submittedInquiryData, setSubmittedInquiryData] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const inquiryData = {
        name: values.name,
        email: values.email,
        contact_number: values.phone,
        inquiry_date: new Date().toISOString().split("T")[0],
        message: `Tour Type: ${values.tourType}\n\n${values.message}`,
      };

      // Add anonymous token if user is not logged in
      if (!user) {
        inquiryData.anonymous_token = generateAnonymousToken();
      }

      const response = await apiClient.post(endpoints.SUBMIT_INQUIRY, inquiryData);
      
      // Store anonymous token if user is not logged in
      if (!user && response.data?.data?.anonymous_token) {
        storeAnonymousInquiryToken(response.data.data.anonymous_token);
        setSubmittedInquiryData(inquiryData);
      }

      message.success("Thank you! We'll be in touch shortly.");
      form.resetFields();
      setModalOpen(false);

      // Show login prompt for anonymous users
      if (!user) {
        setTimeout(() => {
          setShowLoginPrompt(true);
        }, 1000);
      }
    } catch (error) {
      console.error("Inquiry form error:", error);
      message.error("Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<QuestionCircleOutlined style={{ fontSize: '24px' }} />}
          onClick={() => setModalOpen(true)}
          style={{
            width: '60px', height: '60px',
            boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)',
            border: 'none',
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))'
          }}
        />
      </motion.div>

      {/* Main Inquiry Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={450}
        centered
        closeIcon={<CloseOutlined style={{ fontSize: '1.2rem' }} />}
        bodyStyle={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}
        className="premium-modal"
      >
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            width: '50px', height: '50px', background: 'var(--primary-lighter)', borderRadius: '50%',
            margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <QuestionCircleOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
          </div>
          <Title level={3} style={{ marginBottom: '5px' }}>How can we help?</Title>
          <Text type="secondary">Send us your query and we'll get back to you.</Text>
        </div>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="Your Name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ required: true, type: "email", message: "Invalid email" }]}
          >
            <Input prefix={<MailOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="Your Email" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, pattern: /^[0-9]{10}$/, message: "10-digit number" }]}
          >
            <Input prefix={<PhoneOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="Phone Number" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="tourType"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Interested in... (e.g. Family Trip)" />
          </Form.Item>

          <Form.Item
            name="message"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input.TextArea placeholder="Tell us more about your plans..." rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              icon={<SendOutlined />}
              style={{ height: '50px', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}
            >
              Submit Inquiry
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Login Prompt Modal for Anonymous Users */}
      <Modal
        open={showLoginPrompt}
        onCancel={() => setShowLoginPrompt(false)}
        footer={null}
        width={400}
        centered
        closeIcon={<CloseOutlined />}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{
            width: '60px', height: '60px', background: 'var(--primary-lighter)', borderRadius: '50%',
            margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <LoginOutlined style={{ fontSize: '28px', color: 'var(--primary-color)' }} />
          </div>
          
          <Title level={3} style={{ marginBottom: '12px' }}>
            Track Your Inquiry
          </Title>
          
          <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '24px' }}>
            Create an account or login to track your inquiry status and see our responses.
          </Text>

          <div style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                setShowLoginPrompt(false);
                setLoginModalVisible(true);
              }}
              style={{
                width: '100%',
                marginBottom: '12px',
                height: '48px',
                borderRadius: '8px',
              }}
            >
              Login to Track
            </Button>
            
            <Button
              size="large"
              onClick={() => {
                setShowLoginPrompt(false);
                setRegisterModalVisible(true);
              }}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '8px',
              }}
            >
              Create Account
            </Button>
          </div>

          <Button
            type="text"
            onClick={() => setShowLoginPrompt(false)}
            style={{ color: '#8c8c8c' }}
          >
            Maybe Later
          </Button>
        </div>
      </Modal>

      {/* Login Modal */}
      <LoginModal
        open={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onRegisterClick={() => {
          setLoginModalVisible(false);
          setRegisterModalVisible(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        open={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
        onLoginClick={() => {
          setRegisterModalVisible(false);
          setLoginModalVisible(true);
        }}
      />
    </>
  );
};

export default InquiryButton;
