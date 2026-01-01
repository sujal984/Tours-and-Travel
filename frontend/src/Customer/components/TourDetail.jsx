import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Divider,
  Rate,
  Avatar,
  Space,
  Empty,
  Typography,
  message,
  Image,
  Tag,
  Spin,
  Modal,
  Form,
  Input,
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  DownloadOutlined,
  StarOutlined,
  TeamOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import InquiryButton from "./InquiryButton";
import { useAuthAction } from "../../hooks/useAuthAction";
import { useUser } from "../../context/userContext";
import LoginModal from "./Auth/LoginModal";
import RegisterModal from "./Auth/RegisterModal";

import { endpoints } from "../../constant/ENDPOINTS";
import { apiClient } from "../../services/api";
import jsPDF from "jspdf";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuthAction();
  const { user } = useUser();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const res = await apiClient.get(endpoints.GET_TOUR_DETAIL(id));
        const t = res.data;
        console.log('Tour Detail API Response:', t);

        const tourObj = {
          id: t.id,
          title: t.name,
          type: t.destination?.name || t.category || "Tour",
          price: t.base_price || 0,
          duration: `${t.duration_days || 1} Days`,
          image: t.featured_image ? 
            (t.featured_image.startsWith('http') ? t.featured_image : `http://127.0.0.1:8000${t.featured_image}`) :
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80",
          description: t.description || "Experience an amazing adventure with breathtaking views and unforgettable memories.",
          rating: t.average_rating || 4.5,
          reviews: t.review_count || 0,
          location: t.destination?.name || "Unknown",
          groupSize: `${t.max_capacity || 10} people`,
          season: "Any Season",
          difficulty: t.difficulty_level || "EASY",
          category: t.category || "CULTURAL",
          itinerary: (t.itinerary || []).map((it, index) => ({
            day: it.day || index + 1,
            title: it.title || `Day ${it.day || index + 1}`,
            description: it.description || "Activities for the day"
          })),
          inclusions: t.inclusions || [
            "Accommodation in comfortable hotels",
            "All transportation during the tour",
            "Professional tour guide",
            "Meals as per itinerary",
            "Entry fees to attractions"
          ],
          exclusions: t.exclusions || [
            "Personal expenses",
            "Travel insurance",
            "Tips and gratuities",
            "Items not mentioned in inclusions"
          ]
        };

        setTour(tourObj);
        fetchTourReviews(id);
        
      } catch (err) {
        console.error("Failed to fetch tour detail", err);
        message.error("Failed to load tour details");
        setTour({
          id: id,
          title: "Sample Tour Package",
          type: "Adventure",
          price: 25000,
          duration: "7 Days",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80",
          description: "Experience an amazing adventure with breathtaking views and unforgettable memories.",
          rating: 4.5,
          reviews: 12,
          location: "Sikkim",
          groupSize: "15 people",
          season: "Any Season",
          difficulty: "MODERATE",
          category: "ADVENTURE",
          itinerary: [
            {
              day: 1,
              title: "Arrival and Check-in",
              description: "Arrive at destination, check into hotel, and evening briefing."
            },
            {
              day: 2,
              title: "Local Sightseeing",
              description: "Visit local attractions and cultural sites."
            },
            {
              day: 3,
              title: "Adventure Activities",
              description: "Trekking, hiking, and outdoor activities."
            }
          ],
          inclusions: [
            "Accommodation in 3-star hotels",
            "All transportation",
            "Breakfast and dinner",
            "Professional guide",
            "Entry fees to attractions"
          ],
          exclusions: [
            "Lunch",
            "Personal expenses",
            "Travel insurance",
            "Tips and gratuities",
            "Any items not mentioned in inclusions"
          ]
        });
        
        setReviews([
          {
            id: 1,
            user_details: { username: "john_doe", email: "john@example.com" },
            rating: 5,
            comment: "Amazing tour! The guide was very knowledgeable and the scenery was breathtaking.",
            created_at: "2024-01-15T10:30:00Z"
          },
          {
            id: 2,
            user_details: { username: "sarah_smith", email: "sarah@example.com" },
            rating: 4,
            comment: "Great experience overall. Would recommend to anyone looking for adventure.",
            created_at: "2024-01-10T14:20:00Z"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchTourReviews = async (tourId) => {
      try {
        setReviewsLoading(true);
        const res = await apiClient.get(endpoints.GET_TOUR_REVIEWS(tourId));
        const reviewsData = res.data?.data || res.data?.results || res.data || [];
        console.log('Tour Reviews API Response:', reviewsData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
        setReviews([
          {
            id: 1,
            user_details: { username: "john_doe", email: "john@example.com" },
            rating: 5,
            comment: "Amazing tour! The guide was very knowledgeable and the scenery was breathtaking.",
            created_at: "2024-01-15T10:30:00Z"
          },
          {
            id: 2,
            user_details: { username: "sarah_smith", email: "sarah@example.com" },
            rating: 4,
            comment: "Great experience overall. Would recommend to anyone looking for adventure.",
            created_at: "2024-01-10T14:20:00Z"
          }
        ]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchTourDetails();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!tour) return;
    
    setIsDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(40, 40, 40);
      pdf.text(tour.title || 'Tour Package', 20, yPosition);
      yPosition += 15;

      // Add subtitle
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${tour.location || 'Destination'} • ${tour.duration || 'Duration'} • ${tour.category || 'Category'}`, 20, yPosition);
      yPosition += 20;

      // Add tour details section
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Tour Details', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      const details = [
        `Duration: ${tour.duration || 'N/A'}`,
        `Group Size: ${tour.groupSize || 'N/A'}`,
        `Difficulty: ${tour.difficulty || 'N/A'}`,
        `Price: ₹${(tour.price || 0).toLocaleString()} per person`,
        `Rating: ${tour.rating || 0}/5 (${reviews.length} reviews)`
      ];

      details.forEach(detail => {
        pdf.text(detail, 25, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Add description
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Description', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      const description = tour.description || 'Tour description will be provided.';
      const splitDescription = pdf.splitTextToSize(description, pageWidth - 40);
      pdf.text(splitDescription, 20, yPosition);
      yPosition += splitDescription.length * 5 + 10;

      // Add itinerary
      if (tour.itinerary && tour.itinerary.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 40);
        pdf.text('Itinerary', 20, yPosition);
        yPosition += 10;

        tour.itinerary.forEach((day, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(12);
          pdf.setTextColor(40, 40, 40);
          pdf.text(`Day ${day.day || index + 1}: ${day.title || 'Day Activities'}`, 25, yPosition);
          yPosition += 7;

          pdf.setFontSize(10);
          pdf.setTextColor(80, 80, 80);
          const dayDescription = day.description || 'Activities for the day';
          const splitDayDesc = pdf.splitTextToSize(dayDescription, pageWidth - 50);
          pdf.text(splitDayDesc, 30, yPosition);
          yPosition += splitDayDesc.length * 4 + 8;
        });
      }

      // Add inclusions
      if (tour.inclusions && tour.inclusions.length > 0) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 40);
        pdf.text('Inclusions', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        tour.inclusions.forEach(inclusion => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`✓ ${inclusion}`, 25, yPosition);
          yPosition += 6;
        });
      }

      // Add exclusions
      if (tour.exclusions && tour.exclusions.length > 0) {
        yPosition += 10;
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 40);
        pdf.text('Exclusions', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        tour.exclusions.forEach(exclusion => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`✗ ${exclusion}`, 25, yPosition);
          yPosition += 6;
        });
      }

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by Rima Tours & Travels', 20, pageHeight - 10);
      pdf.text(new Date().toLocaleDateString(), pageWidth - 40, pageHeight - 10);

      // Save the PDF
      const fileName = `${(tour.title || 'Tour_Package').replace(/[^a-z0-9]/gi, '_')}_Brochure.pdf`;
      pdf.save(fileName);
      message.success("Brochure downloaded successfully!");
    } catch (err) {
      console.error('PDF generation error:', err);
      message.error("Failed to generate brochure. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmitReview = async (values) => {
    try {
      const reviewData = {
        tour: id,
        rating: values.rating,
        comment: values.comment
      };
      
      await apiClient.post(endpoints.CREATE_REVIEW, reviewData);
      message.success("Review submitted successfully! It will be visible after verification.");
      setReviewModalVisible(false);
      reviewForm.resetFields();
      fetchTourReviews(id); // Refresh reviews
    } catch (error) {
      console.error("Review submission failed", error);
      message.error("Failed to submit review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Empty description="Tour not found" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      

      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Enhanced Hero Section */}
        <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
          <Image
            src={tour.image}
            alt={tour.title}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover'
            }}
            preview={false}
            fallback="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80"
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', color: 'white', maxWidth: '900px', padding: '0 20px' }}>
              <Tag color="blue" style={{ marginBottom: '20px', fontSize: '16px', padding: '6px 16px' }}>
                {tour.category}
              </Tag>
              <Title level={1} style={{ 
                color: 'white', 
                margin: '0 0 20px 0', 
                fontSize: '48px', 
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                {tour.title}
              </Title>
              <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                <Space size="large">
                  <span><EnvironmentOutlined /> {tour.location}</span>
                  <span><ClockCircleOutlined /> {tour.duration}</span>
                  <span><StarOutlined /> {tour.rating} ({reviews.length} reviews)</span>
                </Space>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffd700' }}>
                ₹{tour.price.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>per person</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              {/* Quick Info Cards */}
              <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
                <Col xs={12} sm={6}>
                  <Card style={{ 
                    textAlign: 'center', 
                    height: '140px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    border: '1px solid #e8e8e8',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <ClockCircleOutlined style={{ fontSize: '36px', color: '#1890ff', marginBottom: '12px' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{tour.duration}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Duration</div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ 
                    textAlign: 'center', 
                    height: '140px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    border: '1px solid #e8e8e8',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <TeamOutlined style={{ fontSize: '36px', color: '#52c41a', marginBottom: '12px' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{tour.groupSize}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Group Size</div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ 
                    textAlign: 'center', 
                    height: '140px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    border: '1px solid #e8e8e8',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <StarOutlined style={{ fontSize: '36px', color: '#faad14', marginBottom: '12px' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{tour.rating}/5</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>{reviews.length} Reviews</div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ 
                    textAlign: 'center', 
                    height: '140px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    border: '1px solid #e8e8e8',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏔️</div>
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{tour.difficulty}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Difficulty</div>
                  </Card>
                </Col>
              </Row>

              {/* Enhanced Description */}
              <Card 
                title={<Title level={3} style={{ margin: 0, color: '#262626' }}>About This Tour</Title>} 
                style={{ 
                  marginBottom: '40px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Paragraph style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.8', 
                  color: '#444',
                  margin: 0
                }}>
                  {tour.description}
                </Paragraph>
              </Card>

              {/* Enhanced Tabs */}
              <Card style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Tabs
                  defaultActiveKey="itinerary"
                  size="large"
                  items={[
                    {
                      key: "itinerary",
                      label: (
                        <span style={{ fontSize: '16px' }}>
                          <CalendarOutlined /> Day-by-Day Itinerary
                        </span>
                      ),
                      children: (
                        <div style={{ padding: '20px 0' }}>
                          {tour.itinerary && tour.itinerary.length > 0 ? (
                            tour.itinerary.map((day, idx) => (
                              <Card 
                                key={idx} 
                                style={{ 
                                  marginBottom: '24px',
                                  border: '1px solid #f0f0f0',
                                  borderRadius: '8px'
                                }}
                                title={
                                  <Space align="center">
                                    <div style={{
                                      background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                                      color: 'white',
                                      borderRadius: '50%',
                                      width: '44px',
                                      height: '44px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '18px',
                                      fontWeight: 'bold'
                                    }}>
                                      {day.day}
                                    </div>
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#262626' }}>
                                      {day.title}
                                    </span>
                                  </Space>
                                }
                              >
                                <Paragraph style={{ 
                                  margin: 0, 
                                  color: '#595959', 
                                  fontSize: '16px', 
                                  lineHeight: '1.7' 
                                }}>
                                  {day.description}
                                </Paragraph>
                              </Card>
                            ))
                          ) : (
                            <Empty 
                              description="Detailed itinerary will be provided upon booking" 
                              style={{ padding: '60px 0' }}
                            />
                          )}
                        </div>
                      )
                    },
                    {
                      key: "inclusions",
                      label: (
                        <span style={{ fontSize: '16px' }}>
                          <CheckCircleOutlined /> What's Included
                        </span>
                      ),
                      children: (
                        <div style={{ padding: '20px 0' }}>
                          <Row gutter={32}>
                            <Col xs={24} md={12}>
                              <Card 
                                title={
                                  <span style={{ color: '#52c41a', fontSize: '20px' }}>
                                    <CheckCircleOutlined /> Included
                                  </span>
                                }
                                style={{ marginBottom: '20px', border: '1px solid #f6ffed' }}
                              >
                                {tour.inclusions && tour.inclusions.length > 0 ? (
                                  tour.inclusions.map((inc, i) => (
                                    <div key={i} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '12px', fontSize: '18px' }} />
                                      <span style={{ fontSize: '16px' }}>{inc}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p>Inclusions will be detailed in your booking confirmation.</p>
                                )}
                              </Card>
                            </Col>
                            <Col xs={24} md={12}>
                              <Card 
                                title={
                                  <span style={{ color: '#f5222d', fontSize: '20px' }}>
                                    <CloseCircleOutlined /> Not Included
                                  </span>
                                }
                                style={{ border: '1px solid #fff2f0' }}
                              >
                                {tour.exclusions && tour.exclusions.length > 0 ? (
                                  tour.exclusions.map((exc, i) => (
                                    <div key={i} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                      <CloseCircleOutlined style={{ color: '#f5222d', marginRight: '12px', fontSize: '18px' }} />
                                      <span style={{ fontSize: '16px' }}>{exc}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p>Exclusions will be detailed in your booking confirmation.</p>
                                )}
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      )
                    },
                    {
                      key: "reviews",
                      label: (
                        <span style={{ fontSize: '16px' }}>
                          <StarOutlined /> Reviews ({reviews.length})
                        </span>
                      ),
                      children: (
                        <div style={{ padding: '20px 0' }}>
                          {/* Add Review Button */}
                          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                            <Button
                              type="primary"
                              size="large"
                              icon={<EditOutlined />}
                              onClick={() => {
                                if (user) {
                                  setReviewModalVisible(true);
                                } else {
                                  setLoginModalVisible(true);
                                }
                              }}
                              style={{ borderRadius: '8px' }}
                            >
                              Write a Review
                            </Button>
                          </div>
                          
                          {reviewsLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}>
                              <Spin size="large" />
                              <div style={{ marginTop: '20px', fontSize: '16px' }}>Loading reviews...</div>
                            </div>
                          ) : reviews && reviews.length > 0 ? (
                            reviews.map(review => (
                              <Card key={review.id} style={{ 
                                marginBottom: '24px', 
                                border: '1px solid #f0f0f0',
                                borderRadius: '8px'
                              }}>
                                <Space align="start" style={{ width: '100%' }}>
                                  <Avatar 
                                    icon={<UserOutlined />} 
                                    size={56}
                                    style={{ backgroundColor: '#1890ff' }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                      <strong style={{ fontSize: '18px', color: '#262626' }}>
                                        {review.user_details?.username || 'Anonymous'}
                                      </strong>
                                      <small style={{ color: '#8c8c8c', fontSize: '14px' }}>
                                        {new Date(review.created_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </small>
                                    </div>
                                    <Rate 
                                      disabled 
                                      value={review.rating} 
                                      style={{ fontSize: '18px', marginBottom: '16px' }} 
                                    />
                                    <Paragraph style={{ 
                                      margin: 0, 
                                      fontSize: '16px', 
                                      lineHeight: '1.7', 
                                      color: '#595959' 
                                    }}>
                                      {review.comment}
                                    </Paragraph>
                                  </div>
                                </Space>
                              </Card>
                            ))
                          ) : (
                            <Empty 
                              description="No reviews yet. Be the first to review this tour!" 
                              style={{ padding: '80px 0' }}
                            />
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* Enhanced Booking Card */}
              <Card style={{ 
                position: 'sticky', 
                top: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ color: '#8c8c8c', fontSize: '16px', marginBottom: '8px' }}>Starting from</div>
                  <div style={{ 
                    fontSize: '40px', 
                    fontWeight: 'bold', 
                    color: '#1890ff', 
                    margin: '0 0 8px 0' 
                  }}>
                    ₹{tour.price.toLocaleString()}
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: '16px' }}>per person</div>
                </div>
                
                <Divider />
                
                <div style={{ marginBottom: '32px' }}>
                  <Row gutter={[0, 16]}>
                    <Col span={12}>
                      <span style={{ color: '#8c8c8c', fontSize: '16px' }}>Duration:</span>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '16px' }}>{tour.duration}</strong>
                    </Col>
                    <Col span={12}>
                      <span style={{ color: '#8c8c8c', fontSize: '16px' }}>Group Size:</span>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '16px' }}>{tour.groupSize}</strong>
                    </Col>
                    <Col span={12}>
                      <span style={{ color: '#8c8c8c', fontSize: '16px' }}>Difficulty:</span>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Tag color={tour.difficulty === 'EASY' ? 'green' : tour.difficulty === 'MODERATE' ? 'orange' : 'red'}>
                        {tour.difficulty}
                      </Tag>
                    </Col>
                  </Row>
                </div>
                
                <Divider />
                
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                  <Button 
                    type="primary" 
                    block 
                    size="large" 
                    onClick={() => requireAuth(
                      () => navigate(`/booking/${id}`), 
                      "book this tour",
                      () => setLoginModalVisible(true)
                    )}
                    style={{ 
                      height: '56px', 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      borderRadius: '8px'
                    }}
                  >
                    Book This Tour
                  </Button>
                  <Button 
                    block 
                    size="large"
                    onClick={() => navigate("/customize-tour")}
                    style={{ 
                      height: '48px',
                      fontSize: '16px',
                      borderRadius: '8px'
                    }}
                  >
                    Customize Tour
                  </Button>
                  <Button 
                    block 
                    size="large"
                    icon={<DownloadOutlined />} 
                    loading={isDownloading} 
                    onClick={handleDownloadPDF}
                    style={{ 
                      height: '48px',
                      fontSize: '16px',
                      borderRadius: '8px'
                    }}
                  >
                    Download Brochure
                  </Button>
                </Space>

                <div style={{ 
                  marginTop: '32px', 
                  padding: '20px', 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#389e0d'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>✓ Free Cancellation</div>
                  <div>Cancel up to 24 hours before the tour starts for a full refund</div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        title="Write a Review"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
            {tour?.title}
          </Title>
          <Text type="secondary">
            Share your experience with this tour to help other travelers
          </Text>
        </div>

        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleSubmitReview}
        >
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate allowHalf style={{ fontSize: '24px' }} />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Your Review"
            rules={[
              { required: true, message: 'Please write your review' },
              { min: 10, message: 'Review must be at least 10 characters long' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Share your experience with this tour..."
              style={{ fontSize: '16px' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setReviewModalVisible(false);
                reviewForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" size="large">
                Submit Review
              </Button>
            </Space>
          </Form.Item>
        </Form>
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

      <InquiryButton />
   
    </div>
  );
};

export default TourDetail;