from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from api.models import Organization, User
from api.serializers import OrganizationSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        user = self.request.user
        return (Organization.objects.filter(owner=user) | Organization.objects.filter(members=user)).distinct()

    def perform_create(self, serializer):
        org = serializer.save(owner=self.request.user)
        org.members.add(self.request.user)

    @action(detail=True, methods=['post'])
    def members(self, request, pk=None):
        org = self.get_object()
        user_ids = request.data.get('userIds', [])
        
        users = User.objects.filter(id__in=user_ids)
        org.members.add(*users)
        
        # Need to refresh to get updated many-to-many relationships for serialization
        org = self.get_object()
        
        return Response(self.get_serializer(org).data)
