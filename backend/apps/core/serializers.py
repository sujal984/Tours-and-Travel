"""
Core serializers for Tours & Travels backend
Provides base serializers with common functionality
"""

from rest_framework import serializers
from django.utils import timezone


class BaseSerializer(serializers.ModelSerializer):
    """
    Base serializer with common functionality for all API serializers
    Provides consistent timestamp handling and response formatting
    """
    
    # Read-only fields that should be included in all serializers
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        abstract = True
        fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """
        Convert model instance to dictionary representation
        Ensures consistent timestamp formatting
        """
        data = super().to_representation(instance)
        
        # Format timestamps consistently
        if 'created_at' in data and data['created_at']:
            data['created_at'] = self.format_datetime(instance.created_at)
        
        if 'updated_at' in data and data['updated_at']:
            data['updated_at'] = self.format_datetime(instance.updated_at)
        
        return data
    
    def format_datetime(self, dt):
        """Format datetime consistently across all serializers"""
        if dt:
            return dt.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        return None
    
    def validate(self, attrs):
        """
        Validate serializer data
        Override in subclasses for specific validation logic
        """
        return super().validate(attrs)
    
    def create(self, validated_data):
        """
        Create a new instance with proper timestamp handling
        """
        # Ensure created_at is set
        if 'created_at' not in validated_data:
            validated_data['created_at'] = timezone.now()
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """
        Update an instance with proper timestamp handling
        """
        # Ensure updated_at is set
        validated_data['updated_at'] = timezone.now()
        
        return super().update(instance, validated_data)