from rest_framework import serializers
from .models import Booking
from apps.tours.serializers import TourListSerializer, TourPackageSerializer

class BookingSerializer(serializers.ModelSerializer):
    tour_details = TourListSerializer(source='tour', read_only=True)
    package_details = TourPackageSerializer(source='package', read_only=True)
    tour_name = serializers.CharField(source='tour.name', read_only=True)
    can_review = serializers.ReadOnlyField()
    can_cancel = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'tour', 'tour_name', 'package', 'travelers_count',
            'total_price', 'status', 'booking_date', 'travel_date',
            'special_requests', 'traveler_details', 'contact_number',
            'emergency_contact', 'can_review', 'can_cancel',
            'tour_details', 'package_details', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'booking_date', 'total_price', 'created_at', 'updated_at']

    def validate_traveler_details(self, value):
        """Validate traveler details format"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Traveler details must be a list")
        
        for traveler in value:
            if not isinstance(traveler, dict):
                raise serializers.ValidationError("Each traveler must be an object")
            
            required_fields = ['name', 'age']
            for field in required_fields:
                if field not in traveler:
                    raise serializers.ValidationError(f"Traveler missing required field: {field}")
        
        return value

    def validate_travel_date(self, value):
        """Validate travel date is in the future"""
        if value:
            from django.utils import timezone
            if value <= timezone.now().date():
                raise serializers.ValidationError("Travel date must be in the future")
        return value
