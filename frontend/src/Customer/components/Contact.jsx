import React from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Divider,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import "./Contact.css";
import { endpoints } from "../../constant/ENDPOINTS";
import apiClient from "../../services/api";
const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Transform form data to match backend API
      const inquiryData = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        contact_number: values.phone,
        inquiry_date: new Date().toISOString().split('T')[0], // Today's date
        message: `Subject: ${values.subject}\n\n${values.message}`,
      };
      
      await apiClient.post(endpoints.SUBMIT_INQUIRY, inquiryData);
      message.success(
        "Thank you for reaching out! We'll get back to you soon."
      );
      form.resetFields();
    } catch (error) {
      console.error('Contact form error:', error);
      message.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header */}
        <motion.section
          className="contact-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with us today!</p>
        </motion.section>

        <Row gutter={[32, 32]}>
          {/* Contact Info */}
          <Col xs={24} lg={8}>
            <motion.div
              className="contact-info-section"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Phone */}
              <Card className="contact-card">
                <PhoneOutlined className="contact-icon" />
                <h3>Phone</h3>
                <p>
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </p>
                <small>Available Monday - Saturday, 10 AM - 6 PM</small>
              </Card>

              {/* Email */}
              <Card className="contact-card">
                <MailOutlined className="contact-icon" />
                <h3>Email</h3>
                <p>
                  <a href="mailto:info@rimatours.com">
                    info@rimatours.com
                  </a>
                </p>
                <small>We'll respond within 24 hours</small>
              </Card>

              {/* Address */}
              <Card className="contact-card">
                <EnvironmentOutlined className="contact-icon" />
                <h3>Address</h3>
                <p>
                  G-4, Navrang Complex,
                  <br />
                  Swastik Cross Rd, opp. Asia House,
                  <br />
                  Shrimali Society,
                  <br />
                  Navrangpura, Ahmedabad,
                  <br />
                  Gujarat 380009
                </p>
              </Card>
            </motion.div>
          </Col>

          {/* Contact Form */}
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="contact-form-card">
                <h2>Send us a Message</h2>
                <Form
                  form={form}
                  onFinish={onFinish}
                  layout="vertical"
                  autoComplete="off"
                  size="large"
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="firstName"
                        rules={[
                          { required: true, message: "Please enter first name" },
                        ]}
                      >
                        <Input placeholder="First Name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="lastName"
                        rules={[
                          { required: true, message: "Please enter last name" },
                        ]}
                      >
                        <Input placeholder="Last Name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Please enter email" },
                      { type: "email", message: "Invalid email" },
                    ]}
                  >
                    <Input placeholder="Email Address" type="email" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: "Please enter phone number" },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    ]}
                  >
                    <Input placeholder="Phone Number" maxLength={10} />
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    rules={[{ required: true, message: "Please enter subject" }]}
                  >
                    <Input placeholder="Subject" />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    rules={[
                      { required: true, message: "Please enter message" },
                      {
                        min: 10,
                        message: "Message must be at least 10 characters",
                      },
                    ]}
                  >
                    <Input.TextArea placeholder="Your Message" rows={5} />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      size="large"
                    >
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>

                <Divider />

                <p className="form-note">
                  💬 We typically respond to messages within 24 hours. For urgent
                  matters, please call us directly.
                </p>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Map Section */}
        <motion.section
          className="map-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Find Us on Map</h2>
          <div className="map-container">
            <iframe
              title="Rima Tours Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5540047063787!2d72.55319!3d23.049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f1d6e0c5cf%3A0x7c8b5e5e5e5e5e5e!2sNavrangpura%2C%20Ahmedabad!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: 8 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Contact;
