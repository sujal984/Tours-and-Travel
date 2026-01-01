from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone


class APIVersionView(APIView):
    """API version information endpoint - no authentication required"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get API version information"""
        return Response({
            'version': 'v1',
            'name': 'Tours & Travels API',
            'description': 'RESTful API for Tours & Travels management system',
            'timestamp': timezone.now(),
            'endpoints': {
                'authentication': '/api/v1/auth/',
                'tours': '/api/v1/tours/',
                'users': '/api/v1/users/',
                'bookings': '/api/v1/bookings/',
            },
            'documentation': '/api/v1/docs/',
        })


urlpatterns = [
    # API version information
    path('', APIVersionView.as_view(), name='api-version-info'),
    
    # API endpoints
    path("tours/", include("apps.tours.urls")),
    path("auth/", include("apps.authentication.urls")),
    path("users/", include("apps.users.urls")),
    path("bookings/", include("apps.bookings.urls")),
    path("payments/", include("apps.payments.urls")),
    path("reviews/", include("apps.reviews.urls")),
]
