from rest_framework import serializers
from .models import Review
from apps.users.serializers import UserProfileSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user_details = UserProfileSerializer(source='user', read_only=True)
    tour_details = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'tour', 'rating', 'comment',
            'is_verified', 'user_details', 'tour_details', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def get_tour_details(self, obj):
        """Get tour details for the review"""
        if obj.tour:
            return {
                'id': obj.tour.id,
                'name': obj.tour.name,
                'slug': obj.tour.slug,
                'primary_destination': obj.tour.primary_destination.name if obj.tour.primary_destination else None
            }
        return None

    def to_representation(self, instance):
        """Override to ensure only verified reviews are returned to non-admin users"""
        request = self.context.get('request')
        
        # For non-admin users, double-check that review is verified
        if request and (not request.user.is_authenticated or 
                       not (hasattr(request.user, 'role') and request.user.role == 'ADMIN')):
            if not instance.is_verified:
                # This should never happen due to queryset filtering, but extra safety
                return None
        
        return super().to_representation(instance)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        
        # Only allow admin users to modify is_verified field
        if request and request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'ADMIN':
            # Admin can modify is_verified
            pass
        else:
            # Regular users cannot modify is_verified
            self.fields['is_verified'].read_only = True
