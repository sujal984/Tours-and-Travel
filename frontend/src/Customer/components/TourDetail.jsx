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
  SafetyCertificateOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import InquiryButton from "./InquiryButton";
import { useAuthAction } from "../../hooks/useAuthAction";
import { useUser } from "../../context/userContext";
import LoginModal from "./Auth/LoginModal";
import RegisterModal from "./Auth/RegisterModal";

import { endpoints } from "../../constant/ENDPOINTS";
import { apiClient } from "../../services/api";
import jsPDF from "jspdf";

const { Title, Paragraph, Text } = Typography;
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
        const t = res.data?.data || res.data; // Handle both response formats

        console.log('Tour API Response:', t); // Debug log

        const tourObj = {
          id: t.id,
          title: t.name,
          type: t.destination_names || t.primary_destination?.name || t.category || "Tour",
          destinations: t.destinations || [],
          primary_destination: t.primary_destination,
          destination_names: t.destination_names,
          price: t.current_price || t.base_price || 0,
          base_price: t.base_price || 0,
          seasonal_pricings: t.seasonal_pricings || [],
          duration: `${t.duration_days || 1} Days`,
          duration_days: t.duration_days || 1,
          image: t.featured_image ?
            (t.featured_image.startsWith('http') ? t.featured_image : `http://127.0.0.1:8000${t.featured_image}`) :
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80",
          description: t.description || "Experience an amazing adventure with breathtaking views and unforgettable memories.",
          rating: t.average_rating || 4.5,
          reviews: t.review_count || 0,
          location: t.destination_names || t.primary_destination?.name || "Unknown",
          groupSize: `${t.max_capacity || 10} people`,
          season: "Any Season",
          difficulty: t.difficulty_level || "EASY",
          category: t.category || "CULTURAL",
          itinerary: (t.itinerary || []).map((it, index) => ({
            day: it.day || index + 1,
            title: it.title || `Day ${it.day || index + 1}`,
            description: it.description || "Activities for the day"
          })),
          inclusions: t.inclusions || [],
          exclusions: t.exclusions || [],
          hotel_details: t.hotel_details || {},
          vehicle_details: t.vehicle_details || {},
          special_notes: t.special_notes || ""
        };

        console.log('Processed Tour Object:', tourObj); // Debug log
        setTour(tourObj);
        fetchTourReviews(id);

      } catch (err) {
        console.error("Failed to fetch tour detail", err);
        message.error("Failed to load tour details");
        
        // Fallback data for development
        const fallbackTour = {
          id: id,
          title: "Sample Tour Package",
          price: 15000,
          duration: "5 Days",
          duration_days: 5,
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80",
          description: "Experience an amazing adventure with breathtaking views and unforgettable memories.",
          itinerary: [
            { day: 1, title: "Arrival", description: "Arrive at destination and check-in" },
            { day: 2, title: "Sightseeing", description: "Local sightseeing and activities" }
          ],
          inclusions: ["Accommodation", "Meals", "Transportation"],
          exclusions: ["Personal expenses", "Tips"],
          seasonal_pricings: [],
          hotel_details: {},
          vehicle_details: {},
          special_notes: "",
          rating: 4.5,
          reviews: 0,
          location: "India",
          groupSize: "10 people",
          difficulty: "EASY",
          category: "CULTURAL"
        };
        setTour(fallbackTour);
      } finally {
        setLoading(false);
      }
    };

    const fetchTourReviews = async (tourId) => {
      try {
        setReviewsLoading(true);
        const res = await apiClient.get(endpoints.GET_TOUR_REVIEWS(tourId));
        const reviewsData = res.data?.data || res.data?.results || res.data || [];
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
        setReviews([]);
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
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight) => {
        if (yPosition + requiredHeight > pageHeight - 25) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Helper function to draw improved table
      const drawTable = (headers, rows, startY, columnWidths = null) => {
        let currentY = startY;
        const defaultColWidth = contentWidth / headers.length;
        const colWidths = columnWidths || headers.map(() => defaultColWidth);

        // Draw header background
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, currentY, contentWidth, 10, 'F');
        
        // Draw header borders
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        
        let xPos = margin;
        headers.forEach((header, index) => {
          pdf.rect(xPos, currentY, colWidths[index], 10);
          xPos += colWidths[index];
        });

        // Draw header text
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        
        xPos = margin;
        headers.forEach((header, index) => {
          const textLines = pdf.splitTextToSize(header, colWidths[index] - 4);
          const textHeight = textLines.length * 3;
          const textY = currentY + 5 + (textHeight / 2);
          pdf.text(textLines, xPos + 2, textY);
          xPos += colWidths[index];
        });
        
        currentY += 10;

        // Draw rows
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        
        rows.forEach((row, rowIndex) => {
          const rowHeight = 12;
          
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
          }

          // Draw row borders
          xPos = margin;
          row.forEach((cell, cellIndex) => {
            pdf.rect(xPos, currentY, colWidths[cellIndex], rowHeight);
            xPos += colWidths[cellIndex];
          });

          // Draw cell text
          xPos = margin;
          row.forEach((cell, cellIndex) => {
            const cellText = String(cell || '');
            const textLines = pdf.splitTextToSize(cellText, colWidths[cellIndex] - 4);
            const textY = currentY + 4;
            pdf.text(textLines, xPos + 2, textY);
            xPos += colWidths[cellIndex];
          });
          
          currentY += rowHeight;
        });

        return currentY + 5;
      };

      // Title Section
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 20, 60);
      const titleLines = pdf.splitTextToSize(tour.title || 'Tour Package', contentWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 8 + 5;

      // Subtitle line
      pdf.setDrawColor(220, 20, 60);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Basic Info Section
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const basicInfoText = `Duration: ${tour.duration} | Group Size: ${tour.groupSize} | Difficulty: ${tour.difficulty}`;
      pdf.text(basicInfoText, margin, yPosition);
      yPosition += 8;

      const priceText = `Starting Price: ₹${tour.price?.toLocaleString()} per person`;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 20, 60);
      pdf.text(priceText, margin, yPosition);
      yPosition += 15;

      // Description
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      const descriptionLines = pdf.splitTextToSize(tour.description || '', contentWidth);
      pdf.text(descriptionLines, margin, yPosition);
      yPosition += (descriptionLines.length * 4) + 15;

      // Hotel Details Section
      if (tour.destinations && tour.destinations.length > 0) {
        checkPageBreak(40);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(220, 20, 60);
        pdf.text('HOTEL DETAILS:', margin, yPosition);
        yPosition += 10;

        const hotelHeaders = ['DESTINATION', 'HOTELS'];
        const hotelRows = tour.destinations.map(dest => {
          const hotelInfo = tour.hotel_details && tour.hotel_details[dest.id];
          return [
            dest.name.toUpperCase(),
            hotelInfo ? `${hotelInfo.hotel_name} (${hotelInfo.hotel_type})` : 'OMEGA/SIMILAR'
          ];
        });

        const hotelColWidths = [contentWidth * 0.4, contentWidth * 0.6];
        yPosition = drawTable(hotelHeaders, hotelRows, yPosition, hotelColWidths);
      }

      // Seasonal Pricing Section
      if (tour.seasonal_pricings && tour.seasonal_pricings.length > 0) {
        tour.seasonal_pricings.forEach((pricing, index) => {
          checkPageBreak(80);
          
          // Season header
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(220, 20, 60);
          const seasonText = `▶ RATE APPLICABLE FROM - ${pricing.season?.date_range_display?.toUpperCase() || 'SEASON'}`;
          const seasonLines = pdf.splitTextToSize(seasonText, contentWidth);
          pdf.text(seasonLines, margin, yPosition);
          yPosition += seasonLines.length * 5 + 5;

          // Available dates table
          if (pricing.available_dates && pricing.available_dates.length > 0) {
            const dateHeaders = ['MONTH', pricing.season?.name?.toUpperCase() || 'SEASON'];
            const dateRows = [['DATE', pricing.available_dates.join(', ')]];
            const dateColWidths = [contentWidth * 0.3, contentWidth * 0.7];
            yPosition = drawTable(dateHeaders, dateRows, yPosition, dateColWidths);
          }

          // Vehicle information
          if (tour.vehicle_details && Object.keys(tour.vehicle_details).length > 0) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(220, 20, 60);
            const vehicleText = `▶ VEHICLE: ${tour.vehicle_details.type}`;
            const vehicleLines = pdf.splitTextToSize(vehicleText, contentWidth);
            pdf.text(vehicleLines, margin, yPosition);
            yPosition += vehicleLines.length * 4 + 2;
            
            if (tour.vehicle_details.note) {
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              const noteText = `(${tour.vehicle_details.note})`;
              const noteLines = pdf.splitTextToSize(noteText, contentWidth - 20);
              pdf.text(noteLines, margin + 10, yPosition);
              yPosition += noteLines.length * 4 + 5;
            }
          }

          // Pricing table
          const pricingHeaders = [
            '02 SHARING\n(PER PERSON)',
            '03 SHARING\n(PER PERSON)', 
            'CHILD WITHOUT BED\n(4 YR - 11 YR)'
          ];
          
          const pricingRows = [[
            `INR ${pricing.two_sharing_price?.toLocaleString()}/-${pricing.includes_return_air ? '\nWITH RETURN AIR' : ''}`,
            `INR ${pricing.three_sharing_price?.toLocaleString()}/-${pricing.includes_return_air ? '\nWITH RETURN AIR' : ''}`,
            `INR ${pricing.child_price?.toLocaleString()}/-${pricing.includes_return_air ? '\nWITH RETURN AIR' : ''}`
          ]];

          const pricingColWidths = [contentWidth / 3, contentWidth / 3, contentWidth / 3];
          yPosition = drawTable(pricingHeaders, pricingRows, yPosition, pricingColWidths);
          yPosition += 10;
        });
      }

      // Itinerary Section
      if (tour.itinerary && tour.itinerary.length > 0) {
        checkPageBreak(40);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 102, 204);
        pdf.text('DETAILED ITINERARY:', margin, yPosition);
        yPosition += 12;

        tour.itinerary.forEach((day, index) => {
          checkPageBreak(25);
          
          // Day header
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(220, 20, 60);
          const dayTitle = `Day ${day.day}: ${day.title}`;
          pdf.text(dayTitle, margin, yPosition);
          yPosition += 8;

          // Day description
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          const dayDescLines = pdf.splitTextToSize(day.description, contentWidth - 10);
          pdf.text(dayDescLines, margin + 5, yPosition);
          yPosition += (dayDescLines.length * 4) + 10;
        });
      }

      // Inclusions Section
      if (tour.inclusions && tour.inclusions.length > 0) {
        checkPageBreak(40);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 150, 0);
        pdf.text('INCLUSIONS:', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        tour.inclusions.forEach(inclusion => {
          checkPageBreak(6);
          const inclusionLines = pdf.splitTextToSize(`✓ ${inclusion}`, contentWidth - 10);
          pdf.text(inclusionLines, margin + 5, yPosition);
          yPosition += inclusionLines.length * 4 + 2;
        });
        yPosition += 8;
      }

      // Exclusions Section
      if (tour.exclusions && tour.exclusions.length > 0) {
        checkPageBreak(40);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(220, 20, 60);
        pdf.text('EXCLUSIONS:', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        tour.exclusions.forEach(exclusion => {
          checkPageBreak(6);
          const exclusionLines = pdf.splitTextToSize(`✗ ${exclusion}`, contentWidth - 10);
          pdf.text(exclusionLines, margin + 5, yPosition);
          yPosition += exclusionLines.length * 4 + 2;
        });
        yPosition += 8;
      }

      // Special Notes Section
      if (tour.special_notes) {
        checkPageBreak(30);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(220, 20, 60);
        pdf.text('SPECIAL NOTES:', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        const notesLines = pdf.splitTextToSize(tour.special_notes, contentWidth);
        pdf.text(notesLines, margin, yPosition);
        yPosition += (notesLines.length * 4) + 15;
      }

      // Footer on each page
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const footerY = pageHeight - 10;
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Generated by Rima Tours & Travels', margin, footerY);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, footerY);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2 - 20, footerY);
      }

      // Save the PDF
      const fileName = `${tour.title?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Tour'}_Brochure.pdf`;
      pdf.save(fileName);
      message.success("Professional brochure downloaded successfully!");
      
    } catch (err) {
      console.error('PDF generation error:', err);
      message.error("Failed to generate brochure. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmitReview = async (values) => {
    try {
      await apiClient.post(endpoints.CREATE_REVIEW, {
        tour: id,
        rating: values.rating,
        comment: values.comment
      });
      message.success("Review submitted! Pending verification.");
      setReviewModalVisible(false);
      reviewForm.resetFields();
    } catch (error) {
      message.error("Failed to submit review.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Empty description="Tour not found" />
      </div>
    );
  }

  return (
    <div className="tour-detail-page" style={{ background: 'var(--bg-secondary)', paddingBottom: 'var(--spacing-4xl)' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', height: '60vh', overflow: 'hidden' }}>
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ height: '100%', width: '100%' }}
        >
          <Image
            src={tour.image}
            alt={tour.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            preview={false}
          />
        </motion.div>

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
                {tour.title}
              </h1>
              <Space size="large" style={{ color: 'white', fontSize: '1.1rem' }}>
                <span><EnvironmentOutlined /> {tour.location}</span>
                <span><ClockCircleOutlined /> {tour.duration}</span>
                <span><StarOutlined style={{ color: '#ffd700' }} /> {tour.rating}/5</span>
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
                  { icon: <ClockCircleOutlined />, label: "Duration", value: tour.duration, color: "#3498db" },
                  { icon: <TeamOutlined />, label: "Group Size", value: tour.groupSize, color: "#2ecc71" },
                  { icon: <SafetyCertificateOutlined />, label: "Difficulty", value: tour.difficulty, color: "#e67e22" },
                  { icon: <StarOutlined />, label: "Rating", value: `${tour.rating}/5`, color: "#f1c40f" },
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
                                              DATE
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
                                          02 SHARING<br/>(PER PERSON)
                                        </th>
                                        <th style={{ 
                                          border: '1px solid var(--border-color)', 
                                          padding: '10px',
                                          textAlign: 'center'
                                        }}>
                                          03 SHARING<br/>(PER PERSON)
                                        </th>
                                        <th style={{ 
                                          border: '1px solid var(--border-color)', 
                                          padding: '10px',
                                          textAlign: 'center'
                                        }}>
                                          CHILD WITHOUT BED<br/>(4 YR - 11 YR)
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
                                          {pricing.includes_return_air && <br/>}
                                          {pricing.includes_return_air && <span style={{ fontSize: '0.8rem' }}>WITH RETURN AIR</span>}
                                        </td>
                                        <td style={{ 
                                          border: '1px solid var(--border-color)', 
                                          padding: '15px',
                                          textAlign: 'center',
                                          fontWeight: 'bold'
                                        }}>
                                          INR {pricing.three_sharing_price?.toLocaleString()}/-
                                          {pricing.includes_return_air && <br/>}
                                          {pricing.includes_return_air && <span style={{ fontSize: '0.8rem' }}>WITH RETURN AIR</span>}
                                        </td>
                                        <td style={{ 
                                          border: '1px solid var(--border-color)', 
                                          padding: '15px',
                                          textAlign: 'center',
                                          fontWeight: 'bold'
                                        }}>
                                          INR {pricing.child_price?.toLocaleString()}/-
                                          {pricing.includes_return_air && <br/>}
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
                    ₹{tour.price.toLocaleString()}
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>per person</p>
                  
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
                        return (
                          <div key={index} style={{ marginBottom: '5px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{destination.name}:</span>
                            <span style={{ fontSize: '0.85rem', marginLeft: '5px' }}>
                              {hotelInfo ? `${hotelInfo.hotel_name} (${hotelInfo.hotel_type})` : 'Hotel details to be confirmed'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Divider />

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="btn-primary-gradient"
                    style={{ height: '50px', fontSize: '1.1rem' }}
                    onClick={() => requireAuth(() => navigate(`/booking/${id}`), "book this tour", () => setLoginModalVisible(true))}
                  >
                    Book Now
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
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                    <strong>Free Cancellation</strong> <br />
                    Cancel up to 24 hours in advance for a full refund.
                  </p>
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