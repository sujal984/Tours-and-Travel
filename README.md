# Tours & Travels Management System

A comprehensive full-stack web application for managing tour packages, bookings, payments, and customer inquiries. Built with Django REST Framework backend and React frontend.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ 
- Node.js 16+
- npm or yarn

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tours_travels
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional - sample data includes admin user)
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# Edit .env file with your configuration
```

### 4. Database Setup with Sample Data

We provide a comprehensive setup script that creates sample data including:
- Admin and customer users
- Tour destinations (Pelling, Sikkim, Namchi)
- Hotels and vehicles
- Complete tour packages with pricing
- Seasonal pricing and offers

```bash
# From the root directory, run the setup script
python setup_fresh_database.py
```

This script will:
- ✅ Truncate existing database
- ✅ Create admin and customer users
- ✅ Add destinations, hotels, and vehicles
- ✅ Create 3 complete tour packages from PDF brochures
- ✅ Set up seasonal pricing
- ✅ Add sample offers and discounts

### 5. Start the Application

#### Backend Server
```bash
cd backend
python manage.py runserver
```
Backend will run on: `http://localhost:8000`

#### Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

## 🔐 Default Login Credentials

After running the setup script, you can login with:

### Admin User
- **Email**: `sujaljain984@gmail.com`
- **Password**: `Sujal@7383`
- **Access**: Full admin panel access

### Customer User
- **Email**: `sujal.jain@aavatto.com`
- **Password**: `User@1234`
- **Access**: Customer portal for bookings and inquiries

## 📊 Sample Data Included

### Tours Created
1. **Premium Pelling Tour Pack 12** - 4 days - ₹13,217
2. **Premium Sikkim Tour Pack 11** - 13 days - ₹26,847
3. **Premium Namchi Tour Pack 13** - 5 days - ₹21,575

### Features Included
- Complete tour itineraries
- Seasonal pricing variations
- Hotel and vehicle details
- Special offers and discounts
- Multiple destinations
- Booking management system
- Payment processing
- Review system
- Inquiry management

## 🛠️ Manual Database Commands

If you prefer to set up the database manually:

```bash
cd backend

# Run migrations
python manage.py migrate

# Create admin user
python manage.py create_admin

# Seed basic data
python manage.py seed_db
```

## 📁 Project Structure

```
tours_travels/
├── backend/                 # Django REST API
│   ├── apps/
│   │   ├── authentication/ # User authentication
│   │   ├── bookings/       # Booking management
│   │   ├── core/           # Core utilities
│   │   ├── payments/       # Payment processing
│   │   ├── reviews/        # Review system
│   │   ├── tours/          # Tour packages
│   │   └── users/          # User management
│   ├── backend_core/       # Django settings
│   └── manage.py
├── frontend/               # React application
│   ├── src/
│   │   ├── Admin/         # Admin panel components
│   │   ├── Customer/      # Customer portal
│   │   ├── components/    # Shared components
│   │   └── services/      # API services
│   └── package.json
└── setup_fresh_database.py # Database setup script
```

## 🔧 Environment Configuration

### Backend (.env)
Create `backend/.env` file:
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
```

### Frontend (.env)
Create `frontend/.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG=False` in production
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure CORS settings

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the `dist` folder with a web server
3. Update API base URL for production

## 📝 API Documentation

Once the backend is running, visit:
- API Root: `http://localhost:8000/api/`
- Admin Panel: `http://localhost:8000/admin/`

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Migration Errors**
   ```bash
   python manage.py migrate --fake-initial
   ```

2. **Port Already in Use**
   ```bash
   # Backend
   python manage.py runserver 8001
   
   # Frontend
   npm run dev -- --port 5174
   ```

3. **Permission Errors**
   - Ensure virtual environment is activated
   - Check file permissions
   - Run as administrator if needed

4. **Module Not Found Errors**
   ```bash
   pip install -r requirements.txt
   npm install
   ```

### Reset Database
If you need to completely reset the database:
```bash
# Delete database file
rm backend/db.sqlite3

# Run migrations
cd backend
python manage.py migrate

# Run setup script again
cd ..
python setup_fresh_database.py
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Coding! 🎉**