from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.tokens import RefreshToken


class Command(BaseCommand):
    help = 'Seed an admin user and a demo customer user and print their JWT tokens'

    def add_arguments(self, parser):
        parser.add_argument('--admin-email', type=str, default='admin@example.com')
        parser.add_argument('--admin-password', type=str, default='adminpass')
        parser.add_argument('--customer-email', type=str, default='customer@example.com')
        parser.add_argument('--customer-password', type=str, default='customerpass')

    def handle(self, *args, **options):
        User = get_user_model()

        admin_email = options['admin_email']
        admin_password = options['admin_password']
        customer_email = options['customer_email']
        customer_password = options['customer_password']

        admin, created = User.objects.get_or_create(username='admin', defaults={'email': admin_email, 'role': User.ROLE_ADMIN})
        if created:
            admin.set_password(admin_password)
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()

        customer, created2 = User.objects.get_or_create(username='demo_customer', defaults={'email': customer_email, 'role': User.ROLE_CUSTOMER})
        if created2:
            customer.set_password(customer_password)
            customer.save()

        def token_for(u):
            refresh = RefreshToken.for_user(u)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

        self.stdout.write(self.style.SUCCESS('Seed complete. Users:'))
        self.stdout.write(f"Admin -> username: admin, email: {admin.email}, password: {admin_password}")
        self.stdout.write(str(token_for(admin)))
        self.stdout.write(f"Customer -> username: demo_customer, email: {customer.email}, password: {customer_password}")
        self.stdout.write(str(token_for(customer)))
