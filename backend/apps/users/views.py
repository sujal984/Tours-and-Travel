"""
User views for Tours & Travels backend
"""

from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.core.viewsets import BaseViewSet
from apps.core.permissions import IsAdminUser, IsOwnerOrAdmin
from apps.core.response import APIResponse
from .models import User
from .serializers import UserSerializer, UserProfileSerializer, PasswordChangeSerializer


class UserViewSet(BaseViewSet):
    """
    ViewSet for User management with role-based access control
    """
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action == 'create':
            # Allow anyone to register as customer
            permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'destroy']:
            # Only admins can list all users or delete users
            permission_classes = [IsAdminUser]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            # Users can access their own data, admins can access all
            permission_classes = [IsOwnerOrAdmin]
        elif self.action in ['profile', 'change_password']:
            # Authenticated users only
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter queryset based on user role
        """
        user = self.request.user
        
        if not user.is_authenticated:
            return User.objects.none()
        
        # Admins can see all users
        if hasattr(user, 'role') and user.role == 'ADMIN':
            return User.objects.all()
        
        # Customers can only see themselves
        return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'profile':
            return UserProfileSerializer
        elif self.action == 'change_password':
            return PasswordChangeSerializer
        return UserSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Register a new customer user
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return APIResponse.success(
                data=UserProfileSerializer(user).data,
                message="User registered successfully",
                status_code=status.HTTP_201_CREATED
            )
        else:
            return APIResponse.error(
                message="Registration failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """
        Update user (admin can update any user, users can update themselves)
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message="User updated successfully"
            )
        else:
            return APIResponse.error(
                message="User update failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update user
        """
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete user (admin only, cannot delete admin user)
        """
        instance = self.get_object()
        
        # Prevent deletion of admin user
        if instance.role == 'ADMIN':
            return APIResponse.error(
                message="Admin user cannot be deleted",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        instance.delete()
        return APIResponse.success(
            message="User deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        """
        Get or update current user's profile
        """
        if not request.user.is_authenticated:
            return APIResponse.error(
                message="Authentication required",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
            
        user = request.user
        
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return APIResponse.success(
                data=serializer.data,
                message="Profile retrieved successfully"
            )
        
        else:  # PUT or PATCH
            serializer = self.get_serializer(
                user, 
                data=request.data, 
                partial=(request.method == 'PATCH')
            )
            
            if serializer.is_valid():
                serializer.save()
                return APIResponse.success(
                    data=serializer.data,
                    message="Profile updated successfully"
                )
            else:
                return APIResponse.error(
                    message="Profile update failed",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Change current user's password
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                message="Password changed successfully"
            )
        else:
            return APIResponse.error(
                message="Password change failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )