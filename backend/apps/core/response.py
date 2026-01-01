"""
Consistent API response formatting utilities
"""

from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone


class APIResponse:
    """Utility class for consistent API responses"""
    
    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK):
        """Format successful API response"""
        response_data = {
            'success': True,
            'message': message,
            'timestamp': timezone.now(),
        }
        
        if data is not None:
            response_data['data'] = data
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        """Format error API response"""
        response_data = {
            'success': False,
            'message': message,
            'timestamp': timezone.now(),
        }
        
        if errors is not None:
            response_data['errors'] = errors
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def paginated(data, page_info, message="Success"):
        """Format paginated API response"""
        return Response({
            'success': True,
            'message': message,
            'timestamp': timezone.now(),
            'data': data,
            'pagination': page_info,
        }, status=status.HTTP_200_OK)