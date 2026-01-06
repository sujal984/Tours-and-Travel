from django.contrib import admin
from django.utils.html import format_html
from .models import Payment, Refund, Invoice


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'customer_info', 'tour_info', 'amount', 'payment_method', 
        'status', 'transaction_id', 'processed_at', 'created_at'
    ]
    list_filter = ['status', 'payment_method', 'created_at', 'processed_at']
    search_fields = [
        'transaction_id', 'booking__user__email', 
        'booking__tour__name', 'booking__id'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at', 'transaction_id']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('booking', 'amount', 'payment_method', 'status')
        }),
        ('Transaction Details', {
            'fields': ('transaction_id', 'gateway_response', 'processed_at')
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def customer_info(self, obj):
        if obj.booking and obj.booking.user:
            return format_html(
                '<strong>{}</strong><br/>'
                '<small>{}</small>',
                obj.booking.user.get_full_name() or obj.booking.user.username,
                obj.booking.user.email
            )
        elif obj.booking:
            return format_html('<em>Anonymous User</em>')
        return format_html('<em>No Customer</em>')
    customer_info.short_description = 'Customer'
    customer_info.admin_order_field = 'booking__user__email'

    def tour_info(self, obj):
        if obj.booking and obj.booking.tour:
            return format_html(
                '<strong>{}</strong><br/>'
                '<small>Booking #{}</small>',
                obj.booking.tour.name,
                str(obj.booking.id)[:8]
            )
        return format_html('<em>No Tour</em>')
    tour_info.short_description = 'Tour'
    tour_info.admin_order_field = 'booking__tour__name'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'booking', 'booking__user', 'booking__tour'
        )


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'payment_info', 'amount', 'status', 
        'processed_by', 'processed_at', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'processed_at']
    search_fields = [
        'payment__transaction_id', 'booking__user__email',
        'booking__tour__name', 'reason'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Refund Information', {
            'fields': ('payment', 'booking', 'amount', 'reason', 'status')
        }),
        ('Processing Details', {
            'fields': ('processed_by', 'processed_at', 'admin_notes')
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def payment_info(self, obj):
        if obj.payment:
            return format_html(
                '<strong>Payment #{}</strong><br/>'
                '<small>TXN: {}</small><br/>'
                '<small>₹{}</small>',
                obj.payment.id,
                obj.payment.transaction_id or 'N/A',
                obj.payment.amount
            )
        return 'No payment'
    payment_info.short_description = 'Payment Details'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'payment', 'booking', 'booking__user', 'booking__tour', 'processed_by'
        )


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'invoice_number', 'booking_info', 'total_amount', 
        'status', 'due_date', 'issued_date'
    ]
    list_filter = ['status', 'issued_date', 'due_date']
    search_fields = [
        'invoice_number', 'booking__user__email', 
        'booking__tour__name', 'booking__id'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at', 'invoice_number', 'issued_date']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Invoice Information', {
            'fields': ('invoice_number', 'booking', 'status', 'issued_date', 'due_date')
        }),
        ('Amount Details', {
            'fields': ('amount', 'tax_amount', 'total_amount')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def booking_info(self, obj):
        if obj.booking:
            return format_html(
                '<strong>Booking #{}</strong><br/>'
                '<small>User: {}</small><br/>'
                '<small>Tour: {}</small>',
                obj.booking.id,
                obj.booking.user.email if obj.booking.user else 'Anonymous',
                obj.booking.tour.name
            )
        return 'No booking'
    booking_info.short_description = 'Booking Details'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'booking', 'booking__user', 'booking__tour'
        )