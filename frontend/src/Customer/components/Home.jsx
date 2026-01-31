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
  CheckCircleOutlined,
  ArrowRightOutlined,
  StarFilled,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const Home = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselItems, setCarouselItems] = useState([]);

  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    fetchTours();
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_DESTINATIONS);
      const destinationsData = response.data?.data || response.data?.results || [];
      setDestinations(destinationsData);
      
      // Create carousel items from destinations with images
      const carouselData = [];
      destinationsData.forEach(dest => {
        if (dest.images && dest.images.length > 0) {
          dest.images.forEach(img => {
            carouselData.push({
              url: img.image.startsWith('http') ? img.image : `http://127.0.0.1:8000${img.image}`,
              title: `Discover ${dest.name}`,
              subtitle: img.caption || `Experience the beauty of ${dest.name}`,
            });
          });
        }
      });
      
      // If we have destination images, use them, otherwise use fallback
      if (carouselData.length > 0) {
        setCarouselItems(carouselData);
      } else {
        setCarouselItems([
          {
            url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80",
            title: "Discover Incredible India",
            subtitle: "Experience the magic of diverse cultures and landscapes",
          },
          {
            url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80",
            title: "Adventure Awaits",
            subtitle: "From mountain peaks to ocean depths, explore it all",
          },
          {
            url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
            title: "Serene Escapes",
            subtitle: "Find your peace in the most beautiful destinations",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      // Fallback carousel items
      setCarouselItems([
        {
          url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80",
          title: "Discover Incredible India",
          subtitle: "Experience the magic of diverse cultures and landscapes",
        },
        {
          url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80",
          title: "Adventure Awaits",
          subtitle: "From mountain peaks to ocean depths, explore it all",
        },
        {
          url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
          title: "Serene Escapes",
          subtitle: "Find your peace in the most beautiful destinations",
        },
      ]);
    }
  };

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      // console.log("Tours Response:", response.data);
      const toursData = (response?.data?.data || []).map(t => {
        const basePrice = Number(t.base_price) || 0;
        const currentPrice = Number(t.current_price) || 0;
        const seasonalPrices = (t.seasonal_pricings || []).map(p => Number(p.two_sharing_price)).filter(p => !isNaN(p) && p > 0);
        
        // Use the minimum of all available prices, with base_price as fallback
        const allPrices = [currentPrice, basePrice, ...seasonalPrices].filter(p => !isNaN(p) && p > 0);
        const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : basePrice;
        
        return { ...t, startingPrice: minPrice };
      });
      // Set all tours for the carousel
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <div className="hero-section">
        <Carousel autoplay autoplaySpeed={5000} effect="fade" dots>
          {carouselItems.map((item, index) => (
            <div key={index}>
              <div className="carousel-slide">
                <img src={item.url} alt={item.title} />
                <div className="carousel-overlay">
                  <div className="carousel-content">
                    <motion.h1
                      initial={{ opacity: 0, y: -50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      {item.title}
                    </motion.h1>
                    {item.subtitle && (
                      <motion.p
                        className="carousel-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                      >
                        {item.subtitle}
                      </motion.p>
                    )}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <Button
                        type="primary"
                        size="large"
                        className="btn-primary-gradient"
                        style={{ height: '50px', padding: '0 40px', fontSize: '1.2rem' }}
                        onClick={() => navigate("/tours")}
                      >
                        Explore Tours
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Main Content */}
      <div style={{ background: 'var(--bg-secondary)', paddingBottom: 'var(--spacing-4xl)' }}>

        {/* Welcome Section */}
        <div className="section-wrapper container-xl" style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-3xl) var(--spacing-xl)' }}>
          <Row gutter={[64, 32]} align="middle">
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ width: '40px', height: '2px', background: 'var(--primary-color)' }}></span>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>About Us</span>
                </div>
                <h2 className="section-title" style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                  Plan Your Trip with <span className="text-gradient">Rima Tours</span>
                </h2>
                <p className="font-lg text-secondary" style={{ marginBottom: '2rem' }}>
                  We offer the best tour packages and travel experiences across
                  India and around the world. Whether you're looking for a
                  family vacation, romantic getaway, or adventure tour, we've
                  got the perfect package for you.
                </p>

                <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
                  {['Personalized Itineraries', 'Expert Guides', '750+ Destinations', '24/7 Support'].map((item, idx) => (
                    <Col span={12} key={idx}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircleOutlined style={{ color: 'var(--primary-color)' }} />
                        <span style={{ fontWeight: 500 }}>{item}</span>
                      </div>
                    </Col>
                  ))}
                </Row>

                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    className="btn-primary-gradient"
                    onClick={() => navigate("/tours")}
                  >
                    Start Your Journey
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    className="btn-secondary"
                    onClick={() => navigate("/customize-tour")}
                  >
                    Customize Tour
                  </Button>
                </Space>
              </motion.div>
            </Col>
            <Col xs={24} lg={12}>
              <motion.div
                style={{ position: 'relative' }}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  border: '3px solid var(--primary-color)',
                  borderRadius: 'var(--radius-lg)',
                  zIndex: 0
                }}></div>
                <img
                  src="https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80"
                  alt="Travel"
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    position: 'relative',
                    zIndex: 1
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '-30px',
                  background: 'white',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'var(--success-bg)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--success-color)',
                    fontSize: '1.5rem'
                  }}>
                    <StarFilled />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>4.9/5</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Customer Reviews</p>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>

        {/* Stats Section */}
        <div className="stats-container">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} sm={6}>
              <motion.div className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <div className="stat-number">5k+</div>
                <div className="stat-label">Happy Travelers</div>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <div className="stat-number">150+</div>
                <div className="stat-label">Tour Packages</div>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                <div className="stat-number">15+</div>
                <div className="stat-label">Years Experience</div>
              </motion.div>
            </Col>
            <Col xs={12} sm={6}>
              <motion.div className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                <div className="stat-number">50+</div>
                <div className="stat-label">Destinations</div>
              </motion.div>
            </Col>
          </Row>
        </div>

        {/* Popular Tours Section */}
        <div className="section-wrapper" style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-3xl) var(--spacing-xl)' }}>
          <div className="section-header-center">
            <span style={{ color: 'var(--primary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>Explore</span>
            <h2 className="section-title">Popular Tour Packages</h2>
            <p className="text-secondary">Check out our most popular and bestselling tour packages chosen by our customers.</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin />
                <p style={{ marginTop: '10px' }}>Loading amazing tours...</p>
              </div>
            ) : tours?.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={32}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  1024: {
                    slidesPerView: 3,
                  },
                  1280: {
                    slidesPerView: 4,
                  },
                }}
                style={{ paddingBottom: '50px' }}
              >
                {tours.map((tour, index) => (
                  <SwiperSlide key={tour.id} style={{ height: 'auto' }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                      <Card
                        className="custom-card"
                        hoverable
                        cover={
                          <div style={{ position: 'relative', overflow: 'hidden', height: '240px' }}>
                            <img
                              alt={tour.name}
                              src={
                                tour.featured_image ||
                                (tour.destinations && tour.destinations.length > 0 && tour.destinations[0].images && tour.destinations[0].images.length > 0 
                                  ? (tour.destinations[0].images[0].image.startsWith('http') 
                                      ? tour.destinations[0].images[0].image 
                                      : `http://127.0.0.1:8000${tour.destinations[0].images[0].image}`)
                                  : `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=240&fit=crop`)
                              }
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '15px',
                              right: '15px',
                              background: 'rgba(255,255,255,0.9)',
                              padding: '5px 10px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              color: 'var(--primary-color)'
                            }}>
                              {tour.category || "Hot Deal"}
                            </div>
                          </div>
                        }
                        bodyStyle={{ padding: '0', display: 'flex', flexDirection: 'column', height: 'calc(100% - 240px)' }}
                        onClick={() => navigate(`/tours/${tour.id}`)}
                      >
                        <div className="tour-card-content">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            <ClockCircleOutlined /> {tour.duration_days || "5"} Days
                            <span style={{ margin: '0 5px' }}>•</span>
                            <EnvironmentOutlined /> {tour.location || "India"}
                          </div>
                          <h3 className="tour-title" style={{ height: '50px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {tour.name}
                          </h3>

                          <div className="tour-price-section">
                            <div>
                              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>From</span>
                              <div className="tour-price">₹{tour.startingPrice?.toLocaleString() || "15,000"}</div>
                            </div>
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<ArrowRightOutlined />}
                              className="btn-primary-gradient"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tours/${tour.id}`);
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  color: 'var(--text-tertiary)', 
                  marginBottom: '16px' 
                }}>
                  🏖️
                </div>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  No Tours Available Yet
                </h3>
                <p style={{ color: 'var(--text-tertiary)' }}>
                  We're working on adding amazing tour packages. Check back soon!
                </p>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Button disabled={tours?.length <= 0} size="large" onClick={() => navigate('/tours')} className="btn-secondary">View All Packages</Button>
            </div>
          </motion.div>
        </div>

        {/* Why Choose Us Section */}
        <div style={{ background: 'white', padding: 'var(--spacing-3xl) 0' }}>
          <div className="container-xl" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--spacing-xl)' }}>
            <div className="section-header-center">
              <span style={{ color: 'var(--primary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>Why Us</span>
              <h2 className="section-title">Why Choose Rima Tours?</h2>
            </div>

            <Row gutter={[32, 32]}>
              {[
                {
                  title: "Best Price Guarantee",
                  description: "We ensure you get the best rates for your travel packages without compromising on quality.",
                  icon: "💰",
                  color: "#ffe0df",
                },
                {
                  title: "Expert Travel Guides",
                  description: "Our experienced guides ensure you have the most authentic and safe travel experience.",
                  icon: "👥",
                  color: "#e0f2fe",
                },
                {
                  title: "24/7 Customer Support",
                  description: "We are always available to assist you at any step of your journey, day or night.",
                  icon: "🛡️",
                  color: "#dcfce7",
                },
                {
                  title: "100% Customizable",
                  description: "Tailor your itinerary exactly how you want it. Your trip, your rules.",
                  icon: "✨",
                  color: "#fef3c7",
                },
              ].map((item, index) => (
                <Col key={index} xs={24} sm={12} lg={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    style={{
                      padding: '30px',
                      background: 'white',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      height: '100%',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      margin: '0 auto 20px'
                    }}>
                      {item.icon}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* Contact CTA Section */}
        <div style={{
          background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80")',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 'var(--spacing-4xl) 0',
          textAlign: 'center',
          color: 'white'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}
          >
            <h2 style={{ color: 'white', fontSize: '3rem', marginBottom: '20px' }}>Ready to Plan Your Dream Vacation?</h2>
            <p style={{ fontSize: '1.25rem', marginBottom: '40px', opacity: 0.9 }}>
              Get in touch with our travel experts today and get a customized quote for your next adventure.
            </p>
            <Space direction="horizontal" size="large" wrap>
              <Button
                type="primary"
                size="large"
                icon={<PhoneOutlined />}
                href="tel:+919876543210"
                className="btn-primary-gradient"
                style={{ height: '50px', padding: '0 30px' }}
              >
                Call Us Now
              </Button>
              <Button
                size="large"
                icon={<MailOutlined />}
                href="mailto:info@rimatoursandtravels.com"
                ghost
                style={{ height: '50px', padding: '0 30px', border: '2px solid white', color: 'white' }}
              >
                Email Us
              </Button>
            </Space>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
