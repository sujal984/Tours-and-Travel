import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  InputNumber,
  DatePicker,
  message,
  Steps,
  Divider,
  Table,
  Modal,
  Space,
  Typography,
  Alert,
} from "antd";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Navbar from "./Navbar";
import Footer from "./Footer";
import InquiryButton from "./InquiryButton";
import { useUser } from "../../context/userContext";
import { useParams, useNavigate } from "react-router-dom";
import "./Booking.css";

import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { TextArea } = Input;
const { Title, Text } = Typography;

const Booking = () => {
  const { tourId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [bookingForm] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tourData, setTourData] = useState(null);
  const [tourLoading, setTourLoading] = useState(true);
  const [passengers, setPassengers] = useState([]);
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();
  const [contactDetails, setContactDetails] = useState({});
  const [travelDate, setTravelDate] = useState(null);

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  useEffect(() => {
    console.log('Tour data state changed:', tourData);
  }, [tourData]);

  useEffect(() => {
    if (tourData) {
      setTotalPrice(tourData.price * numberOfPassengers);
    }
  }, [numberOfPassengers, tourData]);

  const fetchTourData = async () => {
    try {
      const res = await apiClient.get(endpoints.GET_TOUR_DETAIL(tourId));
      console.log('Booking Tour API Response:', res.data); // Debug log
      
      // Extract tour data from the API response structure
      const t = res.data.data || res.data; // Handle both response formats
      console.log('Extracted Tour Data:', t); // Debug log
      
      if (!t || !t.id) {
        throw new Error('Invalid tour data received');
      }
      
      const tourInfo = {
        id: t.id,
        name: t.name, // Backend uses 'name' not 'title'
        price: t.base_price || 0, // Backend uses 'base_price'
        duration: `${t.duration_days || 1} Days`, // Backend uses 'duration_days'
        destination: t.destination?.name || "Unknown",
        image: t.featured_image ? 
          (t.featured_image.startsWith('http') ? t.featured_image : `http://127.0.0.1:8000${t.featured_image}`) :
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
        max_capacity: t.max_capacity || 10,
        category: t.category,
        difficulty_level: t.difficulty_level,
      };
      
      console.log('Processed Tour Info:', tourInfo); // Debug log
      setTourData(tourInfo);
    } catch (error) {
      console.error("Failed to fetch tour details:", error);
      message.error("Failed to fetch tour details");
      // Set dummy data for development
      setTourData({
        id: tourId,
        name: "Sample Adventure Tour",
        price: 25000,
        duration: "7 Days",
        destination: "Sikkim",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
        max_capacity: 15,
        category: "ADVENTURE",
        difficulty_level: "MODERATE",
      });
    }
  };

  const handleNumberOfPassengersChange = (value) => {
    setNumberOfPassengers(value || 1);
    setPassengers(
      Array(value || 1)
        .fill(null)
        .map((_, i) => passengers[i] || {})
    );
  };

  const onFinishBooking = async (values) => {
    if (currentStep === 0) {
      // Step 1: Travel Details
      if (numberOfPassengers < 1) {
        message.error("Please select at least 1 traveler");
        return;
      }
      if (!travelDate) {
        message.error("Please select travel date");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Step 2: Traveler Information
      const hasEmptyPassenger = passengers.some(p => !p.name || !p.age);
      if (hasEmptyPassenger) {
        message.error("Please fill in all traveler details");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Step 3: Contact & Preferences
      if (!contactDetails.phone) {
        message.error("Please provide contact number");
        return;
      }
      setCurrentStep(3);
    } else {
      // Step 4: Show payment modal
      setPaymentModalVisible(true);
    }
  };

  const handlePayment = async (paymentValues) => {
    setLoading(true);
    try {
      // Validate user is authenticated
      if (!user) {
        message.error('Please log in to make a booking');
        setLoading(false);
        return;
      }

      // Validate tour exists first
      if (!tourData || !tourData.id) {
        console.error('Tour data validation failed:', { tourData });
        throw new Error('Tour data not available. Please refresh the page and try again.');
      }

      // Validate required data
      if (!travelDate) {
        message.error('Please select a travel date');
        setLoading(false);
        return;
      }

      if (passengers.length === 0 || passengers.some(p => !p.name || !p.age)) {
        message.error('Please fill in all traveler details');
        setLoading(false);
        return;
      }

      if (!contactDetails.phone) {
        message.error('Please provide a contact number');
        setLoading(false);
        return;
      }

      // Create booking first
      const bookingData = {
        tour: tourId, // Keep as string UUID, don't convert to int
        travelers_count: numberOfPassengers,
        travel_date: travelDate.format('YYYY-MM-DD'),
        traveler_details: passengers.map(p => ({
          name: p.name || '',
          age: parseInt(p.age) || 0
        })).filter(p => p.name && p.age), // Filter out invalid entries
        contact_number: contactDetails.phone || '',
        emergency_contact: contactDetails.emergency_contact || '',
        special_requests: contactDetails.special_requests || '',
      };
      
      console.log('Creating booking:', bookingData);
      
      const bookingResponse = await apiClient.post(endpoints.CREATE_BOOKING, bookingData);
      console.log('Booking created:', bookingResponse.data);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create payment record (if payment endpoint exists)
      try {
        const paymentData = {
          booking: bookingResponse.data.data?.id || bookingResponse.data.id,
          amount: totalPrice,
          payment_method: 'CREDIT_CARD',
          status: 'SUCCESS'
        };
        
        await apiClient.post(endpoints.CREATE_PAYMENT, paymentData);
      } catch (paymentError) {
        console.warn('Payment record creation failed (non-critical):', paymentError);
      }
      
      message.success("Booking confirmed and payment processed successfully!");
      setPaymentModalVisible(false);
      
      // Navigate to bookings page
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
      
    } catch (error) {
      console.error("Booking/Payment error:", error);
      
      // Show more specific error messages
      if (error.response?.data?.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        message.error(`Booking failed:\n${errorMessages}`);
      } else if (error.response?.data?.message) {
        message.error(`Booking failed: ${error.response.data.message}`);
      } else {
        message.error("Failed to process booking. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passengerColumns = [
    {
      title: "Passenger #",
      dataIndex: "number",
      key: "number",
      width: 100,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, __, index) => (
        <Input
          placeholder="Full Name"
          value={passengers[index]?.name || ""}
          onChange={(e) => {
            const newPassengers = [...passengers];
            newPassengers[index] = {
              ...newPassengers[index],
              name: e.target.value,
            };
            setPassengers(newPassengers);
          }}
        />
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 80,
      render: (_, __, index) => (
        <InputNumber
          placeholder="Age"
          min={1}
          max={120}
          value={passengers[index]?.age || null}
          onChange={(value) => {
            const newPassengers = [...passengers];
            newPassengers[index] = { ...newPassengers[index], age: value };
            setPassengers(newPassengers);
          }}
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  const steps = [
    {
      title: 'Travel Details',
      description: 'Select date and travelers',
      icon: <CalendarOutlined />,
    },
    {
      title: 'Traveler Information',
      description: 'Enter traveler details',
      icon: <UserOutlined />,
    },
    {
      title: 'Contact & Preferences',
      description: 'Contact info and special requests',
      icon: <InfoCircleOutlined />,
    },
    {
      title: 'Review & Payment',
      description: 'Review and complete booking',
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <div className="booking-page">
     

      <div className="booking-container">
        {/* Header */}
        <section className="booking-header">
          <h1>Complete Your Booking</h1>
          <p>Reserve your dream tour today!</p>
        </section>

        <Row gutter={[32, 32]}>
          {/* Steps */}
          <Col xs={24}>
            <Card className="steps-card">
              <Steps current={currentStep} items={steps} />
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="booking-form-card">
              {currentStep === 0 && (
                <div className="booking-step">
                  <Title level={3}>Travel Details</Title>
                  <Alert
                    message="Select your travel date and number of travelers"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                  
                  <Form layout="vertical" size="large">
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Travel Date"
                          required
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            placeholder="Select travel date"
                            value={travelDate}
                            onChange={setTravelDate}
                            disabledDate={(current) => {
                              return current && current < dayjs().add(1, 'day').startOf('day');
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Number of Travelers"
                          required
                        >
                          <InputNumber
                            min={1}
                            max={20}
                            value={numberOfPassengers}
                            onChange={handleNumberOfPassengersChange}
                            style={{ width: "100%" }}
                            placeholder="Select number of travelers"
                            defaultValue={1}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button
                      type="primary"
                      block
                      size="large"
                      onClick={() => onFinishBooking({})}
                    >
                      Next: Enter Traveler Details
                    </Button>
                  </Form>
                </div>
              )}

              {currentStep === 1 && (
                <div className="booking-step">
                  <Title level={3}>Traveler Information</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    Please enter details for all {numberOfPassengers} traveler(s)
                  </Text>
                  
                  <Table
                    columns={passengerColumns}
                    dataSource={passengers}
                    rowKey={(record, index) => `passenger-${index}`}
                    pagination={false}
                    className="passenger-table"
                  />
                  
                  <div className="step-buttons" style={{ marginTop: 24 }}>
                    <Space>
                      <Button onClick={() => setCurrentStep(0)}>Back</Button>
                      <Button type="primary" onClick={() => onFinishBooking({})}>
                        Next: Contact Details
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="booking-step">
                  <Title level={3}>Contact & Preferences</Title>
                  <Alert
                    message="Provide your contact details and any special requirements"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                  
                  <Form layout="vertical" size="large">
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Contact Number"
                          required
                        >
                          <Input
                            placeholder="Enter your contact number"
                            value={contactDetails.phone}
                            onChange={(e) => setContactDetails({
                              ...contactDetails,
                              phone: e.target.value
                            })}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="Emergency Contact">
                          <Input
                            placeholder="Emergency contact (optional)"
                            value={contactDetails.emergency_contact}
                            onChange={(e) => setContactDetails({
                              ...contactDetails,
                              emergency_contact: e.target.value
                            })}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item label="Special Requests">
                      <TextArea
                        rows={4}
                        placeholder="Any special requirements, dietary restrictions, accessibility needs..."
                        value={contactDetails.special_requests}
                        onChange={(e) => setContactDetails({
                          ...contactDetails,
                          special_requests: e.target.value
                        })}
                      />
                    </Form.Item>

                    <div className="step-buttons">
                      <Space>
                        <Button onClick={() => setCurrentStep(1)}>Back</Button>
                        <Button type="primary" onClick={() => onFinishBooking({})}>
                          Review Booking
                        </Button>
                      </Space>
                    </div>
                  </Form>
                </div>
              )}

              {currentStep === 3 && (
                <div className="booking-step">
                  <Title level={3}>Review & Confirm</Title>
                  
                  <Card style={{ marginBottom: 24 }}>
                    <Title level={4}>Booking Summary</Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Text strong>Tour:</Text> {tourData?.name}
                        <br />
                        <Text strong>Travel Date:</Text> {travelDate?.format('DD/MM/YYYY')}
                        <br />
                        <Text strong>Duration:</Text> {tourData?.duration}
                      </Col>
                      <Col xs={24} sm={12}>
                        <Text strong>Travelers:</Text> {numberOfPassengers}
                        <br />
                        <Text strong>Contact:</Text> {contactDetails.phone}
                        <br />
                        <Text strong>Total Amount:</Text> <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>₹{totalPrice.toLocaleString()}</Text>
                      </Col>
                    </Row>
                  </Card>

                  <Card title="Traveler Details" style={{ marginBottom: 24 }}>
                    {passengers.map((p, idx) => (
                      <div key={idx} style={{ marginBottom: 8 }}>
                        <Text>
                          <Text strong>Traveler {idx + 1}:</Text> {p.name || "N/A"} ({p.age || "N/A"} years)
                        </Text>
                      </div>
                    ))}
                  </Card>

                  {contactDetails.special_requests && (
                    <Card title="Special Requests" style={{ marginBottom: 24 }}>
                      <Text>{contactDetails.special_requests}</Text>
                    </Card>
                  )}

                  <div className="step-buttons">
                    <Space>
                      <Button onClick={() => setCurrentStep(2)}>Back</Button>
                      <Button
                        type="primary"
                        size="large"
                        loading={loading}
                        onClick={() => onFinishBooking({})}
                      >
                        Proceed to Payment
                      </Button>
                    </Space>
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Price Summary */}
          <Col xs={24} lg={8}>
            <Card className="price-summary-card">
              <h3>Price Summary</h3>
              <div className="price-item">
                <span>Base Price (1 person):</span>
                <span className="price">
                  ₹{tourData?.price?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="price-item">
                <span>Number of Travelers:</span>
                <span className="quantity">{numberOfPassengers}</span>
              </div>
              <Divider />
              <div className="price-item total">
                <span>Total Amount:</span>
                <span className="total-price">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="price-note">
                📝 Cancellation allowed up to 14 days before the tour.
                <br />
                100% refund on cancellation.
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Payment Modal */}
      <Modal
        title="Complete Payment"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 20 }}>
          <h3>Payment Summary</h3>
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Tour: {tourData?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Travelers: {numberOfPassengers}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 16 }}>
              <span>Total Amount:</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePayment}
          size="large"
        >
          <Form.Item
            name="payment_method"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
            initialValue="credit_card"
          >
            <Input value="Credit/Debit Card" disabled />
          </Form.Item>

          <Form.Item
            name="card_number"
            label="Card Number"
            rules={[
              { required: true, message: 'Please enter card number' },
              { len: 16, message: 'Card number must be 16 digits' }
            ]}
          >
            <Input
              placeholder="1234 5678 9012 3456"
              maxLength={16}
              onChange={(e) => {
                // Format card number
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
              }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expiry_date"
                label="Expiry Date"
                rules={[{ required: true, message: 'Please enter expiry date' }]}
              >
                <Input placeholder="MM/YY" maxLength={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cvv"
                label="CVV"
                rules={[
                  { required: true, message: 'Please enter CVV' },
                  { len: 3, message: 'CVV must be 3 digits' }
                ]}
              >
                <Input placeholder="123" maxLength={3} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="cardholder_name"
            label="Cardholder Name"
            rules={[{ required: true, message: 'Please enter cardholder name' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Button onClick={() => setPaymentModalVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Pay ₹{totalPrice.toLocaleString()}
            </Button>
          </div>
        </Form>

        <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', borderRadius: 6, fontSize: 12 }}>
          🔒 This is a demo payment system. No real payment will be processed.
          Your booking will be confirmed automatically.
        </div>
      </Modal>

      <InquiryButton />
    
    </div>
  );
};

export default Booking;
