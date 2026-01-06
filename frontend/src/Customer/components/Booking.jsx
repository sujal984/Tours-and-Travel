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
  Spin,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useUser } from "../../context/userContext";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { TextArea } = Input;
const { Title, Text } = Typography;

const Booking = () => {
  const { tourId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
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
    if (tourData) {
      setTotalPrice(tourData.price * numberOfPassengers);
    }
  }, [numberOfPassengers, tourData]);

  const fetchTourData = async () => {
    try {
      const res = await apiClient.get(endpoints.GET_TOUR_DETAIL(tourId));
      const t = res.data.data || res.data;

      if (!t || !t.id) throw new Error("Invalid tour data received");

      const tourInfo = {
        id: t.id,
        name: t.name,
        price: t.current_price || t.base_price || 0,
        base_price: t.base_price || 0,
        seasonal_prices: t.seasonal_prices || [],
        duration: `${t.duration_days || 1} Days`,
        duration_days: t.duration_days || 1,
        destination: t.destination_names || t.primary_destination?.name || "Unknown",
        destinations: t.destinations || [],
        image: t.featured_image
          ? t.featured_image.startsWith("http")
            ? t.featured_image
            : `http://127.0.0.1:8000${t.featured_image}`
          : "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
        max_capacity: t.max_capacity || 10,
        category: t.category,
      };

      setTourData(tourInfo);
    } catch (error) {
      console.error("Failed to fetch tour details:", error);
      message.error("Failed to fetch tour details");
      setTourLoading(false);
      // Fallback or navigate back
      navigate('/tours');
    } finally {
      setTourLoading(false);
    }
  };

  const handleNumberOfPassengersChange = (value) => {
    const val = value || 1;
    setNumberOfPassengers(val);
    // Initialize passengers array if increasing count
    const newPassengers = [...passengers];
    if (val > newPassengers.length) {
      for (let i = newPassengers.length; i < val; i++) {
        newPassengers.push({});
      }
    } else {
      newPassengers.splice(val);
    }
    setPassengers(newPassengers);
  };

  // Ensure passengers array is initialized correctly on load
  useEffect(() => {
    if (numberOfPassengers > 0 && passengers.length === 0) {
      setPassengers(Array(numberOfPassengers).fill({}));
    }
  }, [numberOfPassengers]);


  const onFinishBooking = async () => {
    if (currentStep === 0) {
      if (numberOfPassengers < 1) return message.error("Please select at least 1 traveler");
      if (!travelDate) return message.error("Please select travel date");
      setCurrentStep(1);
    } else if (currentStep === 1) {
      const hasEmptyPassenger = passengers.slice(0, numberOfPassengers).some((p) => !p.name || !p.age);
      if (hasEmptyPassenger) return message.error("Please fill in all traveler details");
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!contactDetails.phone) return message.error("Please provide contact number");
      setCurrentStep(3);
    } else {
      setPaymentModalVisible(true);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (!user) {
        setLoading(false);
        return message.error("Please log in to make a booking");
      }

      if (!tourData || !tourData.id) throw new Error("Tour data not available.");

      const bookingData = {
        tour: tourId,
        travelers_count: numberOfPassengers,
        travel_date: travelDate.format("YYYY-MM-DD"),
        traveler_details: passengers.slice(0, numberOfPassengers).map(p => ({
          name: p.name,
          age: parseInt(p.age)
        })),
        contact_number: contactDetails.phone || "",
        emergency_contact: contactDetails.emergency_contact || "",
        special_requests: contactDetails.special_requests || "",
      };

      const bookingResponse = await apiClient.post(endpoints.CREATE_BOOKING, bookingData);

      // Simulate Payment
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const paymentData = {
          booking: bookingResponse.data.data?.id || bookingResponse.data.id,
          amount: totalPrice,
          payment_method: "CREDIT_CARD",
          status: "SUCCESS",
        };
        await apiClient.post(endpoints.CREATE_PAYMENT, paymentData);
      } catch (err) {
        console.warn("Payment log failed");
      }

      message.success("Booking confirmed successfully!");
      setPaymentModalVisible(false);
      navigate("/my-bookings");
    } catch (error) {
      console.error("Booking error:", error);
      message.error("Failed to process booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Details", icon: <CalendarOutlined /> },
    { title: "Travelers", icon: <UserOutlined /> },
    { title: "Contact", icon: <InfoCircleOutlined /> },
    { title: "Review", icon: <CheckCircleOutlined /> },
  ];

  if (tourLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: 'var(--spacing-3xl) 0' }}>
      <div className="container-xl" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--spacing-xl)' }}>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '30px', textAlign: 'center' }}
        >
          <h1 style={{ marginBottom: '10px' }}>Secure Your Booking</h1>
          <p style={{ color: 'var(--text-secondary)' }}>You're just a few steps away from your adventure to {tourData?.destination}</p>
        </motion.div>

        <Row gutter={[40, 40]}>
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card" bodyStyle={{ padding: '30px' }}>
                <Steps current={currentStep} items={steps} style={{ marginBottom: '40px' }} />

                <div style={{ minHeight: '300px' }}>
                  {currentStep === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Title level={4}>Travel Details</Title>
                      <Divider />
                      <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: '10px', fontWeight: 500 }}>Travel Date</div>
                          <DatePicker
                            style={{ width: "100%", height: '45px', borderRadius: 'var(--radius-md)' }}
                            value={travelDate}
                            onChange={setTravelDate}
                            disabledDate={(current) => current && current < dayjs().add(1, "day")}
                          />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: '10px', fontWeight: 500 }}>Travelers</div>
                          <InputNumber
                            min={1} max={20}
                            value={numberOfPassengers}
                            onChange={handleNumberOfPassengersChange}
                            style={{ width: "100%", height: '45px', borderRadius: 'var(--radius-md)', paddingTop: '5px' }}
                          />
                        </Col>
                      </Row>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Title level={4}>Traveler Information</Title>
                      <Divider />
                      {Array.from({ length: numberOfPassengers }).map((_, index) => (
                        <Card key={index} type="inner" title={`Traveler ${index + 1}`} style={{ marginBottom: '20px', background: 'var(--bg-secondary)' }}>
                          <Row gutter={16}>
                            <Col span={16}>
                              <Input
                                placeholder="Full Name"
                                value={passengers[index]?.name}
                                onChange={(e) => {
                                  const newP = [...passengers];
                                  newP[index] = { ...newP[index], name: e.target.value };
                                  setPassengers(newP);
                                }}
                              />
                            </Col>
                            <Col span={8}>
                              <InputNumber
                                placeholder="Age"
                                style={{ width: '100%' }}
                                min={1}
                                value={passengers[index]?.age}
                                onChange={(val) => {
                                  const newP = [...passengers];
                                  newP[index] = { ...newP[index], age: val };
                                  setPassengers(newP);
                                }}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Title level={4}>Contact Information</Title>
                      <Divider />
                      <Form layout="vertical">
                        <Form.Item label="Phone Number" required>
                          <Input
                            value={contactDetails.phone}
                            onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                            size="large"
                          />
                        </Form.Item>
                        <Form.Item label="Emergency Contact (Optional)">
                          <Input
                            value={contactDetails.emergency_contact}
                            onChange={(e) => setContactDetails({ ...contactDetails, emergency_contact: e.target.value })}
                            size="large"
                          />
                        </Form.Item>
                        <Form.Item label="Special Requests">
                          <TextArea
                            rows={4}
                            value={contactDetails.special_requests}
                            onChange={(e) => setContactDetails({ ...contactDetails, special_requests: e.target.value })}
                          />
                        </Form.Item>
                      </Form>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Title level={4}>Review Booking</Title>
                      <Divider />
                      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                        <Row gutter={[16, 16]}>
                          <Col span={12}><Text type="secondary">Tour:</Text> <Text strong>{tourData?.name}</Text></Col>
                          <Col span={12}><Text type="secondary">Date:</Text> <Text strong>{travelDate?.format("DD MMM YYYY")}</Text></Col>
                          <Col span={12}><Text type="secondary">Travelers:</Text> <Text strong>{numberOfPassengers}</Text></Col>
                          <Col span={12}><Text type="secondary">Total:</Text> <Text strong style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>₹{totalPrice.toLocaleString()}</Text></Col>
                        </Row>
                      </div>
                      <div style={{ marginTop: '20px' }}>
                        <Text strong>Travelers:</Text>
                        <ul style={{ marginTop: '10px' }}>
                          {passengers.slice(0, numberOfPassengers).map((p, i) => (
                            <li key={i}>{p.name} ({p.age} yrs)</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    onClick={() => setCurrentStep(curr => curr - 1)}
                    disabled={currentStep === 0}
                    icon={<ArrowLeftOutlined />}
                    size="large"
                  >
                    Back
                  </Button>
                  <Button
                    type="primary"
                    onClick={onFinishBooking}
                    size="large"
                    className="btn-primary-gradient"
                  >
                    {currentStep === 3 ? "Proceed to Payment" : "Next Step"} <ArrowRightOutlined />
                  </Button>
                </div>

              </Card>
            </motion.div>
          </Col>

          {/* Summary Sidebar */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card" style={{ position: 'sticky', top: '100px' }}>
                <Title level={4}>Booking Summary</Title>
                <Divider style={{ margin: '15px 0' }} />
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <img src={tourData?.image} alt={tourData?.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{tourData?.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{tourData?.duration}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Price per person</span>
                  <span>₹{tourData?.price?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Travelers</span>
                  <span>x {numberOfPassengers}</span>
                </div>

                <Divider style={{ margin: '15px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>Total Price</span>
                  <span style={{ color: 'var(--primary-color)' }}>₹{totalPrice.toLocaleString()}</span>
                </div>

                <Alert message="Free Cancellation until 7 days before trip" type="success" showIcon style={{ marginTop: '20px', borderRadius: '8px' }} />
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* Payment Modal */}
      <Modal
        title={null}
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={500}
        bodyStyle={{ padding: '30px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'var(--primary-color)', fontSize: '1.5rem' }}>
            <LockOutlined />
          </div>
          <Title level={3} style={{ margin: 0 }}>Secure Payment</Title>
          <Text type="secondary">Total Amount: ₹{totalPrice.toLocaleString()}</Text>
        </div>

        <Form form={paymentForm} layout="vertical" onFinish={handlePayment}>
          <Form.Item label="Card Number" required>
            <Input prefix={<CreditCardOutlined />} placeholder="0000 0000 0000 0000" size="large" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Expiry" required>
                <Input placeholder="MM/YY" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="CVV" required>
                <Input placeholder="123" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Card Holder Name" required>
            <Input placeholder="Name on card" size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading} className="btn-primary-gradient" style={{ height: '45px', marginTop: '10px' }}>
            Pay Securely
          </Button>
        </Form>
      </Modal>

    </div>
  );
};

export default Booking;
