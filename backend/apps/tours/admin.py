from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Destination, Tour, TourPackage, Hotel, Vehicle, 
    Offer, CustomPackage, Inquiry, Season, TourPricing,
    TourItinerary, DestinationImage
)


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'date_range_display', 'is_active', 'created_at']
    list_filter = ['is_active', 'start_month', 'end_month', 'start_date']
    search_fields = ['name', 'description']
    ordering = ['start_date']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Season Information', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Date Range', {
            'fields': ('start_month', 'end_month', 'start_date', 'end_date'),
            'description': 'Set both month numbers and specific dates for the season'
        }),
    )


class DestinationImageInline(admin.TabularInline):
    model = DestinationImage
    extra = 1
    fields = ['image', 'caption', 'is_featured', 'image_preview']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 100px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'is_active', 'tours_count', 'images_count', 'created_at']
    list_filter = ['is_active', 'country']
    search_fields = ['name', 'description', 'places', 'country']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['slug', 'created_at', 'updated_at']
    inlines = [DestinationImageInline]
    
    def tours_count(self, obj):
        return obj.tours.count()
    tours_count.short_description = 'Tours Count'
    
    def images_count(self, obj):
        return obj.images.count()
    images_count.short_description = 'Images'


@admin.register(DestinationImage)
class DestinationImageAdmin(admin.ModelAdmin):
    list_display = ['destination', 'caption', 'is_featured', 'image_preview', 'created_at']
    list_filter = ['is_featured', 'destination', 'created_at']
    search_fields = ['destination__name', 'caption']
    autocomplete_fields = ['destination']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 150px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'


class TourPricingInline(admin.TabularInline):
    model = TourPricing
    extra = 1
    fields = [
        'season', 'two_sharing_price', 'three_sharing_price', 'child_price', 
        'available_dates', 'includes_return_air', 'description'
    ]
    
    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.form.base_fields['available_dates'].help_text = 'Enter dates as JSON list: ["10", "17", "24"]'
        return formset


class TourPackageInline(admin.TabularInline):
    model = TourPackage
    extra = 1
    fields = ['name', 'package_type', 'price_modifier', 'max_participants', 'is_available']


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'primary_destination', 'destination_list', 'duration_days', 
        'base_price', 'max_capacity', 'category', 'difficulty_level', 
        'featured_image_preview', 'is_active', 'created_at'
    ]
    list_filter = [
        'is_active', 'category', 'difficulty_level', 'primary_destination', 
        'duration_days', 'created_at'
    ]
    search_fields = ['name', 'description', 'primary_destination__name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['slug', 'created_at', 'updated_at', 'average_rating', 'review_count', 'featured_image_preview']
    filter_horizontal = ['destinations']
    inlines = [TourPricingInline, TourPackageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'category', 'difficulty_level')
        }),
        ('Destinations', {
            'fields': ('primary_destination', 'destinations'),
            'description': 'Select primary destination and all destinations covered in this tour'
        }),
        ('Tour Details', {
            'fields': ('duration_days', 'max_capacity', 'base_price', 'is_active')
        }),
        ('Media', {
            'fields': ('featured_image', 'featured_image_preview', 'gallery_images'),
            'classes': ('collapse',)
        }),
        ('Tour Content', {
            'fields': ('inclusions', 'exclusions', 'itinerary'),
            'classes': ('collapse',)
        }),
        ('Brochure Details', {
            'fields': ('hotel_details', 'vehicle_details', 'pricing_details', 'special_notes'),
            'classes': ('collapse',),
            'description': 'Detailed information for brochure generation'
        }),
        ('Statistics', {
            'fields': ('average_rating', 'review_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def destination_list(self, obj):
        destinations = obj.destinations.all()[:3]  # Show first 3
        names = [dest.name for dest in destinations]
        if obj.destinations.count() > 3:
            names.append(f"... +{obj.destinations.count() - 3} more")
        return ", ".join(names)
    destination_list.short_description = 'All Destinations'
    
    def featured_image_preview(self, obj):
        if obj.featured_image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 80px;" />',
                obj.featured_image.url
            )
        return "No image"
    featured_image_preview.short_description = 'Image'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('primary_destination').prefetch_related('destinations')


@admin.register(TourPricing)
class TourPricingAdmin(admin.ModelAdmin):
    list_display = [
        'tour', 'season', 'two_sharing_price', 'three_sharing_price', 
        'child_price', 'includes_return_air', 'created_at'
    ]
    list_filter = ['season', 'tour__category', 'includes_return_air', 'created_at']
    search_fields = ['tour__name', 'season__name', 'description']
    autocomplete_fields = ['tour', 'season']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('tour', 'season', 'description')
        }),
        ('Pricing Details', {
            'fields': (
                'two_sharing_price', 'three_sharing_price', 'child_price',
                'includes_return_air'
            ),
            'description': 'Set detailed pricing for different accommodation types'
        }),
        ('Availability', {
            'fields': ('available_dates',),
            'description': 'Enter available dates as JSON list: ["10", "17", "24"]'
        }),
    )


