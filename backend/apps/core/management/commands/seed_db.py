import random
import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify
from apps.tours.models import Destination, Hotel, Vehicle, Tour, TourPackage, Season, TourPricing, TourItinerary
from apps.bookings.models import Booking
from apps.payments.models import Payment, Refund, Invoice
from apps.reviews.models import Review

User = get_user_model()

class Command(BaseCommand):
    help = 'Flushes the database and seeds it with comprehensive dummy data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # 1. Create Users
        self.stdout.write('Creating users...')
        admin_email = 'sujaljain984@gmail.com'
        
        # Clean up existing admin to respect the single-admin constraint if needed
        User.objects.filter(role='ADMIN').delete()
        
        admin, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'username': 'sujaljain',
                'first_name': 'Sujal',
                'last_name': 'Jain',
                'is_staff': True,
                'is_superuser': True,
                'role': 'ADMIN'
            }
        )
        admin.set_password('admin123')
        admin.save()
        self.stdout.write(f'Admin created/updated: {admin_email}')

        def create_customer(email, username, fname, lname):
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'first_name': fname,
                    'last_name': lname,
                    'role': 'CUSTOMER'
                }
            )
            user.set_password('password123')
            user.save()
            return user

        customer1 = create_customer('john@example.com', 'john_doe', 'John', 'Doe')
        customer2 = create_customer('jane@example.com', 'jane_smith', 'Jane', 'Smith')

        # 2. Destinations
        self.stdout.write('Creating destinations...')
        dest_data = [
            {'name': 'Manali', 'description': 'Gateway to adventure in the Himalayas.'},
            {'name': 'Goa', 'description': 'Beaches, parties, and Portuguese heritage.'},
            {'name': 'Sikkim', 'description': 'Pristine mountains and Buddhist monasteries.'}
        ]
        destinations = []
        for d in dest_data:
            dest, _ = Destination.objects.get_or_create(name=d['name'], defaults={'description': d['description']})
            destinations.append(dest)

        # 3. Hotels
        self.stdout.write('Creating hotels...')
        hotels = []
        for dest in destinations:
            hotel, _ = Hotel.objects.get_or_create(
                name=f'{dest.name} Riverside Resort',
                destination=dest,
                defaults={
                    'address': f'123 River View, {dest.name}',
                    'star_rating': 4,
                    'hotel_type': 'RESORT'
                }
            )
            hotels.append(hotel)

        # 4. Vehicles
        self.stdout.write('Creating vehicles...')
        vehicles = []
        v_data = [('SUV-101', 'Toyota Innova', 6), ('SED-202', 'Maruti Dzire', 4)]
        for v_no, v_name, v_cap in v_data:
            veh, _ = Vehicle.objects.get_or_create(
                vehicle_no=v_no,
                defaults={'name': v_name, 'capacity': v_cap, 'vehicle_type': 'SUV' if 'SUV' in v_no else 'SEDAN'}
            )
            vehicles.append(veh)

        # 5. Seasons
        self.stdout.write('Creating seasons...')
        seasons_data = [
            {'name': 'Summer', 'sm': 4, 'em': 6, 'sd': '2025-04-01', 'ed': '2025-06-30'},
            {'name': 'Winter', 'sm': 11, 'em': 2, 'sd': '2025-11-01', 'ed': '2026-02-28'},
        ]
        seasons = []
        for s in seasons_data:
            season, _ = Season.objects.get_or_create(
                name=s['name'],
                defaults={
                    'start_month': s['sm'],
                    'end_month': s['em'],
                    'start_date': s['sd'],
                    'end_date': s['ed'],
                    'description': f'{s["name"]} Holiday Season'
                }
            )
            seasons.append(season)

        # 6. Tours
        self.stdout.write('Creating tours...')
        tours_specs = [
            {
                'name': 'Enchanting Manali Adventure',
                'dest': 'Manali',
                'cat': 'ADVENTURE',
                'image': 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=800&q=80',
                'desc': 'Escape to the breathtaking landscapes of Manali. This 5-day adventure includes paragliding at Solang Valley, a visit to the serene Hadimba Temple, and a scenic drive through the Rohtang Pass. Enjoy premium riverside stays and authentic Himachali hospitality.'
            },
            {
                'name': 'Glistening Goa Beaches & Heritage',
                'dest': 'Goa',
                'cat': 'HONEYMOON',
                'image': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
                'desc': 'Experience the perfect blend of relaxation and culture in Goa. Walk along the golden sands of Palolem, explore the historic churches of Old Goa, and enjoy a sunset cruise on the Mandovi River. Our curated package ensures a romantic and unforgettable tropical getaway.'
            },
            {
                'name': 'Prisinte Sikkim & Himalayan Wonders',
                'dest': 'Sikkim',
                'cat': 'CULTURAL',
                'image': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
                'desc': 'Discover the hidden gems of the North East. Journey through the mist-covered mountains of Gangtok, witness the sacred Tsomgo Lake, and explore ancient Buddhist monasteries. A 5-day immersive experience in the heart of the Himalayas with luxury accommodations.'
            }
        ]

        tours = []
        for spec in tours_specs:
            dest = Destination.objects.get(name=spec['dest'])
            t_type = 'INTERNATIONAL' if dest.name == 'Sikkim' else 'DOMESTIC'
            
            # Populate hotel and vehicle details for the tour
            h_details = {
                str(dest.id): {
                    'hotel_name': f'{dest.name} Premium Heritage Resort',
                    'hotel_type': '5-Star Luxury'
                }
            }
            v_details = {
                'type': 'Private Luxury SUV (Fortuner/Similar)',
                'note': 'Chauffeur-driven private vehicle for exclusive use throughout the journey'
            }

            tour, _ = Tour.objects.get_or_create(
                name=spec['name'],
                defaults={
                    'slug': slugify(spec['name']),
                    'description': spec['desc'],
                    'duration_days': 5,
                    'primary_destination': dest,
                    'max_capacity': 10,
                    'category': spec['cat'],
                    'tour_type': t_type,
                    'available_dates': ['2026-01-15', '2026-01-22'],
                    'hotel_details': h_details,
                    'vehicle_details': v_details,
                    'pricing_details': []
                }
            )
            # Update image if it was already created but had dummy image
            tour.featured_image = spec['image']
            tour.save()
            
            tour.destinations.add(dest)
            tours.append(tour)

            # 7. Detailed Itinerary
            for day in range(1, 6):
                TourItinerary.objects.get_or_create(
                    tour=tour,
                    day_number=day,
                    defaults={
                        'title': f'Day {day} Exploration',
                        'description': f'Detailed activities for day {day} in {dest.name}.'
                    }
                )

            # 8. Seasonal Pricing
            for season in seasons:
                TourPricing.objects.get_or_create(
                    tour=tour,
                    season=season,
                    defaults={
                        'two_sharing_price': Decimal('18000.00'),
                        'three_sharing_price': Decimal('16000.00'),
                        'child_price': Decimal('9000.00'),
                        'price': Decimal('18000.00'),
                        'available_dates': ['05', '12', '19', '26']
                    }
                )

        # 9. Transactions
        self.stdout.write('Creating bookings...')
        # Successful Booking
        b1 = Booking.objects.create(
            user=customer1,
            tour=tours[0],
            travelers_count=2,
            total_price=Decimal('36000.00'),
            status='CONFIRMED',
            travel_date=timezone.now().date() + datetime.timedelta(days=20),
            contact_number='1234567890',
            traveler_details=[
                {'name': 'John Doe', 'age': 30, 'category': 'adult', 'sharing_type': 'two_sharing'},
                {'name': 'Jane Doe', 'age': 28, 'category': 'adult', 'sharing_type': 'two_sharing'}
            ]
        )
        p1 = Payment.objects.create(
            booking=b1,
            amount=Decimal('36000.00'),
            payment_method='CREDIT_CARD',
            status='SUCCESS',
            transaction_id='TXN-OK-1',
            processed_at=timezone.now()
        )
        Invoice.objects.create(
            booking=b1,
            amount=Decimal('36000.00'),
            total_amount=Decimal('37800.00'), # with tax
            status='PAID',
            due_date=timezone.now().date()
        )
        Review.objects.create(user=customer1, tour=tours[0], rating=5, comment='Great service!', is_verified=True)

        # Refundable Booking
        b2 = Booking.objects.create(
            user=customer2,
            tour=tours[1],
            travelers_count=1,
            total_price=Decimal('18000.00'),
            status='REFUND_PENDING',
            travel_date=timezone.now().date() + datetime.timedelta(days=5),
            contact_number='0987654321'
        )
        p2 = Payment.objects.create(
            booking=b2,
            amount=Decimal('18000.00'),
            payment_method='UPI',
            status='SUCCESS',
            transaction_id='TXN-REF-1'
        )
        Refund.objects.create(
            payment=p2,
            booking=b2,
            amount=Decimal('15000.00'),
            reason='Personal reasons',
            status='PENDING'
        )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
