"""
Authentication views for Tours & Travels backend
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import login
from django.utils import timezone
from apps.core.response import APIResponse
from apps.users.serializers import UserProfileSerializer
from .serializers import (
    LoginSerializer, 
    RegisterSerializer, 
    AdminLoginSerializer,
    TokenResponseSerializer
)
import logging


logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_login(request):
    """
    Customer login endpoint
    Returns JWT access token for authenticated customers
    """
    logger.debug(f"Customer login attempt from IP: {request.META.get('REMOTE_ADDR')}")
    
    serializer = LoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Check if user is customer
        if hasattr(user, 'role') and user.role != 'CUSTOMER':
            logger.warning(f"Non-customer login attempt: {user.email}")
            return APIResponse.error(
                message="Access denied. Customer account required.",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Generate JWT token
        access_token = AccessToken.for_user(user)
        
        # Add custom claims
        access_token['role'] = user.role
        access_token['email'] = user.email
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Prepare response data
        token_data = {
            'access_token': str(access_token),
            'token_type': 'Bearer',
            'expires_in': 3600,  # 1 hour in seconds
            'user': UserProfileSerializer(user).data
        }
        
        logger.info(f"Successful customer login: {user.email}")
        
        return APIResponse.success(
            data=token_data,
            message="Login successful"
        )
    
    else:
        logger.warning(f"Failed login attempt from IP: {request.META.get('REMOTE_ADDR')}")
        return APIResponse.error(
            message="Login failed",
            errors=serializer.errors,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Admin login endpoint
    Returns JWT access token for authenticated admin users
    """
    logger.info(f"Admin login attempt from IP: {request.META.get('REMOTE_ADDR')}")
    
    serializer = AdminLoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT token
        access_token = AccessToken.for_user(user)
        
        # Add custom claims
        access_token['role'] = user.role
        access_token['email'] = user.email
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Prepare response data
        token_data = {
            'access_token': str(access_token),
            'token_type': 'Bearer',
            'expires_in': 3600,  # 1 hour in seconds
            'user': UserProfileSerializer(user).data
        }
        
        logger.info(f"Successful admin login: {user.email}")
        
        return APIResponse.success(
            data=token_data,
            message="Admin login successful"
        )
    
    else:
        logger.warning(f"Failed admin login attempt from IP: {request.META.get('REMOTE_ADDR')}")
        return APIResponse.error(
            message="Admin login failed",
            errors=serializer.errors,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def customer_register(request):
    """
    Customer registration endpoint
    Creates new customer account and returns JWT access token
    """
    logger.info(f"Customer registration attempt from IP: {request.META.get('REMOTE_ADDR')}")
    
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT token for immediate login
        access_token = AccessToken.for_user(user)
        
        # Add custom claims
        access_token['role'] = user.role
        access_token['email'] = user.email
        
        # Prepare response data
        token_data = {
            'access_token': str(access_token),
            'token_type': 'Bearer',
            'expires_in': 3600,  # 1 hour in seconds
            'user': UserProfileSerializer(user).data
        }
        
        logger.info(f"Successful customer registration: {user.email}")
        
        return APIResponse.success(
            data=token_data,
            message="Registration successful",
            status_code=status.HTTP_201_CREATED
        )
    
    else:
        logger.warning(f"Failed registration attempt from IP: {request.META.get('REMOTE_ADDR')}")
        return APIResponse.error(
            message="Registration failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """
    Logout endpoint
    Since we're using stateless JWT tokens, this is mainly for logging purposes
    """
    logger.info(f"Logout request from IP: {request.META.get('REMOTE_ADDR')}")
    
    return APIResponse.success(
        message="Logout successful"
    )


@api_view(['GET'])
def verify_token(request):
    """
    Token verification endpoint
    Returns user information if token is valid
    """
    user = request.user
    
    if user.is_authenticated:
        return APIResponse.success(
            data=UserProfileSerializer(user).data,
            message="Token is valid"
        )
    else:
        return APIResponse.error(
            message="Invalid or expired token",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
def me(request):
    """
    Get current user information
    Returns user profile if authenticated
    """
    user = request.user
    
    if user.is_authenticated:
        return APIResponse.success(
            data=UserProfileSerializer(user).data,
            message="User profile retrieved successfully"
        )
    else:
        return APIResponse.error(
            message="Authentication required",
            status_code=status.HTTP_401_UNAUTHORIZED
        )