@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'tour', 'package_type', 'price_modifier', 'total_price', 'max_participants', 'is_available']
    list_filter = ['package_type', 'is_available', 'tour__category']
    search_fields = ['name', 'tour__name']
    autocomplete_fields = ['tour']
    
    def total_price(self, obj):
        return f"₹{obj.total_price:,.2f}"
    total_price.short_description = 'Total Price'


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ['name', 'destination', 'hotel_type', 'star_rating', 'image_preview', 'is_active', 'created_at']
    list_filter = ['is_active', 'hotel_type', 'star_rating', 'destination']
    search_fields = ['name', 'address', 'destination__name']
    autocomplete_fields = ['destination']
    readonly_fields = ['image_preview']
    
    fieldsets = (
        ('Hotel Information', {
            'fields': ('name', 'destination', 'address', 'hotel_type', 'star_rating')
        }),
        ('Media', {
            'fields': ('image', 'image_preview')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 150px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Image Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('destination')


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['name', 'vehicle_no', 'vehicle_type', 'capacity', 'is_active', 'created_at']
    list_filter = ['is_active', 'vehicle_type', 'capacity']
    search_fields = ['name', 'vehicle_no', 'description']


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'discount_display', 'start_date', 'end_date', 
        'is_active', 'is_valid', 'applicable_tours_count', 'created_at'
    ]
    list_filter = ['is_active', 'start_date', 'end_date', 'created_at']
    search_fields = ['name', 'description']
    filter_horizontal = ['applicable_tours']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Offer Details', {
            'fields': ('name', 'description', 'discount_percentage')
        }),
        ('Validity Period', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Applicable Tours', {
            'fields': ('applicable_tours',),
            'description': 'Select tours where this offer can be applied'
        }),
    )
    
    def discount_display(self, obj):
        return f"{obj.discount_percentage}%"
    discount_display.short_description = 'Discount'
    
    def applicable_tours_count(self, obj):
        count = obj.applicable_tours.count()
        if count > 0:
            url = reverse('admin:tours_tour_changelist')
            return format_html(
                '<a href="{}?offers__id__exact={}">{} tours</a>',
                url, obj.id, count
            )
        return "0 tours"
    applicable_tours_count.short_description = 'Applicable Tours'
    
    def is_valid(self, obj):
        if obj.is_valid:
            return format_html('<span style="color: green;">✓ Valid</span>')
        return format_html('<span style="color: red;">✗ Expired</span>')
    is_valid.short_description = 'Status'


@admin.register(CustomPackage)
class CustomPackageAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'customer_name', 'destination', 'duration', 'participants_count',
        'status', 'quoted_price', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'start_date']
    search_fields = ['customer__email', 'destination', 'contact_number']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Customer Information', {
            'fields': ('customer', 'contact_number')
        }),
        ('Package Requirements', {
            'fields': (
                'destination', 'duration', 'start_date', 'participants_count',
                'hotel_preference', 'transportation_choice', 'package_type',
                'special_requirements', 'budget_range'
            )
        }),
        ('Admin Section', {
            'fields': ('status', 'admin_notes', 'quoted_price'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def customer_name(self, obj):
        return obj.customer.email if obj.customer else "Anonymous"
    customer_name.short_description = 'Customer'


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'tour', 'status', 'inquiry_date', 'created_at']
    list_filter = ['status', 'inquiry_date', 'created_at']
    search_fields = ['name', 'email', 'contact_number', 'tour__name', 'message']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'inquiry_date'
    
    fieldsets = (
        ('Customer Information', {
            'fields': ('name', 'email', 'contact_number', 'customer')
        }),
        ('Inquiry Details', {
            'fields': ('tour', 'inquiry_date', 'message')
        }),
        ('Response', {
            'fields': ('status', 'admin_response'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TourItinerary)
class TourItineraryAdmin(admin.ModelAdmin):
    list_display = ['tour', 'destination', 'day_number', 'title', 'created_at']
    list_filter = ['tour', 'destination', 'day_number']
    search_fields = ['title', 'description', 'tour__name', 'destination__name']
    ordering = ['tour', 'day_number']


# Admin site customization
admin.site.site_header = "Tours & Travels Admin"
admin.site.site_title = "Tours Admin"
admin.site.index_title = "Welcome to Tours & Travels Administration"
