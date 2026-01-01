import React, { useState } from 'react';
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
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { apiClient } from '../../services/api';
import { useEffect } from 'react';

import './Customization.css';
import { endpoints } from '../../constant/ENDPOINTS';

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const Customization = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({}); // Store form data across steps

  // Effect to populate form with stored data when step changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      form.setFieldsValue(formData);
    }
  }, [currentStep, formData, form]);

  const onFinish = async () => {
    setLoading(true);
    try {
      // Get current form values and merge with stored formData
      const currentValues = form.getFieldsValue();
      const allValues = { ...formData, ...currentValues };
      console.log('All form values:', allValues); // Debug log
      
      // Validate required fields with proper checks
      if (!allValues.startDate) {
        message.error('Please select a start date');
        setLoading(false);
        return;
      }

      // Additional validation for other required fields
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name', 
        email: 'Email',
        phone: 'Phone Number',
        destination: 'Destination',
        tourType: 'Tour Type',
        accommodation: 'Accommodation',
        transportation: 'Transportation',
        duration: 'Duration',
        numberOfPeople: 'Number of People',
        budget: 'Budget'
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!allValues[field]) {
          missingFields.push(label);
        }
      });

      if (missingFields.length > 0) {
        message.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Safely format the date
      let formattedDate;
      try {
        if (allValues.startDate && typeof allValues.startDate.format === 'function') {
          formattedDate = allValues.startDate.format('YYYY-MM-DD');
        } else {
          throw new Error('Invalid date format');
        }
      } catch (dateError) {
        console.error('Date formatting error:', dateError);
        message.error('Please select a valid start date');
        setLoading(false);
        return;
      }

      // Map frontend form values to backend field names
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
        special_requirements: allValues.specialRequests || '',
        budget_range: allValues.budget,
      };
      
      console.log('Submitting custom package:', customPackageData); // Debug log
      
      await apiClient.post(endpoints.CREATE_CUSTOM_PACKAGE, customPackageData);
      message.success('Your custom tour request has been submitted! We will contact you soon.');
      form.resetFields();
      setFormData({}); // Clear stored form data
      setCurrentStep(0);
    } catch (error) {
      console.error('Error submitting custom package:', error);
      message.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Personal Details',
      icon: <UserOutlined />,
    },
    {
      title: 'Travel Preferences',
      icon: <EnvironmentOutlined />,
    },
    {
      title: 'Trip Details',
      icon: <CalendarOutlined />,
    },
    {
      title: 'Confirmation',
      icon: <CheckCircleOutlined />,
    },
  ];

  const nextStep = () => {
    // Define which fields to validate for each step
    const stepFields = {
      0: ['firstName', 'lastName', 'email', 'phone'],
      1: ['destination', 'tourType', 'accommodation', 'transportation'],
      2: ['startDate', 'duration', 'numberOfPeople', 'budget'],
    };

    const fieldsToValidate = stepFields[currentStep] || [];
    
    form.validateFields(fieldsToValidate).then((values) => {
      // Save current step values to formData
      setFormData(prev => ({ ...prev, ...values }));
      setCurrentStep(currentStep + 1);
    }).catch((errorInfo) => {
      console.log('Validation failed:', errorInfo);
      message.error('Please fill in all required fields');
    });
  };

  const prevStep = () => {
    // Save current form values before going back
    const currentValues = form.getFieldsValue();
    setFormData(prev => ({ ...prev, ...currentValues }));
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter your first name' }]}
              >
                <Input placeholder="Enter your first name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter your last name' }]}
              >
                <Input placeholder="Enter your last name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter your phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
                ]}
              >
                <Input placeholder="Enter your phone number" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
        );

      case 1:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="destination"
                label="Preferred Destination"
                rules={[{ required: true, message: 'Please select a destination' }]}
              >
                <Select placeholder="Select destination">
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="tourType"
                label="Tour Type"
                rules={[{ required: true, message: 'Please select tour type' }]}
              >
                <Select placeholder="Select tour type">
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="accommodation"
                label="Accommodation Preference"
                rules={[{ required: true, message: 'Please select accommodation' }]}
              >
                <Select placeholder="Select accommodation">
                  <Option value="3-star">3 Star Hotel</Option>
                  <Option value="4-star">4 Star Hotel</Option>
                  <Option value="5-star">5 Star Hotel</Option>
                  <Option value="resort">Resort</Option>
                  <Option value="homestay">Homestay</Option>
                  <Option value="budget">Budget Hotel</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="transportation"
                label="Transportation"
                rules={[{ required: true, message: 'Please select transportation' }]}
              >
                <Select placeholder="Select transportation">
                  <Option value="flight">Flight</Option>
                  <Option value="train">Train</Option>
                  <Option value="bus">Bus</Option>
                  <Option value="car">Private Car</Option>
                  <Option value="mixed">Mixed (Flight + Car)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        );

      case 2:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startDate"
                label="Preferred Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Select start date"
                  disabledDate={(current) => {
                    // Disable dates before tomorrow
                    return current && current < dayjs().add(1, 'day').startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="duration"
                label="Duration (Days)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                  placeholder="Enter number of days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="numberOfPeople"
                label="Number of People"
                rules={[{ required: true, message: 'Please enter number of people' }]}
              >
                <InputNumber
                  min={1}
                  max={50}
                  style={{ width: '100%' }}
                  placeholder="Enter number of people"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="budget"
                label="Budget Range (₹)"
                rules={[{ required: true, message: 'Please select budget range' }]}
              >
                <Select placeholder="Select budget range">
                  <Option value="under-25000">Under ₹25,000</Option>
                  <Option value="25000-50000">₹25,000 - ₹50,000</Option>
                  <Option value="50000-100000">₹50,000 - ₹1,00,000</Option>
                  <Option value="100000-200000">₹1,00,000 - ₹2,00,000</Option>
                  <Option value="above-200000">Above ₹2,00,000</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="specialRequests"
                label="Special Requests / Notes"
              >
                <TextArea
                  rows={4}
                  placeholder="Any special requirements, dietary restrictions, accessibility needs, or additional information..."
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case 3:
        // Get current form values and merge with stored formData
        const currentFormValues = form.getFieldsValue();
        const allFormValues = { ...formData, ...currentFormValues };
        
        const requiredFields = {
          'Personal Details': {
            'First Name': allFormValues.firstName,
            'Last Name': allFormValues.lastName,
            'Email': allFormValues.email,
            'Phone': allFormValues.phone,
          },
          'Travel Preferences': {
            'Destination': allFormValues.destination,
            'Tour Type': allFormValues.tourType,
            'Accommodation': allFormValues.accommodation,
            'Transportation': allFormValues.transportation,
          },
          'Trip Details': {
            'Start Date': allFormValues.startDate,
            'Duration': allFormValues.duration,
            'Number of People': allFormValues.numberOfPeople,
            'Budget': allFormValues.budget,
          }
        };

        const missingFields = [];
        Object.entries(requiredFields).forEach(([section, fields]) => {
          Object.entries(fields).forEach(([fieldName, value]) => {
            if (!value) {
              missingFields.push(`${section}: ${fieldName}`);
            }
          });
        });

        return (
          <div className="confirmation-step">
            <div className="confirmation-icon">
              <CheckCircleOutlined style={{ fontSize: '64px', color: missingFields.length > 0 ? '#faad14' : '#52c41a' }} />
            </div>
            <h3>{missingFields.length > 0 ? 'Please Complete All Fields' : 'Review Your Request'}</h3>
            
            {missingFields.length > 0 ? (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#faad14' }}>The following fields are required:</p>
                <ul style={{ color: '#faad14', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                  {missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
                <p>Please go back and fill in all required fields.</p>
              </div>
            ) : (
              <p>Please review your custom tour request details below:</p>
            )}

            <Card className="review-card">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <strong>Contact:</strong> {allFormValues.firstName || 'Not provided'} {allFormValues.lastName || 'Not provided'}
                  <br />
                  <strong>Email:</strong> {allFormValues.email || 'Not provided'}
                  <br />
                  <strong>Phone:</strong> {allFormValues.phone || 'Not provided'}
                </Col>
                <Col xs={24} sm={12}>
                  <strong>Destination:</strong> {allFormValues.destination || 'Not selected'}
                  <br />
                  <strong>Tour Type:</strong> {allFormValues.tourType || 'Not selected'}
                  <br />
                  <strong>Duration:</strong> {allFormValues.duration ? `${allFormValues.duration} days` : 'Not specified'}
                </Col>
                <Col xs={24} sm={12}>
                  <strong>People:</strong> {allFormValues.numberOfPeople || 'Not specified'}
                  <br />
                  <strong>Budget:</strong> {allFormValues.budget || 'Not selected'}
                  <br />
                  <strong>Accommodation:</strong> {allFormValues.accommodation || 'Not selected'}
                </Col>
                <Col xs={24} sm={12}>
                  <strong>Transportation:</strong> {allFormValues.transportation || 'Not selected'}
                  <br />
                  <strong>Start Date:</strong> {allFormValues.startDate && allFormValues.startDate.format ? allFormValues.startDate.format('DD/MM/YYYY') : 'Not selected'}
                </Col>
                {allFormValues.specialRequests && (
                  <Col xs={24}>
                    <strong>Special Requests:</strong> {allFormValues.specialRequests}
                  </Col>
                )}
              </Row>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>

      <div className="customization-page">
        <div className="customization-container">
          <motion.div
            className="customization-header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>Customize Your Dream Tour</h1>
            <p>Tell us your preferences and we'll create the perfect tour package for you</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="customization-card">
              <Steps current={currentStep} className="customization-steps">
                {steps.map((step, index) => (
                  <Step key={index} title={step.title} icon={step.icon} />
                ))}
              </Steps>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="customization-form"
              >
                <div className="step-content">
                  {renderStepContent()}
                </div>

                <div className="step-actions">
                  {currentStep > 0 && (
                    <Button onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                  {currentStep < steps.length - 1 && (
                    <Button type="primary" onClick={nextStep}>
                      Next
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                    <>
                      {/* Show navigation buttons if fields are missing */}
                      {(() => {
                        const currentFormValues = form.getFieldsValue();
                        const allFormValues = { ...formData, ...currentFormValues };
                        const missingPersonal = !allFormValues.firstName || !allFormValues.lastName || !allFormValues.email || !allFormValues.phone;
                        const missingPreferences = !allFormValues.destination || !allFormValues.tourType || !allFormValues.accommodation || !allFormValues.transportation;
                        const missingTripDetails = !allFormValues.startDate || !allFormValues.duration || !allFormValues.numberOfPeople || !allFormValues.budget;
                        
                        if (missingPersonal || missingPreferences || missingTripDetails) {
                          return (
                            <div style={{ marginBottom: '16px' }}>
                              {missingPersonal && (
                                <Button 
                                  onClick={() => setCurrentStep(0)}
                                  style={{ marginRight: '8px', marginBottom: '8px' }}
                                >
                                  Go to Personal Details
                                </Button>
                              )}
                              {missingPreferences && (
                                <Button 
                                  onClick={() => setCurrentStep(1)}
                                  style={{ marginRight: '8px', marginBottom: '8px' }}
                                >
                                  Go to Travel Preferences
                                </Button>
                              )}
                              {missingTripDetails && (
                                <Button 
                                  onClick={() => setCurrentStep(2)}
                                  style={{ marginRight: '8px', marginBottom: '8px' }}
                                >
                                  Go to Trip Details
                                </Button>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        onClick={() => {
                          // Validate all required fields before submission
                          const requiredFields = [
                            'firstName', 'lastName', 'email', 'phone',
                            'destination', 'tourType', 'accommodation', 'transportation',
                            'startDate', 'duration', 'numberOfPeople', 'budget'
                          ];
                          
                          form.validateFields(requiredFields).then(() => {
                            form.submit();
                          }).catch((errorInfo) => {
                            console.log('Final validation failed:', errorInfo);
                            const missingFields = errorInfo.errorFields.map(field => field.name[0]);
                            if (missingFields.includes('startDate')) {
                              message.error('Please go back to Trip Details and select a start date');
                            } else {
                              message.error('Please fill in all required fields shown above');
                            }
                          });
                        }}
                      >
                        Submit Request
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            </Card>
          </motion.div>

          <motion.div
            className="customization-info"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card className="info-card">
                  <h4>📞 Quick Response</h4>
                  <p>We'll contact you within 24 hours with a customized quote</p>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="info-card">
                  <h4>💰 Best Prices</h4>
                  <p>Get competitive pricing with no hidden charges</p>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="info-card">
                  <h4>✨ Personalized</h4>
                  <p>Every detail tailored to your preferences and budget</p>
                </Card>
              </Col>
            </Row>
          </motion.div>
        </div>
      </div>
      
    </div>
  );
};

export default Customization;