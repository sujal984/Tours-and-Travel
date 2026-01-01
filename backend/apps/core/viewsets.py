"""
Core viewsets for Tours & Travels backend
Provides base viewsets with common functionality
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils import timezone
from .response import APIResponse


class BaseViewSet(viewsets.ModelViewSet):
    """
    Base viewset with common functionality for all API endpoints
    Provides consistent response formatting and error handling
    """
    
    def create(self, request, *args, **kwargs):
        """Create a new instance with consistent response format"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message=f"{self.get_model_name()} created successfully",
                status_code=status.HTTP_201_CREATED
            )
        else:
            return APIResponse.error(
                message=f"Failed to create {self.get_model_name()}",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    def list(self, request, *args, **kwargs):
        """List instances with consistent response format"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(
            data=serializer.data,
            message=f"{self.get_model_name()} list retrieved successfully"
        )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single instance with consistent response format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(
            data=serializer.data,
            message=f"{self.get_model_name()} retrieved successfully"
        )
    
    def update(self, request, *args, **kwargs):
        """Update an instance with consistent response format"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            instance = serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message=f"{self.get_model_name()} updated successfully"
            )
        else:
            return APIResponse.error(
                message=f"Failed to update {self.get_model_name()}",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    def get_paginated_response(self, data):
        """Return a consistent paginated response"""
        page_info = {
            'count': self.paginator.page.paginator.count,
            'total_pages': self.paginator.page.paginator.num_pages,
            'current_page': self.paginator.page.number,
            'next': self.paginator.get_next_link(),
            'previous': self.paginator.get_previous_link(),
            'page_size': self.paginator.page_size
        }
        return APIResponse.paginated(
            data=data,
            page_info=page_info,
            message=f"{self.get_model_name()} list retrieved successfully"
        )

    def destroy(self, request, *args, **kwargs):
        """Delete an instance with consistent response format"""
        instance = self.get_object()
        instance.delete()
        return APIResponse.success(
            message=f"{self.get_model_name()} deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    
    def get_model_name(self):
        """Get the model name for response messages"""
        if hasattr(self, 'queryset') and self.queryset is not None:
            return self.queryset.model.__name__
        elif hasattr(self, 'serializer_class') and self.serializer_class is not None:
            if hasattr(self.serializer_class.Meta, 'model'):
                return self.serializer_class.Meta.model.__name__
        return "Resource"
    
    def handle_exception(self, exc):
        """Handle exceptions with consistent error response format"""
        response = super().handle_exception(exc)
        
        # Convert DRF error responses to our consistent format
        if hasattr(response, 'data') and isinstance(response.data, dict):
            if 'detail' in response.data:
                return APIResponse.error(
                    message=str(response.data['detail']),
                    status_code=response.status_code
                )
            else:
                return APIResponse.error(
                    message="An error occurred",
                    errors=response.data,
                    status_code=response.status_code
                )
        
        return response