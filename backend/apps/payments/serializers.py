from rest_framework import serializers
from .models import Payment, Refund, Invoice

class PaymentSerializer(serializers.ModelSerializer):
    booking_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'booking_details', 'amount', 'payment_method',
            'status', 'transaction_id', 'gateway_response', 'processed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_booking_details(self, obj):
        return {
            'id': obj.booking.id,
            'tour_name': obj.booking.tour.name,
            'user_email': obj.booking.user.email,
            'travel_date': obj.booking.travel_date,
        }


class RefundSerializer(serializers.ModelSerializer):
    payment_details = serializers.SerializerMethodField()
    booking_details = serializers.SerializerMethodField()
    processed_by_name = serializers.CharField(source='processed_by.email', read_only=True)
    
    class Meta:
        model = Refund
        fields = [
            'id', 'payment', 'payment_details', 'booking', 'booking_details',
            'amount', 'reason', 'status', 'admin_notes', 'processed_by',
            'processed_by_name', 'processed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'processed_by', 'processed_at', 'created_at', 'updated_at']

    def get_payment_details(self, obj):
        return {
            'id': obj.payment.id,
            'amount': obj.payment.amount,
            'transaction_id': obj.payment.transaction_id,
        }

    def get_booking_details(self, obj):
        return {
            'id': obj.booking.id,
            'tour_name': obj.booking.tour.name,
            'user_email': obj.booking.user.email,
            'travel_date': obj.booking.travel_date,
        }


class InvoiceSerializer(serializers.ModelSerializer):
    booking_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'booking', 'booking_details', 'invoice_number', 'amount',
            'tax_amount', 'total_amount', 'status', 'due_date', 'issued_date',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'issued_date', 'created_at', 'updated_at']

    def get_booking_details(self, obj):
        return {
            'id': obj.booking.id,
            'tour_name': obj.booking.tour.name,
            'user_email': obj.booking.user.email,
            'travel_date': obj.booking.travel_date,
            'total_price': obj.booking.total_price,
        }