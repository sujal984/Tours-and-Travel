"""
Development settings for Tours & Travels backend.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

# Database for development - SQLite (temporary)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Development-specific apps
INSTALLED_APPS += [
    'django_extensions',  # For development utilities
]

# Email backend for development (console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Cache configuration for development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Development logging - more verbose
LOGGING['handlers']['console']['level'] = 'WARNING'
LOGGING['loggers']['django']['level'] = 'WARNING'
LOGGING['loggers']['apps.authentication']['level'] = 'WARNING'

# Disable CORS restrictions in development
CORS_ALLOW_ALL_ORIGINS = True

# JWT settings for development (shorter expiry for testing)
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=30)