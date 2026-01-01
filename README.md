# Tours & Travels Management System

A comprehensive web application for managing tour packages, bookings, payments, and customer reviews. Built with Django REST Framework backend and React frontend.

## 🚀 Features

- **Customer Portal**: Browse tours, make bookings, submit reviews, custom package requests
- **Admin Dashboard**: Manage tours, bookings, payments, refunds, invoices, and reviews
- **Authentication**: Separate login systems for customers and administrators
- **Payment Management**: Handle payments, refunds, and invoice generation
- **Review System**: Customer reviews with admin approval workflow
- **Responsive Design**: Mobile-friendly interface using Ant Design

## 🛠️ Tech Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database (SQLite for development)
- **JWT Authentication** - Secure token-based auth
- **CORS Headers** - Cross-origin resource sharing

### Frontend
- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Ant Design** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animations

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **PostgreSQL** (optional, SQLite works for development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tours-travels
```

### 2. Backend Setup

#### Navigate to backend directory
```bash
cd backend
```

#### Create virtual environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5174
```

#### Database Setup
```bash
# Run migrations
python manage.py migrate

# Create admin user (IMPORTANT!)
python manage.py shell -c "
from apps.users.models import User
admin_user = User.objects.create_user(
    username='admin',
    email='admin@example.com',
    password='admin123',
    first_name='Admin',
    last_name='User',
    role='ADMIN'
)
print(f'Admin user created: {admin_user.email}')
"

# Create sample data (optional)
python manage.py shell -c "
from apps.tours.models import Destination, Tour, Season
from decimal import Decimal
import datetime

# Create sample destination
destination, created = Destination.objects.get_or_create(
    name='Sikkim',
    defaults={
        'description': 'Beautiful mountain state in India',
        'country': 'India',
        'is_active': True
    }
)

# Create sample season
season, created = Season.objects.get_or_create(
    name='Winter',
    defaults={
        'start_date': datetime.date(2024, 12, 1),
        'end_date': datetime.date(2025, 2, 28),
        'description': 'Winter season with pleasant weather'
    }
)

# Create sample tour
tour, created = Tour.objects.get_or_create(
    name='Sikkim Adventure Tour',
    defaults={
        'destination': destination,
        'description': 'Explore the beautiful landscapes of Sikkim',
        'duration_days': 7,
        'base_price': Decimal('50000.00'),
        'max_capacity': 20,
        'category': 'ADVENTURE',
        'difficulty_level': 'MODERATE',
        'is_active': True
    }
)

print('Sample data created successfully!')
"
```

#### Start Backend Server
```bash
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000`

### 3. Frontend Setup

#### Open new terminal and navigate to frontend directory
```bash
cd frontend
```

#### Install dependencies
```bash
npm install
# or
yarn install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

#### Start Frontend Server
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:5174`

## 🔐 Default Login Credentials

### Admin Access
- **URL**: `http://localhost:5174/admin/login`
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Customer Access
- Customers can register through the main site
- Or use the login modal on the customer portal

## 📁 Project Structure

```
tours-travels/
├── backend/                    # Django backend
│   ├── apps/                  # Django apps
│   │   ├── authentication/    # Auth logic
│   │   ├── bookings/         # Booking management
│   │   ├── core/             # Core utilities
│   │   ├── payments/         # Payment & refund system
│   │   ├── reviews/          # Review system
│   │   ├── tours/            # Tour management
│   │   └── users/            # User management
│   ├── backend_core/         # Django settings
│   ├── api/                  # API routing
│   ├── manage.py
│   └── requirements.txt
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── Admin/            # Admin dashboard
│   │   ├── Customer/         # Customer portal
│   │   ├── components/       # Shared components
│   │   ├── context/          # React context
│   │   ├── services/         # API services
│   │   └── constant/         # Constants & routes
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 Development Commands

### Backend Commands
```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files (production)
python manage.py collectstatic
```

### Frontend Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/admin/login/` - Admin login

### Tours
- `GET /api/v1/tours/` - List tours
- `GET /api/v1/tours/{id}/` - Tour details
- `POST /api/v1/tours/custom-packages/` - Submit custom package request

### Bookings
- `GET /api/v1/bookings/` - List user bookings
- `POST /api/v1/bookings/` - Create booking
- `POST /api/v1/bookings/{id}/cancel/` - Cancel booking
- `POST /api/v1/bookings/{id}/add_review/` - Add review

### Payments
- `GET /api/v1/payments/` - List payments
- `GET /api/v1/payments/refunds/` - List refunds
- `GET /api/v1/payments/invoices/` - List invoices

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG=False` in production settings
2. Configure PostgreSQL database
3. Set proper `ALLOWED_HOSTS`
4. Configure static files serving
5. Use WSGI server like Gunicorn

### Frontend Deployment
1. Build the project: `npm run build`
2. Serve the `dist` folder using a web server
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `CORS_ALLOWED_ORIGINS` includes your frontend URL
2. **Database Errors**: Run `python manage.py migrate` to apply migrations
3. **Authentication Issues**: Clear browser storage and cookies
4. **Port Conflicts**: Change ports in configuration if needed

### Getting Help

- Check the console for error messages
- Verify all environment variables are set correctly
- Ensure both backend and frontend servers are running
- Check network requests in browser developer tools

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Happy Coding! 🎉**