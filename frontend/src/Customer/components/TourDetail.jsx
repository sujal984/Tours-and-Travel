import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Divider,
  Form,
  Rate,
  Input,
  Modal,
  Spin,
  Empty,
  Avatar,
  Tabs,
  Space,
  Tag,
  Image,
  message,
  Alert
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  StarOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import { useUser } from "../../context/userContext"

import LoginModal from "./Auth/LoginModal";
import RegisterModal from "./Auth/RegisterModal";
import InquiryButton from "./InquiryButton";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [reviewForm] = Form.useForm();

  // Check if tour has available booking dates (10-day advance rule)
  const bookingAvailability = useMemo(() => {
    if (!tour) return { available: false, message: "Loading..." };

    const minBookingDate = dayjs().add(10, 'day').startOf('day');
    const availableDates = [];

    // Check direct tour dates
    if (tour?.available_dates) {
      // Parse available_dates if it's a string (JSON format)
      let availableDatesArray = tour.available_dates;
      if (typeof availableDatesArray === 'string') {
        try {
          availableDatesArray = JSON.parse(availableDatesArray);
        } catch (e) {
          console.warn('Failed to parse available_dates:', availableDatesArray);
          availableDatesArray = [];
        }
      }
      
      if (Array.isArray(availableDatesArray)) {
        availableDatesArray.forEach(d => {
          const date = dayjs(d);
          if (date.isSameOrAfter(minBookingDate)) {
            availableDates.push(date.format("YYYY-MM-DD"));
          }
        });
      }
    }

    // Check seasonal pricing dates
    if (tour.seasonal_pricings && tour.seasonal_pricings.length > 0) {
      tour.seasonal_pricings.forEach(pricing => {
        const season = pricing.season_details || pricing.season;
        if (!pricing.available_dates || !Array.isArray(pricing.available_dates)) return;

        pricing.available_dates.forEach(dateStr => {
          // Handle both full date strings (YYYY-MM-DD) and day numbers
          let dateToCheck;
          if (dateStr.includes('-')) {
            // Full date string like "2026-01-29"
            dateToCheck = dayjs(dateStr);
          } else {
            // Day number like "29" - need season dates to construct full date
            if (!season || !season.start_date || !season.end_date) return;
            
            const startDate = dayjs(season.start_date);
            const endDate = dayjs(season.end_date);
            const dayNum = parseInt(dateStr);
            
            let current = startDate;
            while (current.isSameOrBefore(endDate)) {
              if (current.date() === dayNum) {
                dateToCheck = current;
                break;
              }
              current = current.add(1, 'day');
            }
          }
          
          if (dateToCheck && dateToCheck.isValid() && dateToCheck.isSameOrAfter(minBookingDate)) {
            availableDates.push(dateToCheck.format("YYYY-MM-DD"));
          }
        });
      });
    }

    // Also check pricing_details (legacy/alternative structure)
    if (tour.pricing_details && Array.isArray(tour.pricing_details)) {
      tour.pricing_details.forEach((pricing, index) => {
        if (!pricing.available_dates || !Array.isArray(pricing.available_dates)) return;

        pricing.available_dates.forEach(dateStr => {
          // Handle both full date strings (YYYY-MM-DD) and day numbers
          let dateToCheck;
          if (dateStr.includes('-')) {
            // Full date string like "2026-02-08"
            dateToCheck = dayjs(dateStr);
          } else {
            // Day number - need season context
            const season = pricing.season;
            if (!season || !season.start_date || !season.end_date) return;
            
            const startDate = dayjs(season.start_date);
            const endDate = dayjs(season.end_date);
            const dayNum = parseInt(dateStr);
            
            let current = startDate;
            while (current.isSameOrBefore(endDate)) {
              if (current.date() === dayNum) {
                dateToCheck = current;
                break;
              }
              current = current.add(1, 'day');
            }
          }
          
          if (dateToCheck && dateToCheck.isValid() && dateToCheck.isSameOrAfter(minBookingDate)) {
            availableDates.push(dateToCheck.format("YYYY-MM-DD"));
          }
        });
      });
    }

    const uniqueDates = [...new Set(availableDates)].sort();
    
    if (uniqueDates.length === 0) {
      return {
        available: false,
        message: "No available dates for booking. Tours must be booked at least 10 days in advance.",
        nextAvailableDate: null
      };
    }

    return {
      available: true,
      message: `${uniqueDates.length} dates available for booking`,
      nextAvailableDate: uniqueDates[0]
    };
  }, [tour]);

  useEffect(() => {
    fetchTourDetails();
    fetchReviews();
  }, [id]);

  const fetchTourDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_TOUR_DETAIL(id));
      setTour(response.data?.data || response.data);
    } catch (error) {
      console.error("Error fetching tour:", error);
      message.error("Failed to load tour details");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const response = await apiClient.get(`${endpoints.GET_TOUR_REVIEWS(id)}?_t=${cacheBuster}`);
      setReviews(response.data?.data || response.data?.results || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (values) => {
    try {
      await apiClient.post(endpoints.CREATE_REVIEW, {
        tour: id,
        rating: values.rating,
        comment: values.comment
      });
      message.success("Review submitted successfully");
      setReviewModalVisible(false);
      reviewForm.resetFields();
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error("Failed to submit review");
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      
      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = 20;
        }
      };
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(220, 20, 60);
      doc.text(tour.name.toUpperCase(), margin, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Duration: ${tour.duration_days} Days | Destination: ${tour.primary_destination?.name || tour.destination_names}`, margin, yPosition);
      yPosition += 10;
      doc.text(`Category: ${tour.category || 'General'} | Difficulty: ${tour.difficulty_level || 'Moderate'}`, margin, yPosition);
      yPosition += 20;
      
      // Description
      checkPageBreak(30);
      doc.setFontSize(14);
      doc.setTextColor(220, 20, 60);
      doc.text('TOUR DESCRIPTION', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const descriptionLines = doc.splitTextToSize(tour.description || 'Tour description not available', 170);
      doc.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 5 + 15;
      
      // Hotel Details
      if (tour.destinations && tour.destinations.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setTextColor(220, 20, 60);
        doc.text('HOTEL DETAILS', margin, yPosition);
        yPosition += 10;
        
        tour.destinations.forEach((destination) => {
          checkPageBreak(15);
          const hotelInfo = tour.hotel_details && tour.hotel_details[destination.id];
          const actualHotel = destination.hotels && destination.hotels.length > 0 ? destination.hotels[0] : null;
          
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const hotelText = actualHotel 
            ? `${destination.name.toUpperCase()}: ${actualHotel.name.toUpperCase()} (${actualHotel.hotel_type || hotelInfo?.hotel_type || 'Standard'})` 
            : `${destination.name.toUpperCase()}: ${hotelInfo?.hotel_name || 'OMEGA/SIMILAR'} (${hotelInfo?.hotel_type || 'Standard'})`;
          doc.text(hotelText, margin, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }
      
      // Seasonal Pricing
      if (tour.seasonal_pricings && tour.seasonal_pricings.length > 0) {
        checkPageBreak(60);
        doc.setFontSize(14);
        doc.setTextColor(220, 20, 60);
        doc.text('SEASONAL PRICING', margin, yPosition);
        yPosition += 15;
        
        tour.seasonal_pricings.forEach((pricing, index) => {
          checkPageBreak(50);
          
          // Season header
          doc.setFontSize(12);
          doc.setTextColor(220, 20, 60);
          const seasonName = pricing.season?.name || `Season ${index + 1}`;
          const dateRange = pricing.season?.date_range_display || 'Date range not specified';
          doc.text(`${seasonName.toUpperCase()} - ${dateRange.toUpperCase()}`, margin, yPosition);
          yPosition += 10;
          
          // Available dates
          if (pricing.available_dates && pricing.available_dates.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Available Dates: ${pricing.available_dates.join(', ')}`, margin, yPosition);
            yPosition += 8;
          }
          
          // Pricing table
          doc.setFontSize(10);
          doc.text('2-Sharing (Per Person):', margin, yPosition);
          doc.text(`INR ${pricing.two_sharing_price?.toLocaleString() || 'N/A'}/-`, margin + 60, yPosition);
          yPosition += 6;
          
          doc.text('3-Sharing (Per Person):', margin, yPosition);
          doc.text(`INR ${pricing.three_sharing_price?.toLocaleString() || 'N/A'}/-`, margin + 60, yPosition);
          yPosition += 6;
          
          doc.text('Child (4-11 Yr):', margin, yPosition);
          doc.text(`INR ${pricing.child_price?.toLocaleString() || 'N/A'}/-`, margin + 60, yPosition);
          yPosition += 10;
          
          if (pricing.includes_return_air) {
            doc.setTextColor(0, 150, 0);
            doc.text('✓ Includes Return Air Travel', margin, yPosition);
            doc.setTextColor(0, 0, 0);
            yPosition += 8;
          }
          yPosition += 5;
        });
      }
      
      // Vehicle Details
      if (tour.vehicle_details && Object.keys(tour.vehicle_details).length > 0) {
        checkPageBreak(25);
        doc.setFontSize(14);
        doc.setTextColor(220, 20, 60);
        doc.text('VEHICLE DETAILS', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Vehicle Type: ${tour.vehicle_details.type}`, margin, yPosition);
        yPosition += 8;
        
        if (tour.vehicle_details.note) {
          const noteLines = doc.splitTextToSize(`Note: ${tour.vehicle_details.note}`, 170);
          doc.text(noteLines, margin, yPosition);
          yPosition += noteLines.length * 5 + 10;
        }
      }
      
      // Inclusions
      if (tour.inclusions && tour.inclusions.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setTextColor(0, 150, 0);
        doc.text('INCLUSIONS', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        tour.inclusions.forEach((inclusion) => {
          checkPageBreak(8);
          doc.text(`✓ ${inclusion}`, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }
      
      // Exclusions
      if (tour.exclusions && tour.exclusions.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setTextColor(220, 20, 60);
        doc.text('EXCLUSIONS', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        tour.exclusions.forEach((exclusion) => {
          checkPageBreak(8);
          doc.text(`✗ ${exclusion}`, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }
      
      // Special Notes
      if (tour.special_notes) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setTextColor(220, 20, 60);
        doc.text('SPECIAL NOTES', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const notesLines = doc.splitTextToSize(tour.special_notes, 170);
        doc.text(notesLines, margin, yPosition);
        yPosition += notesLines.length * 5 + 15;
      }
      
      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${totalPages}`, margin, pageHeight - 10);
        doc.text('Generated by Rima Tours & Travels', doc.internal.pageSize.width - margin - 60, pageHeight - 10);
      }
      
      doc.save(`${tour.name.replace(/\s+/g, '_')}_Brochure.pdf`);
      message.success('Brochure downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate brochure. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  if (!tour) return <div style={{ textAlign: 'center', padding: '100px' }}><Empty description="Tour not found" /><Button onClick={() => navigate('/tours')}>Browse Tours</Button></div>;

  // Helper to get all images
  const getHeroImages = () => {
    if (!tour) return [];
    let images = [];

    // Add featured/main image
    if (tour.featured_image) {
      const imageUrl = tour.featured_image.startsWith('http') 
        ? tour.featured_image 
        : `http://127.0.0.1:8000${tour.featured_image}`;
      images.push({ src: imageUrl, alt: tour.name });
    }

    // Add destination images
    if (tour.destinations) {
      tour.destinations.forEach(dest => {
        if (dest.images && dest.images.length > 0) {
          dest.images.forEach(img => {
            const imageUrl = img.image.startsWith('http') 
              ? img.image 
              : `http://127.0.0.1:8000${img.image}`;
            images.push({
              src: imageUrl,
              alt: img.caption || dest.name
            });
          });
        }
      });
    }

    // Fallback
    if (images.length === 0) {
      images.push({
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80",
        alt: "Tour"
      });
    }
    return images;
  };

  // ...

  // Render Hero
  return (
    <div className="tour-detail-page" style={{ background: 'var(--bg-secondary)', paddingBottom: 'var(--spacing-4xl)' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', height: '60vh', overflow: 'hidden' }}>
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          pagination={{ clickable: true }}
          style={{ width: '100%', height: '100%' }}
        >
          {getHeroImages().map((img, idx) => (
            <SwiperSlide key={idx}>
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  preview={false}
                />
                {/* Overlay for text readability handled by parent absolute div below */}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '60px'
        }}>
          <div className="container-xl" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 var(--spacing-xl)' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tag color="var(--primary-color)" style={{ marginBottom: '15px', border: 'none', padding: '5px 15px', fontSize: '1rem' }}>
                {tour.category || "General"}
              </Tag>
              <h1 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '10px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                {tour.name}
              </h1>
              <Space size="large" style={{ color: 'white', fontSize: '1.1rem' }}>
                <span><EnvironmentOutlined /> {tour.primary_destination?.name || tour.destination_names}</span>
                <span><ClockCircleOutlined /> {tour.duration_days} Days</span>
                <span><StarOutlined style={{ color: '#ffd700' }} /> {tour.average_rating || 0}/5</span>
              </Space>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-xl" style={{ maxWidth: '1400px', margin: '-40px auto 0', padding: '0 var(--spacing-xl)', position: 'relative', zIndex: 10 }}>
        <Row gutter={[40, 40]}>
          <Col xs={24} lg={16}>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
              }}>
                {[
                  { icon: <ClockCircleOutlined />, label: "Duration", value: `${tour.duration_days} Days`, color: "#3498db" },
                  { icon: <TeamOutlined />, label: "Group Size", value: tour.max_capacity, color: "#2ecc71" },
                  { icon: <SafetyCertificateOutlined />, label: "Difficulty", value: tour.difficulty_level, color: "#e67e22" },
                  { icon: <StarOutlined />, label: "Rating", value: `${tour.average_rating || 0}/5`, color: "#f1c40f" },
                ].map((stat, idx) => (
                  <Card key={idx} className="card" bodyStyle={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', color: stat.color, marginBottom: '10px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{stat.value}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</div>
                  </Card>
                ))}
              </div>

              <Card className="card" style={{ marginBottom: '40px' }}>
                <Title level={3}>About This Tour</Title>
                <Paragraph style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  {tour.description}
                </Paragraph>
              </Card>

              <Card className="card">
                <Tabs
                  defaultActiveKey="itinerary"
                  size="large"
                  items={[
                    {
                      key: 'itinerary',
                      label: <span style={{ fontSize: '1.1rem' }}><CalendarOutlined /> Itinerary</span>,
                      children: (
                        <div style={{ padding: '20px 0' }}>
                          {tour.itinerary?.length > 0 ? (
                            tour.itinerary.map((day, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                                <div style={{
                                  display: 'flex', flexDirection: 'column', alignItems: 'center'
                                }}>
                                  <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '1.1rem'
                                  }}>
                                    {day.day}
                                  </div>
                                  {idx !== tour.itinerary.length - 1 && <div style={{ width: '2px', background: 'var(--border-color)', flex: 1, marginTop: '10px' }}></div>}
                                </div>
                                <div style={{ flex: 1, paddingBottom: idx !== tour.itinerary.length - 1 ? '20px' : 0 }}>
                                  <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{day.title}</h3>
                                  <p style={{ color: 'var(--text-secondary)' }}>{day.description}</p>
                                </div>
                              </div>
                            ))
                          ) : <Empty description="Itinerary details coming soon" />}
                        </div>
                      )
                    },
                    {
                      key: 'inclusions',
                      label: <span style={{ fontSize: '1.1rem' }}><CheckCircleOutlined /> Inclusions</span>,
                      children: (
                        <Row gutter={[24, 24]} style={{ padding: '20px 0' }}>
                          <Col span={12}>
                            <h4 style={{ color: 'var(--success-color)', marginBottom: '15px' }}>Included</h4>
                            {tour.inclusions?.length > 0 ? (
                              <ul style={{ listStyle: 'none', padding: 0 }}>
                                {tour.inclusions.map((inc, i) => (
                                  <li key={i} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                    <CheckCircleOutlined style={{ color: 'var(--success-color)' }} /> {inc}
                                  </li>
                                ))}
                              </ul>
                            ) : <p>Details on request</p>}
                          </Col>
                          <Col span={12}>
                            <h4 style={{ color: 'var(--error-color)', marginBottom: '15px' }}>Not Included</h4>
                            {tour.exclusions?.length > 0 ? (
                              <ul style={{ listStyle: 'none', padding: 0 }}>
                                {tour.exclusions.map((exc, i) => (
                                  <li key={i} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                    <CloseCircleOutlined style={{ color: 'var(--error-color)' }} /> {exc}
                                  </li>
                                ))}
                              </ul>
                            ) : <p>Details on request</p>}
                          </Col>
                        </Row>
                      )
                    },
                    {
                      key: 'brochure',
                      label: <span style={{ fontSize: '1.1rem' }}><InfoCircleOutlined /> Brochure Details</span>,
                      children: (
                        <div style={{ padding: '20px 0' }}>
                          {/* Hotel Details Table */}
                          {tour.destinations && tour.destinations.length > 0 && (
                            <div style={{ marginBottom: '30px' }}>
                              <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Hotel Details</h3>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '15px',
                                marginBottom: '20px'
                              }}>
                                {tour.destinations.map((destination, index) => {
                                  const hotelInfo = tour.hotel_details && tour.hotel_details[destination.id];
                                  return (
                                    <div key={index} style={{
                                      padding: '15px',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: 'var(--radius-md)',
                                      textAlign: 'center'
                                    }}>
                                      <h4 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>
                                        {destination.name.toUpperCase()}
                                      </h4>
                                      <p style={{ fontWeight: 'bold', margin: '5px 0' }}>
                                        {hotelInfo?.hotel_name || 'OMEGA/SIMILAR'}
                                      </p>
                                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {hotelInfo?.hotel_type || 'Standard'}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Seasonal Pricing Tables */}
                          {tour.seasonal_pricings && tour.seasonal_pricings.length > 0 && (
                            <div style={{ marginBottom: '30px' }}>
                              <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Seasonal Pricing</h3>
                              {tour.seasonal_pricings.map((pricing, index) => (
                                <div key={index} style={{ marginBottom: '25px' }}>
                                  <h4 style={{
                                    color: 'var(--error-color)',
                                    marginBottom: '10px',
                                    fontSize: '1rem'
                                  }}>
                                    ▶ RATE APPLICABLE FROM - {pricing.season?.date_range_display?.toUpperCase()}
                                  </h4>

                                  {pricing.available_dates && pricing.available_dates.length > 0 && (
                                    <div style={{ marginBottom: '15px' }}>
                                      <table style={{
                                        width: '100%',
                                        border: '1px solid var(--border-color)',
                                        borderCollapse: 'collapse'
                                      }}>
                                        <thead>
                                          <tr style={{ background: 'var(--bg-secondary)' }}>
                                            <th style={{
                                              border: '1px solid var(--border-color)',
                                              padding: '8px',
                                              textAlign: 'center'
                                            }}>
                                              MONTH
                                            </th>
                                            <th style={{
                                              border: '1px solid var(--border-color)',
                                              padding: '8px',
                                              textAlign: 'center'
                                            }}>
                                              {pricing.season?.name?.toUpperCase()}
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td style={{
                                              border: '1px solid var(--border-color)',
                                              padding: '8px',
                                              textAlign: 'center',
                                              fontWeight: 'bold'
                                            }}>
                                              {pricing.season?.start_date && pricing.season?.end_date ? 
                                                (() => {
                                                  const startMonth = new Date(pricing.season.start_date).toLocaleDateString('en-US', { month: 'short' });
                                                  const endMonth = new Date(pricing.season.end_date).toLocaleDateString('en-US', { month: 'short' });
                                                  const startYear = new Date(pricing.season.start_date).getFullYear();
                                                  const endYear = new Date(pricing.season.end_date).getFullYear();
                                                  
                                                  if (startMonth === endMonth && startYear === endYear) {
                                                    return `${startMonth} ${startYear}`;
                                                  } else if (startYear === endYear) {
                                                    return `${startMonth} - ${endMonth} ${startYear}`;
                                                  } else {
                                                    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
                                                  }
                                                })()
                                                : 'All Year'
                                              }
                                            </td>
                                            <td style={{
                                              border: '1px solid var(--border-color)',
                                              padding: '8px',
                                              textAlign: 'center'
                                            }}>
                                              {pricing.available_dates.join(', ')}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                  {/* Vehicle Information */}
                                  {tour.vehicle_details && Object.keys(tour.vehicle_details).length > 0 && (
                                    <div style={{ marginBottom: '15px' }}>
                                      <h4 style={{ color: 'var(--error-color)', fontSize: '0.9rem' }}>
                                        ▶ VEHICLE: {tour.vehicle_details.type}
                                      </h4>
                                      {tour.vehicle_details.note && (
                                        <p style={{
                                          color: 'var(--error-color)',
                                          fontSize: '0.85rem',
                                          marginLeft: '15px'
                                        }}>
                                          ({tour.vehicle_details.note})
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Pricing Table */}
                                  <table style={{
                                    width: '100%',
                                    border: '1px solid var(--border-color)',
                                    borderCollapse: 'collapse',
                                    marginBottom: '15px'
                                  }}>
                                    <thead>
                                      <tr style={{ background: 'var(--bg-secondary)' }}>
                                        <th style={{
                                          border: '1px solid var(--border-color)',
                                          padding: '10px',
                                          textAlign: 'center'
                                        }}>
                                          02 SHARING<br />(PER PERSON)
                                        </th>
                                        <th style={{
                                          border: '1px solid var(--border-color)',
                                          padding: '10px',
                                          textAlign: 'center'
                                        }}>
                                          03 SHARING<br />(PER PERSON)
                                        </th>
                                        <th style={{
                                          border: '1px solid var(--border-color)',
                                          padding: '10px',
                                          textAlign: 'center'
                                        }}>
                                          CHILD WITHOUT BED<br />(4 YR - 11 YR)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td style={{
                                          border: '1px solid var(--border-color)',
                                          padding: '15px',
                                          textAlign: 'center',
                                          fontWeight: 'bold'
                                        }}>
                                          INR {pricing.two_sharing_price?.toLocaleString()}/-
                                          {pricing.includes_return_air && <br />}
                                          {pricing.includes_return_air && <span style={{ fontSize: '0.8rem' }}>WITH RETURN AIR</span>}
                                        </td>
                                        <td style={{
                                          border: '1px solid var(--border-color)',
                                          padding: '15px',
                                          textAlign: 'center',
                                          fontWeight: 'bold'
                                        }}>
                                          INR {pricing.three_sharing_price?.toLocaleString()}/-
                                          {pricing.includes_return_air && <br />}
                                          {pricing.includes_return_air && <span style={{ fontSize: '0.8rem' }}>WITH RETURN AIR</span>}
                                        </td>
                                        <td style={{
                                          border: '1px solid var(--border-color)',
                                          padding: '15px',
                                          textAlign: 'center',
                                          fontWeight: 'bold'
                                        }}>
                                          INR {pricing.child_price?.toLocaleString()}/-
                                          {pricing.includes_return_air && <br />}
                                          {pricing.includes_return_air && <span style={{ fontSize: '0.8rem' }}>WITH RETURN AIR</span>}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Special Notes */}
                          {tour.special_notes && (
                            <div style={{ marginTop: '20px' }}>
                              <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>Special Notes</h3>
                              <div style={{
                                padding: '15px',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)'
                              }}>
                                <p style={{ margin: 0, lineHeight: '1.6' }}>{tour.special_notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    },
                    {
                      key: 'hotels',
                      label: <span style={{ fontSize: '1.1rem' }}><EnvironmentOutlined /> Hotels</span>,
                      children: (
                        <div style={{ padding: '20px 0' }}>
                          <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>
                            Accommodation Details
                          </h3>
                          
                          {tour.destinations && tour.destinations.length > 0 ? (
                            <Row gutter={[24, 24]}>
                              {tour.destinations.map((destination) => {
                                // Get hotels for this destination
                                const destinationHotels = destination.hotels || [];
                                
                                return (
                                  <Col xs={24} key={destination.id}>
                                    <div style={{ marginBottom: '30px' }}>
                                      <h4 style={{ 
                                        color: 'var(--primary-color)', 
                                        marginBottom: '15px',
                                        fontSize: '1.2rem',
                                        borderBottom: '2px solid var(--primary-light)',
                                        paddingBottom: '8px'
                                      }}>
                                        {destination.name} ({destinationHotels.length} hotels)
                                      </h4>
                                      
                                      {destinationHotels.length > 0 ? (
                                        <Row gutter={[16, 16]}>
                                          {destinationHotels.map((hotel) => (
                                          <Col xs={24} sm={12} lg={8} key={hotel.id}>
                                            <Card
                                              hoverable
                                              cover={
                                                hotel.image ? (
                                                  <div style={{ height: '200px', overflow: 'hidden' }}>
                                                    <img
                                                      alt={hotel.name}
                                                      src={hotel.image.startsWith('http') 
                                                        ? hotel.image 
                                                        : `http://127.0.0.1:8000${hotel.image}`}
                                                      style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover' 
                                                      }}
                                                    />
                                                  </div>
                                                ) : (
                                                  <div style={{ 
                                                    height: '200px', 
                                                    background: 'var(--bg-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--text-tertiary)'
                                                  }}>
                                                    <EnvironmentOutlined style={{ fontSize: '2rem' }} />
                                                  </div>
                                                )
                                              }
                                              bodyStyle={{ padding: '16px' }}
                                            >
                                              <div style={{ textAlign: 'center' }}>
                                                <h4 style={{ 
                                                  margin: '0 0 8px 0',
                                                  fontSize: '1.1rem',
                                                  color: 'var(--text-primary)'
                                                }}>
                                                  {hotel.name}
                                                </h4>
                                                
                                                {hotel.star_rating && (
                                                  <div style={{ marginBottom: '8px' }}>
                                                    <Rate 
                                                      disabled 
                                                      value={hotel.star_rating} 
                                                      style={{ fontSize: '0.9rem' }}
                                                    />
                                                  </div>
                                                )}
                                                
                                                {hotel.hotel_type && (
                                                  <Tag color="blue" style={{ marginBottom: '8px' }}>
                                                    {hotel.hotel_type}
                                                  </Tag>
                                                )}
                                                
                                                {hotel.address && (
                                                  <p style={{ 
                                                    color: 'var(--text-secondary)', 
                                                    fontSize: '0.9rem',
                                                    margin: '8px 0 0 0',
                                                    lineHeight: '1.4'
                                                  }}>
                                                    <EnvironmentOutlined style={{ marginRight: '4px' }} />
                                                    {hotel.address}
                                                  </p>
                                                )}
                                              </div>
                                            </Card>
                                          </Col>
                                        ))}
                                        </Row>
                                      ) : (
                                        <div style={{ 
                                          textAlign: 'center', 
                                          padding: '20px',
                                          background: 'var(--bg-secondary)',
                                          borderRadius: 'var(--radius-md)',
                                          border: '1px dashed var(--border-color)'
                                        }}>
                                          <EnvironmentOutlined style={{ 
                                            fontSize: '2rem', 
                                            color: 'var(--text-tertiary)',
                                            marginBottom: '8px'
                                          }} />
                                          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                            No hotels available for {destination.name}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </Col>
                                );
                              })}
                            </Row>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                              <EnvironmentOutlined style={{ 
                                fontSize: '3rem', 
                                color: 'var(--text-tertiary)',
                                marginBottom: '16px'
                              }} />
                              <h4 style={{ color: 'var(--text-secondary)' }}>
                                Hotel details will be provided upon booking confirmation
                              </h4>
                              <p style={{ color: 'var(--text-tertiary)' }}>
                                We ensure comfortable accommodation at all destinations
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    },
                    {
                      key: 'reviews',
                      label: <span style={{ fontSize: '1.1rem' }}><StarOutlined /> Reviews</span>,
                      children: (
                        <div style={{ padding: '20px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h3 style={{ margin: 0 }}>Customer Reviews ({reviews.length})</h3>
                            <Button type="primary" onClick={() => user ? setReviewModalVisible(true) : setLoginModalVisible(true)}>
                              Write a Review
                            </Button>
                          </div>
                          {reviewsLoading ? <Spin /> : reviews.length > 0 ? (
                            reviews.map(review => (
                              <Card key={review.id} className="card" style={{ marginBottom: '20px' }} bodyStyle={{ padding: '20px' }}>
                                <Space align="start">
                                  <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary-light)' }} />
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '200px' }}>
                                      <strong style={{ fontSize: '1.1rem' }}>{review.user_details?.username || 'User'}</strong>
                                      <Rate disabled value={review.rating} style={{ fontSize: '0.9rem' }} />
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>{review.comment}</p>
                                  </div>
                                </Space>
                              </Card>
                            ))
                          ) : <Empty description="No reviews yet" />}
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card
                className="card"
                style={{ position: 'sticky', top: '100px', borderTop: '4px solid var(--primary-color)' }}
                bodyStyle={{ padding: '30px' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '5px' }}>Starting From</p>
                  <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary-color)' }}>
                    ₹{(tour.current_price || tour.base_price || 0).toLocaleString()}
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>per person</p>

                  {/* Available Dates Section */}
                  {bookingAvailability.available && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '12px', 
                      background: 'var(--success-bg)', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--success-color)'
                    }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--success-color)', marginBottom: '8px', fontWeight: 'bold' }}>
                        📅 Available Dates:
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '6px',
                        justifyContent: 'center'
                      }}>
                        {(() => {
                          // Get all available dates from both sources
                          const allDates = [];
                          const minBookingDate = dayjs().add(10, 'day').startOf('day');
                          
                          // From direct tour dates
                          if (tour?.available_dates && Array.isArray(tour.available_dates)) {
                            tour.available_dates.forEach(d => {
                              const date = dayjs(d);
                              if (date.isSameOrAfter(minBookingDate)) {
                                allDates.push(date.format("YYYY-MM-DD"));
                              }
                            });
                          }
                          
                          // From seasonal pricing
                          if (tour.seasonal_pricings) {
                            tour.seasonal_pricings.forEach(pricing => {
                              if (pricing.available_dates && Array.isArray(pricing.available_dates)) {
                                pricing.available_dates.forEach(dateStr => {
                                  if (dateStr.includes('-')) {
                                    const date = dayjs(dateStr);
                                    if (date.isSameOrAfter(minBookingDate)) {
                                      allDates.push(date.format("YYYY-MM-DD"));
                                    }
                                  }
                                });
                              }
                            });
                          }
                          
                          // From pricing details
                          if (tour.pricing_details && Array.isArray(tour.pricing_details)) {
                            tour.pricing_details.forEach(pricing => {
                              if (pricing.available_dates && Array.isArray(pricing.available_dates)) {
                                pricing.available_dates.forEach(dateStr => {
                                  if (dateStr.includes('-')) {
                                    const date = dayjs(dateStr);
                                    if (date.isSameOrAfter(minBookingDate)) {
                                      allDates.push(date.format("YYYY-MM-DD"));
                                    }
                                  }
                                });
                              }
                            });
                          }
                          
                          const uniqueDates = [...new Set(allDates)].sort();
                          
                          return uniqueDates.map(dateStr => (
                            <span key={dateStr} style={{
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              background: 'white',
                              border: '1px solid var(--success-color)',
                              borderRadius: '12px',
                              color: 'var(--success-color)',
                              fontWeight: 'bold'
                            }}>
                              {dayjs(dateStr).format('MMM DD')}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Seasonal Pricing Display */}
                  {tour.seasonal_pricings && tour.seasonal_pricings.length > 0 && (


                    <div style={{ marginTop: '15px' }}>
                      {tour.seasonal_pricings.map((pricing, index) => (
                        <div key={index} style={{
                          marginBottom: '20px',
                          padding: '15px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px'
                          }}>
                            <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                              {pricing.season?.name}
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {pricing.season?.date_range_display}
                            </span>
                          </div>

                          {pricing.available_dates && pricing.available_dates.length > 0 && (
                            <div style={{ marginBottom: '10px' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Available Dates: {pricing.available_dates.join(', ')}
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>2-Sharing</div>
                              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                ₹{pricing.two_sharing_price?.toLocaleString()}
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>3-Sharing</div>
                              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                ₹{pricing.three_sharing_price?.toLocaleString()}
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Child (4-11 Yr)</div>
                              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                ₹{pricing.child_price?.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {pricing.includes_return_air && (
                            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--success-color)' }}>
                              ✓ Includes Return Air Travel
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vehicle Details */}
                  {tour.vehicle_details && Object.keys(tour.vehicle_details).length > 0 && (
                    <div style={{ marginTop: '15px', padding: '10px', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Vehicle:</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>
                        {tour.vehicle_details.type}
                      </p>
                      {tour.vehicle_details.note && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--warning-color)', margin: '5px 0 0 0' }}>
                          {tour.vehicle_details.note}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Hotel Details by Destination */}
                  {tour.destinations && tour.destinations.length > 0 && (
                    <div style={{ marginTop: '15px', padding: '10px', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Hotels:</p>
                      {tour.destinations.map((destination, index) => {
                        const hotelInfo = tour.hotel_details && tour.hotel_details[destination.id];
                        // Get actual hotel from destination.hotels array
                        const actualHotel = destination.hotels && destination.hotels.length > 0 ? destination.hotels[0] : null;
                        
                        return (
                          <div key={index} style={{ marginBottom: '5px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{destination.name}:</span>
                            <span style={{ fontSize: '0.85rem', marginLeft: '5px' }}>
                              {actualHotel 
                                ? `${actualHotel.name} (${actualHotel.hotel_type || hotelInfo?.hotel_type || 'Standard'})` 
                                : (hotelInfo 
                                  ? `Hotel details to be confirmed (${hotelInfo.hotel_type})` 
                                  : 'Hotel details to be confirmed'
                                )
                              }
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Divider />

                {/* Booking Availability Alert */}
                {!bookingAvailability.available && (
                  <Alert
                    message="Booking Not Available"
                    description={bookingAvailability.message}
                    type="warning"
                    icon={<ExclamationCircleOutlined />}
                    style={{ marginBottom: '16px' }}
                    showIcon
                  />
                )}

                {bookingAvailability.available && (
                  <Alert
                    message="Booking Available"
                    description={`Next available date: ${dayjs(bookingAvailability.nextAvailableDate).format('DD MMMM, YYYY')}`}
                    type="success"
                    icon={<CheckCircleOutlined />}
                    style={{ marginBottom: '16px' }}
                    showIcon
                  />
                )}

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="btn-primary-gradient"
                    style={{ height: '50px', fontSize: '1.1rem' }}
                    disabled={!bookingAvailability.available}
                    onClick={() => isAuthenticated ? navigate(`/booking/${id}`) : setLoginModalVisible(true)}
                  >
                    {bookingAvailability.available ? 'Book Now' : 'Booking Unavailable'}
                  </Button>

                  <Button
                    block
                    size="large"
                    style={{ height: '50px' }}
                    onClick={() => navigate("/customize-tour")}
                  >
                    Customize
                  </Button>

                  <Button
                    block
                    icon={<DownloadOutlined />}
                    loading={isDownloading}
                    onClick={handleDownloadPDF}
                  >
                    Brochure
                  </Button>
                </Space>

                <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '10px' }}>
                  <InfoCircleOutlined style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }} />
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Cancellation & Refund Policy</p>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      <li>Within 24 hours of booking: 100% refund</li>
                      <li>10+ days before tour start: 50% refund</li>
                      <li>5-9 days before tour start: No refund</li>
                      <li>Less than 5 days: No refund</li>
                    </ul>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      Tours must be booked at least 10 days in advance.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>

      <InquiryButton />

      {/* Modals */}
      <Modal
        title="Write a Review"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        <Form form={reviewForm} onFinish={handleSubmitReview} layout="vertical">
          <Form.Item name="rating" label="Rating" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Review" rules={[{ required: true, min: 10 }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Submit Review</Button>
        </Form>
      </Modal>

      <LoginModal open={loginModalVisible} onClose={() => setLoginModalVisible(false)} onRegisterClick={() => { setLoginModalVisible(false); setRegisterModalVisible(true); }} />
      <RegisterModal open={registerModalVisible} onClose={() => setRegisterModalVisible(false)} onLoginClick={() => { setRegisterModalVisible(false); setLoginModalVisible(true); }} />

    </div>
  );
};

export default TourDetail;