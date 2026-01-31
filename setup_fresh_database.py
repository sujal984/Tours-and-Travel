#!/usr/bin/env python3
"""
Script to truncate database and create fresh data with tours from PDFs
"""

import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)
os.chdir(backend_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings.development')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction
from apps.tours.models import Destination, Hotel, Vehicle, Tour, Season, TourPricing, Offer
from apps.users.models import User

User = get_user_model()

def truncate_database():
    """Truncate all tables and reset data"""
    print("🗑️  Truncating database...")
    
    # Delete all data in correct order (respecting foreign keys)
    from apps.payments.models import Payment, Refund, Invoice
    from apps.bookings.models import Booking
    from apps.reviews.models import Review
    
    # Delete in reverse dependency order
    Payment.objects.all().delete()
    Refund.objects.all().delete()
    Invoice.objects.all().delete()
    Booking.objects.all().delete()
    Review.objects.all().delete()
    
    # Delete tour-related data
    TourPricing.objects.all().delete()
    Tour.objects.all().delete()
    Offer.objects.all().delete()
    Season.objects.all().delete()
    Vehicle.objects.all().delete()
    Hotel.objects.all().delete()
    Destination.objects.all().delete()
    
    # Delete users
    User.objects.all().delete()
    
    print("✅ Database truncated successfully")

def create_users():
    """Create admin and customer users"""
    print("👥 Creating users...")
    
    # Create admin user
    admin = User.objects.create_user(
        username='admin',
        email='sujaljain984@gmail.com',
        password='Sujal@7383',
        first_name='Admin',
        last_name='User',
        role='ADMIN',
        is_staff=True,
        is_superuser=True
    )
    print(f"✅ Admin created: {admin.email}")
    
    # Create customer user
    customer = User.objects.create_user(
        username='customer',
        email='sujal.jain@aavatto.com',
        password='User@1234',
        first_name='Sujal',
        last_name='Jain',
        role='CUSTOMER'
    )
    print(f"✅ Customer created: {customer.email}")
    
    return admin, customer

def create_destinations():
    """Create destinations from PDF data"""
    print("🏔️  Creating destinations...")
    
    destinations = [
        {
            'name': 'Pelling',
            'description': 'Beautiful hill station in West Sikkim known for its monasteries and mountain views',
            'country': 'India',
            'places': 'Pemayangtse Monastery, Khecheopalri Lake, Rabdentse Ruins'
        },
        {
            'name': 'Sikkim',
            'description': 'Northeastern state of India known for its biodiversity, including alpine and subtropical climates',
            'country': 'India',
            'places': 'Gangtok, Tsomgo Lake, Gurudongmar Lake, Yumthang Valley, Lachen, Lachung'
        },
        {
            'name': 'Namchi',
            'description': 'Town in South Sikkim known for its religious sites and scenic beauty',
            'country': 'India',
            'places': 'Char Dham, Samdruptse, Tendong Hill, Rock Garden, Bon Monastery'
        }
    ]
    
    created_destinations = []
    for dest_data in destinations:
        destination = Destination.objects.create(**dest_data)
        created_destinations.append(destination)
        print(f"✅ Destination created: {destination.name}")
    
    return created_destinations

def create_hotels(destinations):
    """Create hotels for destinations"""
    print("🏨 Creating hotels...")
    
    hotels_data = [
        {
            'name': 'Omega Hotel Pelling',
            'destination': destinations[0],  # Pelling
            'address': 'Upper Pelling, West Sikkim',
            'hotel_type': 'Standard',
            'star_rating': 3
        },
        {
            'name': 'Omega Hotel Sikkim',
            'destination': destinations[1],  # Sikkim
            'address': 'Gangtok, East Sikkim',
            'hotel_type': 'Standard',
            'star_rating': 3
        },
        {
            'name': 'Omega Hotel Namchi',
            'destination': destinations[2],  # Namchi
            'address': 'Namchi, South Sikkim',
            'hotel_type': 'Standard',
            'star_rating': 3
        }
    ]
    
    created_hotels = []
    for hotel_data in hotels_data:
        hotel = Hotel.objects.create(**hotel_data)
        created_hotels.append(hotel)
        print(f"✅ Hotel created: {hotel.name}")
    
    return created_hotels

def create_vehicles():
    """Create vehicles"""
    print("🚗 Creating vehicles...")
    
    vehicles_data = [
        {
            'vehicle_no': 'SK01AB1234',
            'name': 'Innova Crysta',
            'vehicle_type': 'SUV',
            'capacity': 7,
            'description': 'Comfortable SUV for mountain roads'
        },
        {
            'vehicle_no': 'SK01CD5678',
            'name': 'Tempo Traveller',
            'vehicle_type': 'Mini Bus',
            'capacity': 12,
            'description': 'Spacious vehicle for group travel'
        }
    ]
    
    created_vehicles = []
    for vehicle_data in vehicles_data:
        vehicle = Vehicle.objects.create(**vehicle_data)
        created_vehicles.append(vehicle)
        print(f"✅ Vehicle created: {vehicle.name}")
    
    return created_vehicles

def create_seasons():
    """Create seasons for pricing"""
    print("📅 Creating seasons...")
    
    current_year = date.today().year
    seasons_data = [
        {
            'name': 'Season 1',
            'start_month': 1,  # January
            'end_month': 3,    # March
            'start_date': date(current_year, 1, 1),
            'end_date': date(current_year, 3, 31),
            'is_active': True,
            'description': 'Winter Season'
        },
        {
            'name': 'Season 2',
            'start_month': 4,  # April
            'end_month': 6,    # June
            'start_date': date(current_year, 4, 1),
            'end_date': date(current_year, 6, 30),
            'is_active': True,
            'description': 'Spring Season'
        },
        {
            'name': 'Season 3',
            'start_month': 7,  # July
            'end_month': 9,    # September
            'start_date': date(current_year, 7, 1),
            'end_date': date(current_year, 9, 30),
            'is_active': True,
            'description': 'Monsoon Season'
        }
    ]
    
    created_seasons = []
    for season_data in seasons_data:
        season = Season.objects.create(**season_data)
        created_seasons.append(season)
        print(f"✅ Season created: {season.name}")
    
    return created_seasons

def create_tours(destinations, hotels, vehicles, seasons):
    """Create tours from PDF data"""
    print("🎯 Creating tours...")
    
    tours_data = [
        {
            'name': 'Premium Pelling Tour Pack 12',
            'slug': 'premium-pelling-tour-pack-12',
            'description': 'Experience the magic of Pelling with our professionally guided tour.',
            'primary_destination': destinations[0],  # Pelling
            'duration_days': 4,
            'base_price': Decimal('13217.00'),
            'child_price': Decimal('6608.50'),
            'max_capacity': 15,
            'difficulty_level': 'MODERATE',
            'category': 'ADVENTURE',
            'inclusions': ['Breakfast', 'Sightseeing', 'Hotel Stay', 'Transfer'],
            'exclusions': ['Flight Tickets', 'Personal Expenses', 'Tips'],
            'itinerary': [
                {
                    'day': 1,
                    'title': 'Arrival in Pelling',
                    'description': 'Check-in to hotel and local sightseeing'
                },
                {
                    'day': 2,
                    'title': 'Pelling Monastery Tour',
                    'description': 'Visit famous monasteries and viewpoints'
                },
                {
                    'day': 3,
                    'title': 'Adventure Activities',
                    'description': 'Trekking and nature walks'
                },
                {
                    'day': 4,
                    'title': 'Departure',
                    'description': 'Check-out and departure'
                }
            ],
            'special_notes': 'Best time to visit is March to June and September to December.',
            'is_active': True
        },
        {
            'name': 'Premium Sikkim Tour Pack 11',
            'slug': 'premium-sikkim-tour-pack-11',
            'description': 'Experience the magic of Sikkim with our professionally guided 13 days tour.',
            'primary_destination': destinations[1],  # Sikkim
            'duration_days': 13,
            'base_price': Decimal('26847.60'),
            'child_price': Decimal('13423.80'),
            'max_capacity': 20,
            'difficulty_level': 'MODERATE',
            'category': 'HONEYMOON',
            'inclusions': ['Breakfast', 'Sightseeing', 'Hotel Stay', 'Transfer'],
            'exclusions': ['Flight Tickets', 'Personal Expenses', 'Tips'],
            'itinerary': [
                {
                    'day': 1,
                    'title': 'Arrival in Gangtok',
                    'description': 'Airport pickup and hotel check-in'
                },
                {
                    'day': 2,
                    'title': 'Gangtok Local Sightseeing',
                    'description': 'Visit Rumtek Monastery, Enchey Monastery'
                },
                {
                    'day': 3,
                    'title': 'Tsomgo Lake Excursion',
                    'description': 'Day trip to Tsomgo Lake and Baba Mandir'
                },
                {
                    'day': 4,
                    'title': 'Gangtok to Lachen',
                    'description': 'Drive to Lachen via scenic mountain roads'
                },
                {
                    'day': 5,
                    'title': 'Gurudongmar Lake',
                    'description': 'Early morning visit to sacred Gurudongmar Lake'
                },
                {
                    'day': 6,
                    'title': 'Lachen to Lachung',
                    'description': 'Transfer to Lachung with sightseeing'
                },
                {
                    'day': 7,
                    'title': 'Yumthang Valley',
                    'description': 'Visit Valley of Flowers and hot springs'
                },
                {
                    'day': 8,
                    'title': 'Lachung to Gangtok',
                    'description': 'Return to Gangtok'
                },
                {
                    'day': 9,
                    'title': 'Gangtok to Pelling',
                    'description': 'Drive to Pelling via Ravangla'
                },
                {
                    'day': 10,
                    'title': 'Pelling Sightseeing',
                    'description': 'Visit Pemayangtse Monastery, Khecheopalri Lake'
                },
                {
                    'day': 11,
                    'title': 'Pelling to Darjeeling',
                    'description': 'Transfer to Darjeeling'
                },
                {
                    'day': 12,
                    'title': 'Darjeeling Sightseeing',
                    'description': 'Tiger Hill sunrise, Tea Garden, Toy Train'
                },
                {
                    'day': 13,
                    'title': 'Departure',
                    'description': 'Transfer to airport for departure'
                }
            ],
            'special_notes': 'Includes return air travel. Best for honeymoon couples.',
            'is_active': True
        },
        {
            'name': 'Premium Namchi Tour Pack 13',
            'slug': 'premium-namchi-tour-pack-13',
            'description': 'Explore the spiritual and scenic beauty of Namchi with our guided tour.',
            'primary_destination': destinations[2],  # Namchi
            'duration_days': 5,
            'base_price': Decimal('21575.00'),
            'child_price': Decimal('10787.50'),
            'max_capacity': 12,
            'difficulty_level': 'EASY',
            'category': 'SPIRITUAL',
            'inclusions': ['Breakfast', 'Sightseeing', 'Hotel Stay', 'Transfer'],
            'exclusions': ['Flight Tickets', 'Personal Expenses', 'Tips'],
            'itinerary': [
                {
                    'day': 1,
                    'title': 'Arrival in Namchi',
                    'description': 'Check-in and local orientation'
                },
                {
                    'day': 2,
                    'title': 'Char Dham and Samdruptse',
                    'description': 'Visit Char Dham complex and Guru Padmasambhava statue'
                },
                {
                    'day': 3,
                    'title': 'Tendong Hill',
                    'description': 'Trek to Tendong Hill for panoramic views'
                },
                {
                    'day': 4,
                    'title': 'Rock Garden and Bon Monastery',
                    'description': 'Visit Rock Garden and ancient Bon Monastery'
                },
                {
                    'day': 5,
                    'title': 'Departure',
                    'description': 'Check-out and departure transfer'
                }
            ],
            'special_notes': 'Perfect for spiritual seekers and nature lovers.',
            'is_active': True
        }
    ]
    
    created_tours = []
    for i, tour_data in enumerate(tours_data):
        # Add destinations and hotels
        tour = Tour.objects.create(**tour_data)
        
        # Add destinations (primary + related)
        tour.destinations.add(tour_data['primary_destination'])
        
        # Add hotel details as JSON
        tour.hotel_details = {
            str(hotels[i].destination.id): {
                'hotel_name': hotels[i].name,
                'hotel_type': hotels[i].hotel_type,
                'star_rating': hotels[i].star_rating
            }
        }
        
        # Add vehicle details as JSON
        tour.vehicle_details = {
            'type': vehicles[0].name,
            'vehicle_type': vehicles[0].vehicle_type,
            'capacity': vehicles[0].capacity,
            'note': 'AC will not work in high altitude areas'
        }
        
        tour.save()
        
        created_tours.append(tour)
        print(f"✅ Tour created: {tour.name}")
    
    return created_tours

def create_seasonal_pricing(tours, seasons):
    """Create seasonal pricing from PDF data"""
    print("💰 Creating seasonal pricing...")
    
    # Pricing data from PDFs
    pricing_data = [
        # Premium Pelling Tour Pack 12 (simple pricing)
        {
            'tour': tours[0],
            'season': seasons[0],
            'two_sharing_price': Decimal('13217.00'),
            'three_sharing_price': Decimal('11234.45'),
            'child_price': Decimal('6608.50'),
            'includes_return_air': False,
            'available_dates': ['5', '12', '19', '26']
        },
        
        # Premium Sikkim Tour Pack 11 (multiple seasons from PDF)
        {
            'tour': tours[1],
            'season': seasons[0],  # Season 1
            'two_sharing_price': Decimal('26847.60'),
            'three_sharing_price': Decimal('22820.46'),
            'child_price': Decimal('13423.80'),
            'includes_return_air': True,
            'available_dates': ['5', '12', '19', '26']
        },
        {
            'tour': tours[1],
            'season': seasons[1],  # Season 2
            'two_sharing_price': Decimal('24610.30'),
            'three_sharing_price': Decimal('20918.76'),
            'child_price': Decimal('12305.15'),
            'includes_return_air': True,
            'available_dates': ['5', '12', '19', '26']
        },
        {
            'tour': tours[1],
            'season': seasons[2],  # Season 3
            'two_sharing_price': Decimal('20135.70'),
            'three_sharing_price': Decimal('17115.34'),
            'child_price': Decimal('10067.85'),
            'includes_return_air': True,
            'available_dates': ['5', '12', '19', '26']
        },
        
        # Premium Namchi Tour Pack 13
        {
            'tour': tours[2],
            'season': seasons[0],
            'two_sharing_price': Decimal('21575.00'),
            'three_sharing_price': Decimal('18338.75'),
            'child_price': Decimal('10787.50'),
            'includes_return_air': False,
            'available_dates': ['8', '15', '22', '29']
        }
    ]
    
    for pricing in pricing_data:
        tour_pricing = TourPricing.objects.create(**pricing)
        print(f"✅ Pricing created for {tour_pricing.tour.name} - {tour_pricing.season.name}")

def create_offers():
    """Create sample offers"""
    print("🎁 Creating offers...")
    
    offers_data = [
        {
            'name': 'Early Bird Discount',
            'description': 'Book 30 days in advance and save 10%. Valid for bookings made 30 days in advance.',
            'discount_type': 'PERCENTAGE',
            'discount_percentage': Decimal('10.00'),
            'discount_amount': Decimal('0.00'),
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=90),
            'is_active': True
        },
        {
            'name': 'Flat ₹5000 Off',
            'description': 'Get flat ₹5000 discount on bookings above ₹25000. Valid on bookings above ₹25000.',
            'discount_type': 'FIXED_AMOUNT',
            'discount_percentage': Decimal('0.00'),
            'discount_amount': Decimal('5000.00'),
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=60),
            'is_active': True
        }
    ]
    
    created_offers = []
    for offer_data in offers_data:
        offer = Offer.objects.create(**offer_data)
        created_offers.append(offer)
        print(f"✅ Offer created: {offer.name}")
    
    # Associate offers with tours
    for tour in Tour.objects.all():
        for offer in created_offers:
            offer.applicable_tours.add(tour)
    
    return created_offers

