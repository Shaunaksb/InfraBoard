from django.db import models
from .column import Column
import uuid

class Card(models.Model):
    id = models.CharField(max_length=100, primary_key=True, blank=True)
    title = models.CharField(max_length=255)
    fields = models.JSONField(default=dict, blank=True)
    config_data = models.JSONField(default=dict, blank=True)
    tags = models.JSONField(default=list, blank=True)
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name='cards')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"crd_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
