from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from api.models import Board, Organization, User
from api.serializers import board_serializers

class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = board_serializers.BoardSerializer

    def get_queryset(self):
        user = self.request.user
        return (Board.objects.filter(owner=user) | Board.objects.filter(members=user)).distinct()

    def perform_create(self, serializer):
        board = serializer.save(owner=self.request.user)
        board.members.add(self.request.user)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        board = self.get_object()
        
        user_ids = request.data.get('userIds', [])
        org_ids = request.data.get('orgIds', [])
        emails = request.data.get('emails', [])
        
        # Add existing users by ID
        if user_ids:
            users = User.objects.filter(id__in=user_ids)
            board.members.add(*users)
            
        # Add orgs by ID
        if org_ids:
            orgs = Organization.objects.filter(id__in=org_ids)
            board.organizations.add(*orgs)
            
        # Add existing users by email
        if emails:
            users_by_email = User.objects.filter(email__in=emails)
            board.members.add(*users_by_email)
            
            # Handle non-existent emails (mocking dispatch for now)
            existing_emails = set(users_by_email.values_list('email', flat=True))
            missing_emails = set(emails) - existing_emails
            if missing_emails:
                print(f"Mock dispatching email invitations to: {missing_emails} for board {board.id}")
                
        return Response({'status': 'shared successfully'})
