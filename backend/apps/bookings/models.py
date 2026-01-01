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
    travelers_count = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    booking_date = models.DateTimeField(auto_now_add=True)
    travel_date = models.DateField(null=True, blank=True)
    special_requests = models.TextField(blank=True, null=True)
    traveler_details = models.JSONField(default=list, blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)

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
