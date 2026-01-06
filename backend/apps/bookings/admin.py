from django.contrib import admin
from django.utils.html import format_html
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'customer_info', 'tour_info', 'travelers_count', 
        'total_price', 'travel_date', 'status', 'booking_date'
    ]
    list_filter = ['status', 'booking_date', 'travel_date']
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name',
        'tour__name', 'id'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at', 'booking_date']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('user', 'tour', 'package', 'travelers_count', 'total_price')
        }),
        ('Travel Details', {
            'fields': ('travel_date', 'status', 'special_requests')
        }),
        ('Traveler Information', {
            'fields': ('traveler_details', 'contact_number', 'emergency_contact')
        }),
        ('System Information', {
            'fields': ('id', 'booking_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def customer_info(self, obj):
        if obj.user:
            full_name = obj.user.get_full_name()
            display_name = full_name if full_name.strip() else obj.user.username
            return format_html(
                '<strong>{}</strong><br/>'
                '<small>{}</small>',
                display_name,
                obj.user.email
            )
        return format_html('<em>No Customer</em>')
    customer_info.short_description = 'Customer'
    customer_info.admin_order_field = 'user__email'

    def tour_info(self, obj):
        if obj.tour:
            return format_html(
                '<strong>{}</strong><br/>'
                '<small>₹{} per person</small>',
                obj.tour.name,
                obj.tour.base_price
            )
        return format_html('<em>No Tour</em>')
    tour_info.short_description = 'Tour'
    tour_info.admin_order_field = 'tour__name'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'tour', 'package'
        )