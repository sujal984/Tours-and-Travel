from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Review
from .serializers import ReviewSerializer
from apps.core.response import APIResponse

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Use select_related to optimize database queries
        base_queryset = Review.objects.select_related('user', 'tour', 'tour__primary_destination')
        
        # For admin users, show all reviews
        if self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN':
            return base_queryset.all().order_by('-created_at')
        
        # For regular users and public, ONLY show verified reviews
        # This is a critical security filter - never show unverified reviews to customers
        # Multiple layers of filtering for extra security
        verified_queryset = base_queryset.filter(is_verified=True).exclude(is_verified=False)
        
        # If filtering by tour, add that filter too
        tour_id = self.request.query_params.get('tour')
        if tour_id:
            verified_queryset = verified_queryset.filter(tour_id=tour_id)
            
        return verified_queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return APIResponse.error(
                message="Authentication required to post a review",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
            
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return APIResponse.success(
                data=serializer.data,
                message="Review submitted successfully. It will be visible after verification.",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(
            message="Review submission failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def list(self, request, *args, **kwargs):
        """Override list to add cache-busting headers for customer reviews"""
        response = super().list(request, *args, **kwargs)
        
        # Add cache-busting headers for non-admin users to prevent stale review data
        if not (request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'ADMIN'):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
        return response

    def update(self, request, *args, **kwargs):
        # Allow admin to update review verification status
        if not request.user.is_authenticated or not (hasattr(request.user, 'role') and request.user.role == 'ADMIN'):
            return APIResponse.error(
                message="Admin access required",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            return APIResponse.success(
                data=serializer.data,
                message="Review updated successfully"
            )
        return APIResponse.error(
            message="Review update failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
