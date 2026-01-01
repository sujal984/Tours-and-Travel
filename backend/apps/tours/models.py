"""
Tours models for Tours & Travels backend
Implements tour packages, destinations, and related functionality
"""

from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from apps.core.models import BaseModel


class Season(BaseModel):
    """
    Season model for seasonal pricing
    """
    MONTH_CHOICES = [
        (1, 'January'), (2, 'February'), (3, 'March'), (4, 'April'),
        (5, 'May'), (6, 'June'), (7, 'July'), (8, 'August'),
        (9, 'September'), (10, 'October'), (11, 'November'), (12, 'December'),
    ]

    name = models.CharField(max_length=100, unique=True)
    start_month = models.PositiveSmallIntegerField(choices=MONTH_CHOICES)
    end_month = models.PositiveSmallIntegerField(choices=MONTH_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'tours_season'
        ordering = ['start_month']
        verbose_name = 'Season'
        verbose_name_plural = 'Seasons'

    def __str__(self):
        return self.name


class TourPricing(BaseModel):
    """
    Seasonal pricing for tours
    """
    tour = models.ForeignKey(
        'Tour',
        related_name='seasonal_pricings',
        on_delete=models.CASCADE
    )
    season = models.ForeignKey(
        Season,
        related_name='tour_pricings',
        on_delete=models.CASCADE
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'tours_tourpricing'
        unique_together = ['tour', 'season']
        verbose_name = 'Tour Pricing'
        verbose_name_plural = 'Tour Pricings'

    def __str__(self):
        return f"{self.tour.name} - {self.season.name}: {self.price}"


class TourItinerary(BaseModel):
    """
    Day-by-day itinerary for tours/destinations
    """
    destination = models.ForeignKey(
        'Destination',
        related_name='itineraries',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    tour = models.ForeignKey(
        'Tour',
        related_name='detailed_itineraries',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    day_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()

    class Meta:
        db_table = 'tours_touritinerary'
        ordering = ['day_number']
        verbose_name = 'Tour Itinerary'
        verbose_name_plural = 'Tour Itineraries'

    def __str__(self):
        return f"Day {self.day_number}: {self.title}"


class Destination(BaseModel):
    """
    Destination model for tour locations
    """
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    places = models.TextField(
        blank=True, 
        help_text="Comma-separated list of places to visit"
    )
    country = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'tours_destination'
        ordering = ['name']
        verbose_name = 'Destination'
        verbose_name_plural = 'Destinations'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tour(BaseModel):
    """
    Main Tour model with comprehensive tour information
    """
    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MODERATE', 'Moderate'),
        ('CHALLENGING', 'Challenging'),
    ]
    
    CATEGORY_CHOICES = [
        ('ADVENTURE', 'Adventure'),
        ('CULTURAL', 'Cultural'),
        ('RELAXATION', 'Relaxation'),
        ('BUSINESS', 'Business'),
        ('WILDLIFE', 'Wildlife'),
        ('SPIRITUAL', 'Spiritual'),
    ]

    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    destination = models.ForeignKey(
        Destination, 
        related_name='tours', 
        on_delete=models.CASCADE
    )
    duration_days = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    max_capacity = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(1)]
    )
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    is_active = models.BooleanField(default=True)
    featured_image = models.ImageField(
        upload_to='tours/images/', 
        null=True, 
        blank=True
    )
    gallery_images = models.JSONField(
        default=list,
        blank=True,
        help_text="List of image URLs for tour gallery"
    )
    inclusions = models.JSONField(
        default=list,
        blank=True,
        help_text="List of included services"
    )
    exclusions = models.JSONField(
        default=list,
        blank=True,
        help_text="List of excluded services"
    )
    itinerary = models.JSONField(
        default=list,
        blank=True,
        help_text="Day-by-day tour schedule"
    )
    difficulty_level = models.CharField(
        max_length=15,
        choices=DIFFICULTY_CHOICES,
        default='EASY'
    )
    category = models.CharField(
        max_length=15,
        choices=CATEGORY_CHOICES,
        default='CULTURAL'
    )
    
    class Meta:
        db_table = 'tours_tour'
        ordering = ['-created_at']
        verbose_name = 'Tour'
        verbose_name_plural = 'Tours'
        indexes = [
            models.Index(fields=['destination']),
            models.Index(fields=['category']),
            models.Index(fields=['base_price']),
            models.Index(fields=['is_active']),
            models.Index(fields=['difficulty_level']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def average_rating(self):
        """Calculate average rating from reviews"""
        reviews = self.reviews.filter(is_verified=True)
        if reviews.exists():
            return reviews.aggregate(
                avg_rating=models.Avg('rating')
            )['avg_rating']
        return 0

    @property
    def review_count(self):
        """Get total number of verified reviews"""
        return self.reviews.filter(is_verified=True).count()

    @property
    def available_capacity(self):
        """Calculate available capacity based on confirmed bookings"""
        from apps.bookings.models import Booking
        confirmed_bookings = Booking.objects.filter(
            tour=self,
            status='CONFIRMED'
        ).aggregate(
            total_participants=models.Sum('travelers_count')
        )['total_participants'] or 0
        
        return max(0, self.max_capacity - confirmed_bookings)


class TourPackage(BaseModel):
    """
    Tour package variants with different pricing tiers
    """
    PACKAGE_TYPE_CHOICES = [
        ('STANDARD', 'Standard'),
        ('PREMIUM', 'Premium'),
        ('LUXURY', 'Luxury'),
    ]

    tour = models.ForeignKey(
        Tour, 
        related_name='packages', 
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    price_modifier = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0,
        help_text="Additional cost over base tour price"
    )
    max_participants = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    additional_inclusions = models.JSONField(
        default=list,
        blank=True,
        help_text="Additional services included in this package"
    )
    package_type = models.CharField(
        max_length=10,
        choices=PACKAGE_TYPE_CHOICES,
        default='STANDARD'
    )
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'tours_tourpackage'
        ordering = ['price_modifier']
        verbose_name = 'Tour Package'
        verbose_name_plural = 'Tour Packages'
        unique_together = ['tour', 'name']

    def __str__(self):
        return f"{self.tour.name} - {self.name}"

    @property
    def total_price(self):
        """Calculate total price including base price and modifier"""
        return self.tour.base_price + self.price_modifier

    @property
    def available_capacity(self):
        """Calculate available capacity for this package"""
        from apps.bookings.models import Booking
        confirmed_bookings = Booking.objects.filter(
            package=self,
            status='CONFIRMED'
        ).aggregate(
            total_participants=models.Sum('travelers_count')
        )['total_participants'] or 0
        
        return max(0, self.max_participants - confirmed_bookings)


class Hotel(BaseModel):
    """
    Hotel information for destinations
    """
    destination = models.ForeignKey(
        Destination, 
        related_name='hotels', 
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=250)
    address = models.TextField(blank=True)
    image = models.ImageField(
        upload_to='hotels/', 
        null=True, 
        blank=True
    )
    hotel_type = models.CharField(max_length=50, blank=True)
    star_rating = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'tours_hotel'
        ordering = ['name']
        verbose_name = 'Hotel'
        verbose_name_plural = 'Hotels'

    def __str__(self):
        return f"{self.name} ({self.destination.name})"


class Vehicle(BaseModel):
    """
    Vehicle information for tours
    """
    vehicle_no = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=200, blank=True)
    capacity = models.PositiveIntegerField(default=1)
    vehicle_type = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'tours_vehicle'
        ordering = ['name']
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'

    def __str__(self):
        return f"{self.name} - {self.vehicle_no}"


class Offer(BaseModel):
    """
    Special offers and discounts for tours
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    applicable_tours = models.ManyToManyField(
        Tour,
        related_name='offers',
        blank=True
    )

    class Meta:
        db_table = 'tours_offer'
        ordering = ['-start_date']
        verbose_name = 'Offer'
        verbose_name_plural = 'Offers'

    def __str__(self):
        return f"{self.name} - {self.discount_percentage}%"

    @property
    def is_valid(self):
        """Check if offer is currently valid"""
        from django.utils import timezone
        today = timezone.now().date()
        return self.is_active and self.start_date <= today <= self.end_date


class CustomPackage(BaseModel):
    """
    Custom package requests from customers
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('QUOTED', 'Quoted'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='custom_packages',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    contact_number = models.CharField(max_length=30)
    destination = models.CharField(max_length=100)
    duration = models.CharField(max_length=50)
    start_date = models.DateField()
    participants_count = models.PositiveIntegerField()
    hotel_preference = models.CharField(max_length=100, blank=True)
    transportation_choice = models.CharField(max_length=50, blank=True)
    package_type = models.CharField(max_length=50, blank=True)
    special_requirements = models.TextField(blank=True)
    budget_range = models.CharField(max_length=50, blank=True)
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    admin_notes = models.TextField(blank=True)
    quoted_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'tours_custompackage'
        ordering = ['-created_at']
        verbose_name = 'Custom Package'
        verbose_name_plural = 'Custom Packages'

    def __str__(self):
        return f"Custom Package #{self.id} by {self.customer.email}"


class Inquiry(BaseModel):
    """
    General inquiries about tours
    """
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('RESPONDED', 'Responded'),
        ('CLOSED', 'Closed'),
    ]

    tour = models.ForeignKey(
        Tour,
        related_name='inquiries',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='inquiries',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    contact_number = models.CharField(max_length=30)
    inquiry_date = models.DateField()
    message = models.TextField()
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='NEW'
    )
    admin_response = models.TextField(blank=True)

    class Meta:
        db_table = 'tours_inquiry'
        ordering = ['-created_at']
        verbose_name = 'Inquiry'
        verbose_name_plural = 'Inquiries'

    def __str__(self):
        return f"Inquiry #{self.id} by {self.name}"