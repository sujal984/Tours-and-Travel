"""
Core models for Tours & Travels backend
Provides base models with common functionality
"""

import uuid
from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    """
    Base model with UUID primary key and timestamp fields
    All models should inherit from this for consistency
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for this record"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when this record was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when this record was last updated"
    )
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        """Override save to ensure updated_at is set"""
        if not self.created_at:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)