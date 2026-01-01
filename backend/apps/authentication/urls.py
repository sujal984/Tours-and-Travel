"""
URL configuration for Authentication app
"""

from django.urls import path
from . import views

urlpatterns = [
    # Customer authentication
    path('login/', views.customer_login, name='customer-login'),
    path('register/', views.customer_register, name='customer-register'),
    
    # Admin authentication
    path('admin/login/', views.admin_login, name='admin-login'),
    
    # Common endpoints
    path('logout/', views.logout, name='logout'),
    path('verify/', views.verify_token, name='verify-token'),
    path('me/', views.me, name='me'),
]