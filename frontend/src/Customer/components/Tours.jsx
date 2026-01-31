import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Spin, Empty, Space, Typography, Tag, Select, Input } from "antd";
import {
  FilterOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Title, Text } = Typography;
const { Option } = Select;

const Tours = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    priceRange: "all",
    duration: "all",
    search: "",
  });
  const [selectedDuration, setSelectedDuration] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(endpoints.GET_ALL_TOURS);
        const data = res.data?.data || res.data?.results || res.data || [];

        console.log('Tours API Response:', data); // Debug log

        // Map backend fields to frontend fields
        const mapped = data.map((t) => {
          // Calculate the actual starting price from base_price and all seasonal pricings
          const basePrice = Number(t.base_price) || 0;
          const currentPrice = Number(t.current_price) || 0;
          const seasonalPrices = (t.seasonal_pricings || []).map(p => Number(p.two_sharing_price)).filter(p => !isNaN(p) && p > 0);
          
          // Use the minimum of all available prices, with base_price as fallback
          const allPrices = [currentPrice, basePrice, ...seasonalPrices].filter(p => !isNaN(p) && p > 0);
          const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : basePrice;

          return {
            id: t.id,
            title: t.name,
            type: t.category || "General",
            category: t.category?.toLowerCase(),
            tourType: t.tour_type?.toLowerCase(),
            price: minPrice,
            seasonal_pricings: t.seasonal_pricings || [],
            duration: Number(t.duration_days) || 1,
            image: t.featured_image
              ? t.featured_image.startsWith("http")
                ? t.featured_image
                : `http://127.0.0.1:8000${t.featured_image}`
              : (t.destinations && t.destinations.length > 0 && t.destinations[0].images && t.destinations[0].images.length > 0 
                  ? (t.destinations[0].images[0].image.startsWith('http') 
                      ? t.destinations[0].images[0].image 
                      : `http://127.0.0.1:8000${t.destinations[0].images[0].image}`)
                  : `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop&q=80`),
            description: t.description || "Explore amazing destinations with us",
            rating: t.average_rating || 4.5,
            availability: t.is_active ? "Available" : "Not Available",
            groupSize: `${t.max_capacity || 10} People`,
            location: t.destination_names || t.primary_destination_name || "India",
            destinations: t.destination_names || t.primary_destination_name || "Multiple Destinations"
          };
        });

        console.log('Mapped Tours:', mapped); // Debug log
        setTours(mapped);
      } catch (err) {
        console.error("Failed to fetch tours", err);
        // Fallback for dev
        setTours([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFilter = (filterType, value) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const filteredTours = tours.filter((tour) => {
    // Type/Category/TourType filter
    if (filters.type !== "all") {
      const type = filters.type.toLowerCase();

      // Handle domestic/international specifically (these are tour_type in backend)
      if (type === 'domestic' || type === 'international') {
        if (tour.tourType !== type) return false;
      }
      // Handle couple/family specifically (these are categories in backend)
      else if (type === 'couple') {
        if (tour.category !== 'honeymoon') return false;
      }
      else if (type === 'family') {
        if (tour.category !== 'family') return false;
      }
      // Default fallback for other categories
      else {
        if (tour.category !== type) return false;
      }
    }

    // Search filter
    if (filters.search && !tour.title.toLowerCase().includes(filters.search.toLowerCase()))
      return false;

    // Duration filter
    if (selectedDuration !== "All") {
      const duration = Number(tour.duration);
      if (selectedDuration === "Under 5 Days" && duration >= 5)
        return false;
      if (
        selectedDuration === "5-10 Days" &&
        (duration < 5 || duration > 10)
      )
        return false;
      if (selectedDuration === "10+ Days" && duration <= 10) return false;
    }

    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: 'var(--spacing-4xl)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 0 60px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'white' }}>Find Your Next Adventure</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Browse through our wide range of curated tour packages</p>
        </motion.div>
      </div>

      <div className="container-xl" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--spacing-xl)' }}>
        <Row gutter={[48, 48]}>
          {/* Filters Sidebar */}
          <Col xs={24} lg={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'sticky', top: '100px' }}
            >
              <Card className="card" bordered={false} style={{ borderRadius: 'var(--radius-lg)' }}>
                <Title level={4} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FilterOutlined style={{ color: 'var(--primary-color)' }} /> Filters
                </Title>

                <div style={{ marginBottom: '1.5rem' }}>
                  <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Search</Text>
                  <Input
                    placeholder="Search destinations..."
                    prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
                    onChange={(e) => handleFilter('search', e.target.value)}
                    style={{ borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Duration</Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {["All", "Under 5 Days", "5-10 Days", "10+ Days"].map(
                      (opt) => (
                        <Button
                          key={opt}
                          block
                          type={selectedDuration === opt ? "primary" : "default"}
                          onClick={() => setSelectedDuration(opt)}
                          className={selectedDuration === opt ? "btn-primary-gradient" : ""}
                          style={{ textAlign: 'left', borderRadius: 'var(--radius-md)' }}
                        >
                          {opt}
                        </Button>
                      )
                    )}
                  </Space>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Tour Type</Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {["all", "domestic", "international", "couple", "family"].map(
                      (type) => (
                        <Button
                          key={type}
                          block
                          type={filters.type === type ? "primary" : "text"}
                          onClick={() => handleFilter("type", type)}
                          style={{ textAlign: 'left', borderRadius: 'var(--radius-md)', textTransform: 'capitalize' }}
                        >
                          {type}
                        </Button>
                      )
                    )}
                  </Space>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Tours Grid */}
          <Col xs={24} lg={18}>
            {filteredTours.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <Row gutter={[24, 24]}>
                  {filteredTours.map((tour) => (
                    <Col key={tour.id} xs={24} sm={12} lg={8}>
                      <motion.div variants={cardVariants} style={{ height: '100%' }}>
                        <Card
                          className="custom-card"
                          hoverable
                          cover={
                            <div style={{ position: 'relative', overflow: 'hidden', height: '220px' }}>
                              <img
                                alt={tour.title}
                                src={tour.image}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'rgba(255,255,255,0.95)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: 'var(--primary-color)',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}>
                                {tour.type?.toUpperCase()}
                              </div>
                            </div>
                          }
                          bodyStyle={{ padding: "0", display: 'flex', flexDirection: 'column', height: 'calc(100% - 220px)' }}
                          onClick={() => navigate(`/tours/${tour.id}`)}
                        >
                          <div className="tour-card-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ClockCircleOutlined /> {tour.duration} Days
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <UserOutlined /> {tour.groupSize}
                              </span>
                            </div>

                            <h3 className="tour-title" style={{ minHeight: '3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {tour.title}
                            </h3>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flexGrow: 1 }}>
                              <EnvironmentOutlined style={{ color: 'var(--primary-color)', marginRight: '5px' }} />
                              {tour.location}
                            </p>

                            <div className="tour-price-section">
                              <div>
                                <Text type="secondary" style={{ fontSize: '0.8rem' }}>Starts from</Text>
                                <div className="tour-price">₹{tour.price.toLocaleString()}</div>
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
                    </Col>
                  ))}
                </Row>
              </motion.div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                {tours.length === 0 ? (
                  // No tours at all
                  <>
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
                  </>
                ) : (
                  // Tours exist but none match filters
                  <>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span style={{ color: 'var(--text-secondary)' }}>No tours match your filters</span>}
                    />
                    <Button type="primary" onClick={() => {
                      setFilters({ type: "all", priceRange: "all", duration: "all", search: "" });
                      setSelectedDuration("All");
                    }}>Clear Filters</Button>
                  </>
                )}
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Tours;
