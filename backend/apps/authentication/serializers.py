"""
Authentication serializers for Tours & Travels backend
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import AccessToken
from apps.users.models import User
from apps.users.serializers import UserProfileSerializer


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login with email and password
    """
    
    email = serializers.EmailField(
        help_text="User's email address"
    )
    
    password = serializers.CharField(
        write_only=True,
        help_text="User's password"
    )
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email', '').lower()
        password = attrs.get('password')
        
        if email and password:
            # Authenticate user
            user = authenticate(
                request=self.context.get('request'),
                username=email,  # Using email as username
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Invalid email or password.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Must include email and password.'
            )


class RegisterSerializer(serializers.Serializer):
    """
    Serializer for customer registration
    """
    
    username = serializers.CharField(
        max_length=150,
        help_text="Unique username"
    )
    
    email = serializers.EmailField(
        help_text="Valid email address"
    )
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        help_text="Password must meet security requirements"
    )
    
    password_confirm = serializers.CharField(
        write_only=True,
        help_text="Must match password field"
    )
    
    first_name = serializers.CharField(
        max_length=150,
        help_text="User's first name"
    )
    
    last_name = serializers.CharField(
        max_length=150,
        help_text="User's last name"
    )
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if value:
            value = value.lower()
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError(
                    "A user with this email already exists."
                )
        return value
    
    def validate_username(self, value):
        """Validate username uniqueness"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value
    
    def validate(self, attrs):
        """Validate registration data"""
        # Check password confirmation
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Password confirmation does not match password.'
            })
        
        # Remove password_confirm from validated data
        attrs.pop('password_confirm')
        
        return attrs
    
    def create(self, validated_data):
        """Create new customer user"""
        # Ensure role is CUSTOMER
        validated_data['role'] = 'CUSTOMER'
        
        # Create user
        user = User.objects.create_user(**validated_data)
        return user


class TokenResponseSerializer(serializers.Serializer):
    """
    Serializer for token response
    """
    
    access_token = serializers.CharField(
        help_text="JWT access token"
    )
    
    token_type = serializers.CharField(
        default="Bearer",
        help_text="Token type"
    )
    
    expires_in = serializers.IntegerField(
        help_text="Token expiration time in seconds"
    )
    
    user = UserProfileSerializer(
        help_text="User profile information"
    )


class AdminLoginSerializer(serializers.Serializer):
    """
    Serializer for admin login (same as regular login but validates admin role)
    """
    
    email = serializers.EmailField(
        help_text="Admin email address"
    )
    
    password = serializers.CharField(
        write_only=True,
        help_text="Admin password"
    )
    
    def validate(self, attrs):
        """Validate admin login credentials"""
        email = attrs.get('email', '').lower()
        password = attrs.get('password')
        
        if email and password:
            # Authenticate user
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Invalid email or password.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )
            
            # Check if user is admin
            if not hasattr(user, 'role') or user.role != 'ADMIN':
                raise serializers.ValidationError(
                    'Access denied. Admin privileges required.'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Must include email and password.'
            )