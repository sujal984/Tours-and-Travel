import React, { useEffect, useState } from 'react';
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
  DatePicker,
  List,
  Typography,
} from 'antd';
import { 
  PlusOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const TourForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [pricingData, setPricingData] = useState([]);
  const [hotelData, setHotelData] = useState({});
  const [vehicleData, setVehicleData] = useState({});
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [currentPricing, setCurrentPricing] = useState(null);
  const [formValid, setFormValid] = useState(false);
  const [pricingForm] = Form.useForm();
  
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchDestinations();
    fetchHotels();
    fetchSeasons();
    if (isEdit) {
      fetchTour();
    }
  }, [id]);

  // Tab validation functions
  const isBasicValid = () => {
    const values = form.getFieldsValue();
    return ['name', 'description', 'duration_days', 'max_capacity', 'base_price', 'primary_destination_id', 'category', 'difficulty_level'].every(field => 
      values[field] !== undefined && values[field] !== null && values[field] !== ''
    ) && values.destination_ids && values.destination_ids.length > 0;
  };

  const isPricingValid = () => pricingData.length > 0;
  const isContentValid = () => {
    const values = form.getFieldsValue();
    return values.inclusions && values.inclusions.trim() !== '' && 
           values.exclusions && values.exclusions.trim() !== '' &&
           values.itinerary && values.itinerary.length > 0;
  };
  const isHotelsValid = () => Object.keys(hotelData).length > 0;
  const isVehicleValid = () => vehicleData.type && vehicleData.type.trim() !== '';

  // Tab validation indicators
  const getTabTitle = (title, isValid) => (
    <span>
      {title}
      {!isValid && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
    </span>
  );

  const validateForm = () => {
    const values = form.getFieldsValue();
    const requiredFields = [
      'name', 'description', 'duration_days', 'max_capacity', 
      'base_price', 'primary_destination_id', 'category', 'difficulty_level'
    ];
    
    const basicFieldsValid = requiredFields.every(field => 
      values[field] !== undefined && values[field] !== null && values[field] !== ''
    );
    
    const hasDestinations = values.destination_ids && values.destination_ids.length > 0;
    const hasPricing = pricingData.length > 0;
    const hasHotels = Object.keys(hotelData).length > 0;
    const hasVehicle = vehicleData.type && vehicleData.type.trim() !== '';
    const hasItinerary = values.itinerary && values.itinerary.length > 0;
    const hasInclusions = values.inclusions && values.inclusions.trim() !== '';
    const hasExclusions = values.exclusions && values.exclusions.trim() !== '';
    
    const isFormValid = basicFieldsValid && hasDestinations && hasPricing && 
                       hasHotels && hasVehicle && hasItinerary && 
                       hasInclusions && hasExclusions;
    
    setFormValid(isFormValid);
  };

  // Form validation effect
  useEffect(() => {
    validateForm();
  }, [form, pricingData, hotelData, vehicleData]);

  // Trigger validation after data is loaded in edit mode
  useEffect(() => {
    if (isEdit && !loading) {
      // Small delay to ensure form fields are populated
      setTimeout(() => {
        validateForm();
      }, 100);
    }
  }, [isEdit, loading]);

  const fetchDestinations = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_DESTINATIONS);
      const destinationsData = response.data?.data || response.data?.results || [];
      setDestinations(Array.isArray(destinationsData) ? destinationsData : []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      message.error('Failed to load destinations');
      setDestinations([]);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_HOTELS);
      const hotelsData = response.data?.data || response.data?.results || [];
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      message.error('Failed to load hotels');
      setHotels([]);
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_SEASONS || '/seasons/');
      const seasonsData = response.data?.data || response.data?.results || [];
      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      setSeasons([]);
    }
  };

  const fetchTour = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_TOUR_DETAIL(id));
      const tour = response.data;
      
      console.log('Fetched tour data:', tour); // Debug log
      
      // Set basic form fields
      form.setFieldsValue({
        name: tour.name || '',
        description: tour.description || '',
        duration_days: tour.duration_days || 5,
        max_capacity: tour.max_capacity || 10,
        base_price: tour.base_price || 10000,
        primary_destination_id: tour.primary_destination?.id || tour.primary_destination_id,
        destination_ids: tour.destinations?.map(dest => dest.id) || [],
        category: tour.category || 'CULTURAL',
        difficulty_level: tour.difficulty_level || 'EASY',
        inclusions: Array.isArray(tour.inclusions) ? tour.inclusions.join('\n') : (tour.inclusions || ''),
        exclusions: Array.isArray(tour.exclusions) ? tour.exclusions.join('\n') : (tour.exclusions || ''),
        itinerary: tour.itinerary || [],
        special_notes: tour.special_notes || '',
      });
      
      // Set complex data structures
      // Handle seasonal pricing data
      if (tour.seasonal_pricings && Array.isArray(tour.seasonal_pricings)) {
        const formattedPricing = tour.seasonal_pricings.map(pricing => ({
          id: pricing.id || Date.now() + Math.random(),
          season: pricing.season || { id: pricing.season_id, name: pricing.season_name },
          two_sharing_price: pricing.two_sharing_price || 0,
          three_sharing_price: pricing.three_sharing_price || 0,
          child_price: pricing.child_price || 0,
          available_dates: pricing.available_dates || [],
          includes_return_air: pricing.includes_return_air || false,
          description: pricing.description || ''
        }));
        setPricingData(formattedPricing);
      } else if (tour.pricing_details && Array.isArray(tour.pricing_details)) {
        setPricingData(tour.pricing_details);
      } else {
        setPricingData([]);
      }
      
      // Handle hotel details
      if (tour.hotel_details && typeof tour.hotel_details === 'object') {
        setHotelData(tour.hotel_details);
      } else {
        setHotelData({});
      }
      
      // Handle vehicle details
      if (tour.vehicle_details && typeof tour.vehicle_details === 'object') {
        setVehicleData(tour.vehicle_details);
      } else {
        setVehicleData({});
      }
      
      // Set image preview if exists
      if (tour.featured_image) {
        setImageUrl(tour.featured_image);
      }
      
      console.log('Set pricing data:', tour.seasonal_pricings || tour.pricing_details);
      console.log('Set hotel data:', tour.hotel_details);
      console.log('Set vehicle data:', tour.vehicle_details);
      
      // Trigger form validation after data is loaded
      setTimeout(() => {
        validateForm();
      }, 200);
      
    } catch (error) {
      console.error('Error fetching tour:', error);
      message.error('Failed to load tour details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Process inclusions and exclusions from text to arrays
      const processedValues = {
        ...values,
        inclusions: values.inclusions ? 
          values.inclusions.split('\n').filter(item => item.trim()).map(item => item.trim()) : [],
        exclusions: values.exclusions ? 
          values.exclusions.split('\n').filter(item => item.trim()).map(item => item.trim()) : [],
        itinerary: values.itinerary || [],
      };
      
      // Prepare the data object
      const tourData = {
        ...processedValues,
        hotel_details: hotelData,
        vehicle_details: vehicleData,
        pricing_details: pricingData,
      };

      // Handle image upload separately if needed
      if (imageFile) {
        const formData = new FormData();
        
        // Add all form fields to FormData
        Object.keys(tourData).forEach(key => {
          if (tourData[key] !== undefined && tourData[key] !== null) {
            if (Array.isArray(tourData[key]) || typeof tourData[key] === 'object') {
              formData.append(key, JSON.stringify(tourData[key]));
            } else {
              formData.append(key, tourData[key]);
            }
          }
        });

        // Add image file
        formData.append('featured_image', imageFile);

        if (isEdit) {
          await apiClient.put(endpoints.GET_TOUR_DETAIL(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await apiClient.post(endpoints.GET_ALL_TOURS, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      } else {
        // Send as JSON if no image
        if (isEdit) {
          await apiClient.put(endpoints.GET_TOUR_DETAIL(id), tourData);
        } else {
          await apiClient.post(endpoints.GET_ALL_TOURS, tourData);
        }
      }

      message.success(`Tour ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/admin/tours');
    } catch (error) {
      console.error('Error saving tour:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} tour`;
      message.error(errorMessage);
      
      // Log detailed error for debugging
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  // Pricing management functions
  const handleAddPricing = () => {
    setCurrentPricing(null);
    pricingForm.resetFields();
    setPricingModalVisible(true);
  };

  const handleEditPricing = (pricing) => {
    setCurrentPricing(pricing);
    pricingForm.setFieldsValue({
      season: pricing.season?.id || pricing.season_id,
      two_sharing_price: pricing.two_sharing_price || 0,
      three_sharing_price: pricing.three_sharing_price || 0,
      child_price: pricing.child_price || 0,
      available_dates: pricing.available_dates || [],
      includes_return_air: pricing.includes_return_air || false,
      description: pricing.description || ''
    });
    setPricingModalVisible(true);
  };

  const handleDeletePricing = (index) => {
    const newPricingData = pricingData.filter((_, i) => i !== index);
    setPricingData(newPricingData);
    validateForm();
  };

  const handleSavePricing = async (values) => {
    try {
      const selectedSeason = seasons.find(s => s.id === values.season);
      const newPricing = {
        id: currentPricing?.id || Date.now(),
        season: selectedSeason,
        ...values
      };

      if (currentPricing) {
        // Edit existing
        const newPricingData = pricingData.map(p => 
          p.id === currentPricing.id ? newPricing : p
        );
        setPricingData(newPricingData);
      } else {
        // Add new
        setPricingData([...pricingData, newPricing]);
      }

      setPricingModalVisible(false);
      pricingForm.resetFields();
      message.success('Pricing saved successfully');
      validateForm();
    } catch (error) {
      message.error('Failed to save pricing');
    }
  };

  const handleImageChange = (info) => {
    const file = info.file;
    if (file) {
      const isImage = file.type?.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
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
    setImageUrl('');
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload Image</div>
    </div>
  );

  // Pricing table columns
  const pricingColumns = [
    {
      title: 'Season',
      dataIndex: ['season', 'name'],
      key: 'season',
    },
    {
      title: 'Date Range',
      dataIndex: ['season', 'date_range_display'],
      key: 'dateRange',
    },
    {
      title: '2-Sharing Price',
      dataIndex: 'two_sharing_price',
      key: 'twoSharing',
      render: (price) => `₹${price?.toLocaleString()}`,
    },
    {
      title: '3-Sharing Price',
      dataIndex: 'three_sharing_price',
      key: 'threeSharing',
      render: (price) => `₹${price?.toLocaleString()}`,
    },
    {
      title: 'Child Price',
      dataIndex: 'child_price',
      key: 'childPrice',
      render: (price) => `₹${price?.toLocaleString()}`,
    },
    {
      title: 'Available Dates',
      dataIndex: 'available_dates',
      key: 'availableDates',
      render: (dates) => Array.isArray(dates) ? dates.join(', ') : '',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, index) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditPricing(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small"
            danger
            onClick={() => handleDeletePricing(index)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card loading={loading && isEdit}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/tours')}
          >
            Back to Tours
          </Button>
          <h2 style={{ margin: 0 }}>
            {isEdit ? 'Edit Tour' : 'Create New Tour'}
          </h2>
          {isEdit && loading && (
            <span style={{ color: '#1890ff' }}>Loading tour data...</span>
          )}
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={validateForm}
          initialValues={{
            duration_days: 5,
            max_capacity: 10,
            base_price: 10000,
            category: 'CULTURAL',
            difficulty_level: 'EASY',
            inclusions: '',
            exclusions: '',
            itinerary: [],
          }}
          disabled={loading}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={getTabTitle("Basic Information", isBasicValid())} key="basic">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Tour Name"
                    rules={[
                      { required: true, message: 'Please enter tour name' },
                      { min: 3, message: 'Name must be at least 3 characters' },
                    ]}
                  >
                    <Input placeholder="Enter tour name" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="category"
                    label="Tour Category"
                    rules={[{ required: true, message: 'Please select tour category' }]}
                  >
                    <Select placeholder="Select tour category">
                      <Option value="ADVENTURE">Adventure</Option>
                      <Option value="CULTURAL">Cultural</Option>
                      <Option value="RELAXATION">Relaxation</Option>
                      <Option value="BUSINESS">Business</Option>
                      <Option value="WILDLIFE">Wildlife</Option>
                      <Option value="SPIRITUAL">Spiritual</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: 'Please enter tour description' },
                  { min: 10, message: 'Description must be at least 10 characters' },
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
                      { required: true, message: 'Please enter duration' },
                      { type: 'number', min: 1, message: 'Duration must be at least 1 day' },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={30}
                      style={{ width: '100%' }}
                      placeholder="Enter duration in days"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item
                    name="max_capacity"
                    label="Maximum Capacity"
                    rules={[
                      { required: true, message: 'Please enter maximum capacity' },
                      { type: 'number', min: 1, message: 'Must be at least 1 person' },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="Enter max capacity"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item
                    name="base_price"
                    label="Base Price (₹)"
                    rules={[
                      { required: true, message: 'Please enter base price' },
                      { type: 'number', min: 1, message: 'Price must be greater than 0' },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={1000000}
                      style={{ width: '100%' }}
                      placeholder="Enter base price"
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/₹\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item
                    name="difficulty_level"
                    label="Difficulty Level"
                    rules={[{ required: true, message: 'Please select difficulty level' }]}
                  >
                    <Select placeholder="Select difficulty">
                      <Option value="EASY">Easy</Option>
                      <Option value="MODERATE">Moderate</Option>
                      <Option value="CHALLENGING">Challenging</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="primary_destination_id"
                    label="Primary Destination"
                    rules={[{ required: true, message: 'Please select primary destination' }]}
                    extra="Main destination for this tour"
                  >
                    <Select placeholder="Select primary destination">
                      {Array.isArray(destinations) && destinations.map(dest => (
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
                    extra="Select all destinations covered in this tour"
                  >
                    <Select 
                      mode="multiple"
                      placeholder="Select destinations"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {Array.isArray(destinations) && destinations.map(dest => (
                        <Option key={dest.id} value={dest.id}>
                          {dest.name} {dest.country && `(${dest.country})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Featured Image">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {imageUrl ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <Image
                        width={200}
                        height={150}
                        src={imageUrl}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                        preview={true}
                      />
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={handleImageRemove}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Upload
                      name="featured_image"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleImageChange}
                      accept="image/*"
                    >
                      {uploadButton}
                    </Upload>
                  )}
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </div>
                </div>
              </Form.Item>
            </TabPane>

            <TabPane tab={getTabTitle("Pricing & Seasons", isPricingValid())} key="pricing">
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddPricing}
                >
                  Add Seasonal Pricing
                </Button>
                <Text style={{ marginLeft: 16, color: '#666' }}>
                  {pricingData.length === 0 && <span style={{ color: 'red' }}>* At least one pricing is required</span>}
                </Text>
              </div>
              
              <Table
                columns={pricingColumns}
                dataSource={pricingData}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: 'No pricing data added yet' }}
              />
            </TabPane>

            <TabPane tab={getTabTitle("Content Details", isContentValid())} key="content">
              <Form.Item
                name="inclusions"
                label="Inclusions"
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
                extra="Enter each exclusion on a new line"
              >
                <TextArea
                  rows={6}
                  placeholder="Enter exclusions (one per line)&#10;Example:&#10;Personal expenses&#10;Tips and gratuities&#10;Travel insurance"
                />
              </Form.Item>

              <Form.Item
                name="special_notes"
                label="Special Notes"
                extra="Additional notes and conditions"
              >
                <TextArea
                  rows={4}
                  placeholder="Enter special notes and conditions&#10;Example: All rates are subject to availability. Weather conditions may affect itinerary."
                />
              </Form.Item>
            </TabPane>

            <TabPane tab={getTabTitle("Itinerary", isContentValid())} key="itinerary">
              <ItineraryManager 
                value={form.getFieldValue('itinerary') || []}
                onChange={(itinerary) => {
                  form.setFieldsValue({ itinerary });
                  validateForm();
                }}
                destinations={destinations}
              />
            </TabPane>

            <TabPane tab={getTabTitle("Hotel Details", isHotelsValid())} key="hotels">
              <HotelDetailsManager
                destinations={form.getFieldValue('destination_ids')?.map(id => 
                  destinations.find(d => d.id === id)
                ).filter(Boolean) || []}
                hotels={hotels}
                value={hotelData}
                onChange={(data) => {
                  setHotelData(data);
                  validateForm();
                }}
              />
            </TabPane>

            <TabPane tab={getTabTitle("Vehicle Details", isVehicleValid())} key="vehicle">
              <VehicleDetailsManager
                value={vehicleData}
                onChange={(data) => {
                  setVehicleData(data);
                  validateForm();
                }}
              />
            </TabPane>
          </Tabs>

          <Divider />

          <Form.Item>
            <div style={{ display: 'flex', gap: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!formValid}
                size="large"
                icon={<SaveOutlined />}
              >
                {isEdit ? 'Update Tour' : 'Create Tour'}
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/admin/tours')}
              >
                Cancel
              </Button>
            </div>
            {!formValid && (
              <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: '12px' }}>
                Please fill all required fields: Basic info, destinations, pricing, hotels, vehicle details, itinerary, inclusions, and exclusions.
              </div>
            )}
          </Form.Item>
        </Form>
      </Card>

      {/* Pricing Modal */}
      <Modal
        title={currentPricing ? "Edit Pricing" : "Add Pricing"}
        open={pricingModalVisible}
        onCancel={() => setPricingModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={pricingForm}
          layout="vertical"
          onFinish={handleSavePricing}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="season"
                label="Season"
                rules={[{ required: true, message: 'Please select a season' }]}
              >
                <Select placeholder="Select season">
                  {seasons.map(season => (
                    <Option key={season.id} value={season.id}>
                      {season.name} ({season.date_range_display})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="includes_return_air"
                label="Includes Return Air"
                valuePropName="checked"
              >
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="two_sharing_price"
                label="2-Sharing Price (₹)"
                rules={[{ required: true, message: 'Please enter 2-sharing price' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="three_sharing_price"
                label="3-Sharing Price (₹)"
                rules={[{ required: true, message: 'Please enter 3-sharing price' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="child_price"
                label="Child Price (₹)"
                rules={[{ required: true, message: 'Please enter child price' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="available_dates"
            label="Available Dates"
            extra="Enter dates as numbers (e.g., 10, 17, 24)"
          >
            <Select
              mode="tags"
              placeholder="Enter available dates"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Optional description for this pricing"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setPricingModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {currentPricing ? 'Update' : 'Add'} Pricing
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Itinerary Manager Component
const ItineraryManager = ({ value = [], onChange, destinations }) => {
  const [itinerary, setItinerary] = useState(value);

  useEffect(() => {
    setItinerary(value);
  }, [value]);

  const addDay = () => {
    const newDay = {
      day: itinerary.length + 1,
      title: `Day ${itinerary.length + 1}`,
      description: ''
    };
    const newItinerary = [...itinerary, newDay];
    setItinerary(newItinerary);
    onChange(newItinerary);
  };

  const removeDay = (index) => {
    const newItinerary = itinerary.filter((_, i) => i !== index);
    // Renumber days
    const renumbered = newItinerary.map((day, i) => ({
      ...day,
      day: i + 1,
      title: day.title.replace(/Day \d+/, `Day ${i + 1}`)
    }));
    setItinerary(renumbered);
    onChange(renumbered);
  };

  const updateDay = (index, field, value) => {
    const newItinerary = [...itinerary];
    newItinerary[index] = { ...newItinerary[index], [field]: value };
    setItinerary(newItinerary);
    onChange(newItinerary);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={addDay}>
          Add Day
        </Button>
      </div>
      
      <List
        dataSource={itinerary}
        renderItem={(day, index) => (
          <List.Item
            actions={[
              <Button 
                type="text" 
                danger 
                icon={<MinusCircleOutlined />}
                onClick={() => removeDay(index)}
              >
                Remove
              </Button>
            ]}
          >
            <div style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="Day title"
                    value={day.title}
                    onChange={(e) => updateDay(index, 'title', e.target.value)}
                  />
                </Col>
                <Col span={18}>
                  <TextArea
                    placeholder="Day description"
                    value={day.description}
                    onChange={(e) => updateDay(index, 'description', e.target.value)}
                    rows={2}
                  />
                </Col>
              </Row>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

// Hotel Details Manager Component
const HotelDetailsManager = ({ destinations, hotels, value = {}, onChange }) => {
  const updateHotelDetails = (destinationId, field, val) => {
    const newValue = {
      ...value,
      [destinationId]: {
        ...value[destinationId],
        [field]: val
      }
    };
    onChange(newValue);
  };

  const getHotelsForDestination = (destinationId) => {
    return hotels.filter(hotel => hotel.destination === destinationId);
  };

  return (
    <div>
      <Title level={4}>Hotel Details by Destination</Title>
      <Text type="secondary">Select hotels for each destination from existing hotels</Text>
      
      <div style={{ marginTop: 16 }}>
        {destinations.map(destination => {
          const destinationHotels = getHotelsForDestination(destination.id);
          const currentHotelData = value[destination.id] || {};
          
          return (
            <Card key={destination.id} title={destination.name} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <label>Select Hotel:</label>
                  <Select
                    placeholder="Select from existing hotels"
                    value={currentHotelData.hotel_id || ''}
                    onChange={(hotelId) => {
                      const selectedHotel = hotels.find(h => h.id === hotelId);
                      if (selectedHotel) {
                        updateHotelDetails(destination.id, 'hotel_id', hotelId);
                        updateHotelDetails(destination.id, 'hotel_name', selectedHotel.name);
                        updateHotelDetails(destination.id, 'hotel_type', selectedHotel.hotel_type);
                      }
                    }}
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {destinationHotels.map(hotel => (
                      <Option key={hotel.id} value={hotel.id}>
                        {hotel.name} ({hotel.hotel_type})
                      </Option>
                    ))}
                  </Select>
                  {destinationHotels.length === 0 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      No hotels available for this destination. Please add hotels first.
                    </Text>
                  )}
                </Col>
                <Col span={12}>
                  <label>Or Enter Custom Hotel:</label>
                  <Input
                    placeholder="e.g., OMEGA/SIMILAR"
                    value={currentHotelData.hotel_name || ''}
                    onChange={(e) => updateHotelDetails(destination.id, 'hotel_name', e.target.value)}
                  />
                </Col>
              </Row>
              {currentHotelData.hotel_name && (
                <Row gutter={16} style={{ marginTop: 8 }}>
                  <Col span={12}>
                    <label>Hotel Type:</label>
                    <Select
                      placeholder="Select hotel type"
                      value={currentHotelData.hotel_type || ''}
                      onChange={(val) => updateHotelDetails(destination.id, 'hotel_type', val)}
                      style={{ width: '100%' }}
                    >
                      <Option value="Standard">Standard</Option>
                      <Option value="Deluxe">Deluxe</Option>
                      <Option value="Luxury">Luxury</Option>
                      <Option value="Boutique">Boutique</Option>
                      <Option value="Resort">Resort</Option>
                    </Select>
                  </Col>
                </Row>
              )}
            </Card>
          );
        })}
        {destinations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Please select destinations first to configure hotels
          </div>
        )}
      </div>
    </div>
  );
};

// Vehicle Details Manager Component
const VehicleDetailsManager = ({ value = {}, onChange }) => {
  const updateVehicleDetails = (field, val) => {
    onChange({
      ...value,
      [field]: val
    });
  };

  return (
    <div>
      <Title level={4}>Vehicle Details</Title>
      <Text type="secondary">Configure transportation information</Text>
      
      <div style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <label>Vehicle Type:</label>
            <Input
              placeholder="e.g., AC INNOVA/XYLO, FOR LACHUNG, SCORPIO/SUMO/BOLERO"
              value={value.type || ''}
              onChange={(e) => updateVehicleDetails('type', e.target.value)}
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col span={24}>
            <label>Special Notes:</label>
            <TextArea
              placeholder="e.g., AC WILL NOT WORK IN HILL AREA"
              value={value.note || ''}
              onChange={(e) => updateVehicleDetails('note', e.target.value)}
              rows={3}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TourForm;