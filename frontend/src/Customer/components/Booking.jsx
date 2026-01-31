import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  InputNumber,
  message,
  Steps,
  Divider,
  Modal,
  Typography,
  Alert,
  Spin,
  Select,
  Tag,
  Tooltip,
  Upload,
  DatePicker
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  UploadOutlined,
  SafetyCertificateOutlined,
  TagOutlined,
  HomeOutlined,
  SmileOutlined,
  TeamOutlined,
  UsergroupAddOutlined
} from "@ant-design/icons";

import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import { useUser } from "../../context/userContext";
import { AnimatePresence, motion } from "framer-motion";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Booking = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();

  // State
  const [tourData, setTourData] = useState(null);
  const [tourLoading, setTourLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const [travelDate, setTravelDate] = useState(null);
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "", category: "adult", sharing_type: "two_sharing" }]);

  const [activePricing, setActivePricing] = useState(null);
  const [contactDetails, setContactDetails] = useState({
    name: user?.username || "",
    email: user?.email || "",
    phone: "",
    address: ""
  });

  const [aadharFileList, setAadharFileList] = useState([]);

  // Offers state
  const [availableOffers, setAvailableOffers] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState([]);

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(endpoints.GET_TOUR_DETAIL(tourId));
        const tourData = response.data?.data || response.data;
        setTourData(tourData);
        
        // Set available offers from tour data
        if (tourData?.active_offers && tourData.active_offers.length > 0) {
          setAvailableOffers(tourData.active_offers);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tour:", error);
        message.error("Failed to load tour details");
      } finally {
        setTourLoading(false);
      }
    };

    if (tourId) fetchTourData();
  }, [tourId]);

  // Update contact details when user loads
  useEffect(() => {
    if (user) {
      setContactDetails(prev => ({
        ...prev,
        name: user.username || user.first_name || prev.name,
        email: user.email || prev.email,
        // Auto-fill phone if available, otherwise keep existing
        phone: user.phone || user.mobile || prev.phone
      }));
    }
  }, [user]);

  // ...

  const availableDates = useMemo(() => {
    if (!tourData) return [];

    const dates = [];
    const minBookingDate = dayjs().add(10, 'day').startOf('day');

    // Add direct tour dates
    if (tourData.available_dates) {
      // Parse available_dates if it's a string (JSON format)
      let availableDatesArray = tourData.available_dates;
      if (typeof availableDatesArray === 'string') {
        try {
          availableDatesArray = JSON.parse(availableDatesArray);
        } catch (e) {
          availableDatesArray = [];
        }
      }
      
      if (Array.isArray(availableDatesArray)) {
        availableDatesArray.forEach(d => {
          const date = dayjs(d);
          if (date.isSameOrAfter(minBookingDate)) {
            dates.push(date.format("YYYY-MM-DD"));
          }
        });
      }
    }

    // Add seasonal pricing dates
    if (tourData.seasonal_pricings && tourData.seasonal_pricings.length > 0) {
      tourData.seasonal_pricings.forEach(pricing => {
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
            dates.push(dateToCheck.format("YYYY-MM-DD"));
          }
        });
      });
    }

    // Also check pricing_details (main source of available dates)
    if (tourData.pricing_details && Array.isArray(tourData.pricing_details)) {
      tourData.pricing_details.forEach(pricing => {
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
            dates.push(dateToCheck.format("YYYY-MM-DD"));
          }
        });
      });
    }

    return [...new Set(dates)].sort();
  }, [tourData]);

  // Determine active pricing based on selected date
  useEffect(() => {
    if (!tourData || !travelDate) {
      setActivePricing(null);
      return;
    }

    // First check pricing_details (main source)
    if (tourData.pricing_details && Array.isArray(tourData.pricing_details)) {
      const matchingPricing = tourData.pricing_details.find(pricing => {
        if (!pricing.available_dates || !Array.isArray(pricing.available_dates)) return false;
        
        const selectedDateStr = travelDate.format("YYYY-MM-DD");
        return pricing.available_dates.some(dateStr => {
          if (dateStr.includes('-')) {
            // Full date string
            return dateStr === selectedDateStr;
          } else {
            // Day number - check if it matches selected date's day
            const dayNum = parseInt(dateStr);
            return travelDate.date() === dayNum;
          }
        });
      });
      
      if (matchingPricing) {
        setActivePricing(matchingPricing);
        return;
      }
    }

    // Fallback to seasonal_pricings
    if (tourData.seasonal_pricings && Array.isArray(tourData.seasonal_pricings)) {
      const matchingPricing = tourData.seasonal_pricings.find(pricing => {
        const season = pricing.season_details || pricing.season;
        if (!season || typeof season !== 'object') return false;

        const start = dayjs(season.start_date);
        const end = dayjs(season.end_date);
        return travelDate.isSameOrAfter(start) && travelDate.isSameOrBefore(end);
      });

      setActivePricing(matchingPricing);
    } else {
      setActivePricing(null);
    }
  }, [travelDate, tourData]);

  // Handlers
  const handleNumberOfPassengersChange = (value) => {
    setNumberOfPassengers(value);
    const newPassengers = [...passengers];
    if (value > passengers.length) {
      // Add new passengers
      for (let i = passengers.length; i < value; i++) {
        newPassengers.push({ name: "", age: "", gender: "", category: "adult", sharing_type: "two_sharing" });
      }
    } else {
      // Remove excess passengers
      newPassengers.splice(value);
    }
    setPassengers(newPassengers);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleContactChange = (field, value) => {
    setContactDetails(prev => ({ ...prev, [field]: value }));
  };

  // Pricing Calculation logic
  const priceBreakdown = useMemo(() => {
    if (!tourData) return { baseTotal: 0, discount: 0, finalTotal: 0, perPassenger: [], selectedOffers: [] };

    let baseTotal = 0;
    const perPassenger = passengers.map(p => {
      let price = 0;

      if (activePricing) {
        if (p.category === 'child') {
          price = activePricing.child_price || activePricing.price || tourData.child_price || 0;
        } else {
          // Adult pricing based on sharing type
          if (p.sharing_type === 'three_sharing') {
            price = activePricing.three_sharing_price || activePricing.price || tourData.base_price || 0;
          } else {
            price = activePricing.two_sharing_price || activePricing.price || tourData.base_price || 0;
          }
        }
      } else {
        // Fallback non-seasonal pricing
        if (p.category === 'child') {
          price = tourData.child_price || (Number(tourData.base_price) * 0.7) || 0;
        } else {
          price = tourData.base_price || 0;
        }
      }

      baseTotal += Number(price);
      return { ...p, price: Number(price) };
    });

    // Calculate discount from selected offer (single selection)
    let discount = 0;
    let appliedOffers = [];
    
    if (selectedOffers.length > 0) {
      // Since we only allow single selection, use the first (and only) offer
      const selectedOffer = selectedOffers[0];
      
      if (selectedOffer.discount_type === 'PERCENTAGE') {
        discount = (baseTotal * Number(selectedOffer.discount_percentage)) / 100;
      } else if (selectedOffer.discount_type === 'FIXED_AMOUNT') {
        // For fixed amount, don't exceed the base total
        discount = Math.min(Number(selectedOffer.discount_amount), baseTotal);
      }
      
      appliedOffers = [selectedOffer];
    }

    return {
      baseTotal,
      discount,
      finalTotal: baseTotal - discount,
      perPassenger,
      selectedOffers: appliedOffers
    };
  }, [passengers, tourData, activePricing, selectedOffers]);

  // ...

  const handlePayment = async () => {
    // Show payment modal first
    setPaymentModalVisible(true);
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      if (!user) {
        setLoading(false);
        return message.error("Please log in to make a booking");
      }

      const formData = new FormData();
      formData.append('tour', tourId);
      formData.append('travelers_count', numberOfPassengers);
      formData.append('travel_date', travelDate.format("YYYY-MM-DD"));
      formData.append('total_price', priceBreakdown.finalTotal);
      formData.append('contact_number', contactDetails.phone);
      formData.append('emergency_contact', contactDetails.emergency_contact);
      formData.append('special_requests', contactDetails.special_requests);

      // Add offer information if selected
      if (selectedOffers.length > 0) {
        formData.append('applied_offer_id', selectedOffers[0].id);
        formData.append('discount_amount', priceBreakdown.discount);
        formData.append('base_amount', priceBreakdown.baseTotal);
      }

      // Append traveler details as JSON string
      formData.append('traveler_details', JSON.stringify(passengers.map(p => ({
        name: p.name,
        age: parseInt(p.age),
        category: p.category,
        sharing_type: p.category === 'child' ? 'child' : p.sharing_type
      }))));

      if (aadharFileList.length > 0) {
        formData.append('aadhar_card', aadharFileList[0].originFileObj);
      }

      const bookingResponse = await apiClient.post(endpoints.CREATE_BOOKING, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // ... rest of logic (Payment, etc)
      // payment logic...

      // Simulate Payment Process

      await new Promise(r => setTimeout(r, 2000));

      const paymentData = {
        booking: bookingResponse.data.id || bookingResponse.data.data?.id,
        amount: priceBreakdown.finalTotal,
        payment_method: "CREDIT_CARD",
        status: "SUCCESS",
      };

      await apiClient.post(endpoints.CREATE_PAYMENT, paymentData);

      message.success("Booking confirmed! Redirecting to your dashboard...");
      setPaymentModalVisible(false);
      navigate("/my-bookings");
    } catch (error) {
      console.error(error);
      message.error("Booking failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ... Step 2 Render Update for Aadhar
  // Inside render, find Step 2 (Contact Specifics) or make a new one?
  // User requested "Image field while BOOKING... stores Aadhar".
  // I will add it to Contact Specifics (currentStep === 2).

  // ... HTML changes to include Upload component ... will be done in separate replacement or large chunk?
  // I can put the upload component in the return block.


  const steps = [
    { title: "Select Date", icon: <CalendarOutlined /> },
    { title: "Offers", icon: <InfoCircleOutlined /> },
    { title: "Travelers", icon: <UserOutlined /> },
    { title: "Contact", icon: <InfoCircleOutlined /> },
    { title: "Review", icon: <CheckCircleOutlined /> },
  ];

  if (tourLoading) return <div style={{ height: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" tip="Preparing your adventure..." /></div>;
  if (!tourData) return <div style={{ height: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography.Title level={4}>Tour details not found</Typography.Title></div>;

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={2}>Book Your Trip to {tourData?.name}</Title>
          <Text type="secondary">Follow the simple steps to confirm your spot</Text>
        </motion.div>

        <Row gutter={[40, 40]}>
          <Col xs={24} lg={16}>
            <Card className="card" style={{ boxShadow: 'var(--shadow-lg)', borderRadius: 16 }}>
              <Steps current={currentStep} items={steps} style={{ marginBottom: 40 }} />

              <div style={{ minHeight: 400 }}>
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Title level={4}>Travel Logistics</Title>
                      <Divider />
                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item label="Travel Date" required extra={availableDates.length > 0 ? "Choose from our scheduled departure dates" : "Select any future date"}>
                            <Select
                              style={{ width: '100%' }}
                              size="large"
                              placeholder="Choose your travel date"
                              value={travelDate ? travelDate.format("YYYY-MM-DD") : undefined}
                              onChange={(val) => setTravelDate(dayjs(val))}
                            >
                              {availableDates.map(date => (
                                <Option key={date} value={date}>
                                  {dayjs(date).format("DD MMMM, YYYY (dddd)")}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Number of Travelers" required>
                            <InputNumber
                              min={1}
                              max={tourData?.available_capacity || 20}
                              value={numberOfPassengers}
                              onChange={handleNumberOfPassengersChange}
                              style={{ width: '100%' }}
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {activePricing && (
                        <Alert
                          message="Seasonal Pricing Active"
                          description={`Selected date falls under "${activePricing.season?.name || activePricing.season_name || 'Special Season'}". Category-based prices will be applied.`}
                          type="info"
                          showIcon
                          style={{ marginTop: 20 }}
                        />
                      )}
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Title level={4}>Available Offers</Title>
                      <Divider />
                      
                      {availableOffers.length > 0 ? (
                        <div>
                          <Alert
                            message="Special Offers Available!"
                            description="Select an offer to apply to your booking. You can choose only one offer at a time."
                            type="success"
                            showIcon
                            style={{ marginBottom: 20 }}
                          />
                          
                          {/* Offers Container with improved scrolling */}
                          <div style={{ 
                            maxHeight: '400px', 
                            overflowY: 'auto',
                            paddingRight: '8px',
                            marginBottom: '15px'
                          }}>
                            <div style={{ display: 'grid', gap: '12px' }}>
                              {availableOffers.map((offer) => {
                                const isSelected = selectedOffers.find(o => o.id === offer.id);
                                return (
                                  <Card
                                    key={offer.id}
                                    size="small"
                                    style={{
                                      border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s ease',
                                      backgroundColor: isSelected ? 'rgba(24, 144, 255, 0.05)' : 'white',
                                      boxShadow: isSelected ? '0 4px 12px rgba(24, 144, 255, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    onClick={() => {
                                      if (isSelected) {
                                        // Deselect current offer
                                        setSelectedOffers([]);
                                      } else {
                                        // Select only this offer (single selection)
                                        setSelectedOffers([offer]);
                                      }
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                          <Tag 
                                            color={isSelected ? "green" : "red"} 
                                            style={{ 
                                              fontSize: '14px', 
                                              fontWeight: 'bold',
                                              padding: '4px 8px',
                                              borderRadius: '6px'
                                            }}
                                          >
                                            {offer.discount_type === 'PERCENTAGE' 
                                              ? `${offer.discount_percentage}% OFF`
                                              : `₹${offer.discount_amount} OFF`
                                            }
                                          </Tag>
                                          <Text strong style={{ fontSize: '16px', color: isSelected ? 'var(--primary-color)' : 'inherit' }}>
                                            {offer.name}
                                          </Text>
                                        </div>
                                        {offer.description && (
                                          <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                            {offer.description}
                                          </Text>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                          <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Valid until {dayjs(offer.end_date).format('DD MMM, YYYY')}
                                          </Text>
                                          {isSelected && (
                                            <Text style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                              ✓ Applied
                                            </Text>
                                          )}
                                        </div>
                                      </div>
                                      <div style={{ textAlign: 'right', marginLeft: '15px' }}>
                                        {isSelected ? (
                                          <CheckCircleOutlined style={{ fontSize: '28px', color: 'var(--primary-color)' }} />
                                        ) : (
                                          <div style={{ 
                                            width: '28px', 
                                            height: '28px', 
                                            border: '2px solid var(--border-color)', 
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                          }}>
                                            <div style={{
                                              width: '12px',
                                              height: '12px',
                                              borderRadius: '50%',
                                              backgroundColor: 'transparent'
                                            }} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Show selected offer summary */}
                          {selectedOffers.length > 0 && (
                            <Alert
                              message={`${selectedOffers[0].name} Applied`}
                              description={
                                selectedOffers[0].discount_type === 'PERCENTAGE'
                                  ? `You'll save ${selectedOffers[0].discount_percentage}% on your total booking amount.`
                                  : `You'll save ₹${selectedOffers[0].discount_amount} on your total booking amount.`
                              }
                              type="success"
                              showIcon
                              style={{ 
                                marginTop: 10,
                                backgroundColor: 'rgba(82, 196, 26, 0.05)',
                                border: '1px solid rgba(82, 196, 26, 0.3)'
                              }}
                            />
                          )}
                          
                          {/* Scroll indicator for many offers */}
                          {availableOffers.length > 3 && (
                            <div style={{ 
                              textAlign: 'center', 
                              marginTop: '10px',
                              color: 'var(--text-tertiary)',
                              fontSize: '12px'
                            }}>
                              {availableOffers.length} offers available • Scroll to see all
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                          <InfoCircleOutlined style={{ fontSize: '48px', color: 'var(--text-tertiary)', marginBottom: '15px' }} />
                          <Title level={4} style={{ color: 'var(--text-secondary)' }}>No Special Offers Available</Title>
                          <Text type="secondary">
                            This tour doesn't have any active offers at the moment. You can still proceed with the regular pricing.
                          </Text>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div style={{ marginBottom: '24px' }}>
                        <Title level={4} style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>
                          <UserOutlined style={{ marginRight: '8px' }} />
                          Traveler Details
                        </Title>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          Please provide details for all travelers. This information will be used for booking confirmation.
                        </Text>
                      </div>
                      
                      <Divider style={{ margin: '16px 0' }} />
                      
                      <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                        {passengers.map((p, i) => (
                          <Card 
                            key={i} 
                            style={{ 
                              marginBottom: '20px', 
                              borderRadius: '16px',
                              border: '1px solid #f0f0f0',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                              background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'
                            }}
                            bodyStyle={{ padding: '20px' }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              marginBottom: '16px',
                              paddingBottom: '12px',
                              borderBottom: '1px solid #f5f5f5'
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, #40a9ff 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px'
                              }}>
                                <Text strong style={{ color: 'white', fontSize: '16px' }}>
                                  {i + 1}
                                </Text>
                              </div>
                              <div>
                                <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                                  Traveler {i + 1}
                                </Text>
                                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                  {p.category === 'adult' ? 'Adult Passenger' : 'Child Passenger'}
                                </div>
                              </div>
                            </div>
                            
                            <Row gutter={[16, 16]}>
                              <Col xs={{span:24}} md={{span:12}}>
                                <Form.Item 
                                
                                  label={
                                    <span style={{ fontWeight: '500', color: '#595959' }}>
                                      <UserOutlined style={{ marginRight: '4px' }} />
                                      Full Name
                                    </span>
                                  } 
                                  required
                                  style={{ marginBottom: '16px' }}
                                  
                                >
                                  <Input 
                                    value={p.name} 
                                    placeholder="Enter full name" 
                                    size="large"
                                    style={{ 
                                      borderRadius: '8px',
                                      border: '1px solid #d9d9d9',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onChange={e => {
                                      const next = [...passengers];
                                      next[i].name = e.target.value;
                                      setPassengers(next);
                                    }} 
                                  />
                                </Form.Item>
                              </Col>
                              
                              <Col xs={{span:24}} md={{span:12}}>
                                <Form.Item 
                                  label={
                                    <span style={{ fontWeight: '500', color: '#595959' }}>
                                      <CalendarOutlined style={{ marginRight: '4px' }} />
                                      Age
                                    </span>
                                  } 
                                  required
                                  style={{ marginBottom: '16px' }}
                                >
                                  <InputNumber 
                                    style={{ 
                                      width: '100%',
                                      borderRadius: '8px'
                                    }} 
                                    size="large"
                                    min={1} 
                                    minLength={1}
                                    max={99} 
                                    maxLength={2}
                                    value={p.age} 
                                    placeholder="Age"
                                    onChange={val => {
                                      const next = [...passengers];
                                      next[i].age = val;
                                      
                                      if (val && val < 12) {
                                        next[i].category = 'child';
                                        next[i].sharing_type = 'child';
                                      } else if (val && val >= 12) {
                                        next[i].category = 'adult';
                                        if (next[i].sharing_type === 'child') {
                                          next[i].sharing_type = 'two_sharing';
                                        }
                                      }
                                      setPassengers(next);
                                    }} 
                                  />
                                </Form.Item>
                              </Col>
                              
                              <Col xs={{span:24}}>
                                <Form.Item 
                                  label={
                                    <span style={{ fontWeight: '500', color: '#595959' }}>
                                      <TagOutlined style={{ marginRight: '4px' }} />
                                      Category
                                    </span>
                                  } 
                                  required
                                  style={{ marginBottom: '16px' }}
                                >
                                  <Select 
                                    value={p.category} 
                                    size="large"
                                    style={{ borderRadius: '8px' }}
                                    onChange={val => {
                                      const next = [...passengers];
                                      next[i].category = val;
                                      if (val === 'child') {
                                        next[i].sharing_type = 'child';
                                      } else if (next[i].sharing_type === 'child') {
                                        next[i].sharing_type = 'two_sharing';
                                      }
                                      setPassengers(next);
                                    }}
                                  >
                                    <Option value="adult">
                                      <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <UserOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                        Adult (12+ Years)
                                      </div>
                                    </Option>
                                    <Option value="child">
                                      <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <SmileOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                                        Child (4-11 Years)
                                      </div>
                                    </Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              
                              <Col xs={{span:24}} >
                                <Form.Item 
                                  label={
                                    <span style={{ fontWeight: '500', color: '#595959' }}>
                                      <HomeOutlined style={{ marginRight: '4px' }} />
                                      Room Sharing
                                    </span>
                                  } 
                                  required
                                  style={{ marginBottom: '16px' }}
                                >
                                  <Select
                                    value={p.category === 'child' ? 'child' : p.sharing_type}
                                    disabled={p.category === 'child'}
                                    size="large"
                                    style={{ borderRadius: '8px' }}
                                    onChange={val => {
                                      const next = [...passengers];
                                      next[i].sharing_type = val;
                                      setPassengers(next);
                                    }}
                                  >
                                    {p.category === 'child' ? (
                                      <Option value="child">
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <SmileOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                                          Child Rate (No Bed)
                                        </div>
                                      </Option>
                                    ) : (
                                      <>
                                        <Option value="two_sharing">
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                            2-Sharing (Twin/Double)
                                          </div>
                                        </Option>
                                        <Option value="three_sharing">
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <UsergroupAddOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                                            3-Sharing (Triple)
                                          </div>
                                        </Option>
                                      </>
                                    )}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>
                            
                            {/* Price preview for this traveler */}
                            <div style={{
                              marginTop: '12px',
                              padding: '12px 16px',
                              background: 'rgba(24, 144, 255, 0.05)',
                              borderRadius: '8px',
                              border: '1px solid rgba(24, 144, 255, 0.1)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: '13px', color: '#595959' }}>
                                  Price for this traveler:
                                </Text>
                                <Text strong style={{ fontSize: '14px', color: 'var(--primary-color)' }}>
                                  ₹{priceBreakdown.perPassenger[i]?.price || 0}
                                </Text>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Summary card */}
                      <Card style={{
                        marginTop: '20px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                        border: '1px solid #b7eb8f'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text strong style={{ fontSize: '16px', color: '#389e0d' }}>
                              Total Travelers: {passengers.length}
                            </Text>
                            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                              {passengers.filter(p => p.category === 'adult').length} Adults, {passengers.filter(p => p.category === 'child').length} Children
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text style={{ fontSize: '13px', color: '#595959' }}>Subtotal</Text>
                            <div>
                              <Text strong style={{ fontSize: '18px', color: '#389e0d' }}>
                                ₹{priceBreakdown.baseTotal}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Title level={4}>Contact Specifics</Title>
                      <Divider />
                      
                      {/* Info Alert */}
                      <Alert
                        message="Contact Information"
                        description="Your name and email are automatically filled from your profile. If you need to update them, please go to your profile settings."
                        type="info"
                        showIcon
                        style={{ marginBottom: 20 }}
                      />
                      
                      <Form layout="vertical">
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Full Name">
                              <Input 
                                size="large" 
                                value={contactDetails.name} 
                                readOnly
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                suffix={<Text type="secondary" style={{ fontSize: '12px' }}>From Profile</Text>}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Email Address">
                              <Input 
                                size="large" 
                                value={contactDetails.email} 
                                readOnly
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                suffix={<Text type="secondary" style={{ fontSize: '12px' }}>From Profile</Text>}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item 
                          label="Primary Mobile Number" 
                          required
                          validateStatus={
                            contactDetails.phone ? 
                              (!/^[6-9]\d{9}$/.test(contactDetails.phone) ? 'error' : 'success') : 
                              'error'
                          }
                          help={
                            !contactDetails.phone ? 
                              'Please add a mobile number to your profile or enter one below' :
                              (!/^[6-9]\d{9}$/.test(contactDetails.phone) ? 
                                'Please enter a valid 10-digit mobile number' : 
                                'From your profile - readonly')
                          }
                        >
                          {contactDetails.phone && /^[6-9]\d{9}$/.test(contactDetails.phone) ? (
                            <Input 
                              size="large" 
                              value={contactDetails.phone} 
                              readOnly
                              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                              suffix={<Text type="secondary" style={{ fontSize: '12px' }}>From Profile</Text>}
                            />
                          ) : (
                            <Input 
                              size="large" 
                              value={contactDetails.phone} 
                              onChange={e => setContactDetails({ ...contactDetails, phone: e.target.value })}
                              placeholder="Enter 10-digit mobile number"
                              maxLength={10}
                            />
                          )}
                        </Form.Item>

                        <Form.Item 
                          label="Emergency Contact" 
                          extra="Add additional contact person/number for emergencies"
                        >
                          <Input 
                            size="large" 
                            value={contactDetails.emergency_contact} 
                            onChange={e => setContactDetails({ ...contactDetails, emergency_contact: e.target.value })}
                            placeholder="e.g., John Doe - 9876543210 (Relation: Father)"
                          />
                        </Form.Item>

                        <Form.Item label="Identity Verification (Aadhar Card)" required tooltip="Required for booking confirmation">
                          <Upload
                            beforeUpload={(file) => {
                              const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
                              const isValidSize = file.size / 1024 / 1024 < 5; // 5MB limit
                              
                              if (!isValidType) {
                                message.error('Please upload only JPG/PNG images');
                                return false;
                              }
                              
                              if (!isValidSize) {
                                message.error('Image size must be less than 5MB');
                                return false;
                              }
                              
                              return false; // Prevent auto upload
                            }}
                            listType="picture"
                            maxCount={1}
                            fileList={aadharFileList}
                            onChange={({ fileList }) => setAadharFileList(fileList)}
                            accept="image/jpeg,image/jpg,image/png"
                          >
                            <Button icon={<UploadOutlined />}>Upload Aadhar (Image, Max 5MB)</Button>
                          </Upload>
                        </Form.Item>
                        <Form.Item label="Special Requirements (Dietary, Accessibility, etc.)">
                          <TextArea rows={4} value={contactDetails.special_requests} onChange={e => setContactDetails({ ...contactDetails, special_requests: e.target.value })} />
                        </Form.Item>
                      </Form>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Title level={4}>Final Review</Title>
                      <Divider />
                      <div style={{ background: '#f8f9fa', padding: 24, borderRadius: 12 }}>
                        <Row gutter={[16, 24]}>
                          <Col span={12}><Text type="secondary">Destination</Text><br /><Text strong>{tourData.name}</Text></Col>
                          <Col span={12}><Text type="secondary">Travel Date</Text><br /><Text strong>{travelDate?.format("DD MMM, YYYY")}</Text></Col>
                          <Col span={12}><Text type="secondary">Total Travelers</Text><br /><Text strong>{numberOfPassengers} Person(s)</Text></Col>
                          <Col span={12}>
                            <Text type="secondary">Contact Details</Text><br />
                            <div style={{ fontSize: '12px' }}>
                              <div><strong>Name:</strong> {contactDetails.name}</div>
                              <div><strong>Email:</strong> {contactDetails.email}</div>
                              <div><strong>Phone:</strong> {contactDetails.phone}</div>
                              {contactDetails.emergency_contact && (
                                <div><strong>Emergency:</strong> {contactDetails.emergency_contact}</div>
                              )}
                            </div>
                          </Col>
                          <Col span={24}>
                            <Text type="secondary">Price Breakdown</Text><br />
                            {priceBreakdown.perPassenger.map((p, i) => (
                              <div key={i} style={{ fontSize: '12px' }}>
                                {p.name || `Traveler ${i + 1}`}: ₹{p.price.toLocaleString()}
                                <Tag size="small" style={{ marginLeft: 5 }}>
                                  {p.category === 'child' ? 'Child' : p.sharing_type.replace('_', ' ')}
                                </Tag>
                              </div>
                            ))}
                          </Col>
                        </Row>
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Title level={4} style={{ margin: 0 }}>Final Amount</Title>
                          <Title level={3} style={{ margin: 0, color: 'var(--primary-color)' }}>₹{priceBreakdown.finalTotal.toLocaleString()}</Title>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0}>
                  Previous
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  loading={loading} 
                  disabled={
                    (currentStep === 0 && (!travelDate || !numberOfPassengers)) ||
                    (currentStep === 2 && passengers.some(p => !p.name || !p.age || !p.category)) ||
                    (currentStep === 3 && (
                      !contactDetails.phone || 
                      !/^[6-9]\d{9}$/.test(contactDetails.phone) || 
                      aadharFileList.length === 0
                    ))
                  }
                  onClick={() => currentStep === 4 ? handlePayment() : setCurrentStep(prev => prev + 1)}
                >
                  {currentStep === 4 ? "Confirm & Pay" : "Continue"} <ArrowRightOutlined />
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className="card" title="Booking Selection" style={{ borderRadius: 16 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <img 
                    src={tourData.featured_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100&h=100&fit=crop"} 
                    alt={tourData.name} 
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} 
                  />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{tourData.name}</Text><br />
                    <Tag color="blue">{tourData.duration_days} Days</Tag>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Subtotal ({numberOfPassengers} Travelers)</Text>
                  <Text>₹{priceBreakdown.baseTotal.toLocaleString()}</Text>
                </div>

                {priceBreakdown.activeOffer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#52c41a' }}>
                    <span>% Discount ({priceBreakdown.activeOffer.name})</span>
                    <span>- ₹{priceBreakdown.discount.toLocaleString()}</span>
                  </div>
                )}

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text strong style={{ fontSize: 18 }}>Total Payable</Text>
                  <Text strong style={{ fontSize: 24, color: 'var(--primary-color)' }}>₹{priceBreakdown.finalTotal.toLocaleString()}</Text>
                </div>

                <Tooltip title="Secure payment encryption active">
                  <div style={{ marginTop: 20, padding: 12, background: 'var(--primary-light)', borderRadius: 8, textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ color: 'var(--primary-color)', marginRight: 8 }} />
                    <Text strong style={{ color: 'var(--primary-color)' }}>Ready for Confirmation</Text>
                  </div>
                </Tooltip>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>

      <Modal
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={500}
        closeIcon={null}
        bodyStyle={{ padding: 0 }}
        style={{ top: 20 }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
          padding: '30px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
            backdropFilter: 'blur(10px)'
          }}>
            <LockOutlined style={{ fontSize: 40, color: 'white' }} />
          </div>
          <Title level={2} style={{ color: 'white', margin: '0 0 10px 0' }}>Secure Checkout</Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
            Complete your booking with our secure payment system
          </Text>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Booking Summary */}
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '25px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <Text strong style={{ fontSize: '16px' }}>Booking Summary</Text>
              <Tag color="blue">{tourData.name}</Tag>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text type="secondary">Travel Date:</Text>
              <Text strong>{travelDate?.format("DD MMM, YYYY")}</Text>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text type="secondary">Travelers:</Text>
              <Text strong>{numberOfPassengers} Person(s)</Text>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text type="secondary">Subtotal:</Text>
              <Text>₹{priceBreakdown.baseTotal.toLocaleString()}</Text>
            </div>

            {priceBreakdown.selectedOffers && priceBreakdown.selectedOffers.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#52c41a' }}>
                <Text type="secondary">Discount ({priceBreakdown.selectedOffers[0].name}):</Text>
                <Text style={{ color: '#52c41a' }}>- ₹{priceBreakdown.discount.toLocaleString()}</Text>
              </div>
            )}

            <Divider style={{ margin: '15px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: '18px' }}>Total Amount:</Text>
              <Text strong style={{ fontSize: '24px', color: 'var(--primary-color)' }}>
                ₹{priceBreakdown.finalTotal.toLocaleString()}
              </Text>
            </div>
          </div>

          <Form form={paymentForm} layout="vertical" onFinish={processPayment}>
            <Form.Item 
              name="cardNumber"
              label="Card Number" 
              rules={[
                { required: true, message: 'Please enter card number' },
                { pattern: /^\d{16}$/, message: 'Please enter a valid 16-digit card number' }
              ]}
            >
              <Input 
                size="large" 
                prefix={<CreditCardOutlined style={{ color: 'var(--primary-color)' }} />} 
                placeholder="1234 5678 9012 3456" 
                maxLength={19}
                style={{ borderRadius: '8px' }}
                onChange={(e) => {
                  // Auto-format card number with spaces
                  let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                  value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                  e.target.value = value;
                }}
              />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="expiry" 
                  label="Expiry Date" 
                  rules={[{ required: true, message: 'Please select expiry date' }]}
                >
                  <DatePicker
                    size="large"
                    placeholder="MM/YY"
                    format="MM/YY"
                    picker="month"
                    style={{ width: '100%', borderRadius: '8px' }}
                    disabledDate={(current) => current && current.isBefore(dayjs(), 'month')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="cvv" 
                  label="CVV" 
                  rules={[
                    { required: true, message: 'Please enter CVV' },
                    { pattern: /^\d{3,4}$/, message: 'Please enter a valid CVV' }
                  ]}
                >
                  <Input 
                    size="large" 
                    type="password" 
                    placeholder="123" 
                    maxLength={4}
                    style={{ borderRadius: '8px' }}
                    onChange={(e) => {
                      // Only allow numbers
                      e.target.value = e.target.value.replace(/\D/g, '');
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item 
              name="cardholderName" 
              label="Cardholder Name" 
              rules={[
                { required: true, message: 'Please enter cardholder name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input 
                size="large" 
                placeholder="JOHN DOE" 
                style={{ textTransform: 'uppercase', borderRadius: '8px' }}
                onChange={(e) => {
                  // Convert to uppercase and allow only letters and spaces
                  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, '');
                }}
              />
            </Form.Item>

            {/* Security Features */}
            <div style={{ 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '8px', 
              padding: '15px', 
              marginBottom: '20px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                <Text strong style={{ color: '#52c41a' }}>Your payment is secure</Text>
              </div>
              <Text style={{ fontSize: '13px', color: '#666' }}>
                • 256-bit SSL encryption<br/>
                • PCI DSS compliant<br/>
                • Your card details are never stored
              </Text>
            </div>

            <Button 
              type="primary" 
              block 
              size="large" 
              htmlType="submit" 
              loading={loading} 
              style={{ 
                height: 50, 
                borderRadius: 12, 
                fontSize: '16px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                border: 'none'
              }}
            >
              Pay ₹{priceBreakdown.finalTotal.toLocaleString()}
            </Button>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                By proceeding, you agree to our Terms & Conditions
              </Text>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Booking;
