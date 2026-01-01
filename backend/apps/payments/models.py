from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.bookings.models import Booking

class Payment(BaseModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    
    METHOD_CHOICES = [
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('UPI', 'UPI'),
        ('NET_BANKING', 'Net Banking'),
        ('CASH', 'Cash'),
    ]

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        default='CREDIT_CARD'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments_payment'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.booking.tour.name} - ₹{self.amount}"


class Refund(BaseModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('PROCESSED', 'Processed'),
        ('REJECTED', 'Rejected'),
    ]

    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='refunds'
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='refunds',
        null=True,
        blank=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    admin_notes = models.TextField(blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_refunds'
    )
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments_refund'
        ordering = ['-created_at']

    def __str__(self):
        return f"Refund {self.id} - {self.booking.tour.name} - ₹{self.amount}"


class Invoice(BaseModel):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='invoice'
    )
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    due_date = models.DateField()
    issued_date = models.DateField(auto_now_add=True, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'payments_invoice'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate invoice number
            import datetime
            today = datetime.date.today()
            count = Invoice.objects.filter(created_at__date=today).count() + 1
            self.invoice_number = f"INV-{today.strftime('%Y%m%d')}-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.booking.tour.name}"