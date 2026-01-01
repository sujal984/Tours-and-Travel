from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create an admin user for testing'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@rimatours.com',
                password='admin123',
                role='admin',
                first_name='Admin',
                last_name='User'
            )
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS('Successfully created admin user: admin / admin123')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Admin user already exists')
            )