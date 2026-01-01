from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read access to anyone but write access only to admins.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )
