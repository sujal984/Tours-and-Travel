import React from "react";
import { Row, Col, Card, Button, Divider, Timeline, Space } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./About.css";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Header */}
        <motion.section 
          className="about-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>About Rima Tours & Travels</h1>
          <p>India ke rang "Rima" ke sang</p>
        </motion.section>

        {/* Mission & Vision */}
        <motion.section 
          className="mission-vision"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className="info-card">
                <h3>🎯 Our Mission</h3>
                <p>
                  To provide the best travel experiences that create lifelong
                  memories and allow people to explore the beauty of India and
                  the world with comfort and confidence.
                </p>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="info-card">
                <h3>👁️ Our Vision</h3>
                <p>
                  To become the most trusted and preferred travel partner for
                  Indians, known for quality service, reliability, and customer
                  satisfaction.
                </p>
              </Card>
            </Col>
          </Row>
        </motion.section>

        <Divider />

        {/* Why Choose Us */}
        <motion.section 
          className="why-choose-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Why Choose Us?</h2>
          <Row gutter={[24, 24]}>
            {[
              {
                icon: "⭐",
                title: "Expert Team",
                description:
                  "15+ years of experience in travel industry with passionate travel consultants",
              },
              {
                icon: "💰",
                title: "Best Prices",
                description:
                  "Competitive pricing without compromising on quality and comfort",
              },
              {
                icon: "🛡️",
                title: "24/7 Support",
                description:
                  "Round-the-clock customer support for all your travel needs",
              },
              {
                icon: "✨",
                title: "Customization",
                description:
                  "Fully customizable packages tailored to your preferences",
              },
              {
                icon: "🌍",
                title: "Wide Network",
                description:
                  "Partnerships with hotels, transport, and local guides across India",
              },
              {
                icon: "🎁",
                title: "Special Offers",
                description:
                  "Regular discounts and special packages for group bookings",
              },
            ].map((item, idx) => (
              <Col key={idx} xs={24} sm={12} lg={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <Card className="feature-card">
                    <div className="feature-icon">{item.icon}</div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.section>

        <Divider />

        {/* Our Journey */}
        <motion.section 
          className="journey-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Our Journey</h2>
          <Timeline
            items={[
              {
                children: (
                  <>
                    <p>
                      <strong>2010 - Founded</strong>
                    </p>
                    <p>
                      Started with a vision to make travel accessible to
                      everyone
                    </p>
                  </>
                ),
              },
              {
                children: (
                  <>
                    <p>
                      <strong>2013 - Growth</strong>
                    </p>
                    <p>
                      Expanded to 50+ tour packages and 1000+ satisfied
                      customers
                    </p>
                  </>
                ),
              },
              {
                children: (
                  <>
                    <p>
                      <strong>2017 - Digital Transformation</strong>
                    </p>
                    <p>Launched online booking platform for convenience</p>
                  </>
                ),
              },
              {
                children: (
                  <>
                    <p>
                      <strong>2025 - Excellence</strong>
                    </p>
                    <p>Serving 5000+ happy travelers with premium service</p>
                  </>
                ),
              },
            ]}
          />
        </motion.section>

        <Divider />

        {/* Contact CTA */}
        <motion.section 
          className="contact-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Ready to Explore with Us?</h2>
          <p>Get in touch with our team to plan your perfect vacation</p>
          <Space>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
            <Button 
              type="default" 
              size="large"
              onClick={() => navigate('/tours')}
            >
              Book a Tour
            </Button>
          </Space>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
