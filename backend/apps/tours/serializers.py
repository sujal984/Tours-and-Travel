"""
Serializers for Tours & Travels backend
"""

from rest_framework import serializers
from django.db import models
from .models import (
    Destination, Tour, TourPackage, Hotel, Vehicle, 
    Offer, CustomPackage, Inquiry, Season, TourPricing,
    TourItinerary
)


class SeasonSerializer(serializers.ModelSerializer):
    """Serializer for Season model"""
    
    class Meta:
        model = Season
        fields = [
            'id', 'name', 'start_month', 'end_month', 'description', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TourPricingSerializer(serializers.ModelSerializer):
    """Serializer for TourPricing model"""
    tour_name = serializers.CharField(source='tour.name', read_only=True)
    season_name = serializers.CharField(source='season.name', read_only=True)
    
    class Meta:
        model = TourPricing
        fields = [
            'id', 'tour', 'tour_name', 'season', 'season_name',
            'price', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TourItinerarySerializer(serializers.ModelSerializer):
    """Serializer for TourItinerary model"""
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    tour_name = serializers.CharField(source='tour.name', read_only=True)
    
    class Meta:
        model = TourItinerary
        fields = [
            'id', 'destination', 'destination_name', 'tour', 'tour_name',
            'day_number', 'title', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DestinationSerializer(serializers.ModelSerializer):
    """Serializer for Destination model"""
    
    class Meta:
        model = Destination
        fields = [
            'id', 'name', 'slug', 'description', 'places', 
            'country', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class HotelSerializer(serializers.ModelSerializer):
    """Serializer for Hotel model"""
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    
    class Meta:
        model = Hotel
        fields = [
            'id', 'destination', 'destination_name', 'name', 'address', 'image', 
            'hotel_type', 'star_rating', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'destination_name', 'created_at', 'updated_at']


class TourPackageSerializer(serializers.ModelSerializer):
    """Serializer for TourPackage model"""
    total_price = serializers.ReadOnlyField()
    available_capacity = serializers.ReadOnlyField()
    
    class Meta:
        model = TourPackage
        fields = [
            'id', 'name', 'price_modifier', 'total_price', 
            'max_participants', 'available_capacity', 
            'additional_inclusions', 'package_type', 'is_available',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TourListSerializer(serializers.ModelSerializer):
    """Serializer for Tour list view (minimal data)"""
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    available_capacity = serializers.ReadOnlyField()
    
    class Meta:
        model = Tour
        fields = [
            'id', 'name', 'slug', 'destination_name', 'duration_days',
            'max_capacity', 'base_price', 'featured_image', 'difficulty_level',
            'category', 'average_rating', 'review_count', 'available_capacity',
            'is_active', 'created_at'
        ]


class TourDetailSerializer(serializers.ModelSerializer):
    """Serializer for Tour detail view (complete data)"""
    destination = DestinationSerializer(read_only=True)
    destination_id = serializers.UUIDField(write_only=True)
    packages = TourPackageSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    available_capacity = serializers.ReadOnlyField()
    
    class Meta:
        model = Tour
        fields = [
            'id', 'name', 'slug', 'description', 'destination', 'destination_id',
            'duration_days', 'max_capacity', 'available_capacity', 'base_price',
            'featured_image', 'gallery_images', 'inclusions', 'exclusions',
            'itinerary', 'difficulty_level', 'category', 'packages',
            'average_rating', 'review_count', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def validate_gallery_images(self, value):
        """Validate gallery images format"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Gallery images must be a list")
        
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError("Each gallery image must be a string URL")
        
        return value

    def validate_inclusions(self, value):
        """Validate inclusions format"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Inclusions must be a list")
        
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError("Each inclusion must be a string")
        
        return value

    def validate_exclusions(self, value):
        """Validate exclusions format"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Exclusions must be a list")
        
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError("Each exclusion must be a string")
        
        return value

    def validate_itinerary(self, value):
        """Validate itinerary format"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Itinerary must be a list")
        
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each itinerary item must be an object")
            
            required_fields = ['day', 'title', 'description']
            for field in required_fields:
                if field not in item:
                    raise serializers.ValidationError(f"Itinerary item missing required field: {field}")
        
        return value


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model"""
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'vehicle_no', 'name', 'description', 'capacity',
            'vehicle_type', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OfferSerializer(serializers.ModelSerializer):
    """Serializer for Offer model"""
    is_valid = serializers.ReadOnlyField()
    applicable_tours_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'description', 'discount_percentage',
            'start_date', 'end_date', 'is_active', 'is_valid',
            'applicable_tours_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_applicable_tours_count(self, obj):
        """Get count of applicable tours"""
        return obj.applicable_tours.count()

    def validate(self, data):
        """Validate offer dates"""
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError(
                    "End date must be after start date"
                )
        return data


class CustomPackageSerializer(serializers.ModelSerializer):
    """Serializer for CustomPackage model"""
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    # Add fields for anonymous submissions
    customer_name = serializers.CharField(max_length=100, required=False, write_only=True)
    customer_email_input = serializers.EmailField(required=False, write_only=True)
    
    class Meta:
        model = CustomPackage
        fields = [
            'id', 'customer', 'customer_email', 'customer_name', 'customer_email_input',
            'contact_number', 'destination', 'duration', 'start_date', 'participants_count', 
            'hotel_preference', 'transportation_choice', 'package_type', 'special_requirements',
            'budget_range', 'status', 'admin_notes', 'quoted_price',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'created_at', 'updated_at']

    def validate_start_date(self, value):
        """Validate start date is in the future"""
        from django.utils import timezone
        if value <= timezone.now().date():
            raise serializers.ValidationError(
                "Start date must be in the future"
            )
        return value

    def create(self, validated_data):
        """Handle creation for both authenticated and anonymous users"""
        # Remove write-only fields that aren't part of the model
        validated_data.pop('customer_name', None)
        validated_data.pop('customer_email_input', None)
        return super().create(validated_data)


class InquirySerializer(serializers.ModelSerializer):
    """Serializer for Inquiry model"""
    tour_name = serializers.CharField(source='tour.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    
    class Meta:
        model = Inquiry
        fields = [
            'id', 'tour', 'tour_name', 'customer', 'customer_email',
            'name', 'email', 'contact_number', 'inquiry_date',
            'message', 'status', 'admin_response',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'created_at', 'updated_at']

    def validate_inquiry_date(self, value):
        """Validate inquiry date is not in the future"""
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError(
                "Inquiry date cannot be in the future"
            )
        return value


class TourSearchSerializer(serializers.Serializer):
    """Serializer for tour search parameters"""
    search = serializers.CharField(required=False, allow_blank=True)
    destination = serializers.CharField(required=False, allow_blank=True)
    category = serializers.ChoiceField(
        choices=Tour.CATEGORY_CHOICES,
        required=False,
        allow_blank=True
    )
    difficulty = serializers.ChoiceField(
        choices=Tour.DIFFICULTY_CHOICES,
        required=False,
        allow_blank=True
    )
    min_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        min_value=0
    )
    max_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        min_value=0
    )
    min_duration = serializers.IntegerField(required=False, min_value=1)
    max_duration = serializers.IntegerField(required=False, min_value=1)
    sort_by = serializers.ChoiceField(
        choices=[
            ('name', 'Name'),
            ('price', 'Price'),
            ('duration', 'Duration'),
            ('rating', 'Rating'),
            ('created_at', 'Newest'),
        ],
        required=False,
        default='name'
    )
    sort_order = serializers.ChoiceField(
        choices=[('asc', 'Ascending'), ('desc', 'Descending')],
        required=False,
        default='asc'
    )

    def validate(self, data):
        """Validate search parameters"""
        min_price = data.get('min_price')
        max_price = data.get('max_price')
        
        if min_price and max_price and min_price >= max_price:
            raise serializers.ValidationError(
                "Maximum price must be greater than minimum price"
            )
        
        min_duration = data.get('min_duration')
        max_duration = data.get('max_duration')
        
        if min_duration and max_duration and min_duration >= max_duration:
            raise serializers.ValidationError(
                "Maximum duration must be greater than minimum duration"
            )
        
        return data