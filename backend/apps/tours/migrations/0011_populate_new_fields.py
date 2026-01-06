# Data migration to populate new fields with default values

from django.db import migrations
from datetime import date


def populate_new_fields(apps, schema_editor):
    """
    Populate new fields with default values
    """
    from decimal import Decimal
    
    Season = apps.get_model('tours', 'Season')
    TourPricing = apps.get_model('tours', 'TourPricing')
    
    # Update seasons with default date ranges
    for season in Season.objects.all():
        if not season.start_date:
            # Set default dates based on month
            if season.start_month <= 6:
                season.start_date = date(2025, season.start_month, 1)
            else:
                season.start_date = date(2025, season.start_month, 1)
        
        if not season.end_date:
            if season.end_month <= 6:
                season.end_date = date(2025, season.end_month, 28)
            else:
                season.end_date = date(2025, season.end_month, 30)
        
        season.save()
    
    # Update tour pricings with default values
    for pricing in TourPricing.objects.all():
        if not pricing.two_sharing_price:
            pricing.two_sharing_price = pricing.price
        if not pricing.three_sharing_price:
            pricing.three_sharing_price = pricing.price - Decimal('1000') if pricing.price > Decimal('1000') else pricing.price
        if not pricing.child_price:
            pricing.child_price = pricing.price * Decimal('0.7')  # 30% discount for children
        
        pricing.save()


def reverse_populate_new_fields(apps, schema_editor):
    """
    Reverse operation - clear new fields
    """
    Season = apps.get_model('tours', 'Season')
    TourPricing = apps.get_model('tours', 'TourPricing')
    
    Season.objects.update(start_date=None, end_date=None)
    TourPricing.objects.update(
        two_sharing_price=None, 
        three_sharing_price=None, 
        child_price=None
    )


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0010_season_end_date_season_start_date_tour_hotel_details_and_more'),
    ]

    operations = [
        migrations.RunPython(
            populate_new_fields,
            reverse_populate_new_fields
        ),
    ]