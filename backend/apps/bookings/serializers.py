from rest_framework import serializers
from .models import Booking
from apps.tours.serializers import TourListSerializer, TourPackageSerializer

class BookingSerializer(serializers.ModelSerializer):
    tour_details = TourListSerializer(source='tour', read_only=True)
    package_details = TourPackageSerializer(source='package', read_only=True)
    tour_name = serializers.CharField(source='tour.name', read_only=True)
    user_details = serializers.SerializerMethodField()
    payment_details = serializers.SerializerMethodField()
    can_review = serializers.ReadOnlyField()
    can_cancel = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_details', 'tour', 'tour_name', 'package', 'travelers_count',
            'total_price', 'status', 'booking_date', 'travel_date',
            'special_requests', 'traveler_details', 'contact_number',
            'emergency_contact', 'cancellation_reason', 'can_review', 'can_cancel',
            'tour_details', 'package_details', 'payment_details', 'aadhar_card',
            'applied_offer_id', 'base_amount', 'discount_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'booking_date', 'created_at', 'updated_at']

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'full_name': obj.user.get_full_name(),
            }
        return None

    def get_payment_details(self, obj):
        # Get the latest payment for this booking
        payment = obj.payments.order_by('-created_at').first()
        if payment:
            return {
                'id': payment.id,
                'amount': payment.amount,
                'payment_method': payment.payment_method,
                'status': payment.status,
                'transaction_id': payment.transaction_id,
                'processed_at': payment.processed_at,
                'created_at': payment.created_at,
            }
        return {
            'status': 'PENDING',
            'amount': obj.total_price,
            'payment_method': None,
            'transaction_id': None,
            'processed_at': None,
            'created_at': None,
        }

    def validate_traveler_details(self, value):
        """Validate traveler details format. Handles JSON string from multipart form."""
        import json
        
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for traveler_details")

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
        """Validate travel date is at least 15 days in the future"""
        if value:
            from django.utils import timezone
            from datetime import timedelta
            
            min_date = timezone.now().date() + timedelta(days=10)
            if value < min_date:
                raise serializers.ValidationError("Bookings must be made at least 15 days in advance.")
        return value
