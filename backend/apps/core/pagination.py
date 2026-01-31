"""
Custom pagination classes for the Tours & Travels application
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination with 100 items per page
    """
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class LargeResultsSetPagination(PageNumberPagination):
    """
    Large pagination with 500 items per page for admin views
    """
    page_size = 500
    page_size_query_param = 'page_size'
    max_page_size = 1000


class NoPagination:
    """
    No pagination - returns all results
    Used for dropdown/selection lists in admin forms
    """
    def paginate_queryset(self, queryset, request, view=None):
        return None

    def get_paginated_response(self, data):
        return Response(data)


class AdminListPagination(PageNumberPagination):
    """
    Admin-specific pagination with higher limits
    """
    page_size = 200
    page_size_query_param = 'page_size'
    max_page_size = 1000
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.page_size
        })