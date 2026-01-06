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
from apps.core.response import APIResponse
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

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'update', 'partial_update']:
            permission_classes = [IsAdminUser]
        elif self.action in ['retrieve', 'destroy']:
            permission_classes = [IsOwnerOrAdmin]
        else:  # create - allow anonymous submissions
            permission_classes = []
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter custom packages based on user role"""
        if self.request.user.is_admin:
            return CustomPackage.objects.select_related('customer').all()
        else:
            return CustomPackage.objects.filter(customer=self.request.user)

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


class InquiryViewSet(BaseViewSet):
    """ViewSet for managing inquiries"""
    serializer_class = InquirySerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'update', 'partial_update']:
            permission_classes = [IsAdminUser]
        elif self.action in ['retrieve', 'destroy']:
            permission_classes = [IsOwnerOrAdmin]
        else:  # create
            permission_classes = []  # Allow anonymous inquiries
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter inquiries based on user role"""
        if self.request.user.is_authenticated and self.request.user.is_admin:
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
            
            return APIResponse.success(
                data=serializer.data,
                message="Inquiry submitted successfully",
                status_code=status.HTTP_201_CREATED
            )
        else:
            return APIResponse.error(
                message="Inquiry submission failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )