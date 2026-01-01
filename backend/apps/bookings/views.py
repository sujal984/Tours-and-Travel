from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Booking
from .serializers import BookingSerializer
from apps.core.response import APIResponse
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer
import logging

logger = logging.getLogger(__name__)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin:
            return Booking.objects.select_related('tour', 'user').all()
        return Booking.objects.filter(user=self.request.user).select_related('tour')

    def perform_create(self, serializer):
        # Enhanced price calculation logic
        tour = serializer.validated_data.get('tour')
        package = serializer.validated_data.get('package')
        count = serializer.validated_data.get('travelers_count', 1)
        
        base_price = tour.base_price
        if package:
            base_price += package.price_modifier
            
        total_price = base_price * count
        
        # Log booking creation
        logger.info(f"Creating booking for user {self.request.user.email}, tour {tour.name}, price {total_price}")
        
        serializer.save(user=self.request.user, total_price=total_price)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return APIResponse.success(
                data=serializer.data,
                message="Booking created successfully",
                status_code=status.HTTP_201_CREATED
            )
        
        # Log validation errors for debugging
        logger.error(f"Booking validation errors: {serializer.errors}")
        logger.error(f"Request data: {request.data}")
        
        return APIResponse.error(
            message="Booking creation failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        if not booking.can_cancel:
            return APIResponse.error(
                message="This booking cannot be cancelled",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'CANCELLED'
        booking.save()
        
        logger.info(f"Booking {booking.id} cancelled by user {request.user.email}")
        
        return APIResponse.success(
            data=BookingSerializer(booking).data,
            message="Booking cancelled successfully"
        )

    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """Add a review for a completed booking"""
        booking = self.get_object()
        
        if not booking.can_review:
            return APIResponse.error(
                message="You can only review completed bookings",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already reviewed this tour
        existing_review = Review.objects.filter(user=request.user, tour=booking.tour).first()
        if existing_review:
            return APIResponse.error(
                message="You have already reviewed this tour",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        review_data = request.data.copy()
        review_data['tour'] = booking.tour.id
        
        review_serializer = ReviewSerializer(data=review_data)
        if review_serializer.is_valid():
            review_serializer.save(user=request.user)
            
            logger.info(f"Review added by user {request.user.email} for tour {booking.tour.name}")
            
            return APIResponse.success(
                data=review_serializer.data,
                message="Review submitted successfully. It will be visible after verification."
            )
        
        return APIResponse.error(
            message="Review submission failed",
            errors=review_serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
