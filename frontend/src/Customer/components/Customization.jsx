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
  Space,
  Tag,
  Checkbox,
  TimePicker,
  Upload,
  List,
  Tooltip,
  Modal,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  SmileOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  PlusOutlined,
  DeleteOutlined,
  HomeOutlined,
  CarOutlined,
  CameraOutlined,
  HeartOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";
import { useUser } from "../../context/userContext";
import LoginModal from "./Auth/LoginModal";
import RegisterModal from "./Auth/RegisterModal";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const Customization = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [fileList, setFileList] = useState([]);
  
  // Auth modals state
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is logged in on component mount and when user changes
  useEffect(() => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      setShowLoginPrompt(false);
      // Show success message when user logs in
      if (loginModalVisible || registerModalVisible) {
        message.success("Welcome! You can now customize your tour.");
        setLoginModalVisible(false);
        setRegisterModalVisible(false);
      }
    }
  }, [user, loginModalVisible, registerModalVisible]);

  // Initialize with one destination
  useEffect(() => {
    if (!destinations || destinations.length === 0) {
      setDestinations([
        {
          id: Date.now(),
          city: "",
          stayDuration: 1,
          checkIn: null,
          checkOut: null,
          hotelPreference: "",
          roomType: "",
          activities: [],
          specialRequests: "",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    // Only set form values, don't touch destinations/activities state here
    if (Object.keys(formData).length > 0) {
      const {
        destinations: formDestinations,
        activities: formActivities,
        ...otherFormData
      } = formData;
      form.setFieldsValue(otherFormData);
    }
  }, [currentStep]);

  // Separate useEffect for restoring destinations/activities only when moving to step 1 or 2
  useEffect(() => {
    if (
      currentStep === 1 &&
      formData.destinations &&
      formData.destinations.length > 0
    ) {
      setDestinations(formData.destinations);
    }
    if (
      currentStep === 2 &&
      formData.activities &&
      formData.activities.length > 0
    ) {
      setActivities(formData.activities);
    }
  }, [currentStep]);

  const onFinish = async () => {
    setLoading(true);
    try {
      const currentValues = form.getFieldsValue();
      const allValues = {
        ...formData,
        ...currentValues,
        destinations,
        activities,
      };

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
        tourType: "Tour Type",
        budget: "Budget",
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!allValues[field]) {
          missingFields.push(label);
        }
      });

      // Validate destinations
      if (!destinations || destinations.length === 0) {
        missingFields.push("At least one destination");
      } else {
        destinations.forEach((dest, index) => {
          if (!dest.city || dest.city.trim() === "") {
            missingFields.push(`Destination ${index + 1} city`);
          }
          if (!dest.stayDuration || dest.stayDuration < 1) {
            missingFields.push(`Destination ${index + 1} stay duration`);
          }
        });
      }

      if (missingFields.length > 0) {
        message.error(`Please fill in: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      let formattedDate;
      try {
        if (
          allValues.startDate &&
          typeof allValues.startDate.format === "function"
        ) {
          formattedDate = allValues.startDate.format("YYYY-MM-DD");
        } else if (allValues.startDate) {
          formattedDate = dayjs(allValues.startDate).format("YYYY-MM-DD");
        } else {
          throw new Error("Start date is required");
        }

        const selectedDate = dayjs(formattedDate);
        const tomorrow = dayjs().add(1, "day").startOf("day");
        if (selectedDate.isBefore(tomorrow)) {
          message.error("Start date must be at least tomorrow");
          setLoading(false);
          return;
        }
      } catch (dateError) {
        console.error("Date formatting error:", dateError);
        message.error("Please select a valid start date");
        setLoading(false);
        return;
      }

      // Calculate total duration
      const totalDuration = destinations.reduce(
        (sum, dest) => sum + (dest.stayDuration || 0),
        0,
      );

      const customPackageData = {
        customer_name_input: `${allValues.firstName} ${allValues.lastName}`,
        customer_email_input: allValues.email,
        contact_number: allValues.phone,
        from_city: allValues.fromCity || "",
        destination: destinations.map((d) => d.city).join(", "),
        duration: `${totalDuration} days`,
        total_nights: totalDuration,
        start_date: formattedDate,
        participants_count: allValues.numberOfPeople,
        hotel_preference: allValues.overallHotelPreference || "",
        room_type: allValues.overallRoomType || "",
        transportation_choice: allValues.transportation,
        package_type: allValues.tourType,
        special_requirements: allValues.specialRequests || "",
        budget_range: allValues.budget,
        // Additional detailed customization data
        detailed_itinerary: JSON.stringify({
          destinations: destinations,
          activities: activities,
          transportation_details: {
            mode: allValues.transportation,
            preferences: allValues.transportationPreferences,
          },
          meal_preferences: allValues.mealPreferences,
          group_composition: allValues.groupComposition,
          accessibility_needs: allValues.accessibilityNeeds,
          photography_preferences: allValues.photographyPreferences,
        }),
      };

      console.log("Submitting custom package data:", customPackageData);

      await apiClient.post(endpoints.CREATE_CUSTOM_PACKAGE, customPackageData);
      message.success("Request submitted! We will contact you soon.");

      // Show success message with link to view requests
      Modal.success({
        title: "Request Submitted Successfully!",
        content: (
          <div>
            <p>
              Your custom tour request has been submitted. Our team will review
              it and get back to you soon.
            </p>
            <p>
              You can track the status of your request in "My Custom Requests"
              section.
            </p>
          </div>
        ),
        onOk: () => navigate("/my-custom-requests"),
        okText: "View My Requests",
      });

      form.resetFields();
      setFormData({});
      setDestinations([]);
      setActivities([]);
      setFileList([]);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error submitting custom package:", error);

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors || errorData.error) {
          const errorMessage = errorData.errors
            ? Object.entries(errorData.errors)
                .map(
                  ([field, msgs]) =>
                    `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
                )
                .join("\n")
            : errorData.error;
          message.error(`Validation Error: ${errorMessage}`);
        } else if (errorData.detail) {
          message.error(`Error: ${errorData.detail}`);
        } else {
          message.error(
            "Failed to submit request. Please check all fields and try again.",
          );
        }
      } else {
        message.error("Failed to submit request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Personal Details", icon: <UserOutlined /> },
    { title: "Destinations & Stay", icon: <EnvironmentOutlined /> },
    { title: "Activities & Preferences", icon: <HeartOutlined /> },
    { title: "Travel Details", icon: <CalendarOutlined /> },
    { title: "Review", icon: <CheckCircleOutlined /> },
  ];

  const nextStep = () => {
    const stepFields = {
      0: ["firstName", "lastName", "email", "phone"],
      1: [], // Destinations are handled separately
      2: [], // Activities are optional
      3: ["startDate", "numberOfPeople", "budget", "tourType"],
    };

    const fieldsToValidate = stepFields[currentStep] || [];

    form
      .validateFields(fieldsToValidate)
      .then((values) => {
        // Additional validation for destinations step
        if (currentStep === 1) {
          const hasValidDestinations =
            destinations &&
            destinations.length > 0 &&
            destinations.some((dest) => dest.city && dest.city.trim() !== "");

          if (!hasValidDestinations) {
            message.error(
              "Please add at least one destination with a city name",
            );
            return;
          }

          // Check if all destinations have required fields
          const invalidDestinations = destinations.filter(
            (dest) =>
              !dest.city ||
              dest.city.trim() === "" ||
              !dest.stayDuration ||
              dest.stayDuration < 1,
          );

          if (invalidDestinations.length > 0) {
            message.error(
              "Please fill in city name and stay duration for all destinations",
            );
            return;
          }

          // Check date validation
          const invalidDates = destinations.filter(
            (dest) =>
              dest.checkIn && dest.checkOut && dest.checkOut <= dest.checkIn,
          );

          if (invalidDates.length > 0) {
            message.error(
              "Check-out date must be after check-in date for all destinations",
            );
            return;
          }
        }

        // Save current form values and preserve destinations/activities
        const currentValues = form.getFieldsValue();
        setFormData((prev) => ({
          ...prev,
          ...values,
          ...currentValues,
          destinations: destinations,
          activities: activities,
        }));
        setCurrentStep(currentStep + 1);
      })
      .catch((errorInfo) => {
        message.error("Please fill in all required fields");
      });
  };

  const prevStep = () => {
    const currentValues = form.getFieldsValue();
    setFormData((prev) => ({
      ...prev,
      ...currentValues,
      destinations: destinations,
      activities: activities,
    }));
    setCurrentStep(currentStep - 1);
  };

  // Destination management functions
  const addDestination = () => {
    setDestinations([
      ...destinations,
      {
        id: Date.now(),
        city: "",
        stayDuration: 1,
        checkIn: null,
        checkOut: null,
        hotelPreference: "",
        roomType: "",
        activities: [],
        specialRequests: "",
      },
    ]);
  };

  const removeDestination = (id) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((dest) => dest.id !== id));
    }
  };

  const updateDestination = (id, field, value) => {
    setDestinations((prevDestinations) => {
      const newDestinations = prevDestinations.map((dest) =>
        dest.id === id ? { ...dest, [field]: value } : dest,
      );
      return newDestinations;
    });
  };

  // Activity management functions
  const addActivity = () => {
    setActivities([
      ...activities,
      {
        id: Date.now(),
        name: "",
        type: "",
        duration: "",
        preference: "optional",
      },
    ]);
  };

  const removeActivity = (id) => {
    setActivities(activities.filter((activity) => activity.id !== id));
  };

  const updateActivity = (id, field, value) => {
    setActivities(
      activities.map((activity) =>
        activity.id === id ? { ...activity, [field]: value } : activity,
      ),
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="First Name"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Last Name"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input placeholder="Email Address" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: "Phone number is required" },
                  {
                    pattern: /^[6-9]\d{9}$/,
                    message:
                      "Please enter a valid 10-digit mobile number starting with 6-9",
                  },
                ]}
              >
                <Input
                  placeholder="10-digit Mobile Number"
                  maxLength={10}
                  size="large"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fromCity" label="Departure City">
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder="e.g. Mumbai, Delhi"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="numberOfPeople"
                label="Number of Travelers"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  max={50}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case 1:
        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>Destinations & Accommodation</h3>
              <Button
                type="dashed"
                onClick={addDestination}
                icon={<PlusOutlined />}
              >
                Add Destination
              </Button>
            </div>

            {destinations.map((destination, index) => (
              <Card
                key={destination.id}
                size="small"
                title={`Destination ${index + 1}`}
                extra={
                  destinations.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeDestination(destination.id)}
                    />
                  )
                }
                style={{ marginBottom: "20px" }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span>
                          City/Place <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      required
                    >
                      <Input
                        placeholder="e.g. Goa, Manali, Paris"
                        value={destination.city}
                        onChange={(e) =>
                          updateDestination(
                            destination.id,
                            "city",
                            e.target.value,
                          )
                        }
                        size="large"
                        status={
                          !destination.city || destination.city.trim() === ""
                            ? "error"
                            : ""
                        }
                      />
                      {(!destination.city ||
                        destination.city.trim() === "") && (
                        <div
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          City name is required
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span>
                          Stay Duration (Days){" "}
                          <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      required
                    >
                      <InputNumber
                        min={1}
                        max={30}
                        value={destination.stayDuration}
                        onChange={(value) => {
                          updateDestination(
                            destination.id,
                            "stayDuration",
                            value,
                          );
                          // Auto-calculate checkout date if check-in date is set
                          if (value && destination.checkIn) {
                            const checkoutDate = destination.checkIn.add(
                              value,
                              "day",
                            );
                            setTimeout(() => {
                              updateDestination(
                                destination.id,
                                "checkOut",
                                checkoutDate,
                              );
                            }, 0);
                          }
                        }}
                        style={{ width: "100%" }}
                        size="large"
                        status={
                          !destination.stayDuration ||
                          destination.stayDuration < 1
                            ? "error"
                            : ""
                        }
                      />
                      {(!destination.stayDuration ||
                        destination.stayDuration < 1) && (
                        <div
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          Stay duration is required
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Check-in Date">
                      <DatePicker
                        style={{ width: "100%" }}
                        value={destination.checkIn}
                        onChange={(date) => {
                          updateDestination(destination.id, "checkIn", date);
                          // Auto-calculate checkout date if stay duration is set
                          if (date && destination.stayDuration) {
                            const checkoutDate = date.add(
                              destination.stayDuration,
                              "day",
                            );
                            setTimeout(() => {
                              updateDestination(
                                destination.id,
                                "checkOut",
                                checkoutDate,
                              );
                            }, 0);
                          }
                        }}
                        size="large"
                        placeholder="Select check-in date"
                        format="YYYY-MM-DD"
                        allowClear
                        disabledDate={(current) => {
                          // Allow dates from today onwards
                          return current && current.isBefore(dayjs(), "day");
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Check-out Date">
                      <DatePicker
                        style={{ width: "100%" }}
                        value={destination.checkOut}
                        onChange={(date) => {
                          updateDestination(destination.id, "checkOut", date);
                          // Auto-calculate stay duration if both dates are set
                          if (date && destination.checkIn) {
                            const duration = date.diff(
                              destination.checkIn,
                              "day",
                            );
                            if (duration > 0) {
                              setTimeout(() => {
                                updateDestination(
                                  destination.id,
                                  "stayDuration",
                                  duration,
                                );
                              }, 0);
                            }
                          }
                        }}
                        size="large"
                        placeholder="Select check-out date"
                        format="YYYY-MM-DD"
                        allowClear
                        disabledDate={(current) => {
                          if (!destination.checkIn) {
                            return current && current.isBefore(dayjs(), "day");
                          }
                          return (
                            current &&
                            (current.isBefore(dayjs(), "day") ||
                              current.isSameOrBefore(
                                destination.checkIn,
                                "day",
                              ))
                          );
                        }}
                      />
                      {destination.checkIn &&
                        destination.checkOut &&
                        destination.checkOut <= destination.checkIn && (
                          <div
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            Check-out date must be after check-in date
                          </div>
                        )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Hotel Preference">
                      <Select
                        placeholder="Select Hotel Category"
                        value={destination.hotelPreference}
                        onChange={(value) =>
                          updateDestination(
                            destination.id,
                            "hotelPreference",
                            value,
                          )
                        }
                        size="large"
                      >
                        <Option value="budget">Budget Hotel</Option>
                        <Option value="3-star">3 Star Hotel</Option>
                        <Option value="4-star">4 Star Hotel</Option>
                        <Option value="5-star">5 Star Hotel</Option>
                        <Option value="resort">Resort</Option>
                        <Option value="homestay">Homestay</Option>
                        <Option value="boutique">Boutique Hotel</Option>
                        <Option value="heritage">Heritage Property</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Room Type">
                      <Select
                        placeholder="Select Room Type"
                        value={destination.roomType}
                        onChange={(value) =>
                          updateDestination(destination.id, "roomType", value)
                        }
                        size="large"
                      >
                        <Option value="single">Single Occupancy</Option>
                        <Option value="double">Double Sharing</Option>
                        <Option value="triple">Triple Sharing</Option>
                        <Option value="quad">Quad Sharing</Option>
                        <Option value="suite">Suite</Option>
                        <Option value="villa">Villa/Apartment</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label="Special Requests for this destination">
                      <Input.TextArea
                        rows={2}
                        placeholder="Any specific requirements for this destination..."
                        value={destination.specialRequests}
                        onChange={(e) =>
                          updateDestination(
                            destination.id,
                            "specialRequests",
                            e.target.value,
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        );

      case 2:
        return (
          <div>
            <Row gutter={[24, 24]} style={{ marginBottom: "30px" }}>
              <Col xs={24}>
                <h3>Activities & Experiences</h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <span>Add activities you'd like to experience</span>
                  <Button
                    type="dashed"
                    onClick={addActivity}
                    icon={<PlusOutlined />}
                  >
                    Add Activity
                  </Button>
                </div>

                {activities.map((activity, index) => (
                  <Card
                    key={activity.id}
                    size="small"
                    title={`Activity ${index + 1}`}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeActivity(activity.id)}
                      />
                    }
                    style={{ marginBottom: "15px" }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <Form.Item label="Activity Name">
                          <Input
                            placeholder="e.g. Scuba Diving, Trekking"
                            value={activity.name}
                            onChange={(e) =>
                              updateActivity(
                                activity.id,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item label="Activity Type">
                          <Select
                            placeholder="Select Type"
                            value={activity.type}
                            onChange={(value) =>
                              updateActivity(activity.id, "type", value)
                            }
                          >
                            <Option value="adventure">Adventure</Option>
                            <Option value="cultural">Cultural</Option>
                            <Option value="relaxation">Relaxation</Option>
                            <Option value="sightseeing">Sightseeing</Option>
                            <Option value="food">Food & Dining</Option>
                            <Option value="shopping">Shopping</Option>
                            <Option value="nightlife">Nightlife</Option>
                            <Option value="nature">Nature</Option>
                            <Option value="photography">Photography</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item label="Priority">
                          <Select
                            placeholder="Priority"
                            value={activity.preference}
                            onChange={(value) =>
                              updateActivity(activity.id, "preference", value)
                            }
                          >
                            <Option value="must-have">Must Have</Option>
                            <Option value="preferred">Preferred</Option>
                            <Option value="optional">Optional</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Form.Item name="mealPreferences" label="Meal Preferences">
                  <Checkbox.Group>
                    <Space direction="vertical">
                      <Checkbox value="vegetarian">Vegetarian</Checkbox>
                      <Checkbox value="vegan">Vegan</Checkbox>
                      <Checkbox value="halal">Halal</Checkbox>
                      <Checkbox value="local-cuisine">Local Cuisine</Checkbox>
                      <Checkbox value="international">
                        International Cuisine
                      </Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
              {/* <Col xs={24} md={12}>
                <Form.Item name="groupComposition" label="Group Composition">
                  <Select mode="multiple" placeholder="Select group type">
                    <Option value="family-with-kids">Family with Kids</Option>
                    <Option value="couple">Couple</Option>
                    <Option value="friends">Friends Group</Option>
                    <Option value="solo">Solo Traveler</Option>
                    <Option value="elderly">Elderly Travelers</Option>
                    <Option value="business">Business Group</Option>
                  </Select>
                </Form.Item>
              </Col> */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="accessibilityNeeds"
                  label="Accessibility Requirements"
                >
                  <Checkbox.Group>
                    <Space direction="vertical">
                      <Checkbox value="wheelchair">
                        Wheelchair Accessible
                      </Checkbox>
                      <Checkbox value="mobility-assistance">
                        Mobility Assistance
                      </Checkbox>
                      <Checkbox value="dietary-restrictions">
                        Dietary Restrictions
                      </Checkbox>
                      <Checkbox value="medical-facilities">
                        Medical Facilities Nearby
                      </Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
              {/* <Col xs={24} md={12}>
                <Form.Item name="photographyPreferences" label="Photography Services">
                  <Select placeholder="Photography needs">
                    <Option value="none">No Photography</Option>
                    <Option value="basic">Basic Photo Package</Option>
                    <Option value="professional">Professional Photography</Option>
                    <Option value="drone">Drone Photography</Option>
                    <Option value="videography">Videography</Option>
                  </Select>
                </Form.Item>
              </Col> */}
            </Row>
          </div>
        );

      case 3:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="startDate"
                label="Trip Start Date"
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Select trip start date"
                  format="YYYY-MM-DD"
                  allowClear
                  disabledDate={(current) =>
                    current && current.isBefore(dayjs(), "day")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="tourType"
                label="Tour Type"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select Tour Type" size="large">
                  <Option value="adventure">Adventure</Option>
                  <Option value="family">Family</Option>
                  <Option value="honeymoon">Honeymoon</Option>
                  <Option value="business">Business</Option>
                  <Option value="pilgrimage">Pilgrimage</Option>
                  <Option value="beach">Beach</Option>
                  <Option value="heritage">Heritage</Option>
                  <Option value="wildlife">Wildlife</Option>
                  <Option value="luxury">Luxury</Option>
                  <Option value="budget">Budget</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="transportation" label="Primary Transportation">
                <Select placeholder="Select Transportation" size="large">
                  <Option value="flight">Flight</Option>
                  <Option value="train">Train</Option>
                  <Option value="bus">Bus</Option>
                  <Option value="car">Private Car</Option>
                  <Option value="mixed">Mixed (Flight + Car)</Option>
                  <Option value="luxury-transport">Luxury Transport</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="budget"
                label="Total Budget Range"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select Budget" size="large">
                  <Option value="under-25000">Under ₹25,000</Option>
                  <Option value="25000-50000">₹25,000 - ₹50,000</Option>
                  <Option value="50000-100000">₹50,000 - ₹1,00,000</Option>
                  <Option value="100000-200000">₹1,00,000 - ₹2,00,000</Option>
                  <Option value="200000-500000">₹2,00,000 - ₹5,00,000</Option>
                  <Option value="above-500000">Above ₹5,00,000</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="transportationPreferences"
                label="Transportation Preferences"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Any specific transportation requirements (e.g., window seat, AC coach, etc.)"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="specialRequests"
                label="Overall Special Requests"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Any other special requirements, celebrations, surprises, etc."
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case 4:
        const allFormValues = { ...formData, ...form.getFieldsValue() };
        const totalDuration = destinations.reduce(
          (sum, dest) => sum + (dest.stayDuration || 0),
          0,
        );

        return (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <CheckCircleOutlined
              style={{
                fontSize: "64px",
                color: "var(--success-color)",
                marginBottom: "20px",
              }}
            />
            <Typography.Title level={3}>
              Review Your Custom Tour Request
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              Please verify all details before submitting.
            </Typography.Paragraph>

            <Card
              className="card"
              bodyStyle={{
                textAlign: "left",
                background: "var(--bg-secondary)",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Text strong>Name:</Text>{" "}
                  <Text>
                    {allFormValues.firstName} {allFormValues.lastName}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Email:</Text> <Text>{allFormValues.email}</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Travelers:</Text>{" "}
                  <Text>{allFormValues.numberOfPeople} Person(s)</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Tour Type:</Text>{" "}
                  <Text style={{ textTransform: "capitalize" }}>
                    {allFormValues.tourType}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Start Date:</Text>{" "}
                  <Text>
                    {allFormValues.startDate
                      ? dayjs(allFormValues.startDate).format("DD MMM YYYY")
                      : ""}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Total Duration:</Text>{" "}
                  <Text>{totalDuration} Days</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Budget:</Text>{" "}
                  <Text style={{ textTransform: "capitalize" }}>
                    {allFormValues.budget}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Transportation:</Text>{" "}
                  <Text style={{ textTransform: "capitalize" }}>
                    {allFormValues.transportation}
                  </Text>
                </Col>
              </Row>

              <Divider />

              <div style={{ marginBottom: "20px" }}>
                <Text strong style={{ fontSize: "16px" }}>
                  Destinations:
                </Text>
                {destinations.map((dest, index) => (
                  <div
                    key={dest.id}
                    style={{ marginLeft: "20px", marginTop: "10px" }}
                  >
                    <Tag color="blue">{dest.city}</Tag>
                    <Text> - {dest.stayDuration} days</Text>
                    {dest.hotelPreference && (
                      <Text> ({dest.hotelPreference})</Text>
                    )}
                  </div>
                ))}
              </div>

              {activities.length > 0 && (
                <div>
                  <Text strong style={{ fontSize: "16px" }}>
                    Preferred Activities:
                  </Text>
                  <div style={{ marginLeft: "20px", marginTop: "10px" }}>
                    {activities.map((activity, index) => (
                      <Tag
                        key={activity.id}
                        color="green"
                        style={{ margin: "2px" }}
                      >
                        {activity.name} ({activity.preference})
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const featureCards = [
    {
      icon: <RocketOutlined />,
      title: "Quick Response",
      desc: "We'll contact you within 24 hours",
    },
    {
      icon: <DollarOutlined />,
      title: "Best Prices",
      desc: "Competitive pricing, no hidden charges",
    },
    {
      icon: <SmileOutlined />,
      title: "Personalized",
      desc: "Tailored to your exact preferences",
    },
  ];

  // If user is not logged in, show login prompt
  if (showLoginPrompt && !user) {
    return (
      <div
        style={{
          background: "var(--bg-secondary)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <div style={{ marginBottom: "24px" }}>
            <LockOutlined
              style={{
                fontSize: "64px",
                color: "var(--primary-color)",
                marginBottom: "16px",
              }}
            />
            <Title level={2} style={{ marginBottom: "8px" }}>
              Login Required
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Please login or create an account to customize your tour package.
            </Text>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <Button
              type="primary"
              size="large"
              onClick={() => setLoginModalVisible(true)}
              style={{
                width: "100%",
                marginBottom: "12px",
                height: "48px",
                borderRadius: "8px",
              }}
            >
              Login to Continue
            </Button>
            <Button
              size="large"
              onClick={() => setRegisterModalVisible(true)}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "8px",
              }}
            >
              Create New Account
            </Button>
          </div>

          <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
            <Text type="secondary">
              Already have an account? Click "Login to Continue"
            </Text>
          </div>
        </Card>

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
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        minHeight: "100vh",
        paddingBottom: "var(--spacing-3xl)",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
          padding: "80px 20px",
          textAlign: "center",
          color: "white",
          marginBottom: "50px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title level={1} style={{ color: "white", marginBottom: "10px" }}>
            Customize Your Dream Tour
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem" }}>
            Tell us your preferences and we'll create the perfect package for
            you.
          </Text>
        </motion.div>
      </div>

      <div
        className="container"
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card
            className="card"
            bordered={false}
            bodyStyle={{ padding: "40px" }}
          >
            <Steps
              current={currentStep}
              className="custom-steps"
              style={{ marginBottom: "40px" }}
            >
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

              <Divider style={{ margin: "30px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {currentStep > 0 && (
                  <Button
                    size="large"
                    onClick={prevStep}
                    style={{ padding: "0 40px" }}
                  >
                    Previous
                  </Button>
                )}
                <div style={{ marginLeft: "auto" }}>
                  {currentStep < steps.length - 1 && (
                    <Button
                      type="primary"
                      size="large"
                      onClick={nextStep}
                      style={{ padding: "0 40px" }}
                    >
                      Next
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={loading}
                      style={{ padding: "0 40px" }}
                    >
                      Submit Request
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <Row gutter={[24, 24]} style={{ marginTop: "50px" }}>
          {featureCards.map((card, idx) => (
            <Col xs={24} md={8} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className="card-hover"
                  bordered={false}
                  style={{ textAlign: "center", height: "100%" }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      color: "var(--primary-color)",
                      marginBottom: "15px",
                    }}
                  >
                    {card.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: "10px" }}>
                    {card.title}
                  </Title>
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
