"""
User models for Tours & Travels backend
Extends Django's AbstractUser with role-based functionality
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import EmailValidator
from apps.core.models import BaseModel


class User(AbstractUser):
    """
    Custom User model with role-based access control
    Supports ADMIN and CUSTOMER roles only
    """
    
    ROLE_CHOICES = [
        ('ADMIN', 'Administrator'),
        ('CUSTOMER', 'Customer'),
    ]
    
    # Override email to make it unique and required
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        help_text="Required. Must be a valid email address."
    )
    
    # Add role field
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='CUSTOMER',
        help_text="User role determines access permissions"
    )
    
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users_user'
        ordering = ['-date_joined']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def is_admin(self):
        """Check if user has admin role"""
        return self.role == 'ADMIN'
    
    @property
    def is_customer(self):
        """Check if user has customer role"""
        return self.role == 'CUSTOMER'
    
    def save(self, *args, **kwargs):
        """Override save to ensure email is lowercase"""
        if self.email:
            self.email = self.email.lower()
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validate user data"""
        super().clean()
        
        # Ensure only one admin user exists
        if self.role == 'ADMIN':
            existing_admin = User.objects.filter(role='ADMIN').exclude(pk=self.pk).first()
            if existing_admin:
                from django.core.exceptions import ValidationError
                raise ValidationError("Only one admin user is allowed in the system.")
    
    def delete(self, *args, **kwargs):
        """Prevent deletion of admin user"""
        if self.role == 'ADMIN':
            from django.core.exceptions import ValidationError
            raise ValidationError("Admin user cannot be deleted.")
        super().delete(*args, **kwargs)