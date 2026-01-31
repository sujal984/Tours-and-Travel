import React, { useEffect, useState, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  InputNumber,
  Upload,
  Row,
  Col,
  Image,
  Tabs,
  Space,
  Divider,
  Table,
  Modal,
  List,
  Typography,
  Switch,
  Tag,
  Alert,
  Spin,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  MinusCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const TourForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [existingItineraries, setExistingItineraries] = useState([]);
  const [existingPricings, setExistingPricings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Form data states
  const [pricingData, setPricingData] = useState([]);
  const [itineraryData, setItineraryData] = useState([]);
  const [hotelData, setHotelData] = useState({});
  const [vehicleData, setVehicleData] = useState({});

  // Modal states
  const [itineraryModalVisible, setItineraryModalVisible] = useState(false);
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [editingPricingIndex, setEditingPricingIndex] = useState(null);

  // Validation states
  const [tabValidation, setTabValidation] = useState({
    basic: false,
    pricing: false,
    content: false,
    itinerary: false,
    hotels: false,
    vehicle: false,
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Initialize form
  useEffect(() => {
    initializeForm();
  }, [id]);

  const initializeForm = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchDestinations(),
        fetchHotels(),
        fetchSeasons(),
        fetchVehicles(),
        fetchExistingItineraries(),
        fetchExistingPricings(),
        fetchOffers(),
      ]);

      if (isEdit) {
        await fetchTour();
      } else {
        // Set default values for new tour
        form.setFieldsValue({
          duration_days: 5,
          max_capacity: 10,
          base_price: 0,
          category: "CULTURAL",
          tour_type: "DOMESTIC",
          available_dates: [],
        });
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      message.error("Failed to load form data");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_DESTINATIONS);
      const data =
        response.data?.data || response.data?.results || response.data || [];
      setDestinations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setDestinations([]);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_HOTELS);
      const data =
        response.data?.data || response.data?.results || response.data || [];
      setHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setHotels([]);
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_SEASONS);
      const data =
        response.data?.data || response.data?.results || response.data || [];
      setSeasons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching seasons:", error);
      setSeasons([]);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_VEHICLES);
      const data =
        response.data?.data || response.data?.results || response.data || [];
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  const fetchExistingItineraries = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_ITINERARIES);
      const data =
        response.data?.data || response.data?.results || response.data || [];
      setExistingItineraries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      setExistingItineraries([]);
    }
  };

  const fetchExistingPricings = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_PRICINGS);
      const data =
        response.data?.data || response.data?.results || response.data || [];
      setExistingPricings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pricings:", error);
      setExistingPricings([]);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_OFFERS);
      const data =
        response.data?.data || response.data?.results || response.data || [];
      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setOffers([]);
    }
  };

  const fetchTour = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_TOUR_DETAIL(id));
      const tour = response.data?.data || response.data;

      if (tour) {
        // Set form values
        form.setFieldsValue({
          name: tour.name || "",
          description: tour.description || "",
          duration_days: tour.duration_days || 5,
          max_capacity: tour.max_capacity || 10,
          base_price: tour.base_price || 0,
          primary_destination_id:
            tour.primary_destination?.id || tour.primary_destination_id,
          destination_ids: tour.destinations?.map((d) => d.id) || [],
          category: tour.category || "CULTURAL",
          tour_type: tour.tour_type || "DOMESTIC",
          available_dates: Array.isArray(tour.available_dates) ? tour.available_dates.map(d => dayjs(d)) : [],
          inclusions: Array.isArray(tour.inclusions)
            ? tour.inclusions.join("\n")
            : tour.inclusions || "",
          exclusions: Array.isArray(tour.exclusions)
            ? tour.exclusions.join("\n")
            : tour.exclusions || "",
          special_notes: tour.special_notes || "",
        });

        // Set complex data - prioritize pricing_details over seasonal_pricings
        setPricingData(tour.pricing_details || tour.seasonal_pricings || []);
        setItineraryData(tour.itinerary || []);
        setHotelData(tour.hotel_details || {});
        setVehicleData(tour.vehicle_details || {});
        setSelectedOffers(tour.current_offer_ids || tour.offer_ids || tour.offers?.map(o => o.id) || []);

        // Debug: Log offer data
        console.log("Tour offer data:", {
          current_offer_ids: tour.current_offer_ids,
          offer_ids: tour.offer_ids,
          offers: tour.offers,
          active_offers: tour.active_offers,
          selectedOffers: tour.current_offer_ids || tour.offer_ids || tour.offers?.map(o => o.id) || []
        });

        if (tour.featured_image) {
          setImageUrl(tour.featured_image);
        }
      }
    } catch (error) {
      console.error("Error fetching tour:", error);
      message.error("Failed to load tour details");
    }
  };

  // Validation functions
  const validateBasicTab = () => {
    const values = form.getFieldsValue();
    const required = [
      "name",
      "description",
      "duration_days",
      "max_capacity",
      "base_price",
      "primary_destination_id",
      "category",
      "tour_type",
    ];
    const hasRequired = required.every(
      (field) =>
        values[field] !== undefined &&
        values[field] !== null &&
        values[field] !== ""
    );
    const hasDestinations =
      values.destination_ids && values.destination_ids.length > 0;
    return hasRequired && hasDestinations;
  };

  const validatePricingTab = () => {
    return pricingData.length > 0;
  };

  const validateContentTab = () => {
    const values = form.getFieldsValue();
    return (
      values.inclusions &&
      values.inclusions.trim() !== "" &&
      values.exclusions &&
      values.exclusions.trim() !== ""
    );
  };

  const validateItineraryTab = () => {
    return itineraryData.length > 0;
  };

  const validateHotelsTab = () => {
    // Hotels are optional - return true if no destinations selected or if any hotel data exists
    const selectedDests = form.getFieldValue("destination_ids") || [];
    if (selectedDests.length === 0) return true;
    // Consider valid if at least one destination has hotel info OR if user hasn't filled yet
    return true; // Make hotels optional
  };

  const validateVehicleTab = () => {
    // Vehicle is optional - only validate if user has entered data
    return true; // Make vehicle optional
  };

  const updateTabValidation = () => {
    const validation = {
      basic: validateBasicTab(),
      pricing: validatePricingTab(),
      content: validateContentTab(),
      itinerary: validateItineraryTab(),
      hotels: validateHotelsTab(),
      vehicle: validateVehicleTab(),
    };
    setTabValidation(validation);
    return validation;
  };

  // Compute form validity using useMemo to prevent re-renders
  const isFormValid = useMemo(() => {
    return Object.values(tabValidation).every((valid) => valid);
  }, [tabValidation]);

  // Form change handler
  const handleFormChange = () => {
    setTimeout(updateTabValidation, 100);
  };

  // Tab title with validation indicator
  const getTabTitle = (title, isValid) => (
    <span>
      {isValid ? (
        <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 4 }} />
      ) : (
        <ExclamationCircleOutlined
          style={{ color: "#ff4d4f", marginRight: 4 }}
        />
      )}
      {title}
    </span>
  );

  // Pricing functions - now creating inline pricing
  const handleAddPricing = () => {
    setEditingPricingIndex(null);
    setPricingModalVisible(true);
  };

  const handleEditPricing = (index) => {
    setEditingPricingIndex(index);
    setPricingModalVisible(true);
  };

  const handlePricingSubmit = (pricingValues) => {
    const newPricing = {
      id: editingPricingIndex !== null ? pricingData[editingPricingIndex].id : Date.now(),
      season_id: pricingValues.season_id,
      season: seasons.find(s => s.id === pricingValues.season_id) || { id: pricingValues.season_id, name: 'Season' },
      two_sharing_price: pricingValues.two_sharing_price || 0,
      three_sharing_price: pricingValues.three_sharing_price || 0,
      child_price: pricingValues.child_price || 0,
      includes_return_air: pricingValues.includes_return_air || false,
      description: pricingValues.description || '',
      available_dates: pricingValues.available_dates || [],
    };

    if (editingPricingIndex !== null) {
      // Edit existing pricing
      const newPricingData = [...pricingData];
      newPricingData[editingPricingIndex] = newPricing;
      setPricingData(newPricingData);
    } else {
      // Add new pricing
      setPricingData([...pricingData, newPricing]);
    }

    setPricingModalVisible(false);
    setEditingPricingIndex(null);
    updateTabValidation();
  };

  const handleSelectPricings = (selectedIds) => {
    const newPricings = selectedIds.map((pricingId) => {
      const selectedPricing = existingPricings.find((p) => p.id === pricingId);
      if (!selectedPricing) return null;

      const season = seasons.find((s) => s.id === selectedPricing.season);

      return {
        id: selectedPricing.id,
        pricing_id: selectedPricing.id,
        season: season || { id: selectedPricing.season, name: "Season" },
        season_id: selectedPricing.season,
        two_sharing_price:
          selectedPricing.two_sharing_price || selectedPricing.price || 0,
        three_sharing_price: selectedPricing.three_sharing_price || 0,
        child_price: selectedPricing.child_price || 0,
        includes_return_air: selectedPricing.includes_return_air || false,
        description: selectedPricing.description || "",
      };
    }).filter(Boolean);

    setPricingData(newPricings);
    updateTabValidation();
  };

  const handleDeletePricing = (index) => {
    const newPricingData = pricingData.filter((_, i) => i !== index);
    setPricingData(newPricingData);
    updateTabValidation();
  };

  const handleOffersChange = (selectedOfferIds) => {
    console.log("Offers changed:", selectedOfferIds);
    setSelectedOffers(selectedOfferIds);
  };

  // Itinerary functions
  const handleAddItinerary = () => {
    setItineraryModalVisible(true);
  };

  const handleSelectItinerary = (selectedItinerary) => {
    const newDay = {
      day: itineraryData.length + 1,
      title: selectedItinerary.title,
      description: selectedItinerary.description,
      destination_id: selectedItinerary.destination,
      destination_name: selectedItinerary.destination_name,
    };
    setItineraryData([...itineraryData, newDay]);
    setItineraryModalVisible(false);
    updateTabValidation();
  };

  const handleRemoveItinerary = (index) => {
    const newItineraryData = itineraryData.filter((_, i) => i !== index);
    // Renumber days
    const renumbered = newItineraryData.map((day, i) => ({
      ...day,
      day: i + 1,
    }));
    setItineraryData(renumbered);
    updateTabValidation();
  };

  const handleUpdateItinerary = (index, field, value) => {
    const newItineraryData = [...itineraryData];
    newItineraryData[index] = { ...newItineraryData[index], [field]: value };
    setItineraryData(newItineraryData);
    updateTabValidation();
  };

  // Hotel functions
  const handlePrimaryDestinationChange = (primaryDestId) => {
    form.setFieldValue("primary_destination_id", primaryDestId);
    
    // Get current destination_ids
    const currentDestIds = form.getFieldValue("destination_ids") || [];
    
    // Add primary destination to all destinations if not already included
    if (!currentDestIds.includes(primaryDestId)) {
      const newDestIds = [primaryDestId, ...currentDestIds];
      form.setFieldValue("destination_ids", newDestIds);
    }
  };

  const handleDestinationChange = (destinationIds) => {
    const primaryDestId = form.getFieldValue("primary_destination_id");
    
    // Ensure primary destination is always included and cannot be removed
    if (primaryDestId && !destinationIds.includes(primaryDestId)) {
      destinationIds = [primaryDestId, ...destinationIds];
      message.warning("Primary destination cannot be removed from destinations list");
    }
    
    form.setFieldValue("destination_ids", destinationIds);
    // Reset hotel data when destinations change
    setHotelData({});
    updateTabValidation();
  };

  const handleHotelChange = (destinationId, field, value) => {
    const newHotelData = {
      ...hotelData,
      [destinationId]: {
        ...hotelData[destinationId],
        [field]: value,
      },
    };
    setHotelData(newHotelData);
    updateTabValidation();
  };

  // Vehicle functions
  const handleVehicleSelect = (vehicleId) => {
    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    if (selectedVehicle) {
      setVehicleData({
        vehicle_id: vehicleId,
        type: selectedVehicle.name,
        vehicle_no: selectedVehicle.vehicle_no,
        capacity: selectedVehicle.capacity,
        vehicle_type: selectedVehicle.vehicle_type,
        note: selectedVehicle.description,
      });
    }
    updateTabValidation();
  };

  const handleVehicleChange = (field, value) => {
    setVehicleData({
      ...vehicleData,
      [field]: value,
    });
    updateTabValidation();
  };

  // Image functions
  const handleImageChange = (info) => {
    const file = info.file;
    if (file) {
      const isImage = file.type?.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImageUrl("");
  };

  // Submit function
  const handleSubmit = async (values) => {
    if (!isFormValid) {
      message.error("Please complete all required sections before submitting");
      return;
    }
    
    try {
      setLoading(true);

      // Process form data
      const tourData = {
        ...values,
        inclusions: values.inclusions
          ? values.inclusions
            .split("\n")
            .filter((item) => item.trim())
            .map((item) => item.trim())
          : [],
        exclusions: values.exclusions
          ? values.exclusions
            .split("\n")
            .filter((item) => item.trim())
            .map((item) => item.trim())
          : [],
        itinerary: itineraryData,
        hotel_details: hotelData,
        vehicle_details: vehicleData,
        pricing_details: pricingData,
        offer_ids: selectedOffers,
        available_dates: values.available_dates ? values.available_dates.map(d => d.format("YYYY-MM-DD")) : [],
      };
      
      // Debug: Log the tour data being sent
      console.log("Tour data being sent:", tourData);
      console.log("Selected offers:", selectedOffers);
      delete tourData.difficulty_level;

      let response;
      if (imageFile) {
        const formData = new FormData();
        Object.keys(tourData).forEach((key) => {
          if (tourData[key] !== undefined && tourData[key] !== null) {
            if (
              Array.isArray(tourData[key]) ||
              typeof tourData[key] === "object"
            ) {
              formData.append(key, JSON.stringify(tourData[key]));
            } else {
              formData.append(key, tourData[key]);
            }
          }
        });
        formData.append("featured_image", imageFile);

        response = isEdit
          ? await apiClient.put(endpoints.GET_TOUR_DETAIL(id), formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          : await apiClient.post(endpoints.GET_ALL_TOURS, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
      } else {
        response = isEdit
          ? await apiClient.put(endpoints.GET_TOUR_DETAIL(id), tourData)
          : await apiClient.post(endpoints.GET_ALL_TOURS, tourData);
      }

      message.success(`Tour ${isEdit ? "updated" : "created"} successfully`);
      navigate("/admin/tours");
    } catch (error) {
      console.error("Error saving tour:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to ${isEdit ? "update" : "create"} tour`;
      message.error(errorMessage);

      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading form data...</div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/tours")}
          >
            Back to Tours
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {isEdit ? "Edit Tour" : "Create New Tour"}
          </Title>
        </div>

        {/* Data Status */}
        <Alert
          message={`Data Status: Destinations: ${destinations.length}, Hotels: ${hotels.length}, Seasons: ${seasons.length}, Vehicles: ${vehicles.length}, Itineraries: ${existingItineraries.length}, Pricings: ${existingPricings.length}, Offers: ${offers.length}`}
          type="info"
          style={{ marginBottom: 16 }}
          showIcon
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormChange}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* Basic Information Tab */}
            <TabPane
              tab={getTabTitle("Basic Information", tabValidation.basic)}
              key="basic"
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Tour Name"
                    rules={[
                      { required: true, message: "Please enter tour name" },
                      { min: 3, message: "Name must be at least 3 characters" },
                    ]}
                  >
                    <Input placeholder="Enter tour name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="category"
                    label="Tour Category"
                    rules={[
                      {
                        required: true,
                        message: "Please select tour category",
                      },
                    ]}
                  >
                    <Select placeholder="Select tour category">
                      <Option value="ADVENTURE">Adventure</Option>
                      <Option value="CULTURAL">Cultural</Option>
                      <Option value="RELAXATION">Relaxation</Option>
                      <Option value="BUSINESS">Business</Option>
                      <Option value="WILDLIFE">Wildlife</Option>
                      <Option value="SPIRITUAL">Spiritual</Option>
                      <Option value="FAMILY">Family Tours</Option>
                      <Option value="HONEYMOON">Honeymoon Packages</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Please enter tour description" },
                  {
                    min: 10,
                    message: "Description must be at least 10 characters",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter detailed tour description"
                />
              </Form.Item>

              <Row gutter={24}>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="duration_days"
                    label="Duration (Days)"
                    rules={[
                      { required: true, message: "Please enter duration" },
                      {
                        type: "number",
                        min: 1,
                        message: "Duration must be at least 1 day",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={30}
                      style={{ width: "100%" }}
                      placeholder="Enter duration in days"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="max_capacity"
                    label="Maximum Capacity"
                    rules={[
                      {
                        required: true,
                        message: "Please enter maximum capacity",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "Must be at least 1 person",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ width: "100%" }}
                      placeholder="Enter max capacity"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="base_price"
                    label="Base Price (₹)"
                    rules={[
                      {
                        required: true,
                        message: "Please enter base price",
                      },
                      {
                        type: "number",
                        min: 0,
                        message: "Price must be positive",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="Enter base price"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="tour_type"
                    label="Tour Type"
                    rules={[
                      {
                        required: true,
                        message: "Please select tour type",
                      },
                    ]}
                  >
                    <Select placeholder="Select type">
                      <Option value="DOMESTIC">Domestic</Option>
                      <Option value="INTERNATIONAL">International</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="primary_destination_id"
                    label="Primary Destination"
                    rules={[
                      {
                        required: true,
                        message: "Please select primary destination",
                      },
                    ]}
                  >
                    <Select 
                      placeholder="Select primary destination"
                      onChange={handlePrimaryDestinationChange}
                    >
                      {destinations.map((dest) => (
                        <Option key={dest.id} value={dest.id}>
                          {dest.name} {dest.country && `(${dest.country})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="destination_ids"
                    label="All Destinations"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one destination",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select destinations"
                      onChange={handleDestinationChange}
                    >
                      {destinations.map((dest) => (
                        <Option key={dest.id} value={dest.id}>
                          {dest.name} {dest.country && `(${dest.country})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Featured Image">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {imageUrl ? (
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <Image
                        width={200}
                        height={150}
                        src={imageUrl}
                        style={{ objectFit: "cover", borderRadius: 8 }}
                        preview={true}
                      />
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={handleImageRemove}
                        style={{ position: "absolute", top: 8, right: 8 }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Upload
                      name="featured_image"
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleImageChange}
                      accept="image/*"
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload Image</div>
                      </div>
                    </Upload>
                  )}
                </div>
              </Form.Item>
            </TabPane>

            {/* Pricing, Seasons & Offers Tab */}
            <TabPane
              tab={getTabTitle("Pricing & Offers", tabValidation.pricing)}
              key="pricing"
            >
              {/* Offers Selection */}
              <Card title="Applicable Offers" style={{ marginBottom: 24 }}>
                <Form.Item
                  label="Select Offers"
                  extra="Select offers that apply to this tour. Leave empty if no offers apply."
                >
                  <Select
                    mode="multiple"
                    placeholder="Select applicable offers..."
                    value={selectedOffers}
                    onChange={handleOffersChange}
                    style={{ width: "100%" }}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {offers.map((offer) => (
                      <Option key={offer.id} value={offer.id}>
                        {offer.name} - {offer.discount_percentage}% off
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {offers.length === 0 && (
                  <Alert
                    message="No offers available. Please create offers in the Offers management section first."
                    type="info"
                    showIcon
                  />
                )}
              </Card>

              {/* Pricing Management */}
              <Card title="Seasonal Pricing">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Manage seasonal pricing for this tour</Text>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddPricing()}
                  >
                    Add Pricing
                  </Button>
                </div>

                <Table
                  columns={[
                    {
                      title: "Season",
                      dataIndex: ["season", "name"],
                      key: "season",
                      render: (text, record) => text || record.season_name || "N/A",
                    },
                    {
                      title: "2-Sharing Price",
                      dataIndex: "two_sharing_price",
                      key: "twoSharing",
                      render: (price) => price ? `₹${price?.toLocaleString()}` : "-",
                    },
                    {
                      title: "3-Sharing Price",
                      dataIndex: "three_sharing_price",
                      key: "threeSharing",
                      render: (price) => price ? `₹${price?.toLocaleString()}` : "-",
                    },
                    {
                      title: "Child Price",
                      dataIndex: "child_price",
                      key: "childPrice",
                      render: (price) => price ? `₹${price?.toLocaleString()}` : "-",
                    },
                    {
                      title: "Available Dates",
                      dataIndex: "available_dates",
                      key: "availableDates",
                      render: (dates) => {
                        if (!dates || dates.length === 0) return "-";
                        return (
                          <div>
                            {dates.slice(0, 3).map((date, idx) => (
                              <Tag key={idx} color="blue">{date}</Tag>
                            ))}
                            {dates.length > 3 && <Tag>+{dates.length - 3} more</Tag>}
                          </div>
                        );
                      }
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      render: (_, record, index) => (
                        <Space>
                          <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditPricing(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => handleDeletePricing(index)}
                          >
                            Remove
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={pricingData}
                  rowKey={(record, index) => record.id || index}
                  pagination={false}
                  locale={{ emptyText: "No pricing added. Click 'Add Pricing' to create seasonal pricing for this tour." }}
                />
              </Card>
            </TabPane>

            {/* Content Details Tab */}
            <TabPane
              tab={getTabTitle("Content Details", tabValidation.content)}
              key="content"
            >
              <Form.Item
                name="inclusions"
                label="Inclusions"
                rules={[{ required: true, message: "Please enter inclusions" }]}
                extra="Enter each inclusion on a new line"
              >
                <TextArea
                  rows={6}
                  placeholder="Enter inclusions (one per line)&#10;Example:&#10;Accommodation in hotels as per itinerary&#10;All meals (breakfast, lunch, dinner)&#10;Transportation by AC vehicle"
                />
              </Form.Item>

              <Form.Item
                name="exclusions"
                label="Exclusions"
                rules={[{ required: true, message: "Please enter exclusions" }]}
                extra="Enter each exclusion on a new line"
              >
                <TextArea
                  rows={6}
                  placeholder="Enter exclusions (one per line)&#10;Example:&#10;Personal expenses&#10;Tips and gratuities&#10;Travel insurance"
                />
              </Form.Item>

              <Form.Item name="special_notes" label="Special Notes">
                <TextArea
                  rows={4}
                  placeholder="Enter special notes and conditions"
                />
              </Form.Item>
            </TabPane>

            {/* Itinerary Tab */}
            <TabPane
              tab={getTabTitle("Itinerary", tabValidation.itinerary)}
              key="itinerary"
            >
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItinerary}
                  disabled={existingItineraries.length === 0}
                >
                  Select from Existing Itineraries
                </Button>
                {existingItineraries.length === 0 && (
                  <Alert
                    message="No itineraries available. Please add itineraries in the Itineraries management section first."
                    type="warning"
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>

              <List
                dataSource={itineraryData}
                renderItem={(day, index) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => handleRemoveItinerary(index)}
                      >
                        Remove
                      </Button>,
                    ]}
                  >
                    <div style={{ width: "100%" }}>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Input
                            placeholder="Day title"
                            value={day.title}
                            onChange={(e) =>
                              handleUpdateItinerary(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                        <Col span={18}>
                          <TextArea
                            placeholder="Day description"
                            value={day.description}
                            onChange={(e) =>
                              handleUpdateItinerary(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            rows={2}
                          />
                        </Col>
                      </Row>
                    </div>
                  </List.Item>
                )}
                locale={{ emptyText: "No itinerary added yet" }}
              />
            </TabPane>

            {/* Hotel Details Tab */}
            <TabPane
              tab={getTabTitle("Hotel Details", tabValidation.hotels)}
              key="hotels"
            >
              <HotelManager
                destinations={destinations}
                hotels={hotels}
                selectedDestinations={
                  form.getFieldValue("destination_ids") || []
                }
                hotelData={hotelData}
                onHotelChange={handleHotelChange}
              />
            </TabPane>

            {/* Vehicle Details Tab */}
            <TabPane
              tab={getTabTitle("Vehicle Details", tabValidation.vehicle)}
              key="vehicle"
            >
              <VehicleManager
                vehicles={vehicles}
                vehicleData={vehicleData}
                onVehicleSelect={handleVehicleSelect}
                onVehicleChange={handleVehicleChange}
              />
            </TabPane>
          </Tabs>

          <Divider />

          {/* Form Actions */}
          <Form.Item>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!isFormValid}
                size="large"
                icon={<SaveOutlined />}
              >
                {isEdit ? "Update Tour" : "Create Tour"}
              </Button>
              <Button size="large" onClick={() => navigate("/admin/tours")}>
                Cancel
              </Button>
              <div
                style={{
                  fontSize: "12px",
                  color: isFormValid ? "#52c41a" : "#ff4d4f",
                }}
              >
                Form Status:{" "}
                {isFormValid
                  ? "Ready to Submit"
                  : "Please complete all required sections"}
              </div>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* Itinerary Selection Modal */}
      <Modal
        title="Select from Existing Itineraries"
        open={itineraryModalVisible}
        onCancel={() => setItineraryModalVisible(false)}
        footer={null}
        width={800}
      >
        <List
          dataSource={existingItineraries}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSelectItinerary(item)}
                >
                  Add to Tour
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={`Day ${item.day_number}: ${item.title}`}
                description={
                  <div>
                    <div>{item.description}</div>
                    <Tag color="blue">{item.destination_name}</Tag>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: "No existing itineraries found" }}
        />
      </Modal>

      {/* Pricing Modal */}
      <PricingModal
        visible={pricingModalVisible}
        onCancel={() => {
          setPricingModalVisible(false);
          setEditingPricingIndex(null);
        }}
        onSubmit={handlePricingSubmit}
        seasons={seasons}
        editingData={editingPricingIndex !== null ? pricingData[editingPricingIndex] : null}
      />
    </div>
  );
};

// Hotel Manager Component
const HotelManager = ({
  destinations,
  hotels,
  selectedDestinations,
  hotelData,
  onHotelChange,
}) => {
  const getSelectedDestinationObjects = () => {
    return selectedDestinations
      .map((id) => destinations.find((d) => d.id === id))
      .filter(Boolean);
  };

  const getHotelsForDestination = (destinationId) => {
    return hotels.filter((hotel) => hotel.destination == destinationId);
  };

  const selectedDestinationObjects = getSelectedDestinationObjects();

  if (selectedDestinationObjects.length === 0) {
    return (
      <Alert
        message="Please select destinations in the Basic Information tab first"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div>
      <Title level={4}>Hotel Details by Destination</Title>
      <div style={{ marginTop: 16 }}>
        {selectedDestinationObjects.map((destination) => {
          const destinationHotels = getHotelsForDestination(destination.id);
          const currentHotelData = hotelData[destination.id] || {};

          return (
            <Card
              key={destination.id}
              title={destination.name}
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Select Hotel" required>
                    <Select
                      placeholder="Select from existing hotels"
                      value={currentHotelData.hotel_id || undefined}
                      onChange={(hotelId) => {
                        const selectedHotel = hotels.find(
                          (h) => h.id === hotelId
                        );
                        if (selectedHotel) {
                          onHotelChange(destination.id, "hotel_id", hotelId);
                          onHotelChange(
                            destination.id,
                            "hotel_name",
                            selectedHotel.name
                          );
                          onHotelChange(
                            destination.id,
                            "hotel_type",
                            selectedHotel.hotel_type
                          );
                        }
                      }}
                      style={{ width: "100%" }}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {destinationHotels.map((hotel) => (
                        <Option key={hotel.id} value={hotel.id}>
                          {hotel.name} ({hotel.hotel_type})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Or Enter Custom Hotel">
                    <Input
                      placeholder="e.g., OMEGA/SIMILAR"
                      value={currentHotelData.hotel_name || ""}
                      onChange={(e) =>
                        onHotelChange(
                          destination.id,
                          "hotel_name",
                          e.target.value
                        )
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              {destinationHotels.length === 0 && (
                <Alert
                  message={`No hotels found for ${destination.name}. Please add hotels for this destination first or enter custom hotel name.`}
                  type="warning"
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Vehicle Manager Component
const VehicleManager = ({
  vehicles,
  vehicleData,
  onVehicleSelect,
  onVehicleChange,
}) => {
  return (
    <div>
      <Title level={4}>Vehicle Details</Title>
      <div style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Select Existing Vehicle">
              <Select
                placeholder="Select from existing vehicles"
                value={vehicleData.vehicle_id || ""}
                onChange={onVehicleSelect}
                style={{ width: "100%" }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {vehicles.map((vehicle) => (
                  <Option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.vehicle_no}) - {vehicle.capacity}{" "}
                    seater
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Or Enter Custom Vehicle Type" required>
              <Input
                placeholder="e.g., AC INNOVA/XYLO"
                value={vehicleData.type || ""}
                onChange={(e) => onVehicleChange("type", e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Special Notes">
          <TextArea
            placeholder="e.g., AC WILL NOT WORK IN HILL AREA"
            value={vehicleData.note || ""}
            onChange={(e) => onVehicleChange("note", e.target.value)}
            rows={3}
          />
        </Form.Item>

        {vehicles.length === 0 && (
          <Alert
            message="No vehicles found. Please add vehicles in the Vehicles management section first or enter custom vehicle details."
            type="warning"
          />
        )}
      </div>
    </div>
  );
};

// Pricing Modal Component
const PricingModal = ({ visible, onCancel, onSubmit, seasons, editingData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingData) {
        // Editing existing pricing
        form.setFieldsValue({
          season_id: editingData.season_id,
          two_sharing_price: editingData.two_sharing_price,
          three_sharing_price: editingData.three_sharing_price,
          child_price: editingData.child_price,
          includes_return_air: editingData.includes_return_air,
          description: editingData.description,
          available_dates: editingData.available_dates ? editingData.available_dates.map(d => dayjs(d)) : [],
        });
      } else {
        // Adding new pricing
        form.resetFields();
      }
    }
  }, [visible, editingData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        available_dates: values.available_dates ? values.available_dates.map(d => d.format("YYYY-MM-DD")) : [],
      };
      onSubmit(formattedValues);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={editingData ? "Edit Pricing" : "Add New Pricing"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
      okText={editingData ? "Update" : "Add"}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Alert
          message="10-Day Advance Booking Rule"
          description="All tour dates must be at least 10 days in advance to allow customers sufficient booking time. Dates within 10 days will be automatically disabled."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="season_id"
          label="Season"
          rules={[{ required: true, message: "Please select a season" }]}
        >
          <Select placeholder="Select season">
            {seasons.map(season => (
              <Option key={season.id} value={season.id}>
                {season.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="two_sharing_price"
              label="2-Sharing Price (₹)"
              rules={[
                { required: true, message: "Please enter 2-sharing price" },
                { type: "number", min: 0, message: "Price must be positive" }
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter price"
                min={0}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="three_sharing_price"
              label="3-Sharing Price (₹)"
              rules={[{ type: "number", min: 0, message: "Price must be positive" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter price"
                min={0}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="child_price"
              label="Child Price (₹)"
              rules={[{ type: "number", min: 0, message: "Price must be positive" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter price"
                min={0}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="available_dates"
          label="Available Dates"
          extra="Select specific dates when this pricing is valid (must be at least 10 days in advance)"
        >
          <DatePicker
            multiple
            style={{ width: "100%" }}
            placeholder="Select dates"
            disabledDate={(current) => {
              // Disable dates that are in the past or less than 10 days from today
              const minBookingDate = dayjs().add(10, 'day').startOf('day');
              return current && current.isBefore(minBookingDate);
            }}
          />
        </Form.Item>

        <Form.Item
          name="includes_return_air"
          label="Includes Return Airfare"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          extra="Optional description for this pricing"
        >
          <TextArea
            rows={3}
            placeholder="Enter pricing description or special conditions"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TourForm;
