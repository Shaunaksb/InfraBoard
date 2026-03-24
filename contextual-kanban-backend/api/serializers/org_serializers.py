from rest_framework import serializers
from api.models import Organization
from .user_serializers import UserSerializer

class OrganizationSerializer(serializers.ModelSerializer):
    memberIds = serializers.PrimaryKeyRelatedField(
        many=True, 
        read_only=True, 
        source='members'
    )
    ownerId = serializers.PrimaryKeyRelatedField(
        read_only=True,
        source='owner'
    )

    class Meta:
        model = Organization
        fields = ['id', 'name', 'ownerId', 'memberIds']
