"""
Core permissions for Tours & Travels backend
Provides base permission classes for role-based access control
"""

from rest_framework import permissions
from rest_framework.permissions import BasePermission


class BasePermission(BasePermission):
    """
    Base permission class with common functionality
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access the view
        Override in subclasses for specific permission logic
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has permission to access specific object
        Override in subclasses for specific object permission logic
        """
        return self.has_permission(request, view)


class IsAdminUser(BasePermission):
    """
    Permission class for admin users only
    Allows access only to users with ADMIN role
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated and has ADMIN role"""
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Check if user has ADMIN role
        return hasattr(request.user, 'role') and request.user.role == 'ADMIN'
    
    def has_object_permission(self, request, view, obj):
        """Admin users have access to all objects"""
        return self.has_permission(request, view)


class IsCustomerUser(BasePermission):
    """
    Permission class for customer users
    Allows access to users with CUSTOMER role
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated and has CUSTOMER role"""
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Check if user has CUSTOMER role
        return hasattr(request.user, 'role') and request.user.role == 'CUSTOMER'
    
    def has_object_permission(self, request, view, obj):
        """Customer users can only access their own objects"""
        if not self.has_permission(request, view):
            return False
        
        # Check if object belongs to the user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        # If no ownership field, allow access (will be restricted by queryset)
        return True


class IsOwnerOrAdmin(BasePermission):
    """
    Permission class that allows access to object owners or admin users
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated"""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Allow access to owners or admin users"""
        if not self.has_permission(request, view):
            return False
        
        # Admin users have access to all objects
        if hasattr(request.user, 'role') and request.user.role == 'ADMIN':
            return True
        
        # Check if user owns the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False


class ReadOnlyPermission(BasePermission):
    """
    Permission class that allows read-only access to authenticated users
    """
    
    def has_permission(self, request, view):
        """Allow read-only access to authenticated users"""
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Allow read operations (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Allow read-only access to objects"""
        return self.has_permission(request, view)