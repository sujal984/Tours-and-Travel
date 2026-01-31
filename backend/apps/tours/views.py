"""
Views for Tours & Travels backend
"""

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg
from django.db import transaction
from apps.core.viewsets import BaseViewSet
from apps.core.permissions import IsAdminUser, IsCustomerUser, IsOwnerOrAdmin
from rest_framework.permissions import IsAuthenticated
from apps.core.response import APIResponse
from apps.core.pagination import NoPagination, AdminListPagination
import logging

logger = logging.getLogger(__name__)
from .models import (
    Destination, Tour, TourPackage, Hotel, Vehicle,
    Offer, CustomPackage, Inquiry, Season, TourPricing,
    TourItinerary
)
from .serializers import (
    DestinationSerializer, TourListSerializer, TourDetailSerializer,
    TourPackageSerializer, HotelSerializer, VehicleSerializer,
    OfferSerializer, CustomPackageSerializer, InquirySerializer,
    TourSearchSerializer, SeasonSerializer, TourPricingSerializer,
    TourItinerarySerializer
)
import logging

logger = logging.getLogger('apps.tours')


class SeasonViewSet(BaseViewSet):
    """ViewSet for managing seasons"""
    queryset = Season.objects.all()
    serializer_class = SeasonSerializer
    pagination_class = NoPagination  # No pagination for dropdown lists

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]


class TourPricingViewSet(BaseViewSet):
    """ViewSet for managing tour pricings"""
    queryset = TourPricing.objects.select_related('tour', 'season').all()
    serializer_class = TourPricingSerializer
    pagination_class = AdminListPagination

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]


class TourItineraryViewSet(BaseViewSet):
    """ViewSet for managing itineraries"""
    queryset = TourItinerary.objects.select_related('destination', 'tour').all()
    serializer_class = TourItinerarySerializer
    pagination_class = NoPagination  # No pagination for dropdown lists

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]


class DestinationViewSet(BaseViewSet):
    """ViewSet for managing destinations"""
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    pagination_class = NoPagination  # No pagination for dropdown lists

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter active destinations for non-admin users"""
        queryset = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('name')


class TourViewSet(BaseViewSet):
    """ViewSet for managing tours"""
    queryset = Tour.objects.select_related('primary_destination').prefetch_related('destinations', 'packages', 'seasonal_pricings__season')
    pagination_class = AdminListPagination  # Use admin pagination for tours

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return TourListSerializer
        return TourDetailSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []  # Allow anonymous access for list and retrieve
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter active tours for non-admin users"""
        queryset = super().get_queryset()
        
        # Filter active tours for non-admin users
        if not (self.request.user.is_authenticated and getattr(self.request.user, 'is_admin', False)):
            queryset = queryset.filter(is_active=True)
        
        return queryset

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced tour search endpoint"""
        serializer = TourSearchSerializer(data=request.query_params)
        
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid search parameters",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        search_params = serializer.validated_data
        queryset = self.get_queryset()

        # Apply search filters
        if search_params.get('search'):
            search_term = search_params['search']
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(primary_destination__name__icontains=search_term) |
                Q(destinations__name__icontains=search_term)
            ).distinct()

        if search_params.get('destination'):
            queryset = queryset.filter(
                Q(primary_destination__name__icontains=search_params['destination']) |
                Q(destinations__name__icontains=search_params['destination'])
            ).distinct()

        if search_params.get('category'):
            queryset = queryset.filter(category=search_params['category'])

        if search_params.get('difficulty'):
            queryset = queryset.filter(difficulty_level=search_params['difficulty'])

        if search_params.get('min_price'):
            queryset = queryset.filter(base_price__gte=search_params['min_price'])

        if search_params.get('max_price'):
            queryset = queryset.filter(base_price__lte=search_params['max_price'])

        if search_params.get('min_duration'):
            queryset = queryset.filter(duration_days__gte=search_params['min_duration'])

        if search_params.get('max_duration'):
            queryset = queryset.filter(duration_days__lte=search_params['max_duration'])

        # Apply sorting
        sort_by = search_params.get('sort_by', 'name')
        sort_order = search_params.get('sort_order', 'asc')
        
        if sort_by == 'rating':
            # Sort by average rating (requires annotation)
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by(
                f"{'-' if sort_order == 'desc' else ''}avg_rating"
            )
        else:
            order_field = sort_by
            if sort_by == 'price':
                order_field = 'base_price'
            elif sort_by == 'duration':
                order_field = 'duration_days'
            
            queryset = queryset.order_by(
                f"{'-' if sort_order == 'desc' else ''}{order_field}"
            )

        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TourListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TourListSerializer(queryset, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Tours retrieved successfully"
        )

    @action(detail=True, methods=['get'])
    def packages(self, request, pk=None):
        """Get packages for a specific tour"""
        tour = self.get_object()
        packages = tour.packages.filter(is_available=True)
        serializer = TourPackageSerializer(packages, many=True)
        
        return APIResponse.success(
            data=serializer.data,
            message="Tour packages retrieved successfully"
        )

    @action(detail=True, methods=['get'])
    def pricing(self, request, pk=None):
        """Get seasonal pricing for a specific tour"""
        tour = self.get_object()
        pricings = tour.seasonal_pricings.select_related('season').all()
        serializer = TourPricingSerializer(pricings, many=True)
        
        return APIResponse.success(
            data=serializer.data,
            message="Tour pricing retrieved successfully"
        )

    @action(detail=True, methods=['get'])
    def destinations(self, request, pk=None):
        """Get all destinations for a specific tour"""
        tour = self.get_object()
        destinations = tour.destinations.filter(is_active=True)
        serializer = DestinationSerializer(destinations, many=True)
        
        return APIResponse.success(
            data=serializer.data,
            message="Tour destinations retrieved successfully"
        )

    def create(self, request, *args, **kwargs):
        """Create a new tour"""
        logger.debug(f"Admin {request.user.email} creating new tour")
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                tour = serializer.save()
                logger.info(f"Tour created successfully: {tour.name}")
                
                return APIResponse.success(
                    data=serializer.data,
                    message="Tour created successfully",
                    status_code=status.HTTP_201_CREATED
                )
        else:
            return APIResponse.error(
                message="Tour creation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )


class TourPackageViewSet(BaseViewSet):
    """ViewSet for managing tour packages"""
    serializer_class = TourPackageSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Get packages for a specific tour"""
        tour_id = self.kwargs.get('tour_pk')
        if tour_id:
            queryset = TourPackage.objects.filter(tour_id=tour_id)
            if not (self.request.user.is_authenticated and self.request.user.is_admin):
                queryset = queryset.filter(is_available=True)
            return queryset.select_related('tour')
        return TourPackage.objects.none()

    def create(self, request, *args, **kwargs):
        """Create a new tour package"""
        tour_id = self.kwargs.get('tour_pk')
        if not tour_id:
            return APIResponse.error(
                message="Tour ID is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            tour = Tour.objects.get(id=tour_id)
        except Tour.DoesNotExist:
            return APIResponse.error(
                message="Tour not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                package = serializer.save(tour=tour)
                logger.info(f"Package created for tour {tour.name}: {package.name}")
                
                return APIResponse.success(
                    data=serializer.data,
                    message="Tour package created successfully",
                    status_code=status.HTTP_201_CREATED
                )
        else:
            return APIResponse.error(
                message="Package creation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )


class HotelViewSet(BaseViewSet):
    """ViewSet for managing hotels"""
    queryset = Hotel.objects.select_related('destination')
    serializer_class = HotelSerializer
    pagination_class = NoPagination  # No pagination for dropdown lists

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter active hotels for non-admin users"""
        queryset = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('name')


class VehicleViewSet(BaseViewSet):
    """ViewSet for managing vehicles"""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    pagination_class = NoPagination  # No pagination for dropdown lists

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter active vehicles for non-admin users"""
        queryset = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('name')


class OfferViewSet(BaseViewSet):
    """ViewSet for managing offers"""
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter active offers for non-admin users"""
        queryset = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('-start_date')

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get currently valid offers"""
        from django.utils import timezone
        today = timezone.now().date()
        
        offers = self.get_queryset().filter(
            start_date__lte=today,
            end_date__gte=today,
            is_active=True
        )
        
        serializer = self.get_serializer(offers, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Current offers retrieved successfully"
        )


class CustomPackageViewSet(BaseViewSet):
    """ViewSet for managing custom packages"""
    serializer_class = CustomPackageSerializer
    pagination_class = AdminListPagination  # Use admin pagination for custom packages

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['update', 'partial_update', 'convert_to_booking']:
            permission_classes = [IsAdminUser]
        elif self.action in ['list', 'retrieve', 'destroy', 'customer_response']:
            permission_classes = [IsAuthenticated]  # Allow authenticated users to see their own packages
        elif self.action == 'create':
            permission_classes = []  # Allow anonymous submissions
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter custom packages based on user role"""
        if self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN':
            return CustomPackage.objects.select_related('customer').all()
        elif self.request.user.is_authenticated:
            return CustomPackage.objects.filter(customer=self.request.user)
        else:
            return CustomPackage.objects.none()

    def create(self, request, *args, **kwargs):
        """Create a new custom package request"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Set customer if user is authenticated, otherwise allow anonymous
            customer = request.user if request.user.is_authenticated else None
            package = serializer.save(customer=customer)
            logger.info(f"Custom package request created by {request.user.email if request.user.is_authenticated else 'anonymous user'}")
            
            return APIResponse.success(
                data=serializer.data,
                message="Custom package request submitted successfully",
                status_code=status.HTTP_201_CREATED
            )
        else:
            # Log validation errors for debugging
            logger.error(f"Custom package validation errors: {serializer.errors}")
            logger.error(f"Request data: {request.data}")
            
            return APIResponse.error(
                message="Custom package request failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def customer_response(self, request, pk=None):
        """Allow customer to respond to admin quote"""
        from django.utils import timezone
        
        custom_package = self.get_object()
        
        # Check if customer can respond (must have a quote and be the owner)
        if not custom_package.quoted_price:
            return APIResponse.error(
                message="No quote available to respond to",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if custom_package.customer_response != 'PENDING':
            return APIResponse.error(
                message="You have already responded to this quote",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        response_type = request.data.get('response')
        if response_type not in ['ACCEPTED', 'REJECTED']:
            return APIResponse.error(
                message="Response must be either 'ACCEPTED' or 'REJECTED'",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                custom_package.customer_response = response_type
                custom_package.customer_response_date = timezone.now()
                
                # Update status based on response
                if response_type == 'ACCEPTED':
                    custom_package.status = 'CONFIRMED'
                else:
                    custom_package.status = 'CANCELLED'
                
                custom_package.save()
                
                logger.info(f"Customer response recorded for package #{custom_package.id}: {response_type}")
                
                return APIResponse.success(
                    data={
                        'id': custom_package.id,
                        'customer_response': custom_package.customer_response,
                        'status': custom_package.status,
                        'customer_response_date': custom_package.customer_response_date
                    },
                    message=f"Quote {response_type.lower()} successfully",
                    status_code=status.HTTP_200_OK
                )
        except Exception as e:
            logger.error(f"Error recording customer response: {str(e)}")
            return APIResponse.error(
                message="Failed to record response",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def convert_to_booking(self, request, pk=None):
        """Convert a confirmed custom package to a booking"""
        from apps.bookings.models import Booking
        from apps.bookings.serializers import BookingSerializer
        
        custom_package = self.get_object()
        
        if custom_package.status != 'CONFIRMED':
            return APIResponse.error(
                message="Only confirmed custom packages can be converted to bookings",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Get tour_id from request data
        tour_id = request.data.get('tour_id')
        if not tour_id:
            return APIResponse.error(
                message="Tour ID is required for booking conversion",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from apps.tours.models import Tour
            tour = Tour.objects.get(id=tour_id)
        except Tour.DoesNotExist:
            return APIResponse.error(
                message="Tour not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Create booking data from custom package
        booking_data = {
            'user': custom_package.customer,
            'tour': tour,
            'travelers_count': custom_package.participants_count,
            'total_price': custom_package.quoted_price or 0,
            'travel_date': custom_package.start_date,
            'special_requests': custom_package.special_requirements,
            'contact_number': custom_package.contact_number,
            'traveler_details': []  # Can be filled later
        }
        
        try:
            with transaction.atomic():
                booking = Booking.objects.create(**booking_data)
                
                # Update custom package status
                custom_package.status = 'PROCESSING'
                custom_package.admin_notes = f"Converted to booking #{booking.id}"
                custom_package.save()
                
                logger.info(f"Custom package #{custom_package.id} converted to booking #{booking.id}")
                
                return APIResponse.success(
                    data={'booking_id': booking.id, 'custom_package_id': custom_package.id},
                    message="Custom package converted to booking successfully",
                    status_code=status.HTTP_201_CREATED
                )
        except Exception as e:
            logger.error(f"Error converting custom package to booking: {str(e)}")
            return APIResponse.error(
                message="Failed to convert custom package to booking",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InquiryViewSet(BaseViewSet):
    """ViewSet for managing inquiries"""
    serializer_class = InquirySerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['update', 'partial_update', 'admin_response']:
            permission_classes = [IsAdminUser]
        elif self.action in ['list', 'retrieve', 'destroy', 'associate_anonymous']:
            permission_classes = [IsAuthenticated]  # Allow authenticated users to see their own inquiries
        else:  # create
            permission_classes = []  # Allow anonymous inquiries
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter inquiries based on user role"""
        if self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN':
            return Inquiry.objects.select_related('tour', 'customer').all()
        elif self.request.user.is_authenticated:
            return Inquiry.objects.filter(customer=self.request.user)
        else:
            return Inquiry.objects.none()

    def create(self, request, *args, **kwargs):
        """Create a new inquiry"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Set customer if user is authenticated
            customer = request.user if request.user.is_authenticated else None
            inquiry = serializer.save(customer=customer)
            
            logger.info(f"Inquiry created: {inquiry.name} - {inquiry.email}")
            
            # Return inquiry data with anonymous_token for guest users
            response_data = serializer.data
            if not customer and inquiry.anonymous_token:
                response_data['anonymous_token'] = inquiry.anonymous_token
            
            return APIResponse.success(
                data=response_data,
                message="Inquiry submitted successfully",
                status_code=status.HTTP_201_CREATED
            )
        else:
            return APIResponse.error(
                message="Inquiry submission failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def associate_anonymous(self, request):
        """Associate anonymous inquiries with logged-in user"""
        anonymous_tokens = request.data.get('anonymous_tokens', [])
        
        if not anonymous_tokens:
            return APIResponse.error(
                message="No anonymous tokens provided",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Find inquiries with matching anonymous tokens
                # Match by token OR by email (for cases where user used same email)
                inquiries = Inquiry.objects.filter(
                    Q(anonymous_token__in=anonymous_tokens) | 
                    Q(email=request.user.email, customer__isnull=True),
                    customer__isnull=True  # Only unassociated inquiries
                )
                
                updated_count = inquiries.update(
                    customer=request.user,
                    anonymous_token=None  # Clear token after association
                )
                
                logger.info(f"Associated {updated_count} anonymous inquiries with user {request.user.email}")
                
                # Get the updated inquiries to return
                associated_inquiries = Inquiry.objects.filter(
                    customer=request.user
                ).order_by('-created_at')
                
                serializer = self.get_serializer(associated_inquiries, many=True)
                
                return APIResponse.success(
                    data={
                        'associated_count': updated_count,
                        'inquiries': serializer.data
                    },
                    message=f"Successfully associated {updated_count} inquiries with your account",
                    status_code=status.HTTP_200_OK
                )
                
        except Exception as e:
            logger.error(f"Error associating anonymous inquiries: {str(e)}")
            return APIResponse.error(
                message="Failed to associate inquiries",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def admin_response(self, request, pk=None):
        """Allow admin to respond to an inquiry"""
        inquiry = self.get_object()
        
        admin_response = request.data.get('admin_response', '').strip()
        if not admin_response:
            return APIResponse.error(
                message="Admin response is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                inquiry.admin_response = admin_response
                inquiry.status = 'RESPONDED'
                inquiry.save()
                
                logger.info(f"Admin {request.user.email} responded to inquiry #{inquiry.id}")
                
                serializer = self.get_serializer(inquiry)
                
                return APIResponse.success(
                    data=serializer.data,
                    message="Response added successfully",
                    status_code=status.HTTP_200_OK
                )
                
        except Exception as e:
            logger.error(f"Error adding admin response: {str(e)}")
            return APIResponse.error(
                message="Failed to add response",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )