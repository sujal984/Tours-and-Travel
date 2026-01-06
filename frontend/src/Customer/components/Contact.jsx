import React from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Divider,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SendOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { endpoints } from "../../constant/ENDPOINTS";
import apiClient from "../../services/api";

const { Title, Text, Paragraph } = Typography;

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const inquiryData = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        contact_number: values.phone,
        inquiry_date: new Date().toISOString().split("T")[0],
        message: `Subject: ${values.subject}\n\n${values.message}`,
      };

      await apiClient.post(endpoints.SUBMIT_INQUIRY, inquiryData);
      message.success("Thank you for reaching out! We'll get back to you soon.");
      form.resetFields();
    } catch (error) {
      console.error("Contact form error:", error);
      message.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: 'var(--spacing-3xl)' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '50px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title level={1} style={{ color: 'white', marginBottom: '10px' }}>Contact Us</Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem' }}>We'd love to hear from you. Get in touch with us today!</Text>
        </motion.div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <Row gutter={[40, 40]}>
          {/* Contact Info */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Phone */}
                <Card className="card-hover" bordered={false} bodyStyle={{ padding: '30px', textAlign: 'center' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-lighter)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                    color: 'var(--primary-color)', fontSize: '24px'
                  }}>
                    <PhoneOutlined />
                  </div>
                  <Title level={4} style={{ marginBottom: '10px' }}>Phone</Title>
                  <Text type="secondary" style={{ display: 'block' }}>Mon-Sat 10 AM - 6 PM</Text>
                  <a href="tel:+919876543210" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '5px', display: 'block' }}>+91 98765 43210</a>
                </Card>

                {/* Email */}
                <Card className="card-hover" bordered={false} bodyStyle={{ padding: '30px', textAlign: 'center' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-lighter)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                    color: 'var(--primary-color)', fontSize: '24px'
                  }}>
                    <MailOutlined />
                  </div>
                  <Title level={4} style={{ marginBottom: '10px' }}>Email</Title>
                  <Text type="secondary" style={{ display: 'block' }}>We'll respond within 24 hours</Text>
                  <a href="mailto:info@rimatours.com" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '5px', display: 'block' }}>info@rimatours.com</a>
                </Card>

                {/* Address */}
                <Card className="card-hover" bordered={false} bodyStyle={{ padding: '30px', textAlign: 'center' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-lighter)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                    color: 'var(--primary-color)', fontSize: '24px'
                  }}>
                    <EnvironmentOutlined />
                  </div>
                  <Title level={4} style={{ marginBottom: '10px' }}>Address</Title>
                  <Text type="secondary">
                    G-4, Navrang Complex, Swastik Cross Rd,<br />
                    Navrangpura, Ahmedabad,<br />
                    Gujarat 380009
                  </Text>
                </Card>
              </div>
            </motion.div>
          </Col>

          {/* Contact Form */}
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card bordered={false} className="card-hover" title={<Title level={3} style={{ margin: 0 }}>Send us a Message</Title>}>
                <Form
                  form={form}
                  onFinish={onFinish}
                  layout="vertical"
                  size="large"
                >
                  <Row gutter={20}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[{ required: true, message: "Please enter first name" }]}
                      >
                        <Input placeholder="John" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[{ required: true, message: "Please enter last name" }]}
                      >
                        <Input placeholder="Doe" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={20}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: "Please enter email" },
                          { type: "email", message: "Invalid email" },
                        ]}
                      >
                        <Input placeholder="john@example.com" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                          { required: true, message: "Please enter phone number" },
                          { pattern: /^[0-9]{10}$/, message: "Valid 10-digit number required" },
                        ]}
                      >
                        <Input placeholder="9876543210" maxLength={10} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="subject"
                    label="Subject"
                    rules={[{ required: true, message: "Please enter subject" }]}
                  >
                    <Input placeholder="How can we help you?" />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Message"
                    rules={[
                      { required: true, message: "Please enter message" },
                      { min: 10, message: "Message must be at least 10 characters" },
                    ]}
                  >
                    <Input.TextArea placeholder="Type your message here..." rows={6} />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      icon={<SendOutlined />}
                      style={{ height: '50px', paddingLeft: '40px', paddingRight: '40px', fontSize: '1.1rem' }}
                    >
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Map Section */}
        <motion.section
          style={{ marginTop: '50px' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card bordered={false} bodyStyle={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }} className="card-hover">
            <iframe
              title="Rima Tours Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5540047063787!2d72.55319!3d23.049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f1d6e0c5cf%3A0x7c8b5e5e5e5e5e5e!2sNavrangpura%2C%20Ahmedabad!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default Contact;
