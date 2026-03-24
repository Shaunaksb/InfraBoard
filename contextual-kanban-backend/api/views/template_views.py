from rest_framework import viewsets
from api.models import Template
from api.serializers import TemplateSerializer

class TemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateSerializer

    def get_queryset(self):
        # Allow viewing generic templates without owners, plus user's own templates
        return Template.objects.filter(owner=None) | Template.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
