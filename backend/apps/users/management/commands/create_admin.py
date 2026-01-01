"""
Management command to create admin user
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from apps.users.models import User
import getpass


class Command(BaseCommand):
    help = 'Create admin user for Tours & Travels system'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Admin email address',
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Admin username',
        )
        parser.add_argument(
            '--first-name',
            type=str,
            help='Admin first name',
        )
        parser.add_argument(
            '--last-name',
            type=str,
            help='Admin last name',
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Admin password (not recommended for security)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force creation even if admin already exists',
        )
    
    def handle(self, *args, **options):
        # Check if admin already exists
        existing_admin = User.objects.filter(role='ADMIN').first()
        
        if existing_admin and not options['force']:
            self.stdout.write(
                self.style.WARNING(
                    f'Admin user already exists: {existing_admin.email}\n'
                    'Use --force to replace the existing admin user.'
                )
            )
            return
        
        # Get admin details
        email = options['email'] or input('Admin email: ')
        username = options['username'] or input('Admin username: ')
        first_name = options['first_name'] or input('First name: ')
        last_name = options['last_name'] or input('Last name: ')
        
        # Validate email
        if not email:
            raise CommandError('Email is required')
        
        email = email.lower()
        
        # Check if email is already taken by another user
        existing_user = User.objects.filter(email=email).exclude(role='ADMIN').first()
        if existing_user:
            raise CommandError(f'Email {email} is already taken by another user')
        
        # Get password
        password = options['password']
        if not password:
            while True:
                password = getpass.getpass('Admin password: ')
                password_confirm = getpass.getpass('Confirm password: ')
                
                if password != password_confirm:
                    self.stdout.write(self.style.ERROR('Passwords do not match. Try again.'))
                    continue
                
                # Validate password
                try:
                    validate_password(password)
                    break
                except ValidationError as e:
                    self.stdout.write(self.style.ERROR(f'Password validation failed: {e}'))
                    continue
        
        try:
            # Delete existing admin if force is used
            if existing_admin and options['force']:
                existing_admin.delete()
                self.stdout.write(
                    self.style.WARNING(f'Deleted existing admin user: {existing_admin.email}')
                )
            
            # Create admin user
            admin_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='ADMIN',
                is_staff=True,
                is_superuser=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created admin user: {admin_user.email}\n'
                    f'Username: {admin_user.username}\n'
                    f'Role: {admin_user.role}'
                )
            )
            
        except Exception as e:
            raise CommandError(f'Failed to create admin user: {e}')