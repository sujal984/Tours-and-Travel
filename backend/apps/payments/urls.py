from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, RefundViewSet, InvoiceViewSet

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payment')  # This makes payments available at /payments/
router.register(r'refunds', RefundViewSet, basename='refund')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
]