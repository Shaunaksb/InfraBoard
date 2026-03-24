from django.db import models
from .card import Card
import uuid

class Attachment(models.Model):
    id = models.CharField(max_length=100, primary_key=True, blank=True)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='card_attachments')
    file = models.FileField(upload_to='attachments/')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    size = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"att_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
