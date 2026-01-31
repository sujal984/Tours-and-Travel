from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, RefundViewSet, InvoiceViewSet

router = DefaultRouter()
router.register(r'refunds', RefundViewSet, basename='refund')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'', PaymentViewSet, basename='payment')  # Shadowing fix: moved to end

urlpatterns = [
    path('', include(router.urls)),
]