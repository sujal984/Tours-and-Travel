from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from apps.core.viewsets import BaseViewSet
from apps.core.permissions import IsAdminUser
from apps.core.response import APIResponse
from .models import Payment, Refund, Invoice
from .serializers import PaymentSerializer, RefundSerializer, InvoiceSerializer
import logging

logger = logging.getLogger(__name__)


class PaymentViewSet(BaseViewSet):
    """ViewSet for managing payments"""
    queryset = Payment.objects.select_related('booking', 'booking__tour', 'booking__user').all()
    serializer_class = PaymentSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create']:
            permission_classes = []  # Allow booking creation to create payments
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """Create a new payment"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Generate transaction ID if not provided
            if not serializer.validated_data.get('transaction_id'):
                import uuid
                serializer.validated_data['transaction_id'] = f"TXN-{uuid.uuid4().hex[:12].upper()}"
            
            payment = serializer.save()
            logger.info(f"Payment created: {payment.transaction_id}")
            
            return APIResponse.success(
                data=serializer.data,
                message="Payment created successfully",
                status_code=status.HTTP_201_CREATED
            )
        else:
            return APIResponse.error(
                message="Payment creation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )


class RefundViewSet(BaseViewSet):
    """ViewSet for managing refunds"""
    queryset = Refund.objects.select_related(
        'payment', 'booking', 'booking__tour', 'booking__user', 'processed_by'
    ).all()
    serializer_class = RefundSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a refund"""
        refund = self.get_object()
        
        if refund.status != 'PENDING':
            return APIResponse.error(
                message="Only pending refunds can be approved",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        refund.status = 'APPROVED'
        refund.processed_by = request.user
        refund.processed_at = timezone.now()
        refund.admin_notes = request.data.get('admin_notes', '')
        refund.save()
        
        logger.info(f"Refund {refund.id} approved by {request.user.email}")
        
        return APIResponse.success(
            data=RefundSerializer(refund).data,
            message="Refund approved successfully"
        )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a refund"""
        refund = self.get_object()
        
        if refund.status != 'PENDING':
            return APIResponse.error(
                message="Only pending refunds can be rejected",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        refund.status = 'REJECTED'
        refund.processed_by = request.user
        refund.processed_at = timezone.now()
        refund.admin_notes = request.data.get('admin_notes', 'Refund rejected by admin')
        refund.save()
        
        logger.info(f"Refund {refund.id} rejected by {request.user.email}")
        
        return APIResponse.success(
            data=RefundSerializer(refund).data,
            message="Refund rejected"
        )

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Mark refund as processed"""
        refund = self.get_object()
        
        if refund.status != 'APPROVED':
            return APIResponse.error(
                message="Only approved refunds can be processed",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        refund.status = 'PROCESSED'
        refund.processed_by = request.user
        refund.processed_at = timezone.now()
        refund.save()
        
        # Update original payment status
        refund.payment.status = 'REFUNDED'
        refund.payment.save()
        
        logger.info(f"Refund {refund.id} processed by {request.user.email}")
        
        return APIResponse.success(
            data=RefundSerializer(refund).data,
            message="Refund processed successfully"
        )


class InvoiceViewSet(BaseViewSet):
    """ViewSet for managing invoices"""
    queryset = Invoice.objects.select_related('booking', 'booking__tour', 'booking__user').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        """Create a new invoice"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            invoice = serializer.save()
            logger.info(f"Invoice created: {invoice.invoice_number}")
            
            return APIResponse.success(
                data=serializer.data,
                message="Invoice created successfully",
                status_code=status.HTTP_201_CREATED
            )
        else:
            return APIResponse.error(
                message="Invoice creation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark invoice as paid"""
        invoice = self.get_object()
        
        invoice.status = 'PAID'
        invoice.save()
        
        logger.info(f"Invoice {invoice.invoice_number} marked as paid")
        
        return APIResponse.success(
            data=InvoiceSerializer(invoice).data,
            message="Invoice marked as paid"
        )

    @action(detail=True, methods=['post'])
    def send_invoice(self, request, pk=None):
        """Send invoice to customer"""
        invoice = self.get_object()
        
        invoice.status = 'SENT'
        invoice.save()
        
        # TODO: Implement email sending logic here
        
        logger.info(f"Invoice {invoice.invoice_number} sent to customer")
        
        return APIResponse.success(
            data=InvoiceSerializer(invoice).data,
            message="Invoice sent to customer"
        )