import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Carousel,
  Statistic,
  Space,
  Spin,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { apiClient } from "../../services/api";

import "./Home.css";
import { endpoints } from "../../constant/ENDPOINTS";

const Home = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselItems, setCarouselItems] = useState([]);

  useEffect(() => {
    fetchTours();
    setCarouselItems([
      {
        url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80",
        title: "Discover Incredible India",
        subtitle: "Experience the magic of diverse cultures and landscapes"
      },
      {
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80",
        title: "Adventure Awaits",
        subtitle: "From mountain peaks to ocean depths, explore it all"
      },
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
        title: "Serene Escapes",
        subtitle: "Find your peace in the most beautiful destinations"
      }
    ]);
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      console.log("Tours Response:", response.data);
      const toursData = response?.data?.data || []
      setTours(toursData);
    } catch (error) {
      console.error("Error fetching tours:", error);

    } finally {
      setLoading(false);
    }
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-wrapper">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <div className="hero-carousel">
        <Carousel autoplay autoplaySpeed={5000} effect="fade" dots>
          {carouselItems.map((item, index) => (
            <div key={index}>
              <div className="carousel-slide">
                <img src={item.url} alt={item.title} />
                <div className="carousel-overlay">
                  <motion.div
                    className="carousel-content"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <h1>{item.title}</h1>
                    {item.subtitle && <p className="carousel-subtitle">{item.subtitle}</p>}
                    <Button
                      type="primary"
                      size="large"
                      className="carousel-cta"
                      onClick={() => navigate("/tours")}
                    >
                      Explore Tours
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Main Content */}
      <div className="home-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <motion.div
                className="welcome-text"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h1>Welcome to Rima Tours & Travels</h1>
                <p className="welcome-tagline">India ke rang "Rima" ke sang</p>
                <p className="welcome-description">
                  We offer the best tour packages and travel experiences across
                  India and around the world. Whether you're looking for a
                  family vacation, romantic getaway, or adventure tour, we've
                  got the perfect package for you.
                </p>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate("/tours")}
                  >
                    Explore Tours
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    onClick={() => navigate("/customize-tour")}
                  >
                    Customize Your Tour
                  </Button>
                </Space>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=400&fit=crop"
                alt="Travel"
                className="welcome-image"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
              />
            </Col>
          </Row>
        </section>

        {/* Stats Section */}
        <motion.section
          className="stats-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} sm={6}>
              <motion.div variants={itemVariants}>
                <Statistic
                  title="Happy Travelers"
                  value={5000}
                  prefix="+"
                />
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div variants={itemVariants}>
                <Statistic
                  title="Tour Packages"
                  value={150}
                  prefix="+"
                />
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div variants={itemVariants}>
                <Statistic
                  title="Years Experience"
                  value={15}
                  prefix="+"
                />
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div variants={itemVariants}>
                <Statistic
                  title="Destinations"
                  value={50}
                  prefix="+"
                />
              </motion.div>
            </Col>
          </Row>
        </motion.section>

        {/* Popular Tours Section */}
        <section className="tours-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Popular Tour Packages</h2>
            <p className="section-subtitle">
              Check out our most popular and bestselling tour packages
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <Row gutter={[24, 24]}>
              {tours?.map((tour, index) => (
                <Col key={tour.id} xs={24} sm={12} lg={6}>
                  <motion.div
                    className="tour-card-wrapper"
                    variants={cardVariants}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card
                      cover={
                        <div className="tour-image-wrapper">
                          <img
                            src={tour.featured_image || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=240&fit=crop`}
                            alt={tour.name}
                          />
                          <div className="tour-type-badge">{tour.category || "Tour"}</div>
                        </div>
                      }
                      hoverable
                      onClick={() => navigate(`/tours/${tour.id}`)}
                    >
                      <h3>{tour.name}</h3>
                      <p className="tour-duration">
                        <ClockCircleOutlined /> {tour.duration_days || "5"} Days
                      </p>
                      <p className="tour-description-text">
                        {tour.description || "Explore amazing destinations"}
                      </p>
                      <div className="tour-card-footer">
                        <span className="tour-price-text">
                          ₹{tour.base_price || "15,000"}
                        </span>
                        <Button
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tours/${tour.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </section>

        {/* Why Choose Us Section */}
        <section className="why-choose-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Why Choose Us?</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <Row gutter={[32, 32]}>
              {[
                {
                  title: "Best Prices",
                  description: "Competitive pricing with no hidden charges",
                  icon: "💰",
                },
                {
                  title: "Expert Team",
                  description:
                    "Experienced travel consultants to plan your perfect trip",
                  icon: "👥",
                },
                {
                  title: "24/7 Support",
                  description:
                    "Round-the-clock customer support for all your needs",
                  icon: "🛡️",
                },
                {
                  title: "Customization",
                  description:
                    "Fully customizable packages tailored to your preferences",
                  icon: "✨",
                },
              ].map((item, index) => (
                <Col key={index} xs={24} sm={12} lg={6}>
                  <motion.div
                    className="feature-card"
                    variants={itemVariants}
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <span className="feature-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </section>

        {/* Contact CTA Section */}
        <motion.section
          className="contact-cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2>Ready to Plan Your Dream Vacation?</h2>
          <p>Get in touch with our travel experts today</p>
          <div className="cta-buttons">
            <Space direction="horizontal" size="large">
              <Button
                type="primary"
                size="large"
                icon={<PhoneOutlined />}
                href="tel:+919876543210"
                ghost
              >
                Call Us
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<MailOutlined />}
                href="mailto:info@rimatoursandtravels.com"
                ghost
              >
                Email Us
              </Button>
            </Space>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
