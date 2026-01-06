# Data migration to populate primary_destination field

from django.db import migrations


def populate_primary_destination(apps, schema_editor):
    """
    Populate primary_destination field from the first destination in destinations
    """
    Tour = apps.get_model('tours', 'Tour')
    Destination = apps.get_model('tours', 'Destination')
    
    # Get a default destination
    default_destination = Destination.objects.first()
    
    for tour in Tour.objects.all():
        # Get the first destination from the many-to-many field
        first_destination = tour.destinations.first()
        if first_destination:
            tour.primary_destination = first_destination
        elif default_destination:
            # If no destinations in M2M, use default and add to M2M
            tour.primary_destination = default_destination
            tour.destinations.add(default_destination)
        tour.save()


def reverse_populate_primary_destination(apps, schema_editor):
    """
    Reverse operation - clear primary_destination field
    """
    Tour = apps.get_model('tours', 'Tour')
    Tour.objects.update(primary_destination=None)


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0007_remove_tour_tours_tour_destina_bbfad1_idx_and_more'),
    ]

    operations = [
        migrations.RunPython(
            populate_primary_destination,
            reverse_populate_primary_destination
        ),
    ]