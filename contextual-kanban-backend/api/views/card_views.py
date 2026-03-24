from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from api.models import Card, Column, Attachment
from api.serializers import CardSerializer, AttachmentSerializer

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer

    def get_queryset(self):
        return Card.objects.filter(column__board__id=self.kwargs['board_pk'])

    def perform_create(self, serializer):
        board_pk = self.kwargs['board_pk']
        column_pk = self.kwargs['column_pk']
        # Try lookup by id first, then fall back to title (case-insensitive)
        column = Column.objects.filter(id=column_pk, board__id=board_pk).first()
        if column is None:
            column = get_object_or_404(Column, title__iexact=column_pk, board__id=board_pk)
        serializer.save(column=column)

    @action(detail=True, methods=['post'], url_path='attachments')
    def upload_attachment(self, request, board_pk=None, column_pk=None, pk=None):
        card = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        attachment = Attachment(
            card=card,
            file=file_obj,
            name=file_obj.name,
            type=file_obj.content_type,
            size=file_obj.size
        )
        attachment.save()
        serializer = AttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path=r'attachments/(?P<attachment_id>[^/.]+)')
    def delete_attachment(self, request, board_pk=None, column_pk=None, pk=None, attachment_id=None):
        card = self.get_object()
        attachment = get_object_or_404(Attachment, id=attachment_id, card=card)
        attachment.file.delete(save=False) # Delete actual file
        attachment.delete() # Delete DB record
        return Response(status=status.HTTP_204_NO_CONTENT)
