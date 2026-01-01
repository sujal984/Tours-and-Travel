"""
URL configuration for tours app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    DestinationViewSet, TourViewSet, TourPackageViewSet,
    HotelViewSet, VehicleViewSet, OfferViewSet,
    CustomPackageViewSet, InquiryViewSet, SeasonViewSet,
    TourPricingViewSet, TourItineraryViewSet
)

# Create main router for non-tour resources
router = DefaultRouter()
router.register(r'destinations', DestinationViewSet, basename='destination')
router.register(r'hotels', HotelViewSet, basename='hotel')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'offers', OfferViewSet, basename='offer')
router.register(r'custom-packages', CustomPackageViewSet, basename='custompackage')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')
router.register(r'seasons', SeasonViewSet, basename='season')
router.register(r'pricings', TourPricingViewSet, basename='pricing')
router.register(r'itineraries', TourItineraryViewSet, basename='itinerary')

app_name = 'tours'

urlpatterns = [
    # Tour-specific endpoints (at root level to maintain /api/v1/tours/ for tour list)
    path('', TourViewSet.as_view({'get': 'list', 'post': 'create'}), name='tour-list'),
    path('<uuid:pk>/', TourViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='tour-detail'),
    path('<uuid:tour_pk>/packages/', TourPackageViewSet.as_view({'get': 'list', 'post': 'create'}), name='tour-packages-list'),
    path('<uuid:tour_pk>/packages/<uuid:pk>/', TourPackageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='tour-packages-detail'),
    path('search/', TourViewSet.as_view({'get': 'search'}), name='tour-search'),
    
    # Other resources
    path('', include(router.urls)),
]