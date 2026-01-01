from rest_framework import serializers
from .models import Review
from apps.users.serializers import UserProfileSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user_details = UserProfileSerializer(source='user', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'tour', 'rating', 'comment',
            'is_verified', 'user_details', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        
        # Only allow admin users to modify is_verified field
        if request and request.user.is_authenticated and request.user.is_admin:
            # Admin can modify is_verified
            pass
        else:
            # Regular users cannot modify is_verified
            self.fields['is_verified'].read_only = True
