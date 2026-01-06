from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
from apps.tours.models import Destination, Season, Tour, TourPricing


class Command(BaseCommand):
    help = 'Populate sample data for tours with brochure-style information'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create destinations
        destinations_data = [
            {'name': 'Darjeeling', 'country': 'India', 'places': 'Tiger Hill, Batasia Loop, Himalayan Railway'},
            {'name': 'Pelling', 'country': 'India', 'places': 'Pemayangtse Monastery, Khecheopalri Lake'},
            {'name': 'Gangtok', 'country': 'India', 'places': 'MG Marg, Tsomgo Lake, Rumtek Monastery'},
            {'name': 'Lachung', 'country': 'India', 'places': 'Yumthang Valley, Zero Point, Hot Springs'},
        ]

        destinations = {}
        for dest_data in destinations_data:
            destination, created = Destination.objects.get_or_create(
                name=dest_data['name'],
                defaults={
                    'country': dest_data['country'],
                    'places': dest_data['places'],
                    'description': f'Beautiful destination in {dest_data["country"]}',
                    'is_active': True
                }
            )
            destinations[dest_data['name']] = destination
            if created:
                self.stdout.write(f'Created destination: {destination.name}')

        # Create seasons
        seasons_data = [
            {
                'name': 'Summer Season',
                'start_month': 7,
                'end_month': 9,
                'start_date': date(2025, 7, 1),
                'end_date': date(2025, 9, 30),
                'description': 'Peak summer season with pleasant weather'
            },
            {
                'name': 'Winter Season',
                'start_month': 10,
                'end_month': 1,
                'start_date': date(2025, 10, 1),
                'end_date': date(2026, 1, 15),
                'description': 'Winter season with clear mountain views'
            }
        ]

        seasons = {}
        for season_data in seasons_data:
            season, created = Season.objects.get_or_create(
                name=season_data['name'],
                defaults=season_data
            )
            seasons[season_data['name']] = season
            if created:
                self.stdout.write(f'Created season: {season.name}')

        # Create a comprehensive tour
        tour_data = {
            'name': 'Sikkim Darjeeling Tour Package',
            'description': 'Experience the breathtaking beauty of Sikkim and Darjeeling with our comprehensive tour package. Visit stunning monasteries, enjoy panoramic mountain views, and experience the rich culture of the Himalayas.',
            'duration_days': 7,
            'max_capacity': 20,
            'base_price': Decimal('45000'),
            'category': 'CULTURAL',
            'difficulty_level': 'EASY',
            'inclusions': [
                'Accommodation in hotels as per itinerary',
                'All meals (breakfast, lunch, dinner)',
                'Transportation by AC vehicle',
                'Professional tour guide',
                'All entry fees and permits',
                'Airport transfers'
            ],
            'exclusions': [
                'Personal expenses',
                'Tips and gratuities',
                'Travel insurance',
                'Any items not mentioned in inclusions'
            ],
            'itinerary': [
                {
                    'day': 1,
                    'title': 'Arrival in Bagdogra Airport / NJP Railway Station - Darjeeling',
                    'description': 'Pick up from Bagdogra Airport/NJP Railway Station and drive to Darjeeling. Check-in at hotel and evening free for leisure.'
                },
                {
                    'day': 2,
                    'title': 'Darjeeling Local Sightseeing',
                    'description': 'Early morning visit to Tiger Hill for sunrise view. Visit Batasia Loop, Ghum Monastery, Himalayan Mountaineering Institute, and local markets.'
                },
                {
                    'day': 3,
                    'title': 'Darjeeling to Pelling',
                    'description': 'After breakfast, drive to Pelling. Check-in at hotel and visit Pemayangtse Monastery and local sightseeing.'
                }
            ],
            'hotel_details': {
                str(destinations['Darjeeling'].id): {
                    'hotel_name': 'OMEGA/SIMILAR',
                    'hotel_type': 'Standard'
                },
                str(destinations['Pelling'].id): {
                    'hotel_name': 'SONAMCHEN/SIMILAR',
                    'hotel_type': 'Standard'
                },
                str(destinations['Gangtok'].id): {
                    'hotel_name': 'BIKSTHANG BOUTIQUE/SIMILAR',
                    'hotel_type': 'Boutique'
                },
                str(destinations['Lachung'].id): {
                    'hotel_name': 'COMFORT RETREAT/SIMILAR',
                    'hotel_type': 'Standard'
                }
            },
            'vehicle_details': {
                'type': 'AC INNOVA/XYLO, FOR LACHUNG, SCORPIO/SUMO/BOLERO',
                'note': 'AC WILL NOT WORK IN HILL AREA'
            },
            'special_notes': 'All rates are subject to availability. Confirmation will be provided upon booking. Weather conditions may affect itinerary.'
        }

        # Create or update the tour
        tour, created = Tour.objects.get_or_create(
            name=tour_data['name'],
            defaults={
                **tour_data,
                'primary_destination': destinations['Darjeeling']
            }
        )

        if created:
            # Add all destinations to the tour
            tour.destinations.set([
                destinations['Darjeeling'],
                destinations['Pelling'],
                destinations['Gangtok'],
                destinations['Lachung']
            ])
            self.stdout.write(f'Created tour: {tour.name}')
        else:
            # Update existing tour
            for key, value in tour_data.items():
                if key != 'name':
                    setattr(tour, key, value)
            tour.save()
            tour.destinations.set([
                destinations['Darjeeling'],
                destinations['Pelling'],
                destinations['Gangtok'],
                destinations['Lachung']
            ])
            self.stdout.write(f'Updated tour: {tour.name}')

        # Create seasonal pricing
        pricing_data = [
            {
                'season': seasons['Summer Season'],
                'two_sharing_price': Decimal('48999'),
                'three_sharing_price': Decimal('44999'),
                'child_price': Decimal('40999'),
                'available_dates': ['10', '17', '24'],
                'includes_return_air': True,
                'description': 'Summer season rates with return air travel'
            },
            {
                'season': seasons['Winter Season'],
                'two_sharing_price': Decimal('58999'),
                'three_sharing_price': Decimal('55999'),
                'child_price': Decimal('53999'),
                'available_dates': ['17', '21', '23'],
                'includes_return_air': True,
                'description': 'Winter season rates with return air travel'
            }
        ]

        for pricing_info in pricing_data:
            pricing, created = TourPricing.objects.get_or_create(
                tour=tour,
                season=pricing_info['season'],
                defaults={
                    **pricing_info,
                    'price': pricing_info['two_sharing_price']  # Set base price
                }
            )
            if created:
                self.stdout.write(f'Created pricing for {tour.name} - {pricing_info["season"].name}')
            else:
                # Update existing pricing
                for key, value in pricing_info.items():
                    if key != 'season':
                        setattr(pricing, key, value)
                pricing.price = pricing_info['two_sharing_price']
                pricing.save()
                self.stdout.write(f'Updated pricing for {tour.name} - {pricing_info["season"].name}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated sample data!')
        )