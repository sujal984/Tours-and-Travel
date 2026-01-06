import React from "react";
import { Row, Col, Card, Button, Divider, Timeline, Space, Typography } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TeamOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  GlobalOutlined,
  GiftOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />,
      title: "Expert Team",
      description: "15+ years of experience in travel industry with passionate travel consultants"
    },
    {
      icon: <DollarOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />,
      title: "Best Prices",
      description: "Competitive pricing without compromising on quality and comfort"
    },
    {
      icon: <CustomerServiceOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your travel needs"
    },
    {
      icon: <SettingOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />,
      title: "Customization",
      description: "Fully customizable packages tailored to your preferences"
    },
    {
      icon: <GlobalOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />,
      title: "Wide Network",
      description: "Partnerships with hotels, transport, and local guides across India"
    },
    {
      icon: <GiftOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />,
      title: "Special Offers",
      description: "Regular discounts and special packages for group bookings"
    },
  ];

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
          <Title level={1} style={{ color: 'white', marginBottom: '10px' }}>About Rima Tours</Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', fontStyle: 'italic' }}>"India ke rang, Rima ke sang"</Text>
        </motion.div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

        {/* Mission & Vision */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className="card-hover" bordered={false} bodyStyle={{ padding: '30px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ padding: '10px', background: 'var(--primary-lighter)', borderRadius: '50%', marginRight: '15px' }}>
                    <CheckCircleOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
                  </div>
                  <Title level={3} style={{ margin: 0 }}>Our Mission</Title>
                </div>
                <Paragraph style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                  To provide the best travel experiences that create lifelong memories and allow people to explore the beauty of India and the world with comfort and confidence. We strive to make every journey a story worth telling.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="card-hover" bordered={false} bodyStyle={{ padding: '30px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ padding: '10px', background: 'var(--primary-lighter)', borderRadius: '50%', marginRight: '15px' }}>
                    <GlobalOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
                  </div>
                  <Title level={3} style={{ margin: 0 }}>Our Vision</Title>
                </div>
                <Paragraph style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                  To become the most trusted and preferred travel partner for Indians, known for our unwavering commitment to quality service, reliability, and customer satisfaction. We aim to open the world to every traveler.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </motion.section>

        <Divider style={{ margin: '60px 0' }} />

        {/* Why Choose Us */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2}>Why Choose Us?</Title>
            <Text type="secondary" style={{ fontSize: '1.1rem' }}>We bring you the best deals and experiences.</Text>
          </div>

          <Row gutter={[24, 24]}>
            {features.map((item, idx) => (
              <Col key={idx} xs={24} sm={12} lg={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <Card hoverable className="card-hover" bordered={false} style={{ textAlign: 'center', height: '100%' }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                      {item.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: '10px' }}>{item.title}</Title>
                    <Text type="secondary">{item.description}</Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.section>

        <Divider style={{ margin: '60px 0' }} />

        {/* Our Journey */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Title level={2}>Our Journey</Title>
              <Text type="secondary" style={{ fontSize: '1.1rem' }}>A timeline of our growth and success.</Text>
            </div>

            <Timeline
              mode="alternate"
              items={[
                {
                  color: 'var(--primary-color)',
                  children: (
                    <div style={{ padding: '0 20px' }}>
                      <Title level={4} style={{ margin: 0 }}>2010 - The Beginning</Title>
                      <Text>Founded with a vision to make travel accessible to everyone.</Text>
                    </div>
                  ),
                },
                {
                  color: 'var(--accent-color)',
                  children: (
                    <div style={{ padding: '0 20px' }}>
                      <Title level={4} style={{ margin: 0 }}>2013 - Initial Growth</Title>
                      <Text>Expanded to 50+ tour packages and reached 1000+ satisfied customers.</Text>
                    </div>
                  ),
                },
                {
                  color: 'var(--primary-color)',
                  children: (
                    <div style={{ padding: '0 20px' }}>
                      <Title level={4} style={{ margin: 0 }}>2017 - Digital Transformation</Title>
                      <Text>Launched our comprehensive online booking platform for seamless experiences.</Text>
                    </div>
                  ),
                },
                {
                  color: 'var(--accent-color)',
                  children: (
                    <div style={{ padding: '0 20px' }}>
                      <Title level={4} style={{ margin: 0 }}>2025 - Excellence</Title>
                      <Text>Serving 5000+ happy travelers with premium service and global reach.</Text>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </motion.section>

        <Divider style={{ margin: '60px 0' }} />

        {/* Contact CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="card-hover" bordered={false} bodyStyle={{
            background: 'linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-dark) 100%)',
            padding: '60px 40px',
            textAlign: 'center',
            color: 'white',
            borderRadius: 'var(--radius-lg)'
          }}>
            <Title level={2} style={{ color: 'white', marginBottom: '15px' }}>Ready to Explore with Us?</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: '30px' }}>
              Get in touch with our team to plan your perfect vacation. Custom packages, group tours, and more!
            </Paragraph>
            <Space size="large" wrap>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/contact")}
                style={{
                  height: '50px', padding: '0 30px', fontSize: '1.1rem',
                  background: 'white', color: 'var(--primary-color)', border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Contact Us
              </Button>
              <Button
                ghost
                size="large"
                onClick={() => navigate("/tours")}
                style={{
                  height: '50px', padding: '0 30px', fontSize: '1.1rem',
                  borderColor: 'white', color: 'white', fontWeight: 'bold'
                }}
              >
                Browse Tours
              </Button>
            </Space>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
