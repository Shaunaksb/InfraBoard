from rest_framework import serializers
from api.models import Card, Attachment

class AttachmentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    url = serializers.FileField(source='file', read_only=True)
    
    class Meta:
        model = Attachment
        fields = ['id', 'name', 'type', 'size', 'url', 'created_at']

class CardSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)

    # Map the model's 'column' ForeignKey to 'columnId' as expected by frontend
    columnId = serializers.PrimaryKeyRelatedField(read_only=True, source='column')
    # Frontend also expects a createdAt ISO string. Since the model doesn't have it, we provide a default
    createdAt = serializers.SerializerMethodField()
    # Serialize the related attachments
    attachments = AttachmentSerializer(many=True, read_only=True, source='card_attachments')

    class Meta:
        model = Card
        fields = ['id', 'title', 'fields', 'config_data', 'tags', 'attachments', 'order', 'columnId', 'createdAt']

    def get_createdAt(self, obj):
        import datetime
        return datetime.datetime.now(datetime.timezone.utc).isoformat()
