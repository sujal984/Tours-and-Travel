from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel
from apps.tours.models import Tour

class Review(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tour_reviews'
    )
    tour = models.ForeignKey(
        Tour,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    is_verified = models.BooleanField(default=False)

    class Meta:
        db_table = 'reviews_review'
        ordering = ['-created_at']
        unique_together = ['user', 'tour']

    def __str__(self):
        return f"Review by {self.user.email} for {self.tour.name}"
