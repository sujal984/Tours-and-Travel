"""
URL configuration for Users app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]