@transaction.atomic
def setup_database():
    """Main function to setup the database"""
    print("🚀 Starting fresh database setup...")
    print("=" * 60)
    
    try:
        # Step 1: Truncate database
        truncate_database()
        
        # Step 2: Create users
        admin, customer = create_users()
        
        # Step 3: Create destinations
        destinations = create_destinations()
        
        # Step 4: Create hotels
        hotels = create_hotels(destinations)
        
        # Step 5: Create vehicles
        vehicles = create_vehicles()
        
        # Step 6: Create seasons
        seasons = create_seasons()
        
        # Step 7: Create tours
        tours = create_tours(destinations, hotels, vehicles, seasons)
        
        # Step 8: Create seasonal pricing
        create_seasonal_pricing(tours, seasons)
        
        # Step 9: Create offers
        offers = create_offers()
        
        print("\n" + "=" * 60)
        print("🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!")
        print("\n📋 SUMMARY:")
        print(f"✅ Users created: 2 (1 admin, 1 customer)")
        print(f"✅ Destinations created: {len(destinations)}")
        print(f"✅ Hotels created: {len(hotels)}")
        print(f"✅ Vehicles created: {len(vehicles)}")
        print(f"✅ Seasons created: {len(seasons)}")
        print(f"✅ Tours created: {len(tours)}")
        print(f"✅ Offers created: {len(offers)}")
        
        print("\n🔐 LOGIN CREDENTIALS:")
        print("Admin:")
        print("  Email: sujaljain984@gmail.com")
        print("  Password: Sujal@7383")
        print("\nCustomer:")
        print("  Email: sujal.jain@aavatto.com")
        print("  Password: User@1234")
        
        print("\n🎯 TOURS CREATED:")
        for tour in tours:
            print(f"  • {tour.name} - {tour.duration_days} days - ₹{tour.base_price}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = setup_database()
    if success:
        print("\n✅ You can now login and test the system!")
    else:
        print("\n❌ Setup failed. Please check the errors above.")