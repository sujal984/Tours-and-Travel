import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  message,
  Steps,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  SmileOutlined,
  SafetyCertificateOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const Customization = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      form.setFieldsValue(formData);
    }
  }, [currentStep, formData, form]);

  const onFinish = async () => {
    setLoading(true);
    try {
      const currentValues = form.getFieldsValue();
      const allValues = { ...formData, ...currentValues };

      if (!allValues.startDate) {
        message.error("Please select a start date");
        setLoading(false);
        return;
      }

      const requiredFields = {
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        phone: "Phone Number",
        destination: "Destination",
        tourType: "Tour Type",
        accommodation: "Accommodation",
        transportation: "Transportation",
        duration: "Duration",
        numberOfPeople: "Number of People",
        budget: "Budget",
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!allValues[field]) {
          missingFields.push(label);
        }
      });

      if (missingFields.length > 0) {
        message.error(`Please fill in: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      let formattedDate;
      try {
        if (allValues.startDate && typeof allValues.startDate.format === "function") {
          formattedDate = allValues.startDate.format("YYYY-MM-DD");
        } else {
          // Handle case where it might be a string if rehydrated incorrectly, though typical Antd usage preserves objects
          formattedDate = dayjs(allValues.startDate).format("YYYY-MM-DD");
        }
      } catch (dateError) {
        console.error("Date formatting error:", dateError);
        message.error("Please select a valid start date");
        setLoading(false);
        return;
      }

      const customPackageData = {
        customer_name: `${allValues.firstName} ${allValues.lastName}`,
        customer_email_input: allValues.email,
        contact_number: allValues.phone,
        destination: allValues.destination,
        duration: `${allValues.duration} days`,
        start_date: formattedDate,
        participants_count: allValues.numberOfPeople,
        hotel_preference: allValues.accommodation,
        transportation_choice: allValues.transportation,
        package_type: allValues.tourType,
        special_requirements: allValues.specialRequests || "",
        budget_range: allValues.budget,
      };

      await apiClient.post(endpoints.CREATE_CUSTOM_PACKAGE, customPackageData);
      message.success("Request submitted! We will contact you soon.");
      form.resetFields();
      setFormData({});
      setCurrentStep(0);
    } catch (error) {
      console.error("Error submitting custom package:", error);
      message.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Personal Details", icon: <UserOutlined /> },
    { title: "Preferences", icon: <EnvironmentOutlined /> },
    { title: "Trip Details", icon: <CalendarOutlined /> },
    { title: "Review", icon: <CheckCircleOutlined /> },
  ];

  const nextStep = () => {
    const stepFields = {
      0: ["firstName", "lastName", "email", "phone"],
      1: ["destination", "tourType", "accommodation", "transportation"],
      2: ["startDate", "duration", "numberOfPeople", "budget"],
    };

    const fieldsToValidate = stepFields[currentStep] || [];

    form.validateFields(fieldsToValidate)
      .then((values) => {
        setFormData((prev) => ({ ...prev, ...values }));
        setCurrentStep(currentStep + 1);
      })
      .catch((errorInfo) => {
        message.error("Please fill in all required fields");
      });
  };

  const prevStep = () => {
    const currentValues = form.getFieldsValue();
    setFormData((prev) => ({ ...prev, ...currentValues }));
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="First Name" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Last Name" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <Input placeholder="Email Address" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true, pattern: /^[0-9]{10}$/ }]}>
                <Input placeholder="10-digit Mobile Number" maxLength={10} size="large" />
              </Form.Item>
            </Col>
          </Row>
        );
      case 1:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Form.Item name="destination" label="Destination" rules={[{ required: true }]}>
                <Select placeholder="Select Destination" size="large">
                  <Option value="sikkim">Sikkim</Option>
                  <Option value="vietnam">Vietnam</Option>
                  <Option value="goa">Goa</Option>
                  <Option value="rajasthan">Rajasthan</Option>
                  <Option value="kerala">Kerala</Option>
                  <Option value="himachal">Himachal Pradesh</Option>
                  <Option value="other">Other (specify in notes)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="tourType" label="Tour Type" rules={[{ required: true }]}>
                <Select placeholder="Select Tour Type" size="large">
                  <Option value="adventure">Adventure</Option>
                  <Option value="family">Family</Option>
                  <Option value="honeymoon">Honeymoon</Option>
                  <Option value="business">Business</Option>
                  <Option value="pilgrimage">Pilgrimage</Option>
                  <Option value="beach">Beach</Option>
                  <Option value="heritage">Heritage</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="accommodation" label="Accommodation" rules={[{ required: true }]}>
                <Select placeholder="Select Accommodation" size="large">
                  <Option value="3-star">3 Star Hotel</Option>
                  <Option value="4-star">4 Star Hotel</Option>
                  <Option value="5-star">5 Star Hotel</Option>
                  <Option value="resort">Resort</Option>
                  <Option value="homestay">Homestay</Option>
                  <Option value="budget">Budget Hotel</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="transportation" label="Transportation" rules={[{ required: true }]}>
                <Select placeholder="Select Transportation" size="large">
                  <Option value="flight">Flight</Option>
                  <Option value="train">Train</Option>
                  <Option value="bus">Bus</Option>
                  <Option value="car">Private Car</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        );
      case 2:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} size="large" disabledDate={(current) => current && current < dayjs().add(1, "day").startOf("day")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="duration" label="Duration (Days)" rules={[{ required: true }]}>
                <InputNumber min={1} max={30} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="numberOfPeople" label="Number of People" rules={[{ required: true }]}>
                <InputNumber min={1} max={50} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="budget" label="Budget Range" rules={[{ required: true }]}>
                <Select placeholder="Select Budget" size="large">
                  <Option value="under-25000">Under ₹25,000</Option>
                  <Option value="25000-50000">₹25,000 - ₹50,000</Option>
                  <Option value="50000-100000">₹50,000 - ₹1,00,000</Option>
                  <Option value="100000-200000">₹1,00,000 - ₹2,00,000</Option>
                  <Option value="above-200000">Above ₹2,00,000</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="specialRequests" label="Special Requests">
                <TextArea rows={4} placeholder="Any dietary restrictions, special needs, etc." />
              </Form.Item>
            </Col>
          </Row>
        );
      case 3:
        const allFormValues = { ...formData, ...form.getFieldsValue() };
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: 'var(--success-color)', marginBottom: '20px' }} />
            <Title level={3}>Review Your Request</Title>
            <Paragraph type="secondary">Please verify the details below before submitting.</Paragraph>

            <Card className="card" bodyStyle={{ textAlign: 'left', background: 'var(--bg-secondary)' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Text strong>Name:</Text> <Text>{allFormValues.firstName} {allFormValues.lastName}</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Email:</Text> <Text>{allFormValues.email}</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Destination:</Text> <Text style={{ textTransform: 'capitalize' }}>{allFormValues.destination}</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Tour Type:</Text> <Text style={{ textTransform: 'capitalize' }}>{allFormValues.tourType}</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Start Date:</Text> <Text>{allFormValues.startDate ? dayjs(allFormValues.startDate).format("DD MMM YYYY") : ''}</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Budget:</Text> <Text style={{ textTransform: 'capitalize' }}>{allFormValues.budget}</Text>
                </Col>
              </Row>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const featureCards = [
    { icon: <RocketOutlined />, title: "Quick Response", desc: "We'll contact you within 24 hours" },
    { icon: <DollarOutlined />, title: "Best Prices", desc: "Competitive pricing, no hidden charges" },
    { icon: <SmileOutlined />, title: "Personalized", desc: "Tailored to your exact preferences" },
  ];

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: 'var(--spacing-3xl)' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '50px'
      }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Title level={1} style={{ color: 'white', marginBottom: '10px' }}>Customize Your Dream Tour</Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem' }}>Tell us your preferences and we'll create the perfect package for you.</Text>
        </motion.div>
      </div>

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Card className="card" bordered={false} bodyStyle={{ padding: '40px' }}>
            <Steps current={currentStep} className="custom-steps" style={{ marginBottom: '40px' }}>
              {steps.map((step, index) => (
                <Step key={index} title={step.title} icon={step.icon} />
              ))}
            </Steps>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>

              <Divider style={{ margin: '30px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {currentStep > 0 && (
                  <Button size="large" onClick={prevStep} style={{ padding: '0 40px' }}>Previous</Button>
                )}
                <div style={{ marginLeft: 'auto' }}>
                  {currentStep < steps.length - 1 && (
                    <Button type="primary" size="large" onClick={nextStep} style={{ padding: '0 40px' }}>Next</Button>
                  )}
                  {currentStep === steps.length - 1 && (
                    <Button type="primary" size="large" htmlType="submit" loading={loading} style={{ padding: '0 40px' }}>Submit Request</Button>
                  )}
                </div>
              </div>
            </Form>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <Row gutter={[24, 24]} style={{ marginTop: '50px' }}>
          {featureCards.map((card, idx) => (
            <Col xs={24} md={8} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="card-hover" bordered={false} style={{ textAlign: 'center', height: '100%' }}>
                  <div style={{ fontSize: '32px', color: 'var(--primary-color)', marginBottom: '15px' }}>{card.icon}</div>
                  <Title level={4} style={{ marginBottom: '10px' }}>{card.title}</Title>
                  <Text type="secondary">{card.desc}</Text>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Customization;
