"""
Serializers for Tours & Travels backend
"""

from rest_framework import serializers
from django.db import models
from .models import (
    Destination, Tour, TourPackage, Hotel, Vehicle, 
    Offer, CustomPackage, Inquiry, Season, TourPricing,
    TourItinerary, DestinationImage
)


class DestinationImageSerializer(serializers.ModelSerializer):
    """Serializer for DestinationImage model"""
    class Meta:
        model = DestinationImage
        fields = ['id', 'image', 'caption', 'is_featured']


class SeasonSerializer(serializers.ModelSerializer):
    """Serializer for Season model with date ranges"""
    date_range_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Season
        fields = [
            'id', 'name', 'start_month', 'end_month', 'start_date', 'end_date',
            'date_range_display', 'description', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TourPricingSerializer(serializers.ModelSerializer):
    """Serializer for TourPricing model with detailed breakdown"""
    tour_name = serializers.CharField(source='tour.name', read_only=True)
    season_details = SeasonSerializer(source='season', read_only=True)
    season_name = serializers.CharField(source='season.name', read_only=True)
    season_date_range = serializers.CharField(source='season.date_range_display', read_only=True)
    
    class Meta:
        model = TourPricing
        fields = [
            'id', 'tour', 'tour_name', 'season', 'season_details', 'season_name', 'season_date_range',
            'two_sharing_price', 'three_sharing_price', 'child_price', 
            'available_dates', 'includes_return_air', 'price', 'description', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_available_dates(self, value):
        """Validate that available dates are at least 10 days in advance"""
        if not value:
            return value
            
        from django.utils import timezone
        from datetime import timedelta
        import datetime
        
        min_booking_date = timezone.now().date() + timedelta(days=10)
        invalid_dates = []
        
        for date_str in value:
            try:
                # Handle both full date strings and day numbers
                if isinstance(date_str, str) and '-' in date_str:
                    # Full date string like "2026-01-29"
                    date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
                    if date_obj < min_booking_date:
                        invalid_dates.append(date_str)
                # For day numbers, we can't validate without season context
                # This will be handled at the tour level
            except (ValueError, TypeError):
                continue
        
        if invalid_dates:
            raise serializers.ValidationError(
                f"Tours must be bookable at least 10 days in advance. "
                f"Invalid dates: {', '.join(invalid_dates)}. "
                f"Minimum date: {min_booking_date.strftime('%Y-%m-%d')}"
            )
        
        return value


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


class HotelSerializer(serializers.ModelSerializer):
    """Serializer for Hotel model"""
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    destination_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Hotel
        fields = [
            'id', 'destination', 'destination_name', 'destination_display', 'name', 
            'address', 'image', 'hotel_type', 'star_rating', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'destination_name', 'created_at', 'updated_at']

    def get_destination_display(self, obj):
        """Get formatted destination display"""
        if obj.destination:
            return f"{obj.destination.name} ({obj.destination.country})" if obj.destination.country else obj.destination.name
        return "N/A"

    def validate_star_rating(self, value):
        """Validate star rating"""
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError(
                "Star rating must be between 1 and 5"
            )
        return value


class DestinationSerializer(serializers.ModelSerializer):
    """Serializer for Destination model"""
    images = DestinationImageSerializer(many=True, read_only=True)
    hotels = HotelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Destination
        fields = [
            'id', 'name', 'slug', 'description', 'places', 
            'country', 'images', 'hotels', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Create destination and handle image uploads"""
        destination = super().create(validated_data)
        self._handle_image_uploads(destination)
        return destination

    def update(self, instance, validated_data):
        """Update destination and handle image uploads"""
        destination = super().update(instance, validated_data)
        self._handle_image_uploads(destination)
        return destination

    def _handle_image_uploads(self, destination):
        """Handle image uploads from request context"""
        from .models import DestinationImage
        
        request = self.context.get('request')
        if not request:
            return

        # For updates, we need to handle image deletion
        # Keep track of existing images that should be preserved
        existing_image_ids_to_keep = []

        # Handle existing image updates - frontend sends existing_images[0], etc.
        existing_index = 0
        images_updated = 0
        while f'existing_images[{existing_index}]' in request.data:
            try:
                image_id = request.data.get(f'existing_images[{existing_index}]')
                caption = request.data.get(f'existing_captions[{existing_index}]', '')
                is_featured = request.data.get(f'existing_featured[{existing_index}]', False)
                
                # Convert string boolean to actual boolean
                if isinstance(is_featured, str):
                    is_featured = is_featured.lower() in ['true', '1', 'yes']
                
                image = DestinationImage.objects.get(id=image_id, destination=destination)
                image.caption = caption
                image.is_featured = is_featured
                image.save()
                images_updated += 1
                existing_image_ids_to_keep.append(image_id)
            except DestinationImage.DoesNotExist:
                pass
            except Exception as e:
                pass
            
            existing_index += 1

        # Delete images that are no longer in the form (not in existing_images list)
        if existing_index > 0:
            # User is keeping some existing images, delete the rest
            images_to_delete = destination.images.exclude(id__in=existing_image_ids_to_keep)
        elif image_index == 0:
            # No existing images to keep AND no new images being added - delete all
            images_to_delete = destination.images.all()
        else:
            # No existing images to keep BUT new images are being added - delete all existing
            images_to_delete = destination.images.all()
        
        deleted_count = images_to_delete.count()
        if deleted_count > 0:
            images_to_delete.delete()

        # Handle new image uploads - frontend sends images[0], images[1], etc.
        image_index = 0
        images_created = 0
        while f'images[{image_index}]' in request.FILES:
            try:
                uploaded_file = request.FILES[f'images[{image_index}]']
                caption = request.data.get(f'image_captions[{image_index}]', '')
                is_featured = request.data.get(f'image_featured[{image_index}]', False)
                
                # Convert string boolean to actual boolean
                if isinstance(is_featured, str):
                    is_featured = is_featured.lower() in ['true', '1', 'yes']

                image = DestinationImage.objects.create(
                    destination=destination,
                    image=uploaded_file,
                    caption=caption,
                    is_featured=is_featured
                )
                images_created += 1
            except Exception as e:
                pass
            
            image_index += 1


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
    primary_destination_name = serializers.CharField(source='primary_destination.name', read_only=True)
    destination_names = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    available_capacity = serializers.ReadOnlyField()
    current_price = serializers.SerializerMethodField()
    seasonal_pricings = TourPricingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Tour
        fields = [
            'id', 'name', 'slug', 'primary_destination_name', 'destination_names',
            'duration_days', 'max_capacity', 'base_price', 'current_price', 
            'available_dates', 'seasonal_pricings', 'featured_image', 'difficulty_level',
            'category', 'tour_type', 'average_rating', 'review_count', 'available_capacity',
            'is_active', 'created_at'
        ]

    def get_current_price(self, obj):
        """Get current price based on season"""
        return obj.get_current_price()


class TourDetailSerializer(serializers.ModelSerializer):
    """Serializer for Tour detail view (complete data)"""
    primary_destination = DestinationSerializer(read_only=True)
    destinations = DestinationSerializer(many=True, read_only=True)
    primary_destination_id = serializers.UUIDField(write_only=True)
    destination_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    offer_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    current_offer_ids = serializers.SerializerMethodField(read_only=True)
    packages = TourPackageSerializer(many=True, read_only=True)
    seasonal_pricings = TourPricingSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    available_capacity = serializers.ReadOnlyField()
    destination_names = serializers.ReadOnlyField()
    current_price = serializers.SerializerMethodField()
    active_offers = serializers.SerializerMethodField()
    available_dates = serializers.SerializerMethodField()
    
    def get_available_dates(self, obj):
        """Ensure available_dates is always returned as a list"""
        dates = obj.available_dates
        if isinstance(dates, str):
            try:
                import json
                return json.loads(dates)
            except (json.JSONDecodeError, TypeError):
                return []
        return dates if isinstance(dates, list) else []
    
    def validate_available_dates(self, value):
        """Validate that available dates are at least 10 days in advance"""
        if not value:
            return value
            
        from django.utils import timezone
        from datetime import timedelta
        import datetime
        
        min_booking_date = timezone.now().date() + timedelta(days=10)
        invalid_dates = []
        
        for date_str in value:
            try:
                if isinstance(date_str, str):
                    date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
                else:
                    date_obj = date_str
                    
                if date_obj < min_booking_date:
                    invalid_dates.append(date_str)
            except (ValueError, TypeError):
                continue
        
        if invalid_dates:
            raise serializers.ValidationError(
                f"Tours must be bookable at least 10 days in advance. "
                f"Invalid dates: {', '.join(invalid_dates)}. "
                f"Minimum date: {min_booking_date.strftime('%Y-%m-%d')}"
            )
        
        return value

    def validate_base_price(self, value):
        """Validate base_price field"""
        if value is None or value < 0:
            raise serializers.ValidationError("Base price must be a positive number")
        return value
    
    class Meta:
        model = Tour
        fields = [
            'id', 'name', 'slug', 'description', 'primary_destination', 'destinations',
            'primary_destination_id', 'destination_ids', 'destination_names',
            'duration_days', 'max_capacity', 'available_capacity', 'base_price',
            'current_price', 'active_offers', 'available_dates', 'featured_image', 'gallery_images', 
            'inclusions', 'exclusions', 'itinerary', 'difficulty_level', 'category', 'tour_type',
            'packages', 'seasonal_pricings', 'average_rating', 'review_count', 'is_active',
            'hotel_details', 'vehicle_details', 'pricing_details', 'special_notes', 'offer_ids', 'current_offer_ids',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_current_price(self, obj):
        """Get current price based on season"""
        return obj.get_current_price()

    def get_current_offer_ids(self, obj):
        """Get currently associated offer IDs"""
        return list(obj.offers.values_list('id', flat=True))

    def get_active_offers(self, obj):
        """Get currently valid offers for the tour"""
        from django.utils import timezone
        today = timezone.now().date()
        
        # Get offers specifically associated with this tour
        specific_offers = obj.offers.filter(
            start_date__lte=today,
            end_date__gte=today,
            is_active=True
        )
        
        # Get offers that apply to all tours (no specific tour associations)
        from .models import Offer
        all_tours_offers = Offer.objects.filter(
            start_date__lte=today,
            end_date__gte=today,
            is_active=True,
            applicable_tours__isnull=True  # No specific tours = applies to all
        )
        
        # Get IDs from both querysets and create a single query
        specific_ids = list(specific_offers.values_list('id', flat=True))
        all_tours_ids = list(all_tours_offers.values_list('id', flat=True))
        
        # Combine IDs and remove duplicates
        combined_ids = list(set(specific_ids + all_tours_ids))
        
        # Get all offers with combined IDs
        if combined_ids:
            all_offers = Offer.objects.filter(id__in=combined_ids).order_by('-start_date')
            return OfferSerializer(all_offers, many=True).data
        else:
            return []

    def to_internal_value(self, data):
        """
        Handle multipart/form-data requests where nested data is stringified
        """
        # Convert QueryDict to standard dict to avoid coercion issues and ensure mutable
        if hasattr(data, 'dict'):
             data = data.dict()
        elif hasattr(data, 'copy'):
             data = data.copy()
        
        # Fields that might be JSON strings
        json_fields = [
            'destination_ids', 'offer_ids', 'inclusions', 'exclusions', 'itinerary',
            'gallery_images', 'hotel_details', 'vehicle_details', 'pricing_details'
        ]
        
        import json
        
        for field in json_fields:
            if field in data and isinstance(data[field], str):
                try:
                    # Only attempt to parse if it looks like JSON
                    value = data[field].strip()
                    if (value.startswith('{') and value.endswith('}')) or \
                       (value.startswith('[') and value.endswith(']')):
                        data[field] = json.loads(value)
                except json.JSONDecodeError:
                    # If parsing fails, leave it as is - validation will likely fail later
                    pass
                    
        return super().to_internal_value(data)

    def create(self, validated_data):
        """Create tour with multiple destinations and offers"""
        destination_ids = validated_data.pop('destination_ids', [])
        primary_destination_id = validated_data.pop('primary_destination_id', None)
        offer_ids = validated_data.pop('offer_ids', [])
        
        # Set primary destination
        if primary_destination_id:
            validated_data['primary_destination_id'] = primary_destination_id
            
        tour = super().create(validated_data)
        
        if destination_ids:
            tour.destinations.set(destination_ids)
            
        # Set offers
        if offer_ids:
            from .models import Offer
            offers = Offer.objects.filter(id__in=offer_ids)
            for offer in offers:
                offer.applicable_tours.add(tour)
        
        return tour

    def update(self, instance, validated_data):
        """Update tour with multiple destinations and offers"""
        destination_ids = validated_data.pop('destination_ids', None)
        primary_destination_id = validated_data.pop('primary_destination_id', None)
        offer_ids = validated_data.pop('offer_ids', None)
        
        # Set primary destination
        if primary_destination_id:
            validated_data['primary_destination_id'] = primary_destination_id
            
        tour = super().update(instance, validated_data)
        
        if destination_ids is not None:
            tour.destinations.set(destination_ids)
            
        # Update offers
        if offer_ids is not None:
            from .models import Offer
            # Clear existing offers for this tour
            existing_offers = Offer.objects.filter(applicable_tours=tour)
            for offer in existing_offers:
                offer.applicable_tours.remove(tour)
            
            # Add new offers
            if offer_ids:
                offers = Offer.objects.filter(id__in=offer_ids)
                for offer in offers:
                    offer.applicable_tours.add(tour)
        
        return tour

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
    discount_display = serializers.ReadOnlyField()
    applicable_tours = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'description', 'discount_type', 'discount_percentage', 
            'discount_amount', 'discount_display', 'start_date', 'end_date', 
            'is_active', 'is_valid', 'applicable_tours', 'applicable_tours_count', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_applicable_tours_count(self, obj):
        """Get count of applicable tours"""
        return obj.applicable_tours.count()

    def validate(self, data):
        """Validate offer data based on discount type"""
        discount_type = data.get('discount_type', 'PERCENTAGE')
        discount_percentage = data.get('discount_percentage')
        discount_amount = data.get('discount_amount')
        
        if discount_type == 'PERCENTAGE':
            if not discount_percentage:
                raise serializers.ValidationError({
                    'discount_percentage': 'Discount percentage is required for percentage-based offers.'
                })
            if discount_percentage < 0 or discount_percentage > 100:
                raise serializers.ValidationError({
                    'discount_percentage': 'Discount percentage must be between 0 and 100.'
                })
            # Clear discount_amount for percentage offers
            data['discount_amount'] = None
            
        elif discount_type == 'FIXED_AMOUNT':
            if not discount_amount:
                raise serializers.ValidationError({
                    'discount_amount': 'Discount amount is required for fixed amount offers.'
                })
            if discount_amount < 0:
                raise serializers.ValidationError({
                    'discount_amount': 'Discount amount must be greater than 0.'
                })
            # Clear discount_percentage for fixed amount offers
            data['discount_percentage'] = None
        
        # Validate dates
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date.'
                })
        
        return data

    def create(self, validated_data):
        """Create offer and associate with tours"""
        applicable_tours = validated_data.pop('applicable_tours', [])
        offer = super().create(validated_data)
        
        # Associate with tours if provided
        if applicable_tours:
            from .models import Tour
            tours = Tour.objects.filter(id__in=applicable_tours)
            offer.applicable_tours.set(tours)
        
        return offer

    def update(self, instance, validated_data):
        """Update offer and manage tour associations"""
        applicable_tours = validated_data.pop('applicable_tours', None)
        offer = super().update(instance, validated_data)
        
        # Update tour associations if provided
        if applicable_tours is not None:
            from .models import Tour
            if applicable_tours:
                tours = Tour.objects.filter(id__in=applicable_tours)
                offer.applicable_tours.set(tours)
            else:
                # Clear all associations if empty list provided
                offer.applicable_tours.clear()
        
        return offer


class CustomPackageSerializer(serializers.ModelSerializer):
    """Serializer for CustomPackage model"""
    # Display fields for list view
    customer_display_name = serializers.ReadOnlyField()
    customer_display_email = serializers.ReadOnlyField()
    
    # Input fields for anonymous submissions
    customer_name_input = serializers.CharField(max_length=100, required=False, write_only=True)
    customer_email_input = serializers.EmailField(required=False, write_only=True)
    
    class Meta:
        model = CustomPackage
        fields = [
            'id', 'customer', 'customer_name', 'customer_email', 
            'customer_display_name', 'customer_display_email',
            'customer_name_input', 'customer_email_input',
            'contact_number', 'from_city', 'destination', 'duration', 'total_nights', 'start_date', 'participants_count', 
            'hotel_preference', 'room_type', 'transportation_choice', 'package_type', 'special_requirements',
            'budget_range', 'detailed_itinerary', 'status', 'admin_notes', 'admin_response', 'quoted_price',
            'customer_response', 'customer_response_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'customer_name', 'customer_email', 'created_at', 'updated_at']

    def validate_start_date(self, value):
        """Validate start date is in the future"""
        from django.utils import timezone
        if value <= timezone.now().date():
            raise serializers.ValidationError(
                "Start date must be in the future"
            )
        return value

    def validate_budget_range(self, value):
        """Validate budget range is from allowed choices"""
        if value and value not in [choice[0] for choice in CustomPackage.BUDGET_CHOICES]:
            raise serializers.ValidationError(
                f"Invalid budget range. Must be one of: {[choice[0] for choice in CustomPackage.BUDGET_CHOICES]}"
            )
        return value

    def create(self, validated_data):
        """Handle creation for both authenticated and anonymous users"""
        # Handle anonymous user data
        customer_name_input = validated_data.pop('customer_name_input', None)
        customer_email_input = validated_data.pop('customer_email_input', None)
        
        # If user is not authenticated, store the input data
        if not validated_data.get('customer'):
            if customer_name_input:
                validated_data['customer_name'] = customer_name_input
            if customer_email_input:
                validated_data['customer_email'] = customer_email_input
        
        return super().create(validated_data)


class InquirySerializer(serializers.ModelSerializer):
    """Serializer for Inquiry model"""
    tour_name = serializers.CharField(source='tour.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    anonymous_token = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Inquiry
        fields = [
            'id', 'tour', 'tour_name', 'customer', 'customer_email',
            'name', 'email', 'contact_number', 'inquiry_date',
            'message', 'status', 'admin_response', 'anonymous_token',
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

    def create(self, validated_data):
        """Create inquiry and handle anonymous token"""
        anonymous_token = validated_data.pop('anonymous_token', None)
        
        # If no anonymous token provided, generate one for guest users
        if not validated_data.get('customer') and not anonymous_token:
            import uuid
            anonymous_token = str(uuid.uuid4())
        
        inquiry = super().create(validated_data)
        
        # Set anonymous token if provided or generated
        if anonymous_token:
            inquiry.anonymous_token = anonymous_token
            inquiry.save()
        
        return inquiry


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