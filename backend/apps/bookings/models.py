from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.tours.models import Tour, TourPackage

class Booking(BaseModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
        ('REFUND_PENDING', 'Refund Pending'),
        ('CANCELLED_REFUNDED', 'Cancelled & Refunded'),
        ('CANCELLED_NOT_REFUNDED', 'Cancelled & Refund Rejected'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    tour = models.ForeignKey(
        Tour,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    package = models.ForeignKey(
        TourPackage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    aadhar_card = models.ImageField(
        upload_to='bookings/aadhar/',
        null=True,
        blank=True,
        help_text="Aadhar card image for identity verification"
    )
    travelers_count = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    booking_date = models.DateTimeField(auto_now_add=True)
    travel_date = models.DateField(null=True, blank=True)
    special_requests = models.TextField(blank=True, null=True)
    traveler_details = models.JSONField(default=list, blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    
    # Offer/Discount tracking
    applied_offer_id = models.CharField(max_length=100, blank=True, null=True, help_text="ID of applied offer")
    base_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Amount before discount")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Discount applied")

    class Meta:
        db_table = 'bookings_booking'
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id} for {self.user.email}"

    @property
    def can_review(self):
        """Check if booking is eligible for review"""
        return self.status == 'COMPLETED'

    @property
    def can_cancel(self):
        """Check if booking can be cancelled"""
        return self.status in ['PENDING', 'CONFIRMED']

    def calculate_refund_amount(self):
        """
        Calculate refund amount based on cancellation policy:
        - Within 24 hours of booking: 100% refund
        - 10+ days before tour start: 50% refund  
        - 5-9 days before tour start: 0% refund
        - Less than 5 days: 0% refund
        """
        from django.utils import timezone
        from datetime import timedelta
        
        if not self.travel_date:
            return 0, "No travel date set"
        
        now = timezone.now()
        booking_time = self.booking_date
        travel_date = timezone.datetime.combine(self.travel_date, timezone.datetime.min.time())
        travel_date = timezone.make_aware(travel_date) if timezone.is_naive(travel_date) else travel_date
        
        # Check if within 24 hours of booking
        hours_since_booking = (now - booking_time).total_seconds() / 3600
        if hours_since_booking <= 24:
            return float(self.total_price), "Full refund - cancelled within 24 hours of booking"
        
        # Check days before tour start
        days_before_tour = (travel_date - now).days
        
        if days_before_tour >= 10:
            refund_amount = float(self.total_price) * 0.5
            return refund_amount, f"50% refund - cancelled {days_before_tour} days before tour start"
        elif days_before_tour >= 5:
            return 0, f"No refund - cancelled {days_before_tour} days before tour start (less than 10 days)"
        else:
            return 0, f"No refund - cancelled {days_before_tour} days before tour start (less than 5 days)"

    @property
    def refund_policy_status(self):
        """Get current refund policy status for this booking"""
        refund_amount, reason = self.calculate_refund_amount()
        return {
            'refund_amount': refund_amount,
            'refund_percentage': (refund_amount / float(self.total_price)) * 100 if self.total_price > 0 else 0,
            'reason': reason,
            'can_get_refund': refund_amount > 0
        }
