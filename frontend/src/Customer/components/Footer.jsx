import React from "react";
import { Row, Col, Divider, Space, Typography } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FacebookFilled,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const Footer = () => {
  const navigate = useNavigate();

  const socialLinks = [
    { icon: <FacebookFilled />, url: "#" },
    { icon: <TwitterOutlined />, url: "#" },
    { icon: <InstagramOutlined />, url: "#" },
    { icon: <LinkedinFilled />, url: "#" },
  ];

  return (
    <footer style={{ background: '#1e272e', color: 'white', paddingTop: '80px', marginTop: '32px' }}>
      <div className="container-xl" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <Row gutter={[48, 48]}>
          {/* Company Info */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '40px', background: 'var(--primary-color)', marginRight: '15px' }}></div>
                <Title level={3} style={{ color: 'white', margin: 0 }}>Rima Tours</Title>
              </div>

              <Text style={{ color: 'var(--primary-light)', fontStyle: 'italic', display: 'block', marginBottom: '20px', fontSize: '1.1rem' }}>
                "India ke rang, Rima ke sang"
              </Text>

              <Paragraph style={{ color: '#a4b0be', lineHeight: '1.8', fontSize: '1rem' }}>
                Discover India's beauty with our curated tour packages and customized travel experiences. We believe in creating memories that last a lifetime, ensuring every journey is special.
              </Paragraph>

              <Space size="large" style={{ marginTop: '20px' }}>
                {socialLinks.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.url}
                    target="_blank"
                    whileHover={{ y: -5, color: '#ff4757' }}
                    style={{ color: 'white', fontSize: '1.8rem', transition: 'color 0.3s' }}
                  >
                    {item.icon}
                  </motion.a>
                ))}
              </Space>
            </motion.div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Title level={4} style={{ color: 'white', marginBottom: '25px' }}>Quick Links</Title>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: "Home", link: "/" },
                  { label: "About Us", link: "/about" },
                  { label: "Contact Us", link: "/contact" },
                  { label: "My Bookings", link: "/my-bookings" }
                ].map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '12px' }}>
                    <a
                      onClick={() => navigate(item.link)}
                      style={{ color: '#a4b0be', cursor: 'pointer', transition: 'color 0.3s', fontSize: '1rem' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                      onMouseLeave={(e) => e.target.style.color = '#a4b0be'}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </Col>

          {/* Popular Tours */}
          <Col xs={24} sm={12} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Title level={4} style={{ color: 'white', marginBottom: '25px' }}>Popular Tours</Title>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: "Family Tours", link: "/tours?type=family" },
                  { label: "Honeymoon Packages", link: "/tours?type=honeymoon" },
                  { label: "Adventure Trips", link: "/tours?type=adventure" },
                  { label: "Customize Trip", link: "/customize-tour" }
                ].map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '12px' }}>
                    <a
                      onClick={() => navigate(item.link)}
                      style={{ color: '#a4b0be', cursor: 'pointer', transition: 'color 0.3s', fontSize: '1rem' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                      onMouseLeave={(e) => e.target.style.color = '#a4b0be'}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Title level={4} style={{ color: 'white', marginBottom: '25px' }}>Contact Us</Title>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <EnvironmentOutlined style={{ color: 'var(--primary-color)', fontSize: '1.3rem', marginTop: '2px' }} />
                  <Text style={{ color: '#a4b0be', lineHeight: '1.6' }}>
                    G-4, Navrang Complex, Swastik Cross Rd, Navrangpura, Ahmedabad, Gujarat 380009
                  </Text>
                </li>
                <li style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <PhoneOutlined style={{ color: 'var(--primary-color)', fontSize: '1.3rem' }} />
                  <a href="tel:+919876543210" style={{ color: '#a4b0be', transition: 'color 0.3s' }}>+91 98765 43210</a>
                </li>
                <li style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <MailOutlined style={{ color: 'var(--primary-color)', fontSize: '1.3rem' }} />
                  <a href="mailto:info@rimatoursandtravels.com" style={{ color: '#a4b0be', transition: 'color 0.3s' }}>
                    info@rimatours.com
                  </a>
                </li>
              </ul>
            </motion.div>
          </Col>
        </Row>

        <Divider style={{ borderColor: "rgba(255,255,255,0.1)", margin: "60px 0 30px" }} />

        {/* Footer Bottom */}
        <Row align="middle" justify="space-between" style={{ paddingBottom: '30px' }}>
          <Col xs={24} md={12}>
            <Text style={{ color: '#747d8c' }}>
              &copy; {new Date().getFullYear()} Rima Tours & Travels. All rights reserved.
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space split={<Divider type="vertical" style={{ borderColor: '#747d8c' }} />}>
              {['Privacy Policy', 'Terms & Conditions', 'Refund Policy'].map((item, idx) => (
                <a key={idx} href={`#`} style={{ color: '#747d8c', fontSize: '0.9rem' }}>
                  {item}
                </a>
              ))}
            </Space>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;
