from rest_framework import serializers
from api.models import Template

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'icon', 'columns', 'fields', 'tags']
