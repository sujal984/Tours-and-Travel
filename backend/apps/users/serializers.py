"""
User serializers for Tours & Travels backend
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from apps.core.serializers import BaseSerializer
from .models import User


class UserSerializer(BaseSerializer):
    """
    Serializer for User model with role-based field access
    """
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        help_text="Password must meet security requirements"
    )
    
    password_confirm = serializers.CharField(
        write_only=True,
        help_text="Must match password field"
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'date_joined', 'last_login',
            'password', 'password_confirm', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate user data"""
        attrs = super().validate(attrs)
        
        # Check password confirmation
        if 'password' in attrs and 'password_confirm' in attrs:
            if attrs['password'] != attrs['password_confirm']:
                raise serializers.ValidationError({
                    'password_confirm': 'Password confirmation does not match password.'
                })
        
        # Remove password_confirm from validated data
        attrs.pop('password_confirm', None)
        
        return attrs
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if value:
            value = value.lower()
            
            # Check for existing email (excluding current instance during updates)
            queryset = User.objects.filter(email=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError("A user with this email already exists.")
        
        return value
    
    def validate_role(self, value):
        """Validate role assignment"""
        request = self.context.get('request')
        
        # Allow admin users to assign any role
        if request and hasattr(request.user, 'role') and request.user.role == 'ADMIN':
            return value
        
        # Only allow CUSTOMER role for new registrations via API
        if value == 'ADMIN' and not self.instance:
            raise serializers.ValidationError("Admin role cannot be assigned via API registration.")
        
        return value
    
    def create(self, validated_data):
        """Create new user with hashed password"""
        password = validated_data.pop('password')
        
        # Ensure new users are customers by default
        validated_data['role'] = 'CUSTOMER'
        
        # Create user
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user
    
    def update(self, instance, validated_data):
        """Update user with proper password handling"""
        password = validated_data.pop('password', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UserProfileSerializer(BaseSerializer):
    """
    Serializer for user profile (limited fields for customers)
    """
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'username', 'role', 'date_joined', 'last_login']
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if value:
            value = value.lower()
            
            # Check for existing email (excluding current instance)
            queryset = User.objects.filter(email=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError("A user with this email already exists.")
        
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    
    current_password = serializers.CharField(
        write_only=True,
        help_text="Current password for verification"
    )
    
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        help_text="New password must meet security requirements"
    )
    
    new_password_confirm = serializers.CharField(
        write_only=True,
        help_text="Must match new password field"
    )
    
    def validate(self, attrs):
        """Validate password change data"""
        user = self.context['request'].user
        
        # Check current password
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({
                'current_password': 'Current password is incorrect.'
            })
        
        # Check new password confirmation
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'New password confirmation does not match.'
            })
        
        return attrs
    
    def save(self):
        """Change user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user